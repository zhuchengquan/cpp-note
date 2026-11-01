/* ============================================================
   真题与经典名题精讲 · 第三部分（CSP-S 提高篇）第一批 10 题
   ============================================================ */
(function () {
  const R = {

  /* ---- linked-list：约瑟夫问题 ---- */
  'linked-list': {
    source: '洛谷 P1996 约瑟夫问题',
    title: '约瑟夫问题（队列/链表模拟）',
    level: '基础',
    statement: `**题目描述**

n 个人围成一圈，从 1 号开始报数，数到 m 的人出列；下一个人重新从 1 报数。
输出出列顺序，编号之间用空格隔开。`,
    input: '一行 n m。',
    output: '一行出列编号。',
    samples: [['10 3', '3 6 9 2 7 1 8 5 10 4']],
    analysis: `### 解题思路

用队列最简洁：队首报数，没到 m 就回队尾、到 m 就输出并出列。
也可用数组链表/编号模拟。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    queue<int> q;
    for (int i = 1; i <= n; i++) q.push(i);

    int cnt = 0;
    while (!q.empty()) {
        int x = q.front(); q.pop();
        cnt++;
        if (cnt == m) {
            cout << x << (q.empty() ? '\\n' : ' ');
            cnt = 0;
        } else q.push(x);
    }
    return 0;
}`,
  },

  /* ---- mono-stack-queue：单调栈 ---- */
  'mono-stack-queue': {
    source: '洛谷 P5788【模板】单调栈',
    title: '单调栈（下一个更大元素）',
    level: '提高',
    statement: `**题目描述**

给出长度为 n 的整数序列，对每个元素求它右侧第一个比它大的元素的下标，不存在输出 0。`,
    input: '第一行 n，第二行 n 个整数。',
    output: '一行 n 个下标。',
    samples: [['5\n1 4 2 3 5', '2 5 4 5 0']],
    analysis: `### 解题思路

维护一个"值单调递减"的下标栈：从左到右，当当前值 a[i] 大于栈顶值时，
栈顶元素的答案就是 i，弹出；反复后压入 i。每个元素至多进出栈一次，**O(n)**。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int a[3000005], ans[3000005], st[3000005], top_;
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];

    for (int i = 1; i <= n; i++) {
        while (top_ && a[st[top_]] < a[i]) {
            ans[st[top_]] = i;
            top_--;
        }
        st[++top_] = i;
    }
    for (int i = 1; i <= n; i++)
        cout << ans[i] << (i == n ? '\\n' : ' ');
    return 0;
}`,
  },

  /* ---- dsu：亲戚 ---- */
  'dsu': {
    source: '洛谷 P1551 亲戚',
    title: '亲戚（并查集）',
    level: '基础',
    statement: `**题目描述**

已知 n 个人及若干亲戚关系（亲戚的亲戚也是亲戚），回答若干询问：两人是否为亲戚。`,
    input: '第一行 n m p；m 行关系；p 行询问。',
    output: '每行 Yes 或 No。',
    samples: [['6 3 2\n1 2\n1 3\n4 5\n1 4\n2 3', 'No\nYes']],
    analysis: `### 解题思路

并查集：每个集合用代表元（根）表示。有关系就合并集合，询问时比较根是否相同。
用路径压缩 + 按大小合并，单次操作近 O(1)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int fa[5005];
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a != b) fa[a] = b;
}
int main() {
    int n, m, p; cin >> n >> m >> p;
    for (int i = 1; i <= n; i++) fa[i] = i;
    for (int i = 0; i < m; i++) {
        int a, b; cin >> a >> b; unite(a, b);
    }
    for (int i = 0; i < p; i++) {
        int a, b; cin >> a >> b;
        cout << (find(a) == find(b) ? "Yes" : "No") << '\\n';
    }
    return 0;
}`,
  },

  /* ---- heap：堆模板 ---- */
  'heap': {
    source: '洛谷 P3378【模板】堆',
    title: '小根堆（priority_queue）',
    level: '基础',
    statement: `**题目描述**

维护一个小根堆，支持：插入一个数；输出并删除最小值。初始为空。`,
    input: '第一行 n；随后 n 行，1 x 插入，2 查询最小，3 删除最小。',
    output: '对每个操作 2 输出最小值。',
    samples: [['5\n1 5\n1 3\n2\n3\n2', '3\n5']],
    analysis: `### 解题思路

直接用 \`priority_queue<int, vector<int>, greater<int>>\`：
\`push\` 插入、\`top\` 取最小、\`pop\` 删除。手写二叉堆也可（数组 + 上浮下沉）。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    priority_queue<int, vector<int>, greater<int>> pq;
    while (n--) {
        int op, x; cin >> op;
        if (op == 1) { cin >> x; pq.push(x); }
        else if (op == 2) cout << pq.top() << '\\n';
        else pq.pop();
    }
    return 0;
}`,
  },

  /* ---- bit：树状数组 1 ---- */
  'bit': {
    source: '洛谷 P3374【模板】树状数组 1',
    title: '树状数组（单点加 + 区间和）',
    level: '基础',
    statement: `**题目描述**

给定 n 个整数的序列，支持两种操作：将某位置加一个数；查询区间 [l,r] 之和。`,
    input: '第一行 n m；第二行 n 个初值；m 行，1 x k 加、2 l r 查。',
    output: '对每个操作 2 输出区间和。',
    samples: [['5 3\n1 2 3 4 5\n2 1 3\n1 2 10\n2 2 5', '6\n24']],
    analysis: `### 解题思路

树状数组利用 \`lowbit(x)=x&-x\` 把前缀和与单点更新都做到 O(log n)。
区间和 = 前缀和(r) − 前缀和(l−1)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
long long bit[500005];
int n;
void add(int p, long long x) { for (; p <= n; p += p & -p) bit[p] += x; }
long long sum(int p) { long long s = 0; for (; p > 0; p -= p & -p) s += bit[p]; return s; }
int main() {
    int m; cin >> n >> m;
    for (int i = 1; i <= n; i++) { long long x; cin >> x; add(i, x); }
    while (m--) {
        int op, a; long long b; cin >> op >> a >> b;
        if (op == 1) add(a, b);
        else cout << sum(b) - sum(a - 1) << '\\n';
    }
    return 0;
}`,
  },

  /* ---- segment-tree：线段树 1 ---- */
  'segment-tree': {
    source: '洛谷 P3372【模板】线段树 1',
    title: '线段树（区间加 + 区间求和）',
    level: '提高',
    statement: `**题目描述**

给定 n 个数，支持：把区间 [x,y] 每个数加 k；查询区间 [x,y] 之和。`,
    input: '第一行 n m；第二行 n 个数；m 行操作。',
    output: '对每个查询输出区间和。',
    samples: [['5 3\n1 2 3 4 5\n2 1 3\n1 1 3 10\n2 1 5', '6\n45']],
    analysis: `### 解题思路

线段树把区间组织成树，懒标记：整段加时先记在该节点、不立即下传，
等到要访问它的子节点时再下传，保证区间操作 O(log n)。和用 long long。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
long long sumv[4*N], lazy[4*N];

void pushDown(int p, int l, int r) {
    if (lazy[p]) {
        int mid = (l + r) / 2;
        sumv[p*2] += lazy[p] * (mid - l + 1);
        lazy[p*2] += lazy[p];
        sumv[p*2+1] += lazy[p] * (r - mid);
        lazy[p*2+1] += lazy[p];
        lazy[p] = 0;
    }
}
void build(int p, int l, int r) {
    if (l == r) { cin >> sumv[p]; return; }
    int mid = (l + r) / 2;
    build(p*2, l, mid); build(p*2+1, mid+1, r);
    sumv[p] = sumv[p*2] + sumv[p*2+1];
}
void add(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { sumv[p] += v*(r-l+1); lazy[p] += v; return; }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) add(p*2, l, mid, ql, qr, v);
    if (qr > mid) add(p*2+1, mid+1, r, ql, qr, v);
    sumv[p] = sumv[p*2] + sumv[p*2+1];
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sumv[p];
    pushDown(p, l, r);
    int mid = (l + r) / 2; long long s = 0;
    if (ql <= mid) s += query(p*2, l, mid, ql, qr);
    if (qr > mid) s += query(p*2+1, mid+1, r, ql, qr);
    return s;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    build(1, 1, n);
    while (m--) {
        int op, x, y; long long k;
        cin >> op >> x >> y;
        if (op == 1) { cin >> k; add(1, 1, n, x, y, k); }
        else cout << query(1, 1, n, x, y) << '\\n';
    }
    return 0;
}`,
  },

  /* ---- mst：最小生成树 ---- */
  'mst': {
    source: '洛谷 P3366【模板】最小生成树',
    title: '最小生成树（Kruskal）',
    level: '提高',
    statement: `**题目描述**

给定 n 个点 m 条边的无向连通带权图，求最小生成树的边权之和；图不连通输出 orz。`,
    input: '第一行 n m；m 行 u v w。',
    output: '一个整数：MST 权值和。',
    samples: [['4 5\n1 2 2\n1 3 2\n1 4 3\n2 3 4\n3 4 1', '5']],
    analysis: `### 解题思路

Kruskal：把所有边按权升序，依次考虑，若两端不在同一集合（并查集）就加入 MST。
选够 n−1 条即完成；若处理完仍不足 n−1 条，图不连通。`,
    code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int u, v, w; };
int fa[5005];
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }
int main() {
    int n, m; cin >> n >> m;
    vector<Edge> e(m);
    for (auto &x : e) cin >> x.u >> x.v >> x.w;

    sort(e.begin(), e.end(), [](const Edge &a, const Edge &b){ return a.w < b.w; });
    for (int i = 1; i <= n; i++) fa[i] = i;

    int used = 0, total = 0;
    for (const Edge &x : e) {
        int a = find(x.u), b = find(x.v);
        if (a != b) { fa[a] = b; total += x.w; if (++used == n-1) break; }
    }
    if (used != n-1) cout << "orz";
    else cout << total;
    return 0;
}`,
  },

  /* ---- bipartite：二分图最大匹配 ---- */
  'bipartite': {
    source: '洛谷 P3386【模板】二分图最大匹配',
    title: '二分图最大匹配（匈牙利）',
    level: '挑战',
    statement: `**题目描述**

给定二分图，左部 n 个点、右部 m 个点及若干边，求最大匹配（每个点至多匹配一条边）的边数。`,
    input: '第一行 n m e；e 行 左u 右v。',
    output: '一个整数：最大匹配数。',
    samples: [['4 4 4\n1 1\n1 2\n2 2\n3 3', '3']],
    analysis: `### 解题思路

匈牙利算法：依次为每个左部点找增广路——尝试它相连的右部点，
若该右部点未匹配、或它当前匹配的左部点能另找，就匹配成功。`,
    code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[505];
int matchR[505];
bool vis[505];

bool dfs(int u) {
    for (int v : g[u]) if (!vis[v]) {
        vis[v] = true;
        if (!matchR[v] || dfs(matchR[v])) { matchR[v] = u; return true; }
    }
    return false;
}
int main() {
    int n, m, e; cin >> n >> m >> e;
    for (int i = 0; i < e; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }

    int ans = 0;
    for (int u = 1; u <= n; u++) {
        memset(vis, false, sizeof(vis));
        if (dfs(u)) ans++;
    }
    cout << ans << '\\n';
    return 0;
}`,
  },

  /* ---- lca：最近公共祖先 ---- */
  'lca': {
    source: '洛谷 P3379【模板】最近公共祖先',
    title: '最近公共祖先（倍增 LCA）',
    level: '提高',
    statement: `**题目描述**

给定一棵有根树（根为 1），回答若干询问：两个节点的最近公共祖先。`,
    input: '第一行 n m 根；n−1 行边；m 行 u v。',
    output: '每行一个 LCA。',
    samples: [['5 2 1\n1 2\n1 3\n2 4\n2 5\n4 3\n4 5', '1\n2']],
    analysis: `### 解题思路

倍增：预处理每个点向上 2ᵏ 级祖先。查询时先把两点提到同一深度，
再从大到小尝试，让它们的祖先不相等地一起上跳，最后父亲即 LCA。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 500005, LOG = 20;
vector<int> g[N];
int up[LOG][N], depth[N];

void dfs(int u, int fa) {
    up[0][u] = fa;
    for (int k = 1; k < LOG; k++) up[k][u] = up[k-1][up[k-1][u]];
    for (int v : g[u]) if (v != fa) { depth[v] = depth[u]+1; dfs(v, u); }
}
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++) if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG-1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, root; cin >> n >> m >> root;
    for (int i = 0; i < n-1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(root, root);
    while (m--) { int u, v; cin >> u >> v; cout << lca(u, v) << '\\n'; }
    return 0;
}`,
  },

  /* ---- string-kmp：KMP ---- */
  'string-kmp': {
    source: '洛谷 P3375【模板】KMP 字符串匹配',
    title: 'KMP 字符串匹配',
    level: '提高',
    statement: `**题目描述**

给定文本串 s 和模式串 p，求 p 在 s 中所有出现位置（从 1 开始），
并输出模式串的前缀函数（next 数组）。`,
    input: '两行：文本串 s、模式串 p。',
    output: '每次匹配输出首位置；最后一行 next 数组。',
    samples: [['ababababc\naba', `1\n3\n5\n0 0 1`]],
    analysis: `### 解题思路

前缀函数 \`pi[i]\`：子串 p[0..i] 最长相等真前缀/后缀长度。
匹配时文本指针不回退，失配就用 \`pi\` 跳转，整体 O(|s|+|p|)。
当匹配长度达到 |p| 输出位置，并继续用 pi 跳转以找重叠出现。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s, p; cin >> s >> p;
    int n = p.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i-1];
        while (j && p[i] != p[j]) j = pi[j-1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }

    int j = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        while (j && s[i] != p[j]) j = pi[j-1];
        if (s[i] == p[j]) j++;
        if (j == n) {
            cout << i - n + 2 << '\\n';   // 1 起首位置
            j = pi[j-1];
        }
    }
    for (int i = 0; i < n; i++)
        cout << pi[i] << (i+1 == n ? '\\n' : ' ');
    return 0;
}`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
