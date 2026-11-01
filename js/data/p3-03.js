/* ============================================================
   第三部分 · 第3章 并查集
   dsu
   ============================================================ */
(function () {
  const T = {};

  T['dsu'] = {
    chapter: '第3章 并查集',
    time: '约 45 分钟',
    body: `
## 一、问题引入

n 个人之间有 m 对朋友关系，朋友的朋友也算朋友。问最后有几个朋友圈？两人是否在同一朋友圈？

用数组维护“集合归属”，每次合并若暴力修改全部成员会 O(n)。**并查集（DSU）**用树形结构把“合并”和“查询是否同集”都做到接近 O(1)。

## 二、基本思想

\`fa[x]\` 表示 x 的父结点；父结点是自己的点是**根**，一个根代表一个集合。

- **查 find**：沿父指针一路走到根；
- **并 unite**：把一棵树的根接到另一棵树的根下。

\`\`\`cpp
int fa[MAXN];
void init(int n) { for (int i = 1; i <= n; i++) fa[i] = i; }

int find(int x) {
    while (fa[x] != x) x = fa[x];
    return x;
}

void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a != b) fa[a] = b;
}
\`\`\`

## 三、路径压缩（必加）

查询时把沿途结点直接挂到根下，树被压成扁平：

\`\`\`cpp
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);  // 递归压缩
}
\`\`\`

## 四、按秩/按大小合并

把小树接到大树根下，保证树高增长缓慢：

\`\`\`cpp
int sz[MAXN];
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return;
    if (sz[a] < sz[b]) swap(a, b);
    fa[b] = a;
    sz[a] += sz[b];
}
\`\`\`

路径压缩 + 按秩合并后，单次操作均摊复杂度 O(α(n))，α 是反阿克曼函数，对任意实际数据 ≤5，可视为常数。

## 五、典型应用

- 连通性问题（朋友圈、格子连通、网络通断）；
- Kruskal 最小生成树：边排序后用并查集判环；
- “合并后查询”类离线问题；
- 统计集合个数：初始为 n，成功合并一次减一；
- 扩展：带权并查集（维护到根的附加信息，如食物链、奇偶性）、种类并查集（开三倍空间表示对立关系）。
`,
    examples: [
      {
        title: '亲戚（模板题）',
        level: '基础',
        statement: `**题目描述**

n 个人 m 对亲戚关系，q 次询问两人是否亲戚（同属一个集合）。`,
        samples: [['3 2 2\n1 2\n2 3\n1 3\n1 4', 'Yes\nNo']],
        analysis: `### 解题思路

并查集模板：有关系就 unite，询问比较 find 是否相同。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 10005;
int fa[MAXN];

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a != b) fa[a] = b;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, q;
    cin >> n >> m >> q;
    for (int i = 1; i <= n; i++) fa[i] = i;

    for (int i = 0; i < m; i++) {
        int a, b; cin >> a >> b;
        unite(a, b);
    }
    while (q--) {
        int a, b; cin >> a >> b;
        cout << (find(a) == find(b) ? "Yes" : "No") << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '岛屿连通块计数',
        level: '基础',
        statement: `**题目描述**

每次在水面放一块陆地（坐标合并相邻陆地），动态输出当前连通块数量。`,
        samples: [['3 3 5\n0 0\n2 2\n0 1\n1 1\n2 1', `1
2
2
2
1`]],
        analysis: `### 解题思路

每放一块陆地，连通块数 +1；每成功与一个不同集合的邻居合并，数量 -1。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int fa[1000005];
bool land[1000005];
int dx[4] = {-1,1,0,0}, dy[4] = {0,0,-1,1};

int find(int x) { return fa[x]==x ? x : fa[x]=find(fa[x]); }

int main() {
    int n, m, k, components = 0;
    cin >> n >> m >> k;
    for (int i = 0; i < n*m; i++) fa[i] = i;

    while (k--) {
        int x, y; cin >> x >> y;
        int id = x * m + y;
        if (land[id]) continue;
        land[id] = true;
        components++;
        for (int d = 0; d < 4; d++) {
            int nx = x+dx[d], ny = y+dy[d];
            if (nx<0||nx>=n||ny<0||ny>=m) continue;
            int nid = nx*m+ny;
            if (!land[nid]) continue;
            int a = find(id), b = find(nid);
            if (a != b) { fa[a] = b; components--; }
        }
        cout << components << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '食物链（种类并查集）',
        level: '挑战',
        statement: `**题目描述**

三类生物 A 吃 B、B 吃 C、C 吃 A。给出 k 句话，要么声明同类，要么声明捕食，判断假话数量（与前面真话矛盾即假）。`,
        samples: [['3 5\n1 1 2\n2 2 3\n2 1 3\n1 1 3\n2 3 1', '2']],
        analysis: `### 解题思路

开三倍空间：x 表示“x 自己”，x+n 表示“x 的猎物集合”，x+2n 表示“x 的天敌集合”。

- 同类：三部分分别合并；
- x 吃 y：x 与 y+n 合并、x+n 与 y+2n、x+2n 与 y（形成循环克制关系）；
- 判定矛盾用根是否相同。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 150005;
int fa[MAXN];
int find(int x) { return fa[x]==x ? x : fa[x]=find(fa[x]); }
void unite(int a, int b) { a=find(a); b=find(b); if(a!=b) fa[a]=b; }
bool same(int a, int b) { return find(a)==find(b); }

int main() {
    int n, k, lies = 0;
    cin >> n >> k;
    for (int i = 1; i <= 3*n; i++) fa[i] = i;

    while (k--) {
        int op, x, y;
        cin >> op >> x >> y;
        if (x>n || y>n) { lies++; continue; }
        if (op == 1) {  // 声明同类
            if (same(x,y+n) || same(x,y+2*n)) lies++;
            else { unite(x,y); unite(x+n,y+n); unite(x+2*n,y+2*n); }
        } else {        // 声明 x 吃 y
            if (same(x,y) || same(x,y+2*n)) lies++;
            else { unite(x,y+n); unite(x+n,y+2*n); unite(x+2*n,y); }
        }
    }
    cout << lies << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**合并前没 find 到根**：直接 fa[a]=b 在 a 不是根时只接上了局部。`,
      `**忘记初始化 fa[i]=i**：每个点最初自己是根。`,
      `**路径压缩只写一半**：fa[x]=find(fa[x]) 才真正压平。`,
      `**集合计数逻辑错**：只有 find 不同才合并并减一。`,
      `**种类并查集空间开不够**：三倍 n 必须严格满足。`,
    ],
    exercises: [
      { title: '合村并居', level: '基础',
        statement: 'n 个村 m 次合并，最终输出最大村庄人数与村庄总数。',
        hint: 'sz 数组维护大小，合并时累加。' },
      { title: '图的连通分量', level: '基础',
        statement: '无向图 n 点 m 边，求连通分量个数。',
        hint: '每条边 unite，最后数根的个数。' },
      { title: 'Kruskal 中的并查集', level: '提高',
        statement: '结合下一章 MST：用并查集判断加入边是否成环。',
        hint: '两端不同集合才加入。' },
      { title: '关押罪犯（二分图种类并查集）', level: '挑战',
        statement: '两个监狱分配犯人，使最大冲突最小。',
        hint: '按冲突降序，用二倍空间表示“分开关押”关系，第一组必须同狱的冲突即答案。' },
    ],
    summary: `
- 并查集维护不相交集合：\`find\` 找根、\`unite\` 合并；
- **路径压缩 + 按大小合并**后均摊 O(α(n))，近似常数；
- 根的数量即集合数，合并成功才减少；
- 扩展：带权并查集维护相对关系，种类并查集用多倍空间表示对立/捕食关系。
`,
  };

  Object.assign(window.TOPICS, T);
})();
