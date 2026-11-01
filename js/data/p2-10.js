/* ============================================================
   第二部分 · 第10章 搜索
   search-dfs / search-bfs
   ============================================================ */
(function () {
  const T = {};

  T['search-dfs'] = {
    chapter: '第10章 搜索',
    time: '约 60 分钟',
    body: `
## 一、DFS：一条路走到黑

**深度优先搜索（DFS）**：从一个状态出发，尽可能深地向前探索，走不通就**回溯**到上一个岔路口换条路。它天然用递归实现（递归栈就是“来时的路”）。

适合解决：

- 排列 / 组合 / 子集的枚举；
- 迷宫是否可达、有多少条路径；
- 所有方案的计数、输出一组方案；
- 图/树的遍历（提高篇）。

## 二、回溯三要素

1. **路径（选择了什么）**：通常用数组 path 记录；
2. **选择集合（还能选什么）**：used 数组或位置指针；
3. **结束条件**：选满 k 个 / 走到终点 → 处理答案 → return。

模板（全排列）：

\`\`\`cpp
int n, path[15];
bool used[15];

void dfs(int k) {                 // k：已选个数
    if (k == n) {                 // 边界：得到一个完整排列
        for (int i = 0; i < n; i++) cout << path[i] << " ";
        cout << '\\n';
        return;
    }
    for (int x = 1; x <= n; x++) {
        if (used[x]) continue;    // 已选过的不能再选
        path[k] = x;
        used[x] = true;           // 做选择
        dfs(k + 1);               // 递归
        used[x] = false;          // 撤销选择（回溯）
    }
}
\`\`\`

## 三、组合与子集

组合“不考虑顺序”，用一个 start 参数保证只向后选，天然避免重复：

\`\`\`cpp
void comb(int start, int k) {     // 从 start 开始选，凑 k 个
    if (k == 0) { /* 输出方案 */ return; }
    for (int x = start; x <= n; x++) {
        path[/*位置*/] = x;
        comb(x + 1, k - 1);       // 下一个数必须比 x 大
    }
}
\`\`\`

子集问题每个元素“选或不选”，是二叉决策树：递归里分别处理选与不选两个分支。

## 四、迷宫 DFS

四方向用方向数组，visited 数组防止回头：

\`\`\`cpp
int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

void dfs(int x, int y) {
    if (x == tx && y == ty) { ans++; return; }
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx<0||nx>=n||ny<0||ny>=m) continue;
        if (maze[nx][ny]=='#' || vis[nx][ny]) continue;
        vis[nx][ny] = true;
        dfs(nx, ny);
        vis[nx][ny] = false;      // 回溯：别的路径还要用
    }
}
\`\`\`

## 五、剪枝：搜索的加速艺术

搜索是指数级复杂度，不剪枝 n 稍大就爆。常用剪枝：

1. **可行性剪枝**：剩余数已不够选、步数已超过当前最优 → 停；
2. **最优性剪枝**：当前代价 ≥ 已知最优答案 → 停；
3. **顺序优化**：先试分支少/希望大的选择；
4. **去重**：相同元素的排列跳过重复分支。
`,
    examples: [
      {
        title: '1~n 的全排列',
        level: '基础',
        statement: `**题目描述**

输入 n（1≤n≤8），按字典序输出 1~n 的所有排列，每行一个。`,
        samples: [['3', '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1']],
        analysis: `### 解题思路

回溯模板题：每个位置依次尝试没用过的数字。n=8 时 40320 行，正好是回溯的合理量级。`,
        code: `#include <iostream>
using namespace std;

int n, path[10];
bool used[10];

void dfs(int k) {
    if (k == n) {
        for (int i = 0; i < n; i++)
            cout << path[i] << (i + 1 == n ? '\\n' : ' ');
        return;
    }
    for (int x = 1; x <= n; x++) {
        if (used[x]) continue;
        path[k] = x;
        used[x] = true;
        dfs(k + 1);
        used[x] = false;       // 撤销，换下一个数
    }
}

int main() {
    cin >> n;
    dfs(0);
    return 0;
}`,
      },
      {
        title: '迷宫路径计数',
        level: '提高',
        statement: `**题目描述**

n×m 迷宫（. 可走，# 障碍），从左上 (0,0) 走到右下 (n-1,m-1)，每格至多经过一次，求路径条数。`,
        samples: [['3 3\n.........', '12']],
        analysis: `### 解题思路

四方向 DFS + 访问标记 + 回溯。起点先标记，每深入一格标记、返回时取消。注意四方向路径计数增长极快，n、m 很小才能用。`,
        code: `#include <iostream>
using namespace std;

int n, m;
char maze[15][15];
bool vis[15][15];
long long ans;
int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

void dfs(int x, int y) {
    if (x == n - 1 && y == m - 1) { ans++; return; }
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        if (maze[nx][ny] == '#' || vis[nx][ny]) continue;
        vis[nx][ny] = true;
        dfs(nx, ny);
        vis[nx][ny] = false;
    }
}

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) cin >> maze[i][j];
    vis[0][0] = true;
    dfs(0, 0);
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '部分和问题（子集枚举+剪枝）',
        level: '提高',
        statement: `**题目描述**

n 个数中选若干个，使它们的和恰好为 S。判断能否做到（n≤20）。`,
        samples: [['4 10\n1 4 6 9', 'YES']],
        analysis: `### 解题思路

每个数“选或不选”，DFS 携带当前和。加入剪枝：当前和超过 S（假设数均为正）就不再继续。`,
        code: `#include <iostream>
using namespace std;

int n, S, a[25];
bool found;

void dfs(int i, int sum) {        // 决策第 i 个数，当前和 sum
    if (found || sum > S) return; // 剪枝：已找到 / 超了（正数前提）
    if (i == n) {
        if (sum == S) found = true;
        return;
    }
    dfs(i + 1, sum + a[i]);       // 选
    dfs(i + 1, sum);              // 不选
}

int main() {
    cin >> n >> S;
    for (int i = 0; i < n; i++) cin >> a[i];
    dfs(0, 0);
    cout << (found ? "YES" : "NO") << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**忘记回溯**：used/vis 改了不还原，后续分支全部受污染。`,
      `**起点没标记**：vis[0][0] 漏设导致走回起点。`,
      `**边界检查顺序错**：先访问 maze[nx] 再判越界会越界读取。`,
      `**全局状态在多组数据间没重置**：ans、used、vis 每组开始清零。`,
      `**不剪枝硬搜**：n=20 全排列 20! 是天文数字，加剪枝或换状压 DP。`,
      `**方案数用 int**：路径条数可能很大，用 long long。`,
    ],
    exercises: [
      { title: 'n 选 k 的组合', level: '基础',
        statement: '输出 1~n 中选 k 个数的所有组合。',
        hint: 'start 参数保证递增选择。' },
      { title: '八皇后', level: '挑战',
        statement: '在 8×8 棋盘放 8 个皇后互不攻击，输出方案数。',
        hint: '按行放，列/主对角(r-c)/副对角(r+c) 各开 bool 数组。' },
      { title: '迷宫最短步长（DFS 版）', level: '提高',
        statement: '用 DFS 求迷宫到终点的最少步数（小规模）。',
        hint: '带步数参数，到达终点更新答案；可达后再用 BFS 对比。' },
      { title: '数独求解器', level: '挑战',
        statement: '输入 9×9 部分填充数独，输出一组解。',
        hint: '找空格尝试 1~9，行列宫冲突检查，填满即输出。' },
    ],
    summary: `
- DFS = 深入探索 + **回溯**，递归实现，三要素：路径、选择集、结束条件；
- 排列用 used，组合用 start 去序，子集是“选/不选”二叉树；
- 迷宫 = 方向数组 + 访问标记 + 撤销标记；
- 指数级算法必须**剪枝**（可行性、最优性、顺序、去重），状态用完务必还原。
`,
  };

  T['search-bfs'] = {
    chapter: '第10章 搜索',
    time: '约 50 分钟',
    body: `
## 一、BFS：按层扩散

**广度优先搜索（BFS）**：从起点开始，先访问距离 1 的所有点，再访问距离 2 的……像水波一样一圈圈扩散。用**队列**实现。

\`\`\`text
第0层：起点
第1层：起点走一步能到的点
第2层：走两步能到的点 ……
\`\`\`

关键性质：**在边权相同（每步代价一样）的图上，BFS 第一次访问某点时的步数就是最短距离。** 这是 BFS 相对 DFS 最大的优势。

## 二、BFS 模板

\`\`\`cpp
#include <queue>
int dist[N][N];                    // 距离，-1 表示未访问
queue<pair<int,int>> q;

memset(dist, -1, sizeof(dist));
dist[0][0] = 0;
q.push({0, 0});

while (!q.empty()) {
    auto [x, y] = q.front(); q.pop();   // C++17 结构化绑定
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (越界 || 障碍 || dist[nx][ny] != -1) continue;
        dist[nx][ny] = dist[x][y] + 1;  // 入队时定距离
        q.push({nx, ny});
    }
}
\`\`\`

与 DFS 的区别：BFS 不需要回溯（距离数组同时承担 visited 职责），空间换时间。

## 三、DFS 还是 BFS？

| 需求 | 选择 |
| --- | --- |
| 输出所有方案、排列组合 | DFS |
| 判断连通/可达 | 都行 |
| **最少步数、最少操作次数** | **BFS** |
| 状态空间极深但解少 | DFS 省内存 |
| 按层次处理 | BFS |

## 四、BFS 的状态不一定是坐标

任何“从初始状态，每步做一种操作，问最少几步到目标”的题都是隐式图 BFS：

- 数字变换（×2、−1）最少操作；
- 魔方阵、八数码（注意状态判重：字符串或编码）；
- “打开转盘锁”这类密码锁问题。

判重是核心：用 bool 数组、set 或哈希记录已入队的状态。

## 五、多源 BFS

把多个起点同时入队（距离都设 0），一次 BFS 得到每个点到“最近起点”的距离——如“矩阵中每个格子到最近的 0 的距离”。
`,
    examples: [
      {
        title: '迷宫最短路',
        level: '基础',
        statement: `**题目描述**

n×m 迷宫（. 可走，# 障碍），从 (0,0) 走到 (n-1,m-1)，每步上下左右，输出最少步数；不可达输出 -1。`,
        samples: [['3 3\n.........', '4']],
        analysis: `### 解题思路

BFS 模板题：第一次到达终点时的距离即答案。dist 数组既存距离又判重。`,
        code: `#include <iostream>
#include <queue>
#include <cstring>
using namespace std;

int n, m;
char maze[1005][1005];
int dist[1005][1005];
int dx[4] = {-1, 1, 0, 0};
int dy[4] = {0, 0, -1, 1};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) cin >> maze[i][j];

    memset(dist, -1, sizeof(dist));
    queue<pair<int,int>> q;
    dist[0][0] = 0;
    q.push({0, 0});

    while (!q.empty()) {
        int x = q.front().first;
        int y = q.front().second;
        q.pop();

        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx<0||nx>=n||ny<0||ny>=m) continue;
            if (maze[nx][ny]=='#' || dist[nx][ny]!=-1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    cout << dist[n-1][m-1] << '\\n';
    return 0;
}`,
      },
      {
        title: '骑士最少步数',
        level: '提高',
        statement: `**题目描述**

无限棋盘上马走“日”字（8 个方向）。输入起点、终点坐标（绝对值≤500），求马从起点跳到终点的最少步数。`,
        samples: [['0 0 2 1', '1']],
        analysis: `### 解题思路

每步代价相同 → BFS。把 8 种跳法写进方向数组，坐标加偏移量平移到非负下标。判重用 dist 数组。`,
        code: `#include <iostream>
#include <queue>
#include <cstring>
using namespace std;

int dist[1010][1010];
// 马的 8 种走法
int dx[8] = {-2,-2,-1,-1,1,1,2,2};
int dy[8] = {-1,1,-2,2,-2,2,-1,1};

int main() {
    int sx, sy, tx, ty;
    cin >> sx >> sy >> tx >> ty;
    sx += 502; sy += 502; tx += 502; ty += 502;   // 平移防负下标

    memset(dist, -1, sizeof(dist));
    queue<pair<int,int>> q;
    dist[sx][sy] = 0;
    q.push({sx, sy});

    while (!q.empty()) {
        int x = q.front().first, y = q.front().second;
        q.pop();
        if (x == tx && y == ty) break;
        for (int k = 0; k < 8; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx<2||nx>1005||ny<2||ny>1005) continue;
            if (dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    cout << dist[tx][ty] << '\\n';
    return 0;
}`,
      },
      {
        title: '到最近商店的距离（多源 BFS）',
        level: '挑战',
        statement: `**题目描述**

n×m 地图，0 表示商店、1 表示空地。输出每个格子到最近商店的曼哈顿可达距离（四方向），地图中至少一个商店。`,
        samples: [['3 3\n0 1 1\n1 1 1\n1 1 0', '0 1 2\n1 2 1\n2 1 0']],
        analysis: `### 解题思路

把所有商店同时入队作为第 0 层，扩散一次即可。多源 BFS 等价于建一个虚拟超级源点连到所有商店。`,
        code: `#include <iostream>
#include <queue>
#include <cstring>
using namespace std;

int n, m, dist[1005][1005];
int dx[4] = {-1,1,0,0}, dy[4] = {0,0,-1,1};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;

    memset(dist, -1, sizeof(dist));
    queue<pair<int,int>> q;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            int x; cin >> x;
            if (x == 0) { dist[i][j] = 0; q.push({i, j}); }
        }

    while (!q.empty()) {
        int x = q.front().first, y = q.front().second;
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nx = x+dx[k], ny = y+dy[k];
            if (nx<0||nx>=n||ny<0||ny>=m||dist[nx][ny]!=-1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++)
            cout << dist[i][j] << (j+1==m?'\\n':' ');
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**入队不判重导致重复入队**：必须在入队时就标记距离/访问，而不是出队时。`,
      `**用 DFS 求最短路**：DFS 第一次到终点不保证最短，等权最短路用 BFS。`,
      `**memset 忘记或 dist 初值错**：未访问用 -1（距离不会是 -1），不要用 0。`,
      `**负下标/数组开小**：坐标可能为负时整体平移；按最大可能范围开数组。`,
      `**边权不等也用 BFS**：每步代价不同要用 Dijkstra（提高篇图论）。`,
      `**状态题忘记判重**：八数码等必须用编码/set 记录已出现状态，否则无限循环。`,
    ],
    exercises: [
      { title: '连通块大小', level: '基础',
        statement: '迷宫中有几个连通区域？最大区域多大？（BFS/DFS 均可）',
        hint: '遍历每个未访问点，启动一次搜索计数。' },
      { title: '数字变换', level: '提高',
        statement: '给定整数 n，操作：减 1，或若为偶数则除以 2。变到 1 最少几步？',
        hint: '反向看：从 1 出发 ×2、+1，BFS 到 n。' },
      { title: '岛屿数量', level: '基础',
        statement: '0/1 网格中四方向相连的 1 构成岛屿，统计岛屿数。',
        hint: '每发现未访问的 1 就 BFS 淹掉整块。' },
      { title: '迷宫门与钥匙', level: '挑战',
        statement: '迷宫中有门 A~C 和钥匙 a~c，拿到对应钥匙才能开门，求最短路。',
        hint: '状态=(x,y,钥匙集合)，钥匙用 3 位二进制编码进 dist 第三维。' },
    ],
    summary: `
- BFS 用队列按层扩散，**等权图上首次到达即最短距离**；
- dist 数组身兼访问标记（-1 未访问），入队时定距离并判重；
- 求所有方案用 DFS，求最少步数用 BFS；状态题 BFS 要解决状态编码与判重；
- 多源 BFS：所有起点同时入队，一次得到到最近起点的距离。
`,
  };

  Object.assign(window.TOPICS, T);
})();
