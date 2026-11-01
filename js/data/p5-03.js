/* ============================================================
   第五部分 · 第3章 数学进阶
   matrix-exponent / gaussian-elim / game-theory
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- 矩阵快速幂 ---------------- */
  T['matrix-exponent'] = {
    chapter: '第3章 数学进阶',
    time: '约 45 分钟',
    body: `
## 一、矩阵乘法回顾

两个矩阵 \`A\`（a 行 b 列）与 \`B\`（b 行 c 列）相乘得到 \`C\`（a 行 c 列）：

\`\`\`text
C[i][j] = Σ A[i][k] × B[k][j]   （k 从 0 到 b−1）
\`\`\`

注意：①**前一个的列数 = 后一个的行数**才能相乘；②矩阵乘法**满足结合律**（(AB)C = A(BC)），
但一般**不满足交换律**。两个 k×k 矩阵相乘是 O(k³)。

## 二、矩阵快速幂

正因为矩阵乘法满足结合律，求一个矩阵的 n 次幂可以套用普通快速幂的"**二进制拆分**"：

\`\`\`text
M^n：n 为偶数 → (M²)^(n/2)；n 为奇数 → M × M^(n−1)
\`\`\`

只需 O(log n) 次矩阵乘法，每次 O(k³)，合计 **O(k³ log n)**。

## 三、核心应用：加速线性递推

斐波那契 \`F(0)=0, F(1)=1, F(k+1)=F(k)+F(k−1)\` 可以写成矩阵形式：

\`\`\`text
[ F(k+1) ]   [1 1] [ F(k) ]
[ F(k)   ] = [1 0] [ F(k-1)]
                      ↑ 转移矩阵 M
\`\`\`

于是：

\`\`\`text
[ F(n+1) ]   M^n [ F(1) ]
[ F(n)   ] =     [ F(0) ]
\`\`\`

只要用矩阵快速幂算出 \`M^n\`，就能在 **O(log n)** 时间得到第 n 项，而不必逐项递推。

> **💡 一般规律：** 任何**线性递推**（各项由前面若干项的固定倍数相加得到）都能写成"**转移矩阵 × 状态列向量**"，
> 再用矩阵快速幂把求第 n 项加速到 O(log n)。构造转移矩阵是关键，常配合取模。
`,
    examples: [
      {
        title: '矩阵快速幂求斐波那契第 n 项',
        level: '提高',
        statement: `**题目描述**

输入 n，求斐波那契数列第 n 项 F(n) 对 10⁹+7 取模（F(0)=0，F(1)=1）。`,
        input: '一个非负整数 n。',
        output: '一个整数：F(n) mod 10⁹+7。',
        samples: [['10', '55'], ['20', '6765'], ['0', '0']],
        analysis: `### 解题思路

- 用二维 vector 表示矩阵，写出矩阵乘法（边乘边取模）与矩阵快速幂；
- 转移矩阵 \`M={{1,1},{1,0}}\`，答案取 \`M^n\` 的**第二行第一列**（因 F(0)=0、F(1)=1）；
- 整体 O(log n)，n 很大也能瞬间算出。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using Matrix = vector<vector<long long>>;
const long long MOD = 1000000007;

Matrix mul(const Matrix &A, const Matrix &B) {
    int a = A.size(), b = B.size(), c = B[0].size();
    Matrix C(a, vector<long long>(c, 0));
    for (int i = 0; i < a; i++)
        for (int k = 0; k < b; k++) if (A[i][k])
            for (int j = 0; j < c; j++)
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
    return C;
}
Matrix mpow(Matrix A, long long n) {
    int k = A.size();
    Matrix res(k, vector<long long>(k, 0));   // 单位矩阵
    for (int i = 0; i < k; i++) res[i][i] = 1;
    while (n > 0) {
        if (n & 1) res = mul(res, A);
        A = mul(A, A);
        n >>= 1;
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n; cin >> n;
    Matrix M = {{1, 1}, {1, 0}};
    Matrix P = mpow(M, n);
    cout << P[1][0] << '\\n';      // F(n)
    return 0;
}`,
      },
      {
        title: '增广矩阵求斐波那契前 n 项和',
        level: '挑战',
        statement: `**题目描述**

求斐波那契数列前 n 项之和 \`S(n) = F(1)+F(2)+…+F(n)\` 对 10⁹+7 取模。F(1)=F(2)=1。`,
        input: '一个正整数 n。',
        output: '一个整数：S(n) mod 10⁹+7。',
        samples: [['5', '12'], ['1', '1'], ['10', '143']],
        analysis: `### 解题思路

把"和"也加进状态，用 **3×3 增广转移矩阵**。状态列 \`[F(k), F(k+1), S(k)]\`：

\`\`\`text
[F(k+1)]   [0 1 0] [ F(k) ]
[F(k+2)] = [1 1 0] [F(k+1)]
[S(k+1)]   [0 1 1] [ S(k) ]
\`\`\`

\`S(n) = T^(n−1)\` 乘初始列 \`[1,1,1]\` 的第三分量。
n=5：1+1+2+3+5 = 12。这展示了"**给状态加一维就能用矩阵维护前缀和**"的通用技巧。`,
        code: `#include <bits/stdc++.h>
using namespace std;
using Mx = vector<vector<long long>>;
const long long MOD = 1000000007;

Mx mul(const Mx &A, const Mx &B) {
    int n = A.size(), m = B[0].size(), k = B.size();
    Mx C(n, vector<long long>(m, 0));
    for (int i = 0; i < n; i++)
        for (int t = 0; t < k; t++) if (A[i][t])
            for (int j = 0; j < m; j++)
                C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % MOD;
    return C;
}
Mx mpow(Mx A, long long e) {
    int n = A.size();
    Mx R(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) R[i][i] = 1;
    while (e) {
        if (e & 1) R = mul(R, A);
        A = mul(A, A);
        e >>= 1;
    }
    return R;
}
int main() {
    long long n; cin >> n;
    Mx T = {{0,1,0}, {1,1,0}, {0,1,1}};
    Mx P = mpow(T, n - 1);
    long long ans = 0;                        // 初始 [F1,F2,S1]=[1,1,1]
    for (int j = 0; j < 3; j++) ans = (ans + P[2][j]) % MOD;
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**矩阵维度不匹配**：前一个的列数必须等于后一个的行数。`,
      `**以为矩阵乘法可交换**：一般 AB ≠ BA，但结合律成立（快速幂的依据）。`,
      `**快速幂忘记初始化单位矩阵**：累乘初值应是单位矩阵 I。`,
      `**相乘不取模**：数值会迅速溢出 long long，每个中间结果都要取模。`,
      `**转移矩阵构造错**：要保证 M×状态列向量后得到"下一组状态"。`,
    ],
    exercises: [
      { title: '加速三项递推', level: '挑战',
        statement: '对递推 f(n)=f(n−1)+2f(n−2)+3f(n−3) 构造 3×3 转移矩阵并求 f(n)。',
        hint: '状态列放 [f(n),f(n−1),f(n−2)]。' },
      { title: '矩阵乘法复杂度', level: '基础',
        statement: '说明用矩阵快速幂求 k 阶递推第 n 项的时间复杂度。',
        hint: 'O(k³ log n)。' },
    ],
    summary: `
矩阵乘法要求前列=后行、满足结合律但不可交换，k×k 相乘 O(k³)。**矩阵快速幂**做二进制拆分，
O(k³ log n) 算出 M^n。把**线性递推**写成"转移矩阵 × 状态列向量"后，即可用它把求第 n 项从 O(n) 加速到 **O(log n)**，
斐波那契的转移矩阵为 [[1,1],[1,0]]。
`,
  };

  /* ---------------- 高斯消元 ---------------- */
  T['gaussian-elim'] = {
    chapter: '第3章 数学进阶',
    time: '约 45 分钟',
    body: `
## 一、用途：解多元一次方程组

给定 n 个线性方程：

\`\`\`text
a11 x1 + a12 x2 + … + a1n xn = b1
…
an1 x1 + … + ann xn = bn
\`\`\`

把系数和等号右边合成一张 **n 行 n+1 列的增广矩阵**，用**高斯消元**把它化为"每行只剩一个变量"，
直接读出解。它也能判断方程组是**唯一解、无解还是无穷多解**。

## 二、消元思路（高斯-约当）

对每一列（变量）\`i\`：

1. **选主元**：在第 i～n−1 行中，选该列绝对值**最大**的一行作为第 i 行（提高数值稳定性）；
2. 若主元接近 0（小于 ε），说明该列消不掉 → 可能**无解或无穷多解**；
3. 把主元行**归一化**（整行除以主元，使主元变成 1）；
4. 用这一行把**其他所有行**在该列的系数都消成 0；

处理完每列后，矩阵变成：

\`\`\`text
1 0 0 | x1
0 1 0 | x2
0 0 1 | x3
\`\`\`

最后一列就是各个变量的解。

> **💡 为什么要选绝对值最大的主元？** 除以一个很小的数会放大误差。选大主元能让结果更稳定，这叫"部分选主元"。
`,
    examples: [
      {
        title: '高斯消元解线性方程组',
        level: '挑战',
        statement: `**题目描述**

输入 n 和 n 个方程的增广矩阵（每行 n 个系数 + 等号右边的值），在**有唯一解**时输出各个未知数（保留 2 位小数）。`,
        input: '第一行 n，随后 n 行 n+1 个小数。',
        output: '一行 n 个解。',
        samples: [['2\n2 1 5\n1 -1 1', '2.00 1.00']],
        analysis: `### 解题思路

- 第 0 列选主元（2 与 1 中取 2），归一化后消掉第 1 行该列；
- 再处理第 1 列；最终读出 x1=2、x2=1；
- 本题保证唯一解；一般情形要根据"主元为 0 的行"判断无解（出现 0=非0）或无穷多解。`,
        code: `#include <bits/stdc++.h>
using namespace std;
double a[105][106];
const double EPS = 1e-9;

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= n; j++) cin >> a[i][j];

    for (int col = 0; col < n; col++) {
        int pivot = col;                          // 选主元
        for (int r = col + 1; r < n; r++)
            if (fabs(a[r][col]) > fabs(a[pivot][col])) pivot = r;
        swap(a[col], a[pivot]);
        if (fabs(a[col][col]) < EPS) { cout << "无唯一解"; return 0; }

        double div = a[col][col];                 // 归一化主元行
        for (int j = col; j <= n; j++) a[col][j] /= div;

        for (int r = 0; r < n; r++) if (r != col) {  // 消掉其他行该列
            double factor = a[r][col];
            for (int j = col; j <= n; j++) a[r][j] -= factor * a[col][j];
        }
    }
    cout << fixed << setprecision(2);
    for (int i = 0; i < n; i++)
        cout << a[i][n] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}`,
      },
      {
        title: '判断方程组：唯一解 / 无解 / 无穷解',
        level: '挑战',
        statement: `**题目描述**

输入一个 n 元线性方程组的增广矩阵，只判断它的解的情况：\`unique\`（唯一解）、\`no solution\`（无解）、\`infinite\`（无穷多解）。`,
        input: '第一行 n，随后 n 行 n+1 个小数。',
        output: 'unique / no solution / infinite。',
        samples: [
          ['2\n1 1 2\n2 2 3', 'no solution'],
          ['2\n1 1 2\n2 2 4', 'infinite'],
          ['2\n2 1 5\n1 -1 1', 'unique'],
        ],
        analysis: `### 解题思路

一边消元一边统计**秩 rank**：
- 某列在剩余行找不到非 0 主元，说明它是**自由变量**列（rank 不增）；
- 消元后若出现"系数全 0、右端却非 0"的矛盾行 → **无解**；
- 没有矛盾但 rank < n（存在自由变量）→ **无穷多解**；rank = n → **唯一解**。

例 1：两行系数成比例(1,1)/(2,2)、右端 2 与 3 不成比例 → 无解。`,
        code: `#include <bits/stdc++.h>
using namespace std;
double a[105][106];
const double EPS = 1e-9;
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= n; j++) cin >> a[i][j];

    int rank = 0;
    for (int col = 0; col < n; col++) {
        int piv = -1;                          // 未处理行中找主元
        for (int r = rank; r < n; r++)
            if (fabs(a[r][col]) > EPS) { piv = r; break; }
        if (piv == -1) continue;               // 自由变量列
        swap(a[rank], a[piv]);
        for (int r = 0; r < n; r++) if (r != rank) {
            double f = a[r][col] / a[rank][col];
            for (int j = col; j <= n; j++) a[r][j] -= f * a[rank][j];
        }
        rank++;
    }
    for (int r = 0; r < n; r++) {              // 矛盾行：系数全0、右端非0
        bool zero = true;
        for (int j = 0; j < n; j++)
            if (fabs(a[r][j]) > EPS) { zero = false; break; }
        if (zero && fabs(a[r][n]) > EPS) { cout << "no solution"; return 0; }
    }
    cout << (rank < n ? "infinite" : "unique");
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**不选主元直接消**：除以很小的主元会放大误差，应选列上绝对值最大者。`,
      `**主元接近 0 仍继续**：此时无唯一解，要单独判断无解/无穷解。`,
      `**消元漏了主元行之前的行**：高斯-约当要消掉"其他所有行"，不只是下面的行。`,
      `**归一化时漏掉等号右列**：第 n+1 列也要一起除以主元。`,
      `**用整数做消元**：消元会产生分数，应使用 double/分数。`,
    ],
    exercises: [
      { title: '判断方程组解的情况', level: '提高',
        statement: '各构造一个无解、一个无穷多解的方程组，观察消元后矩阵形态。',
        hint: '出现 0 0|非0 为无解，0 0|0 为自由变量。' },
      { title: '解三元一次方程组', level: '提高',
        statement: '用高斯消元解一个 3 元方程组并手工验算。',
        hint: '代回原方程检验。' },
    ],
    summary: `
高斯消元在**增广矩阵**上对每列"选主元 → 归一化 → 消掉其他行"（高斯-约当），把矩阵化为每行一个变量，
末列即解；时间 **O(n³)**。选绝对值最大主元保证稳定，主元为 0 时需判断无解或无穷多解。
`,
  };

  /* ---------------- 博弈论 ---------------- */
  T['game-theory'] = {
    chapter: '第3章 数学进阶',
    time: '约 50 分钟',
    body: `
## 一、公平组合游戏与必胜/必败态

讨论一类**公平组合游戏**：双方轮流操作、双方能走的规则只取决于当前局面（与是谁无关）、
操作数有限、无法操作者输。

把局面分为：

- **必败态（P-position）**：当前玩家无论怎么走，都会把局面交给对方的必胜态；
- **必胜态（N-position）**：存在一种走法，能把局面变成对方的必败态。

从**终止局面（无法操作 = 必败）**出发，逆向就能标记每个局面：
"能一步走到必败态"的就是必胜态，"所有走法都通向必胜态"的是必败态。

## 二、SG 函数与 mex

给每个局面一个 **SG 值**。定义 **mex（最小的、没有出现的非负整数）**：

\`\`\`text
SG(终止局面) = 0
SG(x) = mex{ SG(y) | y 是 x 一步能走到的局面 }
\`\`\`

例如集合 {0,1,3} 的 mex 是 2（0、1 出现了，最小缺 2）。

- **SG(x) = 0 ⇔ x 是必败态**；SG(x) ≠ 0 则为必胜态。

## 三、SG 定理：多个子游戏用异或

当一个游戏由**多个互不干扰的子游戏**组成、玩家每次选一个子游戏操作时：

\`\`\`text
整体 SG = 各个子游戏 SG 的异或（XOR）
\`\`\`

整体**异或结果非 0 → 先手必胜；为 0 → 先手必败**。

## 四、Nim 游戏（最经典）

n 堆石子，每次选一堆、取走任意正数颗。单堆大小为 x 时 SG(x) = x（可取 0…x−1，mex 为 x）。
由 SG 定理：

\`\`\`text
a1 XOR a2 XOR … XOR an ≠ 0 → 先手必胜
                       = 0 → 先手必败
\`\`\`

> **💡 为什么看异或？** 异或提供了一种"平衡"判据：异或为 0 时，无论先手怎么打破平衡，
> 后手都能恢复平衡，最后一定是后手面对"全 0（无子可取）"。
`,
    examples: [
      {
        title: 'Nim 游戏判定胜负',
        level: '提高',
        statement: `**题目描述**

n 堆石子，Nim 规则（每次选一堆取任意正数颗）。问先手必胜还是必败。`,
        input: '第一行 n，第二行 n 个非负整数（各堆石子数）。',
        output: 'first（先手胜）或 second（后手胜）。',
        samples: [['3\n3 4 5', 'first'], ['2\n1 1', 'second']],
        analysis: `### 解题思路

把所有石子数异或，非 0 先手胜：
- (3,4,5)：3 xor 4 = 7，7 xor 5 = 2 ≠ 0，先手胜；
- (1,1)：1 xor 1 = 0，后手胜。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    int xorsum = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        xorsum ^= x;
    }
    cout << (xorsum != 0 ? "first" : "second") << '\\n';
    return 0;
}`,
      },
      {
        title: '取石子游戏的 SG 函数（可取 1/3/4 颗）',
        level: '挑战',
        statement: `**题目描述**

一堆 n 颗石子，每次可取 1、3 或 4 颗（不能超过剩余数），取完者胜。求 SG(n)，并判断先手胜负。`,
        input: '一个非负整数 n。',
        output: 'SG 值与必胜/必败。',
        samples: [['2', 'SG=0, 必败'], ['5', 'SG=3, 必胜']],
        analysis: `### 解题思路

自小到大计算 SG：对每个 x，收集所有合法走法到达局面的 SG，取 mex。
- SG(2)=0（只能拿 1，走到 SG(1)=1，mex{1}=0）→ 必败；
- SG(5)=3（拿 1/3/4 分别走到 SG4=2、SG2=0、SG1=1，集合 {0,1,2}，mex=3）→ 必胜。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int sg[10005];
int moves[3] = {1, 3, 4};

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    sg[0] = 0;                          // 0 颗：无法操作，必败
    for (int x = 1; x <= n; x++) {
        bool seen[10] = {false};
        for (int m : moves)
            if (m <= x) seen[sg[x - m]] = true;   // 一步走到的 SG
        int g = 0;
        while (seen[g]) g++;                    // mex
        sg[x] = g;
    }
    cout << "SG=" << sg[n] << ", "
         << (sg[n] != 0 ? "必胜" : "必败") << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**胜负判据写反**：异或非 0 先手胜，为 0 先手败（终止全 0 是必败态）。`,
      `**mex 算错**：mex 是"最小的未出现非负整数"，不是最大值或个数。`,
      `**SG 定理用加法/取并集**：多子游戏组合用**异或**，不是相加。`,
      `**漏掉非法走法**：取 m 颗时要判断 m ≤ 剩余石子数。`,
    ],
    exercises: [
      { title: '巴什博弈（Bash Game）', level: '基础',
        statement: '一堆 n 颗，每次至多取 k 颗，求先手胜负规律。',
        hint: 'n 是 k+1 的倍数时必败。' },
      { title: '多堆取石子 SG 异或', level: '挑战',
        statement: '若每堆规则改为可取 1/3/4，多堆时用各堆 SG 异或判定。',
        hint: '整体 SG = 各堆 SG 异或。' },
    ],
    summary: `
公平组合游戏从终止必败态逆向标记**必胜/必败态**。**SG 函数**用 mex 定义：SG=0 即必败。
**SG 定理**：多个子游戏的整体 SG = 各 SG 的**异或**，非 0 先手胜。**Nim** 单堆 SG=x，
故胜负看"各堆石子数的异或"是否为 0。
`,
  };

  Object.assign(window.TOPICS, T);
})();
