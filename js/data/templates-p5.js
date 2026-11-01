/* ============================================================
   核心模板速记 · 第五部分（竞赛算法进阶）
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  /* ================= 第2章 树上差分 / 树链剖分 ================= */
  'tree-difference': [
    {
      title: '点差分：每点被路径覆盖次数',
      note: 'LCA 后每条路径 d[u]++d[v]++d[w]--d[父w]--，按 BFS 序倒序累加。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 100005, LOG = 17;
vector<int> g[N];
int up[LOG][N], dep[N], par[N], ord[N], oc, d[N];

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int k = 0; k < LOG; k++) if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}
int main() {
    int n; cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    queue<int> q; q.push(1);
    vector<bool> vis(n + 1); vis[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); ord[oc++] = u;
        for (int v : g[u]) if (!vis[v]) {
            vis[v] = true; par[v] = u; dep[v] = dep[u] + 1;
            up[0][v] = u; q.push(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int u = 1; u <= n; u++) up[k][u] = up[k - 1][up[k - 1][u]];

    int m; cin >> m;
    while (m--) {
        int u, v; cin >> u >> v;
        int w = lca(u, v);
        d[u]++; d[v]++; d[w]--;
        if (par[w]) d[par[w]]--;
    }
    for (int i = oc - 1; i >= 0; i--)
        if (par[ord[i]]) d[par[ord[i]]] += d[ord[i]];
    for (int u = 1; u <= n; u++)
        cout << d[u] << (u == n ? '\\n' : ' ');
    return 0;
}
\`\`\``,
    },
  ],

  'tree-hld': [
    {
      title: '重链剖分 + BIT 求路径点权和',
      note: 'dfs1 求 sz/heavy，dfs2 给 top/dfn；路径沿链跳段、每段查 BIT 区间和，O(log²n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
vector<int> g[N];
int par[N], dep[N], sz[N], heavy[N], top_[N], dfn[N], timer, n;
long long bit[N];

void dfs1(int u, int fa) {
    par[u] = fa; sz[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dep[v] = dep[u] + 1; dfs1(v, u); sz[u] += sz[v];
        if (sz[v] > sz[heavy[u]]) heavy[u] = v;
    }
}
void dfs2(int u, int t) {
    top_[u] = t; dfn[u] = ++timer;
    if (heavy[u]) dfs2(heavy[u], t);
    for (int v : g[u])
        if (v != par[u] && v != heavy[u]) dfs2(v, v);
}
void add(int p, long long x) { for (; p <= n; p += p & -p) bit[p] += x; }
long long sum(int p) { long long s = 0; for (; p; p -= p & -p) s += bit[p]; return s; }

long long pathSum(int u, int v) {
    long long ans = 0;
    while (top_[u] != top_[v]) {
        if (dep[top_[u]] < dep[top_[v]]) swap(u, v);
        ans += sum(dfn[u]) - sum(dfn[top_[u]] - 1);
        u = par[top_[u]];
    }
    if (dep[u] > dep[v]) swap(u, v);
    ans += sum(dfn[v]) - sum(dfn[u] - 1);
    return ans;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs1(1, 0); dfs2(1, 1);
    for (int u = 1; u <= n; u++) { long long w; cin >> w; add(dfn[u], w); }
    int m; cin >> m;
    while (m--) { int u, v; cin >> u >> v; cout << pathSum(u, v) << '\\n'; }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第1章 双指针 / 滑动窗口 ================= */
  'two-pointers': [
    {
      title: '快慢指针：移动零',
      note: '口诀：fast 扫描、非零往 slow 填，最后末尾补 0。相对顺序不变、原地完成，O(n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
int a[100005];
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    int slow = 0;                          // 写入位置
    for (int fast = 0; fast < n; fast++)
        if (a[fast] != 0) a[slow++] = a[fast];
    while (slow < n) a[slow++] = 0;        // 末尾补零

    for (int i = 0; i < n; i++)
        cout << a[i] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}
\`\`\``,
    },
  ],

  'sliding-window': [
    {
      title: '变长窗口：和 ≥ target 的最短子数组',
      note: '正数数组：右端加入，和够了就一边更新最短、一边左缩。整体 O(n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
int a[100005];
int main() {
    int n, target; cin >> n >> target;
    for (int i = 0; i < n; i++) cin >> a[i];

    int l = 0, best = n + 1;
    long long sum = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];                       // 右端扩展
        while (sum >= target) {            // 满足条件 → 左收缩取最短
            best = min(best, r - l + 1);
            sum -= a[l++];
        }
    }
    cout << (best > n ? 0 : best) << '\\n'; // 0 表示不存在
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 矩阵快速幂 / 高斯消元 ================= */
  'matrix-exponent': [
    {
      title: '固定 2×2 快速幂求斐波那契',
      note: '紧凑版：用数组而非泛型 matrix，转移矩阵 [[1,1],[1,0]]，M^n 的 [1][0] 即 F(n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;

void mul(long long A[2][2], long long B[2][2]) {
    long long C[2][2] = {0};
    for (int i = 0; i < 2; i++)
        for (int k = 0; k < 2; k++)
            for (int j = 0; j < 2; j++)
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
    memcpy(A, C, sizeof(C));
}
int main() {
    long long n; cin >> n;
    long long res[2][2] = {{1,0},{0,1}};   // 单位矩阵
    long long base[2][2] = {{1,1},{1,0}};  // 转移矩阵
    while (n) {
        if (n & 1) mul(res, base);
        mul(base, base);
        n >>= 1;
    }
    cout << res[1][0] << '\\n';             // F(n)
    return 0;
}
\`\`\``,
    },
  ],

  'gaussian-elim': [
    {
      title: '高斯-约当消元骨架',
      note: '每列选主元 → 归一化 → 消掉其余所有行；结束后末列即解。主元为 0 即无唯一解。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
double a[105][106];
const double EPS = 1e-9;
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= n; j++) cin >> a[i][j];

    for (int col = 0; col < n; col++) {
        int piv = col;                          // 选主元
        for (int r = col + 1; r < n; r++)
            if (fabs(a[r][col]) > fabs(a[piv][col])) piv = r;
        swap(a[col], a[piv]);
        if (fabs(a[col][col]) < EPS) { cout << "无唯一解"; return 0; }

        double d = a[col][col];                 // 归一化
        for (int j = col; j <= n; j++) a[col][j] /= d;
        for (int r = 0; r < n; r++) if (r != col) {  // 消其他行
            double f = a[r][col];
            for (int j = col; j <= n; j++) a[r][j] -= f * a[col][j];
        }
    }
    cout << fixed << setprecision(2);
    for (int i = 0; i < n; i++)
        cout << a[i][n] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 博弈论 SG 打表 ================= */
  'game-theory': [
    {
      title: 'SG 函数打表通用骨架（mex）',
      note: '给定合法操作集合 moves，自小到大用 mex 预处理 SG[0..n]；SG=0 即必败。换题只需改 moves。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
int sg[10005];
const int MOVES[3] = {1, 2, 3};   // 一步可取的数量，按题目修改

int main() {
    int n; cin >> n;              // 求 SG(0)~SG(n)
    sg[0] = 0;                    // 终止局面：无法操作
    for (int x = 1; x <= n; x++) {
        bool seen[16] = {false};
        for (int m : MOVES)
            if (m <= x) seen[sg[x - m]] = true;
        int g = 0;
        while (seen[g]) g++;      // mex：最小未出现
        sg[x] = g;
    }
    for (int x = 0; x <= n; x++)
        cout << "SG(" << x << ")=" << sg[x]
             << (sg[x] ? " 必胜" : " 必败") << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
