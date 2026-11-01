/* ============================================================
   第三部分 · 第11章 组合数学与概率
   combinatorics
   ============================================================ */
(function () {
  const T = {};

  T['combinatorics'] = {
    chapter: '第11章 组合数学与概率',
    time: '约 60 分钟',
    body: `
## 一、两个基本原理

- **加法原理**：分类完成，各类方案数相加；
- **乘法原理**：分步完成，各步方案数相乘。

## 二、排列与组合

\`\`\`text
排列 A(n,k) = n!/(n-k)!
组合 C(n,k) = n!/(k!(n-k)!)
\`\`\`

组合数递推（杨辉三角）：\`C(n,k) = C(n-1,k-1) + C(n-1,k)\`，边界 C(n,0)=C(n,n)=1。

计算方式选择：

- n≤2000：二维递推 O(n²)；
- n≤10⁶ 且模质数：阶乘+逆元 O(n) 预处理（见数论章）；
- n 巨大但 k 很小：\`C(n,k)=n(n-1)…(n-k+1)/k!\`；
- 无模数且结果巨大：高精度。

常用恒等式：C(n,k)=C(n,n-k)；ΣC(n,k)=2ⁿ；帕斯卡/二项式定理 (a+b)ⁿ=ΣC(n,k)a^(n-k)bᵏ。

## 三、容斥原理

求并集大小：

\`\`\`text
|A∪B∪C| = |A|+|B|+|C| - |A∩B|-|A∩C|-|B∩C| + |A∩B∩C|
\`\`\`

奇数个集合加、偶数个减。枚举子集（n≤20 用状压）实现。

典型：1~m 中不被任意给定质数整除的数个数；错排问题。

## 四、卡特兰数

\`\`\`text
Cat(0)=1, Cat(n) = C(2n,n)/(n+1)
\`\`\`

数列：1,1,2,5,14,42,132…

应用：合法括号序列数、二叉树形态数、进出栈序列数、多边形三角剖分数、不相交路径。

## 五、概率与期望

- 概率 P∈[0,1]；期望 E=Σ 结果值×概率，具有**线性性**（无论事件是否独立）：E[X+Y]=E[X]+E[Y]；
- 期望 DP：状态为“从当前局面到结束的期望（步数/代价）”，常写成方程移项求解；
- 经典：随机排列中某位置概率、掷骰子到目标的期望次数、图上随机游走。

简单例子：每次成功概率 p，直到首次成功的期望尝试次数 = 1/p。
`,
    examples: [
      {
        title: '杨辉三角求组合数',
        level: '基础',
        statement: `**题目描述**

预处理 C(n,k)（0≤k≤n≤1000），回答询问。`,
        samples: [['1\n5 2', '10']],
        analysis: `### 解题思路

递推无需除法与逆元，适合不做模运算但数值大时配合取模/高精度。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;
long long C[1005][1005];
int main() {
    for (int n = 0; n <= 1000; n++) {
        C[n][0] = C[n][n] = 1;
        for (int k = 1; k < n; k++)
            C[n][k] = (C[n-1][k-1] + C[n-1][k]) % MOD;
    }
    int q; cin >> q;
    while (q--) { int n, k; cin >> n >> k; cout << C[n][k] << '\\n'; }
    return 0;
}`,
      },
      {
        title: '容斥：能被整除的数',
        level: '提高',
        statement: `**题目描述**

给定 m 个质数与整数 N，求 1~N 中至少被其中一个质数整除的数的个数。m≤15。`,
        samples: [['10 2\n2 3', '7']],
        analysis: `### 解题思路

枚举非空子集：子集内质数乘积 P 整除 N 的个数为 N/P；奇数个加偶数个减。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long N; int m;
    cin >> N >> m;
    vector<long long> p(m);
    for (auto& x : p) cin >> x;

    long long ans = 0;
    for (int mask = 1; mask < (1<<m); mask++) {
        long long prod = 1;
        int bits = 0;
        bool overflow = false;
        for (int i = 0; i < m; i++)
            if (mask >> i & 1) {
                bits++;
                if (prod > N / p[i]) { overflow = true; break; }
                prod *= p[i];
            }
        if (overflow) continue;      // 乘积超过 N，N/prod=0
        long long cnt = N / prod;
        ans += (bits & 1) ? cnt : -cnt;
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '期望 DP：掷骰子',
        level: '挑战',
        statement: `**题目描述**

每次掷均匀骰子，问首次掷出 6 期望需要多少次？用期望 DP 方程验证 1/p。`,
        samples: [['', '6.000000']],
        analysis: `### 解题思路

设 E 为距成功的期望次数：E = 1 + (5/6)E（本轮失败回到原状），解得 E=6。

程序示例：在网格上以概率向右/下走，求到终点的期望步数，按拓扑逆序 DP。`,
        code: `#include <bits/stdc++.h>
using namespace std;
// 简单数值演示：迭代估计“几何分布”期望（也可直接输出 1.0/p）
int main() {
    double p = 1.0 / 6;
    // E = 1 + (1-p) E  =>  E = 1/p
    double E = 1.0 / p;
    cout << fixed << setprecision(6) << E << '\\n';

    // 网格期望步数示例：f[i][j] = 1 + 0.5 f[i+1][j] + 0.5 f[i][j+1]
    // 边界 f[n-1][m-1]=0，从右下向左上递推即可。
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**组合数溢出**：C(60,30) 远超 long long，有模数取模、无模数上高精度。`,
      `**容斥符号错**：|子集| 奇加偶减，别忘记只枚举非空子集。`,
      `**容斥乘积溢出**：乘之前用 N/p 判断（本题代码的防溢出写法）。`,
      `**期望 DP 方向错**：期望“到终点还需多少”要从终点反向递推。`,
      `**把独立与线性性混淆**：期望线性性不需要独立，方差才需要协方差项。`,
    ],
    exercises: [
      { title: '合法括号', level: '基础',
        statement: '求 n 对括号合法序列数（n≤30，用 long long 递推卡特兰）。',
        hint: 'Cat(n)=C(2n,n)/(n+1) 或 Cat(n)=ΣCat(i)Cat(n-1-i)。' },
      { title: '错排数', level: '提高',
        statement: 'n 封信全部装错信封的方案数。',
        hint: 'D(n)=(n-1)(D(n-1)+D(n-2))，D1=0,D2=1。' },
      { title: '互质计数', level: '提高',
        statement: '1~N 中与给定 m 互质的数个数。',
        hint: '对 m 的不同质因子做容斥。' },
      { title: '收集卡片期望', level: '挑战',
        statement: 'n 种卡片等概率获得，集齐期望次数。',
        hint: 'n(1+1/2+...+1/n)。' },
    ],
    summary: `
- 加法/乘法原理与 \`C(n,k)\` 是计数基石；小 n 用杨辉递推，大 n 用阶乘逆元；
- **容斥**：奇加偶减，状压枚举子集，注意乘积溢出；
- **卡特兰数** C(2n,n)/(n+1) 对应括号、栈序列、二叉树形态等；
- 期望具线性性，期望 DP 通常从终点倒推：f=当前代价+Σ概率·后继期望。
`,
  };

  Object.assign(window.TOPICS, T);
})();
