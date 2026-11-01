/* ============================================================
   第一部分 · 第9章 函数
   func-basic / func-params / func-recursion
   ============================================================ */
(function () {
  const T = {};

  T['func-basic'] = {
    chapter: '第9章 函数',
    time: '约 35 分钟',
    body: `
## 一、为什么需要函数？

函数是**给一段代码起的名字**。它解决三大痛点：

1. **复用**：同一段逻辑（判断质数、求 gcd）不想复制粘贴十遍；
2. **抽象**：调用者只需知道“给它什么、它返回什么”，不必关心内部细节；
3. **分治**：把大问题拆成小函数，主程序像作文提纲一样清晰。

\`\`\`cpp
#include <iostream>
using namespace std;
// 函数定义：返回类型 函数名(参数列表) { 函数体 }
int add(int a, int b) {
    return a + b;       // return 把结果交还给调用者
}

int main() {
    cout << add(3, 5);  // 调用：输出 8
    return 0;
}
\`\`\`

## 二、函数的组成

\`\`\`cpp
返回值类型  函数名(形参列表)
{
    函数体;
    return 返回值;
}
\`\`\`

- **形参**：函数定义时括号里的变量（a、b），是“占位的盒子”；
- **实参**：调用时真正传进去的值（3、5），会被复制给形参；
- **返回值类型**：int/double/char/bool/void…，必须与 return 的值匹配；
- **void**：没有返回值的函数（只做动作，如打印），内部可不写 return。

\`\`\`cpp
void printLine(int n) {            // void：无返回值
    for (int i = 0; i < n; i++) cout << '-';
    cout << '\\n';
}

bool isLeap(int y) {               // 返回布尔值
    return (y%4==0 && y%100!=0) || y%400==0;
}
\`\`\`

## 三、函数声明：先声明，后使用

C++ 编译器从上往下读，调用一个函数时它必须已经“见过”。两种组织方式：

\`\`\`cpp
#include <iostream>
using namespace std;
// 方式一：把被调用函数写在 main 上面
int square(int x) { return x * x; }
int main() { cout << square(4); }
\`\`\`

\`\`\`cpp
#include <iostream>
using namespace std;
// 方式二：先写函数原型（声明），定义放后面——工程常见写法
int square(int x);          // 函数声明（分号结尾）
int main() { cout << square(4); }
int square(int x) { return x * x; }   // 函数定义
\`\`\`

> 竞赛代码通常不长，**直接把自定义函数写在 main 上方**最简单。

## 四、return 的两个作用

1. 把结果返回给调用者；
2. **立即结束函数**（提前退出）。

\`\`\`cpp
bool isPrime(int n) {
    if (n < 2) return false;          // 提前返回：边界情况
    for (int i = 2; 1LL*i*i <= n; i++)
        if (n % i == 0) return false; // 发现因数，立刻结束
    return true;
}
\`\`\`

## 五、函数的设计原则

- **一个函数做一件事**，名字是动词或判断：\`getMax\`、\`isPrime\`、\`printAns\`；
- 函数之间通过**参数和返回值**交流，尽量少依赖全局变量（更易调试、可复用）；
- 不要为了短而写函数；当同一段逻辑出现两次、或主函数超过一屏时，就该提取函数了；
- 算法题的常用函数化：\`isPrime()\`、\`gcd()\`、\`check()\`（二分判定）、\`dfs()\`、\`bfs()\`。
`,
    examples: [
      {
        title: '组合数 C(n,2) 函数化',
        level: '基础',
        statement: `**题目描述**

输入 n 对同学关系（保证不重复），函数 \`c2(k)=k(k-1)/2\` 表示 k 个人两两组合数。输入若干组 k，输出每组的组合数，直到读入 0 结束。`,
        samples: [['3\n5\n0', '3\n10']],
        analysis: `### 解题思路

把公式封装成 \`long long c2(long long k)\`：主程序只负责循环读入和打印，逻辑分层清晰。k(k−1) 可能超 int，返回 long long。`,
        code: `#include <iostream>
using namespace std;

// 计算 k 个人中选 2 个的组合数
long long c2(long long k) {
    return k * (k - 1) / 2;
}

int main() {
    long long k;
    while (cin >> k && k != 0) {   // 读到 0 结束
        cout << c2(k) << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '质数判定函数 + 哥德巴赫验证',
        level: '提高',
        statement: `**题目描述**

实现 \`bool isPrime(int n)\`，并用它验证：输入偶数 n（4len≤10000），找出一组合法的质数拆分 n=a+b（aleb）。`,
        samples: [['10', '10=3+7'], ['28', '28=5+23']],
        analysis: `### 解题思路

isPrime 封装判断逻辑后，主问题只需枚举 a，检查 \`isPrime(a) && isPrime(n-a)\`。函数让主思路只剩一句话，这正是抽象的威力。`,
        code: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; 1LL * i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

int main() {
    int n;
    cin >> n;
    for (int a = 2; a <= n / 2; a++) {
        if (isPrime(a) && isPrime(n - a)) {     // 两半都是质数
            cout << n << "=" << a << "+" << n - a << '\\n';
            break;                              // 找到一组即可
        }
    }
    return 0;
}`,
      },
      {
        title: '打印菜单（void 函数）',
        level: '入门',
        statement: `**题目描述**

写一个无返回值的函数 \`welcome(name)\` 打印欢迎横幅；主程序读入用户名后调用它。`,
        samples: [['Tom', `================
  Hello, Tom!
================`]],
        analysis: `### 解题思路

不需要返回任何结果、只负责输出的函数定义为 void。函数内可以正常使用循环。`,
        code: `#include <iostream>
#include <string>
using namespace std;

void welcome(string name) {       // void：只做事，不返回值
    cout << "================" << '\\n';
    cout << "  Hello, " << name << "!" << '\\n';
    cout << "================" << '\\n';
}

int main() {
    string name;
    cin >> name;
    welcome(name);                // 调用不写 return 接收
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**函数没声明就调用**：把函数放在 main 之后又没写原型，报 “not declared in this scope”。`,
      `**返回类型与 return 不符**：声明 int 却 return 小数会被截断；忘记 return 返回值不确定。`,
      `**形参实参数量/类型不匹配**：调用 add(3) 少参数、传 "abc" 给 int 都会编译报错。`,
      `**函数名与库函数冲突**：自定义函数叫 \`time\`、\`pow\` 可能撞名，起有辨识度的名字。`,
      `**在函数里只打印不返回**：主程序想拿结果继续算却拿不到。要结果用 return，打印只是副作用。`,
    ],
    exercises: [
      { title: '阶乘函数', level: '入门',
        statement: '写 long long fac(int n) 返回 n!，并输出 C(n,m)=n!/(m!(n-m)!)。',
        hint: '调三次 fac 相除相除；n≤20。' },
      { title: '幂函数', level: '基础',
        statement: '不用 pow，写 long long mypow(int a,int b) 返回 aᵇ。',
        hint: 'long long r=1; 循环 b 次 r*=a。' },
      { title: '回文数判定', level: '基础',
        statement: '写 bool isPalindrome(int n) 判断整数是否回文（121 是、-121 不是）。',
        hint: '用数位反转得到 rev，比较 rev==n；负数直接 false。' },
      { title: '距离函数', level: '基础',
        statement: '写 double dist(x1,y1,x2,y2) 返回两点欧氏距离，保留 3 位输出。',
        hint: 'sqrt((x1-x2)^2+(y1-y2)^2)，参数 double。' },
      { title: '素数表输出', level: '提高',
        statement: '利用 isPrime 输出 100~200 全部质数，每行 5 个。',
        hint: '外层枚举 x，函数判断，主函数控制每行计数换行。' },
    ],
    summary: `
- 函数 = 有名字的可复用代码块：\`返回类型 名字(形参){ ... return ...; }\`；
- 形参是占位盒子，实参调用时复制传入；void 函数无返回值；
- 被调用函数要写在 main 前面（或先写原型声明）；
- return 既交回结果也立即结束函数；一个函数做一件事，靠参数和返回值交流。
`,
  };

  T['func-params'] = {
    chapter: '第9章 函数',
    time: '约 35 分钟',
    body: `
## 一、值传递：函数改不动外面的变量（重点！）

默认情况下，实参只是把**值复制**给形参。函数内修改的是副本，外面的原变量纹丝不动：

\`\`\`cpp
#include <iostream>
using namespace std;
void badSwap(int a, int b) {
    int t = a; a = b; b = t;
}
int main() {
    int x = 1, y = 2;
    badSwap(x, y);
    cout << x << " " << y;      // 仍然是 1 2！没有交换
    return 0;
}
\`\`\`

内存里相当于新建了 a、b 两个盒子装着 1、2，交换的是新盒子。这是新手写函数最常见的困惑：“我明明改了，为什么没变？”

## 二、引用传递：给变量起个别名

在形参类型后加 \`&\`，形参成为实参的**引用（别名）**，函数内修改会直接作用于原变量：

\`\`\`cpp
#include <iostream>
using namespace std;
void goodSwap(int &a, int &b) {
    int t = a; a = b; b = t;
}
int main() {
    int x = 1, y = 2;
    goodSwap(x, y);
    cout << x << " " << y;      // 2 1，真的交换了
    return 0;
}
\`\`\`

### 什么时候用引用？

1. **需要函数“返回多个结果”**（return 只能带一个值）；
2. **避免复制大对象**（数组、大结构体、string，提高效率）；
3. 确实要在函数内修改外部变量。

\`\`\`cpp
// 一次求出总和与平均值：引用参数带出第二个结果
void calc(int a[], int n, long long &sum, double &avg) {
    sum = 0;
    for (int i = 0; i < n; i++) sum += a[i];
    avg = (double)sum / n;
}
\`\`\`

### const 引用：只读不复制

函数只读取大对象、不修改时，加 \`const\` 既避免复制又防止误改：

\`\`\`cpp
void print(const string &s) { cout << s; }
\`\`\`

## 三、数组作参数：天然是“引用”

数组传给函数时**不会复制整个数组**，函数内对元素的修改会影响原数组（传递的是首地址）：

\`\`\`cpp
void fillZero(int a[], int n) {
    for (int i = 0; i < n; i++) a[i] = 0;   // 改的就是原数组
}
\`\`\`

注意：函数内 \`sizeof(a)\` 得不到数组大小（退化成指针），所以**数组参数总要额外传长度 n**。二维数组要写明列数：\`void f(int a[][105], int n, int m)\`。

## 四、默认参数与函数重载（了解）

\`\`\`cpp
int range(int start, int end, int step = 1);  // 默认参数：调用时可省略 step
int add(int a, int b);
double add(double a, double b);               // 函数重载：同名不同参数类型
\`\`\`

竞赛中偶尔用，知道“同名函数按参数类型区分”即可。

## 五、作用域：变量的“有效范围”

- **局部变量**：定义在函数/代码块内部，只在该块内有效，函数结束即销毁；
- **全局变量**：定义在所有函数外面，整个文件的函数都能直接用，程序运行期间一直存在，**自动初始化为 0**；
- 不同函数里可以同名互不干扰；内层名字会**遮蔽（shadow）**外层同名变量。

\`\`\`cpp
#include <iostream>
using namespace std;
int gx;                  // 全局变量，初始值为 0
void f() {
    int x = 1;           // f 的局部 x
    cout << gx;          // 可以访问全局
}
int main() {
    int x = 2;           // main 的局部 x，与 f 的 x 无关
    cout << x;
    return 0;
}
\`\`\`

### 竞赛中的使用建议

- 大数组（10⁵ 以上）**必须开全局**（局部栈空间小），这也是全局变量的正当用途；
- 循环计数器、临时变量坚持局部化；
- DFS/BFS 中把图、答案等开成全局能减少长长的参数列表，但要清楚哪些是全局共享状态。
`,
    examples: [
      {
        title: '一次返回多个统计结果',
        level: '基础',
        statement: `**题目描述**

输入 n 个整数，用一个函数同时求出最大值、最小值、平均值，主程序输出。`,
        samples: [['5\n2 8 3 9 4', '9 2 5.20']],
        analysis: `### 解题思路

return 只能带一个值，用两个引用参数带出最大、最小，平均值作为返回值。调用时传进去的变量会被函数直接改写。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

// mx、mn 是引用参数，函数内修改直接影响调用处
double analyze(int n, int &mx, int &mn) {
    int x;
    cin >> x;
    mx = mn = x;
    long long sum = x;
    for (int i = 2; i <= n; i++) {
        cin >> x;
        sum += x;
        if (x > mx) mx = x;
        if (x < mn) mn = x;
    }
    return (double)sum / n;
}

int main() {
    int n, mx, mn;
    cin >> n;
    double avg = analyze(n, mx, mn);   // mx、mn 被函数填充
    cout << mx << " " << mn << " "
         << fixed << setprecision(2) << avg << '\\n';
    return 0;
}`,
      },
      {
        title: '数组原地排序选择（函数修改数组）',
        level: '基础',
        statement: `**题目描述**

写函数对传入的数组做选择排序（升序），主程序读入、调用、输出。体会“数组参数修改的就是原数组”。`,
        samples: [['5\n3 1 4 1 5', '1 1 3 4 5']],
        analysis: `### 解题思路

选择排序：每一轮在未排序区间找最小值，与区间首元素交换。数组传参无需 & 就能改原数组（传的是地址），但长度 n 必须单独传。`,
        code: `#include <iostream>
using namespace std;

void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minPos = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minPos]) minPos = j;   // 找更小者的位置
        }
        swap(a[i], a[minPos]);                  // 交换到已排序区末尾
    }
}

int main() {
    int n, a[1005];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    selectionSort(a, n);

    for (int i = 0; i < n; i++)
        cout << a[i] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}`,
      },
      {
        title: '全局计数器：统计函数被调用次数',
        level: '提高',
        statement: `**题目描述**

读入若干整数（0 结束），用全局变量统计 isPrime 函数一共被调用了多少次，输出其中质数个数与调用次数。`,
        samples: [['2 4 5 7 0', '3 4']],
        analysis: `### 解题思路

全局变量在所有函数外定义，自动清零，且在函数调用之间保持值。利用它可以跨调用累计次数。

> 注意：全局变量方便但耦合强，业务数据优先用参数传递；大数组和搜索状态是开全局的常见正当场景。`,
        code: `#include <iostream>
using namespace std;

int callCnt = 0;               // 全局计数器

bool isPrime(int n) {
    callCnt++;                 // 每调用一次 +1
    if (n < 2) return false;
    for (int i = 2; 1LL * i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

int main() {
    int x, primeCnt = 0;
    while (cin >> x && x != 0) {
        if (isPrime(x)) primeCnt++;
    }
    cout << primeCnt << " " << callCnt << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**想在函数里交换/修改却用值传递**：函数结束什么都没变。要修改外部变量必须用引用 &。`,
      `**引用参数误传字面量**：非 const 引用形参要传变量（有内存可改），不能传 3、a+b 这类临时值。`,
      `**数组参数里用 sizeof 求长度**：退化成指针，sizeof 得到指针大小。长度永远显式传 n。`,
      `**全局变量忘了在多组数据间重置**：全局只在程序启动清零一次，每题/每组开始要手动复位。`,
      `**变量遮蔽**：函数内局部变量与全局同名，函数内用的是局部的那个，排查时容易看漏。`,
    ],
    exercises: [
      { title: '引用交换三个数', level: '入门',
        statement: '写 void swap3(int &a,int &b,int &c)，把三个数循环左移（a→b,b→c,c→a 的值轮换）并在主程序验证。',
        hint: '用 t 备份 a 的原值，按顺序赋值。' },
      { title: '分解质因数函数', level: '提高',
        statement: '写函数输出 n 的质因数分解式（如 60=2*2*3*5），不返回值。',
        hint: 'for d=2; d*d<=n; while(n%d==0) 输出并 n/=d，最后剩 >1 也是质因子。' },
      { title: '数组统计函数', level: '基础',
        statement: '一个函数同时返回数组中正数、负数、零的个数（用三个引用参数）。',
        hint: 'void stat(a[],n,int &pos,int &neg,int &zero)。' },
      { title: '递归前的迭代 gcd', level: '基础',
        statement: '把辗转相除封装成 long long gcd(long long a,long long b)。',
        hint: 'while(b){r=a%b;a=b;b=r;} return a。' },
    ],
    summary: `
- 默认是**值传递**：函数操作副本，改不动外部变量；
- **引用传递 \`&\`** 让形参成为实参别名，可修改原值、可一次带出多个结果、避免复制大对象；只读大对象用 \`const &\`；
- 数组传参退化为首地址，函数内修改即修改原数组，长度必须单独传；
- 局部变量块内有效、全局变量全文件可见且自动清零；大数组与搜索状态开全局，业务数据优先走参数。
`,
  };

  T['func-recursion'] = {
    chapter: '第9章 函数',
    time: '约 40 分钟',
    body: `
## 一、递归：函数自己调用自己

递归就是把大问题化为**规模更小的同类问题**：

\`\`\`text
要解决 n 的问题 ──► 先解决 n-1 的问题 ──► …… ──► 最小问题直接有答案
\`\`\`

\`\`\`cpp
long long fac(int n) {
    if (n <= 1) return 1;      // ① 递归边界（出口）
    return n * fac(n - 1);    // ② 递归式：向边界靠近
}
// fac(4) = 4*fac(3) = 4*3*fac(2) = 4*3*2*fac(1) = 4*3*2*1
\`\`\`

## 二、递归三要素（写递归前先回答）

1. **函数定义**：\`f(n)\` 到底表示什么？（一句话说清）
2. **递归边界**：最小的、能直接给答案的情况是什么？
3. **递归关系**：怎么从更小的问题答案组合出当前答案？

三要素缺一，递归要么错要么停不下来。

## 三、调用栈：递归在内存中发生了什么

每次函数调用，系统把当前参数、返回位置压入**栈**；返回时弹出。

\`\`\`text
fac(4) 暂停，等 fac(3)
  fac(3) 暂停，等 fac(2)
    fac(2) 暂停，等 fac(1)
      fac(1) = 1            ← 触底
    返回 1*2 = 2
  返回 2*3 = 6
返回 6*4 = 24
\`\`\`

> **⚠️ 栈有深度限制**：递归太深（如几十万层）会**栈溢出**崩溃（通常 10⁵ 量级以上就要警惕）。每次调用都有开销，简单线性问题用循环更快。

## 四、经典模型

### 斐波那契：朴素递归的陷阱

\`\`\`cpp
int fib(int n) {
    if (n <= 2) return 1;
    return fib(n-1) + fib(n-2);
}
\`\`\`

能写但**极慢**：fib(40) 已经卡顿——它把同样的子问题重复计算了指数次。修正方法：

- 用循环：\`a=1,b=1,c=a+b\` 滚动；
- 或用“记忆化”（提高篇 DP 详讲）。

### 汉诺塔：递归的优雅

把 n 个圆盘从 A 经 B 移到 C：

1. 把上面 n−1 个从 A 移到 B（借助 C）；
2. 第 n 个从 A 移到 C；
3. 再把 n−1 个从 B 移到 C（借助 A）。

\`\`\`cpp
void hanoi(int n, char from, char via, char to) {
    if (n == 0) return;
    hanoi(n - 1, from, to, via);
    cout << from << "->" << to << '\\n';
    hanoi(n - 1, via, from, to);
}
\`\`\`

只需几行代码，输出 2^n-1 步。人类难以直接展开的过程，递归轻松描述。

## 五、递归与循环如何选择？

| 场景 | 倾向 |
| --- | --- |
| 线性累加、阶乘、斐波那契 | 循环更安全高效 |
| 具有“树状展开”结构（汉诺塔、分治、排列组合、迷宫、图搜索） | 递归自然 |
| 题目定义本身递归（树、表达式、gcd） | 递归 |

递归是**搜索、分治、树形 DP、表达式处理**的语言基础，普及篇 DFS 将把它用到极致。
`,
    examples: [
      {
        title: '递归求 1+2+…+n',
        level: '入门',
        statement: `**题目描述**

用递归（不准用循环）求前 n 个正整数之和。`,
        samples: [['100', '5050']],
        analysis: `### 递归设计

- 定义：sum(n) = 1~n 的和；
- 边界：sum(1)=1；
- 关系：sum(n)=n+sum(n−1)。

在纸上模拟 n=3 的展开与回溯，确认“先递推到边界、再逐层返回”的过程。`,
        code: `#include <iostream>
using namespace std;

long long sum(int n) {
    if (n == 1) return 1;        // 边界
    return n + sum(n - 1);       // n 的答案 = n + (1~n-1 的和)
}

int main() {
    int n;
    cin >> n;
    cout << sum(n) << '\\n';
    return 0;
}`,
      },
      {
        title: '递归数位处理',
        level: '基础',
        statement: `**题目描述**

用递归输出一个正整数的每一位数字，从高到低，空格分隔。如输入 365，输出 \`3 6 5\`。`,
        samples: [['365', '3 6 5']],
        analysis: `### 递归设计

- n≥10 时，先递归打印 n/10（高位部分），**回来后**再打印 n%10（当前个位）；
- 顺序很关键：输出语句放在递归调用之后，实现“回溯时输出”，自动得到从高到低的顺序。`,
        code: `#include <iostream>
using namespace std;

void printDigits(int n) {
    if (n >= 10) printDigits(n / 10);  // 先处理高位
    cout << n % 10 << " ";             // 回来后打印当前最低位
}

int main() {
    int n;
    cin >> n;
    printDigits(n);
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '汉诺塔步骤计数',
        level: '提高',
        statement: `**题目描述**

经典三根柱汉诺塔，输入盘数 n（n≤20），输出最少移动次数；若 n≤10，再输出完整移动步骤。`,
        samples: [['3', `A->C
A->B
C->B
A->C
B->A
B->C
A->C
7`]],
        analysis: `### 解题思路

三步递归直接描述移动过程；总次数是 2^n-1，用 \`(1LL<<n)-1\` 计算（n≤62 安全），不要真去数 cout 行数。`,
        code: `#include <iostream>
using namespace std;

long long steps = 0;

void hanoi(int n, char from, char via, char to) {
    if (n == 0) return;
    hanoi(n - 1, from, to, via);     // 上 n-1 个移到辅助柱
    if (n <= 10) cout << from << "->" << to << '\\n';
    steps++;
    hanoi(n - 1, via, from, to);     // 再移到目标柱
}

int main() {
    int n;
    cin >> n;
    hanoi(n, 'A', 'B', 'C');
    cout << (1LL << n) - 1 << '\\n'; // 理论步数，与 steps 相同
    return 0;
}`,
      },
      {
        title: '递归版二分查找',
        level: '提高',
        statement: `**题目描述**

在升序数组中用递归实现二分查找：找到输出下标，找不到输出 -1。`,
        samples: [['5\n1 3 5 7 9\n7', '3']],
        analysis: `### 递归设计

\`search(l,r,x)\` 在区间 [l,r] 找 x：

- 边界：l>r 找不到，返回 −1；
- 中点命中返回 mid；
- 否则只递归左半或右半（区间每次减半，这就是分治思想）。`,
        code: `#include <iostream>
using namespace std;

int a[100005];

int binarySearch(int l, int r, int x) {
    if (l > r) return -1;                  // 空区间：找不到
    int mid = l + (r - l) / 2;             // 防溢出写法
    if (a[mid] == x) return mid;
    if (x < a[mid]) return binarySearch(l, mid - 1, x);
    return binarySearch(mid + 1, r, x);
}

int main() {
    int n, x;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> x;
    cout << binarySearch(0, n - 1, x) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**没有递归边界**或边界永远到不了 → 无限递归，栈溢出崩溃。`,
      `**递归规模没有变小**：f(n) 又调 f(n) 而不是 f(n−1)。`,
      `**朴素递归求斐波那契**：指数级重复计算，改用循环或记忆化。`,
      `**递归太深**：10⁵ 层以上可能爆栈，改迭代或显式栈。`,
      `**输出/处理顺序写反**：数位、链表逆序等题，操作放在递归调用之前还是之后，结果方向相反，先画图再写。`,
    ],
    exercises: [
      { title: '递归幂', level: '基础',
        statement: '用递归写 pow(a,b)=aᵇ（b 为非负整数）。',
        hint: 'b==0 返回 1；否则 a*pow(a,b-1)。' },
      { title: '递归最大公约数', level: '基础',
        statement: '用递归写 gcd(a,b)。',
        hint: 'b==0 返回 a，否则 gcd(b,a%b)。' },
      { title: '递归倒序字符串', level: '基础',
        statement: '输入字符串，用递归倒序输出。',
        hint: 'if(s[i]){f(i+1); cout<<s[i];}' },
      { title: '青蛙跳台阶', level: '提高',
        statement: 'n 级台阶，每次跳 1 或 2 级，递归求方案数（先用递归定义理解，n≤45 时观察速度问题并改循环）。',
        hint: 'f(n)=f(n-1)+f(n-2)，f(1)=1,f(2)=2；大 n 用递推。' },
      { title: '全排列（选做，DFS 预告）', level: '挑战',
        statement: '输入 n（n≤8），递归输出 1~n 的所有排列。',
        hint: '维护 used[] 与当前路径 path[]，每个位置尝试没用过的数，选满 n 个输出。' },
    ],
    summary: `
- 递归 = 函数调用自身，用更小的同类问题逼近答案；
- 三要素：**定义、边界（出口）、递推关系**，规模必须向边界收敛；
- 调用靠栈保存现场，过深会栈溢出；朴素斐波那契存在指数级重复计算；
- 线性任务用循环，树状展开（汉诺塔、分治、排列组合、搜索、树）用递归——普及篇 DFS 的核心基础。
`,
  };

  Object.assign(window.TOPICS, T);
})();
