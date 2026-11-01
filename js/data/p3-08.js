/* ============================================================
   第三部分 · 第7章 图论
   shortest-path / mst
   ============================================================ */
(function () {
  const T = {};

  T['shortest-path'] = {
    chapter: '第7章 图论',
    time: '约 70 分钟',
    body: `
## 一、三大算法选型

| 算法 | 适用图 | 复杂度 | 特点 |
| --- | --- | --- | --- |
| Floyd | 任意图（边权可负），多源 | O(n³) | 代码 5 行，n≤500 |
| Dijkstra | **非负权**图，单源 | O((n+m)log n)（堆） | 最常用 |
| Bellman-Ford / SPFA | 可有负边，判负环 | O(nm) / 平均更快 | SPFA 易被卡 |

## 二、Floyd：多源最短路

动态规划：\`f[k][i][j]\` 表示只经过编号≤k 的中转点时 i 到 j 的最短路：

\`\`\`cpp
for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            f[i][j] = min(f[i][j], f[i][k] + f[k][j]);
\`\`\`

初始化：\`f[i][i]=0\`，其余 INF；直接邻接矩阵。**k 必须在最外层**。

## 三、Dijkstra（堆优化，必背）

贪心：每次确定当前距离最小的未确定点，用它松弛邻边。

\`\`\`cpp
long long dist[MAXN];
bool done[MAXN];
priority_queue<pair<long long,int>, vector<pair<long long,int>>,
               greater<pair<long long,int>>> pq;

fill(dist+1, dist+n+1, LLONG_MAX/4);
dist[s] = 0; pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (done[u]) continue;          // 懒惰删除过期记录
    done[u] = true;
    for (auto& [v, w] : g[u])
        if (dist[v] > d + w) {
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
}
\`\`\`

不能处理负权边（贪心前提失效）。

## 四、Bellman-Ford / SPFA

Bellman-Ford：对所有边松弛 n−1 轮；第 n 轮还能松弛说明有负环。

SPFA：用队列只处理距离被更新的点：

\`\`\`cpp
queue<int> q; q.push(s); inq[s]=true;
while (!q.empty()) {
    int u = q.front(); q.pop(); inq[u]=false;
    for (auto& [v,w] : g[u])
        if (dist[v] > dist[u]+w) {
            dist[v] = dist[u]+w;
            if (!inq[v]) { q.push(v); inq[v]=true; cntV[v]++;
                if (cntV[v] > n) 存在负环; }
        }
}
\`\`\`

SPFA 最坏 O(nm)，可能被网格图等卡到超时，非负权题一律 Dijkstra。

## 五、路径还原

\`pre[v]=u\` 在松弛成功时记录，终点沿 pre 回溯。

## 六、常用变形

- 边权只有 0/1：0-1 BFS（双端队列，0 边权插队首）；
- 分层图、拆点：状态增加一维表示“用了几次机会”；
- 多源最短路：所有源点初始 dist=0 一起入队（BFS/Dijkstra 均可）。
`,
    examples: [
      {
        title: 'Dijkstra 模板题',
        level: '提高',
        statement: `**题目描述**

非负权有向图，求 1 号点到所有点的最短距离，不可达输出 -1。`,
        samples: [['4 4 1\n1 2 2\n1 3 5\n2 4 3\n3 4 1', `0
2
5
5`]],
        analysis: `### 解题思路

堆优化 Dijkstra 模板。距离数组用 long long，INF 取 LLONG_MAX/4 防加法溢出。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;
struct Edge { int to; ll w; };
vector<Edge> g[100005];
ll distArr[100005];
bool done[100005];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, s; cin >> n >> m >> s;
    for (int i = 0; i < m; i++) {
        int u, v; ll w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    fill(distArr+1, distArr+n+1, INF);
    priority_queue<pair<ll,int>, vector<pair<ll,int>>,
                   greater<pair<ll,int>>> pq;
    distArr[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (done[u]) continue;
        done[u] = true;
        for (auto& e : g[u]) {
            if (distArr[e.to] > d + e.w) {
                distArr[e.to] = d + e.w;
                pq.push({distArr[e.to], e.to});
            }
        }
    }
    for (int i = 1; i <= n; i++)
        cout << (distArr[i] >= INF/2 ? -1 : distArr[i]) << '\\n';
    return 0;
}`,
      },
      {
        title: 'Floyd 求传递闭包',
        level: '基础',
        statement: `**题目描述**

n 个城市间有直达或中转航线，判断任意两城市是否可达（边权视为 1）。n≤300。`,
        samples: [['3 2\n1 2\n2 3\n2\n1 3\n3 1', `可达
不可达`]],
        analysis: `### 解题思路

布尔矩阵 f，f[i][i]=true，三重循环取“直达或经 k 中转”。这是 Floyd 的传递闭包形态。`,
        code: `#include <bits/stdc++.h>
using namespace std;
bool f[305][305];
int main() {
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) f[i][i] = true;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        f[u][v] = true;
    }
    for (int k = 1; k <= n; k++)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                f[i][j] |= f[i][k] && f[k][j];

    int q; cin >> q;
    while (q--) { int u, v; cin >> u >> v; cout << (f[u][v]?"可达":"不可达") << '\\n'; }
    return 0;
}`,
      },
      {
        title: 'SPFA 判负环',
        level: '挑战',
        statement: `**题目描述**

有向图边权可能为负，判断是否存在负权环。`,
        samples: [['4 4\n1 2 1\n2 3 1\n3 1 -3\n1 4 10', 'YES'],
                  ['3 2\n1 2 1\n2 3 -1', 'NO']],
        analysis: `### 解题思路

记录每个点入队（被成功松弛）次数，超过 n 次则存在负环；也可记录最短路边数 ≥n。要找任意负环，可把所有点初始都入队。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int to, w; };
vector<Edge> g[2005];
long long dist[2005];
int cnt[2005];
bool inq[2005];
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) { q.push(i); inq[i] = true; }
    bool negCycle = false;
    while (!q.empty()) {
        int u = q.front(); q.pop(); inq[u] = false;
        for (auto& e : g[u]) {
            if (dist[e.to] > dist[u] + e.w) {
                dist[e.to] = dist[u] + e.w;
                cnt[e.to] = cnt[u] + 1;
                if (cnt[e.to] >= n) { negCycle = true; break; }
                if (!inq[e.to]) { q.push(e.to); inq[e.to] = true; }
            }
        }
        if (negCycle) break;
    }
    cout << (negCycle ? "YES" : "NO") << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**负权图用 Dijkstra**：可能给出错误答案。`,
      `**Floyd 的 k 层位置写错**：中转点必须最外层。`,
      `**INF 太小或加法溢出**：用 LLONG_MAX/4，松弛时自动安全。`,
      `**不判 done[u]**：堆中过期记录重复处理，虽不错误但变慢。`,
      `**无向图只加一条边 / 有向图加两条边**。`,
      `**SPFA 当万能算法**：非负权图优先 Dijkstra，SPFA 可被卡。`,
    ],
    exercises: [
      { title: '单源最短路还原路径', level: '提高',
        statement: 'Dijkstra 记录 pre 并输出具体路径。',
        hint: '松弛成功时 pre[v]=u，终点回溯。' },
      { title: '经过必经点', level: '基础',
        statement: '求 s→t 且经过点 k 的最短距离。',
        hint: 'dist(s,k)+dist(k,t)，两次 Dijkstra 或 Floyd。' },
      { title: '0-1 BFS', level: '挑战',
        statement: '边权只有 0 和 1，O(n+m) 求最短路。',
        hint: 'deque：0 边 push_front，1 边 push_back。' },
      { title: '电话线路（分层思想）', level: '挑战',
        statement: '最多免费 k 条边，求最小化剩余最大边权。',
        hint: '二分答案+01判定，或 dist[i][j] 二维状态最短路。' },
    ],
    summary: `
- **Floyd** O(n³) 多源、可负边，k 中转在最外层；传递闭包是布尔形态；
- **Dijkstra** 适用非负权，堆优化 O((n+m)log n)，懒惰删除过期点；
- **Bellman-Ford/SPFA** 处理负边与负环判定，SPFA 最坏 O(nm)；
- 0/1 边用 0-1 BFS，多源把所有源点初始入队，分层图用状态维拆点。
`,
  };

  T['mst'] = {
    chapter: '第7章 图论',
    time: '约 45 分钟',
    body: `
## 一、最小生成树

连通无向带权图中，选 n−1 条边连接全部顶点且总权值最小，即**最小生成树（MST）**。

应用：修路/铺网最低成本、聚类、最小瓶颈路（MST 上路径的最大边最小）。

## 二、Kruskal（贪心 + 并查集，最常用）

1. 所有边按权升序排序；
2. 依次考察每条边：若两端不在同一集合（加入不成环），就选它并合并；
3. 选满 n−1 条结束。

\`\`\`cpp
sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });
long long total = 0;
int used = 0;
for (auto& e : edges) {
    int a = find(e.u), b = find(e.v);
    if (a == b) continue;
    fa[a] = b;
    total += e.w;
    if (++used == n - 1) break;
}
if (used < n - 1) 图不连通（生成森林）;
\`\`\`

复杂度 O(m log m)。正确性来自“割性质”：跨越任意割的最小权边一定属于某棵 MST。

## 三、Prim（点贪心，适合稠密图）

从任意点开始，维护每个点到当前生成树的最小距离：每次取距离最小的点加入，再用它更新邻点。邻接矩阵实现 O(n²)，堆优化 O(m log n)。

\`\`\`cpp
dist[1] = 0;
for (int i = 1; i <= n; i++) {
    int u = -1;
    for (int j = 1; j <= n; j++)
        if (!vis[j] && (u == -1 || dist[j] < dist[u])) u = j;
    vis[u] = true;
    ans += dist[u];
    for (int v = 1; v <= n; v++)
        if (!vis[v]) dist[v] = min(dist[v], g[u][v]);
}
\`\`\`

## 四、选型

- 稀疏图（绝大多数竞赛图）→ Kruskal；
- 稠密图 / 邻接矩阵 → Prim O(n²)；
- 图不连通时得到最小生成森林，可用并查集计数分量。

## 五、扩展

- 最大生成树：边降序（或权取负）；
- 次小生成树：MST 上替换一条边，配合倍增找路径最大边；
- 最小瓶颈路：u、v 间“最大边最小”的路径就是 MST 上的路径。
`,
    examples: [
      {
        title: '公路修建（Kruskal 模板）',
        level: '基础',
        statement: `**题目描述**

n 个城市、m 条候选公路及其造价，求连通所有城市的最小总造价；无法连通输出 -1。`,
        samples: [['4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4', '6']],
        analysis: `### 解题思路

边排序 + 并查集。选出的边依次为权 1、2、3，总造价 6（边 2-4 权 4 会成环被跳过）。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int u, v, w; };
int fa[100005];
int find(int x) { return fa[x]==x ? x : fa[x]=find(fa[x]); }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<Edge> edges(m);
    for (auto& e : edges) cin >> e.u >> e.v >> e.w;
    for (int i = 1; i <= n; i++) fa[i] = i;

    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b){ return a.w < b.w; });

    long long ans = 0;
    int used = 0;
    for (const auto& e : edges) {
        int a = find(e.u), b = find(e.v);
        if (a == b) continue;       // 会成环，跳过
        fa[a] = b;
        ans += e.w;
        if (++used == n - 1) break;
    }
    cout << (used == n - 1 ? ans : -1) << '\\n';
    return 0;
}`,
      },
      {
        title: 'Prim 稠密图模板',
        level: '提高',
        statement: `**题目描述**

完全图 n≤5000，邻接矩阵给出边权，求 MST 权值和。`,
        samples: [['4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4', '6']],
        analysis: `### 解题思路

n 大但 m≈n²，Kruskal 排序 1.25×10⁸ 条边不现实。O(n²) 的 Prim 正好适用。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const long long INF = LLONG_MAX/4;
long long g[5005][5005], distArr[5005];
bool vis[5005];
int main() {
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) g[i][j] = INF;
    for (int i = 0; i < m; i++) {
        int u, v; long long w; cin >> u >> v >> w;
        g[u][v] = g[v][u] = min(g[u][v], w);
    }
    fill(distArr+1, distArr+n+1, INF);
    distArr[1] = 0;
    long long ans = 0;
    for (int i = 1; i <= n; i++) {
        int u = -1;
        for (int j = 1; j <= n; j++)
            if (!vis[j] && (u == -1 || distArr[j] < distArr[u])) u = j;
        vis[u] = true;
        ans += distArr[u];
        for (int v = 1; v <= n; v++)
            if (!vis[v]) distArr[v] = min(distArr[v], g[u][v]);
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**边没排序就跑 Kruskal**：贪心前提是从小到大。`,
      `**不用并查集判环**：暴力 DFS 每条边判环会 TLE。`,
      `**图不连通当成功**：检查选出边数是否为 n−1。`,
      `**总权用 int**：n×w 可达 10¹⁴，用 long long。`,
      `**Prim 初值 INF 不够大或自环处理**：dist[起点]=0，其余 INF。`,
    ],
    exercises: [
      { title: '最大生成树', level: '基础',
        statement: '把 Kruskal 改为求最大总权。',
        hint: '边降序排序。' },
      { title: '连通后还剩几条边可加', level: '基础',
        statement: '求图的连通分量与每分量内 MST。',
        hint: '并查集最终根的数量。' },
      { title: '最小瓶颈路', level: '挑战',
        statement: '多次询问 u 到 v 路径上最小化“最大边权”。',
        hint: '先建 MST，再用倍增求树上路径最大边。' },
      { title: '新修道路（次优代价）', level: '挑战',
        statement: '在必须包含某条边的条件下求最小生成树权值。',
        hint: '先强制合并该边两端，再在其余边跑 Kruskal。' },
    ],
    summary: `
- MST 用 n−1 条边连通全部点且总权最小；
- **Kruskal**：边排序 + 并查集，O(m log m)，稀疏图首选；
- **Prim**：维护点到树的最小距离，O(n²) 适合稠密矩阵图，堆优化 O(m log n)；
- 不连通得到生成森林；最大生成树改排序方向；MST 还解决最小瓶颈路等问题。
`,
  };

  Object.assign(window.TOPICS, T);
})();
