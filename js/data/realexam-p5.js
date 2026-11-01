/* ============================================================
   真题与经典名题精讲 · 第五部分（竞赛算法进阶）7 题
   ============================================================ */
(function () {
  const R = {

  /* ---- two-pointers：A-B 数对 ---- */
  'two-pointers': {
    source: '洛谷 P1102 A-B 数对',
    title: 'A-B 数对（排序 + 双指针/二分）',
    level: '提高',
    statement: `**题目描述**

给定 n 个整数和一个目标数 C，求满足 \`A − B = C\` 的**有序数对 (A,B) 个数**。`,
    input: '第一行 n C；第二行 n 个整数。',
    output: '一个整数：数对个数。',
    samples: [['4 1\n1 2 2 3', '4']],
    analysis: `### 解题思路

改写为 \`A = B + C\`：排序后对每个 B，用 \`lower_bound/upper_bound\`
统计数列中等于 B+C 的元素个数并累加。答案用 long long。
样例：B=1 时 A=2 有 2 个；两个 B=2 各对应 A=3 一个，共 4。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; long long C; cin >> n >> C;
    vector<long long> a(n);
    for (long long &x : a) cin >> x;
    sort(a.begin(), a.end());

    long long ans = 0;
    for (long long b : a) {
        auto lo = lower_bound(a.begin(), a.end(), b + C);
        auto hi = upper_bound(a.begin(), a.end(), b + C);
        ans += hi - lo;
    }
    cout << ans << '\\n';
    return 0;
}`,
  },

  /* ---- sliding-window：滑动窗口（单调队列） ---- */
  'sliding-window': {
    source: '洛谷 P1886 滑动窗口 /【模板】单调队列',
    title: '滑动窗口最大值与最小值（单调 deque）',
    level: '提高',
    statement: `**题目描述**

给定长度为 n 的数组和窗口大小 k，从左到右滑动，依次输出每个窗口的最小值、最大值。`,
    input: '第一行 n k；第二行 n 个整数。',
    output: '两行：各窗口最小值、最大值，空格隔开。',
    samples: [['8 3\n1 3 -1 -3 5 3 6 7', `-1 -3 -3 -3 3 3
3 3 5 5 6 7`]],
    analysis: `### 解题思路

维护两个单调 deque（存下标）：最小值队首恒为窗口最小，新元素从队尾弹出更大者；
最大值同理。窗口成型（i≥k−1）后输出队首，并把离开窗口的队首弹出。整体 O(n)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int a[1000005];
int main() {
    int n, k; cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    deque<int> mn, mx;
    vector<int> resMin, resMax;
    for (int i = 0; i < n; i++) {
        while (!mn.empty() && a[mn.back()] >= a[i]) mn.pop_back();
        while (!mx.empty() && a[mx.back()] <= a[i]) mx.pop_back();
        mn.push_back(i); mx.push_back(i);
        if (mn.front() <= i - k) mn.pop_front();
        if (mx.front() <= i - k) mx.pop_front();
        if (i >= k - 1) { resMin.push_back(a[mn.front()]); resMax.push_back(a[mx.front()]); }
    }
    for (int i = 0; i < (int)resMin.size(); i++) cout << resMin[i] << (i+1==(int)resMin.size()?'\\n':' ');
    for (int i = 0; i < (int)resMax.size(); i++) cout << resMax[i] << (i+1==(int)resMax.size()?'\\n':' ');
    return 0;
}`,
  },

  /* ---- tree-difference：Max Flow ---- */
  'tree-difference': {
    source: '洛谷 P3128 [USACO15JAN] Max Flow',
    title: 'Max Flow（点差分 + LCA）',
    level: '挑战',
    statement: `**题目描述**

给定一棵 n 个点的树，K 条运输路线，每条路线会使沿途每个点的流量 +1。
求所有点中**最大流量**。`,
    input: '第一行 n K；n−1 行边；K 行 u v。',
    output: '一个整数：最大流量。',
    samples: [['5 2\n1 2\n1 3\n2 4\n2 5\n4 3\n4 5', '2']],
    analysis: `### 解题思路

点差分：每条路径 \`d[u]++ d[v]++ d[w]-- d[父w]--\`（w=LCA），
自底向上累加还原每点流量，取最大值。本例点 2、点 4 流量为 2。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 50005, LOG = 16;
vector<int> g[N];
int up[LOG][N], dep[N], par[N], ord[N], oc, d[N];

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int k = 0; k < LOG; k++) if (diff>>k&1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG-1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}
int main() {
    int n, K; cin >> n >> K;
    for (int i = 0; i < n-1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    queue<int> q; q.push(1);
    vector<bool> vis(n+1); vis[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); ord[oc++] = u;
        for (int v : g[u]) if (!vis[v]) {
            vis[v] = true; par[v] = u; dep[v] = dep[u]+1;
            up[0][v] = u; q.push(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int u = 1; u <= n; u++) up[k][u] = up[k-1][up[k-1][u]];

    while (K--) {
        int u, v; cin >> u >> v;
        int w = lca(u, v);
        d[u]++; d[v]++; d[w]--;
        if (par[w]) d[par[w]]--;
    }
    int ans = 0;
    for (int i = oc-1; i >= 0; i--) {
        int x = ord[i];
        if (par[x]) d[par[x]] += d[x];
        ans = max(ans, d[x]);
    }
    cout << ans << '\\n';
    return 0;
}`,
  },

  /* ---- tree-hld：树链剖分模板（路径加 + 路径和） ---- */
  'tree-hld': {
    source: '洛谷 P3384【模板】树链剖分',
    title: '树链剖分（路径加 + 路径和）',
    level: '挑战',
    statement: `**题目描述**

给定一棵带点权的树，支持：把路径 x→y 上所有点权加 a；查询路径 x→y 点权之和（结果对 p 取模）。
子树操作原理相同（对应 dfn 连续区间），本例聚焦路径操作。`,
    input: '第一行 n 根 p；n−1 行边；一行 n 个点权；操作 1 x y a / 2 x y。',
    output: '对每个操作 2 输出路径和。',
    samples: [['4 1 1000\n1 2\n1 3\n2 4\n1 2 3 4\n2 1 4\n1 1 4 5\n2 1 4', '7\n22']],
    analysis: `### 解题思路

- dfs1 求 sz/heavy，dfs2 编号 dfn（同链连续）；
- 在 dfn 序列上建带懒标记的线段树（区间加 / 区间和）；
- 路径操作：链顶不同就跳段处理 \`dfn[top]..dfn[u]\`，同链处理剩余区间。
样例路径 1→4 为点 1,2,4，和 1+2+4=7；各 +5 后 6+7+9=22。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
vector<int> g[N];
int par[N], dep[N], sz[N], heavy[N], top_[N], dfn[N], timer, n, MOD;
long long sumv[4*N], lazy[4*N];

void dfs1(int u, int fa) {
    par[u] = fa; sz[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dep[v] = dep[u]+1; dfs1(v, u); sz[u] += sz[v];
        if (sz[v] > sz[heavy[u]]) heavy[u] = v;
    }
}
void dfs2(int u, int t) {
    top_[u] = t; dfn[u] = ++timer;
    if (heavy[u]) dfs2(heavy[u], t);
    for (int v : g[u])
        if (v != par[u] && v != heavy[u]) dfs2(v, v);
}
void build(int p, int l, int r, vector<long long>& arr) {
    if (l == r) { sumv[p] = arr[l] % MOD; return; }
    int m = (l+r)/2;
    build(p*2,l,m,arr); build(p*2+1,m+1,r,arr);
    sumv[p] = (sumv[p*2] + sumv[p*2+1]) % MOD;
}
void apply(int p, int l, int r, long long v) {
    sumv[p] = (sumv[p] + v * (r-l+1)) % MOD;
    lazy[p] = (lazy[p] + v) % MOD;
}
void pushDown(int p, int l, int r) {
    if (lazy[p]) {
        int m = (l+r)/2;
        apply(p*2,l,m,lazy[p]); apply(p*2+1,m+1,r,lazy[p]);
        lazy[p] = 0;
    }
}
void update(int p, int l, int r, int ql, int qr, long long v) {
    if (ql<=l && r<=qr) { apply(p,l,r,v); return; }
    pushDown(p,l,r); int m=(l+r)/2;
    if (ql<=m) update(p*2,l,m,ql,qr,v);
    if (qr>m) update(p*2+1,m+1,r,ql,qr,v);
    sumv[p] = (sumv[p*2]+sumv[p*2+1]) % MOD;
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql<=l && r<=qr) return sumv[p];
    pushDown(p,l,r); int m=(l+r)/2; long long s=0;
    if (ql<=m) s += query(p*2,l,m,ql,qr);
    if (qr>m) s += query(p*2+1,m+1,r,ql,qr);
    return s % MOD;
}
void pathAdd(int u, int v, long long a) {
    while (top_[u] != top_[v]) {
        if (dep[top_[u]] < dep[top_[v]]) swap(u,v);
        update(1,1,n,dfn[top_[u]],dfn[u],a);
        u = par[top_[u]];
    }
    if (dep[u] > dep[v]) swap(u,v);
    update(1,1,n,dfn[u],dfn[v],a);
}
long long pathSum(int u, int v) {
    long long ans = 0;
    while (top_[u] != top_[v]) {
        if (dep[top_[u]] < dep[top_[v]]) swap(u,v);
        ans = (ans + query(1,1,n,dfn[top_[u]],dfn[u])) % MOD;
        u = par[top_[u]];
    }
    if (dep[u] > dep[v]) swap(u,v);
    return (ans + query(1,1,n,dfn[u],dfn[v])) % MOD;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int root; cin >> n >> root >> MOD;
    for (int i = 0; i < n-1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs1(root,0); dfs2(root,root);
    vector<long long> arr(n+1), w(n+1);
    for (int u = 1; u <= n; u++) { cin >> w[u]; arr[dfn[u]] = w[u]; }
    build(1,1,n,arr);

    int op;
    while (cin >> op) {
        int x, y; cin >> x >> y;
        if (op == 1) { long long a; cin >> a; pathAdd(x,y,a); }
        else cout << pathSum(x,y) << '\\n';
    }
    return 0;
}`,
  },

  /* ---- matrix-exponent：矩阵加速数列 ---- */
  'matrix-exponent': {
    source: '洛谷 P1939【模板】矩阵加速（数列）',
    title: '矩阵加速数列（3×3 转移）',
    level: '挑战',
    statement: `**题目描述**

数列定义 \`a[1]=a[2]=a[3]=1\`，\`a[i]=a[i−1]+a[i−3]\`（i>3）。
求 a[n] 对 10⁹+7 取模。`,
    input: '一个整数 n。',
    output: '一个整数：a[n]。',
    samples: [['4', '2'], ['6', '4']],
    analysis: `### 解题思路

状态列 \`[a[i],a[i−1],a[i−2]]\`，转移矩阵
\`[[1,0,1],[1,0,0],[0,1,0]]\`。用 M^(n−3) 乘初始列 \`[1,1,1]\`，首分量即 a[n]。
a4=a3+a1=2；a6=a5+a3=3+1=4。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;
struct Mx { long long a[3][3] = {0}; };

Mx mul(const Mx& A, const Mx& B) {
    Mx C;
    for (int i = 0; i < 3; i++)
        for (int k = 0; k < 3; k++)
            for (int j = 0; j < 3; j++)
                C.a[i][j] = (C.a[i][j] + A.a[i][k]*B.a[k][j]) % MOD;
    return C;
}
int main() {
    long long n; cin >> n;
    if (n <= 3) { cout << 1; return 0; }

    Mx base;
    base.a[0][0]=1; base.a[0][2]=1;
    base.a[1][0]=1; base.a[2][1]=1;
    Mx res;
    for (int i = 0; i < 3; i++) res.a[i][i] = 1;

    long long e = n - 3;
    while (e) {
        if (e&1) res = mul(res, base);
        base = mul(base, base);
        e >>= 1;
    }
    /* 乘初始 [1,1,1]：首行三元素相加 */
    long long ans = 0;
    for (int j = 0; j < 3; j++) ans = (ans + res.a[0][j]) % MOD;
    cout << ans << '\\n';
    return 0;
}`,
  },

  /* ---- gaussian-elim：高斯消元法模板 ---- */
  'gaussian-elim': {
    source: '洛谷 P3389【模板】高斯消元法',
    title: '高斯消元法（保证唯一解）',
    level: '提高',
    statement: `**题目描述**

给定一个 n 元线性方程组（保证有唯一解），求解各个未知数，保留 2 位小数。`,
    input: '第一行 n；n 行 n+1 个小数（系数 + 右端）。',
    output: '一行 n 个解。',
    samples: [['3\n2 1 -1 8\n1 2 1 7\n3 -1 2 1', '2.00 3.00 -1.00']],
    analysis: `### 解题思路

标准选主元高斯-约当：每列选绝对值最大行，归一化、消掉其他行，末列即解。
解为 x=2,y=3,z=−1。`,
    code: `#include <bits/stdc++.h>
using namespace std;
double a[105][106];
const double EPS = 1e-9;
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= n; j++) cin >> a[i][j];

    for (int col = 0; col < n; col++) {
        int piv = col;
        for (int r = col+1; r < n; r++)
            if (fabs(a[r][col]) > fabs(a[piv][col])) piv = r;
        swap(a[col], a[piv]);
        if (fabs(a[col][col]) < EPS) { cout << "No Solution"; return 0; }

        double d = a[col][col];
        for (int j = col; j <= n; j++) a[col][j] /= d;
        for (int r = 0; r < n; r++) if (r != col) {
            double f = a[r][col];
            for (int j = col; j <= n; j++) a[r][j] -= f*a[col][j];
        }
    }
    cout << fixed << setprecision(2);
    for (int i = 0; i < n; i++)
        cout << a[i][n] << (i+1==n?'\\n':' ');
    return 0;
}`,
  },

  /* ---- game-theory：Nim 游戏模板 ---- */
  'game-theory': {
    source: '洛谷 P2197【模板】Nim 游戏',
    title: 'Nim 游戏（异或判定）',
    level: '基础',
    statement: `**题目描述**

n 堆石子，每次选一堆取任意正数颗。问先手是否有必胜策略，有输出 Yes，否则 No。`,
    input: '第一行 n；第二行 n 个非负整数。',
    output: 'Yes 或 No。',
    samples: [['3\n1 1 3', 'Yes'], ['2\n1 1', 'No']],
    analysis: `### 解题思路

各堆石子数异或：非 0 先手胜（Yes），为 0 先手败（No）。
1^1^3 = 3 ≠ 0；1^1 = 0。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    int xorsum = 0;
    for (int i = 0; i < n; i++) { int x; cin >> x; xorsum ^= x; }
    cout << (xorsum != 0 ? "Yes" : "No") << '\\n';
    return 0;
}`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
