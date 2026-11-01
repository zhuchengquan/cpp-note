/* ============================================================
   第三部分 · 第7章 图论
   tarjan / bipartite
   ============================================================ */
(function () {
  const T = {};

  T['tarjan'] = {
    chapter: '第7章 图论',
    time: '约 70 分钟',
    body: `
## 一、时间戳与 DFS 树

DFS 过程中记录两个量：

- \`dfn[u]\`：u 第几个被访问（时间戳）；
- \`low[u]\`：从 u 的子树出发，**最多经过一条返祖边**能到达的最小 dfn。

判断的核心就在于 low 与 dfn 的比较。

## 二、强连通分量 SCC（有向图）

一个子图内任意两点互相可达即强连通。Tarjan 用一个栈保存“尚未归属 SCC 的点”：

\`\`\`cpp
int dfn[N], low[N], timer, sccId[N], sccCnt;
stack<int> st;
bool inStack[N];

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    st.push(u); inStack[u] = true;
    for (int v : g[u]) {
        if (!dfn[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (inStack[v]) {
            low[u] = min(low[u], dfn[v]);
        }
    }
    if (low[u] == dfn[u]) {        // u 是 SCC 的根
        sccCnt++;
        while (true) {
            int x = st.top(); st.pop(); inStack[x] = false;
            sccId[x] = sccCnt;
            if (x == u) break;
        }
    }
}
\`\`\`

经典用法：**缩点**——把每个 SCC 压成一个点，得到 DAG，之后可拓扑排序 + DP。

## 三、割点（无向图）

删掉它会使连通分量数增加的点：

\`\`\`text
非根结点 u：若某孩子 v 满足 low[v] >= dfn[u]，则 u 是割点
根结点：有 >=2 棵 DFS 子树即割点
\`\`\`

## 四、桥

删掉后图不连通的边 u-v：\`low[v] > dfn[u]\`（v 的子树无法绕过 u-v 回到祖先）。

注意无向图 DFS 要记录父边编号（而不是父点，防重边误判），遇到来时的边跳过。

## 五、应用与选型

- SCC 缩点：依赖关系环合并、DAG DP；
- 割点/桥：无向连通性、必经点/边；
- 2-SAT：根据 SCC 判断布尔约束是否可满足（了解结论：每个变量的两个文字不在同一 SCC）。
`,
    examples: [
      {
        title: '强连通分量缩点',
        level: '挑战',
        statement: `**题目描述**

有向图 n 点 m 边，求 SCC 数量；缩点后输出 DAG 的拓扑序中最大路径点数（每点权 1）。`,
        samples: [['4 5\n1 2\n2 1\n2 3\n3 4\n4 3', 'SCC=2 最长链=2']],
        analysis: `### 解题思路

Tarjan 求 SCC → 建缩点图（跨 SCC 的边）→ 拓扑序 DP：dp[v]=max(dp[v],dp[u]+1)。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[10005], dag[10005];
int dfn[10005], low[10005], timer, sid[10005], sccCnt;
int stk[10005], top;
bool inStk[10005];

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    stk[++top] = u; inStk[u] = true;
    for (int v : g[u]) {
        if (!dfn[v]) { tarjan(v); low[u] = min(low[u], low[v]); }
        else if (inStk[v]) low[u] = min(low[u], dfn[v]);
    }
    if (low[u] == dfn[u]) {
        ++sccCnt;
        while (true) {
            int x = stk[top--]; inStk[x] = false;
            sid[x] = sccCnt;
            if (x == u) break;
        }
    }
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<pair<int,int>> edges(m);
    for (auto& [u,v] : edges) { cin >> u >> v; g[u].push_back(v); }
    for (int i = 1; i <= n; i++) if (!dfn[i]) tarjan(i);

    vector<int> indeg(sccCnt+1, 0), dp(sccCnt+1, 1);
    set<pair<int,int>> dedup;
    for (auto [u,v] : edges) {
        int a = sid[u], b = sid[v];
        if (a != b && dedup.insert({a,b}).second) {
            dag[a].push_back(b); indeg[b]++;
        }
    }
    queue<int> q;
    for (int i = 1; i <= sccCnt; i++) if (!indeg[i]) q.push(i);
    int ans = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : dag[u]) {
            dp[v] = max(dp[v], dp[u] + 1);
            ans = max(ans, dp[v]);
            if (--indeg[v] == 0) q.push(v);
        }
    }
    cout << "SCC=" << sccCnt << " 最长链=" << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '割点与桥',
        level: '挑战',
        statement: `**题目描述**

无向连通图，求割点数量与桥的数量。`,
        samples: [['5 4\n1 2\n2 3\n3 4\n4 5', '3 4']],
        analysis: `### 解题思路

割点：low[v]≥dfn[u]（根特判子树数）。桥：low[v]>dfn[u]。无向图判桥要跳过“父边”本身（按边编号），否则重边会被误判。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int to, id; };
vector<Edge> g[100005];
int dfn[100005], low[100005], timer;
bool isCut[100005], isBridge[200005];

void dfs(int u, int faEdge, int root) {
    dfn[u] = low[u] = ++timer;
    int child = 0;
    for (auto [v, id] : g[u]) {
        if (id == faEdge) continue;        // 跳过来时的边
        if (!dfn[v]) {
            child++;
            dfs(v, id, root);
            low[u] = min(low[u], low[v]);
            if (u != root && low[v] >= dfn[u]) isCut[u] = true;
            if (low[v] > dfn[u]) isBridge[id] = true;
        } else {
            low[u] = min(low[u], dfn[v]);
        }
    }
    if (u == root && child >= 2) isCut[u] = true;
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back({v, i});
        g[v].push_back({u, i});
    }
    for (int i = 1; i <= n; i++)
        if (!dfn[i]) dfs(i, -1, i);
    int cuts = 0, bridges = 0;
    for (int i = 1; i <= n; i++) cuts += isCut[i];
    for (int i = 0; i < m; i++) bridges += isBridge[i];
    cout << cuts << " " << bridges << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**无向图按父点跳过返祖边**：有重边时会漏判桥，必须按边编号跳过父边。`,
      `**dfn/low 比较混用**：SCC 回边取 dfn[v]，不是 low[v]。`,
      `**根结点割点漏特判**：根要看 DFS 子树数量。`,
      `**多个连通分量只跑一次 Tarjan**：for 循环对每个未访问点启动。`,
      `**缩点后重边**：可能影响入度，需要去重或允许重复（DP 一般无妨）。`,
    ],
    exercises: [
      { title: '学校传递消息', level: '提高',
        statement: '缩点后求至少从几个 SCC 出发能到达所有点。',
        hint: '即缩点 DAG 中入度为 0 的点数。' },
      { title: '电话网络割点', level: '提高',
        statement: '求删除后会使两指定点失联的点。',
        hint: '在割点集合中验证是否分隔 s、t。' },
      { title: '2-SAT 入门', level: '挑战',
        statement: '判断一组“或”约束是否可满足。',
        hint: '建蕴含图求 SCC，x 与 ¬x 同 SCC 则无解。' },
    ],
    summary: `
- Tarjan 基于 **dfn 时间戳与 low**，一套框架解决 SCC、割点、桥；
- 有向图：low[u]==dfn[u] 弹出一个强连通分量，缩点后按 DAG 处理；
- 无向图：low[v]≥dfn[u] 判割点（根看子树数），low[v]>dfn[u] 判桥（按边编号跳过父边）；
- 进阶 2-SAT 用 SCC 判定。
`,
  };

  T['bipartite'] = {
    chapter: '第7章 图论',
    time: '约 45 分钟',
    body: `
## 一、二分图

顶点能分成两个集合，使每条边都跨集合（同集合内无边）。等价于**不含奇环**。

判定：BFS/DFS 黑白染色，相邻点异色；冲突则不是二分图。

\`\`\`cpp
int color[N];   // -1 未染色，0/1 两色
bool bfs(int s) {
    queue<int> q; q.push(s); color[s] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) {
            if (color[v] == -1) { color[v] = color[u] ^ 1; q.push(v); }
            else if (color[v] == color[u]) return false;
        }
    }
    return true;
}
\`\`\`

## 二、最大匹配（匈牙利算法）

匹配：两两不共端点的边集。求最大匹配：对每个左部点尝试增广。

**增广路**：从一个未匹配左点出发，交替走“未匹配边-匹配边”，若到达未匹配右点，则沿路径翻转可使匹配数 +1。

\`\`\`cpp
int matchR[N];      // 右点匹配的左点
bool vis[N];        // 本轮 DFS 已尝试的右点
bool dfs(int u) {
    for (int v : g[u]) {
        if (vis[v]) continue;
        vis[v] = true;
        if (matchR[v] == 0 || dfs(matchR[v])) {
            matchR[v] = u;
            return true;
        }
    }
    return false;
}
// for u in 左部: { memset(vis,0); if(dfs(u)) ans++; }
\`\`\`

复杂度 O(VE)。

## 三、Konig 定理与二分图结论

- 最大匹配数 = 最小点覆盖数；
- 最大独立集 = n − 最小点覆盖 = n − 最大匹配；
- 最小边覆盖（无边孤立点时）= n − 最大匹配。

## 四、建模是关键

“把互不兼容/必须配对的关系放到两边”是核心技巧：棋盘黑白染色、男女/任务与机器、行列约束（如“车的放置”）等。
`,
    examples: [
      {
        title: '二分图染色判定',
        level: '基础',
        statement: `**题目描述**

判断无向图是否为二分图，是则输出两种颜色各有多少点。`,
        samples: [['4 4\n1 2\n2 3\n3 4\n4 1', 'YES 2 2'],
                  ['3 3\n1 2\n2 3\n3 1', 'NO']],
        analysis: `### 解题思路

每个未染色点启动 BFS，遇同色冲突立即 NO。记得图可能不连通。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[100005];
int color[100005];
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    fill(color+1, color+n+1, -1);
    int cnt[2] = {0, 0};
    bool ok = true;
    for (int s = 1; s <= n && ok; s++) {
        if (color[s] != -1) continue;
        queue<int> q; q.push(s); color[s] = 0;
        while (!q.empty() && ok) {
            int u = q.front(); q.pop();
            cnt[color[u]]++;
            for (int v : g[u]) {
                if (color[v] == -1) { color[v] = color[u]^1; q.push(v); }
                else if (color[v] == color[u]) ok = false;
            }
        }
    }
    if (ok) cout << "YES " << cnt[0] << " " << cnt[1] << '\\n';
    else cout << "NO\\n";
    return 0;
}`,
      },
      {
        title: '匈牙利求最大匹配',
        level: '挑战',
        statement: `**题目描述**

二分图左 n 点、右 m 点、e 条边，求最大匹配数。`,
        samples: [['3 3 4\n1 1\n1 2\n2 2\n3 3', '3']],
        analysis: `### 解题思路

每个左部点尝试一次增广，vis 数组每个左点开始前清零。`,
        code: `#include <bits/stdc++.h>
using namespace std;
vector<int> g[1005];
int matchR[1005];
bool vis[1005];

bool dfs(int u) {
    for (int v : g[u]) {
        if (vis[v]) continue;
        vis[v] = true;
        if (matchR[v] == 0 || dfs(matchR[v])) {
            matchR[v] = u;
            return true;
        }
    }
    return false;
}
int main() {
    int n, m, e; cin >> n >> m >> e;
    for (int i = 0; i < e; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
    }
    int ans = 0;
    for (int u = 1; u <= n; u++) {
        memset(vis, 0, sizeof(vis));
        if (dfs(u)) ans++;
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**vis 忘记每个左点重置**：增广记录只在单次尝试内有效。`,
      `**有向图直接染色**：二分图判定针对无向图（或把有向边按题意处理）。`,
      `**图不连通只染一个连通块**：外层循环所有点。`,
      `**递归深度**：n 很大时匈牙利 DFS 可能爆栈，必要时扩栈。`,
      `**Konig 定理用错图**：只在二分图成立。`,
    ],
    exercises: [
      { title: '关押罪犯（二分图判定版）', level: '提高',
        statement: '二分答案后判定只保留大冲突边时能否二染色。',
        hint: '二分 + 染色判定。' },
      { title: '棋盘放车', level: '提高',
        statement: '障碍棋盘上最多放多少互不攻击的车。',
        hint: '行、列为左右部，可放格子是边的二分图匹配。' },
      { title: '完美匹配判定', level: '基础',
        statement: '判断是否存在覆盖左部全部点的匹配。',
        hint: '最大匹配数等于左部点数。' },
    ],
    summary: `
- 二分图 = 顶点可二染色且每条边跨色，等价无奇环，BFS/DFS 染色判定；
- **匈牙利算法**沿增广路翻转，O(VE) 求最大匹配；
- Konig 定理：最大匹配=最小点覆盖，最大独立集=n−最大匹配；
- 建模要点：识别天然的“两边”关系（棋盘格、行列、任务与机器）。
`,
  };

  Object.assign(window.TOPICS, T);
})();
