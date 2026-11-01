/* ============================================================
   第三部分 · 第9章 动态规划进阶
   knapsack-advanced / dp-interval
   ============================================================ */
(function () {
  const T = {};

  T['knapsack-advanced'] = {
    chapter: '第9章 动态规划进阶',
    time: '约 55 分钟',
    body: `
## 一、多重背包

每种物品有数量 cᵢ 件。朴素做法是展开成 c 件 01 背包，O(n·c·W) 太慢。

**二进制拆分**：把 c 拆成 1,2,4,…,2ᵏ,余数 这若干组，每组当一个“大物品”，组数 O(log c)，转 01 背包：

\`\`\`cpp
for (int i = 0; i < n; i++) {
    int w, v, c; cin >> w >> v >> c;
    for (int k = 1; c > 0; k <<= 1) {
        int take = min(k, c);
        for (int j = W; j >= take*w; j--)
            f[j] = max(f[j], f[j-take*w] + take*v);
        c -= take;
    }
}
\`\`\`

更强的 O(nW) 单调队列优化在进一步学习中掌握。

## 二、分组背包

物品分成若干组，每组**至多选一件**：

\`\`\`cpp
for (每组 g)
    for (int j = W; j >= 0; j--)        // 容量在外、倒序
        for (组内每件物品 k)
            if (j >= w[k]) f[j] = max(f[j], f[j-w[k]] + v[k]);
\`\`\`

关键顺序：**组 → 容量（倒序）→ 组内物品**，保证同组不会选两件。

## 三、有依赖的背包

选某个“附件”前必须先选“主件”（如 NOIP 金明的预算方案）。对每个主件，先用其附件做一次子集枚举/01 背包，得到“选该主件时”的一组 (花费,价值) 方案，再把整组当分组背包处理。

树形依赖（选课问题）用树形背包（见树 DP 章）。

## 四、背包方案数与具体方案

- 方案数：\`g[0]=1\`，每次转移 g[j]+=g[j-w]（注意与价值最优的组合：只在更优时覆盖、相等时累加）；
- 具体方案：保留二维 f[i][j] 或记录选择路径，从 f[n][W] 反推每件选没选；
- “至少装满”类：可把状态平移或允许下标越下界截断。
`,
    examples: [
      {
        title: '多重背包（二进制拆分）',
        level: '提高',
        statement: `**题目描述**

n 种物品，每种有重量、价值、数量 c，容量 W，求最大价值。n≤100，W≤10⁵。`,
        samples: [['2 10\n2 3 3\n3 4 2', '14']],
        analysis: `### 解题思路

二进制把 c 拆成 O(log c) 组，套用 01 背包。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long f[100005];
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, W; cin >> n >> W;
    for (int i = 0; i < n; i++) {
        int w, v, c; cin >> w >> v >> c;
        for (int k = 1; c > 0; k <<= 1) {
            int take = min(k, c);
            int weight = take * w, value = take * v;
            for (int j = W; j >= weight; j--)
                f[j] = max(f[j], f[j-weight] + value);
            c -= take;
        }
    }
    cout << f[W] << '\\n';
    return 0;
}`,
      },
      {
        title: '分组背包模板',
        level: '提高',
        statement: `**题目描述**

n 组物品，每组至多选一件，容量 W，求最大价值。`,
        samples: [['10 2\n2\n2 3\n3 4\n2\n4 5\n5 6', '10']],
        analysis: `### 解题思路

三层循环顺序是本题灵魂：组 → 容量倒序 → 物品。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long f[1005];
int main() {
    int W, n; cin >> W >> n;
    for (int g = 0; g < n; g++) {
        int k; cin >> k;
        vector<int> w(k), v(k);
        for (int i = 0; i < k; i++) cin >> w[i] >> v[i];
        for (int j = W; j >= 0; j--)
            for (int i = 0; i < k; i++)
                if (j >= w[i])
                    f[j] = max(f[j], f[j-w[i]] + v[i]);
    }
    cout << f[W] << '\\n';
    return 0;
}`,
      },
      {
        title: '背包方案数（凑金额）',
        level: '提高',
        statement: `**题目描述**

每种硬币无限供应，凑出金额 S 的方案数（不计顺序，答案可能大，对 10⁹+7 取模）。`,
        samples: [['3 5\n1 2 5', '4']],
        analysis: `### 解题思路

完全背包计数：外层硬币、金额正序。f[0]=1 是边界。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;
long long f[10005];
int main() {
    int n, S; cin >> n >> S;
    f[0] = 1;
    for (int i = 0; i < n; i++) {
        int c; cin >> c;
        for (int j = c; j <= S; j++)
            f[j] = (f[j] + f[j-c]) % MOD;
    }
    cout << f[S] << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**分组背包循环顺序错**：同组选多件通常是容量在中间层且倒序导致的问题——必须“组→容量→物品”。`,
      `**二进制拆分最后一块忘记**：take=min(k,c) 处理余数。`,
      `**方案数溢出/忘记取模**：按题目要求 long long + MOD。`,
      `**完全背包倒序、01 背包正序**：再次确认方向。`,
    ],
    exercises: [
      { title: '混合背包', level: '挑战',
        statement: '物品分 01、完全、多重三类，混合求解。',
        hint: '每件按类型走对应转移。' },
      { title: '两种容量（二维费用）', level: '提高',
        statement: '物品耗钱又耗时，两个限制下求最大价值。',
        hint: 'f[j][k] 两维倒序。' },
      { title: '输出具体方案', level: '挑战',
        statement: '01 背包输出选了哪些物品。',
        hint: '保留二维 DP，从 (n,W) 逆推。' },
    ],
    summary: `
- 多重背包用**二进制拆分**转 01 背包（O(nW log c)）；
- 分组背包循环顺序：**组 → 容量倒序 → 组内物品**，保证每组至多一件；
- 有依赖背包：主件+附件先枚举主件方案，再按分组处理；树形依赖用树形背包；
- 方案数在价值相等时累加并取模，具体方案保留二维表逆推。
`,
  };

  T['dp-interval'] = {
    chapter: '第9章 动态规划进阶',
    time: '约 55 分钟',
    body: `
## 一、区间 DP 的形态

状态定义在**一段区间**上：f[l][r] 表示把区间 [l,r] 处理出的最优值。合并区间的最后一步总是把 [l,k] 与 [k+1,r] 拼起来：

\`\`\`text
f[l][r] = 最优切点 k 下合并 f[l][k] 与 f[k+1][r] 的代价
\`\`\`

枚举顺序：**区间长度 len 从小到大**，再枚举左端点 l（r=l+len−1），最后枚举切点 k。

\`\`\`cpp
for (int len = 2; len <= n; len++)
    for (int l = 1; l + len - 1 <= n; l++) {
        int r = l + len - 1;
        f[l][r] = INF;
        for (int k = l; k < r; k++)
            f[l][r] = min(f[l][r], f[l][k] + f[k+1][r] + cost(l,r));
    }
\`\`\`

## 二、经典 1：石子合并

n 堆石子排成一排，每次只能合并**相邻**两堆，代价为新堆大小，求总代价最小。

- 前缀和求区间石子总数；
- f[l][r]=min(f[l][k]+f[k+1][r])+sum(l,r)；
- 环形版本：复制一遍数组，长度 2n 上做区间 DP，取长度 n 的最优。

## 三、经典 2：括号匹配 / 最长合法括号子串

f[l][r]：区间最少添加多少括号使其合法；两端匹配时可由 f[l+1][r-1] 转移，枚举分界拆分。

## 四、经典 3：矩阵连乘

结合律决定加括号方式，最少乘法次数：f[i][j]=min(f[i][k]+f[k+1][j]+pᵢ₋₁pₖpⱼ)。

## 五、边界与初始化

- len=1 时通常 f[i][i]=0（单元素无需操作）；
- 答案 f[1][n]；
- cost 常用前缀和 O(1) 计算；
- 输出具体方案时记录 bestK[l][r]。
`,
    examples: [
      {
        title: '石子合并（线性）',
        level: '提高',
        statement: `**题目描述**

n 堆石子排成一排，每次合并相邻两堆，代价为两堆之和，求最小总代价。n≤300。`,
        samples: [['4\n1 2 3 4', '19']],
        analysis: `### 解题思路

样例最优：1+2=3（代价3），3+3=6（代价6，此时堆为 6,4），6+4=10，总计 19。

区间 DP 标准三层循环，区间和用前缀和。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long f[305][305], s[305];
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) {
        long long x; cin >> x;
        s[i] = s[i-1] + x;
    }
    for (int len = 2; len <= n; len++) {
        for (int l = 1; l + len - 1 <= n; l++) {
            int r = l + len - 1;
            f[l][r] = LLONG_MAX / 4;
            for (int k = l; k < r; k++)
                f[l][r] = min(f[l][r],
                    f[l][k] + f[k+1][r] + (s[r]-s[l-1]));
        }
    }
    cout << f[1][n] << '\\n';
    return 0;
}`,
      },
      {
        title: '环形石子合并',
        level: '挑战',
        statement: `**题目描述**

石子围成一圈，其余规则相同，求最小（及最大）总代价。`,
        samples: [['3\n1 2 3', `9
11`]],
        analysis: `### 解题思路

断环成链：把数组复制一份接到末尾，在 2n 长度上做区间 DP，枚举长度 n 的起点取最优。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long fmn[605][605], fmx[605][605], s[605];
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) { cin >> s[i]; s[i+n] = s[i]; }
    for (int i = 1; i <= 2*n; i++) s[i] += s[i-1];

    for (int len = 2; len <= n; len++) {
        for (int l = 1; l + len - 1 <= 2*n; l++) {
            int r = l + len - 1;
            fmn[l][r] = LLONG_MAX/4;
            for (int k = l; k < r; k++) {
                long long cost = s[r]-s[l-1];
                fmn[l][r] = min(fmn[l][r], fmn[l][k]+fmn[k+1][r]+cost);
                fmx[l][r] = max(fmx[l][r], fmx[l][k]+fmx[k+1][r]+cost);
            }
        }
    }
    long long mn = LLONG_MAX, mx = 0;
    for (int l = 1; l <= n; l++) {
        mn = min(mn, fmn[l][l+n-1]);
        mx = max(mx, fmx[l][l+n-1]);
    }
    cout << mn << '\\n' << mx << '\\n';
    return 0;
}`,
      },
      {
        title: '回文子串计数（区间 DP 入门）',
        level: '基础',
        statement: `**题目描述**

求字符串中回文子串的数量（单个字符也算）。`,
        samples: [['aaa', '6']],
        analysis: `### 解题思路

f[l][r] 表示子串是否回文：两端字符相同且内部回文。按长度从小到大。`,
        code: `#include <bits/stdc++.h>
using namespace std;
bool f[1005][1005];
int main() {
    string s; cin >> s;
    int n = s.size(), ans = 0;
    for (int len = 1; len <= n; len++)
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            if (s[l] == s[r] && (len <= 2 || f[l+1][r-1])) {
                f[l][r] = true;
                ans++;
            }
        }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**枚举顺序错**：必须按区间长度递增，保证子区间已算出。`,
      `**初始化忘记 f[i][i]**：单元素区间的平凡值是转移基础。`,
      `**环形问题硬枚举断点 O(n) 次 DP**：复制数组一次完成。`,
      `**cost 重复计算或用错前缀和**：sum(l,r)=s[r]-s[l-1]。`,
      `**数组开小**：环形版本需要 2n。`,
    ],
    exercises: [
      { title: '矩阵连乘', level: '提高',
        statement: '给出矩阵链维度，求最少乘法次数。',
        hint: 'f[i][j]=min f[i][k]+f[k+1][j]+p[i-1]p[k]p[j]。' },
      { title: '添加括号使合法', level: '提高',
        statement: '求最少添加几个括号使字符串括号匹配。',
        hint: '端点匹配 f[l+1][r-1]，否则枚举分界。' },
      { title: '关灯问题（区间思想）', level: '挑战',
        statement: '每次可消除连续同色段，求最少操作清空彩色串。',
        hint: 'f[l][r][c] 或 f[l][r] 端点合并型转移。' },
    ],
    summary: `
- 区间 DP 状态是 f[l][r]，枚举顺序固定：**长度 → 左端点 → 切点 k**；
- 石子合并：f[l][r]=min(f[l][k]+f[k+1][r])+区间和；环形复制数组处理；
- 括号匹配、矩阵连乘、回文子串都是同构模型；
- 注意 f[i][i] 初值、前缀和代价与 2n 数组。
`,
  };

  Object.assign(window.TOPICS, T);
})();
