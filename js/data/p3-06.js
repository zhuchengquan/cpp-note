/* ============================================================
   第三部分 · 第6章 倍增与 ST 表
   st-table
   ============================================================ */
(function () {
  const T = {};

  T['st-table'] = {
    chapter: '第6章 倍增与 ST 表',
    time: '约 45 分钟',
    body: `
## 一、倍增思想

当一个操作“做 1 次、做 2 次、做 4 次……”的结果可以快速预处理时，就能用二进制拼出任意次数，把 O(n) 降到 O(log n)。

- 快速幂：a¹,a²,a⁴,… 拼出 aᵇ；
- 倍增 LCA：2⁰,2¹,2²… 级祖先；
- ST 表：长度 1,2,4,8… 的区间答案。

## 二、ST 表解决 RMQ

**RMQ（Range Minimum/Maximum Query）**：静态数组（不修改）上多次询问区间最值。

预处理：

- \`f[k][i]\` = 从 i 开始、长度 2ᵏ 的区间的最值；
- 边界：\`f[0][i] = a[i]\`；
- 转移：\`f[k][i] = max(f[k-1][i], f[k-1][i+2^(k-1)])\`（两个半段拼成整段）。

\`\`\`cpp
for (int k = 1; (1 << k) <= n; k++)
    for (int i = 1; i + (1 << k) - 1 <= n; i++)
        f[k][i] = max(f[k-1][i], f[k-1][i + (1 << (k-1))]);
\`\`\`

查询 [l,r]：令 k = ⌊log₂(r-l+1)⌋，用两个长度 2ᵏ 的区间**覆盖**整个 [l,r]（允许重叠！最值可重复覆盖，和不行）：

\`\`\`cpp
int k = lg[r - l + 1];
ans = max(f[k][l], f[k][r - (1 << k) + 1]);
\`\`\`

预处理 O(n log n)，每次询问 O(1)。

## 三、log 表预处理

避免每次调用 log 函数：

\`\`\`cpp
lg[1] = 0;
for (int i = 2; i <= n; i++) lg[i] = lg[i/2] + 1;
\`\`\`

## 四、ST 表的边界

- 只适用于**静态**数据：有修改请用线段树；
- 可维护“可重复贡献”的信息：max/min、gcd、按位与/或；
- **不能求区间和**：重叠部分会重复计算（和不满足幂等性）。
`,
    examples: [
      {
        title: '静态区间最大值（RMQ 模板）',
        level: '基础',
        statement: `**题目描述**

n 个数，q 次询问区间最大值（无修改）。n,q≤10⁵。`,
        samples: [['5 3\n1 9 3 7 5\n1 5\n2 4\n3 3', '9\n9\n3']],
        analysis: `### 解题思路

建表 f[k][i]，查询时两段 2ᵏ 覆盖。下标从 1 开始，数组开 log₂(n)+1 层。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005, K = 20;
int f[K][MAXN], lg[MAXN];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q; cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> f[0][i];

    lg[1] = 0;
    for (int i = 2; i <= n; i++) lg[i] = lg[i/2] + 1;

    for (int k = 1; (1 << k) <= n; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            f[k][i] = max(f[k-1][i], f[k-1][i + (1 << (k-1))]);

    while (q--) {
        int l, r; cin >> l >> r;
        int k = lg[r - l + 1];
        cout << max(f[k][l], f[k][r - (1 << k) + 1]) << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '区间 GCD 查询',
        level: '提高',
        statement: `**题目描述**

静态数组多次询问区间最大公约数。`,
        samples: [['5 2\n12 18 24 7 14\n1 3\n4 5', '6\n7']],
        analysis: `### 解题思路

gcd 满足重叠不改变结果（幂等），可以照搬 ST 表，把 max 换成 gcd。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005, K = 20;
int f[K][MAXN], lg[MAXN];
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> f[0][i];
    for (int i = 2; i <= n; i++) lg[i] = lg[i/2] + 1;
    for (int k = 1; (1<<k) <= n; k++)
        for (int i = 1; i + (1<<k) - 1 <= n; i++)
            f[k][i] = __gcd(f[k-1][i], f[k-1][i + (1<<(k-1))]);
    while (q--) {
        int l, r; cin >> l >> r;
        int k = lg[r-l+1];
        cout << __gcd(f[k][l], f[k][r-(1<<k)+1]) << '\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**用 ST 表求区间和**：重叠覆盖重复计数，求和只能前缀和/线段树。`,
      `**数组有修改还用 ST**：它是静态结构。`,
      `**层数开少**：K 取 log₂(MAXN)+1，一般 10⁵ 开 18~20。`,
      `**转移下标越界**：i+2ᵏ-1 ≤ n 才计算。`,
      `**查询覆盖起点算错**：第二段起点 r-2ᵏ+1。`,
    ],
    exercises: [
      { title: '区间最小值 RMQ', level: '入门',
        statement: '把最大值模板改为最小值。',
        hint: '只改 max 为 min。' },
      { title: '区间按位与', level: '提高',
        statement: '静态数组多次询问区间按位与。',
        hint: '与/或都满足重复覆盖不变。' },
      { title: '稀疏表二维', level: '挑战',
        statement: '静态矩阵上的矩形最大值查询。',
        hint: 'f[k1][k2][i][j] 两个方向各倍增。' },
    ],
    summary: `
- 倍增 = 用 2 的幂预处理，把线性操作降为 O(log n)；
- ST 表 f[k][i] 表示起点 i、长度 2ᵏ 的区间信息，O(n log n) 预处理；
- RMQ 查询：两段长度 2ᵏ 的区间覆盖 [l,r]，O(1) 得最值；
- 仅适用静态数据与可重复贡献信息（max/min/gcd/位运算），不能求和。
`,
  };

  Object.assign(window.TOPICS, T);
})();
