/* ============================================================
   初赛高频考题精讲 · 第四部分（考级与初赛专题）12 题
   两类：① 阅读程序写输出（可运行）② 常识高频选择/判断
   ============================================================ */
(function () {
  const R = {

  /* ---- grade-gesp：常识选择 ---- */
  'grade-gesp': {
    source: 'CSP / GESP 常识高频考点',
    title: 'GESP 报考规则（自测选择）',
    level: '入门',
    statement: `**题目（单选）**

关于 GESP 的报考规则，下列说法**正确**的是？

- A. 可以直接报考最高的 8 级，不必逐级考
- B. 满分 100 分，60 分及格，需要逐级报考
- C. 竞赛生应主攻图形化编程方向
- D. 只有笔试，没有编程题`,
    analysis: `**答案：B。** GESP 满分 100、60 分及格，需从 1 级逐级报考；
竞赛生应选 **C++ 方向**，考试含客观题与编程题。`,
  },

  /* ---- csp-prelim：常识选择 ---- */
  'csp-prelim': {
    source: 'CSP 初赛高频考点',
    title: '初赛三大题型（自测选择）',
    level: '入门',
    statement: `**题目（单选）**

CSP 初赛试卷的三大题型是？

- A. 填空、编程、画图
- B. 单项选择、阅读程序、完善程序
- C. 听写、默写、背诵
- D. 听力、口语、写作`,
    analysis: `**答案：B。** 初赛满分 100，三大题型：常识**单项选择**、
**阅读程序**（逐行模拟写输出/判断）、**完善程序**（补挖空）。`,
  },

  /* ---- contests-overview：判断 ---- */
  'contests-overview': {
    source: '常识高频考点',
    title: '白名单赛事（判断对错）',
    level: '入门',
    statement: `**题目（判断对错）**

"只要名字里带'奥林匹克'的比赛，都一定是教育部白名单内的权威赛事，无需查主办方。"
这句话对吗？`,
    analysis: `**答案：错误。** 判断活动权威性要看**主办方、是否在教育部白名单、往届认可度**，
不能只看名称；CSP/GESP 由权威的 **CCF** 主办。`,
  },

  /* ---- hardware-history：常识选择 ---- */
  'hardware-history': {
    source: '初赛高频考点',
    title: 'ENIAC 与四代元件（自测选择）',
    level: '基础',
    statement: `**题目（单选）**

世界上第一台通用电子数字计算机 ENIAC，诞生年份与核心元件分别是？

- A. 1936 年，晶体管
- B. 1946 年，电子管
- C. 1956 年，集成电路
- D. 1969 年，大规模集成电路`,
    analysis: `**答案：B。** ENIAC **1946 年**诞生、使用**电子管**。
四代元件顺序：电子管 → 晶体管 → 集成电路 → 大规模集成电路。`,
  },

  /* ---- hardware-components：阅读程序 ---- */
  'hardware-components': {
    source: '初赛"阅读程序"高频题型',
    title: '阅读程序：取一个整数的十位数字',
    level: '基础',
    statement: `**题目：阅读程序，写出输入 1234 时的输出。**

先不要运行，在草稿纸上推断程序的功能与结果。`,
    input: '一个整数 n。',
    output: '程序运行结果。',
    samples: [['1234', '3']],
    analysis: `### 逐行模拟

\`n / 10\` 去掉个位得 123，再 \`% 10\` 取出最后一位即 **3**——
程序功能是取 n 的十位数字。初赛"读程序"就是这样从运算含义推断功能。`,
    code: `#include <iostream>
using namespace std;
int main() {
    int n; cin >> n;
    cout << (n / 10) % 10 << '\\n';
    return 0;
}`,
  },

  /* ---- data-representation：阅读程序（位运算） ---- */
  'data-representation': {
    source: '初赛"阅读程序"高频题型',
    title: '阅读程序：位运算的结果',
    level: '提高',
    statement: `**题目：阅读程序，写出输入 12 10 时的输出。**

\`&\` 是按位与。先把两个数写成二进制再计算。`,
    input: '一行两个整数 a b。',
    output: '两个整数：a&b、a|b。',
    samples: [['12 10', '8 14']],
    analysis: `### 逐行模拟（写二进制）

\`\`\`text
12 = 1100     12 = 1100
10 = 1010     10 = 1010
按位与 1000=8  按位或 1110=14
\`\`\`
位运算是初赛与后续算法（状态压缩）的基础。`,
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b; cin >> a >> b;
    cout << (a & b) << " " << (a | b) << '\\n';
    return 0;
}`,
  },

  /* ---- software-os：常识选择 ---- */
  'software-os': {
    source: '初赛高频考点',
    title: '系统软件与扩展名（自测选择）',
    level: '基础',
    statement: `**题目（单选）**

下列文件中，属于**可执行程序**的是？

- A. report.txt
- B. game.exe
- C. photo.jpg
- D. code.cpp`,
    analysis: `**答案：B。** \`.exe\` 是可执行程序；\`.txt\` 文本、
\`.jpg\` 图片、\`.cpp\` 是 C++ 源代码（编译后才运行）。`,
  },

  /* ---- network-basics：常识选择 ---- */
  'network-basics': {
    source: '初赛高频考点',
    title: '端口与 TCP/UDP（自测选择）',
    level: '基础',
    statement: `**题目（单选）**

浏览网页使用的 HTTP 协议，默认端口号是？

- A. 21
- B. 22
- C. 80
- D. 443`,
    analysis: `**答案：C。** HTTP 端口 **80**、HTTPS 443、FTP 21、SSH 22。
网页要准确可靠，用 **TCP**；视频通话重实时，多用 UDP。`,
  },

  /* ---- web-http：阅读程序（状态码） ---- */
  'web-http': {
    source: '初赛"阅读程序"高频题型',
    title: '阅读程序：状态码分类',
    level: '基础',
    statement: `**题目：阅读程序，写出输入 404 和 200 时的输出。**`,
    input: '一个整数状态码。',
    output: '状态类别。',
    samples: [['404', 'client-error'], ['200', 'ok']],
    analysis: `### 逐行模拟

\`code/100\` 取百位：404 → 4（客户端错误类）、200 → 2（成功类）。
真实含义：**404 找不到资源、200 成功、500 服务器错误**。`,
    code: `#include <iostream>
using namespace std;
int main() {
    int code; cin >> code;
    int cls = code / 100;
    if (cls == 2) cout << "ok";
    else if (cls == 4) cout << "client-error";
    else if (cls == 5) cout << "server-error";
    else cout << "other";
    return 0;
}`,
  },

  /* ---- security-basics：常识选择 ---- */
  'security-basics': {
    source: '初赛高频考点',
    title: '病毒、蠕虫、木马区分（自测选择）',
    level: '基础',
    statement: `**题目（单选）**

"伪装成有用软件、暗中开后门窃取账号密码，但一般不自我复制"描述的是？

- A. 计算机病毒
- B. 蠕虫
- C. 特洛伊木马
- D. 勒索软件`,
    analysis: `**答案：C。** **木马**关键是伪装、窃密、不自我复制；
病毒需要宿主并传染，蠕虫利用网络主动传播，勒索软件加密文件索要赎金。`,
  },

  /* ---- multimedia：阅读程序（位图大小） ---- */
  'multimedia': {
    source: '初赛"阅读程序/计算"高频题型',
    title: '阅读程序：计算位图字节数',
    level: '基础',
    statement: `**题目：阅读程序，写出输入 800 600 时的输出（每像素 3 字节）。**`,
    input: '一行 w h。',
    output: '无压缩位图字节数。',
    samples: [['800 600', '1440000'], ['1920 1080', '6220800']],
    analysis: `### 逐行模拟

字节数 = 宽 × 高 × 3：800×600×3 = 1,440,000。
这解释了为什么照片需要 JPG 等压缩。乘法用 long long。`,
    code: `#include <iostream>
using namespace std;
int main() {
    long long w, h; cin >> w >> h;
    cout << w * h * 3 << '\\n';
    return 0;
}`,
  },

  /* ---- ai-frontier：常识选择 ---- */
  'ai-frontier': {
    source: '常识高频考点',
    title: '人工智能概念（自测选择）',
    level: '基础',
    statement: `**题目（单选）**

当前主流大语言模型（如 ChatGPT）主要基于哪种结构？另外，"人工智能"这一名称正式提出于？

- A. 冒泡排序；1936 年
- B. Transformer；1956 年达特茅斯会议
- C. 关系型数据表；1969 年
- D. 决策树；1946 年`,
    analysis: `**答案：B。** 大语言模型基于 **Transformer**；
"人工智能（AI）"名称在 **1956 年达特茅斯会议**正式提出。模型也会"幻觉"，答案需核实。`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
