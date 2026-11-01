/* ============================================================
   真题与经典名题精讲 · 第三部分 第二批 8 题
   ============================================================ */
(function () {
  const R = {

  /* ---- graph-traversal：查找文献（DFS/BFS 序） ---- */
  'graph-traversal': {
    source: '洛谷 P5318【深基18.例3】查找文献',
    title: '查找文献（DFS / BFS 遍历顺序）',
    level: '基础',
    statement: `**题目描述**

给定 n 篇文献及引用关系（有向边 u→v），文献 1 引用了哪些文献就能找到更多文献。
从文献 1 出发，分别输出深度优先和广度优先遍历的文献编号。`,
    input: '第一行 n m；m 行 u v。',
    output: '两行：DFS 序、BFS 序。',
    samples: [['5 5\n1 2\n1 3\n2 4\n3 4\n3 5', `1 2 4 3 5\n1 2 3 4 5`]],
    analysis: `### 解题思路

为保证顺序唯一，先把每个点的邻接表按编号升序排序；DFS 递归深入、BFS 用队列按层扩展。`,
    code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
bool vis[100005];
vector<int> order;

void dfs(int u) {
    vis[u] = true;
    order.push_back(u);
    for (int v : g[u]) if (!vis[v]) dfs(v);
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }
    for (int i = 1; i <= n; i++) sort(g[i].begin(), g[i].end());

    dfs(1);
    for (int i = 0; i < n; i++) cout << order[i] << (i+1==n?'\\n':' ');

    order.clear();
    queue<int> q; q.push(1);
    memset(vis, false, sizeof(vis)); vis[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u]) if (!vis[v]) { vis[v] = true; q.push(v); }
    }
    for (int i = 0; i < n; i++) cout << order[i] << (i+1==n?'\\n':' ');
    return 0;
}`,
  },

  /* ---- topo-sort：最大食物链计数 ---- */
  'topo-sort': {
    source: '洛谷 P4017 最大食物链计数',
    title: '最大食物链计数（拓扑 + DP）',
    level: '挑战',
    statement: `**题目描述**

给出 n 种生物及 m 条吃与被吃关系（有向边 被吃者→吃它者）。生产者（入度 0）是食物链起点，
最高级消费者（出度 0）是终点。求一共有多少条最大食物链，对 80112002 取模。`,
    input: '第一行 n m；m 行 u v。',
    output: '一个整数：最大食物链条数。',
    samples: [['5 7\n1 2\n1 3\n2 3\n2 4\n3 4\n3 5\n4 5', '5']],
    analysis: `### 解题思路

拓扑序上做 DP：\`ways[u]\` 表示从任意生产者走到 u 的食物链数。
生产者 ways=1；每条边 u→v 累加 \`ways[v] += ways[u]\`。
最后答案为所有出度 0 的生物 ways 之和。`,
    code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[5005];
queue<int> q;
int indeg[5005], outdeg[5005];
long long ways[5005];
const long long MOD = 80112002;
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        indeg[v]++; outdeg[u]++;
    }
    for (int i = 1; i <= n; i++)
        if (indeg[i] == 0) { ways[i] = 1; q.push(i); }

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) {
            ways[v] = (ways[v] + ways[u]) % MOD;
            if (--indeg[v] == 0) q.push(v);
        }
    }
    long long ans = 0;
    for (int i = 1; i <= n; i++)
        if (outdeg[i] == 0) ans = (ans + ways[i]) % MOD;
    cout << ans << '\\n';
    return 0;
}`,
  },

  /* ---- shortest-path：Dijkstra 标准版 ---- */
  'shortest-path': {
    source: '洛谷 P4779【模板】单源最短路径（标准版）',
    title: '单源最短路径（堆优化 Dijkstra）',
    level: '提高',
    statement: `**题目描述**

给定 n 个点 m 条有向非负带权边，求源点 s 到各点的最短距离；不可达输出 2147483647。`,
    input: '第一行 n m s；m 行 u v w。',
    output: '一行 n 个距离。',
    samples: [['4 4 1\n1 2 2\n1 3 5\n2 3 1\n3 4 6', '0 2 3 9']],
    analysis: `### 解题思路

Dijkstra：维护未确定点的距离，每次用堆取距离最小的点确定，
再松弛它的出边（边权非负）。已确定的点再次从堆中取出时跳过。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const long long INF = 2147483647;
vector<pair<int,int>> g[100005];
long long dist[100005];
int main() {
    int n, m, s; cin >> n >> m >> s;
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    fill(dist, dist + n + 1, INF);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    dist[s] = 0; pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;
        for (auto [v, w] : g[u])
            if (dist[v] > d + w) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
    }
    for (int i = 1; i <= n; i++)
        cout << dist[i] << (i==n?'\\n':' ');
    return 0;
}`,
  },

  /* ---- tree-dp：没有上司的舞会 ---- */
  'tree-dp': {
    source: '洛谷 P1352 没有上司的舞会',
    title: '没有上司的舞会（树形 DP）',
    level: '提高',
    statement: `**题目描述**

某大学有 n 名职员，校长是最高上司，形成一棵树。每个职员有一个快乐值。
舞会要求：**不能同时邀请某职员和他的直接上司**。求受邀职员快乐值之和的最大值。`,
    input: '第一行 n；n 行第 i 名职员快乐值；n−1 行 l k（l 的上司是 k）。',
    output: '一个整数：最大快乐值。',
    samples: [['3\n1\n1\n1\n2 1\n3 1', '2']],
    analysis: `### 解题思路

