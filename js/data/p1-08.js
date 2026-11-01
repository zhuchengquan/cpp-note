/* ============================================================
   第一部分 · 第8章 字符串
   str-cstr / str-string
   ============================================================ */
(function () {
  const T = {};

  T['str-cstr'] = {
    chapter: '第8章 字符串',
    time: '约 30 分钟',
    body: `
## 一、字符数组：C 风格字符串

C 风格字符串本质是一个 \`char\` 数组，特殊之处在于：**以空字符 '\\0'（ASCII 0）作为结束标志**。

\`\`\`cpp
char s1[10] = "abc";     // 实际存: a b c \\0，其余补 \\0
char s2[] = "hello";     // 长度自动为 6（含结尾 \\0）
char s3[5] = {'h','i','\\0'};
cout << s1;              // 输出 abc，cout 从首地址一直打印到 \\0
\`\`\`

> **⚠️ 关键：** \`"abc"\` 在内存中占 **4** 个字节（a、b、c、\\0）。开数组时要给 \\0 预留位置：存长度 10 的字符串至少开 \`char s[11]\`。

## 二、字符的输入

\`\`\`cpp
char s[105];
cin >> s;        // 读一个“单词”：遇到空格/换行停止，自动加 \\0
s[0]             // 像数组一样用下标访问每个字符
\`\`\`

读含空格的一整行用 \`cin.getline(s, 105)\`（参数：数组、最大长度）。

## 三、cstring 库函数

\`#include <cstring>\`（万能头已含）提供一组操作函数，**都依赖结尾 \\0**：

| 函数 | 作用 | 备注 |
| --- | --- | --- |
| \`strlen(s)\` | 字符串长度（不含 \\0） | O(n)，不要写进循环条件反复调 |
| \`strcmp(a,b)\` | 字典序比较 | a<b 返回负、相等返回 **0**、a>b 返回正 |
| \`strcpy(a,b)\` | 把 b 复制到 a | a 要有足够空间 |
| \`strcat(a,b)\` | 把 b 拼接到 a 末尾 | a 要留足空间 |
| \`memset(a,0,sizeof(a))\` | 按字节清零 | 数组清零神器 |

\`\`\`cpp
char a[20] = "apple";
char b[20] = "apply";
cout << strlen(a) << '\\n';           // 5
cout << strcmp(a, b) << '\\n';        // 负数（e<y，apple 在前）
strcat(a, " pie");
cout << a << '\\n';                   // apple pie
\`\`\`

> **❗ strcmp 返回 0 才是相等**：\`if (strcmp(a,b))\` 为真反而表示“不相等”，这是著名反直觉坑。判等写 \`if (strcmp(a,b)==0)\`。

## 四、字符处理库 cctype

\`#include <cctype>\` 的函数，入参是 char（竞赛高频）：

| 函数 | 为真的条件 | | 函数 | 作用 |
| --- | --- | --- | --- | --- |
| \`isdigit(c)\` | '0'~'9' | | \`tolower(c)\` | 转小写 |
| \`isalpha(c)\` | 字母 | | \`toupper(c)\` | 转大写 |
| \`islower(c)\` | 小写字母 | | | |
| \`isupper(c)\` | 大写字母 | | | |
| \`isspace(c)\` | 空白字符 | | | |

\`\`\`cpp
char c = 'A';
cout << (char)toupper('g') << '\\n';   // G（返回值是 int，输出字符要强转）
if (isdigit(c)) { }
\`\`\`

## 五、手动遍历字符（最重要的能力）

字符串题 90% 是“**循环每个字符 + 判断分类 + 统计/变换**”：

\`\`\`cpp
char s[105];
cin >> s;
int cnt = 0;
for (int i = 0; s[i] != '\\0'; i++) {  // 走到结束符为止
    if (s[i] >= '0' && s[i] <= '9') cnt++;
}
// 或者用长度：
for (int i = 0; i < (int)strlen(s); i++) { ... }
\`\`\`

> **💡 小优化：** \`int len = strlen(s);\` 先存长度再放进循环条件，避免每轮重算 O(n)。
`,
    examples: [
      {
        title: '密码强度检测',
        level: '基础',
        statement: `**题目描述**

输入一个不含空格的密码字符串（长度≤50），统计其中字母、数字、其他字符各有多少个。`,
        samples: [['ab12#$9', '2 3 2']],
        analysis: `### 解题思路

遍历每个字符，用 cctype 的分类函数（或 ASCII 区间）计数。注意一个字符只能落入一类，用 else if 互斥。`,
        code: `#include <iostream>
#include <cctype>
using namespace std;

int main() {
    char s[55];
    cin >> s;

    int letter = 0, digit = 0, other = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (isalpha((unsigned char)c)) letter++;   // 字母
        else if (isdigit((unsigned char)c)) digit++;
        else other++;
    }
    cout << letter << " " << digit << " " << other << '\\n';
    return 0;
}`,
      },
      {
        title: '统一格式：人名规范化',
        level: '基础',
        statement: `**题目描述**

输入一个英文人名（全小写或大小写混乱，不含空格），将其规范化为首字母大写、其余小写并输出。`,
        samples: [['jOhN', 'John']],
        analysis: `### 解题思路

- 第 0 个字符 \`toupper\`；
- 其余字符 \`tolower\`；
- 字符可以像数组元素一样被修改。toupper/tolower 返回 int，赋值回 char 即可。`,
        code: `#include <iostream>
#include <cctype>
using namespace std;

int main() {
    char s[105];
    cin >> s;

    s[0] = (char)toupper((unsigned char)s[0]);      // 首字母大写
    for (int i = 1; s[i] != '\\0'; i++) {
        s[i] = (char)tolower((unsigned char)s[i]);  // 其余小写
    }
    cout << s << '\\n';
    return 0;
}`,
      },
      {
        title: '字符串压缩（统计连续字符）',
        level: '提高',
        statement: `**题目描述**

输入仅含小写字母的字符串，把连续相同字母压缩为“字母+连续次数”，次数为 1 时省略数字。`,
        samples: [['aaabbccccd', 'a3b2c4d']],
        analysis: `### 解题思路

经典“扫描+计数器”：

1. 从第 1 个字符起与前一个比较；
2. 相同则计数 +1，不同就把“上一字母+计数（>1 才输出）”结算并重置；
3. **循环结束后别忘了最后一组**也要结算（最容易漏）。`,
        code: `#include <iostream>
#include <cstring>
using namespace std;

int main() {
    char s[1005];
    cin >> s;

    int cnt = 1;
    for (int i = 1; s[i] != '\\0'; i++) {
        if (s[i] == s[i-1]) {
            cnt++;                          // 与前一个相同，计数
        } else {
            cout << s[i-1];                 // 结算前一组
            if (cnt > 1) cout << cnt;
            cnt = 1;
        }
    }
    cout << s[strlen(s) - 1];               // 结算最后一组
    if (cnt > 1) cout << cnt;
    cout << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**忘记给 \\0 留位置**：字符数组容量 = 最大长度 + 1。`,
      `**strcmp 的真假用反**：相等返回 0；\`if(strcmp(a,b)==0)\` 才是相等。`,
      `**strcpy/strcat 空间不足**：目标数组太小会越界破坏内存。`,
      `**逐字符输入读到空格/换行**：cin>>s 遇空格即止；要整行用 getline，且注意与 cin>> 混用时的残留换行。`,
      `**strlen 写进循环条件**：每轮 O(n) 扫描，整体退化 O(n²)；先 int len=strlen(s)。`,
      `**中文不是 char**：一个汉字占多个字节（UTF-8 三字节），字符题输入都假设是 ASCII。`,
    ],
    exercises: [
      { title: '大小写互换', level: '入门',
        statement: '输入字符串，大写变小写、小写变大写、其他不变后输出。',
        hint: 'isupper→tolower，islower→toupper。' },
      { title: '回文字符串', level: '基础',
        statement: '输入字符串判断是否回文（正读反读相同），输出 yes/no。',
        hint: '双指针 i 从首、j 从尾向中间比，或 s[i] 与 s[len-1-i] 比一半。' },
      { title: '数字字符串转整数', level: '基础',
        statement: '输入一个由数字组成的字符串（长度≤9），不使用 atoi，手动计算它表示的整数。',
        hint: "ans=ans*10+(s[i]-'0')。" },
      { title: '单词中找最长元音段', level: '提高',
        statement: '输入一个单词，输出其中最长的连续元音（aeiou）长度。',
        hint: '扫描，遇元音 cur++ 并更新 mx，非元音 cur=0。' },
      { title: '凯撒解密', level: '提高',
        statement: '密文每个大写字母向后偏移了 k 位（如 k=3，D→A），输入密文和 k 输出明文。',
        hint: "(c-'A'-k+26)%26+'A'，+26 防负数。" },
    ],
    summary: `
- C 风格字符串是 **以 \\0 结尾的 char 数组**，容量 = 长度+1；
- \`strlen/strcmp/strcpy/strcat\` 依赖 \\0；strcmp **返回 0 表相等**；
- cctype 提供 \`isdigit/isalpha/tolower/toupper\` 等分类转换；
- 字符串题核心套路：**逐字符扫描 → 分类判断 → 计数或改写**；连续统计记得循环后收尾。
`,
  };

  T['str-string'] = {
    chapter: '第8章 字符串',
    time: '约 35 分钟',
    body: `
## 一、string：会自动伸缩的字符串

\`std::string\`（头文件 \`<string>\`，万能头已含）是 C++ 提供的字符串类型，**不必关心长度和 \\0**，可以像普通变量一样赋值、拼接、比较，竞赛中绝大多数字符串题直接用 string。

\`\`\`cpp
#include <string>
using namespace std;

string s = "hello";
string t = "world";
string u = s + " " + t;    // 直接用 + 拼接："hello world"
cout << u << '\\n';
\`\`\`

## 二、输入输出

\`\`\`cpp
string s;
cin >> s;                  // 读一个单词（遇空白结束）
getline(cin, s);           // 读一整行（含空格，不含换行）
cout << s;
cout << s[0];              // 同样支持下标访问
\`\`\`

> **❗ getline 坑（复习）：** \`cin >> n\` 后输入缓冲区残留换行，紧跟的 getline 会读到空行。中间加一句 \`cin.ignore();\`，或先 getline 全部用 getline。

## 三、常用操作大全

| 操作 | 含义 | 示例/结果 |
| --- | --- | --- |
| \`s.length()\` / \`s.size()\` | 长度（无符号） | "abc"→3 |
| \`s + t\` / \`s += t\` | 拼接 | s+="x" |
| \`s == t\`、\`s < t\` | 按字典序比较 | 直接用，无需 strcmp |
| \`s[i]\` | 访问第 i 个字符 | 可读可写 |
| \`s.empty()\` | 是否为空 | true/false |
| \`s.substr(p, len)\` | 从 p 取 len 个字符 | s.substr(1,2) |
| \`s.find(x)\` | 查找子串/字符 | 返回首处下标；找不到返回 \`string::npos\` |
| \`s.insert(p, x)\` | 在 p 处插入 | — |
| \`s.erase(p, len)\` | 从 p 删除 len 个 | — |
| \`s.push_back(c)\` | 末尾加字符 | — |
| \`s.replace(p,len,x)\` | 替换 | — |

\`\`\`cpp
string s = "abcdef";
cout << s.substr(2, 3) << '\\n';      // "cde"
cout << s.find("cd") << '\\n';        // 2
cout << (int)s.find('z') << '\\n';    // -1（npos 强转 int）
s.erase(1, 2);                        // 删除 "bc"，s 变成 "adef"
s += "xyz";                           // "adefxyz"
\`\`\`

### find 的标准判断

\`\`\`cpp
if (s.find("abc") != string::npos) {
    cout << "包含 abc";
}
\`\`\`

### 遍历

\`\`\`cpp
for (int i = 0; i < (int)s.size(); i++) cout << s[i];
for (char c : s) cout << c;           // C++11 范围 for，更简洁
\`\`\`

> **⚠️ 无符号坑：** \`s.length()\` 是无符号类型，\`s.length()-1\` 在空串时会变成天文数字；与 int 比较建议先转 \`(int)s.size()\`。

## 四、string 与数字互转

\`\`\`cpp
// 数字 → 字符串
string s = to_string(123);           // "123"

// 字符串 → 数字
int x = stoi("456");                 // 456
long long y = stoll("9000000000");
double z = stod("3.14");
\`\`\`

## 五、字符串与字符数组的选择

| 需求 | 选择 |
| --- | --- |
| 一般字符串题（拼接、查找、截取、比较） | **string** |
| 需要极高频修改单字符、固定短缓冲 | char 数组也可 |
| scanf/printf 配合 | char 数组（或 s.c_str()） |

入门后默认首选 string。
`,
    examples: [
      {
        title: '统计单词数（find 应用）',
        level: '基础',
        statement: `**题目描述**

输入一行英文句子（单词间单空格分隔，无前后空格）和一个单词，输出该单词作为**独立单词**出现的次数。`,
        samples: [['to be or not to be\nto', '2']],
        analysis: `### 解题思路（方法：getline + 构造带空格的关键词）

为避免“tom”匹配到“to”，搜索 \`" 关键词 "\` 并单独检查句首、句尾。

更朴素稳妥的方法（下文代码）：用 cin 读单词计数——把整行拆成单词流，每个单词与目标用 == 直接比较。`,
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string line, target;
    getline(cin, line);      // 第一行整句
    getline(cin, target);    // 第二行目标单词

    int cnt = 0;
    string word;
    for (int i = 0; i <= (int)line.size(); i++) {
        if (i == (int)line.size() || line[i] == ' ') {
            if (word == target) cnt++;   // 一个单词结束，比较
            word = "";                   // 清空开始下一个
        } else {
            word += line[i];             // 逐字符累积成单词
        }
    }
    cout << cnt << '\\n';
    return 0;
}`,
      },
      {
        title: '身份证信息提取（substr）',
        level: '基础',
        statement: `**题目描述**

输入 18 位身份证号字符串：第 7~14 位是出生日期（YYYYMMDD），第 17 位奇数为男、偶数为女。输出 \`年-月-日 性别\`。`,
        samples: [['110101200905201234', '2009-05-20 男']],
        analysis: `### 解题思路

下标从 0 开始，所以出生年月日起点是下标 6：\`substr(6,4)\`、\`substr(10,2)\`、\`substr(12,2)\`；第 17 位对应下标 16。用 \`stoi\` 或直接 \`s[i]-'0'\` 判断奇偶。`,
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;

    string year  = s.substr(6, 4);   // 从下标6取4位
    string month = s.substr(10, 2);
    string day   = s.substr(12, 2);
    int genderBit = s[16] - '0';     // 第17位

    cout << year << "-" << month << "-" << day << " "
         << (genderBit % 2 ? "男" : "女") << '\\n';
    return 0;
}`,
      },
      {
        title: '敏感词替换',
        level: '提高',
        statement: `**题目描述**

输入一段文本（无换行）、敏感词 w、替换词 r，把文本中所有 w（不重叠）替换为 r 后输出。`,
        samples: [['ababab ab XX', 'XXXXXX']],
        analysis: `### 解题思路

循环用 \`find(w, pos)\` 从当前位置向后找：

1. 找到 → \`replace\` 替换，pos 跳过替换内容长度（避免重叠问题）；
2. 找不到（npos）→ 结束。

注意替换后串长会变，要用 find 返回的新位置继续。`,
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s, w, r;
    cin >> s >> w >> r;

    size_t pos = 0;
    while ((pos = s.find(w, pos)) != string::npos) {
        s.replace(pos, w.size(), r);   // 用 r 覆盖 w
        pos += r.size();               // 从替换内容之后继续找
    }
    cout << s << '\\n';
    return 0;
}`,
      },
      {
        title: '大数加法（string 模拟竖式）',
        level: '挑战',
        statement: `**题目描述**

输入两个不超过 1000 位的非负整数（字符串形式），输出它们的和。`,
        samples: [['999999999999999999\n2', '1000000000000000001']],
        analysis: `### 解题思路

long long 装不下 1000 位，用字符串模拟小学竖式：

1. 两串从末位向前，按位相加，维护进位 carry；
2. 当前位 = (两数字+carry)%10，carry = 和/10；
3. 短串缺位按 0 处理；结束后还有进位要补；
4. 结果是逆序生成的，最后 reverse。

这是普及篇高精度算法的预告。`,
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string a, b;
    cin >> a >> b;

    int i = (int)a.size() - 1;
    int j = (int)b.size() - 1;
    int carry = 0;
    string ans;

    while (i >= 0 || j >= 0 || carry) {
        int x = (i >= 0 ? a[i--] - '0' : 0);
        int y = (j >= 0 ? b[j--] - '0' : 0);
        int sum = x + y + carry;
        ans.push_back(char('0' + sum % 10));
        carry = sum / 10;
    }

    reverse(ans.begin(), ans.end());
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**getline 前残留换行**：cin>> 之后先 cin.ignore()。`,
      `**无符号长度参与减法/比较**：\`(int)s.size()\` 转换后再做 i<s.size()-1 这类运算。`,
      `**find 没找到当合法下标用**：必须与 string::npos 比较。`,
      `**substr 参数记反**：substr(起点, 长度)，第二个参数不是终点下标。`,
      `**字符 + 字符/字符串拼接出意外**：\`'a'+1\` 是整数 98；要拼接用 \`s += 'a'\` 或 string("a")。`,
      `**修改 range-for 的副本**：\`for(char c:s) c='x'\` 改不了原串，需要 \`for(char &c:s)\`。`,
    ],
    exercises: [
      { title: '单词翻转', level: '基础',
        statement: '输入一个单词，输出它的逆序字符串。',
        hint: 'reverse(s.begin(),s.end())，或手动双指针交换。' },
      { title: '句子单词数', level: '基础',
        statement: '输入一行英文句子（可能有连续空格、首尾空格），统计单词个数。',
        hint: '用 cin>>word 一直读到 EOF 计数最简单（cin 自动跳多空格）。' },
      { title: '统计各字母频率', level: '基础',
        statement: '输入仅含小写字母的字符串，按 a~z 输出出现过的字母及次数。',
        hint: 'int cnt[26]={0}; cnt[s[i]-"a"]++。' },
      { title: 'IP 地址合法性（简单版）', level: '提高',
        statement: '输入 IPv4 地址（四段点分十进制，每段 0~255），判断格式是否合法（只要求：三个点、每段非空纯数字且范围正确）。',
        hint: '以点分段计数，每段用累加转数字并检查 0~255。' },
      { title: '验证回文（忽略非字母数字）', level: '提高',
        statement: '输入一行字符串，忽略大小写与非字母数字字符后，判断是否回文。',
        hint: '先清洗成只含小写字母数字的新串，再双指针判断。' },
    ],
    summary: `
- **string 是竞赛默认字符串类型**：自动管理内存，支持 \`+\` 拼接、\`== <\` 字典序比较、下标访问；
- 核心操作：\`size/substr/find/insert/erase/replace\`，find 找不到返回 \`string::npos\`；
- 整行输入 getline（先 ignore 残留换行）；数字字符串互转 \`to_string/stoi/stoll\`；
- 超大整数用字符串模拟竖式——高精度算法的入门。
`,
  };

  Object.assign(window.TOPICS, T);
})();
