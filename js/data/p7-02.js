/* ============================================================
   第七部分 · 第2章 网络流进阶
   flow-cost
   ============================================================ */
(function () {
  const T = {};

  T['flow-cost'] = {
    chapter: '第2章 网络流进阶',
    time: '约 50 分钟',
    body: `
## 一、问题：流量最大、且费用最小

普通最大流只关心"能流多少"。若每条边除了**容量 cap**外还有**单位费用 cost**，
要求在**流量最大**的前提下总费用最小，这就是**最小费用最大流（费用流）**。
建模很常见：运输（单位运费）、任务分配、匹配带权等。

## 二、核心思路：沿"最短路"增广

最大流是沿"任意增广路"增广；费用流改为：**每次沿源点到汇点费用之和最小的那条增广路**增广。
- 把边费用当作"边长"，求 s→t 最短路；
- 在这条路上增广（流量取路径上最小残余容量）；
- 重复直到没有增广路。如此每一步都选当前最便宜的路，累计即最小费用（前提：费用处理正确）。

\`\`\`text
关键：反向边费用取相反数（用于反悔）。
正向边 (cap, cost)，对应反向边 (0, -cost)。
\`\`\`

## 三、用什么求最短路

- **SPFA（Bellman-Ford 队列版）**：实现简单，且因为有"负费用反向边"，
  不能直接用 Dijkstra；在没有负环（残量网络不会有）时可行；
- **Dijkstra + 势函数（Johnson）**：维护一个"势 h"把边权化为非负，
  每次 \`实际费用 = cost + h[u] − h[v]\`，更新势，速度更快、更稳定。

入门先用 SPFA 版；数据大或卡常时用 Dijkstra + 势。

> **⚠️ 坑：** ①**反向边费用必须是 −cost**，忘记负号结果必错；
> ②有负费用边，裸 Dijkstra 不适用（用 SPFA 或加势）；③每轮增广要更新总流量与总费用。
`,
    examples: [
      {
        title: '最小费用最大流（SPFA 版）',
        level: '挑战',
        statement: `**题目描述**

给定网络（每边容量与单位费用）、源 s、汇 t，求最大流及此时的最小费用。`,
        input: '第一行 n m s t；m 行 u v cap cost。',
        output: '一行：最大流 最小费用。',
        samples: [['4 2 1 4\n1 2 2 3\n2 4 2 5', '2 16']],
        analysis: `### 解题思路

- 建图时每条正向边加一条 cap=0、费用为 −cost 的反向边；
- 每轮 SPFA 求 s→t 最小费用路（记录前驱边）；
- 沿前驱找最小可增容量、增广、累加费用；
- 无路可走结束。样例 2 单位流量费用 3+5=8，2 单位共 16。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int to, cap, cost, rev; };
vector<Edge> g[5005];
int dist[5005], preV[5005], preE[5005];

void addEdge(int u,int v,int cap,int cost) {
    g[u].push_back({v, cap, cost, (int)g[v].size()});
    g[v].push_back({u, 0, -cost, (int)g[u].size()-1}); // 反向边负费用
}
bool spfa(int s,int t) {
    fill(dist, dist+5005, INT_MAX);
    dist[s] = 0;
    vector<bool> inq(5005,false);
    queue<int> q; q.push(s); inq[s]=true;
    while (!q.empty()) {
        int u=q.front(); q.pop(); inq[u]=false;
        for (int i=0;i<(int)g[u].size();i++){
            Edge& e=g[u][i];
            if (e.cap>0 && dist[e.to]>dist[u]+e.cost){
                dist[e.to]=dist[u]+e.cost;
                preV[e.to]=u; preE[e.to]=i;
                if (!inq[e.to]){q.push(e.to);inq[e.to]=true;}
            }
        }
    }
    return dist[t] != INT_MAX;
}
int main() {
    int n,m,s,t; cin>>n>>m>>s>>t;
    for (int i=0;i<m;i++){
        int u,v,cap,cost; cin>>u>>v>>cap>>cost;
        addEdge(u,v,cap,cost);
    }
    int flow=0,cost=0;
    while (spfa(s,t)){
        int add=INT_MAX;
        for (int v=t;v!=s;v=preV[v])
            add=min(add,g[preV[v]][preE[v]].cap);
        for (int v=t;v!=s;v=preV[v]){
            Edge& e=g[preV[v]][preE[v]];
            e.cap-=add;
            g[v][e.rev].cap+=add;
            cost+=add*e.cost;
        }
        flow+=add;
    }
    cout<<flow<<" "<<cost;
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**反向边费用忘记取负**：反悔边必须是 −cost。`,
      `**有负费用边用 Dijkstra**：用 SPFA，或 Dijkstra+势函数。`,
      `**只增广 1 单位**：一次应沿最短路增广到瓶颈容量。`,
      `**残量容量为 0 仍走**：SPFA 只考虑 cap>0 的边。`,
    ],
    exercises: [
      { title: 'Dijkstra + 势函数', level: '挑战',
        statement: '把 SPFA 换成 Johnson 势函数的 Dijkstra，提升速度。',
        hint: '维护 h，边权用 cost+h[u]−h[v]。' },
    ],
    summary: `
最小费用最大流在每条边加"单位费用"，**每次沿费用最短路增广**直到无路，保证最大流且费用最小。
反向边容量 0、**费用取负**。有负费用，用 SPFA 或 Dijkstra+势函数。每次沿路径瓶颈容量增广。
`,
  };

  Object.assign(window.TOPICS, T);
})();
