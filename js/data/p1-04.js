/* ============================================================
   第一部分 · 第4章 输入输出与顺序结构
   io-cin-cout / io-printf-scanf
   ============================================================ */
(function () {
  const T = {};

  T['io-cin-cout'] = {
    chapter: '第4章 输入输出与顺序结构',
    time: '约 30 分钟',
    body: `
## 一、输出 cout

\`cout\`（console output）配合插入运算符 \`<<\`，可以连续输出任意类型：

\`\`\`cpp
int age = 13;
double h = 1.65;
cout << "我今年" << age << "岁，身高" << h << "米" << '\\n';
// 我今年13岁，身高1.65米
\`\`\`

- 字符串要加双引号，变量直接写名字；
- 换行用 \`'\\n'\` 或 \`endl\`；
- \`cout\` 很聪明，int、double、char 会自动选择输出形式。

### 默认格式的几个坑

\`\`\`cpp
cout << 5.0 << '\\n';       // 输出 5（默认不显示无意义的 .0）
cout << 1.0 / 3 << '\\n';   // 默认只保留 6 位有效数字：0.333333
cout << (double)10000000000; // 大数可能变科学计数法 1e+10
\`\`\`

需要精确控制格式时，使用 \`<iomanip>\`：

| 控制符 | 作用 |
| --- | --- |
| \`fixed\` | 固定小数形式（不用科学计数法） |
| \`setprecision(n)\` | 配合 fixed：保留 n 位小数 |
| \`setw(n)\` | **只对下一项**设置输出宽度（右补空格） |
| \`setfill(c)\` | 配合 setw：用 c 填充空位 |
| \`left / right\` | 对齐方式 |

\`\`\`cpp
#include <iomanip>
double pi = 3.14159265358;
cout << fixed << setprecision(2) << pi << '\\n';   // 3.14
cout << setw(6) << 12 << '\\n';                     // "    12"，占 6 格右对齐
cout << setfill('0') << setw(6) << 12 << '\\n';     // 000012
\`\`\`

> **⚠️ 注意：** \`fixed\` 和 \`setprecision\` 一旦设置会**持续生效**；\`setw\` 只对紧跟的一项生效。输出整数位数补齐（如日期 09:05）就靠 setw+setfill('0')。

## 二、输入 cin

\`cin\` 配合提取运算符 \`>>\`：

\`\`\`cpp
int a, b;
cin >> a >> b;          // 输入 3 8 或 3回车8 都可以
double x; char c;
cin >> x >> c;          // 自动按类型解析，跳过空格、Tab、换行
\`\`\`

关键性质：**\`>>\` 自动跳过任意空白字符**，所以“空格分隔”和“每行一个数”对 cin 来说没有区别，循环读入时极其方便。

\`\`\`cpp
int x, sum = 0;
for (int i = 0; i < 5; i++) {
    cin >> x;           // 无论 5 个数在一行还是多行
    sum += x;
}
\`\`\`

### 读入带空格的一整行：getline

\`cin >> s\` 遇到空格就停。要读取一整句话（包含空格）：

\`\`\`cpp
string name;
getline(cin, name);     // 读取一整行到 name（不含行末换行符）
\`\`\`

> **❗ getline 经典踩坑：** 在 \`cin >> n\` 之后直接 getline，会读到残留的换行符（空行）。
> 解决：中间加一句 \`cin.ignore();\` 吞掉回车，第8章会专门练习。

### 字符逐个读（不用预知数量）

\`\`\`cpp
char c;
while (cin >> c) { ... }          // 读到文件结束（EOF）为止
\`\`\`

## 三、加速输入输出（数据量大时必加）

当数据达到 10^5、10^6 级别，默认 cin/cout 为了兼容 C 而偏慢。在 main 开头加两行：

\`\`\`cpp
ios::sync_with_stdio(false);   // 解除与 C 标准 IO 的同步
cin.tie(nullptr);              // 解除 cin 与 cout 的绑定
\`\`\`

加上之后 cin 速度与 scanf 相当。**规矩：加了这两句就不要再混用 scanf/printf 和 cin/cout。**

## 四、顺序结构程序设计

到目前为止，程序都是“**从上往下、一句一句执行**”的顺序结构。做一道题的标准套路：

1. **定义变量**（想清楚类型，int 还是 long long、double）；
2. **输入**数据；
3. **计算**处理；
4. **输出**结果。

\`\`\`text
[开始] → 输入 → 处理 → 输出 → [结束]
\`\`\`

## 五、输出特殊图形与格式

- 空格也是字符，要占位就输出 \`" "\`；
- 反斜杠要写 \`\\\\\\\\\`，双引号写 \`\\\\\\"\`；
- 制表符 \`'\\\\t'\` 可以粗略对齐表格。
`,
    examples: [
      {
        title: '购物结账',
        level: '入门',
        statement: `**题目描述**

苹果单价 p 元/斤（可能是小数），买了 n 斤，付款 100 元，求找零。输入 p 和 n，输出找零金额，保留 2 位小数。`,
        samples: [['8.5 5', '57.50']],
        analysis: `### 解题思路

标准“输入→计算→输出”：找零 = 100 − p×n。金额用 double，输出固定 2 位小数。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double p;
    int n;
    cin >> p >> n;

    double change = 100.0 - p * n;
    cout << fixed << setprecision(2) << change << '\\n';
    return 0;
}`,
      },
      {
        title: '电子时钟补零',
        level: '基础',
        statement: `**题目描述**

输入时、分、秒三个整数，按 \`HH:MM:SS\` 格式输出，不足两位前面补 0。`,
        samples: [['9 5 3', '09:05:03']],
        analysis: `### 解题思路

\`setw(2)\` 限定占两格、\`setfill('0')\` 用 0 填充。注意 setfill 设置一次持续生效，setw 每项都要重新写。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int h, m, s;
    cin >> h >> m >> s;

    cout << setfill('0')           // 用字符 '0' 填充
         << setw(2) << h << ':'    // setw 只管紧跟的这一项
         << setw(2) << m << ':'
         << setw(2) << s << '\\n';
    return 0;
}`,
      },
      {
        title: '未知个数的数据求和',
        level: '提高',
        statement: `**题目描述**

输入若干个整数（数量不预先告知，读到输入结束 EOF 为止），输出它们的总和与个数。`,
        samples: [['1 2 3 4 5（输入结束）', 'sum=15 count=5']],
        analysis: `### 解题思路

\`while (cin >> x)\` 在成功读到数据时返回真，读到 EOF（文件结束）时返回假。

- 评测机重定向文件输入时，文件读完即 EOF；
- 本机测试时可在控制台按 **Ctrl+Z 再回车**（Windows）发送 EOF。
- 总和可能很大，用 long long。`,
        code: `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long x, sum = 0;
    int cnt = 0;
    while (cin >> x) {     // 能读到就继续，读到 EOF 自动结束
        sum += x;
        cnt++;
    }
    cout << "sum=" << sum << " count=" << cnt << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**setprecision 没配 fixed**：默认是“有效数字 6 位”，不是小数 6 位。货币、几何题务必加 fixed。`,
      `**setw 只写一次想管一整行**：它只对下一个输出项有效，每项都要写 setw。`,
      `**cin/scanf 与 getline 混用读到空行**：先 cin.ignore() 吞掉回车。`,
      `**输出少换行/多空格**：竞赛输出格式极其严格，行末一般要有换行；但额外尾随空格在多数 OJ 可以容忍，换行不能省。`,
      `**大数据不用加速**：10⁵ 以上数据可能 TLE，养成 main 开头放两板斧的习惯（注意别再混用 printf）。`,
      `**用 char 读数字参与计算**：cin 到 char 得到的是字符 '5' 而非整数 5。`,
    ],
    exercises: [
      { title: '梯形面积', level: '基础',
        statement: '输入上底 a、下底 b、高 h（整数），输出梯形面积 (a+b)×h/2，保留 1 位小数。',
        hint: '结果要小数：除以 2.0。' },
      { title: '数据格式化', level: '基础',
        statement: '输入一个 double 数 x，分三行分别输出：保留 2 位小数、保留 5 位小数、科学计数法形式。',
        hint: 'fixed/setprecision，科学计数法用 reset 后默认或 setprecision 配合。' },
      { title: '字符与它的前后邻', level: '基础',
        statement: '输入一个小写字母，输出它在字母表中的前一个和后一个字母（空格分隔），输入 a 时前邻输出空格即可。',
        hint: "char c; cout << (char)(c-1) << ' ' << (char)(c+1)。" },
      { title: '读一行自我介绍', level: '入门',
        statement: '先输入整数年龄，再用 getline 读入一整句自我介绍，输出：“xx岁的他说：xxx”。',
        hint: 'cin>>age 后写 cin.ignore(); 再 getline。' },
    ],
    summary: `
- \`cout << ...\` 连续输出，\`cin >> ...\` 连续读入且**自动跳过空白**；
- \`fixed + setprecision(n)\` 保留 n 位小数；\`setw/setfill\` 控制宽度和补零（setw 只管一项）；
- 读整行用 getline（注意 cin 后的 ignore）；读未知数量数据用 \`while(cin>>x)\`；
- 数据量大时加 \`ios::sync_with_stdio(false); cin.tie(nullptr);\` 加速；
- 顺序结构四步：**定义变量 → 输入 → 处理 → 输出**。
`,
  };

  T['io-printf-scanf'] = {
    chapter: '第4章 输入输出与顺序结构',
    time: '约 35 分钟',
    body: `
## 一、为什么还要学 printf / scanf？

cin/cout 方便，但 C 风格的 \`printf\`/\`scanf\` 在竞赛中仍极常见，因为：

1. **格式控制精准**：小数位数、补零、对齐一行搞定；
2. **老题解、老代码**几乎都用，必须能读懂；
3. 某些极端场景输出更快、更可控。

它们在头文件 \`<cstdio>\`（用万能头时自动包含）中。

## 二、printf：按“占位符”填空

\`\`\`cpp
#include <cstdio>
int age = 13;
double h = 1.65;
printf("我今年%d岁，身高%.2f米\\n", age, h);
// 我今年13岁，身高1.65米
\`\`\`

字符串中以 \`%\` 开头的是**占位符**，逗号后按顺序提供变量。

### 占位符大全（必记）

| 占位符 | 对应类型 | 例子输出 |
| --- | --- | --- |
| \`%d\` | int 整数 | 13 |
| \`%lld\` | **long long** | 10000000000 |
| \`%f\` / \`%.2f\` | double（默认/2位小数） | 1.650000 / 1.65 |
| \`%c\` | char 字符 | A |
| \`%s\` | C 风格字符串 | hello |
| \`%%\` | 输出一个百分号 | % |

> **❗ 重灾区：** long long 必须用 \`%lld\`，写成 \`%d\` 会输出乱码或 0；double 用 \`%lf\` 输入、\`%f\` 输出（C99 后 printf 中 %lf 也可）。

### 格式修饰

\`\`\`cpp
printf("%5d|\\n", 42);      // 占5格右对齐："   42|"
printf("%-5d|\\n", 42);     // - 号左对齐："42   |"
printf("%05d\\n", 42);      // 0 补零："00042"
printf("%.3f\\n", 3.14159); // 3.142（四舍五入保留3位）
printf("%8.2f\\n", 3.14);   // 共8格、小数2位："    3.14"
\`\`\`

通用形式：\`%[标志][宽度].[精度]类型\`。

## 三、scanf：必须传地址

\`\`\`cpp
int a, b;
scanf("%d %d", &a, &b);     // 注意变量前的 &（取地址符）！
double x;
scanf("%lf", &x);           // double 输入用 %lf
char c;
scanf(" %c", &c);           // %c 前加空格可跳过空白字符（%d/%f 会自动跳）
\`\`\`

scanf 的格式串里：

- \`%d\`、\`%lf\` 会**自动跳过**空格换行；
- \`%c\` 默认**不跳过**空白，会把空格/换行读进来，需要时写 \`" %c"\`（前面一个空格表示跳过任意空白）；
- 字面字符要原样匹配：\`scanf("%d,%d",&a,&b)\` 输入必须写成 \`3,8\`。

> **❗ 新手三大 scanf 错误：** ① 忘写 \`&\`（程序崩溃或读不进）；② long long 用错占位符；③ 格式串里多加 \`\\n\`（\`scanf("%d\\n",&a)\` 会导致输入行为异常，scanf 里不要写 \\n）。

## 四、两套 IO 对照表

| 需求 | cin/cout | printf/scanf |
| --- | --- | --- |
| 读 int | \`cin>>a\` | \`scanf("%d",&a)\` |
| 读 long long | \`cin>>a\` | \`scanf("%lld",&a)\` |
| 读 double | \`cin>>x\` | \`scanf("%lf",&x)\` |
| 输出2位小数 | \`cout<<fixed<<setprecision(2)<<x\` | \`printf("%.2f",x)\` |
| 补零5位整数 | \`cout<<setw(5)<<setfill('0')<<a\` | \`printf("%05d",a)\` |

> **建议：** 初学统一用 cin/cout，打牢一套；能流畅读题解后，printf 作为“格式工具”掌握即可。不要在同一程序混用（尤其开了加速后）。

## 五、转义字符复习

\`\\n\` 换行、\`\\t\` 制表符、\`\\\\\\\\\` 反斜杠、\`\\'\` 单引号、\`\\"\` 双引号、\`\\0\` 空字符——在 cout 字符串和 printf 中规则相同。
`,
    examples: [
      {
        title: '通讯录格式化输出',
        level: '基础',
        statement: `**题目描述**

输入编号（int）、姓名（无空格英文）、身高（double，米），用 printf 按表格形式输出：编号占 5 格补零，身高保留 2 位小数。`,
        samples: [['7 Alice 1.626', '编号:00007 姓名:Alice 身高:1.63']],
        analysis: `### 解题思路

一个 printf 串起所有格式：\`%05d\` 补零五位，\`%.2f\` 两位小数（自动四舍五入）。`,
        code: `#include <cstdio>
using namespace std;

int main() {
    int id;
    char name[25];
    double height;
    scanf("%d %s %lf", &id, name, &height);   // 注意：&id、&height；
                                              // 数组名 name 前不加 &（第8章理解）
    printf("编号:%05d 姓名:%s 身高:%.2f\\n", id, name, height);
    return 0;
}`,
      },
      {
        title: '大数乘积（%lld 专项）',
        level: '基础',
        statement: `**题目描述**

输入两个不超过 10^9 的整数，输出乘积（可达 10^18）。要求用 scanf/printf 实现。`,
        samples: [['1000000 1000000', '1000000000000']],
        analysis: `### 解题思路

变量用 long long，scanf 和 printf 的占位符都必须是 \`%lld\`，这是使用 C 风格 IO 最容易丢分的地方。`,
        code: `#include <cstdio>
using namespace std;

int main() {
    long long a, b;
    scanf("%lld %lld", &a, &b);
    printf("%lld\\n", a * b);
    return 0;
}`,
      },
      {
        title: '字符读入陷阱对比',
        level: '提高',
        statement: `**题目描述**

先读入一个整数 n，再读入 n 个字符（字符之间可能有空格和换行），统计其中数字字符的个数。比较 \`%c\` 加不加空格的区别。`,
        samples: [['3\na 5 b', '1']],
        analysis: `### 解题思路

输入整数后缓冲区里还留着换行符。直接 \`scanf("%c")\` 会先读到 \`'\\n'\`。

解决：格式串写 \`" %c"\`，前面的空格表示“跳过任意空白字符再读一个字符”。用 cin 时 \`cin >> c\` 会自动跳过空白，更省心。`,
        code: `#include <cstdio>
int main() {
    int n;
    scanf("%d", &n);

    int cnt = 0;
    for (int i = 0; i < n; i++) {
        char c;
        scanf(" %c", &c);               // %c 前的空格是本题关键
        if (c >= '0' && c <= '9') cnt++;
    }
    printf("%d\\n", cnt);
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**scanf 忘加 &**：除字符串/数组名外，变量前都要有 &，否则读入失败甚至崩溃。`,
      `**long long 用 %d**：必须 %lld；float 用 %f、double 输入用 %lf。`,
      `**printf 输出 long long 占位符不匹配**：同样 %lld，否则输出 0 或乱码。`,
      `**scanf 里写 \\n 或多余空格**：\`scanf("%d\\n", &a)\` 会让程序等待更多输入，格式串只描述数据怎么分隔。`,
      `**%c 读到空白**：紧跟数字后读字符，用 \`" %c"\` 跳过空白。`,
      `**宽度/精度混淆**：\`%5.2f\` 是“总宽5、小数2位”，不是“5位整数2位小数”。`,
    ],
    exercises: [
      { title: '百分号打印', level: '入门',
        statement: '用 printf 输出：通过率为 95.5%（数字通过 double 变量以 %.1f%% 形式输出）。',
        hint: '%% 输出一个字面百分号。' },
      { title: '账单小票', level: '基础',
        statement: '输入商品名（无空格）、单价（double）、数量（int），用 printf 输出一行小票，金额右对齐占 8 格保留 2 位。',
        hint: '"%-10s %8.2f x %d\\n" 之类组合，左名右额。' },
      { title: '八进制十六进制初体验', level: '提高',
        statement: '用 scanf 读入一个十进制 int，用 printf 的 %o 和 %x 分别输出它的八进制、十六进制形式。',
        hint: 'printf("%o %x\\n", a, a);，例如 255 → 377 ff。' },
      { title: '两种写法对照', level: '基础',
        statement: '选一道本章例题，分别用 cin/cout 和 scanf/printf 各写一遍，体会两者的格式差异，把对照表抄进笔记。',
        hint: '重点记：long long、小数位数、补零三种场景。' },
    ],
    summary: `
- printf 用占位符填空：**%d(int)、%lld(long long)、%f/%.2f(double)、%c、%s**，\`%%\` 输出百分号；
- scanf 必须传地址 \`&a\`，double 用 \`%lf\`，读字符用 \`" %c"\` 跳过空白；
- 修饰：\`%5d\` 宽度、\`%-5d\` 左对齐、\`%05d\` 补零、\`%.2f\` 两位小数；
- 初学主用 cin/cout，scanf/printf 重点能读题解、能精修格式。
`,
  };

  Object.assign(window.TOPICS, T);
})();
