/* ============================================================
   第一部分 · 第12章 文件操作与调试
   file-io / debug-guide
   ============================================================ */
(function () {
  const T = {};

  T['file-io'] = {
    chapter: '第12章 文件操作与调试',
    time: '约 20 分钟',
    body: `
## 一、为什么必须会文件输入输出？

CSP-J/S **复赛**要求程序从指定文件读入数据、输出到指定文件，而不是键盘和屏幕。例如题目声明：

\`\`\`text
输入文件名：candy.in
输出文件名：candy.out
\`\`\`

评测时，评测机把 \`candy.in\` 放在程序同目录，运行你的程序，检查生成的 \`candy.out\`。

## 二、freopen 三行模板（必背）

在 main 的**最开头**加两行：

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    freopen("candy.in", "r", stdin);    // 标准输入重定向到文件（只读）
    freopen("candy.out", "w", stdout);  // 标准输出重定向到文件（写入）

    int a, b;
    cin >> a >> b;          // 之后 cin/scanf 自动读文件
    cout << a + b << '\\n';  // cout/printf 自动写文件
    return 0;
}
\`\`\`

- 文件名必须与题目**完全一致**（含大小写、扩展名 .in/.out）；
- 之后所有 cin/cout、scanf/printf 代码**一行都不用改**——这就是重定向的好处；
- 本地测试：在 exe 同目录放一个 \`candy.in\`，运行后用记事本打开 \`candy.out\` 检查。

## 三、提交前的“开关”技巧

正式提交**必须带** freopen；日常在 OJ（洛谷等）练习时大多用标准输入输出，带了反而读不到数据。两种常见处理：

\`\`\`cpp
// 方法一：注释法——交作业前加上，练习时注释掉
// freopen("candy.in","r",stdin);
// freopen("candy.out","w",stdout);
\`\`\`

\`\`\`cpp
// 方法二：本地宏法（Dev-C++ 里不定义 ONLINE_JUDGE，本地自动走文件；
//         OJ 若定义了该宏则跳过，做到提交免注释）
#ifndef ONLINE_JUDGE
freopen("candy.in", "r", stdin);
freopen("candy.out", "w", stdout);
#endif
\`\`\`

> **💡 建议新手用方法一**，简单直接、不容易搞错文件名。考前模拟赛严格按复赛流程练 3~5 次。

## 四、fstream 方式（了解，非必须）

C++ 风格的文件流用独立对象，不影响 cin/cout：

\`\`\`cpp
#include <fstream>
ifstream fin("candy.in");
ofstream fout("candy.out");
fin >> a >> b;
fout << a + b << '\\n';
\`\`\`

复赛中 freopen 最主流，本手册以它为准。

## 五、复赛文件操作检查清单

- [ ] 源文件名、输入输出文件名与题目要求逐字符一致（如 \`candy.cpp / candy.in / candy.out\`）；
- [ ] freopen 写在 main 最开头，拼写、引号、模式 \`"r"\`/\`"w"\` 正确；
- [ ] **不要输出任何提示语**（如“请输入：”），文件里只能有答案本身；
- [ ] 行末换行正常；不依赖屏幕暂停（不要加 \`system("pause")\`）；
- [ ] 提交最终版**保留** freopen（CSP 复赛要求文件 IO）；
- [ ] 每道题一个独立工程/目录，避免文件名张冠李戴；
- [ ] 检查工作目录：Dev-C++ 下生成的 exe 与 .in 是否在同一文件夹。
`,
    examples: [
      {
        title: '完整复赛模板',
        level: '入门',
        statement: `**题目描述（示例）candy**

输入两个整数 a、b，输出和。要求从 \`candy.in\` 读、写到 \`candy.out\`。下面是可以直接套用的完整模板。`,
        samples: [['candy.in 内容: 3 5', 'candy.out 内容: 8']],
        analysis: `### 本地自测步骤

1. 新建 \`candy.cpp\`，写入代码；
2. 在同目录新建文本文档，写入 \`3 5\`，重命名为 \`candy.in\`（要显示扩展名再改！）；
3. 编译运行（黑窗口可能一闪而过且没有输出，这是正常的——输出进文件了）；
4. 打开新出现的 \`candy.out\`，看到 8 即成功。`,
        code: `#include <iostream>
using namespace std;

int main() {
    // ===== 文件重定向：复赛必加，练习时可注释 =====
    freopen("candy.in", "r", stdin);
    freopen("candy.out", "w", stdout);
    // ===========================================

    int a, b;
    cin >> a >> b;
    cout << a + b << '\\n';
    return 0;
}`,
      },
      {
        title: '多数据文件练习',
        level: '基础',
        statement: `**题目描述**

文件 \`sum.in\` 第一行是 n，第二行 n 个整数；输出它们的和到 \`sum.out\`。写出完整程序，并说明你会如何造 3 组测试数据自测。`,
        samples: [['sum.in:\n5\n1 2 3 4 5', 'sum.out:\n15']],
        analysis: `### 自测数据设计思路

至少覆盖三类：

1. **普通样例**：题面样例原样验证格式；
2. **边界数据**：n=1、含负数、含 0、最大值（测 int/long long 选择）；
3. **极端规模**：n 取上限的大文件（测会不会超时 TLE）。

把数据直接写进 .in，反复运行检查 .out，这就是复赛的工作方式。`,
        code: `#include <iostream>
using namespace std;

int main() {
    freopen("sum.in", "r", stdin);
    freopen("sum.out", "w", stdout);

    int n;
    cin >> n;
    long long sum = 0, x;       // 求和可能很大
    for (int i = 0; i < n; i++) {
        cin >> x;
        sum += x;
    }
    cout << sum << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**文件名不一致**：题目要 \`candy.in\` 你写 \`CANDY.IN\` 或 \`candy.txt\`，直接 0 分。`,
      `**练习/OJ 提交忘删 freopen**：OJ 上没有这个文件，程序读不到输入。交 OJ 前注释掉。`,
      `**输出提示文字**：\`cout<<"请输入两个数"\` 会写进 .out，答案判错。`,
      `**记事本建文件扩展名是 .txt**：candy.in.txt 不等于 candy.in，在系统设置里打开“显示文件扩展名”。`,
      `**system("pause") 留在提交代码里**：复赛评测无人按键，可能导致程序挂起。`,
    ],
    exercises: [
      { title: '搭建复赛工程', level: '入门',
        statement: '在 D:\\code 下建 test 目录，完成 cpp/in/out 三件套全流程，截图式检查每个文件内容。',
        hint: '严格走“建 in → 运行 → 查 out”三步。' },
      { title: '文件版 A+B', level: '入门',
        statement: '用文件 IO 重做 A+B，分别造普通、负数、大整数三组 in 验证。',
        hint: '大数记得 long long。' },
      { title: '宏开关实验', level: '提高',
        statement: '用 #ifndef ONLINE_JUDGE 包裹 freopen，理解“本地走文件、OJ 走标准输入”的自动切换。',
        hint: 'Dev-C++ 默认不定义 ONLINE_JUDGE；宏名拼错会导致文件 IO 失效。' },
    ],
    summary: `
- 复赛使用文件 IO：main 开头 \`freopen("xxx.in","r",stdin)\` 和 \`freopen("xxx.out","w",stdout)\`，其余代码不变；
- 文件名逐字符照抄题目；输出中不得有提示语和 pause；
- 本地自测 = 造 .in → 运行 → 检查 .out；交 OJ 前注释/用宏隔离 freopen；
- 多造普通、边界、极限三类数据，是复赛拿分的基本工作习惯。
`,
  };

  T['debug-guide'] = {
    chapter: '第12章 文件操作与调试',
    time: '约 30 分钟',
    body: `
## 一、错误的三个层次

| 类型 | 表现 | 主要原因 |
| --- | --- | --- |
| **编译错误** | 编译不通过，红字报错 | 语法问题、名字拼错、类型不符 |
| **运行错误** | 闪退、卡死、异常退出 | 除零、越界、空指针、爆栈 |
| **逻辑错误** | 能跑完但答案错 | 算法/边界/条件写错（最难查） |

## 二、编译错误：学会读报错信息

报错可能很长，只看**第一条**和有你源码行号的部分：

| 关键报错 | 含义 | 常见原因 |
| --- | --- | --- |
| \`was not declared\` | 名字不认识 | 拼错、漏头文件、作用域不对 |
| \`expected ';'\` | 该有分号 | 上一行漏分号 |
| \`expected expression/')'\` | 括号不配对 | 少括号、中文符号 |
| \`invalid conversion from int to ...\` | 类型不匹配 | int 赋给 char*、指针类型错 |
| \`redefinition\` | 重复定义 | 同名变量/函数、重复 include 保护 |
| \`undefined reference to main\` | 找不到入口 | main 拼成 mian |
| \`no match for operator>>\` | cin 类型不对 | 读入了数组名/表达式 |

排查顺序：**修第一个错误 → 重新编译**，后续错误可能是连锁反应。

## 三、运行错误定位

- **闪退/立即结束**：数组越界、除以 0、main 拼错；
- **卡在那里不动**：死循环（检查循环变量是否朝终结变化）；
- **输出一大片乱码后崩溃**：字符串没 \\0、数组越界写坏了内存；
- **大数组时崩溃、小数据正常**：局部数组爆栈 → 开全局；递归过深也会爆栈；
- Dev-C++ 弹出“程序停止工作”时，留意崩在大概第几轮循环/多大的数据。

## 四、逻辑错误：万能的“打印调试法”

没有调试器基础也能解决 90% 的问题——在关键位置打印中间值：

\`\`\`cpp
for (int i = 0; i < n; i++) {
    sum += a[i];
    cerr << "i=" << i << " a[i]=" << a[i]
         << " sum=" << sum << '\\n';   // 调试输出到错误流（不影响重定向）
}
\`\`\`

要点：

1. 打印**输入是否读对**（很多 bug 其实在读入）；
2. 打印循环关键变量在每轮的值，对比手工小样；
3. 在分支内打印“走到了哪个分支”；
4. 查完删掉或注释调试输出。用 \`cerr\` 的好处：freopen 只重定向 stdout，调试信息仍显示在屏幕。

### Dev-C++ 单步调试（可选进阶）

1. 工具 → 编译选项 → 勾选“**编译时加入调试信息**”；
2. 在代码行号旁点一下设置断点（红色勾）；
3. F5 开始调试，F7/“下一步”单步，鼠标悬停看变量值，添加“查看变量”窗口观察数组。

## 五、新手错误 Top 10

1. 变量不初始化（垃圾值）；
2. int 溢出，该用 long long 没用、\`1LL*a*b\` 忘写；
3. \`=\` 与 \`==\` 混用；
4. 循环差一：\`i<n\` 写成 \`i<=n\` 导致越界；
5. 数组开小（数据 10⁵ 只开 a[1000]）或局部开太大崩溃；
6. 整数除法丢小数：\`(a+b)/2\` 求平均得整数；
7. scanf 忘 \`&\`、\`%lld\` 用错；
8. 字符/字符串引号用错、用了中文标点；
9. 大括号不配对、if 后多写分号 \`if(x>0);\`；
10. 输出格式错：漏换行、多空格、答案顺序与题目不一致。

## 六、系统化的自查清单（交卷前过一遍）

- [ ] 数据类型：最大答案有几位？int 够吗？乘积有没有中途溢出？
- [ ] 边界：n=0/1、最小值、最大值、负数、重复值、全相同——程序都对吗？
- [ ] 数组：大小 ≥ 题目上限+5？下标范围 0~n-1 还是 1~n，统一了吗？
- [ ] 初始化：累加器清零、计数器清零、每组数据重置状态？
- [ ] 输出：换行、空格、大小写与样例完全一致吗？
- [ ] 复杂度：n=上限时运算次数是多少，会不会 TLE？
- [ ] 文件：freopen 文件名、模式、是否该保留？

## 七、对拍：用计算机帮你找 Bug（思想预告）

怀疑算法对但心里没底时：

1. 写一份**暴力但绝对正确**的程序；
2. 写一个**随机数据生成器**；
3. 同一份数据分别喂给两个程序，diff 输出是否一致；
4. 不一致的小数据就是最佳调试线索。

普及篇“应试技巧”章会给出完整对拍代码。
`,
    examples: [
      {
        title: '编译错误侦探',
        level: '入门',
        statement: `**题目描述**

下面的程序有 5 处编译/逻辑错误，全部找出并改正，使其正确读入 n 个成绩并求平均。`,
        code: `#include <iostream>
using namespace std;

int mian() {
    int n;
    cin >> n
    int sum;
    for (int i = 0; i <= n; i++) {
        int x;
        cin >> x;
        sum = sum + x;
    }
    cout << sum / n
    return 0;
}`,
        analysis: `### 逐处定位

1. \`mian\` → **main**（入口拼错）；
2. \`cin >> n\` 后缺**分号**；
3. \`int sum;\` 未初始化 → \`int sum = 0;\`；
4. 循环 \`i <= n\` 多读一个数（共 n+1 次）→ \`i < n\`；
5. \`cout << sum/n\` 缺分号，且整数除法丢小数 → \`(double)sum/n\` 并加分号。

改完后用边界 n=1 测一次，确认循环次数。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum += x;
    }
    cout << (double)sum / n << '\\n';
    return 0;
}`,
      },
      {
        title: '用 cerr 调试搜索 bug',
        level: '提高',
        statement: `**题目描述**

下面程序想统计数组中的最大值，但输出总是不对。演示如何用 cerr 插桩，快速定位“mx 初值错误”这个 bug。`,
        code: `#include <iostream>
using namespace std;
int a[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    int mx = 0;                       // 若数据全为负数，mx 永远是 0！
    for (int i = 0; i < n; i++) {
        cerr << "check i=" << i << " a[i]=" << a[i]
             << " mx=" << mx << '\\n'; // 插桩：观察比较过程
        if (a[i] > mx) mx = a[i];
    }
    cout << mx << '\\n';
    return 0;
}`,
        analysis: `### 调试过程

cerr 输出显示每轮 mx 都没有被负数更新——立刻发现初值 0 大于所有数据。

修复：\`int mx = a[0];\`（或初始化为 INT_MIN），从第一个真实数据开始打擂台。调试完毕删除 cerr 行。`,
        code: `#include <iostream>
#include <climits>
using namespace std;
int a[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    int mx = INT_MIN;          // 极小值，保证任何数据都能更新它
    for (int i = 0; i < n; i++)
        if (a[i] > mx) mx = a[i];

    cout << mx << '\\n';
    return 0;
}`,
      },
      {
        title: '边界数据设计练习',
        level: '基础',
        statement: `**题目描述**

程序功能：输出 n 个整数中的第二大值（值可能重复，如 5,5,3 时第二大按排序后第 2 个数理解为 5）。请为它设计至少 5 组测试数据，说明每组针对什么风险。`,
        samples: [['2\n5 5', '5']],
        analysis: `### 测试数据设计示范

| 数据 | 针对的风险 |
| --- | --- |
| n=2，两个相同数 | 最小规模 + 重复值处理 |
| 全部相等（3 3 3） | “去重”与“不去重”理解偏差 |
| 严格递增（1 2 3 4） | 最大值是否污染第二大 |
| 逆序（4 3 2 1） | 初始双擂主赋值 |
| 含负数（-5 -2 -9） | 初值 0 当最大/次大的典型 bug |

先手工算出每组答案，再运行程序对照——这就是最小成本的测试思维。`,
        code: `#include <iostream>
#include <algorithm>
#include <functional>
using namespace std;

int a[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a, a + n, greater<int>());   // 降序排序
    cout << a[1] << '\\n';             // 第 2 个（允许与第 1 个相等）
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**只看最后一条报错**：连锁报错常让真正的原因藏在第一条，从上往下修。`,
      `**改完不重新编译**或运行了旧 exe，以为“代码没用”。`,
      `**只测样例不测边界**：样例通常温和，0、1、负数、最大值、重复值才是失分点。`,
      `**调试输出用 cout 忘删**：复赛时写进 .out 导致格式错误；用 cerr 或及时注释。`,
      `**凭肉眼死盯代码**：超过 20 行就应该上打印/断点，让程序自己说出执行过程。`,
    ],
    exercises: [
      { title: '错误信息积累', level: '入门',
        statement: '建立自己的“报错笔记”：故意制造漏分号、拼错名字、漏头文件等 5 种错误，记录编译器原文与解决方法。',
        hint: '这是职业选手都在用的错题本思想。' },
      { title: '插桩实践', level: '基础',
        statement: '写一个“统计偶数平均值”的程序并故意留一个 bug（如漏初始化），用 cerr 定位后修复。',
        hint: '观察第一轮循环 sum 的值是否异常。' },
      { title: 'Dev-C++ 断点', level: '基础',
        statement: '开启调试信息，在循环内设断点，单步观察 i、sum 变化。',
        hint: '程序必须能通过编译且无死循环，断点才有效。' },
      { title: '自查清单实战', level: '提高',
        statement: '任选本章前 3 道练习题，不看答案完成后，对照“交卷前自查清单”逐项检查再提交。',
        hint: '把清单抄到你的笔记本扉页。' },
    ],
    summary: `
- 错误三层：**编译错误**（看第一条报错与行号）、**运行错误**（越界/除零/爆栈）、**逻辑错误**（最隐蔽）；
- 打印调试法：用 cerr 输出输入、关键变量、分支走向，对比手工小样；也可用 Dev-C++ 断点单步；
- 新手 Top 10 错误集中在初始化、long long、== 与 =、差一、数组大小、整数除法；
- 交卷前按类型/边界/数组/初始化/格式/复杂度/文件清单自查；进阶武器是暴力+随机数据对拍。
`,
  };

  Object.assign(window.TOPICS, T);
})();
