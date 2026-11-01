/* ============================================================
   第五部分 · 第2章 树上进阶
   tree-difference / tree-hld
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- 树上差分 ---------------- */
  T['tree-difference'] = {
    chapter: '第2章 树上进阶',
    time: '约 45 分钟',
    body: `
## 一、问题：统计一条路径的"覆盖"

给定一棵树和若干条路径 \`(u, v)\`，问：**每个点（或每条边）被多少条路径经过？**

直接沿每条路径逐个加会很慢。利用 **LCA + 差分**，每条路径只需打 **4 个（或 3 个）标记**，
最后一次 DFS 累加即可，和数组"差分把区间修改降到 O(1)"是同一个思想。

## 二、点差分：统计每个点被覆盖次数

对一条路径 \`u→v\`（设 \`w = LCA(u,v)\`）：

\`\`\`text
d[u]++,  d[v]++,  d[w]--,  d[父(w)]--
\`\`\`

然后**从叶子向根累加**：\`d[父(x)] += d[x]\`，累加完 \`d[x]\` 就是经过点 x 的路径数。

> **💡 为什么这样标？** 可以把路径拆成 u→w 和 v→w 两段理解：
> 从 u、v 各 +1 向上"流"，在 w 处要 −1（因为 w 只该算一次），在 w 的父亲处再 −1（把流截断、不蔓延到路径外）。

## 三、边差分：统计每条边被经过次数

把每条边**归到它较深的那个端点**：点 x（x ≠ 根）代表边 \`(父(x), x)\`。对路径 \`u→v\`（w=LCA）：

\`\`\`text
d[u]++,  d[v]++,  d[w] -= 2
\`\`\`

同样自底向上累加后，\`d[x]\`（x≠根）就是经过边 \`(父(x),x)\` 的路径数。

> **⚠️ 注意：** 边差分在 w 处减 2（不是 −1、也不动 w 的父亲），因为 u、v 两个 +1 都不该越过 w 向上走到"w 上面的边"。

## 四、实现要点

1. 先 **BFS/DFS 预处理 LCA**（倍增），得到每个点的父亲与深度；
2. 记录一个**自根到叶的顺序**（如 BFS 序），累加时**倒序**处理就能保证"先加孩子、再加父亲"；
3. 差分标记用 int 即可（路径条数可能多，但一般不溢出）。
`,
    examples: [
      {
        title: '点差分：统计每个点被路径覆盖次数',
        level: '提高',
        statement: `**题目描述**

给定一棵 n 个点的树和 m 条路径，输出每个点被多少条路径经过。`,
        input: '第一行 n，接下来 n−1 行边；再给 m，然后 m 行 u v。',
        output: '一行 n 个整数：点 1~n 的覆盖次数。',
        samples: [['5\n1 2\n1 3\n2 4\n2 5\n2\n4 3\n4 5', '1 2 1 2 1']],
        analysis: `### 解题思路

- 倍增求 LCA；按点差分规则每条路径打 4 个标记（\`父(w)\` 不存在则跳过）；
- 按 BFS 序**倒序**把每个点的值加到父亲，累加完即答案。
本例路径 (4,3) 与 (4,5)，点 2、点 4 被两条路径经过，得 2。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005, LOG = 17;
vector<int> g[MAXN];
int up[LOG][MAXN], depth[MAXN], order_[MAXN], par[MAXN], oc;
int d[MAXN];

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++)
        if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    /* BFS 建立 depth / par / up，并记录 BFS 序 */
    queue<int> q; q.push(1); par[1] = 0; depth[1] = 0;
    vector<bool> vis(n + 1, false); vis[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order_[oc++] = u;
        for (int v : g[u]) if (!vis[v]) {
            vis[v] = true; par[v] = u; depth[v] = depth[u] + 1;
            up[0][v] = u; q.push(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int u = 1; u <= n; u++)
            up[k][u] = up[k - 1][up[k - 1][u]];

    int m; cin >> m;
    while (m--) {
        int u, v; cin >> u >> v;
        int w = lca(u, v);
        d[u]++; d[v]++; d[w]--;
        if (par[w]) d[par[w]]--;       // 父(w) 存在才减
    }
    for (int i = oc - 1; i >= 0; i--) {   // 倒序：先孩子后父亲
        int x = order_[i];
        if (par[x]) d[par[x]] += d[x];
    }
    for (int u = 1; u <= n; u++)
        cout << d[u] << (u == n ? '\\n' : ' ');
    return 0;
}`,
      },
      {
        title: '边差分：统计每条边被经过次数',
        level: '提高',
        statement: `**题目描述**

给定一棵树和 m 条路径，输出每条边被多少条路径经过（用边的较深端点编号表示）。`,
        input: '同点差分。',
        output: '点 2~n 对应边 (父(x),x) 的经过次数。',
        samples: [['5\n1 2\n1 3\n2 4\n2 5\n2\n4 3\n4 5', '1 1 2 1']],
        analysis: `### 解题思路

边归到较深端点：每条路径 \`d[u]++,d[v]++,d[w]-=2\`，再倒序累加。
本例边 (2,4) 被两条路径经过（点 4 输出 2），其余边各 1 次。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005, LOG = 17;
vector<int> g[MAXN];
int up[LOG][MAXN], depth[MAXN], order_[MAXN], par[MAXN], oc;
int d[MAXN];

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++)
        if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    queue<int> q; q.push(1); par[1] = 0;
    vector<bool> vis(n + 1, false); vis[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order_[oc++] = u;
        for (int v : g[u]) if (!vis[v]) {
            vis[v] = true; par[v] = u; depth[v] = depth[u] + 1;
            up[0][v] = u; q.push(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int u = 1; u <= n; u++)
            up[k][u] = up[k - 1][up[k - 1][u]];

    int m; cin >> m;
    while (m--) {
        int u, v; cin >> u >> v;
        int w = lca(u, v);
        d[u]++; d[v]++; d[w] -= 2;    // 边差分：w 处减 2
    }
    for (int i = oc - 1; i >= 0; i--) {
        int x = order_[i];
        if (par[x]) d[par[x]] += d[x];
    }
    for (int u = 2; u <= n; u++)            // 点 x 代表边 (父(x),x)
        cout << d[u] << (u == n ? '\\n' : ' ');
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**点/边差分公式记混**：点差分在 w 减 1、父(w)减 1；边差分只在 w 减 2。`,
      `**累加顺序写反**：要自叶子向根（BFS 序倒序），否则父亲还没收到孩子的值。`,
      `**边差分把边归到错误端点**：必须归到较深（子）节点，根节点不代表边。`,
      `**点差分忘记处理父(w)不存在（根）**：w 是根时父(w)的减 1 要跳过。`,
    ],
    exercises: [
      { title: '统计站点补给次数', level: '提高',
        statement: '物资沿若干路径运送，求每条边需要承载多少次运输（边差分）。',
        hint: '边归子节点，w 处减 2。' },
      { title: '点差分与前缀和类比', level: '基础',
        statement: '用数组差分的"区间两端标记"类比，解释树上点差分的 4 个标记。',
        hint: '路径 = u→w ∪ v→w。' },
    ],
    summary: `
树上差分用 LCA 把一条路径的修改拆成少量标记、再自底向上累加，是树上的"差分"。
**点差分**：\`d[u]++ d[v]++ d[w]-- d[父(w)]--\`，得每点覆盖次数；
**边差分**（边归较深端点）：\`d[u]++ d[v]++ d[w]-=2\`，d[x] 即边 (父(x),x) 的经过次数。
累加必须沿 BFS/DFS 序倒序（先子后父）。
`,
  };

  /* ---------------- 树链剖分 ---------------- */
  T['tree-hld'] = {
    chapter: '第2章 树上进阶',
    time: '约 50 分钟',
    body: `
## 一、树链剖分要解决什么

树是"非线性"的，而线段树/树状数组只能处理"序列"。**树链剖分（重链剖分）**通过一种巧妙的编号方式，
**把整棵树映射成一个序列**，使得树上的**路径、子树**操作都能转化为序列上若干个连续区间，
从而用线段树/BIT 完成**路径查询 / 路径修改**。

## 二、重儿子与重链

- 一个点的**重儿子**：所有儿子中**子树结点数最多**的那个（其余叫轻儿子）；
- **重边**：连向重儿子的边；由重边连成的链叫**重链**。

一条任意路径，只会经过**有限条重链 + 少量轻边**——这是剖分能用"少数几段"表示路径的关键。

## 三、两次 DFS

\`\`\`text
dfs1(u, fa)：求 父亲 par、深度 depth、子树大小 sz、重儿子 heavy
dfs2(u, top)：给链顶 top[u]、新编号 dfn[u]
             ① 先递归重儿子（与 u 同一条链，链顶相同）
             ② 再递归每个轻儿子（各自成为新链的链顶）
\`\`\`

编号后，**同一条重链上的点 dfn 连续**；一个点的**整棵子树 dfn 也连续**（\`dfn[u] ~ dfn[u]+sz[u]-1\`）。

## 四、路径操作：沿链跳段

求路径 \`u→v\` 的信息（以区间和为例）：

\`\`\`text
while (top[u] != top[v]) {           // 不在同一条链
    让链顶更深的一侧：处理 dfn[top]..dfn[u] 这一段，然后跳到 父亲(top)
}
最后两者在同一条链：处理它们之间的 dfn 区间
\`\`\`

每跳一次至少走过一条轻边，而轻边数量是 **O(log n)** 级别，所以路径操作约 **O(log² n)**。

> **💡 配合什么用：** 在 dfn 序列上建**线段树**可支持路径/子树的区间查询与修改（懒标记）；
> 只需求和时用**树状数组**即可（下文示例）。
`,
    examples: [
      {
        title: '树链剖分求树上路径点权和',
        level: '挑战',
        statement: `**题目描述**

给定一棵带点权的树，回答 m 次询问：路径 \`u→v\` 上所有点权之和。`,
        input: '第一行 n；n−1 行边；一行 n 个点权；再给 m 和 m 行 u v。',
        output: '每行一个路径和。',
        samples: [['5\n1 2\n1 3\n2 4\n2 5\n1 2 3 4 5\n2\n4 3\n4 5', '10\n11']],
        analysis: `### 解题思路

- dfs1 求 sz/heavy，dfs2 编号 dfn/top；
- 把每个点权按 \`dfn[u]\` 放进树状数组；
- 查询按"链顶不同就跳段、同链处理区间"逐段累加。
路径 4→3 经过点 4(4)、2(2)、1(1)、3(3)，和为 10；4→5 和为 11。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
vector<int> g[MAXN];
int par[MAXN], depth[MAXN], sz[MAXN], heavy[MAXN];
int top_[MAXN], dfn[MAXN], timer;
long long bit[MAXN], w[MAXN];
int n;

void dfs1(int u, int fa) {
    par[u] = fa; sz[u] = 1; heavy[u] = 0;
    int mx = 0;
    for (int v : g[u]) if (v != fa) {
        depth[v] = depth[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > mx) { mx = sz[v]; heavy[u] = v; }
    }
}
void dfs2(int u, int chainTop) {
    top_[u] = chainTop;
    dfn[u] = ++timer;
    if (heavy[u]) dfs2(heavy[u], chainTop);   // 重儿子延续同一条链
    for (int v : g[u])
        if (v != par[u] && v != heavy[u])
            dfs2(v, v);                        // 轻儿子另起一条链
}
/* 树状数组：单点更新、区间和 */
void add(int p, long long x) { for (; p <= n; p += p & -p) bit[p] += x; }
long long sum(int p) { long long s = 0; for (; p > 0; p -= p & -p) s += bit[p]; return s; }
long long rangeSum(int l, int r) { return sum(r) - sum(l - 1); }

long long pathSum(int u, int v) {
    long long ans = 0;
    while (top_[u] != top_[v]) {
        if (depth[top_[u]] < depth[top_[v]]) swap(u, v);  // 让链顶深的一侧处理
        ans += rangeSum(dfn[top_[u]], dfn[u]);
        u = par[top_[u]];
    }
    if (depth[u] > depth[v]) swap(u, v);       // 同链：浅者在前
    ans += rangeSum(dfn[u], dfn[v]);
    return ans;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs1(1, 0);
    dfs2(1, 1);
    for (int u = 1; u <= n; u++) {
        cin >> w[u];
        add(dfn[u], w[u]);                     // 点权放进 dfn 位置
    }
    int m; cin >> m;
    while (m--) {
        int u, v; cin >> u >> v;
        cout << pathSum(u, v) << '\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**重儿子判据写错**：选子树结点数最多的儿子，不是深度最深。`,
      `**dfs2 编号顺序错**：必须先递归重儿子（保证同链 dfn 连续），再处理轻儿子。`,
      `**跳段时忘了更新 u=父亲(top)**：处理完一段要跳到链顶的父亲。`,
      `**同链时区间方向写反**：应取深度浅（dfn 小）的一端作为左端点。`,
      `**大递归爆栈**：数据很大时 dfs 可能过深，必要时改非递归或扩栈。`,
    ],
    exercises: [
      { title: '剖分求子树和', level: '提高',
        statement: '利用子树 dfn 连续，求某个点整棵子树的点权和。',
        hint: '区间 dfn[u] ~ dfn[u]+sz[u]-1。' },
      { title: '路径加（结合线段树）', level: '挑战',
        statement: '用剖分 + 带懒标记线段树，实现把路径上所有点权加 x。',
        hint: '沿链拆区间做区间加。' },
    ],
    summary: `
树链剖分用"**重儿子→重链**"的两次 DFS 把树映射成序列：dfs1 求 sz/heavy，dfs2 给 top/dfn。
同链与子树的 dfn 均连续。**路径操作沿链跳段**（链顶深的先处理、再跳到父），约 O(log² n)，
配合树状数组/线段树即可做路径查询与修改；子树操作对应一个连续区间。
`,
  };

  Object.assign(window.TOPICS, T);
})();
