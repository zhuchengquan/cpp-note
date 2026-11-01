/* ============================================================
   第三部分 · 第12章 字符串与网络流
   network-flow
   ============================================================ */
(function () {
  const T = {};

  T['network-flow'] = {
    chapter: '第12章 字符串与网络流',
    time: '约 65 分钟',
    body: `
## 一、网络与流

有向图中每条边有**容量 c**。源点 s 出水、汇点 t 收水，流量守恒（中间点流入=流出），求 s 到 t 的最大流量。

关键概念：**残量网络**——每条边剩余容量 c-f；反向边记录“可退流”，初始残量为 0，增流时同步更新。

## 二、增广路思想（Ford-Fulkerson）

只要残量网络中还存在 s→t 的路径（增广路），就沿它推送流量；找不到时当前流即最大流（最大流最小割定理）。朴素 DFS 增广可能极慢。

## 三、Dinic 算法（竞赛标配）

两个优化：

1. **BFS 分层**：只保留从 s 出发层数递增的边，构建分层图；
2. **DFS 多路增广**：在分层图上一次 DFS 推送尽可能多的流，用当前弧优化避免重复扫描。

重复“分层 → 阻塞流”直到 BFS 到不了 t。

\`\`\`cpp
struct Edge { int to, rev; long long cap; };
vector<vector<Edge>> g;

void addEdge(int u, int v, long long cap) {
    g[u].push_back({v, (int)g[v].size(), cap});
    g[v].push_back({u, (int)g[u].size()-1, 0});  // 反向边容量 0
}

bool bfs(int s, int t, vector<int>& level) {
    fill(level.begin(), level.end(), -1);
    queue<int> q; level[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
    }
    return level[t] != -1;
}

long long dfs(int u, int t, long long pushed, vector<int>& it, vector<int>& level) {
    if (u == t) return pushed;
    for (int& i = it[u]; i < (int)g[u].size(); i++) {
        Edge& e = g[u][i];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {
            long long tr = dfs(e.to, t, min(pushed, e.cap), it, level);
            if (tr > 0) {
                e.cap -= tr;
                g[e.to][e.rev].cap += tr;
                return tr;
            }
        }
    }
    return 0;
}

long long maxFlow(int s, int t, int n) {
    long long flow = 0;
    vector<int> level(n), it(n);
    while (bfs(s, t, level)) {
        fill(it.begin(), it.end(), 0);
        while (long long f = dfs(s, t, LLONG_MAX, it, level)) flow += f;
    }
    return flow;
}
\`\`\`

## 四、最大流最小割定理

最大流 = 最小割容量。割是把顶点分成 S、T 两侧（s∈S,t∈T），割容量为所有从 S 指向 T 的边容量之和。

因此“最少切断哪些边使 s、t 不连通”直接求最大流。

## 五、二分图最大匹配建模

源点→左部（容量1）、匹配边（容量1）、右部→汇点（容量1），最大流即最大匹配，也能用 Dinic 解，且可推广到**带权/容量限制匹配**。

## 六、常见建模技巧

- 多源多汇：超级源点/超级汇点；
- 点容量限制：拆点，入点→出点之间加容量边；
- 无向边：加两条容量相同的有向边（等价于正反各 addEdge 容量 c 的处理）；
- 费用问题用最小费用最大流（在残量网络上跑最短路，进阶）。
`,
    examples: [
      {
        title: '最大流模板',
        level: '挑战',
        statement: `**题目描述**

给定容量网络 n 点 m 边、源点 1、汇点 n，求最大流。`,
        samples: [['4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3', '5']],
        analysis: `### 解题思路

Dinic 标准模板。注意反向边 rev 下标的互相引用，以及 long long 容量。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
struct Edge { int to, rev; ll cap; };
vector<vector<Edge>> g;

void addEdge(int u, int v, ll cap) {
    g[u].push_back({v, (int)g[v].size(), cap});
    g[v].push_back({u, (int)g[u].size()-1, 0});
}
bool bfs(int s, int t, vector<int>& level) {
    fill(level.begin(), level.end(), -1);
    queue<int> q; level[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u]+1;
                q.push(e.to);
            }
    }
    return level[t] != -1;
}
ll dfs(int u, int t, ll pushed, vector<int>& it, vector<int>& level) {
    if (u == t) return pushed;
    for (int& i = it[u]; i < (int)g[u].size(); i++) {
        Edge& e = g[u][i];
        if (e.cap > 0 && level[e.to] == level[u]+1) {
            ll tr = dfs(e.to, t, min(pushed, e.cap), it, level);
            if (tr > 0) { e.cap -= tr; g[e.to][e.rev].cap += tr; return tr; }
        }
    }
    return 0;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    g.assign(n+1, {});
    for (int i = 0; i < m; i++) {
        int u, v; ll c; cin >> u >> v >> c;
        addEdge(u, v, c);
    }
    ll flow = 0;
    vector<int> level(n+1), it(n+1);
    while (bfs(1, n, level)) {
        fill(it.begin(), it.end(), 0);
        while (ll f = dfs(1, n, LLONG_MAX, it, level)) flow += f;
    }
    cout << flow << '\\n';
    return 0;
}`,
      },
      {
        title: '最小割：切断道路',
        level: '挑战',
        statement: `**题目描述**

无向图中使 s、t 不连通，最少切断容量为多少？`,
        samples: [['4 5 1 4\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3', '5']],
        analysis: `### 解题思路

最大流最小割定理：无向边按双向容量加入 Dinic，答案即最大流。

与上题唯一的建模区别：每条无向边调用两次 \`addEdge\`（u→v 与 v→u 各给容量 c），
相当于两个方向都能"正向"输送 c 的流量。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
struct Edge { int to, rev; ll cap; };
vector<vector<Edge>> g;

void addEdge(int u, int v, ll cap) {
    g[u].push_back({v, (int)g[v].size(), cap});
    g[v].push_back({u, (int)g[u].size()-1, 0});
}
bool bfs(int s, int t, vector<int>& level) {
    fill(level.begin(), level.end(), -1);
    queue<int> q; level[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
    }
    return level[t] != -1;
}
ll dfs(int u, int t, ll pushed, vector<int>& it, vector<int>& level) {
    if (u == t) return pushed;
    for (int& i = it[u]; i < (int)g[u].size(); i++) {
        Edge& e = g[u][i];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {
            ll tr = dfs(e.to, t, min(pushed, e.cap), it, level);
            if (tr > 0) { e.cap -= tr; g[e.to][e.rev].cap += tr; return tr; }
        }
    }
    return 0;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, s, t; cin >> n >> m >> s >> t;
    g.assign(n+1, {});
    for (int i = 0; i < m; i++) {
        int u, v; ll c; cin >> u >> v >> c;
        addEdge(u, v, c);   // 无向边：两个方向各给容量 c
        addEdge(v, u, c);
    }
    ll flow = 0;
    vector<int> level(n+1), it(n+1);
    while (bfs(s, t, level)) {
        fill(it.begin(), it.end(), 0);
        while (ll f = dfs(s, t, LLONG_MAX, it, level)) flow += f;
    }
    cout << flow << '\\n';   // 最大流 = 最小割
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**反向边容量初始不为 0 / 忘更新**：增流必须同时给反向边加回容量。`,
      `**rev 下标引用错误**：加边时两条边互相指向，严格按模板。`,
      `**DFS 不带当前弧优化**：重复扫描导致 TLE。`,
      `**容量用 int**：多路径流量总和可能超 int，用 long long。`,
      `**点容量直接建边**：点权限制必须拆点。`,
    ],
    exercises: [
      { title: '二分图最大匹配（网络流版）', level: '提高',
        statement: '用 Dinic 重做匈牙利算法的匹配题。',
        hint: 's→左1→右→t 全容量 1。' },
      { title: '多源点供水', level: '挑战',
        statement: '多个水源、多个城市，求总供水上限。',
        hint: '超级源连水源、城市连超级汇。' },
      { title: '点容量最大流', level: '挑战',
        statement: '每个中转点有通过流量上限。',
        hint: '拆点 in→out 容量为限制值。' },
    ],
    summary: `
- 网络流在容量约束与流守恒下求 s→t 最大流，基于残量网络与增广路；
- **Dinic = BFS 分层 + DFS 当前弧多路增广**，是竞赛标准实现；
- 最大流=最小割；二分图匹配、最小切断都可直接建模为最大流；
- 常用技巧：超级源汇、点容量拆点、无向边双向容量；费用问题进阶为最小费用最大流。
`,
  };

  Object.assign(window.TOPICS, T);
})();
