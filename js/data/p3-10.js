/* ============================================================
   第三部分 · 第8章 树上算法
   lca / tree-dp
   ============================================================ */
(function () {
  const T = {};

  T['lca'] = {
    chapter: '第8章 树上算法',
    time: '约 55 分钟',
    body: `
## 一、树上距离与公共祖先

树中两点路径唯一，u、v 的路径 = u 到 LCA + LCA 到 v。若根为 root，深度 depth 已预处理：

\`\`\`text
dist(u,v) = depth[u] + depth[v] - 2 * depth[LCA(u,v)]   （边权为 1）
\`\`\`

## 二、倍增 LCA（标准做法）

预处理：

- \`up[k][u]\`：u 的 2ᵏ 级祖先；up[0] 是直接父亲，\`up[k][u] = up[k-1][ up[k-1][u] ]\`；
- DFS/BFS 求出 depth。

查询：

1. 把较深的点向上提到与另一点同层（深度差二进制拆位）；
2. 两点同时从最大的 k 向下尝试，只要 \`up[k][u] != up[k][v]\` 就一起跳；
3. 最后父结点即 LCA。

\`\`\`cpp
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++)
        if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) {
            u = up[k][u];
            v = up[k][v];
        }
    return up[0][u];
}
\`\`\`

预处理 O(n log n)，单次查询 O(log n)。

## 三、建树根

无根树给的是无向边，DFS 时传父亲参数避免回头：

\`\`\`cpp
void dfs(int u, int fa) {
    up[0][u] = fa;
    for (int k = 1; k < LOG; k++) up[k][u] = up[k-1][ up[k-1][u] ];
    for (int v : g[u]) if (v != fa) { depth[v] = depth[u]+1; dfs(v, u); }
}
\`\`\`

## 四、带权距离

额外维护 \`d[u]\` = 根到 u 的边权和，公式改为 d[u]+d[v]-2d[lca]。

## 五、其他方法（了解）

- Tarjan 离线 LCA：并查集，O(n+q)，所有询问一次性回答；
- 欧拉序 + RMQ（ST 表）：O(1) 查询，代码稍长；
竞赛 95% 场景倍增足够。
`,
    examples: [
      {
        title: '树上两点距离',
        level: '提高',
        statement: `**题目描述**

一棵 n 个点的树，q 次询问两点距离（边数）。n,q≤10⁵。`,
        samples: [['5\n1 2\n1 3\n2 4\n2 5\n4\n4 3\n2 5\n1 5\n3 5', `3
1
2
3`]],
        analysis: `### 解题思路

倍增 LCA 模板题。LOG 取 18~20（2¹⁷=131072）。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int LOG = 18;
vector<int> g[100005];
int up[LOG][100005], depth[100005];

void dfs(int u, int fa) {
    up[0][u] = fa;
    for (int k = 1; k < LOG; k++)
        up[k][u] = up[k-1][ up[k-1][u] ];
    for (int v : g[u])
        if (v != fa) { depth[v] = depth[u]+1; dfs(v, u); }
}
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++)
        if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG-1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    for (int i = 0; i < n-1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(1, 1);
    int q; cin >> q;
    while (q--) {
        int u, v; cin >> u >> v;
        int w = lca(u, v);
        cout << depth[u] + depth[v] - 2*depth[w] << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '差分数组处理路径加（树上差分）',
        level: '挑战',
        statement: `**题目描述**

m 条路径，对每条路径上的边计数 +1，求被经过最多次的边被多少条路径经过。`,
        samples: [['5 3\n1 2\n1 3\n2 4\n2 5\n4 5\n4 3\n2 3', '2']],
        analysis: `### 解题思路

点差分：对路径 u-v，cnt[u]++、cnt[v]++、cnt[lca]-=2；DFS 自底向上累加，得到每个点“到父结点的边”被覆盖次数。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int LOG = 18;
vector<int> g[100005];
int up[LOG][100005], depth[100005], cnt[100005], ans;

void dfs(int u, int fa) {
    up[0][u] = fa;
    for (int k = 1; k < LOG; k++) up[k][u] = up[k-1][up[k-1][u]];
    for (int v : g[u]) if (v != fa) { depth[v]=depth[u]+1; dfs(v,u); }
}
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u,v);
    int d = depth[u]-depth[v];
    for (int k=0;k<LOG;k++) if (d>>k&1) u=up[k][u];
    if (u==v) return u;
    for (int k=LOG-1;k>=0;k--) if (up[k][u]!=up[k][v]) {u=up[k][u];v=up[k][v];}
    return up[0][u];
}
int sumDfs(int u, int fa) {
    for (int v : g[u]) if (v != fa) cnt[u] += sumDfs(v, u);
    ans = max(ans, cnt[u]);
    return cnt[u];
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i=0;i<n-1;i++){int u,v;cin>>u>>v;g[u].push_back(v);g[v].push_back(u);}
    dfs(1,1);
    for (int i=0;i<m;i++) {
        int u,v; cin>>u>>v;
        int w=lca(u,v);
        cnt[u]++; cnt[v]++; cnt[w]-=2;
    }
    sumDfs(1,1);
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**LOG 层数不够**：n≤10⁵ 取 17 以上，留余量到 18/20。`,
      `**根的 up 指向 0 导致跳飞**：令 up[*][root]=root。`,
      `**同层后忘记特判 u==v**：直接进入第二段会错误上跳。`,
      `**无向建树不防父亲**：DFS 必须传 fa。`,
      `**树上差分 lca 处理错误**：点权与边权差分公式不同（边权在 lca 处减 2）。`,
    ],
    exercises: [
      { title: '多次 LCA 裸查询', level: '基础',
        statement: '直接输出每次询问的 LCA 编号。',
        hint: '模板。' },
      { title: '带权树距离', level: '提高',
        statement: '边有权重，求路径权值和。',
        hint: '维护根路径权值和 d[]。' },
      { title: '点覆盖次数', level: '挑战',
        statement: '路径上的点计数 +1，统计最忙点（点差分）。',
        hint: 'cnt[u]++,cnt[v]++,cnt[lca]--,cnt[fa(lca)]--。' },
    ],
    summary: `
- LCA 是树上路径问题的枢纽：距离 = depth[u]+depth[v]−2depth[LCA]；
- **倍增法**预处理 up[k][u]（2ᵏ 祖先）O(n log n)，查询先对齐深度再共同上跳 O(log n)；
- 根的祖先指向自己；无根树 DFS 带父亲；带权树维护根距离数组；
- 树上差分把路径修改转为 2~4 个点的标记，最后 DFS 汇总。
`,
  };

  T['tree-dp'] = {
    chapter: '第8章 树上算法',
    time: '约 55 分钟',
    body: `
## 一、树形 DP 的通用框架

状态通常以“**以 u 为根的子树**”定义；在 DFS 回溯时，先算出所有孩子的答案，再合并到 u：

\`\`\`cpp
void dfs(int u, int fa) {
    // 1. 初始化 u 自己的状态
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        // 2. 用孩子 v 的结果更新 u
    }
    // 3. 汇总 u 的答案
}
\`\`\`

无向树要传 fa 防回头；答案一般取所有结点状态的最优值。

## 二、经典 1：没有上司的舞会（最大独立集）

每个点有权值，相邻（父子）不能同时选，求最大权值和。

- f[u][0]：u 不选时子树最优；f[u][1]：u 选时最优；
- u 选则孩子不能选；u 不选，孩子可选可不选取最大：

\`\`\`cpp
f[u][1] = w[u];
for (int v : child[u]) {
    f[u][1] += f[v][0];
    f[u][0] += max(f[v][0], f[v][1]);
}
\`\`\`

## 三、经典 2：树的直径

无权树直径（最远两点距离）：两次 DFS/BFS——任一点找最远点 s，再从 s 找最远点 t，dist(s,t) 即直径。

DP 法：对每个 u 记录从 u 向下的最长、次长路径，经过 u 的直径是两者之和，全局取最大。

## 四、经典 3：树的重心

删去某点后最大连通块（子树或“上方部分”）最小：

\`\`\`cpp
sz[u] = 1;
int maxPart = n - 1;
for (v : child) {
    sz[u] += sz[v];
    maxPart = max(maxPart, sz[v]);
}
maxPart = max(maxPart, n - sz[u]);  // 父亲方向剩余部分
\`\`\`

## 五、树形背包

f[u][j]：在 u 子树中选 j 个/花费 j 容量的最优，合并每个孩子像一次 01 背包，复杂度朴素 O(nk²)，优化上下界后可 O(nk)。
`,
    examples: [
      {
        title: '没有上司的舞会',
        level: '提高',
        statement: `**题目描述**

n 个员工构成一棵树（每人一个快乐值），举办舞会不能同时邀请有直属上下级关系的两人，求最大快乐值总和。`,
        samples: [['4\n10 20 30 40\n2 1\n3 1\n4 3', '60']],
        analysis: `### 解题思路

两状态树形 DP 模板。根任选（无上司的员工），答案 max(f[root][0], f[root][1])。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[6005];
int w[6005], f[6005][2];
bool hasParent[6005];

void dfs(int u, int fa) {
    f[u][1] = w[u];
    f[u][0] = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        f[u][1] += f[v][0];
        f[u][0] += max(f[v][0], f[v][1]);
    }
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> w[i];
    for (int i = 1; i < n; i++) {
        int u, v; cin >> u >> v;       // v 是 u 的上司
        g[u].push_back(v);
        g[v].push_back(u);
        hasParent[u] = true;
    }
    int root = 1;
    while (hasParent[root]) root++;
    dfs(root, 0);
    cout << max(f[root][0], f[root][1]) << '\\n';
    return 0;
}`,
      },
      {
        title: '树的直径（DP 法）',
        level: '基础',
        statement: `**题目描述**

求无权树的直径边数。`,
        samples: [['6\n1 2\n1 3\n2 4\n2 5\n3 6', '4']],
        analysis: `### 解题思路

维护从 u 向下最长 d1、次长 d2，经过 u 的候选直径 d1+d2，后序合并时全局取最大。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int ans;

int dfs(int u, int fa) {
    int d1 = 0, d2 = 0;          // 最长、次长向下链
    for (int v : g[u]) {
        if (v == fa) continue;
        int d = dfs(v, u) + 1;
        if (d > d1) { d2 = d1; d1 = d; }
        else if (d > d2) d2 = d;
    }
    ans = max(ans, d1 + d2);
    return d1;
}
int main() {
    int n; cin >> n;
    for (int i=0;i<n-1;i++) { int u,v; cin>>u>>v; g[u].push_back(v); g[v].push_back(u); }
    dfs(1, 0);
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '树的重心',
        level: '提高',
        statement: `**题目描述**

求树的重心编号（删除后最大剩余连通块最小）。`,
        samples: [['5\n1 2\n2 3\n3 4\n4 5', '3']],
        analysis: `### 解题思路

一次 DFS 求子树大小，每个点比较“最大孩子子树”和“n−sz[u]（上方部分）”。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int sz[100005], n, best = 1, bestSize = 1e9;

void dfs(int u, int fa) {
    sz[u] = 1;
    int maxPart = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        sz[u] += sz[v];
        maxPart = max(maxPart, sz[v]);
    }
    maxPart = max(maxPart, n - sz[u]);
    if (maxPart < bestSize) { bestSize = maxPart; best = u; }
}
int main() {
    cin >> n;
    for (int i=0;i<n-1;i++){int u,v;cin>>u>>v;g[u].push_back(v);g[v].push_back(u);}
    dfs(1, 0);
    cout << best << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**合并顺序错**：必须先 dfs 孩子再更新 u（后序）。`,
      `**无向边把父亲当孩子**：传 fa 或只建单向树。`,
      `**状态初始化漏自身**：f[u][1]=w[u] 等包含自己的状态。`,
      `**答案只取 root**：直径、许多全局最优要在所有结点取 max。`,
      `**树形背包重复计数**：每合并一个孩子更新一次 dp，注意倒序。`,
    ],
    exercises: [
      { title: '树的高度', level: '入门',
        statement: '求根树最大深度。',
        hint: 'height[u]=1+max(height[v])。' },
      { title: '结点距离统计', level: '挑战',
        statement: '树上距离恰好为 k 的点对数（n≤10⁵，k 较小）。',
        hint: '树形 DP 配合桶/点分治进阶。' },
      { title: '选课（树形背包）', level: '挑战',
        statement: '课程有先修依赖形成森林，选 m 门课最大学分。',
        hint: '虚拟 0 号根连所有树，f[u][j] 子树选 j 门做树上背包。' },
    ],
    summary: `
- 树形 DP 以子树定义状态，DFS 后序合并：先孩子后自己；
- **没有上司的舞会**：f[u][0/1] 两状态处理相邻不可同选；
- 直径：两次 DFS 或“最长+次长向下链”DP；重心：比较最大孩子子树与 n−sz[u]；
- 树形背包按孩子逐个做 01 背包合并。
`,
  };

  Object.assign(window.TOPICS, T);
})();
