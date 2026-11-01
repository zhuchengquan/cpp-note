/* ============================================================
   第一部分 · 第6章 循环结构
   loop-for / loop-while / loop-nested
   ============================================================ */
(function () {
  const T = {};

  T['loop-for'] = {
    chapter: '第6章 循环结构',
    time: '约 35 分钟',
    body: `
## 一、为什么需要循环？

考虑“输出 1 到 100”“求 1000 个数的和”——手写一千遍 cout 不现实。**循环**让计算机重复执行一段代码，是枚举、模拟、搜索等一切算法的发动机。

\`\`\`cpp
for (初始化; 循环条件; 每次循环后执行) {
    循环体;
}
\`\`\`

执行顺序（牢记）：

\`\`\`text
① 初始化（只执行一次）
② 判断条件：真 → 执行循环体 → ③；假 → 循环结束
③ 执行“迭代表达式”（通常 i++），回到 ②
\`\`\`

\`\`\`cpp
for (int i = 1; i <= 5; i++) {   // i 从 1 到 5，共 5 次
    cout << i << " ";
}
// 输出：1 2 3 4 5
\`\`\`

> **注意循环区间习惯：** \`i = 1; i <= n\` 循环 n 次（1..n）；\`i = 0; i < n\` 也循环 n 次（0..n-1，数组下标风格）。两种都要一眼数清次数。

## 二、循环变量的作用域

在 for 括号里声明的 \`i\` 只在循环内有效：

\`\`\`cpp
for (int i = 0; i < 3; i++) {
    cout << i;          // 012
}
// cout << i;           // ❌ 这里 i 已经不存在
\`\`\`

\`i--\`、\`i += 2\` 都合法：

\`\`\`cpp
for (int i = 10; i >= 1; i--) cout << i << " ";      // 倒序
for (int i = 0; i <= 100; i += 2) cout << i << " ";  // 偶数
for (char c = 'a'; c <= 'z'; c++) cout << c;         // 字符也能循环
\`\`\`

## 三、三大求和套路（必须形成肌肉记忆）

### 1. 累加器

\`\`\`cpp
long long sum = 0;                    // ① 清零
for (int i = 1; i <= 100; i++) {
    sum += i;                         // ② 逐项累加
}
cout << sum;                          // 5050
\`\`\`

### 2. 计数器

\`\`\`cpp
int cnt = 0;
for (int i = 1; i <= 100; i++) {
    if (i % 7 == 0) cnt++;            // 满足条件才计数
}
\`\`\`

### 3. 累乘器（阶乘）

\`\`\`cpp
long long p = 1;                      // 乘法的单位元是 1，不是 0！
for (int i = 1; i <= 20; i++) {
    p *= i;                           // 20! ≈ 2.43×10^18，需要 long long
}
\`\`\`

## 四、边读边处理

竞赛题最常见的数据处理形式：

\`\`\`cpp
int n;
cin >> n;                  // 先读个数 n
long long sum = 0, x;
for (int i = 1; i <= n; i++) {
    cin >> x;              // 每轮读一个
    sum += x;              // 立刻处理，不必等全部读完（也不必用数组！）
}
cout << sum;
\`\`\`

> **💡 重要意识：** 如果题目只需要总和、个数、最大值，数据“用过即扔”即可，**不需要开数组**保存全部输入。

## 五、打标记与打擂台

\`\`\`cpp
// 打擂台求最大值：先让第一个数当擂主
int n, x;
cin >> n >> x;
int mx = x;                        // 初值不能想当然写 0（可能全是负数）
for (int i = 2; i <= n; i++) {
    cin >> x;
    if (x > mx) mx = x;            // 更大的当新擂主
}
\`\`\`
`,
    examples: [
      {
        title: '等差数列求和',
        level: '入门',
        statement: `**题目描述**

输入首项 a、末项 b、公差 d（均为正整数，保证数据成数列），求等差数列各项之和。`,
        samples: [['1 100 1', '5050'], ['2 10 2', '30']],
        analysis: `### 解题思路

让循环变量 i 从 a 开始，每次 +d，超过 b 停止，累加即可。循环次数不直接知道时，条件写 \`i <= b\` 比硬算项数更稳。`,
        code: `#include <iostream>
using namespace std;
int main() {
    int a, b, d;
    cin >> a >> b >> d;

    long long sum = 0;
    for (int i = a; i <= b; i += d) {   // i 依次取数列各项
        sum += i;
    }
    cout << sum << '\\n';
    return 0;
}`,
      },
      {
        title: '偶数位统计',
        level: '基础',
        statement: `**题目描述**

输入 n 个整数（第一个数是 n），输出其中偶数的个数与偶数的平均值（保留 2 位小数）。`,
        samples: [['6\n3 4 6 9 10 13', '3 6.67']],
        analysis: `### 解题思路

一个循环里同时维护两个量：计数器 cnt、累加器 sum。平均值 = sum/cnt，注意：

- 除数可能为 0，先判断有没有偶数；
- 求小数均值用 \`(double)sum / cnt\`。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int n;
    cin >> n;

    int cnt = 0;
    long long sum = 0;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        if (x % 2 == 0) {       // 偶数
            cnt++;
            sum += x;
        }
    }

    if (cnt == 0) {
        cout << "none\\n";
    } else {
        cout << cnt << " " << fixed << setprecision(2)
             << (double)sum / cnt << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '求最大值、最小值与极差',
        level: '基础',
        statement: `**题目描述**

输入 n 个学生的身高（整数，n≥1），输出最高、最矮与二者之差（极差）。`,
        samples: [['5\n150 165 172 158 180', '180 150 30']],
        analysis: `### 解题思路

打擂台：读入第一个值同时作为 mx 和 mn 的初值，之后逐个比较更新。

> 不要把 mx 初值写成 0、mn 初值写成 999999 就万事大吉——数据可能全负或超过预设，用第一个输入最稳。`,
        code: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;

    int h;
    cin >> h;
    int mx = h, mn = h;          // 第一个数同时是当前最大、最小

    for (int i = 2; i <= n; i++) {
        cin >> h;
        if (h > mx) mx = h;      // 更新最高
        if (h < mn) mn = h;      // 更新最矮
    }

    cout << mx << " " << mn << " " << mx - mn << '\\n';
    return 0;
}`,
      },
      {
        title: '阶乘末尾 0 的个数（思维题）',
        level: '挑战',
        statement: `**题目描述**

输入 n（n≤10000），输出 n! 末尾有多少个 0。

> 提示：10 = 2×5，阶乘中因子 2 远多于 5，所以答案就是 1~n 中因子 5 的总个数。`,
        samples: [['5', '1'], ['10', '2'], ['25', '6']],
        analysis: `### 解题思路

朴素地算出 n! 再数 0 不可行（数字太大）。数学转化：

- 每个 5 的倍数贡献一个 5：n/5 个；
- 25 的倍数贡献两个 5，多数了一次，再加 n/25；
- 125、625…… 同理。

答案 = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …，循环每次乘 5 即可，是“数论思维 + 循环”的经典题。`,
        code: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;

    int ans = 0;
    for (int p = 5; p <= n; p *= 5) {   // p = 5,25,125...
        ans += n / p;                   // 能被 p 整除的数各多贡献一个因子5
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**累加器忘初始化**或写成 int（大数溢出）：sum=0 用 long long，p=1 用 long long。`,
      `**差一错误（off-by-one）**：\`i=1;i<n\` 与 \`i=1;i<=n\` 次数不同，写条件时明确“最后一轮 i 是几”。`,
      `**循环变量在体内修改**：for 里写 i++，体内又 i++，次数翻倍，难以调试。迭代只放在头部。`,
      `**最大值初值写 0**：全是负数时永远更新不了。用第一个输入做初值。`,
      `**逗号分隔写成两个 int**：\`for(int i=0,j=n; ...)\` 可以，但变量类型要一致；两个循环的变量最好分开。`,
    ],
    exercises: [
      { title: '奇数平方和', level: '入门',
        statement: '输入 n，求 1~n 中所有奇数的平方之和（n≤10⁵）。',
        hint: 'for 循环 i 从 1 开始 i+=2，sum += i*i，sum 用 long long。' },
      { title: '成绩统计', level: '基础',
        statement: '输入 n 个成绩，输出总分、平均分（1 位小数）、不及格人数。',
        hint: '一个循环完成求和与计数；平均 (double)sum/n。' },
      { title: '数位求和（任意位数）', level: '基础',
        statement: '输入一个非负整数 n（可能很大但不超过 10¹⁸），输出各位数字之和。',
        hint: 'while(n){ sum+=n%10; n/=10; } 下一个知识点的 while 也可先用 for。' },
      { title: '斐波那契数列', level: '提高',
        statement: '输入 k（k≤90），输出斐波那契数列第 k 项（1,1,2,3,5…）。',
        hint: '滚动两个变量 a,b；第 90 项约 2.8×10¹⁸，必须 long long。' },
      { title: '乘方取模（快速幂思想萌芽）', level: '挑战',
        statement: '输入 a、b，不使用 pow，用循环求 aᵇ（b≤30，a≤10）。',
        hint: 'long long r=1; 循环 b 次 r*=a。' },
    ],
    summary: `
- for 适合**次数明确**的循环：\`for(int i=起点; 条件; i++)\`，执行顺序“初始化→判断→体→迭代”；
- 三大套路：**累加器清零、计数器、累乘器置 1**；
- 边读边处理：只需总和/个数/最值时不必开数组；
- 打擂台用第一个输入做初值；注意 long long 与差一错误。
`,
  };

  T['loop-while'] = {
    chapter: '第6章 循环结构',
    time: '约 30 分钟',
    body: `
## 一、while：条件驱动的循环

当循环**次数不明确**，只知道“满足条件就继续”时，while 更自然：

\`\`\`cpp
while (条件) {
    循环体;       // 条件为真就反复执行
}
\`\`\`

执行流程：**先判断，后执行**。条件一开始就假，循环体一次也不执行。

\`\`\`cpp
int n = 100;
int cnt = 0;
while (n > 1) {       // 不断折半，多少次到 1？
    n /= 2;
    cnt++;
}
cout << cnt;          // log₂100 ≈ 7
\`\`\`

## 二、for 和 while 的关系

两者完全可以互换：

\`\`\`cpp
for (int i = 1; i <= 5; i++) cout << i;

// 等价于
int i = 1;
while (i <= 5) {
    cout << i;
    i++;
}
\`\`\`

选择经验：

- **数得清次数** → for（读 n 个数、枚举 1~n）；
- **数不清次数，看状态** → while（数位拆到 0、辗转相除、游戏模拟到结束）。

## 三、数位拆分：while 的主场

\`\`\`cpp
int n;
cin >> n;
while (n > 0) {
    int d = n % 10;    // 取出个位
    cout << d << " ";  // 处理这一位
    n /= 10;           // 砍掉个位
}
// 输入 365，输出：5 6 3（注意是逆序取出的）
\`\`\`

\`\`\`text
n=365 → d=5, n=36
n=36  → d=6, n=3
n=3   → d=3, n=0 → 结束
\`\`\`

## 四、do-while：先做后看

\`\`\`cpp
do {
    循环体;
} while (条件);     // ← 别忘了分号！
\`\`\`

先执行一次循环体再判断条件，**循环体至少执行一次**。适合“先读输入/先操作再决定是否继续”的菜单类场景，竞赛中使用较少。

## 五、死循环与 break 退出

\`\`\`cpp
while (true) {          // 永真条件 = 死循环
    int x;
    cin >> x;
    if (x == 0) break;  // 靠内部条件跳出
    cout << x * x << '\\n';
}
\`\`\`

读入到特定哨兵值（如 0）结束时常见。竞赛中 \`for(;;)\` 和 \`while(true)\` 都表示死循环，必须保证内部有可达的 break/return。

> **⚠️ 防死循环自查：** ① 条件里的变量是否在循环中被修改？② 修改方向是否让条件趋向 false？③ 初值是否可能直接跳过/困住循环？程序卡住不动、输出刷不停，多半是死循环。
`,
    examples: [
      {
        title: '数位反转',
        level: '基础',
        statement: `**题目描述**

输入一个正整数 n，输出它各位反转后的整数。如 120 反转后为 21（前导零自然消失）。`,
        samples: [['120', '21'], ['12345', '54321']],
        analysis: `### 解题思路

经典数位 while：每次取个位 d，把它“追加”到答案末尾 \`rev = rev*10 + d\`，再砍掉 n 的个位。

以 120 为例：rev: 0→0（0*10+0）→2（0*10+2）→21。前导 0 被整数运算自动吞掉，这也是用整数而不是逐字符输出的好处。`,
        code: `#include <iostream>
using namespace std;
int main() {
    long long n;
    cin >> n;

    long long rev = 0;
    while (n > 0) {
        int d = n % 10;        // 取个位
        rev = rev * 10 + d;    // 把 d 接到 rev 末尾
        n /= 10;               // 砍掉个位
    }
    cout << rev << '\\n';
    return 0;
}`,
      },
      {
        title: '冰雹猜想（3n+1）',
        level: '基础',
        statement: `**题目描述**

对任意正整数 n：若为偶数变成 n/2，若为奇数变成 3n+1。若干步后必到 1。输入 n，输出到达 1 经过的步数。`,
        samples: [['3', '7'], ['1', '0']],
        analysis: `### 解题思路

典型的“不知道循环多少次，只知道终止状态”：\`while(n != 1)\`，内部用 if 分奇偶变换并计数。n=1 时循环 0 次，答案恰好 0，边界自然成立。`,
        code: `#include <iostream>
using namespace std;
int main() {
    long long n;          // 3n+1 过程可能暂时超过 int，用 long long
    cin >> n;

    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0)
            n /= 2;
        else
            n = 3 * n + 1;
        steps++;
    }
    cout << steps << '\\n';
    return 0;
}`,
      },
      {
        title: '最大公约数（辗转相除法）',
        level: '提高',
        statement: `**题目描述**

输入两个正整数 a、b（≤10⁹），用欧几里得算法输出它们的最大公约数 gcd。`,
        samples: [['24 18', 'gcd=6\nlcm=72'], ['17 5', 'gcd=1\nlcm=85']],
        analysis: `### 解题思路

辗转相除：\`gcd(a,b) = gcd(b, a mod b)\`，反复做，直到余数为 0，此时的除数就是答案。

24,18 → 18,6 → 6,0，答案 6。循环次数极少（对数级）。下例还顺便输出最小公倍数 lcm = a/gcd×b（先除后乘防溢出）。`,
        code: `#include <iostream>
using namespace std;
int main() {
    long long a, b;
    cin >> a >> b;

    long long x = a, y = b;
    while (y != 0) {
        long long r = x % y;   // 余数
        x = y;                 // 除数变被除数
        y = r;                 // 余数变除数
    }
    long long g = x;
    cout << "gcd=" << g << '\\n';
    cout << "lcm=" << a / g * b << '\\n';   // 先除后乘，避免中间结果溢出
    return 0;
}`,
      },
      {
        title: '哨兵结束的成绩录入',
        level: '入门',
        statement: `**题目描述**

不断输入成绩，遇到 \`-1\` 表示结束，输出此前成绩的个数与平均分（保留 1 位小数）。不保证有成绩，0 个时输出 \`no score\`。`,
        samples: [['80 90 70 -1', '3 80.0']],
        analysis: `### 解题思路

“读到哨兵停止”用 while(true) + break 最直观。先读值再判断，既能处理任意数量，也能处理零个成绩的边界。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int x, cnt = 0;
    long long sum = 0;

    while (true) {
        cin >> x;
        if (x == -1) break;     // 哨兵：结束输入
        sum += x;
        cnt++;
    }

    if (cnt == 0) cout << "no score\\n";
    else cout << cnt << " " << fixed << setprecision(1)
              << (double)sum / cnt << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**while 条件变量不更新**：写成 \`while(x>0) cout<<x;\` 而 x 不变，死循环刷屏。`,
      `**do-while 忘分号**：\`while (条件)\` 后必须有 \`;\`。`,
      `**数位处理用 int 接收大数**：反转 2×10⁹ 可能超 int，n 和 rev 都用 long long。`,
      `**最小公倍数先乘后除**：a*b 可能溢出，写 \`a/gcd*b\` 先除后乘。`,
      `**死循环只靠关窗口**：Dev-C++ 中程序失控可用“停止”按钮；写代码时检查条件是否趋向终结。`,
    ],
    exercises: [
      { title: '位数统计', level: '入门',
        statement: '输入正整数 n，输出它是几位数。',
        hint: 'while(n){cnt++; n/=10;}。注意 0 应输出 1 位，单独处理。' },
      { title: '水仙花数', level: '基础',
        statement: '输出 100~999 中所有“水仙花数”（各位立方和等于自身，如 153=1³+5³+3³）。',
        hint: 'for 枚举三位数，while 或直接拆出 a,b,c 计算立方和。' },
      { title: '角谷步数最大值', level: '提高',
        statement: '输入 L、R，求区间 [L,R] 中冰雹猜想（3n+1）到达 1 步数最多的数。',
        hint: '外层 for 枚举区间，内层 while 跑变换，打擂台记录最大步数。' },
      { title: '小数精度的 while', level: '提高',
        statement: '一张纸厚 0.1 毫米，对折多少次能超过珠穆朗玛峰（8848 米 = 8,848,000 毫米）？用 double 循环模拟。',
        hint: 'double h=0.1; while(h<8848000){h*=2;cnt++;}' },
      { title: '十进制转二进制', level: '挑战',
        statement: '输入非负整数 n，输出它的二进制表示（提示：除 2 取余，逆序输出）。',
        hint: 'while(n){输出 n%2; n/=2;} 先得到的是低位，可用字符串拼接前面，或先存数组。' },
    ],
    summary: `
- while **先判断后执行**，适合次数不明、由状态控制的循环；do-while 至少执行一次；
- 数位三件套：\`%10\` 取个位、\`/10\` 砍个位、\`rev=rev*10+d\` 反转；
- 辗转相除 \`gcd(a,b)=gcd(b,a%b)\` 是最经典的 while 算法；
- 哨兵输入用 while(true)+break；严防死循环：条件变量必须朝终结方向变化。
`,
  };

  T['loop-nested'] = {
    chapter: '第6章 循环结构',
    time: '约 40 分钟',
    body: `
## 一、双重循环：循环里套循环

\`\`\`cpp
for (int i = 1; i <= 3; i++) {        // 外层：控制“行”
    for (int j = 1; j <= 4; j++) {    // 内层：控制“列”
        cout << "* ";
    }
    cout << '\\n';                      // 内层走完后换行
}
\`\`\`

执行规律：**外层走一步，内层走一整圈**。外层 3 次 × 内层 4 次 = 共打印 12 个星号。

\`\`\`text
* * * *
* * * *
* * * *
\`\`\`

三重循环同理，但复杂度增长很快：n³ 在 n=1000 时就是 10⁹ 次，必然超时（下一部分会学复杂度估算）。

## 二、图形打印：找“行号 i、列号 j”的规律

打印图形的通用方法：**外层循环枚举行 i，观察第 i 行打印什么**。

### 直角三角形

\`\`\`cpp
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++)   // 第 i 行有 i 个星号
        cout << "* ";
    cout << '\\n';
}
\`\`\`

### 数字三角形（列依赖于行）

\`\`\`cpp
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++)
        cout << j << " ";          // 每行打印 1..i
    cout << '\\n';
}
\`\`\`

### 居中等腰三角形：先打空格再打星号

第 i 行（1~n）：\`n-i\` 个前导空格 + \`2i-1\` 个星号。

\`\`\`cpp
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n - i; j++) cout << ' ';   // 空格
    for (int j = 1; j <= 2 * i - 1; j++) cout << '*';
    cout << '\\n';
}
\`\`\`

## 三、九九乘法表：内层与外层联动

\`\`\`cpp
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++)
        cout << j << "*" << i << "=" << j * i << "\\t";
    cout << '\\n';
}
\`\`\`

内层上界随外层变化（\`j<=i\`）是下三角模式；固定为 9 是全表。

## 四、break 与 continue

| 语句 | 作用 |
| --- | --- |
| \`break\` | **立即结束**所在的那一层循环 |
| \`continue\` | **跳过本次**循环剩余语句，直接进入下一次 |

\`\`\`cpp
for (int i = 1; i <= 10; i++) {
    if (i == 3) continue;   // 3 被跳过，不输出
    if (i == 7) break;      // 到 7 整个循环结束
    cout << i << " ";
}
// 输出：1 2 4 5 6
\`\`\`

> **⚠️ 注意：** break/continue 只作用于**最内层**循环。嵌套循环中想一次跳出多层，需要标志变量或 return，不能指望一个 break 冲出两重围。

## 五、枚举型双重循环

双重循环天然表示“枚举两个变量的所有组合”，是下一部分枚举算法的基础：

\`\`\`cpp
// 枚举 1~n 中和为 s 的数对
for (int a = 1; a <= n; a++)
    for (int b = a; b <= n; b++)
        if (a + b == s) cout << a << " " << b << '\\n';
\`\`\`

## 六、质数判断：单个数 & 一张表

\`\`\`cpp
// 判断 n 是不是质数：试除到 sqrt(n)
bool isPrime = (n >= 2);
for (int i = 2; 1LL * i * i <= n; i++) {   // i*i 用 1LL 防溢出
    if (n % i == 0) { isPrime = false; break; }
}
\`\`\`

\`\`\`cpp
// 输出 2~n 的所有质数（枚举 + 判断 = 朴素筛法雏形）
for (int x = 2; x <= n; x++) {
    bool ok = true;
    for (int i = 2; 1LL * i * i <= x; i++)
        if (x % i == 0) { ok = false; break; }
    if (ok) cout << x << " ";
}
\`\`\`
`,
    examples: [
      {
        title: '打印菱形',
        level: '基础',
        statement: `**题目描述**

输入奇数 n（n≤21），输出由星号组成、高为 n 行的实心菱形。`,
        samples: [['5', `  *
 ***
*****
 ***
  *`]],
        analysis: `### 解题思路

拆成“上三角 + 倒三角”两段循环：

- 上半 i=1..(n+1)/2：空格 k-i 个、星号 2i−1 个（k=(n+1)/2）；
- 下半倒序 i=k-1..1：同样公式。

也可以用绝对值把两段合并：第 r 行（从 −k+1 到 k−1）空格数 = |r|。`,
        code: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    int k = (n + 1) / 2;          // 上半部分行数（含中间行）

    for (int i = 1; i <= k; i++) {                 // 上半（含中间）
        for (int j = 1; j <= k - i; j++) cout << ' ';
        for (int j = 1; j <= 2 * i - 1; j++) cout << '*';
        cout << '\\n';
    }
    for (int i = k - 1; i >= 1; i--) {             // 下半（倒序）
        for (int j = 1; j <= k - i; j++) cout << ' ';
        for (int j = 1; j <= 2 * i - 1; j++) cout << '*';
        cout << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '百钱买百鸡（枚举）',
        level: '提高',
        statement: `**题目描述**

公鸡 5 文钱一只、母鸡 3 文、小鸡 3 只 1 文。100 文钱恰好买 100 只鸡，输出所有买法（公鸡数、母鸡数、小鸡数）。`,
        samples: [['（无输入，输出多组）', `0 25 75
4 18 78
8 11 81
12 4 84`]],
        analysis: `### 解题思路

枚举公鸡 x（0~20）、母鸡 y（0~33），小鸡数 z=100−x−y，检查钱数是否为 100：

\`5x + 3y + z/3 = 100\`

为避免整除，改写为 \`15x + 9y + z = 300\`（两边乘 3）。双重循环枚举是最朴素的“让计算机穷举”思想。`,
        code: `#include <iostream>
using namespace std;
int main() {
    for (int x = 0; x <= 20; x++) {           // 公鸡最多 100/5 只
        for (int y = 0; y <= 33; y++) {       // 母鸡最多 100/3 只
            int z = 100 - x - y;              // 小鸡凑满 100 只
            // 钱的条件：5x+3y+z/3=100；z%3==0 保证 z/3 是整数
            if (z >= 0 && z % 3 == 0 && 5 * x + 3 * y + z / 3 == 100) {
                cout << x << " " << y << " " << z << '\\n';
            }
        }
    }
    return 0;
}`,
      },
      {
        title: '第 n 个质数',
        level: '提高',
        statement: `**题目描述**

输入 n（n≤1000），输出第 n 个质数（第 1 个质数是 2）。`,
        samples: [['1', '2'], ['10', '29']],
        analysis: `### 解题思路

while 控制“找到的质数个数”，for 负责判断当前数是否为质数：

- 从 2 开始逐个检查；
- 是质数就计数，计数到 n 输出并停止；
- 试除只需到 √x，用 \`1LL*i*i<=x\` 避免乘法溢出。

第 1000 个质数只有 7919，朴素方法完全够快。`,
        code: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;

    int cnt = 0;
    int x = 1;
    while (cnt < n) {
        x++;                          // 检查下一个数
        bool prime = true;
        for (int i = 2; 1LL * i * i <= x; i++) {
            if (x % i == 0) { prime = false; break; }
        }
        if (prime) cnt++;
    }
    cout << x << '\\n';
    return 0;
}`,
      },
      {
        title: '矩阵转置',
        level: '提高',
        statement: `**题目描述**

输入 n 行 m 列的整数矩阵（n,m≤100），输出它的转置矩阵（行列互换）。`,
        samples: [['2 3\n1 2 3\n4 5 6', `1 4
2 5
3 6`]],
        analysis: `### 解题思路

本题需要数组（第7章会系统学），这里先用二维数组体会“双重循环处理表格”。

转置输出的第 i 行第 j 列 = 原矩阵第 j 行第 i 列，所以输出循环把行列次序反过来枚举即可。`,
        code: `#include <iostream>
using namespace std;
int a[105][105];          // 全局数组（开在 main 外面），容量大且自动清零
int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            cin >> a[i][j];

    for (int j = 0; j < m; j++) {       // 注意：转置后外层按原列走
        for (int i = 0; i < n; i++)
            cout << a[i][j] << (i + 1 == n ? '\\n' : ' ');
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**以为一个 break 能跳出多层循环**：它只结束最内层；要用标志变量或封装成函数 return。`,
      `**continue 放在 i++ 之前导致死循环**（while 中）：continue 跳过的是循环体，for 的 i++ 在头部会照常执行，while 要自己保证迭代不被跳过。`,
      `**图形题不用行号规律硬打印**：始终先写“第 i 行有几个空格、几个符号”。`,
      `**判断质数试除到 n**：浪费 10⁵ 倍时间；到 √n 足够，且记得先排除 n<2。`,
      `**三重循环枚举不估次数**：1000³=10⁹ 会 TLE，枚举前先心算总次数。`,
    ],
    exercises: [
      { title: '九九乘法表变体', level: '入门',
        statement: '输出 9×9 完整乘法表（含上三角），每项占 8 个字符宽度对齐（用 setw(8)）。',
        hint: 'j 从 1 到 9 而不是到 i。' },
      { title: '空心矩形', level: '基础',
        statement: '输入 n、m，输出 n 行 m 列的空心矩形（只有边界是 *，内部空格）。',
        hint: 'i==1||i==n||j==1||j==m 时输出 *，否则输出空格。' },
      { title: '统计素数个数', level: '基础',
        statement: '输入 L、R（R≤10000），输出区间内质数个数。',
        hint: '外层枚举每个数，内层试除到 sqrt。' },
      { title: '完数查找', level: '提高',
        statement: '输出 2~1000 中所有完数（恰好等于自身以外因数之和，如 6=1+2+3）。',
        hint: '外层枚举 n，内层枚举 1..n/2 累加真因数。' },
      { title: '蛇形方阵', level: '挑战',
        statement: '输入 n，输出 n×n 的“蛇形矩阵”：第 1 行 1..n 正序，第 2 行 n+1..2n 逆序，交替填充。',
        hint: '奇数行从左到右填，偶数行先算好这一行的起止值再倒着放，也可用二维数组按列规律填。' },
    ],
    summary: `
- 双重循环：**外层走一步、内层走一圈**，总次数 = 外层次数 × 内层次数；
- 图形题方法：外层定行，内层按“第 i 行的空格数、符号数”打印；
- \`break\` 结束整层循环，\`continue\` 跳过本轮，只对最内层生效；
- 质数判断试除到 √n（\`1LL*i*i<=n\` 防溢出）；枚举前估算总次数。
`,
  };

  Object.assign(window.TOPICS, T);
})();
