/* ============================================================
   第一部分 · 第5章 分支结构
   flow-if / flow-switch
   ============================================================ */
(function () {
  const T = {};

  T['flow-if'] = {
    chapter: '第5章 分支结构',
    time: '约 35 分钟',
    body: `
## 一、为什么需要分支？

顺序结构只能“一条道走到黑”，但现实中充满选择：成绩及格吗？密码对吗？闰年吗？**分支结构**让程序根据条件选择执行路径。

流程图上，菱形表示判断：

\`\`\`text
        ┌─────────┐
        │ 条件成立？│
        └────┬────┘
      是 ↙      ↘ 否
   [语句A]      [语句B]
\`\`\`

## 二、if 的三种形态

### 1. 单分支：if

\`\`\`cpp
if (条件) {
    语句;          // 条件为真（true / 非0）才执行
}
\`\`\`

\`\`\`cpp
int score;
cin >> score;
if (score < 60) {
    cout << "需要补考";
}
\`\`\`

### 2. 双分支：if-else

\`\`\`cpp
if (条件) {
    语句A;         // 真走这里
} else {
    语句B;         // 假走这里
}
\`\`\`

\`\`\`cpp
if (score >= 60)
    cout << "及格";
else
    cout << "不及格";
\`\`\`

### 3. 多分支：if - else if - else

\`\`\`cpp
if (条件1) {
    ...
} else if (条件2) {
    ...
} else if (条件3) {
    ...
} else {
    ...            // 以上都不满足时的“兜底”
}
\`\`\`

C++ 自上而下检查，**只执行第一个成立的分支**，后面全部跳过。

## 三、大括号能不能省？

if/else 后如果只有**一条**语句，可以省略大括号：

\`\`\`cpp
if (x > 0) cout << "正";
else cout << "非正";
\`\`\`

> **⚠️ 强烈建议：初学阶段永远写 { }。** 省略大括号后，else 只与最近的未配对 if 结合，极易出错（见下面的“悬空 else”）。多条语句不加大括号，第二条起会变成无条件执行。

## 四、经典判断模型（背套路）

\`\`\`cpp
// 奇偶
if (n % 2 == 0) { /* 偶数 */ }

// 区间（必须拆成两个条件！）
if (0 <= x && x <= 100) { }

// 字符类别
if (c >= 'a' && c <= 'z') { }

// 三个数取最大值
int mx = a;
if (b > mx) mx = b;
if (c > mx) mx = c;

// 整除
if (n % k == 0) { }
\`\`\`

## 五、嵌套 if 与悬空 else

if 里面可以再放 if，处理“条件里还有条件”的情况：

\`\`\`cpp
if (score >= 60) {
    if (score == 100)
        cout << "满分！";
    else
        cout << "及格";
} else {
    cout << "不及格";
}
\`\`\`

> **❗ 悬空 else 陷阱：** else 总是和**它前面最近的、还没有 else 的 if** 配对。缩进不决定配对关系，大括号才决定。嵌套时务必加 { }。

## 六、分支题的一般做法

1. 把题目的中文条件逐条圈出来；
2. 翻译成布尔表达式（&&、||、!）；
3. 先处理特殊/边界情况（0、负数、最大值）；
4. 写完后用**边界数据**测试：刚好 60、闰年 1900/2000、区间端点。
`,
    examples: [
      {
        title: '三个数排序输出',
        level: '基础',
        statement: `**题目描述**

输入三个整数 a、b、c，按从小到大的顺序输出，空格分隔。`,
        samples: [['3 1 2', '1 2 3'], ['5 5 5', '5 5 5']],
        analysis: `### 解题思路（方法一：交换法）

利用第2章学的交换，把最小值“冒泡”到 a，再让 b、c 有序：

1. 若 a>b 交换 → a 是前两者的小值；
2. 若 a>c 交换 → a 成为三者最小；
3. 若 b>c 交换 → 后两者有序。

方法二：直接用 \`min/max\` 组合，方法三（学习排序后）一行 sort。这里练分支，用方法一。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b, c, t;
    cin >> a >> b >> c;

    if (a > b) { t = a; a = b; b = t; }  // 保证 a<=b
    if (a > c) { t = a; a = c; c = t; }  // 保证 a 最小（c 存原 a 或 b）
    if (b > c) { t = b; b = c; c = t; }  // 剩下 b<=c

    cout << a << " " << b << " " << c << '\\n';
    return 0;
}`,
      },
      {
        title: 'BMI 健康指数',
        level: '基础',
        statement: `**题目描述**

输入体重 w（公斤，double）和身高 h（米，double），计算 BMI = w/(h×h)：

- BMI < 18.5 输出 \`thin\`
- 18.5 ≤ BMI < 24 输出 \`normal\`
- 24 ≤ BMI < 28 输出 \`overweight\`
- BMI ≥ 28 输出 \`obese\``,
        samples: [['70 1.75', 'normal'], ['90 1.7', 'obese']],
        analysis: `### 解题思路

多分支的标准练习。**按从小到大（或从大到小）单向判断**，利用“else 隐含否定”就不必重复写下界：

进入第二个 else if 时，已经隐含 BMI≥18.5。注意区间端点（24 到底算哪档）要与题意完全一致。`,
        code: `#include <iostream>
using namespace std;

int main() {
    double w, h;
    cin >> w >> h;

    double bmi = w / (h * h);     // 括号保证先算 h*h

    if (bmi < 18.5) {
        cout << "thin\\n";
    } else if (bmi < 24) {        // 隐含 bmi>=18.5
        cout << "normal\\n";
    } else if (bmi < 28) {        // 隐含 bmi>=24
        cout << "overweight\\n";
    } else {
        cout << "obese\\n";
    }
    return 0;
}`,
      },
      {
        title: '出租车计费（分段函数）',
        level: '提高',
        statement: `**题目描述**

某市出租车：3 公里内（含）起步价 13 元；超过 3 公里的部分每公里 2.3 元；单程超过 15 公里后，超出部分加收 50% 返程费（即每公里 3.45 元）。输入行驶公里数 x（double），输出车费（四舍五入到元，用 int(x+0.5) 取整即可）。`,
        samples: [['2', '13'], ['10', '29'], ['20', '58']],
        analysis: `### 解题思路

分段计费是 if 经典题，核心是**各段费用分开算再相加**，不要试图一个公式：

- 0~3：13；
- 3~15：(x−3)×2.3；
- 15 以上：12×2.3 + (x−15)×3.45。

样例 20 公里：13 + 12×2.3 + 5×3.45 = 58.35 → 四舍五入 58…… 注意实际规则以题目描述为准，本题按上述公式计算并取整。`,
        code: `#include <iostream>
using namespace std;

int main() {
    double x;
    cin >> x;

    double fee;
    if (x <= 3) {
        fee = 13;                                   // 起步价
    } else if (x <= 15) {
        fee = 13 + (x - 3) * 2.3;                  // 超出起步里程
    } else {
        fee = 13 + 12 * 2.3 + (x - 15) * 3.45;     // 15 公里后加收返程费
    }

    cout << (int)(fee + 0.5) << '\\n';              // double 四舍五入到整数
    return 0;
}`,
      },
      {
        title: '三角形判断与分类',
        level: '提高',
        statement: `**题目描述**

输入三条线段长度（正整数）。若不能构成三角形输出 \`not a triangle\`；能构成则进一步输出 \`equilateral\`（等边）、\`isosceles\`（等腰）或 \`scalene\`（不等边）。`,
        samples: [['3 3 3', 'equilateral'], ['3 4 5', 'scalene'], ['1 2 3', 'not a triangle']],
        analysis: `### 解题思路

判断顺序很重要：**先判合法性，再判特殊（等边），再判等腰，最后普通**。

- 合法性：任意两边之和大于第三边（三个条件）；
- 先判等边，因为等边也满足等腰条件，顺序反了会被提前归类；
- 注意 \`1 2 3\`：1+2=3，不满足“严格大于”，不能构成。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    if (a + b <= c || a + c <= b || b + c <= a) {
        cout << "not a triangle\\n";          // 先排除不合法
    } else if (a == b && b == c) {
        cout << "equilateral\\n";             // 等边优先判断
    } else if (a == b || a == c || b == c) {
        cout << "isosceles\\n";               // 再判等腰
    } else {
        cout << "scalene\\n";
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**\`if (x = 5)\` 误用赋值号**：恒真。判等必须 \`x == 5\`。`,
      `**区间直接写 \`18.5 <= bmi < 24\`**：C++ 不支持，要 \`bmi>=18.5 && bmi<24\`，或借助 else 隐含下界。`,
      `**if 后多写分号**：\`if (x>0); { ... }\` 中的分号是空语句，后面大括号变成无条件执行。`,
      `**漏掉 else 的互斥性**：多分支里重复写上下界，端点容易判错（24.0 同时落进两个区间）。`,
      `**浮点数用 == 判等做条件**：改用误差比较 fabs(a-b)<1e-9。`,
      `**分支边界没测**：每个临界值（60、0、负数、最大值）都应构造一组测试数据亲手验证。`,
    ],
    exercises: [
      { title: '奇偶升级版', level: '入门',
        statement: '输入整数，输出 "positive odd"/"positive even"/"negative"/"zero" 四种结果之一。',
        hint: '先判 0，再判正负，正数内部再用 n%2 分奇偶。' },
      { title: '闰年函数化', level: '基础',
        statement: '输入月份 m（1~12），输出该月天数（考虑闰年 2 月，需再输入年份 y）。',
        hint: '31 天月份：1,3,5,7,8,10,12；2 月用第3章闰年公式。' },
      { title: '一元二次方程实数解', level: '提高',
        statement: '输入 double 系数 a,b,c（a≠0），判别式 Δ>0 输出两个根，=0 输出一个，<0 输出 "no real root"。根保留 4 位小数。',
        hint: 'Δ 与 0 比较用 fabs(Δ)<1e-9 视为相等；Δ<0 判断要用 Δ<-1e-9。' },
      { title: '简单计算器', level: '提高',
        statement: '输入“数字 运算符 数字”，如 \`3 + 5\`，输出结果（+ - * /，除数为 0 时输出 error，除法保留 2 位）。',
        hint: "运算符用 char 接收；if-else if 按 op 判断，除法先判 b==0。" },
      { title: '成绩奖励', level: '基础',
        statement: '期末考双科：两科都 ≥90 输出 "grand prize"；平均分 ≥90 或有一科满分输出 "prize"；否则 "no prize"。',
        hint: '注意 grand prize 与 prize 的包含关系，先判最高奖。' },
    ],
    summary: `
- if 三形态：**单分支 / if-else / if-else if-else**；多分支自上而下，只走第一个真分支；
- 中文条件翻译成布尔式：区间拆开、&& 表并且、|| 表或者；
- 永远写 { }，记住 else 与最近未配对的 if 结合；
- 分类题顺序：**先排除非法，再判特殊，最后一般**；边界数据必测。
`,
  };

  T['flow-switch'] = {
    chapter: '第5章 分支结构',
    time: '约 25 分钟',
    body: `
## 一、switch：多值选择

当判断是“**一个变量等于若干固定值之一**”时，switch 比一长串 if-else if 更清晰：

\`\`\`cpp
switch (表达式) {     // 表达式必须是整数型（int/char/bool...），不能是 double、string
    case 值1:
        语句;
        break;       // 跳出 switch
    case 值2:
        语句;
        break;
    default:         // 所有 case 都不匹配时（相当于 else）
        语句;
}
\`\`\`

\`\`\`cpp
char grade;
cin >> grade;               // 输入 A/B/C/D
switch (grade) {
    case 'A': cout << "优秀"; break;
    case 'B': cout << "良好"; break;
    case 'C': cout << "及格"; break;
    default:  cout << "不及格";
}
\`\`\`

case 后面必须是**整数或字符常量**（\`case 1:\`、\`case '#':\`），不能是变量、区间（\`case x>60:\` 错误）或字符串。

## 二、break 穿透现象（重点坑）

没有 break，程序会从匹配的 case **一路向下执行后续所有 case**：

\`\`\`cpp
int x = 2;
switch (x) {
    case 1: cout << "一";
    case 2: cout << "二";      // 从这里匹配
    case 3: cout << "三";      // 没有 break，继续！
    default: cout << "其他";
}
// 输出：二三其他
\`\`\`

> **❗ 90% 的 switch 错题都因为漏写 break。** 每个 case 末尾自觉写 break。

### 穿透也可以故意利用

当多个值执行**相同操作**时，让 case 叠在一起：

\`\`\`cpp
switch (m) {
    case 1: case 3: case 5: case 7:
    case 8: case 10: case 12:
        days = 31; break;        // 这些月份共用同一段代码
    case 4: case 6: case 9: case 11:
        days = 30; break;
    case 2:
        days = 28; break;
}
\`\`\`

## 三、if-else if 还是 switch？

| 场景 | 选择 |
| --- | --- |
| 判断固定的几个离散值（星期、菜单、运算符） | switch 清晰 |
| 区间判断（≥90、18.5≤x<24）、复杂布尔条件 | if |
| 判断浮点、字符串相等 | 只能 if |

两者可以互换，switch 不增加任何新能力，只是可读性工具。

## 四、三目运算符补充

上一章见过的 \`? :\` 适合“二选一并产出一个值”：

\`\`\`cpp
cout << (n % 2 == 0 ? "偶数" : "奇数");
int absX = x >= 0 ? x : -x;
char level = score >= 60 ? 'P' : 'F';
\`\`\`

嵌套三目可读三目可读差，多分支还是老实用 if-else if。
`,
    examples: [
      {
        title: '简单四则运算器',
        level: '基础',
        statement: `**题目描述**

输入一个算式：整数、运算符（+ - * / 之一）、整数。输出整数结果；除法为整除，若除数为 0 输出 \`error\`。`,
        samples: [['8 * 7', '56'], ['5 / 0', 'error']],
        analysis: `### 解题思路

运算符是固定的四个字符，天然适合 switch。注意：

1. 先单独处理除数为 0；
2. 每个 case 用 break 隔开；
3. default 处理非法运算符。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    char op;
    cin >> a >> op >> b;       // cin 会自动跳过空格，输入 "8 * 7" 也没问题

    if (op == '/' && b == 0) {
        cout << "error\\n";
        return 0;              // 提前结束 main，相当于结束程序
    }

    switch (op) {
        case '+': cout << a + b; break;
        case '-': cout << a - b; break;
        case '*': cout << a * b; break;
        case '/': cout << a / b; break;
        default:  cout << "error";   // 运算符不合法
    }
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '星期几的英文名',
        level: '入门',
        statement: `**题目描述**

输入 1~7 的整数，输出对应星期的英文（Monday…Sunday），其他数字输出 \`invalid\`。要求故意尝试：删掉某个 break 观察“穿透”。`,
        samples: [['1', 'Monday'], ['6', 'Saturday'], ['8', 'invalid']],
        analysis: `### 解题思路

最标准的 switch 模板：case 数字 → 输出 → break。建议把本题的 break 故意删一个运行一次，亲眼看到穿透输出，加深印象。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int d;
    cin >> d;
    switch (d) {
        case 1: cout << "Monday\\n";    break;
        case 2: cout << "Tuesday\\n";   break;
        case 3: cout << "Wednesday\\n"; break;
        case 4: cout << "Thursday\\n";  break;
        case 5: cout << "Friday\\n";    break;
        case 6: cout << "Saturday\\n";  break;
        case 7: cout << "Sunday\\n";    break;
        default: cout << "invalid\\n";
    }
    return 0;
}`,
      },
      {
        title: '奖学金等级（switch 与 if 配合）',
        level: '提高',
        statement: `**题目描述**

输入平均分（整数）：95~100 为特等奖（输出 1），90~94 为一等奖（2），80~89 为二等奖（3），70~79 为三等奖（4），其余为 0。再输入是否为班干部（y/n），若是班干部且获得三等奖以上，等级提升 1 级（特等奖不变）。`,
        samples: [['91 y', '1'], ['75 n', '4'], ['60 y', '0']],
        analysis: `### 解题思路

区间判断先用 if 算出基础等级；离散的“班干部”修正适合继续用 if。展示一个原则：**switch 管“等于谁”，if 管“在什么范围”**，各用其长。`,
        code: `#include <iostream>
using namespace std;

int main() {
    int score;
    char leader;
    cin >> score >> leader;

    int level;
    if (score >= 95)      level = 1;
    else if (score >= 90) level = 2;
    else if (score >= 80) level = 3;
    else if (score >= 70) level = 4;
    else                  level = 0;

    // 班干部且在 2~4 等奖：提升一级（数字变小一级）
    if (leader == 'y' && level >= 2 && level <= 4) {
        level--;
    }

    cout << level << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**case 后漏 break** 导致穿透，后面的分支被连续执行。`,
      `**switch 判断浮点或字符串**：语法不允许，只能用 if。`,
      `**case 后面写变量或区间**：\`case x>60:\`、\`case a:\` 都非法，case 必须是编译期常量。`,
      `**default 不是必须的但建议写**：不写时所有 case 不匹配就静默跳过，可能掩盖输入异常。`,
      `**在 case 里直接声明变量**：需要用大括号包住该 case，或把变量声明提到 switch 外。`,
    ],
    exercises: [
      { title: '元音判断', level: '基础',
        statement: '输入一个英文字母，用 switch 判断它是否为元音（a e i o u，大小写都算），元音输出 yes，否则 no。',
        hint: "case 'a': case 'e': ... case 'A': 叠在一起共用输出。" },
      { title: '月份天数（switch 版）', level: '基础',
        statement: '用穿透特性重写“月份天数”程序：输入月份输出天数（暂不考虑闰年，2 月按 28）。',
        hint: '31 天的 7 个 case 连续穿透共用 days=31。' },
      { title: '菜单模拟', level: '提高',
        statement: '输入菜单项编号 1~4（1.查询 2.存款 3.取款 4.退出）和一个金额，输出对应操作提示文字；如选 3 且金额>余额(余额固定 1000) 输出 insufficient。',
        hint: 'switch 分发四种操作，取款分支里再嵌套 if 判余额。' },
      { title: '三目改写', level: '入门',
        statement: '把“两个数输出较大值”和“判断正负零”两个小题改用三目运算符实现。',
        hint: '判断正负零需要嵌套三目：x>0?1:(x<0?-1:0)。' },
    ],
    summary: `
- switch 适合“一个整数/字符变量等于若干常量”的多分支；\`case 常量:\` + \`break\` + \`default\`；
- **漏 break 会穿透**执行；多个 case 共享代码时可以故意穿透；
- 区间、浮点、字符串条件只能用 if；三目 \`? :\` 适合简洁二选一；
- switch 与 if 没有能力差异，按可读性选择。
`,
  };

  Object.assign(window.TOPICS, T);
})();
