/* ============================================================
   第七部分 · 第3章 多项式
   fft / ntt
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- FFT ---------------- */
  T['fft'] = {
    chapter: '第3章 多项式',
    time: '约 50 分钟',
    body: `
## 一、问题：多项式乘法（卷积）

两个多项式 \`A(x)=Σaᵢxⁱ\`、\`B(x)=Σbⱼxʲ\` 相乘，系数
\`cₖ = Σᵢ aᵢ·bₖ₋ᵢ\` 称为**卷积**。直接计算是 O(n²)，**快速傅里叶变换（FFT）**降到 **O(n log n)**。

## 二、核心直觉：点值表示

- 多项式有两种表示：**系数表示**（aᵢ）与**点值表示**（代入 n 个点得到的 n 个值）；
- 在点值表示下，**相乘只是对应点的值相乘，O(n)**；
- 所以思路是：系数 →（DFT）点值 → 逐点相乘 →（逆 DFT）系数。
FFT 就是快速实现这对变换。

## 三、关键技巧

1. **选单位根作为代入点**：n 次单位根 \`ω = e^{2πi/n}\`，其等分圆周的性质使变换可分治；
2. **分治（蝴蝶）**：按下标奇偶把多项式拆成两半，递归规模减半；
3. **位逆序置换（迭代版）**：先按二进制反转排好底层，再从小到大合并，常数小；
4. 复数用 \`complex<double>\`，旋转因子 \`ω = cosθ + i·sinθ\`。

\`\`\`text
长度补成 2 的幂（≥ n+m-1），做三次 FFT（A、B 各一次，逆变换一次）。
\`\`\`

> **⚠️ 坑：** ①长度必须补到 ≥ \`n+m−1\` 的 2 的幂，否则循环卷积会混；
> ②逆变换记得**除以长度**、旋转因子取共轭；③系数用 round 四舍五入到整数；浮点误差大时考虑 NTT。
`,
    examples: [
      {
        title: 'FFT 求多项式乘积（卷积）',
        level: '挑战',
        statement: `**题目描述**

给定两个多项式的系数，输出它们乘积的系数（结果为整数）。`,
        input: '第一行 n m；两行系数。',
        output: '乘积多项式系数（n+m−1 个）。',
        samples: [['2 2\n1 2\n3 4', '3 10 8']],
        analysis: `### 解题思路

(1+2x)(3+4x) = 3 + (4+6)x + 8x² = 3+10x+8x²。
- 补长度到 2 的幂；FFT 转点值、逐点乘、逆 FFT；
- round 取整输出。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using C = complex<double>;
const double PI = acos(-1.0);

void fft(vector<C>& a, bool invert) {
    int n = a.size();
    for (int i=1,j=0;i<n;i++){
        int bit=n>>1;
        for(;j&bit;bit>>=1) j^=bit;
        j^=bit;
        if(i<j) swap(a[i],a[j]);
    }
    for (int len=2;len<=n;len<<=1){
        double ang=2*PI/len*(invert?-1:1);
        C wlen(cos(ang),sin(ang));
        for(int i=0;i<n;i+=len){
            C w(1);
            for(int j=0;j<len/2;j++){
                C u=a[i+j], v=a[i+j+len/2]*w;
                a[i+j]=u+v;
                a[i+j+len/2]=u-v;
                w*=wlen;
            }
        }
    }
    if(invert) for(C& x:a) x/=n;
}
int main() {
    int n,m; cin>>n>>m;
    int sz=1;
    while(sz<n+m-1) sz<<=1;
    vector<C> a(sz,0),b(sz,0);
    for(int i=0;i<n;i++){double x;cin>>x;a[i]=x;}
    for(int i=0;i<m;i++){double x;cin>>x;b[i]=x;}
    fft(a,false); fft(b,false);
    for(int i=0;i<sz;i++) a[i]*=b[i];
    fft(a,true);
    for(int i=0;i<n+m-1;i++)
        cout<<llround(a[i].real())<<(i+1==n+m-1?'\\n':' ');
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**长度没补到 ≥n+m−1 的 2 的幂**：会得到错误的循环卷积。`,
      `**逆变换忘记除 n**：结果会整体放大长度倍。`,
      `**不取 round**：浮点误差使整数系数偏差。`,
      `**旋转因子方向**：逆变换角度取负（共轭）。`,
    ],
    exercises: [
      { title: '大数相乘', level: '挑战',
        statement: '把超长整数各位当系数，用 FFT 相乘（注意进位）。',
        hint: '卷积后从低位处理进位。' },
    ],
    summary: `
FFT 用"系数→点值（DFT）→逐点乘→逆变换"在 **O(n log n)** 算卷积。
以单位根为代入点、按奇偶分治/位逆序迭代。长度补 2 的幂，逆变换除 n，整数结果 round。
浮点误差敏感时用 NTT。
`,
  };

  /* ---------------- NTT ---------------- */
  T['ntt'] = {
    chapter: '第3章 多项式',
    time: '约 50 分钟',
    body: `
## 一、NTT：模意义下的 FFT

FFT 用复数，会有浮点误差。当答案需要**对某质数 p 取模**时，**数论变换（NTT）**用
**原根（primitive root）**代替单位根，全程整数运算，**无精度误差**。

## 二、可用的模数（常见）

| 模数 p | p−1 的因子 | 常用原根 g |
| --- | --- | --- |
| **998244353** | 119·2²³ | **3** |
| 1004535809 | 479·2²¹ | 3 |
| 469762049 | 7·2²⁶ | 3 |

要求：\`p = a·2ᵏ+1\` 且 k 足够大（能容纳你需要的长度 2ᵏ），并知道一个原根。

## 三、原根如何对应单位根

FFT 中 n 次单位根是 \`e^{2πi/n}\`；NTT 中对应

\`\`\`text
g_n = g^((p−1)/n)  mod p
\`\`\`

它同样满足"n 次幂为 1、等分"的性质，所以蝴蝶变换的结构与 FFT **完全一致**，
只是把复数旋转因子换成模幂 \`g_n\`。

\`\`\`text
正变换用 g_n；逆变换用 g_n 的逆元（g_n^(p−2)），最后除以 n（乘 n 的逆元）。
\`\`\`

> **💡 何时 NTT：** 系数/答案要取模、且模数是支持 NTT 的质数；
> 需要任意模数或实数时回到 FFT（或三模 NTT + CRT）。

> **⚠️ 坑：** ①变换长度 n 必须**整除 p−1**（998244353 最多支持到 2²³）；
> ②逆变换用原根的逆元、并乘 n 的逆元；③别超过模数支持的最大长度。
`,
    examples: [
      {
        title: 'NTT 求多项式乘积（998244353）',
        level: '挑战',
        statement: `**题目描述**

模 998244353 下求两个多项式的卷积。`,
        input: '第一行 n m；两行系数。',
        output: 'n+m−1 个系数（mod 998244353）。',
        samples: [['2 2\n1 2\n3 4', '3 10 8']],
        analysis: `### 解题思路

结构同 FFT：位逆序 + 蝴蝶，旋转因子用 \`g^((p−1)/len)\`；
逆变换用其逆元、乘 n 逆元。结果 3,10,8。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const long long MOD=998244353, G=3;

long long power(long long a,long long e){
    long long r=1;
    while(e){ if(e&1)r=r*a%MOD; a=a*a%MOD; e>>=1; }
    return r;
}
void ntt(vector<long long>& a,bool invert){
    int n=a.size();
    for(int i=1,j=0;i<n;i++){
        int bit=n>>1;
        for(;j&bit;bit>>=1)j^=bit;
        j^=bit;
        if(i<j)swap(a[i],a[j]);
    }
    for(int len=2;len<=n;len<<=1){
        long long wlen=power(G,(MOD-1)/len);
        if(invert) wlen=power(wlen,MOD-2);
        for(int i=0;i<n;i+=len){
            long long w=1;
            for(int j=0;j<len/2;j++){
                long long u=a[i+j], v=a[i+j+len/2]*w%MOD;
                a[i+j]=(u+v)%MOD;
                a[i+j+len/2]=(u-v+MOD)%MOD;
                w=w*wlen%MOD;
            }
        }
    }
    if(invert){
        long long invN=power(n,MOD-2);
        for(long long& x:a) x=x*invN%MOD;
    }
}
int main(){
    int n,m; cin>>n>>m;
    int sz=1; while(sz<n+m-1) sz<<=1;
    vector<long long> a(sz,0),b(sz,0);
    for(int i=0;i<n;i++) cin>>a[i];
    for(int i=0;i<m;i++) cin>>b[i];
    ntt(a,false); ntt(b,false);
    for(int i=0;i<sz;i++) a[i]=a[i]*b[i]%MOD;
    ntt(a,true);
    for(int i=0;i<n+m-1;i++)
        cout<<a[i]<<(i+1==n+m-1?'\\n':' ');
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**长度不整除 p−1**：NTT 长度必须是 p−1 因子，998244353 至多 2²³。`,
      `**逆变换不用逆元**：应用 g_n 的逆元、并乘 n 的逆元。`,
      `**负数没加回 MOD**：(u−v) 要 +MOD 再取模。`,
      `**在不支持的模数上 NTT**：需形如 a·2ᵏ+1 的质数并知原根。`,
    ],
    exercises: [
      { title: '任意模数卷积', level: '挑战',
        statement: '用三个 NTT 模数分别算、再用 CRT 合并，得到任意模数卷积。',
        hint: '注意三个模数乘积要够大。' },
    ],
    summary: `
NTT 在模意义下做 FFT：用**原根 g 的 g^((p−1)/n)** 代替复数单位根，蝴蝶结构与 FFT 相同，全程整数、无误差。
常用 998244353（原根3，支持到 2²³）。逆变换用原根逆元、乘 n 逆元。长度必须整除 p−1。
`,
  };

  Object.assign(window.TOPICS, T);
})();
