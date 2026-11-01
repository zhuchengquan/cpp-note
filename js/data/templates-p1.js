/* ============================================================
   核心模板速记 · 第一部分（入门篇）
   结构：TEMPLATES[知识点id] = [{ title, note?, code }]
   code 为 Markdown 代码围栏，全部是可直接编译运行的完整 C++17 程序。
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  /* ================= 第1章 初识 C++ ================= */
  'intro-structure': [
    {
      title: '最小程序骨架（Hello World）',
      note: '每个 C++ 程序都从 main 函数开始；一条语句以分号结束。这是所有程序的起点。',
      code:
`\`\`\`cpp
#include <iostream>          // 输入输出库
using namespace std;         // 使用标准命名空间，否则要写 std::cout

int main() {                 // 程序入口，有且只有一个
    cout << "Hello World!" << endl;
    return 0;                // 返回 0 告诉系统程序正常结束
}
\`\`\``,
    },
  ],

  /* ================= 第4章 输入输出 ================= */
  'io-cin-cout': [
    {
      title: '读入多组数据并输出',
      note: '竞赛最常见的输入模式：先给个数 n，再给 n 个数据；边读边处理，不必全部存下来。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;                       // 数据个数
    long long sum = 0;              // 累加和习惯用 long long 防爆
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        sum += x;
    }
    cout << sum << endl;
    return 0;
}
\`\`\``,
    },
    {
      title: '格式化输出：小数位数与对齐',
      note: 'fixed + setprecision(n) 固定 n 位小数；setw(n) 设置下一项的输出宽度。',
      code:
`\`\`\`cpp
#include <iostream>
#include <iomanip>            // setprecision / setw 都在这里
using namespace std;

int main() {
    double pi = 3.14159265;
    cout << fixed << setprecision(2) << pi << endl;   // 3.14

    cout << setw(6) << 12 << endl;    // "    12"，占 6 格右对齐
    cout << setw(6) << 345 << endl;   // "   345"
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第5章 分支结构 ================= */
  'flow-if': [
    {
      title: '闰年判断',
      note: '能被 4 整除且不能被 100 整除，或者能被 400 整除。注意 && 与 || 的搭配。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int year;
    cin >> year;
    bool leap = (year % 4 == 0 && year % 100 != 0)
             || (year % 400 == 0);
    cout << (leap ? "yes" : "no") << endl;
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第6章 循环结构 ================= */
  'loop-for': [
    {
      title: '累加器与计数器',
      note: '累加器初值 0，每次 sum += x；计数器只在满足条件时 cnt++。循环前必须清零。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;
    long long sum = 0;          // 累加器
    int cnt = 0;                // 计数器：统计偶数个数
    for (int i = 1; i <= n; i++) {
        sum += i;
        if (i % 2 == 0) cnt++;
    }
    cout << "1~" << n << " 的和：" << sum << endl;
    cout << "其中偶数 " << cnt << " 个" << endl;
    return 0;
}
\`\`\``,
    },
  ],

  'loop-while': [
    {
      title: '数位拆分（while 经典）',
      note: 'x % 10 取个位，x /= 10 去掉个位，直到 x 变成 0。位数未知时用 while 最自然。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    long long x;
    cin >> x;
    int digitSum = 0, digitCnt = 0;
    while (x > 0) {
        int d = x % 10;         // 取出个位
        digitSum += d;
        digitCnt++;
        x /= 10;                // 去掉个位
    }
    cout << "位数：" << digitCnt << "，数位和：" << digitSum << endl;
    return 0;
}
\`\`\``,
    },
  ],

  'loop-nested': [
    {
      title: '嵌套循环打印图形',
      note: '外层控制行、内层控制列；第 i 行星号数与 i 的关系是关键。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;                 // 打印 n 行的三角形
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) // 第 i 行有 i 个星号
            cout << '*';
        cout << endl;
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第7章 数组 ================= */
  'arr-1d': [
    {
      title: '打擂台求最大值及其下标',
      note: '先假设第一个是"擂主"，后面逐个挑战；打平不更新，下标自然是第一次出现的位置。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;
    int a[1005];
    for (int i = 0; i < n; i++) cin >> a[i];

    int maxVal = a[0], maxPos = 0;
    for (int i = 1; i < n; i++)
        if (a[i] > maxVal) {         // 严格大于：保留第一次出现的位置
            maxVal = a[i];
            maxPos = i;
        }
    cout << "最大值 " << maxVal << "，下标 " << maxPos << endl;
    return 0;
}
\`\`\``,
    },
    {
      title: '桶计数：统计每个数出现次数',
      note: '数据本身当下标：读入 x 就让 cnt[x]++；之后可以 O(1) 查询频次、按值有序输出。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int cnt[1000005];          // 全局大数组，自动初始化为 0

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        cnt[x]++;                       // x 号桶 +1
    }
    int q; cin >> q;                    // q 次询问
    while (q--) {
        int x; cin >> x;
        cout << x << " 出现了 " << cnt[x] << " 次\\n";
    }
    return 0;
}
\`\`\``,
    },
  ],

  'arr-2d': [
    {
      title: '二维数组：矩阵读入与每行求和',
      note: '两层循环按"先行后列"读入；求每行之和时在行循环内把累加器清零。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int a[105][105];

int main() {
    int n, m; cin >> n >> m;           // n 行 m 列
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            cin >> a[i][j];

    for (int i = 0; i < n; i++) {
        int rowSum = 0;                // 每行开始前清零
        for (int j = 0; j < m; j++) rowSum += a[i][j];
        cout << "第 " << i + 1 << " 行之和：" << rowSum << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第8章 字符串 ================= */
  'str-cstr': [
    {
      title: '字符统计与大小写转换',
      note: '字符本质是 ASCII 整数：a~z 与 a~z 连续，差 32 就是大小写互换。',
      code:
`\`\`\`cpp
#include <iostream>
#include <cstring>
using namespace std;

int main() {
    char s[1005];
    cin >> s;                          // 读到空白为止
    int upper = 0, lower = 0, digit = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c >= 'A' && c <= 'Z') upper++;
        else if (c >= 'a' && c <= 'z') lower++;
        else if (c >= '0' && c <= '9') digit++;
    }
    cout << "大写 " << upper << " 小写 " << lower << " 数字 " << digit << '\\n';

    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] >= 'a' && s[i] <= 'z') s[i] -= 32;   // 小写转大写
    }
    cout << s << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'str-string': [
    {
      title: 'string 常用操作速记',
      note: '长度 size()、拼接 +、取子串 substr、查找 find（找不到返回 string::npos）。',
      code:
`\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string a = "Hello", b = "World";
    string s = a + " " + b;            // 拼接
    cout << s << '\\n';
    cout << "长度 " << s.size() << '\\n';

    for (char c : s) cout << c << ' '; // 逐字符遍历
    cout << '\\n';

    cout << s.substr(0, 5) << '\\n';   // 从 0 开始取 5 个字符
    size_t pos = s.find("World");      // 查找子串
    if (pos != string::npos)
        cout << "World 出现在下标 " << pos << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第9章 函数 ================= */
  'func-basic': [
    {
      title: '函数定义与调用骨架',
      note: '返回类型 + 函数名 + 参数列表；先定义后使用（或提前声明），return 把结果送回调用处。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int max3(int a, int b, int c) {        // 求三个数的最大值
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}

int main() {
    int x, y, z;
    cin >> x >> y >> z;
    cout << max3(x, y, z) << endl;     // 调用函数
    return 0;
}
\`\`\``,
    },
  ],

  'func-params': [
    {
      title: '引用传参：在函数内修改实参',
      note: '参数前加 & 就是引用，函数里交换的是变量本身；值传递交换的只是副本，外面不变。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void swap2(int &a, int &b) {           // 注意两个 &
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x, y;
    cin >> x >> y;
    swap2(x, y);
    cout << x << ' ' << y << endl;     // 已经交换
    return 0;
}
\`\`\``,
    },
  ],

  'func-recursion': [
    {
      title: '递归三要素：阶乘',
      note: '递归边界（n≤1 时直接返回）+ 递归公式（n!=n·(n−1)!）+ 相信子问题能算对。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n <= 1) return 1;              // ① 递归边界
    return 1LL * n * factorial(n - 1); // ② 递归公式
}

int main() {
    int n; cin >> n;                   // n ≤ 20，再大就溢出
    cout << factorial(n) << endl;
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第10章 结构体与 STL ================= */
  'struct-basic': [
    {
      title: '结构体定义与排序',
      note: '把一个事物的多个属性打包成一个类型；写比较函数后可直接用 sort 排序。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

bool cmp(const Student &a, const Student &b) {
    return a.score > b.score;          // 分数从高到低
}

int main() {
    int n; cin >> n;
    Student stu[105];
    for (int i = 0; i < n; i++) cin >> stu[i].name >> stu[i].score;
    sort(stu, stu + n, cmp);
    for (int i = 0; i < n; i++)
        cout << stu[i].name << ' ' << stu[i].score << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'stl-basic': [
    {
      title: 'sort 排序三件套',
      note: '升序 sort(a,a+n)、降序 greater<int>()、自定义 cmp。排序区间是 [起点, 终点)。',
      code:
`\`\`\`cpp
#include <iostream>
#include <algorithm>
#include <functional>
using namespace std;

int main() {
    int n; cin >> n;
    int a[1005];
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a, a + n);                       // 默认升序
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    cout << '\\n';

    sort(a, a + n, greater<int>());       // 降序
    for (int i = 0; i < n; i++) cout << a[i] << ' ';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第12章 文件操作 ================= */
  'file-io': [
    {
      title: '复赛 freopen 提交骨架',
      note: '复赛要求读写同名 .in/.out 文件：在 main 最开头加两行 freopen。在线 OJ 练习时把这两行注释掉。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    // 提交复赛时取消下面两行注释，文件名与题目一致（如 candy）：
    // freopen("candy.in", "r", stdin);
    // freopen("candy.out", "w", stdout);

    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第2章 整数范围与溢出 ================= */
  'type-int': [
    {
      title: '整数范围与 long long 防溢出',
      note: 'int 最大约 21 亿，超了会"绕回"负数；大数相加/相乘前就要用 LL 字面量（1LL、xLL）把运算提升到 long long。',
      code:
`\`\`\`cpp
#include <iostream>
#include <climits>                 // INT_MAX / LLONG_MAX
using namespace std;

int main() {
    cout << "int 最大约 " << INT_MAX << '\\n';
    cout << "long long 最大约 " << LLONG_MAX << '\\n';

    int x = 2000000000, y = 2000000000;
    cout << x + y << '\\n';            // 溢出！40 亿装不进 int，得到 -294967296
    cout << 2000000000LL + 2000000000 << '\\n';  // 字面量带 LL：正确得 4000000000
    cout << 1LL * 100000 * 100000 << '\\n';       // 相乘前用 1LL 引导：10000000000
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 位运算常用操作 ================= */
  'op-logic': [
    {
      title: '位运算速记：取位 / 置位 / lowbit',
      note: '& 取位、| 置1、^ 翻转、<< >> 移位，x&-x 取最低位的1（lowbit）。提高篇状态压缩、树状数组都要用到。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int x = 0b10110;              // 22
    cout << (x & 1) << '\\n';          // 取最低位（判奇偶）：0
    cout << (x | 1) << '\\n';          // 最低位置 1：23
    cout << (x ^ 1) << '\\n';          // 最低位翻转：23
    cout << (x << 1) << '\\n';         // 左移一位 = ×2：44
    cout << (x >> 1) << '\\n';         // 右移一位 = 整除 2：11
    cout << ((x >> 2) & 1) << '\\n';   // 取从 0 起第 2 位：1
    cout << (x & -x) << '\\n';         // lowbit，最低位 1 的值：2
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第4章 scanf / printf ================= */
  'io-printf-scanf': [
    {
      title: 'scanf / printf 混合读写多类型',
      note: 'scanf 用地址（&），占位符 %d/%c/%lf；printf 可用 %05d 补零、%.1f 控制小数。',
      code:
`\`\`\`cpp
#include <cstdio>

int main() {
    int id; char grade; double height;
    scanf("%d %c %lf", &id, &grade, &height);
    printf("编号:%05d 等级:%c 身高:%.1f\\n", id, grade, height);
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第5章 switch 分支 ================= */
  'flow-switch': [
    {
      title: 'switch 成绩分档（含穿透）',
      note: 'score/10 把分数压缩成几档；case 10 与 9 共用一段是有意的"穿透"，每档末尾记得 break。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int score; cin >> score;
    switch (score / 10) {
        case 10:
        case 9:  cout << 'A'; break;   // 90 分及以上
        case 8:  cout << 'B'; break;   // 80~89
        case 7:  cout << 'C'; break;   // 70~79
        case 6:  cout << 'D'; break;   // 60~69
        default: cout << 'E';          // 60 以下不合格
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第1章 第一个交互程序 ================= */
  'intro-env': [
    {
      title: '第一个会"对话"的程序',
      note: 'Dev-C++ 流程：新建源代码 → 保存为英文路径（如 D:/code/hello.cpp）→ F11 编译运行。程序用 cin 向你提问、读取回答。',
      code:
`\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;
    cout << "你叫什么名字？";
    cin >> name;                       // 程序暂停，等你输入一个词
    cout << "你几岁了？";
    cin >> age;
    cout << "你好，" << name << "！"
         << age << " 岁正是学编程的好时光。\\n";
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第2章 变量与常量 ================= */
  'var-const': [
    {
      title: '变量、初始化与 const 常量',
      note: '变量三要素：类型 + 名字 + 值；局部变量不初始化就是垃圾值。const 常量必须初始化、不能再改，适合写 PI、数组上限。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    const double PI = 3.1415926535;  // 常量：初始化后不可修改
    int age;                         // 只声明：里面是垃圾值
    age = 12;                        // 再赋值
    double score = 95.5;             // 声明时初始化（推荐写法）

    double r;
    cout << "请输入圆的半径：";
    cin >> r;
    cout << "周长 = " << 2 * PI * r << '\\n';
    cout << "面积 = " << PI * r * r << '\\n';

    int a = 1, b = 2, c = 3;         // 一条语句声明多个变量
    cout << "年龄 " << age << " 岁，成绩 " << score << '\\n';
    cout << a + b + c << '\\n';
    cout << "int 占 " << sizeof(int)
         << " 字节，double 占 " << sizeof(double) << " 字节\\n";
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第2章 浮点/字符/布尔 ================= */
  'type-other': [
    {
      title: 'double / char / bool 用法演示',
      note: '浮点有误差要用 EPS 判等；字符本质是 ASCII 整数可做加减；bool 输出 0/1，加 boolalpha 输出 true/false。',
      code:
`\`\`\`cpp
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const double EPS = 1e-9;

    // ① 浮点：0.1+0.2 不能直接 == 判等
    double a = 0.1 + 0.2;
    cout << "0.1+0.2 = " << a << '\\n';
    cout << "直接判等：" << (a == 0.3) << '\\n';        // 0
    cout << "EPS 判等：" << (fabs(a - 0.3) < EPS)     // 1
         << '\\n';
    cout << "5/2 = " << 5 / 2 << "，5.0/2 = " << 5.0 / 2
         << '\\n';

    // ② 字符：ASCII 整数运算
    char digit = '7';
    int x = digit - '0';               // 字符数字 → 整数：7
    char back = char(x + '0');         // 整数 → 字符数字：'7'
    cout << digit << ' ' << x << ' ' << back << '\\n';

    char lower = 'd';
    char upper = char(lower - 'a' + 'A');  // 小写转大写
    cout << lower << " → " << upper << '\\n';

    // ③ 布尔
    bool ok = (x >= 0 && x <= 9);
    cout << boolalpha << ok << ' ' << !ok << '\\n';  // true false
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 算术运算符 ================= */
  'op-arithmetic': [
    {
      title: '整除、取余、复合赋值与自增',
      note: '/ 对整数截断、% 取余；复合赋值是先算后存；i++ 先用后加，++i 先加后用。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;                    // 例如输入 17 5
    cout << "商 " << a / b << "，余数 " << a % b << '\\n';
    cout << "能否整除：" << (a % b == 0) << '\\n';

    int n = 365;                      // 数位拆分：% 取位、/ 砍位
    cout << n % 10 << ' ' << n / 10 % 10 << ' '
         << n / 100 << '\\n';          // 5 6 3

    int score = 80;                   // 复合赋值
    score += 10;                      // 90
    score %= 100;
    cout << score << '\\n';

    int i = 5, x, y;                  // 前置 vs 后置自增
    x = i++;                          // 先用旧值：x=5，i 变 6
    y = ++i;                          // 先加：i 变 7，y=7
    cout << "x=" << x << " y=" << y << " i=" << i << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第11章 指针与引用 ================= */
  'pointer-ref': [
    {
      title: '指针版与引用版交换 + 指针遍历数组',
      note: '指针传地址、函数内用 *p 访问；引用是别名，用法和普通变量一样；数组名就是首元素地址。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void swapByPtr(int *a, int *b) {       // 指针版：传地址
    int t = *a;
    *a = *b;
    *b = t;
}

void swapByRef(int &a, int &b) {       // 引用版：传别名
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 3, y = 8;
    swapByPtr(&x, &y);                 // 取地址传入
    cout << x << ' ' << y << '\\n';    // 8 3

    swapByRef(x, y);                   // 引用：直接传变量
    cout << x << ' ' << y << '\\n';    // 3 8

    int a[5] = {10, 20, 30, 40, 50};
    int *p = a;                        // p 指向首元素
    while (p < a + 5) {
        cout << *p << ' ';
        p++;                           // 指针移动到下一元素
    }
    cout << '\\n';

    p = nullptr;                       // 空指针：解引用前必须判空
    if (p != nullptr) cout << *p;
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第12章 打印调试法 ================= */
  'debug-guide': [
    {
      title: 'cerr 打印调试模板',
      note: '在关键位置用 cerr 打印：① 输入是否读对 ② 每轮关键变量 ③ 走进了哪个分支。cerr 走错误流，freopen 重定向 stdout 时仍显示。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

int a[1005];

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    cerr << "[调试] 读入完成：n=" << n << '\\n';

    int mx = a[0], pos = 0;
    for (int i = 1; i < n; i++) {
        cerr << "[调试] 第 " << i << " 轮：a[i]=" << a[i]
             << " 当前擂主=" << mx << '\\n';
        if (a[i] > mx) {
            cerr << "[调试] 走到更新分支\\n";
            mx = a[i];
            pos = i;
        }
    }
    cout << "最大值 " << mx << "，下标 " << pos << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
