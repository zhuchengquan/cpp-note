/* ============================================================
   第三部分 · 第7章 图论
   graph-store / graph-traversal / topo-sort
   ============================================================ */
(function () {
  const T = {};

  T['graph-store'] = {
    chapter: '第7章 图论',
    time: '约 40 分钟',
    body: `
## 一、图的基本概念

图 G=(V,E)：顶点集 V 与边集 E。

- **有向图 / 无向图**：无向边视为两条方向相反的有向边；
- **度**：无向图中关联边数；有向图分入度、出度；
- 路径、环、连通（任意两点可达）、连通分量；
- 稀疏图（m 与 n 同量级）/ 稠密图（m 接近 n²）。

## 二、三种存储方式

### 1. 邻接矩阵

\`int g[MAXN][MAXN]\`，\`g[u][v] = w\`，无边用 0 或 INF。

- 查边 O(1)；空间 O(n²)，只适合 n≤5000 的稠密图；
- 重边通常取 min（最短路）或累加（网络流按题意）。

### 2. vector 邻接表（最常用）

\`\`\`cpp
struct Edge { int to, w; };
vector<Edge> g[MAXN];
g[u].push_back({v, w});
if (无向) g[v].push_back({u, w});

for (auto& e : g[u]) { int v = e.to, w = e.w; }
\`\`\`

空间 O(n+m)，遍历一个点的所有出边就是它的度数开销，适合绝大多数题。

### 3. 链式前向星

\`\`\`cpp
int head[MAXN], to[MAXE], w[MAXE], nxt[MAXE], cnt = 0;
memset(head, -1, sizeof(head));
void addEdge(int u, int v, int weight) {
    to[cnt]=v; w[cnt]=weight; nxt[cnt]=head[u]; head[u]=cnt++;
}
\`\`\`

无向图边数组开 **2m**；常数极小，适合极限数据与网络流。

## 三、选型

| 情况 | 选择 |
| --- | --- |
| n≤5000、需要频繁判断两点是否有边 | 邻接矩阵 |
| 一般图、图算法 | vector 邻接表 |
| 极限常数优化、网络流 | 链式前向星 |
`,
    examples: [
      {
        title: '邻接表建图与度数统计',
        level: '基础',
        statement: `**题目描述**

n 个点 m 条无向边，输出每个点的度以及它的所有邻接点。`,
        samples: [['4 3\n1 2\n1 3\n2 4', `点1(度2): 2 3
点2(度2): 1 4
点3(度1): 1
点4(度1): 2`]],
        analysis: `### 解题思路

每条无向边在两端各 push 一次。度数即 vector 的 size。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    for (int u = 1; u <= n; u++) {
        cout << "点" << u << "(度" << g[u].size() << "):";
        for (int v : g[u]) cout << " " << v;
        cout << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '链式前向星存带权有向图',
        level: '基础',
        statement: `**题目描述**

n 个景点、m 条单行道，第 i 条路 u→v 长 w 千米。请用**链式前向星**存图，并输出从每个景点出发能直接到达的景点与路程。`,
        samples: [['4 3\n1 2 5\n1 3 10\n2 4 3', `点1: ->3(10km) ->2(5km)
点2: ->4(3km)
点3:
点4:`]],
        analysis: `### 解题思路

链式前向星用“**头插法**”：每条新边插在该点边链表最前面，所以同一点的出边输出顺序与输入顺序**相反**（输入 1→2 再 1→3，输出先 3 后 2）。

- \`head[u]\` 是 u 的第一条边编号，初始 -1 表示无边；
- \`nxt[e]\` 指向同一点的下一条边；遍历时沿 nxt 走到 -1；
- 有向图只 add 一次；无向图要 add 两次（u→v 和 v→u），边数组容量开 2m。`,
        code: `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005, MAXE = 200005;
int head[MAXN], to[MAXE], w[MAXE], nxt[MAXE], edgeCnt = 0;

void addEdge(int u, int v, int weight) {
    to[edgeCnt] = v;
    w[edgeCnt] = weight;
    nxt[edgeCnt] = head[u];   // 新边的 next 指向原来的第一条边
    head[u] = edgeCnt++;      // 头指针移到新边（头插法）
}

int main() {
    memset(head, -1, sizeof(head));
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v, weight;
        cin >> u >> v >> weight;
        addEdge(u, v, weight);   // 有向图只加一次
    }
    for (int u = 1; u <= n; u++) {
        cout << "点" << u << ":";
        for (int e = head[u]; e != -1; e = nxt[e])
            cout << " ->" << to[e] << "(" << w[e] << "km)";
        cout << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '邻接矩阵：O(1) 直达查询',
        level: '基础',
        statement: `**题目描述**

n 个城市之间有 m 条直达航线（有向）。有 q 个询问，每次问城市 u 到城市 v 有没有**直达**航班。n≤1000。`,
        samples: [['4 3\n1 2\n1 3\n2 4\n3\n1 3\n2 3\n4 1', `YES
NO
NO`]],
        analysis: `### 解题思路

大量询问“两点间有没有直接边”时，邻接矩阵让每次查询 O(1)：用 bool 矩阵 \`g[u][v]\` 标记。

- n≤1000 时矩阵 10⁶ 个 bool 仅约 1MB；
- n 若到 10⁵，矩阵就放不下（需要 10¹⁰ 个格子），那时改用哈希 set 或邻接表；
- 重边对 bool 矩阵无影响（反复置 true）；若要**统计重边条数**，把 bool 改成 int 累加。`,
        code: `#include <bits/stdc++.h>
using namespace std;

bool g[1005][1005];   // g[u][v]=true 表示 u 到 v 有直达边

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u][v] = true;
    }
    int q; cin >> q;
    while (q--) {
        int u, v; cin >> u >> v;
        cout << (g[u][v] ? "YES" : "NO") << '\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**无向图只加一条边**：邻接表/前向星都要加两次。`,
      `**边数组开 m 而不是 2m**：链式前向星无向图必开 2m 以上。`,
      `**head 忘记初始化为 -1**。`,
      `**n=10⁵ 开邻接矩阵**：10¹⁰ 个 int 直接爆内存。`,
      `**重边自环不处理**：按题意决定保留、合并或忽略。`,
    ],
    exercises: [
      { title: '有向图出入度', level: '基础',
        statement: '输出每个点的入度与出度。',
        hint: '边 u→v：u 出度+1，v 入度+1。' },
      { title: '矩阵转邻接表', level: '基础',
        statement: '输入邻接矩阵，输出邻接表形式。',
        hint: '枚举非零项 push。' },
      { title: '重边计数', level: '提高',
        statement: '统计无向图中两个方向重复出现的边数。',
        hint: 'map<pair,int> 或排序后 unique。' },
    ],
    summary: `
- 图分有向/无向、稀疏/稠密；度、连通分量是基础概念；
- **邻接矩阵** O(1) 查边但 O(n²) 空间；**vector 邻接表** O(n+m) 最常用；**链式前向星**常数最小；
- 无向图存储时边要加两次，前向星数组容量 2m。
`,
  };

  T['graph-traversal'] = {
    chapter: '第7章 图论',
    time: '约 45 分钟',
    body: `
## 一、DFS 遍历

从某点出发，沿边深入，访问过的点标记：

\`\`\`cpp
vector<int> g[MAXN];
bool vis[MAXN];
void dfs(int u) {
    vis[u] = true;
    for (int v : g[u])
        if (!vis[v]) dfs(v);
}
\`\`\`

用途：连通性/连通块计数、判环、拓扑关系（配合时间戳）、Tarjan 算法基础。

## 二、BFS 遍历

队列实现，按距离层次扩展（模板与迷宫 BFS 相同，邻居从四方向变成邻接表）。

## 三、连通块计数

\`\`\`cpp
int components = 0;
for (int i = 1; i <= n; i++)
    if (!vis[i]) { components++; dfs(i); }
\`\`\`

## 四、无向图判环

DFS 中遇到“已访问且不是父亲”的邻点即存在环（等价地，连通图 m≥n 也可快速判断）。

有向图判环要看**回边**：用三色标记（0 未访问、1 在递归栈中、2 已完成），遇到 1 状态的点就是环。

## 五、二分图染色（预告）

DFS/BFS 黑白二染色，相邻点必须异色；冲突则不是二分图（本章后面细讲）。
`,
    examples: [
      {
        title: '连通块计数',
        level: '基础',
        statement: `**题目描述**

无向图 n 点 m 边，求连通分量个数。n,m≤10⁵。`,
        samples: [['6 4\n1 2\n2 3\n4 5\n5 6', '2']],
        analysis: `### 解题思路

每个未访问点启动一次 DFS，启动次数即连通分量数。注意递归深度可能接近 n，必要时用 BFS 或扩栈。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
bool vis[100005];

void dfs(int u) {
    vis[u] = true;
    for (int v : g[u])
        if (!vis[v]) dfs(v);
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    int cnt = 0;
    for (int i = 1; i <= n; i++)
        if (!vis[i]) { cnt++; dfs(i); }
    cout << cnt << '\\n';
    return 0;
}`,
      },
      {
        title: '有向图判环（三色 DFS）',
        level: '提高',
        statement: `**题目描述**

判断有向图中是否存在环。`,
        samples: [['3 3\n1 2\n2 3\n3 1', 'YES']],
        analysis: `### 解题思路

状态 1 表示在当前递归路径上；搜索到状态 1 的邻点说明沿路径走回了自己，存在环。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int state[100005];   // 0未访问 1递归栈中 2完成
bool cycle;

void dfs(int u) {
    state[u] = 1;
    for (int v : g[u]) {
        if (state[v] == 0) dfs(v);
        else if (state[v] == 1) cycle = true;
    }
    state[u] = 2;
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }
    for (int i = 1; i <= n; i++)
        if (state[i] == 0) dfs(i);
    cout << (cycle ? "YES" : "NO") << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**DFS 不标记起点**：进入函数先 vis[u]=true。`,
      `**无向图把父亲当环**：判环要排除 fa。`,
      `**有向图用二值 visited 判环**：已访问不代表在当前路径，必须三色。`,
      `**递归过深爆栈**：n=10⁵ 的链形图考虑 BFS 或扩栈选项。`,
    ],
    exercises: [
      { title: '最大连通块', level: '基础',
        statement: '求最大连通分量的点数。',
        hint: '每次 DFS 计数取最大。' },
      { title: '迷宫连通数', level: '基础',
        statement: '网格地图中四方向连通区域计数。',
        hint: '本质是隐式图遍历。' },
      { title: '朋友圈传递', level: '提高',
        statement: '朋友关系可传递，求集合数（并查集与 DFS 两种写法）。',
        hint: '连通块计数。' },
    ],
    summary: `
- 图上 DFS 沿边深入、BFS 按层扩展，visited 是共同核心；
- 连通块计数 = 启动搜索的次数；
- 无向图判环排除父亲，有向图判环用**三色标记**看递归栈；
- 搜索是 Tarjan、拓扑、二分图等一切图算法的基础。
`,
  };

  T['topo-sort'] = {
    chapter: '第7章 图论',
    time: '约 40 分钟',
    body: `
## 一、DAG 与拓扑序

**DAG**：有向无环图。拓扑排序把顶点排成序列，使每条边 u→v 中 u 都出现在 v 前面。

应用：任务先后关系、课程安排、编译依赖、DAG 上 DP 的计算顺序。

## 二、Kahn 算法（入度法，必背）

1. 计算每个点入度，把入度为 0 的点入队；
2. 每次取出一个点加入答案，删除它的所有出边（邻点入度 -1），邻点入度变 0 就入队；
3. 答案点数 < n 说明有环。

\`\`\`cpp
queue<int> q;
for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : g[u])
        if (--indeg[v] == 0) q.push(v);
}
if ((int)order.size() < n) cout << "有环";
\`\`\`

用优先队列替换普通队列，可在多个 0 入度点中取编号最小者（字典序拓扑序）。

## 三、DFS 法拓扑序

DFS 结束时把点压入列表，最后整体反转即得拓扑序；搜索中若遇到递归栈中的点即有环。

## 四、DAG 上 DP

拓扑序保证处理 u 时其所有前驱已算完：

\`\`\`cpp
// 最长路（如关键路径）
for (int u : order)
    for (int v : g[u])
        dist[v] = max(dist[v], dist[u] + w(u,v));
\`\`\`
`,
    examples: [
      {
        title: '任务排序（模板）',
        level: '基础',
        statement: `**题目描述**

n 项任务、m 个先后关系 u→v，输出任意一种合法完成顺序；若有环输出 -1。`,
        samples: [['4 3\n1 2\n1 3\n3 4', '1 2 3 4']],
        analysis: `### 解题思路

Kahn 模板。输出序列不唯一时任意合法即可。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int indeg[100005];
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        indeg[v]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++)
        if (indeg[i] == 0) q.push(i);

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u])
            if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() < n) { cout << -1 << '\\n'; return 0; }
    for (int i = 0; i < n; i++) cout << order[i] << (i+1==n?'\\n':' ');
    return 0;
}`,
      },
      {
        title: '关键路径（DAG 最长路）',
        level: '挑战',
        statement: `**题目描述**

DAG 上带权边表示工序耗时，求从开工到完工的最短总工期（关键路径长度）。`,
        samples: [['4 4\n1 2 3\n1 3 5\n2 4 6\n3 4 3', '9']],
        analysis: `### 解题思路

拓扑序上做 DP：dist[v]=max(dist[v], dist[u]+w)。DAG 上最长路没有正环问题，可直接做；一般图的最长路是 NP 难问题。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int to, w; };
vector<Edge> g[100005];
int indeg[100005], dist[100005];
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({v, w});
        indeg[v]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);
    int ans = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        ans = max(ans, dist[u]);
        for (auto& e : g[u]) {
            dist[e.to] = max(dist[e.to], dist[u] + e.w);
            if (--indeg[e.to] == 0) q.push(e.to);
        }
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**有环时不处理**：输出前检查 order.size() 是否等于 n。`,
      `**入度减错对象**：删 u 的出边影响的是 v 的入度。`,
      `**要求字典序用普通队列**：应使用 priority_queue（小根堆）。`,
      `**在一般图上求最长路**：只有 DAG 才能拓扑 DP。`,
    ],
    exercises: [
      { title: '字典序最小拓扑序', level: '基础',
        statement: '在多种拓扑序中输出字典序最小的。',
        hint: 'priority_queue<int,vector<int>,greater<int>>。' },
      { title: '族谱层数', level: '提高',
        statement: '给定 DAG 继承关系，求每个点的最早代际。',
        hint: '拓扑 DP：dp[v]=max(dp[v],dp[u]+1)。' },
      { title: '判断是否唯一拓扑序', level: '提高',
        statement: '拓扑序唯一当且仅当每一步队列中至多一个点。',
        hint: 'Kahn 中检查 q.size()。' },
    ],
    summary: `
- 拓扑排序面向 DAG：所有边从前指向后；**Kahn 入度法**用队列不断取出 0 入度点；
- 取不完 n 个点即有环；要字典序改用小根堆；
- DFS 法在回溯时记录再反转；
- 拓扑序是 DAG 上 DP（最长路/关键路径、方案计数）的天然计算顺序。
`,
  };

  Object.assign(window.TOPICS, T);
})();
