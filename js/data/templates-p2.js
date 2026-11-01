/* ============================================================
   核心模板速记 · 第二部分（CSP-J 普及篇）
   结构：TEMPLATES[知识点id] = [{ title, note?, code }]
   code 为 Markdown 代码围栏，全部是可直接编译运行的完整 C++17 程序。
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  /* ================= 第4章 排序 ================= */
  'sort-basic': [
    {
      title: '冒泡排序（稳定 · O(n²)）',
      note: '相邻两两比较，大的往后"冒泡"；某轮无交换说明已经有序，可提前结束。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {   // 每轮把最大值送到末尾
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;                    // 已经有序
    }
}

int main() {
    int n; cin >> n;
    int a[1005];
    for (int i = 0; i < n; i++) cin >> a[i];
    bubbleSort(a, n);
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
    {
      title: '选择排序（不稳定 · O(n²)）',
      note: '每轮从未排序部分选出最小值，与未排序部分首位交换。交换次数最少（n−1 次）。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int mn = i;                             // 最小值下标
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[mn]) mn = j;
        swap(a[i], a[mn]);
    }
}

int main() {
    int n; cin >> n;
    int a[1005];
    for (int i = 0; i < n; i++) cin >> a[i];
    selectionSort(a, n);
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
    {
      title: '插入排序（稳定 · O(n²)）',
      note: '像理扑克牌：把当前牌插入前面已排好的序列，边找位置边后移。对近乎有序的数据很快。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int x = a[i], j = i - 1;
        while (j >= 0 && a[j] > x) {
            a[j + 1] = a[j];                    // 元素后移腾位置
            j--;
        }
        a[j + 1] = x;
    }
}

