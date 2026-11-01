/* ============================================================
   第二部分 · 第8章 递归与分治
   divide-conquer
   ============================================================ */
(function () {
  const T = {};

  T['divide-conquer'] = {
    chapter: '第8章 递归与分治',
    time: '约 55 分钟',
    body: `
## 一、分治三步

**分治法**把一个大问题拆成若干个同类的小问题：

1. **分解**（Divide）：把问题分成规模更小的子问题；
2. **解决**（Conquer）：子问题足够小就直接求解，否则递归继续分；
3. **合并**（Merge）：把子问题的答案组合成原问题答案。

递归是分治的“语法形式”，分治是递归的“设计思想”。

## 二、汉诺塔：最纯粹的分治

把 n 个盘 from → to，借助 via：

1. n−1 个盘 from → via；
2. 最大盘 from → to；
3. n−1 个盘 via → to。

\`\`\`cpp
void hanoi(int n, char from, char via, char to) {
    if (n == 0) return;
    hanoi(n - 1, from, to, via);
    cout << from << "->" << to << '\\n';
    hanoi(n - 1, via, from, to);
}
\`\`\`

步数 2ⁿ−1，指数增长——分治分解出的子问题数量可能很大。

## 三、归并排序 Merge Sort

思想：把数组从中间一分为二，分别排好，再把两个有序段**合并**。复杂度恒为 O(n log n)，且**稳定**。

\`\`\`cpp
int tmp[100005];
void mergeSort(int a[], int l, int r) {
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeSort(a, l, mid);       // 排左半
    mergeSort(a, mid + 1, r);   // 排右半
    // 合并两个有序段到 tmp
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r)
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p];
}
\`\`\`

归并排序最重要的副产品：**边合并边统计逆序对**（i 指向的左半元素若大于 a[j]，则左半 i..mid 全部大于 a[j]）。

## 四、快速排序 Quick Sort

思想：选一个基准 pivot，把数组划分为“≤pivot | pivot | ≥pivot”，再递归排两边。平均 O(n log n)，最坏 O(n²)，原地排序省空间。

\`\`\`cpp
void quickSort(int a[], int l, int r) {
    if (l >= r) return;
    int pivot = a[l + (r - l) / 2];
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) swap(a[i++], a[j--]);
    }
    quickSort(a, l, j);
    quickSort(a, i, r);
}
\`\`\`

STL 的 sort 正是快排思想的工业强化版（introsort，防止最坏情况）。

## 五、分治的复杂度分析

归并排序递推式：T(n) = 2T(n/2) + O(n) → O(n log n)。

直观理解：共 log n 层，每层所有子问题的处理量加起来都是 O(n)。

- 分成 2 半、合并 O(n) → O(n log n)；
- 每层只递归一边且减半 → O(log n)（二分）；
- 分成两半但不合并、只是遍历 → O(n)。

## 六、分治适用条件

1. 问题能分解为同类子问题；
2. 子问题答案能合并；
3. 子问题之间相对独立（重叠很多时更适合动态规划）。
`,
    examples: [
      {
        title: '归并排序手写与验证',
        level: '基础',
        statement: `**题目描述**

用归并排序对 n 个整数升序排序（n≤10⁵）。`,
        samples: [['6\n3 1 4 1 5 9', '1 1 3 4 5 9']],
        analysis: `### 解题思路

标准“递归两半 + 合并有序段”。注意每层合并后拷回原数组。`,
        code: `#include <iostream>
using namespace std;

int a[100005], tmp[100005];

void mergeSort(int l, int r) {
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeSort(l, mid);
    mergeSort(mid + 1, r);

    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r)
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p];
}

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    mergeSort(0, n - 1);
    for (int i = 0; i < n; i++) cout << a[i] << (i+1==n?'\\n':' ');
    return 0;
}`,
      },
      {
        title: '逆序对数量（归并排序经典应用）',
        level: '挑战',
        statement: `**题目描述**

给定 n 个数（n≤10⁵），求逆序对数目：满足 i<j 且 a[i]>a[j] 的数对数量。`,
        samples: [['4\n4 3 2 1', '6']],
        analysis: `### 解题思路

O(n²) 枚举太慢。归并合并时，若 a[i]>a[j]，左半 [i,mid] 都比 a[j] 大，贡献 mid-i+1 个逆序对，随后 a[j] 入列。答案最多 n(n-1)/2≈5×10⁹，必须 long long。`,
        code: `#include <iostream>
using namespace std;

int a[100005], tmp[100005];
long long ans;

void mergeCount(int l, int r) {
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeCount(l, mid);
    mergeCount(mid + 1, r);

    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) {
            tmp[k++] = a[i++];
        } else {
            ans += mid - i + 1;   // a[i..mid] 都大于 a[j]
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p];
}

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    mergeCount(0, n - 1);
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '快速排序与第 k 大',
        level: '提高',
        statement: `**题目描述**

用快速排序思想求数组中第 k 小的数（n≤10⁶），不要求整体排序。`,
        samples: [['6 3\n3 1 4 1 5 9', '3']],
        analysis: `### 解题思路（快速选择）

每次划分后基准落在位置 p：若 p==k-1 即答案；p 大了只递归左边，小了只递归右边。平均 O(n)。`,
        code: `#include <iostream>
using namespace std;

int a[1000005];

int kth(int l, int r, int k) {
    int pivot = a[l + (r - l) / 2];
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) swap(a[i++], a[j--]);
    }
    // 划分后：[l,j] <= pivot，[i,r] >= pivot
    if (k <= j) return kth(l, j, k);
    if (k >= i) return kth(i, r, k);
    return pivot;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k; cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];
    cout << kth(0, n - 1, k - 1) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**递归没有小到直接解的边界**：l>=r、n==0 这类出口漏写导致无限递归。`,
      `**合并段拷回遗漏**：tmp 合并后必须拷回 a[l..r]，否则上层拿到的还是乱序。`,
      `**逆序对计数用 int**：答案 O(n²) 量级，必须 long long。`,
      `**快排基准选得太差**：已排序数组用 a[l] 当基准退化 O(n²)；取中点或三数取中。`,
      `**划分下标 i/j 写错导致死递归**：严格保证每次区间缩小，用模板后不要随意改边界。`,
      `**把重叠子问题也用分治暴力递归**：斐波那契式重复计算应用记忆化/DP。`,
    ],
    exercises: [
      { title: '归并排序逆序对变体', level: '提高',
        statement: '求序列中“i<j 且 a[i]>2a[j]”的数对数量。',
        hint: '合并前先对每个 a[j] 用双指针统计左半 >2a[j] 的个数。' },
      { title: '二叉树式分治求和', level: '基础',
        statement: '用递归求数组最大值（左右半最大值再取大），体会分治框架。',
        hint: 'solve(l,r)：l==r 返回 a[l]。' },
      { title: '快速幂（分治指数）', level: '提高',
        statement: '用 aᵇ 的分治公式 aᵇ=a^(b/2)·a^(b/2)（b 奇再乘 a）写 O(log b) 幂函数。',
        hint: '下一章数学基础还会见面；注意 b 为偶数时只递归一次再平方。' },
      { title: '棋盘覆盖（选做）', level: '挑战',
        statement: '2ᵏ×2ᵏ 棋盘缺一格，用 L 型骨牌恰好覆盖其余格子，输出方案。',
        hint: '在中心放一块 L 牌制造四个同样缺一格的子棋盘，递归四分。' },
    ],
    summary: `
- 分治三步：**分解 → 递归解决 → 合并**；汉诺塔是最简形态；
- 归并排序 O(n log n) 稳定，副产品是 O(n log n) 求逆序对；
- 快速排序原地平均 O(n log n)，快速选择平均 O(n) 求第 k 小；
- 递推式 T(n)=2T(n/2)+O(n) 对应 O(n log n)；子问题大量重叠时应改用动态规划。
`,
  };

  Object.assign(window.TOPICS, T);
})();
