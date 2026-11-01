/* ============================================================
   第六部分 · 第2章 数论进阶
   lucas-theorem / crt
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- Lucas 定理 ---------------- */
  T['lucas-theorem'] = {
    chapter: '第2章 数论进阶',
    time: '约 45 分钟',
    body: `
## 一、问题：大组合数对小质数取模

我们已经会用 \`C(n,m) = n!/(m!(n-m)!)\` 配合逆元求组合数。但当 **n、m 非常大（如 10⁹）、
而模数 p 是个不太大的质数（如 10007）**时，无法预处理到 n 的阶乘。

**Lucas 定理**专门解决这种"**大 n、小质模 p**"的组合数。

## 二、Lucas 定理内容

把 n、m 写成 **p 进制**：\`n = n₀ + n₁p + n₂p² + …\`，m 同理。Lucas 定理：

\`\`\`text
C(n, m) ≡ C(n₀,m₀) · C(n₁,m₁) · …  (mod p)
\`\`\`

即把每个 p 进制位上的小组合数相乘。若**某一位 mᵢ > nᵢ，则 C=0**。

### 递归实现（最简洁）

\`\`\`text
Lucas(n, m):
  若 m==0 返回 1
  返回 C(n%p, m%p) * Lucas(n/p, m/p)  mod p
\`\`\`

其中 \`C(a,b)\` 是 a、b < p 的小组合数：用**预处理到 p−1 的阶乘与逆元**计算，
或 a、b 很小时直接乘。

> **💡 直观理解：** Lucas 把大数按 p"切块"，高位的组合方式与低位**独立**，所以各位组合数相乘。

## 三、使用条件

- 模数 p 必须是**质数**；
- p 不太大（能预处理阶乘到 p），n、m 可以极大；
- 若 p 是合数，需要用"扩展 Lucas"（思路不同，按质因子幂分别处理再 CRT 合并）。
`,
    examples: [
      {
        title: 'Lucas 求大组合数（小质数 p）',
        level: '提高',
        statement: `**题目描述**

输入质数 p、n、m（n,m 可很大），求 C(n,m) mod p。`,
        input: '一行 p n m。',
        output: '一个整数：C(n,m) mod p。',
        samples: [
          ['7 10 3', '1'],
          ['7 8 2', '0'],
        ],
        analysis: `### 解题思路

- 预处理 fac[0..p−1]；小组合 \`C(a,b)=fac[a]·inv(fac[b])·inv(fac[a−b]) mod p\`；
- Lucas 递归：\`C(n%p,m%p)·Lucas(n/p,m/p)\`。

验证 C(10,3)=120 mod 7 = 1（120=17×7+1）；C(8,2)=28 mod 7 = 0。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long p;
long long fac[100005];

long long power(long long a, long long e) {
    long long r = 1;
    while (e) {
        if (e&1) r = r*a % p;
        a = a*a % p;
        e >>= 1;
    }
    return r;
}
long long smallC(long long a, long long b) {
    if (b < 0 || b > a) return 0;
    return fac[a] * power(fac[b], p-2) % p
                  * power(fac[a-b], p-2) % p;
}
long long lucas(long long n, long long m) {
    if (m == 0) return 1;
    return smallC(n % p, m % p) * lucas(n/p, m/p) % p;
}
int main() {
    long long n, m; cin >> p >> n >> m;
    fac[0] = 1;
    for (int i = 1; i < p; i++) fac[i] = fac[i-1] * i % p;
    cout << lucas(n, m) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**模数不是质数仍用 Lucas**：Lucas 要求 p 为质数，合数需扩展 Lucas。`,
      `**忘记处理 m%p > n%p**：该位小组合数应为 0。`,
      `**阶乘只预处理到 n**：只需预处理到 p−1，n 再大也没关系。`,
      `**逆元指数写错**：质数模下逆元是 a^(p−2)。`,
    ],
    exercises: [
      { title: '判断组合数能否被 p 整除', level: '提高',
        statement: '用 Lucas 解释：什么时候 C(n,m) ≡ 0 mod p？',
        hint: '某一 p 进制位 mᵢ>nᵢ。' },
      { title: 'Lucas 手算', level: '基础',
        statement: 'p=5 时手算 C(7,2) mod 5，再用程序验证。',
        hint: 'C(7,2)=21 mod 5 = 1。' },
    ],
    summary: `
Lucas 定理解决"大 n、小质数模 p"的组合数：把 n、m 写成 p 进制，
\`C(n,m) ≡ 各 p 进制位小组合数之积 mod p\`。递归 \`C(n%p,m%p)·Lucas(n/p,m/p)\`，
小组合数用预处理到 p−1 的阶乘+逆元。某位 mᵢ>nᵢ 则结果为 0。要求 p 是质数。
`,
  };

  /* ---------------- 中国剩余定理 ---------------- */
  T['crt'] = {
    chapter: '第2章 数论进阶',
    time: '约 45 分钟',
    body: `
## 一、问题：解同余方程组

要求一个数 x，同时满足若干同余条件：

\`\`\`text
x ≡ a₁ (mod m₁)
x ≡ a₂ (mod m₂)
…
\`\`\`

例如"三三数之剩二、五五数之剩三、七七数之剩二"（《孙子算经》物不知数），
这就是著名的**中国剩余定理（CRT）**问题。

## 二、CRT（模数两两互质）

设 \`M = m₁m₂…mₙ\`，令 \`Mᵢ = M/mᵢ\`，并求 \`Mᵢ\` 在模 mᵢ 下的逆元 \`tᵢ\`。则：

\`\`\`text
x ≡ Σ aᵢ · Mᵢ · tᵢ  (mod M)
\`\`\`

在 mod M 意义下**解唯一**。

\`\`\`cpp
// Mᵢ 与 mᵢ 互质（因为模数两两互质），故逆元一定存在
\`\`\`

### 经典例子
\`x≡2(mod3), x≡3(mod5), x≡2(mod7)\`：
M=105，按公式算出 x=23（23 满足 23 mod 3=2、mod 5=3、mod 7=2）。

## 三、扩展 CRT（模数不互质）

若模数**不两两互质**，逆元可能不存在，要先**合并两个同余式**：

- x ≡ a₁ (mod m₁)、x ≡ a₂ (mod m₂)；
- 有解条件：\`gcd(m₁,m₂)\` 整除 \`a₂−a₁\`，否则无解；
- 用扩展欧几里得合并成 \`x ≡ a (mod lcm(m₁,m₂))\`，再继续合并下一个。

> **⚠️ 坑：** ①标准 CRT 要求模数**两两互质**，否则不能直接套公式（要用扩展 CRT）；
> ②\`Mᵢ·aᵢ·tᵢ\` 的乘积可能很大，用 long long 甚至 __int128；③合并时务必先判断相容条件。
`,
    examples: [
      {
        title: '中国剩余定理（两两互质）',
        level: '基础',
        statement: `**题目描述**

给定 n 个同余式 x ≡ aᵢ (mod mᵢ)（模数两两互质），求最小非负整数解 x。`,
        input: '第一行 n；n 行 aᵢ mᵢ。',
        output: '一个整数：最小非负解。',
        samples: [['3\n2 3\n3 5\n2 7', '23']],
        analysis: `### 解题思路

- M = 各模数之积；
- 对每个 i 求 Mᵢ=M/mᵢ 及其在模 mᵢ 下逆元（费马小定理或扩展欧几里得）；
- 累加 \`aᵢ·Mᵢ·inv\`，最后 mod M。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long extgcd(long long a,long long b,long long&x,long long&y) {
    if (!b) { x=1; y=0; return a; }
    long long x1,y1,g=extgcd(b,a%b,x1,y1);
    x=y1; y=x1-(a/b)*y1;
    return g;
}
long long modInv(long long a,long long m) {
    long long x,y;
    extgcd(a,m,x,y);
    return (x % m + m) % m;
}
int main() {
    int n; cin >> n;
    vector<long long> a(n), m(n);
    long long M = 1;
    for (int i = 0; i < n; i++) { cin >> a[i] >> m[i]; M *= m[i]; }

    long long x = 0;
    for (int i = 0; i < n; i++) {
        long long Mi = M / m[i];
        long long t = modInv(Mi % m[i], m[i]);
        x = (x + a[i] * Mi % M * t) % M;
    }
    cout << x << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**模数不互质仍套标准 CRT**：要用扩展 CRT 逐对合并。`,
      `**乘积溢出**：aᵢ·Mᵢ·t 很大，用 __int128 或分步取模。`,
      `**扩展合并忘记判相容**：gcd 必须整除 a₂−a₁，否则无解。`,
      `**逆元用费马小定理但模数非质数**：应用扩展欧几里得求逆元。`,
    ],
    exercises: [
      { title: '扩展 CRT 合并', level: '挑战',
        statement: '解 x≡2(mod4)、x≡4(mod6)，先判相容再合并。',
        hint: 'gcd(4,6)=2 整除 2，有解，合并 mod 12。' },
      { title: '物不知数', level: '基础',
        statement: '手算"三三剩二、五五剩三、七七剩二"，验证 x=23。',
        hint: '直接用 CRT 公式。' },
    ],
    summary: `
中国剩余定理解同余方程组。模数**两两互质**时：\`x ≡ Σ aᵢ·Mᵢ·inv(Mᵢ,mᵢ) (mod M)\`，解唯一；
模数不互质要用**扩展 CRT** 逐对合并（gcd 整除 a₂−a₁ 才有解，合并模 lcm）。
乘积注意溢出，逆元用扩展欧几里得。
`,
  };

  Object.assign(window.TOPICS, T);
})();