int main() {
    int n; cin >> n;
    int a[1005];
    for (int i = 0; i < n; i++) cin >> a[i];
    insertionSort(a, n);
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
  ],

  'sort-bucket': [
    {
      title: '计数排序（稳定 · O(n+V)）',
      note: '值域 V 不大时用桶统计每个值出现次数，再按值从小到大倒出。要求数据是非负整数。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;
    const int MAXV = 100000;
    int cnt[MAXV + 1] = {};                     // 全部初始化为 0
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        cnt[x]++;                               // 入桶
    }
    for (int v = 0; v <= MAXV; v++)             // 按值从小到大
        for (int k = 0; k < cnt[v]; k++)
            cout << v << ' ';                   // 倒出
    return 0;
}
\`\`\``,
    },
    {
      title: 'sort 结构体多关键字排序',
      note: '用 lambda 写比较函数：第一关键字不同比第一关键字，相同再比下一个。',
      code:
`\`\`\`cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    int score, age;
    string name;
};

int main() {
    int n; cin >> n;
    vector<Student> v(n);
    for (auto &s : v) cin >> s.score >> s.age >> s.name;

    // 分数降序 → 分数相同时年龄升序 → 再相同时姓名按字典序
    sort(v.begin(), v.end(), [](const Student &a, const Student &b) {
        if (a.score != b.score) return a.score > b.score;
        if (a.age != b.age) return a.age < b.age;
        return a.name < b.name;
    });

    for (const auto &s : v)
        cout << s.score << ' ' << s.age << ' ' << s.name << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第5章 高精度 ================= */
  'bigint': [
    {
      title: '高精度加法（非负大整数）',
      note: '从低位到高位逐位相加，逢十进一。和的位数最多比加数多 1 位。',
      code:
`\`\`\`cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string bigAdd(const string &A, const string &B) {
    int i = (int)A.size() - 1;
    int j = (int)B.size() - 1;
    int carry = 0;
    string res;
    while (i >= 0 || j >= 0 || carry) {         // 还有位或进位就继续
        int x = i >= 0 ? A[i--] - '0' : 0;
        int y = j >= 0 ? B[j--] - '0' : 0;
        int s = x + y + carry;
        res.push_back(char('0' + s % 10));
        carry = s / 10;
    }
    reverse(res.begin(), res.end());            // 结果是倒着攒出来的
    return res;
}

int main() {
    string a, b; cin >> a >> b;
    cout << bigAdd(a, b) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '高精度减法（A ≥ B ≥ 0）',
      note: '逐位相减，不够减就借一当十；结果要去掉前导零。若 A<B 先交换两数并输出负号。',
      code:
`\`\`\`cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool notLess(const string &a, const string &b) { // a >= b?
    if (a.size() != b.size()) return a.size() > b.size();
    return a >= b;
}

string bigSub(const string &A, const string &B) { // 要求 A >= B
    int i = (int)A.size() - 1;
    int j = (int)B.size() - 1;
    int borrow = 0;
    string res;
    while (i >= 0) {
        int x = A[i--] - '0';
        int y = j >= 0 ? B[j--] - '0' : 0;
        int d = x - y - borrow;
        if (d < 0) { d += 10; borrow = 1; }      // 借位
        else borrow = 0;
        res.push_back(char('0' + d));
    }
    while (res.size() > 1 && res.back() == '0') res.pop_back();
    reverse(res.begin(), res.end());
    return res;
}

int main() {
    string a, b; cin >> a >> b;
    if (notLess(a, b)) cout << bigSub(a, b);
    else cout << '-' << bigSub(b, a);
    cout << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第6章 贪心 ================= */
  'greedy': [
    {
      title: '区间调度：最多不相交区间',
      note: '按右端点从小到大排序，能选就选（起点不早于上一个选中区间的终点）。证明交换法。',
      code:
`\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Interval { int l, r; };

int main() {
    int n; cin >> n;
    vector<Interval> v(n);
    for (auto &seg : v) cin >> seg.l >> seg.r;

    sort(v.begin(), v.end(),
         [](const Interval &a, const Interval &b) { return a.r < b.r; });

    int cnt = 0, lastEnd = -1000000000;
    for (const auto &seg : v) {
        if (seg.l >= lastEnd) {                  // 与上一个选中区间不相交
            cnt++;
            lastEnd = seg.r;
        }
    }
    cout << cnt << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第7章 二分 ================= */
  'binary-search': [
    {
      title: '整数二分：第一个 ≥ x 的位置',
      note: '左闭右开区间 [lo, hi)，mid 用 lo+(hi-lo)/2 防溢出；也可直接用 STL 的 lower_bound。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int lowerBound(int a[], int n, int x) {
    int lo = 0, hi = n;                          // [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] >= x) hi = mid;               // 答案在 mid 或更左
        else lo = mid + 1;
    }
    return lo;                                  // ==n 表示不存在
}

int main() {
    int n, x; cin >> n >> x;
    int a[100005];
    for (int i = 0; i < n; i++) cin >> a[i];     // 必须已经升序
    int pos = lowerBound(a, n, x);
    cout << (pos < n ? pos : -1) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '二分答案：最大值最小 / 最小值最大',
      note: '答案具有单调性时，把"求答案"变成"判断可行性"。上界型 mid 要向上取整 (lo+hi+1)/2。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

/* 例题：n 根木头，截出至少 k 段等长木料，求每段最大长度 */
int n; long long k;
long long len[100005];

bool check(long long L) {                        // 每段长 L 是否可行
    long long pieces = 0;
    for (int i = 0; i < n; i++) pieces += len[i] / L;
    return pieces >= k;
}

int main() {
    cin >> n >> k;
    long long hi = 0;
    for (int i = 0; i < n; i++) { cin >> len[i]; hi = max(hi, len[i]); }
    long long lo = 0;                            // 区间 [lo, hi]
    while (lo < hi) {
        long long mid = (lo + hi + 1) / 2;       // 向上取整防死循环
        if (check(mid)) lo = mid;                // 可行，试着更大
        else hi = mid - 1;
    }
    cout << lo << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第8章 递归与分治 ================= */
  'divide-conquer': [
    {
      title: '归并排序（稳定 · O(n log n)）',
      note: '两半分别排好序后合并；借助辅助数组。加一行计数就能顺带求逆序对数量。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN], tmp[MAXN];

void mergeSort(int l, int r) {                   // 排序区间 [l, r)
    if (r - l <= 1) return;
    int mid = l + (r - l) / 2;
    mergeSort(l, mid);
    mergeSort(mid, r);
    int i = l, j = mid, k = l;
    while (i < mid && j < r)                     // 两半都还有元素
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i < mid) tmp[k++] = a[i++];
    while (j < r)   tmp[k++] = a[j++];
    for (int p = l; p < r; p++) a[p] = tmp[p];   // 拷回原数组
}

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    mergeSort(0, n);
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
    {
      title: '快速排序（平均 O(n log n)）',
      note: '选基准值，小的换左边、大的换右边，再递归两侧。最坏 O(n²)（数据特殊时），竞赛更常用 sort。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void quickSort(int a[], int l, int r) {          // 排序区间 [l, r]
    if (l >= r) return;
    int pivot = a[l + (r - l) / 2];              // 取中间值作基准
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) swap(a[i++], a[j--]);
    }
    quickSort(a, l, j);
    quickSort(a, i, r);
}

int main() {
    int n; cin >> n;
    int a[100005];
    for (int i = 0; i < n; i++) cin >> a[i];
    quickSort(a, 0, n - 1);
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第9章 前缀和与差分 ================= */
  'prefix-diff': [
    {
      title: '一维前缀和：O(1) 求区间和',
      note: 'pre[i] 表示前 i 个数之和；区间 [l,r] 之和 = pre[r] − pre[l−1]。下标从 1 开始最省心。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 100005;
long long pre[MAXN];                             // 前缀和用 long long

int main() {
    int n, q; cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        long long x; cin >> x;
        pre[i] = pre[i - 1] + x;
    }
    while (q--) {
        int l, r; cin >> l >> r;
        cout << pre[r] - pre[l - 1] << '\\n';
    }
    return 0;
}
\`\`\``,
    },
    {
      title: '二维前缀和：O(1) 求子矩阵和',
      note: 'S[i][j] = a[i][j] + 上 + 左 − 左上（重复减了要加回）。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 1005;
long long S[MAXN][MAXN];

int main() {
    int n, m, q; cin >> n >> m >> q;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            long long x; cin >> x;
            S[i][j] = x + S[i-1][j] + S[i][j-1] - S[i-1][j-1];
        }
    while (q--) {
        int x1, y1, x2, y2; cin >> x1 >> y1 >> x2 >> y2;
        cout << S[x2][y2] - S[x1-1][y2] - S[x2][y1-1] + S[x1-1][y1-1]
             << '\\n';
    }
    return 0;
}
\`\`\``,
    },
    {
      title: '一维差分：O(1) 区间加，最后还原',
      note: '区间 [l,r] 加 v：d[l]+=v, d[r+1]−=v；全部修改完成后做一次前缀和得到结果数组。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 100005;
long long d[MAXN];

int main() {
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) {               // 用原数组初始化差分
        long long x; cin >> x;
        d[i] += x; d[i + 1] -= x;
    }
    while (m--) {                                // m 次区间加法
        int l, r; long long v; cin >> l >> r >> v;
        d[l] += v;
        d[r + 1] -= v;
    }
    for (int i = 1; i <= n; i++) {               // 前缀和还原
        d[i] += d[i - 1];
        cout << d[i] << ' ';
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第10章 搜索 ================= */
  'search-dfs': [
    {
      title: '回溯法：输出 1~n 的全排列',
      note: '选一个数 → 标记 → 递归 → 撤销标记。所有排列/组合/子集问题都是这个骨架。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 15;
int n, p[MAXN];
bool used[MAXN];

void dfs(int depth) {
    if (depth == n) {                            // 递归边界：排满 n 个
        for (int i = 0; i < n; i++) cout << p[i] << ' ';
        cout << '\\n';
        return;
    }
    for (int x = 1; x <= n; x++) {
        if (used[x]) continue;
        used[x] = true; p[depth] = x;            // 做选择
        dfs(depth + 1);
        used[x] = false;                         // 撤销选择（回溯）
    }
}

int main() {
    cin >> n;
    dfs(0);
    return 0;
}
\`\`\``,
    },
    {
      title: '迷宫 DFS：判断能否到达终点',
      note: '从起点沿四个方向深度试探，走不通就回退；只回答"能不能到"，求最短步数请用 BFS。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 105;
int n, m, ex, ey;
char grid[MAXN][MAXN];
bool vis[MAXN][MAXN];
bool found = false;
const int dx[4] = {-1, 1, 0, 0};
const int dy[4] = {0, 0, -1, 1};

void dfs(int x, int y) {
    if (x == ex && y == ey) { found = true; return; }
    vis[x][y] = true;
    for (int k = 0; k < 4; k++) {
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        if (grid[nx][ny] == '#' || vis[nx][ny]) continue;
        dfs(nx, ny);
        if (found) return;
    }
}

int main() {
    cin >> n >> m;
    int sx = 0, sy = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            cin >> grid[i][j];
            if (grid[i][j] == 'S') { sx = i; sy = j; }
            if (grid[i][j] == 'T') { ex = i; ey = j; }
        }
    dfs(sx, sy);
    cout << (found ? "yes" : "no") << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'search-bfs': [
    {
      title: '迷宫 BFS：求最短步数',
      note: '一层一层向外扩展，第一次到终点时的距离就是最短路径。用队列保存待扩展的格子。',
      code:
`\`\`\`cpp
#include <iostream>
#include <queue>
using namespace std;

const int MAXN = 105;
char grid[MAXN][MAXN];
int dist[MAXN][MAXN];                            // -1 表示未访问
const int dx[4] = {-1, 1, 0, 0};
const int dy[4] = {0, 0, -1, 1};

int main() {
    int n, m; cin >> n >> m;
    int sx = 0, sy = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            cin >> grid[i][j];
            if (grid[i][j] == 'S') { sx = i; sy = j; }
        }

    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) dist[i][j] = -1;

    queue<pair<int,int>> q;
    dist[sx][sy] = 0;
    q.push({sx, sy});
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
            if (grid[nx][ny] == '#' || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;       // 多走一步
            q.push({nx, ny});
        }
    }

    int tx = 0, ty = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (grid[i][j] == 'T') { tx = i; ty = j; }
    cout << dist[tx][ty] << '\\n';                // -1 表示不可达
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第11章 动态规划入门 ================= */
  'dp-linear': [
    {
      title: '数字三角形：自上而下的 DP',
      note: '每个位置只能来自左上或正上，取两条路径的较优者。注意边界（靠边的位置只有一个来源）。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 505;
int dp[MAXN][MAXN];

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++) {
            int x; cin >> x;
            dp[i][j] = x + max(dp[i-1][j-1], dp[i-1][j]);
        }
    cout << *max_element(dp[n] + 1, dp[n] + n + 1) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'LIS 最长上升子序列 O(n²)',
      note: 'f[i] 表示以 a[i] 结尾的 LIS 长度；在前面所有更小的元素中取最优再接上自己。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 1005;
int a[MAXN], f[MAXN];

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        f[i] = 1;                                // 只取自己
        for (int j = 1; j < i; j++)
            if (a[j] < a[i])
                f[i] = max(f[i], f[j] + 1);
        ans = max(ans, f[i]);
    }
    cout << ans << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'dp-knapsack': [
    {
      title: '01 背包：每种物品只有一个',
      note: '容量必须倒序枚举，保证每件物品最多被选一次；正序就变成完全背包了。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXW = 1005;
int f[MAXW];                                     // f[c]：容量 c 的最大价值

int main() {
    int n, W; cin >> n >> W;
    for (int i = 1; i <= n; i++) {
        int w, v; cin >> w >> v;
        for (int c = W; c >= w; c--)             // 倒序！
            f[c] = max(f[c], f[c - w] + v);
    }
    cout << f[W] << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '完全背包：每种物品无限个',
      note: '容量正序枚举，同一物品可被反复选取；与 01 背包只差一个循环方向。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXW = 1005;
int f[MAXW];

int main() {
    int n, W; cin >> n >> W;
    for (int i = 1; i <= n; i++) {
        int w, v; cin >> w >> v;
        for (int c = w; c <= W; c++)             // 正序！
            f[c] = max(f[c], f[c - w] + v);
    }
    cout << f[W] << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第12章 数学基础 ================= */
  'math-prime': [
    {
      title: '试除法判断质数 O(√n)',
      note: '只需试除到 √n，因为因数成对出现；循环变量用 long long 防止 i*i 溢出。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

int main() {
    long long n; cin >> n;
    cout << (isPrime(n) ? "Yes" : "No") << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '埃氏筛：一次预处理，O(1) 判质',
      note: '遇到质数就标记它的所有倍数；从 i² 开始标记即可。复杂度 O(n log log n)。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 1000005;
bool notPrime[MAXN];

int main() {
    int n; cin >> n;
    notPrime[0] = notPrime[1] = true;
    for (int i = 2; 1LL * i * i <= n; i++)
        if (!notPrime[i])
            for (int j = i * i; j <= n; j += i)
                notPrime[j] = true;
    int q; cin >> q;
    while (q--) {
        int x; cin >> x;
        cout << (!notPrime[x] ? "Yes" : "No") << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  'math-gcd-power': [
    {
      title: 'GCD 最大公约数 与 LCM',
      note: '欧几里得算法 gcd(a,b)=gcd(b,a mod b)；LCM 先除后乘防溢出：a/gcd(a,b)*b。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}

int main() {
    long long a, b; cin >> a >> b;
    long long g = gcd(a, b);
    cout << "gcd = " << g << '\\n';
    cout << "lcm = " << a / g * b << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '快速幂：O(log b) 求 aᵇ mod m',
      note: '把指数按二进制拆：这一位是 1 就乘进答案，底数每轮平方、指数右移。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

long long qpow(long long a, long long b, long long mod) {
    long long res = 1;
    while (b > 0) {
        if (b & 1) res = res * a % mod;          // 乘入当前底数
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

int main() {
    long long a, b, m; cin >> a >> b >> m;
    cout << qpow(a, b, m) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '进制转换：十进制 → 任意进制（2~16）',
      note: '不断除基取余，余数倒序排列；10~15 用 A~F 表示。反向转换则按位累加。',
      code:
`\`\`\`cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string toBase(long long n, int base) {
    if (n == 0) return "0";
    const char digits[] = "0123456789ABCDEF";
    string s;
    while (n > 0) {
        s.push_back(digits[n % base]);
        n /= base;
    }
    reverse(s.begin(), s.end());                // 余数是倒着得到的
    return s;
}

int main() {
    long long n; int base; cin >> n >> base;
    cout << toBase(n, base) << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第13章 栈、队列与树 ================= */
  'ds-stack-queue': [
    {
      title: '栈：括号匹配',
      note: '左括号入栈，遇右括号时栈顶必须是匹配的左括号；最后栈为空才完全匹配。',
      code:
`\`\`\`cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool matchBrackets(const string &s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            bool ok = (c == ')' && top == '(')
                   || (c == ']' && top == '[')
                   || (c == '}' && top == '{');
            if (!ok) return false;
        }
    }
    return st.empty();                           // 剩余未闭合的左括号
}

int main() {
    string s; cin >> s;
    cout << (matchBrackets(s) ? "Yes" : "No") << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第13章 树与二叉树 ================= */
  'tree-basic': [
    {
      title: '二叉树 DFS：前序 / 中序 / 后序遍历',
      note: '用 lc[u]/rc[u] 存左右孩子（0 表示无）。三者只差"访问根"的位置：前序根→左右、中序左→根→右、后序左右→根。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

const int MAXN = 100005;
int val[MAXN], lc[MAXN], rc[MAXN];

void preorder(int u)  { if (!u) return; cout << val[u] << ' '; preorder(lc[u]);  preorder(rc[u]); }
void inorder(int u)   { if (!u) return; inorder(lc[u]);  cout << val[u] << ' '; inorder(rc[u]); }
void postorder(int u) { if (!u) return; postorder(lc[u]); postorder(rc[u]); cout << val[u] << ' '; }

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;                       // 节点编号 1~n，根为 1
    for (int u = 1; u <= n; u++)
        cin >> val[u] >> lc[u] >> rc[u];   // 值、左孩子、右孩子（0 表示无）
    preorder(1);  cout << '\\n';
    inorder(1);   cout << '\\n';
    postorder(1); cout << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '二叉树 BFS：层序（层次）遍历',
      note: '按层从上到下、同层从左到右访问。用队列：弹出节点时把它的左右孩子依次入队。',
      code:
`\`\`\`cpp
#include <iostream>
#include <queue>
using namespace std;

const int MAXN = 100005;
int val[MAXN], lc[MAXN], rc[MAXN];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;                       // 节点编号 1~n，根为 1
    for (int u = 1; u <= n; u++)
        cin >> val[u] >> lc[u] >> rc[u];

    queue<int> q; q.push(1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << val[u] << ' ';
        if (lc[u]) q.push(lc[u]);          // 先左
        if (rc[u]) q.push(rc[u]);          // 后右
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第1章 复杂度实测 ================= */
  'algo-complexity': [
    {
      title: '用 clock() 实测复杂度增长',
      note: 'n 扩大 10 倍时，O(n) 耗时约 ×10、O(n²) 约 ×100——亲眼看到"平方可怕在哪"。clock() 返回毫秒时钟数，除以 CLOCKS_PER_SEC 得秒。',
      code:
`\`\`\`cpp
#include <iostream>
#include <iomanip>
#include <ctime>
using namespace std;

long long work;                       // 全局累加，防止编译器把循环优化掉

double timeLinear(int n) {
    clock_t st = clock();
    long long s = 0;
    for (int i = 0; i < n; i++) s += i;
    work += s;
    return double(clock() - st) / CLOCKS_PER_SEC;
}

double timeSquare(int n) {
    clock_t st = clock();
    long long s = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) s += i + j;
    work += s;
    return double(clock() - st) / CLOCKS_PER_SEC;
}

int main() {
    int ns[3] = {1000, 10000, 100000};
    cout << fixed << setprecision(4);
    cout << "规模 n |  O(n) 秒 | O(n²) 秒\\n";
    for (int n : ns) {
        double t1 = timeLinear(n);
        double t2 = -1;
        if (n <= 10000) t2 = timeSquare(n);  // n=10⁵ 的平方要算 10¹⁰ 次，跳过
        cout << setw(7) << n << " | " << setw(8) << t1
             << " | " << setw(8) << t2 << '\\n';
    }
    cout << "（已累计 " << work << "，防止循环被优化）\\n";
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第2章 枚举法 ================= */
  'enum-method': [
    {
      title: '双重枚举：统计和为 s 的无序数对',
      note: 'j 从 i+1 开始，每个 i<j 的组合只算一次，共 n(n−1)/2 对；写 j=0 就变成 n² 个有序对。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int a[1005];

int main() {
    int n, s;
    cin >> n >> s;
    for (int i = 0; i < n; i++) cin >> a[i];

    int cnt = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)   // 无序对：j>i
            if (a[i] + a[j] == s) cnt++;

    cout << cnt << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '百元百鸡：只枚举自由变量',
      note: '公鸡5元、母鸡3元、小鸡1元3只，百元买百只。第三个数由 z=100−x−y 直接算出，少开一重循环；能由方程算的量不要枚举。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    // x 公鸡、y 母鸡、z 小鸡；只枚举自由变量 x、y
    for (int x = 0; 5 * x <= 100; x++) {
        for (int y = 0; 5 * x + 3 * y <= 100; y++) {
            int z = 100 - x - y;             // 总数方程直接算
            if (z >= 0 && z % 3 == 0
                && 5 * x + 3 * y + z / 3 == 100)
                cout << "公鸡" << x << " 母鸡" << y
                     << " 小鸡" << z << '\\n';
        }
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 模拟法 ================= */
  'simulate-method': [
    {
      title: '日期加 N 天（推进式模拟）',
      note: '把"加一天"放进循环重复 N 次：日超当月天数就进位到月、月超 12 就进位到年。月份表 + 闰年函数最稳。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

bool isLeap(int y) {
    return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
}
int daysInMonth(int y, int m) {
    int d[13] = {0,31,28,31,30,31,30,31,31,30,31,30,31};
    return (m == 2 && isLeap(y)) ? 29 : d[m];
}

int main() {
    int y, m, d, n;
    cin >> y >> m >> d >> n;        // 起始日期 + 要加的天数

    while (n--) {                  // 一天天地演过程
        d++;
        if (d > daysInMonth(y, m)) {
            d = 1;
            m++;
            if (m > 12) { m = 1; y++; }
        }
    }
    cout << y << " " << m << " " << d << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '约瑟夫环（队列模拟）',
      note: '队首报数：没到 m 就回队尾，到 m 就出列。比数组标记版代码更短，思路就是"排队→转圈"。',
      code:
`\`\`\`cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    queue<int> q;
    for (int i = 1; i <= n; i++) q.push(i);

    int cnt = 0;
    while (!q.empty()) {
        int person = q.front();
        q.pop();                    // 队首出列报数
        cnt++;
        if (cnt == m) {             // 报到 m：出列，不再回队
            cout << person << ' ';
            cnt = 0;
        } else {
            q.push(person);         // 没报到：回队尾继续
        }
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第14章 内置对拍 ================= */
  'contest-skills': [
    {
      title: '单文件内置对拍（暴力 vs 正解）',
      note: '把生成器、O(n³) 暴力、O(n) Kadane 写进同一程序，随机上万组自动比对；不一致就立刻打印出罪魁数据。以"最大子段和"为例。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

// 暴力：枚举所有子数组 [l,r] 求和，慢但绝对正确
int brute(const vector<int>& a) {
    int best = INT_MIN;
    for (int l = 0; l < (int)a.size(); l++)
        for (int r = l; r < (int)a.size(); r++) {
            int sum = 0;
            for (int k = l; k <= r; k++) sum += a[k];
            best = max(best, sum);
        }
    return best;
}

// 正解：Kadane 算法
int solve(const vector<int>& a) {
    int best = a[0], cur = a[0];
    for (int i = 1; i < (int)a.size(); i++) {
        cur = max(a[i], cur + a[i]);
        best = max(best, cur);
    }
    return best;
}

int main() {
    srand((unsigned)time(0));
    const int ROUNDS = 10000;
    for (int tc = 1; tc <= ROUNDS; tc++) {
        int n = rand() % 8 + 1;                 // 小数据 n ≤ 8
        vector<int> a(n);
        for (int &x : a) x = rand() % 21 - 10;  // -10 ~ 10

        if (brute(a) != solve(a)) {
            cout << "对拍失败！第 " << tc << " 组：\\n" << n << '\\n';
            for (int x : a) cout << x << ' ';
            cout << "\\n暴力=" << brute(a) << " 正解=" << solve(a) << '\\n';
            return 0;
        }
    }
    cout << "对拍通过：" << ROUNDS << " 组随机数据全部一致\\n";
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
