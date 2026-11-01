/* ============================================================
   第二部分 · 第12章 数学基础
   math-prime / math-gcd-power
   ============================================================ */
(function () {
  const T = {};

  T['math-prime'] = {
    chapter: '第12章 数学基础',
    time: '约 45 分钟',
    body: `
## 一、质数与试除法

质数：大于 1 且只有 1 和自身两个因数的整数。

判断 n 是否为质数，只需试除到 √n（因数成对出现）：

\`\`\`cpp
bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++)   // i*i 用 long long
        if (n % i == 0) return false;
    return true;
}
\`\`\`

复杂度 O(√n)。判断 10⁶ 个数都用它就要 10⁹ 次运算——需要批量处理时用筛法。

## 二、分解质因数

\`\`\`cpp
void factorize(int n) {
    for (int p = 2; 1LL * p * p <= n; p++) {
        while (n % p == 0) {
            cout << p << " ";
            n /= p;
        }
    }
    if (n > 1) cout << n;        // 剩余的 n 本身是质因子
}
\`\`\`

## 三、埃氏筛（Eratosthenes）

要得到 2~N 中所有质数：从 2 起，每遇到一个质数，就把它的所有倍数标记为合数。

\`\`\`cpp
bool notPrime[MAXN+1];
void eratosthenes(int N) {
    notPrime[0] = notPrime[1] = true;
    for (int i = 2; 1LL * i * i <= N; i++) {
        if (!notPrime[i]) {
            for (int j = i * i; j <= N; j += i)
                notPrime[j] = true;
        }
    }
}
\`\`\`

- 从 i² 开始标记：更小的倍数 2i、3i 已被更小的质数标记过；
- 复杂度 O(n log log n)，n=10⁶ 只要几万次有效操作。

筛完后：

- 判质数：\`!notPrime[x]\`；
- 枚举质数：遍历未被标记的数；
- 预处理最小质因子可进一步做快速因数分解（提高篇线性筛）。

## 四、约数相关

- 枚举 n 的所有约数：O(√n)，成对记录 i 与 n/i（平方数不重复）；
- 约数个数：若 n = p₁^a₁·p₂^a₂…，则约数个数 = (a₁+1)(a₂+1)…；
- 1~N 每个数约数集合可用“倍数枚举”打表：for i for j=i,i*2,... d[j]++。

## 五、常用数论常识

- 质数分布：N 以内质数约有 N/ln N 个（10⁶ 内约 7.8 万个）；
- 唯一分解定理：每个整数的质因数分解方式唯一；
- 相邻整数互质：gcd(n, n+1) = 1。
`,
    examples: [
      {
        title: '质数判定与质数表',
        level: '基础',
        statement: `**题目描述**

输入 n（n≤10⁶），输出 2~n 中质数个数，并输出最后 5 个质数。`,
        samples: [['30', '10 个质数\n13 17 19 23 29']],
        analysis: `### 解题思路

埃氏筛打标记，再线性扫描统计、收集输出。注意 0、1 显式标为非质数。`,
        code: `#include <iostream>
#include <vector>
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

    int cnt = 0;
    vector<int> last;
    for (int i = 2; i <= n; i++) {
        if (!notPrime[i]) {
            cnt++;
            last.push_back(i);
            if (last.size() > 5) last.erase(last.begin());
        }
    }
    cout << cnt << " 个质数\\n";
    for (int x : last) cout << x << " ";
    return 0;
}`,
      },
      {
        title: '质因数分解',
        level: '基础',
        statement: `**题目描述**

输入整数 n（2≤n≤2×10⁹），输出其质因数分解式（乘方形式，如 60=2^2*3*5）。`,
        samples: [['60', '2^2*3*5'], ['13', '13']],
        analysis: `### 解题思路

试除到 √n：每个因子 while 除尽并计数，按计数输出。最后剩余 >1 的部分是较大的质因子。`,
        code: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    bool first = true;
    for (long long p = 2; p * p <= n; p++) {
        if (n % p == 0) {
            int e = 0;
            while (n % p == 0) { n /= p; e++; }
            if (!first) cout << "*";
            cout << p;
            if (e > 1) cout << "^" << e;
            first = false;
        }
    }
    if (n > 1) {
        if (!first) cout << "*";
        cout << n;
    }
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '区间内质数距离（分段思想）',
        level: '挑战',
        statement: `**题目描述**

给定 [L,R]（L,R≤2.1×10⁹，区间长度≤10⁶），求区间内相邻质数的最大差值。`,
        samples: [['10 20', '4']],
        analysis: `### 解题思路

R 太大不能筛到 R。用**区间筛**：先用埃氏筛得到 √R 以内的质数，再用它们标记 [L,R] 中的合数（标记数组平移 L）。提高篇常见技巧。`,
        code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    long long L, R;
    cin >> L >> R;

    // 1. 筛出 sqrt(R) 以内的质数
    int limit = 1;
    while (1LL * (limit+1) * (limit+1) <= R) limit++;
    vector<bool> np(limit + 1, false);
    vector<int> primes;
    for (int i = 2; i <= limit; i++) {
        if (!np[i]) {
            primes.push_back(i);
            if (1LL*i*i <= limit)
                for (int j = i*i; j <= limit; j += i) np[j] = true;
        }
    }

    // 2. 用这些质数标记 [L,R] 内合数（平移到 seg[k] 表示 L+k）
    int len = (int)(R - L + 1);
    vector<bool> seg(len, false);
    for (int p : primes) {
        long long start = max(2LL * p, (L + p - 1) / p * p);
        for (long long x = start; x <= R; x += p)
            seg[x - L] = true;
    }
    if (L == 1) seg[0] = true;

    long long prev = -1, best = 0;
    for (long long x = L; x <= R; x++) {
        if (!seg[x - L]) {
            if (prev != -1) best = max(best, x - prev);
            prev = x;
        }
    }
    cout << best << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**i*i 溢出**：试除循环变量用 long long，或写 i<=n/i。`,
      `**忘记处理 0 和 1**：筛数组开头两个要显式标记。`,
      `**埃氏筛从 2i 开始标**：虽然正确但慢；从 i² 开始。`,
      `**分解后漏输出剩余质因子**：循环结束 n>1 时它本身是质数。`,
      `**多组数据反复筛**：筛法与具体询问无关，main 开头只做一次预处理。`,
    ],
    exercises: [
      { title: '回文质数', level: '提高',
        statement: '输出 [a,b]（b≤10⁷）中既是质数又是回文数的数。',
        hint: '先筛质数，再逐个判回文；注意偶数位回文数除 11 都能被 11 整除，可加速。' },
      { title: '约数个数', level: '基础',
        statement: '输入 n，输出其正约数个数（n≤2×10⁹）。',
        hint: '分解质因数，答案 ∏(指数+1)。' },
      { title: '哥德巴赫猜想验证', level: '基础',
        statement: '对输入的偶数 n（4≤n≤10⁶），输出一组质数分解。',
        hint: '筛一次，枚举 p 检查 p 与 n-p 都为质数。' },
      { title: '孪生素数', level: '提高',
        statement: '输出不超过 n 的所有相差 2 的质数对数量。',
        hint: '筛完扫一遍 !notPrime[i]&&!notPrime[i+2]。' },
    ],
    summary: `
- 判质数 O(√n)：试除到 √n，循环变量 long long；
- 分解质因数：从小到大边试除边除尽，剩余 >1 也是质因子；
- **埃氏筛 O(n log log n)**：质数从 i² 起标记倍数，是批量判质的标准做法；
- 大范围小区间用区间筛（筛 √R 的质数再标记区间）；唯一分解定理是约数个数等公式的基础。
`,
  };

  T['math-gcd-power'] = {
    chapter: '第12章 数学基础',
    time: '约 50 分钟',
    body: `
## 一、最大公约数 GCD

欧几里得算法（辗转相除）：\`gcd(a,b) = gcd(b, a mod b)\`，直到余数为 0。

\`\`\`cpp
long long gcd(long long a, long long b) {
    while (b) { long long r = a % b; a = b; b = r; }
    return a;
}
\`\`\`

C++17 的 \`<numeric>\` 提供 std::gcd，竞赛手写模板依然必须会。

最小公倍数：\`lcm(a,b) = a / gcd(a,b) * b\`（先除后乘防溢出）。

## 二、快速幂：O(log b) 算 aᵇ

普通循环乘 b 次是 O(b)。利用二进制拆分：b 的二进制中每一位代表一个平方幂。

\`\`\`cpp
long long qpow(long long a, long long b, long long mod) {
    long long res = 1;
    a %= mod;
    while (b > 0) {
        if (b & 1) res = res * a % mod;  // 该位为 1：乘上当前 a
        a = a * a % mod;                // a 平方
        b >>= 1;                        // 处理下一位
    }
    return res;
}
\`\`\`

过程演示 a¹³（13=1101₂）：res 依次收集 a¹、a⁴、a⁸，即 a¹³。

取模性质：\`(a*b) mod m = ((a mod m)*(b mod m)) mod m\`，每步取模防溢出。

## 三、进制转换

### 十进制 → 其他进制：除基取余，逆序排列

\`\`\`cpp
string toBase(long long n, int base) {
    if (n == 0) return "0";
    string s;
    const char* d = "0123456789ABCDEF";
    while (n) { s += d[n % base]; n /= base; }
    reverse(s.begin(), s.end());
    return s;
}
\`\`\`

### 其他进制 → 十进制：按权展开（秦九韶）

\`\`\`cpp
long long fromBase(const string& s, int base) {
    long long v = 0;
    for (char c : s) {
        int x = (c >= 'A') ? c - 'A' + 10 : c - '0';
        v = v * base + x;
    }
    return v;
}
\`\`\`

二进制与 C++：\`stoi(s, nullptr, 2)\`、\`bitset<32>(n)\` 可直接转换输出。

## 四、二进制常用技巧

| 操作 | 写法 |
| --- | --- |
| 第 k 位（从0）是否为 1 | \`(n >> k) & 1\` |
| 把第 k 位设为 1 | \`n \| (1LL << k)\` |
| 把第 k 位清零 | \`n & ~(1LL << k)\` |
| 翻转第 k 位 | \`n ^ (1LL << k)\` |
| 最低位的 1 | \`n & -n\`（lowbit，树状数组核心） |
| 二进制中 1 的个数 | \`__builtin_popcount(n)\` |
| 是否为 2 的幂 | \`n>0 && (n&(n-1))==0\` |

## 五、快速幂的应用预告

- 模逆元：费马小定理下 a⁻¹ ≡ a^(p-2) (mod p)（提高篇数论）；
- 矩阵快速幂：把递推（如斐波那契）加速到 O(log n)；
- 快速乘：模数接近 10¹⁸ 时用类似思路防乘法溢出。
`,
    examples: [
      {
        title: 'GCD 与 LCM',
        level: '入门',
        statement: `**题目描述**

输入 n 对正整数，输出每对的最大公约数与最小公倍数。a,b≤10⁹。`,
        samples: [['2\n12 18\n7 5', '6 36\n1 35']],
        analysis: `### 解题思路

辗转相除模板。LCM 务必先除后乘，a*b 对 10⁹ 量级可能溢出 long long（10¹⁸ 边界）也要小心。`,
        code: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    while (b) {
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main() {
    int n; cin >> n;
    while (n--) {
        long long a, b;
        cin >> a >> b;
        long long g = gcd(a, b);
        cout << g << " " << a / g * b << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '幂取模',
        level: '基础',
        statement: `**题目描述**

求 aᵇ mod 10007。a,b 可达 10⁹。`,
        samples: [['2 10', '1024'], ['3 1000000000', '7480']],
        analysis: `### 解题思路

快速幂模板。每一步都取模，res*a 对模数 10007 而言不会超过 10⁸，int64 安全。`,
        code: `#include <iostream>
using namespace std;

long long qpow(long long a, long long b, long long mod) {
    long long res = 1;
    a %= mod;
    while (b) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

int main() {
    long long a, b;
    cin >> a >> b;
    cout << qpow(a, b, 10007) << '\\n';
    return 0;
}`,
      },
      {
        title: '进制转换综合',
        level: '基础',
        statement: `**题目描述**

输入十进制正整数 n，依次输出它的二进制、八进制、十六进制（大写）表示。`,
        samples: [['255', '11111111 377 FF']],
        analysis: `### 解题思路

手写通用转换函数体会“除基取余逆序”。实战也可用 cout<<hex/oct，但手写是基本功。`,
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string toBase(long long n, int base) {
    if (n == 0) return "0";
    const char* d = "0123456789ABCDEF";
    string s;
    while (n) {
        s += d[n % base];
        n /= base;
    }
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    long long n; cin >> n;
    cout << toBase(n, 2) << " "
         << toBase(n, 8) << " "
         << toBase(n, 16) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**lcm 先乘后除**：a*b 可能溢出，永远 a/gcd*b。`,
      `**快速幂不取模或漏取模**：res*a 可能巨大，每次乘法后立即 % mod。`,
      `**b=0 处理错**：任何数的 0 次幂是 1，模板初值 res=1 自然正确。`,
      `**位运算用 int 移太多位**：1<<40 溢出，写 1LL<<40。`,
      `**十六进制字母大小写**：按题意选 0-9A-F，余数到字符的映射别写错。`,
    ],
    exercises: [
      { title: '递归 GCD', level: '入门',
        statement: '把辗转相除改成递归函数 gcd(a,b)。',
        hint: 'b==0 返回 a，否则 gcd(b,a%b)。' },
      { title: '二进制 1 的个数', level: '基础',
        statement: '输入 n，输出二进制中 1 的个数（要求用 n&(n-1) 循环法）。',
        hint: '每次 n&=n-1 消掉最低位的 1。' },
      { title: '二进制回文', level: '提高',
        statement: '判断 n 的二进制表示是否回文。',
        hint: '转二进制字符串后双指针，或反向构造数值比较。' },
      { title: '矩阵快速幂（选做）', level: '挑战',
        statement: '用 2×2 矩阵快速幂求斐波那契第 10¹⁸ 项对 10⁹+7 的模。',
        hint: '[f(n+1),f(n);f(n),f(n-1)] = 矩阵 A 的 n 次方。' },
    ],
    summary: `
- **gcd 辗转相除** O(log n)，lcm=a/gcd×b（先除后乘）；
- **快速幂**按 b 的二进制位平方累乘，O(log b)，每步取模；
- 进制转换：十→其他“除基取余逆序”，其他→十“按权展开”；
- 位运算技巧：取位/置位/lowbit/popcount/判 2 的幂，是树状数组与状压 DP 的基础。
`,
  };

  Object.assign(window.TOPICS, T);
})();