树形 DP：\`dp[u][0/1]\` 表示以 u 为根的子树，u 不参加/参加时的最大快乐值。
- u 参加：所有孩子必须不参加，\`dp[u][1] = happy[u] + Σ dp[v][0]\`；
- u 不参加：孩子可选可不选，\`dp[u][0] = Σ max(dp[v][0],dp[v][1])\`。
答案在根处取两者较大。`,
    code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[6005];
int happy[6005];
long long dp[6005][2];

void dfs(int u) {
    dp[u][1] = happy[u];
    for (int v : g[u]) {
        dfs(v);
        dp[u][0] += max(dp[v][0], dp[v][1]);
        dp[u][1] += dp[v][0];
    }
}
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> happy[i];

    vector<bool> hasFather(n+1, false);
    for (int i = 0; i < n-1; i++) {
        int l, k; cin >> l >> k;
        g[k].push_back(l); hasFather[l] = true;
    }
    int root = 1;
    while (hasFather[root]) root++;
    dfs(root);
    cout << max(dp[root][0], dp[root][1]) << '\\n';
    return 0;
}`,
  },

  /* ---- number-theory：乘法逆元 ---- */
  'number-theory': {
    source: '洛谷 P3811【模板】乘法逆元',
    title: '乘法逆元（线性递推）',
    level: '提高',
    statement: `**题目描述**

给定 n 和质数 p，求 1~n 中每个整数在模 p 意义下的乘法逆元，逐行输出。`,
    input: '一行 n p。',
    output: 'n 行，第 i 行 i 的逆元。',
    samples: [['3 7', '1\n4\n5']],
    analysis: `### 解题思路

线性公式：\`inv[i] = p − (p/i) × inv[p mod i] mod p\`，
初始 \`inv[1]=1\`。比逐个快速幂更快，O(n)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
long long inv[3000005];
int main() {
    int n; long long p; cin >> n >> p;
    inv[1] = 1;
    cout << inv[1] << '\\n';
    for (int i = 2; i <= n; i++) {
        inv[i] = p - (p / i) * inv[p % i] % p;
        cout << inv[i] << '\\n';
    }
    return 0;
}`,
  },

  /* ---- st-table：ST 表 ---- */
  'st-table': {
    source: '洛谷 P3865【模板】ST 表',
    title: 'ST 表（静态区间最大值）',
    level: '基础',
    statement: `**题目描述**

给定长度为 n 的静态数列和 m 个询问，每次回答区间 [l,r] 的最大值。`,
    input: '第一行 n m；第二行 n 个数；m 行 l r。',
    output: '每行一个最大值。',
    samples: [['5 2\n1 5 3 4 2\n1 3\n2 5', '5\n5']],
    analysis: `### 解题思路

ST 表预处理：\`f[k][i]\` 表示从 i 起长度 2ᵏ 的区间最大值，
\`f[k][i]=max(f[k−1][i],f[k−1][i+2ᵏ⁻¹])\`。查询取覆盖区间的两段（可重叠），O(1)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005, LOG = 18;
int f[LOG][N], lg[N];
int main() {
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> f[0][i];

    lg[1] = 0;
    for (int i = 2; i <= n; i++) lg[i] = lg[i/2] + 1;
    for (int k = 1; k < LOG; k++)
        for (int i = 1; i + (1<<k) - 1 <= n; i++)
            f[k][i] = max(f[k-1][i], f[k-1][i + (1<<(k-1))]);

    while (m--) {
        int l, r; cin >> l >> r;
        int k = lg[r-l+1];
        cout << max(f[k][l], f[k][r-(1<<k)+1]) << '\\n';
    }
    return 0;
}`,
  },

  /* ---- network-flow：网络最大流 ---- */
  'network-flow': {
    source: '洛谷 P3376【模板】网络最大流',
    title: '网络最大流（Dinic）',
    level: '挑战',
    statement: `**题目描述**

给定 n 个点 m 条有向带权边的网络、源点 s、汇点 t，求 s 到 t 的最大流。
可能出现重边。`,
    input: '第一行 n m s t；m 行 u v w。',
    output: '一个整数：最大流。',
    samples: [['4 5 4 3\n4 2 30\n4 3 20\n2 3 20\n2 1 30\n1 3 40', '50']],
    analysis: `### 解题思路

Dinic：BFS 建分层图，DFS 只沿层数 +1 的边增广并用当前弧优化，
重复直到 BFS 无法到达汇点。反向边用于"反悔"，重边容量累加。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 10005;
struct Edge { int to; long long cap; int rev; };
vector<Edge> g[N];
int level[N], cur[N];

void addEdge(int u, int v, long long c) {
    g[u].push_back({v, c, (int)g[v].size()});
    g[v].push_back({u, 0, (int)g[u].size()-1});
}
bool bfs(int s, int t) {
    memset(level, -1, sizeof(level));
    queue<int> q; q.push(s); level[s] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (const Edge &e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u]+1; q.push(e.to);
            }
    }
    return level[t] != -1;
}
long long dfs(int u, int t, long long f) {
    if (u == t) return f;
    for (int &i = cur[u]; i < (int)g[u].size(); i++) {
        Edge &e = g[u][i];
        if (e.cap>0 && level[e.to]==level[u]+1) {
            long long d = dfs(e.to, t, min(f, e.cap));
            if (d) {
                e.cap -= d;
                g[e.to][e.rev].cap += d;
                return d;
            }
        }
    }
    return 0;
}
int main() {
    int n, m, s, t; cin >> n >> m >> s >> t;
    for (int i = 0; i < m; i++) {
        int u, v; long long c; cin >> u >> v >> c;
        addEdge(u, v, c);
    }
    long long flow = 0;
    while (bfs(s, t)) {
        memset(cur, 0, sizeof(cur));
        while (long long f = dfs(s, t, LLONG_MAX)) flow += f;
    }
    cout << flow << '\\n';
    return 0;
}`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
