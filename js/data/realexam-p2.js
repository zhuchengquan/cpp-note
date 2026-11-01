/* ============================================================
   真题与经典名题精讲 · 第二部分（CSP-J 普及篇）
   独立文件：把真题例题追加到对应知识点的 examples 末尾，
   渲染时显示 🏆 来源徽章。来源为可准确还原的洛谷经典题。
   ============================================================ */
(function () {
  const R = {

  /* ---- sort-bucket：NOIP 2006 明明的随机数 ---- */
  'sort-bucket': {
    source: 'NOIP 2006 普及组 · 洛谷 P1059 明明的随机数',
    title: '明明的随机数（去重 + 排序）',
    level: '基础',
    statement: `**题目描述**

明明想在学校请同学做问卷调查，需要生成一些 1~1000 的随机整数，**去重**后**从小到大排序**，
相同的随机数只保留一个。请按要求输出。`,
    input: '第一行 n，第二行 n 个整数。',
    output: '第一行去重后的个数；第二行排序后空格隔开。',
    samples: [['5\n3 1 2 3 2', '3\n1 2 3']],
    analysis: `### 解题思路

两种标准做法：①\`sort\` 后用 \`unique\` 去重（返回新的逻辑结尾）；
②本题数值范围仅 1000，也可以用桶标记。下面演示 sort + unique。
\`unique\` 并不真正删除元素，而是把不重复元素前移、返回结尾迭代器，再用 \`erase\` 截断。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int &x : a) cin >> x;

    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());  // 去重

    cout << a.size() << '\\n';
    for (int i = 0; i < (int)a.size(); i++)
        cout << a[i] << (i + 1 == (int)a.size() ? '\\n' : ' ');
    return 0;
}`,
  },

  /* ---- greedy：排队接水 ---- */
  'greedy': {
    source: '洛谷 P1223 排队接水',
    title: '排队接水（贪心 + 编号输出）',
    level: '提高',
    statement: `**题目描述**

n 个人各带一个接水时间，只有一个水龙头。请安排接水顺序使**所有人的平均等待时间最小**，
输出接水顺序（人员编号）和最小平均等待时间（保留 2 位小数）。`,
    input: '第一行 n，第二行 n 个接水时间。',
    output: '第一行接水顺序编号；第二行平均等待时间。',
    samples: [['3\n3 6 1', '3 1 2\n1.67']],
    analysis: `### 解题思路

**贪心：接水时间短的人先接**（交换论证：若相邻两人前者更慢，交换后总等待一定不增）。
- 用结构体保存 \`(时间, 原编号)\`，按时间升序、时间相同按编号升序；
- 平均等待 = 所有人等待时间之和 / n。已排序时间 t1≤t2≤…，第 k 个人的等待是前 k−1 人时间之和；
  用前缀和累加，注意答案用 double。样例排序后 1,3,6，等待 0,1,4，和 5，/3 = 1.67。`,
    code: `#include <bits/stdc++.h>
using namespace std;
struct Person { int t, id; };
int main() {
    int n; cin >> n;
    vector<Person> p(n);
    for (int i = 0; i < n; i++) { cin >> p[i].t; p[i].id = i + 1; }

    sort(p.begin(), p.end(), [](const Person &a, const Person &b) {
        return a.t != b.t ? a.t < b.t : a.id < b.id;
    });

    for (int i = 0; i < n; i++)
        cout << p[i].id << (i + 1 == n ? '\\n' : ' ');

    double total = 0, prefix = 0;
    for (int i = 0; i < n; i++) {
        total += prefix;      // 第 i 人的等待 = 前面所有人时间之和
        prefix += p[i].t;
    }
    cout << fixed << setprecision(2) << total / n << '\\n';
    return 0;
}`,
  },

  /* ---- binary-search：查找 ---- */
  'binary-search': {
    source: '洛谷 P2249【深基13.例1】查找',
    title: '查找（lower_bound 第一次出现位置）',
    level: '基础',
    statement: `**题目描述**

给定长度为 n 的**不下降**整数序列和 m 个询问，每次问某数第一次出现的位置（从 1 开始），
找不到输出 0。`,
    input: '第一行 n m，第二行 n 个整数，第三行 m 个询问。',
    output: '一行 m 个位置。',
    samples: [['5 3\n1 3 3 5 7\n3 5 9', '2 4 0']],
    analysis: `### 解题思路

不下降序列找"第一次出现"，用 \`lower_bound\` 得到第一个 ≥ 目标的位置；
再判断该位置的值是否**等于**目标：相等输出下标+1，否则输出 0。
注意必须用 lower_bound 而不是 upper_bound（后者得到的是之后）。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<int> a(n);
    for (int &x : a) cin >> x;

    for (int k = 0; k < m; k++) {
        int x; cin >> x;
        auto it = lower_bound(a.begin(), a.end(), x);
        int ans = (it != a.end() && *it == x) ? int(it - a.begin()) + 1 : 0;
        cout << ans << (k + 1 == m ? '\\n' : ' ');
    }
    return 0;
}`,
  },

  /* ---- divide-conquer：逆序对 ---- */
  'divide-conquer': {
    source: '洛谷 P1908 逆序对',
    title: '逆序对（归并排序 O(n log n)）',
    level: '挑战',
    statement: `**题目描述**

给定长度为 n 的序列，求**逆序对**个数：满足 i<j 且 a[i]>a[j] 的数对个数。`,
    input: '第一行 n，第二行 n 个整数。',
    output: '一个整数：逆序对个数。',
    samples: [['6\n5 4 2 6 1 3', '10']],
    analysis: `### 解题思路

归并排序分治：把数组分成左右两半先各自排好，合并时若左半当前值 > 右半当前值，
则左半从当前到末尾的**所有**值都与它成逆序对，一次加上 \`mid−i+1\`。
答案可达 n²/4，**必须用 long long**。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int a[500005], tmp[500005];
long long cnt;

void mergeSort(int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    mergeSort(l, mid);
    mergeSort(mid + 1, r);
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { tmp[k++] = a[j++]; cnt += mid - i + 1; }  // 跨两半逆序对
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (int t = l; t <= r; t++) a[t] = tmp[t];
}
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    mergeSort(0, n - 1);
    cout << cnt << '\\n';
    return 0;
}`,
  },

  /* ---- prefix-diff：地毯 ---- */
  'prefix-diff': {
    'source': '洛谷 P3397 地毯',
    title: '地毯（二维差分）',
    level: '提高',
    statement: `**题目描述**

在 n×n 的区域铺 m 张地毯，每张给出左上、右下两个对角坐标，地毯覆盖矩形内所有格子。
求每个格子被多少张地毯覆盖。`,
    input: '第一行 n m，随后 m 行 x1 y1 x2 y2。',
    output: 'n 行 n 列覆盖次数。',
    samples: [['3 2\n1 1 2 2\n2 2 3 3', `1 1 0
1 2 1
0 1 1`]],
    analysis: `### 解题思路

二维差分：矩形 \`(x1,y1)~(x2,y2)\` 只打 4 个标记：
\`d[x1][y1]++ d[x1][y2+1]-- d[x2+1][y1]-- d[x2+1][y2+1]++\`，
最后做二维前缀和还原。数组开 n+2 防止越界。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int d[1005][1005];
int main() {
    int n, m; cin >> n >> m;
    while (m--) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        d[x1][y1]++;
        d[x1][y2 + 1]--;
        d[x2 + 1][y1]--;
        d[x2 + 1][y2 + 1]++;
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            d[i][j] += d[i - 1][j] + d[i][j - 1] - d[i - 1][j - 1];
            cout << d[i][j] << (j == n ? '\\n' : ' ');
        }
    }
    return 0;
}`,
  },

  /* ---- search-dfs：全排列 ---- */
  'search-dfs': {
    source: '洛谷 P1706 全排列问题',
    title: '全排列（DFS 回溯）',
    level: '基础',
    statement: `**题目描述**

输入整数 n（1≤n≤9），按字典序输出 1~n 的所有排列，每个数字占 5 个字符宽度。`,
    input: '一个整数 n。',
    output: 'n! 行排列。',
    samples: [['3', `    1    2    3
    1    3    2
    2    1    3
    2    3    1
    3    1    2
    3    2    1`]],
    analysis: `### 解题思路

经典回溯：用 \`used\` 标记数字是否已选，递归层数表示填到第几个；
每层从小到大尝试未用数字，保证字典序；递归返回前撤销选择。
输出用 \`setw(5)\` 控制宽度。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int n, perm[10];
bool used[10];

void dfs(int depth) {
    if (depth == n) {
        for (int i = 0; i < n; i++) cout << setw(5) << perm[i];
        cout << '\\n';
        return;
    }
    for (int x = 1; x <= n; x++) if (!used[x]) {
        used[x] = true;
        perm[depth] = x;
        dfs(depth + 1);
        used[x] = false;
    }
}
int main() {
    cin >> n;
    dfs(0);
    return 0;
}`,
  },

  /* ---- search-bfs：马的遍历 ---- */
  'search-bfs': {
    source: '洛谷 P1443 马的遍历',
    title: '马的遍历（BFS 最短路）',
    level: '挑战',
    statement: `**题目描述**

在 n×m 的棋盘上有一个马（走"日"字），从给定起点出发，求马走到每个格子的最少步数；
走不到输出 -1。`,
    input: '一行 n m 起点x 起点y。',
    output: 'n 行 m 列，每个数左对齐占 5 格。',
    samples: [['3 3 1 1', `0    3    2
3    -1   1
2    1    4`]],
    analysis: `### 解题思路

马每走一步代价都是 1，用 BFS 保证第一次到达即最短。八个方向数组：
\`(±1,±2)、(±2,±1)\`。距离数组初始 −1，起点 0 入队，按层扩展。输出 \`left\` 左对齐 + \`setw(5)\`。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int dist[405][405];
int dx[8] = {1,1,-1,-1,2,2,-2,-2};
int dy[8] = {2,-2,2,-2,1,-1,1,-1};
int main() {
    int n, m, sx, sy;
    cin >> n >> m >> sx >> sy;
    memset(dist, -1, sizeof(dist));

    queue<pair<int,int>> q;
    q.push({sx, sy});
    dist[sx][sy] = 0;
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        for (int k = 0; k < 8; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx>=1 && nx<=n && ny>=1 && ny<=m && dist[nx][ny] == -1) {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    cout << left;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++)
            cout << setw(5) << dist[i][j];
        cout << '\\n';
    }
    return 0;
}`,
  },

  /* ---- dp-linear：数字三角形 ---- */
  'dp-linear': {
    source: 'USACO · 洛谷 P1216 数字三角形',
    title: '数字三角形（路径最大和）',
    level: '基础',
    statement: `**题目描述**

给定一个 r 行的数字三角形，从顶端出发每次走到下一行相邻的左或右，求路径上数字之和的最大值。`,
    input: '第一行 r，随后 r 行，第 i 行 i 个数。',
    output: '一个整数：最大路径和。',
    samples: [['5\n7\n3 8\n8 1 0\n2 7 4 4\n4 5 2 6 5', '30']],
    analysis: `### 解题思路（自底向上）

状态 \`dp[i][j]\`：从位置 (i,j) 走到底端的最大和。转移：
\`dp[i][j] = a[i][j] + max(dp[i+1][j], dp[i+1][j+1])\`。
从倒数第二行向上算，顶端即答案。最优路径 7→3→8→7→5 = 30。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int a[1005][1005];
int main() {
    int r; cin >> r;
    for (int i = 1; i <= r; i++)
        for (int j = 1; j <= i; j++) cin >> a[i][j];

    for (int i = r - 1; i >= 1; i--)
        for (int j = 1; j <= i; j++)
            a[i][j] += max(a[i+1][j], a[i+1][j+1]);

    cout << a[1][1] << '\\n';
    return 0;
}`,
  },

  /* ---- dp-knapsack：采药 ---- */
  'dp-knapsack': {
    source: 'NOIP 2005 普及组 · 洛谷 P1048 采药',
    title: '采药（01 背包）',
    level: '基础',
    statement: `**题目描述**

辰辰有总时间 T，山洞有 M 株草药，每株有采摘时间和价值，每株至多采一次，
求在时间内能采到的最大总价值。`,
    input: '第一行 T M，随后 M 行 时间 价值。',
    output: '一个整数：最大价值。',
    samples: [['70 3\n71 100\n69 1\n1 2', '3']],
    analysis: `### 解题思路

01 背包：\`dp[j]\` 表示用时间 ≤ j 的最大价值。对每株药**倒序**枚举 j：
\`dp[j] = max(dp[j], dp[j−time] + value)\`。倒序保证每株只用一次。
样例采后两株：时间 69+1=70，价值 1+2=3。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int dp[1005];
int main() {
    int T, M; cin >> T >> M;
    for (int i = 0; i < M; i++) {
        int time, value; cin >> time >> value;
        for (int j = T; j >= time; j--)
            dp[j] = max(dp[j], dp[j - time] + value);
    }
    cout << dp[T] << '\\n';
    return 0;
}`,
  },

  };

  /* 追加到对应知识点 */
  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) {
      t.examples = t.examples || [];
      t.examples.push(R[id]);
    }
  }
})();
