/* ============================================================
   第二部分 · 第7章 二分
   binary-search
   ============================================================ */
(function () {
  const T = {};

  T['binary-search'] = {
    chapter: '第7章 二分',
    time: '约 50 分钟',
    body: `
## 一、从“猜数字”理解二分

1~100 中想好一个数，每次告诉你“大了/小了”，最少几次必中？7 次——每次排除一半。

**二分查找**就是这个游戏：在**有序**序列中，每次用中点与目标比较，排除一半区间，复杂度 O(log n)。100 万个元素只需约 20 次比较。

## 二、基础二分：在升序数组中找 x

\`\`\`cpp
int binarySearch(int a[], int n, int x) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;   // 防溢出的中点写法
        if (a[mid] == x) return mid;
        if (a[mid] < x) l = mid + 1; // x 在右半
        else r = mid - 1;            // x 在左半
    }
    return -1;                       // 没找到
}
\`\`\`

关键细节：

- \`mid = l + (r-l)/2\` 等价 (l+r)/2 但不会整数溢出；
- 区间移动必须 \`mid±1\`，否则可能死循环；
- 循环条件 \`l<=r\`，因为最后一个元素也要检查。

## 三、二分的真正威力：找边界（lower_bound / upper_bound）

当数组中有重复元素，常见需求是“第一个 ≥ x 的位置”：

\`\`\`cpp
// lower_bound：第一个 >= x 的位置（找不到返回 n）
int lowerBound(int a[], int n, int x) {
    int l = 0, r = n;          // 左闭右开 [l,r)
    while (l < r) {
        int mid = (l + r) / 2;
        if (a[mid] >= x) r = mid;
        else l = mid + 1;
    }
    return l;
}
\`\`\`

- **lower_bound**：第一个 ≥ x；
- **upper_bound**：第一个 > x（把判断改成 \`a[mid] > x\`）；
- 二者位置之差就是 x 出现的次数。

STL 现成版本（要求区间已升序）：

\`\`\`cpp
int p = lower_bound(a, a + n, x) - a;   // 下标
int cnt = upper_bound(a, a+n, x) - lower_bound(a, a+n, x);
\`\`\`

## 四、二分答案：把“求最优”变成“判可行”（重点难点）

当题目满足：**答案具有单调性**——若方案 P 可行，则所有比 P 更宽松的方案都可行，就可以二分答案，把最优化问题转化为一个判定问题。

经典特征：“最大值最小”“最小值最大”“至少/至多需要多少”。

### 模板（求最小可行值）

\`\`\`cpp
long long l = 下界, r = 上界, ans = 上界;
while (l <= r) {
    long long mid = (l + r) / 2;
    if (check(mid)) { ans = mid; r = mid - 1; }  // 可行：试着更小
    else l = mid + 1;                             // 不可行：必须更大
}
cout << ans;
\`\`\`

难点从来不在二分本身，而在 \`check(mid)\`：**如何 O(n) 判断某个答案值是否可行**。

### 经典例：伐木工人

每棵树高 hᵢ，锯片高度 H，砍下的部分是 max(0, hᵢ-H)。要得到至少 M 米木材，求最大的 H。

\`\`\`cpp
bool check(long long H) {
    long long got = 0;
    for (int i = 0; i < n; i++)
        if (h[i] > H) got += h[i] - H;
    return got >= M;          // H 越低木材越多，单调
}
// H=0 必然可行（全部砍下），H=最高树 必然得 0；二分最大可行 H
\`\`\`

## 五、使用二分的前提与自检

1. 序列**有序**（查找）或答案**单调**（二分答案）；
2. 边界想清楚：区间闭/开、找不到返回什么；
3. mid 溢出、死循环（l=mid 与 r=mid 配对时中点要上取整）；
4. 整数二分与实数二分区别：实数用 \`while(r-l > 1e-7)\` 且 mid 不做 ±1。
`,
    examples: [
      {
        title: '数字出现次数',
        level: '基础',
        statement: `**题目描述**

升序数组含重复元素。给定 x，输出 x 出现的次数（用 lower_bound/upper_bound 思想手写）。`,
        samples: [['8 3\n1 2 3 3 3 5 7 9', '3']],
        analysis: `### 解题思路

第一个 ≥x 与第一个 >x 的位置之差即次数。手写两个二分各 O(log n)。`,
        code: `#include <iostream>
using namespace std;

int a[100005];

int lowerBound(int n, int x) {     // 第一个 >= x
    int l = 0, r = n;
    while (l < r) {
        int mid = (l + r) / 2;
        if (a[mid] >= x) r = mid;
        else l = mid + 1;
    }
    return l;
}
int upperBound(int n, int x) {     // 第一个 > x
    int l = 0, r = n;
    while (l < r) {
        int mid = (l + r) / 2;
        if (a[mid] > x) r = mid;
        else l = mid + 1;
    }
    return l;
}

int main() {
    int n, x;
    cin >> n >> x;
    for (int i = 0; i < n; i++) cin >> a[i];
    cout << upperBound(n, x) - lowerBound(n, x) << '\\n';
    return 0;
}`,
      },
      {
        title: '砍树（二分答案入门）',
        level: '提高',
        statement: `**题目描述**

n 棵树高度 hᵢ（n≤10⁶，h≤2×10⁹），选锯片高度 H，得到 Σmax(0,hᵢ-H) 的木材。需要**至少** M 米，求 H 的最大整数取值。`,
        samples: [['4 7\n20 15 10 17', '15']],
        analysis: `### 解题思路

单调性：H 越小木材越多。check(H)=“木材≥M”因此对 H 单调（可行→不可行有一个分界点）。二分找“最后一个可行值”。`,
        code: `#include <iostream>
using namespace std;

int n;
long long M, h[1000005];

bool check(long long H) {
    long long got = 0;
    for (int i = 0; i < n; i++)
        if (h[i] > H) got += h[i] - H;
    return got >= M;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> M;
    long long mx = 0;
    for (int i = 0; i < n; i++) { cin >> h[i]; if (h[i] > mx) mx = h[i]; }

    long long l = 0, r = mx, ans = 0;
    while (l <= r) {
        long long mid = (l + r) / 2;
        if (check(mid)) { ans = mid; l = mid + 1; }  // 可行：尝试更高
        else r = mid - 1;
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '二分求平方根（实数二分）',
        level: '基础',
        statement: `**题目描述**

输入非负实数 x（x≤10⁹），用实数二分求 √x，保留 6 位小数。禁止直接调 sqrt。`,
        samples: [['2', '1.414214']],
        analysis: `### 解题思路

在 [0,max(1,x)] 上二分 mid，比较 mid² 与 x。实数二分没有 ±1，循环到区间足够短（比要求精度多两位，取 1e-8）。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double x;
    cin >> x;

    double l = 0, r = x < 1 ? 1 : x;
    while (r - l > 1e-8) {           // 区间足够小
        double mid = (l + r) / 2;
        if (mid * mid < x) l = mid;  // 实数二分：直接赋值，无 ±1
        else r = mid;
    }
    cout << fixed << setprecision(6) << l << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**未排序就二分**：二分前提是有序；二分答案前提是单调性。`,
      `**(l+r)/2 溢出**：l、r 是 int 且接近 2×10⁹ 时相加溢出，写 l+(r-l)/2。`,
      `**边界更新不配套导致死循环**：l=mid 必须配 mid 上取整（l+(r-l+1)/2）；l=mid+1 配普通中点。`,
      `**check 里类型用 int**：累加量往往巨大，sum、mid 用 long long。`,
      `**上界取得太小**：二分答案时 r 要是“必然可行/不可行”的极端值，常用 0、10¹⁸、max 元素。`,
      `**实数二分用整数 ±1 或判 ==**：用区间长度 1e-7 之类做终止条件。`,
    ],
    exercises: [
      { title: '查找第一个和最后一个位置', level: '基础',
        statement: '升序数组中找 x 的首尾下标，没有输出 -1 -1。',
        hint: '就是 lower_bound 与 upper_bound-1。' },
      { title: '二分插入位置', level: '基础',
        statement: '升序数组中插入 x 使其仍有序，输出插入下标。',
        hint: '即第一个 ≥x 的位置。' },
      { title: '跳石头（NOIP 真题）', level: '挑战',
        statement: '河中石头坐标序列，最多移走 m 块，求选手最短跳跃距离的最大值。',
        hint: '二分答案 d，check 贪心统计“间隔≥d”需要移走多少块石头。' },
      { title: '分配书籍', level: '挑战',
        statement: 'n 本书按顺序分给 k 个人（每人分到连续段），求最大页数总和的最小值。',
        hint: '二分每人容量 S，check 顺序累加统计最少需要几个人。' },
    ],
    summary: `
- 有序序列中 O(log n) 查找：中点比较、区间减半，\`mid=l+(r-l)/2\` 防溢出；
- 必会 lower_bound（第一个 ≥x）与 upper_bound（第一个 >x），可手写也可直接调 STL；
- **二分答案**适用于“最大最小/最小最大”类单调问题，核心是写 O(n) 的 check；
- 区分整数二分（±1、防死循环）与实数二分（精度阈值、无 ±1）。
`,
  };

  Object.assign(window.TOPICS, T);
})();
