/* ============================================================
   第三部分 · 第10章 数论进阶
   number-theory
   ============================================================ */
(function () {
  const T = {};

  T['number-theory'] = {
    chapter: '第10章 数论进阶',
    time: '约 70 分钟',
    body: `
## 一、线性筛（欧拉筛）O(n)

埃氏筛中一个合数会被多个质因子重复标记。线性筛保证**每个合数只被它的最小质因子筛掉一次**：

\`\`\`cpp
vector<int> primes;
bool composite[MAXN];
void init(int n) {
    for (int i = 2; i <= n; i++) {
        if (!composite[i]) primes.push_back(i);
        for (int p : primes) {
            if (1LL * i * p > n) break;
            composite[i*p] = true;
            if (i % p == 0) break;     // 关键：保证最小质因子唯一筛除
        }
    }
}
\`\`\`

## 二、欧拉函数 φ(n)

φ(n)：1~n 中与 n 互质的数的个数。若 n=∏pᵢ^aᵢ，则

\`\`\`text
φ(n) = n · ∏(1 - 1/pᵢ)
\`\`\`

可在线性筛中顺带计算（phi[p]=p−1；i 含 p 时 phi[ip]=phi[i]·p，否则 phi[ip]=phi[i]·(p−1)）。

## 三、扩展欧几里得 EXGCD

求 ax+by=gcd(a,b) 的一组整数解：

\`\`\`cpp
long long exgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
\`\`\`

应用：解线性同余方程 ax≡c (mod m)、求乘法逆元。

## 四、乘法逆元

模意义下的“除法”：若 gcd(a,m)=1，存在 a⁻¹ 使 a·a⁻¹≡1 (mod m)。

三种求法：

1. **费马小定理**（m 为质数）：a⁻¹ ≡ a^(m-2) (mod m)，快速幂；
2. **EXGCD**：解 ax+my=1，x 即逆元；
3. **线性递推**（模质数 p，批量求 1..n 的逆元）：

\`\`\`cpp
inv[1] = 1;
inv[i] = (p - p/i) * inv[p%i] % p;
\`\`\`

组合数取模：\`C(n,k) = fac[n]·invfac[k]·invfac[n-k] mod p\`，其中 invfac 由 fac[n]^(p-2) 反向递推。

## 五、中国剩余定理 CRT

解同余方程组 x≡aᵢ (mod mᵢ)，mᵢ 两两互质：

\`\`\`text
M=∏mᵢ，Mᵢ=M/mᵢ，x=Σ aᵢ·Mᵢ·(Mᵢ⁻¹ mod mᵢ)  (mod M)
\`\`\`

模数不互质用扩展 CRT（两两合并，解 lcm 同余）。

## 六、常见取模技巧

- 加法后减模、乘法用 long long；
- 减法先 +MOD 再取模防负；
- 答案巨大时题面通常指定 MOD（常见 10⁹+7、998244353）。
`,
    examples: [
      {
        title: '线性筛与欧拉函数表',
        level: '提高',
        statement: `**题目描述**

输出 n 以内所有质数，并计算 φ(1..n)。n≤10⁷。`,
        samples: [['10', '质数4个\nphi(10)=4']],
        analysis: `### 解题思路

线性筛中按“i 是否含质数 p”分两种情况递推 phi。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 10000005;
int phi[MAXN];
bool composite[MAXN];
vector<int> primes;

void init(int n) {
    phi[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (!composite[i]) { primes.push_back(i); phi[i] = i - 1; }
        for (int p : primes) {
            if (1LL*i*p > n) break;
            composite[i*p] = true;
            if (i % p == 0) { phi[i*p] = phi[i] * p; break; }
            else phi[i*p] = phi[i] * (p - 1);
        }
    }
}
int main() {
    int n; cin >> n;
    init(n);
    cout << "质数" << primes.size() << "个\\n";
    cout << "phi(" << n << ")=" << phi[n] << '\\n';
    return 0;
}`,
      },
      {
        title: '组合数取模（预处理阶乘+逆元）',
        level: '提高',
        statement: `**题目描述**

q 次询问 C(n,k) mod 10⁹+7，n≤10⁶。`,
        samples: [['3\n5 2\n4 1\n3 3', `10
4
1`]],
        analysis: `### 解题思路

预处理 fac 与 invfac：invfac[n]=fac[n]^(p-2)，再逆推。每次询问 O(1)。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1000000007;
const int MAXN = 1000005;
ll fac[MAXN], invfac[MAXN];

ll qpow(ll a, ll b) {
    ll r = 1;
    while (b) {
        if (b & 1) r = r*a % MOD;
        a = a*a % MOD;
        b >>= 1;
    }
    return r;
}
void init() {
    fac[0] = 1;
    for (int i = 1; i < MAXN; i++) fac[i] = fac[i-1]*i % MOD;
    invfac[MAXN-1] = qpow(fac[MAXN-1], MOD-2);
    for (int i = MAXN-1; i >= 1; i--) invfac[i-1] = invfac[i]*i % MOD;
}
ll C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fac[n]*invfac[k]%MOD*invfac[n-k]%MOD;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    init();
    int q; cin >> q;
    while (q--) { int n, k; cin >> n >> k; cout << C(n,k) << '\\n'; }
    return 0;
}`,
      },
      {
        title: 'EXGCD 求逆元与同余方程',
        level: '挑战',
        statement: `**题目描述**

求 a 在模 m 下的乘法逆元（保证互质）。`,
        samples: [['3 11', '4']],
        analysis: `### 解题思路

解 ax+my=1，x 调整到 [0,m)。模质数时用费马小定理更短，EXGCD 不要求 m 为质数。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    ll d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
int main() {
    ll a, m; cin >> a >> m;
    ll x, y;
    exgcd(a, m, x, y);
    x = (x % m + m) % m;
    cout << x << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**筛中忘记 break**：i%p==0 时不终止会让合数被非最小质因子重复筛。`,
      `**乘法不取模/用 int**：中间乘积全用 long long。`,
      `**逆元不存在硬求**：前提是 gcd(a,m)=1；模质数时 a 不是 p 的倍数。`,
      `**减法取模为负**：先加 MOD。`,
      `**CRT 模数不互质直接套公式**：要用扩展 CRT。`,
    ],
    exercises: [
      { title: '因子个数线性筛', level: '提高',
        statement: '在线性筛中同时求每个数的约数个数。',
        hint: '维护最小质因子的幂次。' },
      { title: '组合数大系数取模', level: '基础',
        statement: '输出 C(2n,n) mod 10⁹+7。',
        hint: 'fac[2n]·invfac[n]²。' },
      { title: 'exCRT 合并', level: '挑战',
        statement: '模数不保证互质时合并两个同余式。',
        hint: '解 a1+k·m1 ≡ a2 (mod m2)，再合并为 lcm 模数。' },
    ],
    summary: `
- **线性筛** O(n)：合数只被最小质因子筛一次，可同时求欧拉函数；
- φ(n)=n·∏(1−1/p)；EXGCD 求 ax+by=gcd 与逆元；
- 逆元三法：费马小定理快速幂、EXGCD、线性递推 \`inv[i]=(p-p/i)inv[p%i]\`；
- 组合数取模用阶乘+逆阶乘；CRT 合并互质同余方程组，不互质用扩展 CRT。
`,
  };

  Object.assign(window.TOPICS, T);
})();
