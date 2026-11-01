/* ============================================================
   第二部分 · 第5章 高精度计算
   bigint
   ============================================================ */
(function () {
  const T = {};

  T['bigint'] = {
    chapter: '第5章 高精度计算',
    time: '约 60 分钟',
    body: `
## 一、为什么需要高精度？

\`long long\` 最多存约 19 位十进制数（9.2×10¹⁸）。当题目出现：

- 100 位整数求和 / 阶乘 / 幂；
- 答案可能有几百位；

任何内置类型都装不下。思路：**用数组模拟竖式计算**——就像小学草稿本一样，一位一位地算、处理进位。

## 二、存储方式：个位放在下标 0（逆序存储）

\`\`\`cpp
vector<int> a;
string s;
cin >> s;                       // 输入 "1234"
for (int i = s.size() - 1; i >= 0; i--)
    a.push_back(s[i] - '0');    // 低位在前：a = [4,3,2,1]
\`\`\`

为什么逆序？

1. 加减法从个位开始，下标 0 正好是个位；
2. 进位/位数增加时直接 push_back，不用整体移动。

输出时倒着遍历即可。

## 三、高精度加法

逐位相加：\`本位 = (a[i]+b[i]+进位) % 10\`，\`新进位 = 和 / 10\`。

\`\`\`cpp
vector<int> add(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    int carry = 0;
    for (int i = 0; i < (int)max(a.size(), b.size()) || carry; i++) {
        int x = carry;
        if (i < (int)a.size()) x += a[i];
        if (i < (int)b.size()) x += b[i];
        c.push_back(x % 10);
        carry = x / 10;
    }
    return c;
}
\`\`\`

循环条件里的 \`|| carry\` 保证最高位的进位也被加入（999+1 → 四位）。

## 四、高精度减法（默认 a ≥ b，非负）

\`\`\`cpp
vector<int> sub(vector<int> a, const vector<int>& b) {
    vector<int> c;
    for (int i = 0; i < (int)a.size(); i++) {
        int x = a[i] - (i < (int)b.size() ? b[i] : 0);
        if (x < 0) { x += 10; a[i+1]--; }   // 借位
        c.push_back(x);
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back(); // 去前导零
    return c;
}
\`\`\`

通用做法：先比较大小，若 a<b 则交换并记录负号。比较规则：位数多的大；位数相同从高位逐位比。

## 五、高精度乘法

### 乘一个普通整数（b ≤ 10⁹，常用）

\`\`\`cpp
vector<int> mulSmall(const vector<int>& a, long long b) {
    vector<int> c;
    long long carry = 0;
    for (int i = 0; i < (int)a.size() || carry; i++) {
        if (i < (int)a.size()) carry += 1LL * a[i] * b;
        c.push_back(carry % 10);
        carry /= 10;
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back();
    return c;
}
\`\`\`

### 高精度 × 高精度

竖式中 a[i]×b[j] 累加到结果的第 i+j 位，最后统一进位：

\`\`\`cpp
vector<int> mulBig(const vector<int>& a, const vector<int>& b) {
    vector<int> c(a.size() + b.size(), 0);
    for (int i = 0; i < (int)a.size(); i++)
        for (int j = 0; j < (int)b.size(); j++)
            c[i+j] += a[i] * b[j];
    for (int i = 0; i + 1 < (int)c.size(); i++) {
        c[i+1] += c[i] / 10;
        c[i] %= 10;
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back();
    return c;
}
\`\`\`

## 六、高精度除以普通整数（求商和余数）

从高位开始除（与加减相反），商的前导零要去掉：

\`\`\`cpp
vector<int> divSmall(const vector<int>& a, long long b, long long& rem) {
    vector<int> q;
    rem = 0;
    for (int i = a.size() - 1; i >= 0; i--) {   // 从高位起
        rem = rem * 10 + a[i];
        q.push_back(rem / b);
        rem %= b;
    }
    reverse(q.begin(), q.end());                // 统一成低位在前
    while (q.size() > 1 && q.back() == 0) q.pop_back();
    return q;
}
\`\`\`

## 七、解题套路总结

1. 读字符串 → 逆序转数字数组；
2. 按运算选模板；
3. 统一处理**前导零**（乘法/减法）和**最高位进位**（加法）；
4. 逆序输出。

提高篇学完封装后也可写一个 BigInteger 类，但竞赛中函数模板更快。
`,
    examples: [
      {
        title: 'A+B Problem（超大整数版）',
        level: '基础',
        statement: `**题目描述**

输入两个不超过 1000 位的非负整数，输出它们的和。`,
        samples: [['99999999999999999999\n1', '100000000000000000000']],
        analysis: `### 解题思路

高精度入门模板题：字符串读入、逆序存数组、逐位相加带进位、倒序输出。`,
        code: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string sa, sb;
    cin >> sa >> sb;

    vector<int> a, b;
    for (int i = sa.size() - 1; i >= 0; i--) a.push_back(sa[i] - '0');
    for (int i = sb.size() - 1; i >= 0; i--) b.push_back(sb[i] - '0');

    vector<int> c;
    int carry = 0;
    for (int i = 0; i < (int)max(a.size(), b.size()) || carry; i++) {
        int x = carry;
        if (i < (int)a.size()) x += a[i];
        if (i < (int)b.size()) x += b[i];
        c.push_back(x % 10);
        carry = x / 10;
    }

    for (int i = c.size() - 1; i >= 0; i--) cout << c[i];
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '大整数阶乘',
        level: '提高',
        statement: `**题目描述**

输入 n（n≤1000），输出 n! 的精确值（可能有 2500 多位）。`,
        samples: [['20', '2432902008176640000']],
        analysis: `### 解题思路

用高精度数组维护当前阶乘值，依次乘以 1、2、…、n（高精 × 小整）。

注意 n=1000 时结果 2568 位，vector 自动扩容毫无压力。`,
        code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> a(1, 1);          // 阶乘初值 1（低位在前）
    for (int k = 2; k <= n; k++) {
        long long carry = 0;
        for (int i = 0; i < (int)a.size(); i++) {
            carry += 1LL * a[i] * k;
            a[i] = carry % 10;
            carry /= 10;
        }
        while (carry) {           // 处理剩余进位（可能多位）
            a.push_back(carry % 10);
            carry /= 10;
        }
    }

    for (int i = a.size() - 1; i >= 0; i--) cout << a[i];
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '大整数减法（含负数情况）',
        level: '提高',
        statement: `**题目描述**

输入两个不超过 1000 位的非负整数 a、b，输出 a-b 的精确结果（可能为负）。`,
        samples: [['1000\n999', '1'], ['123\n456', '-333']],
        analysis: `### 解题思路

1. 先比较两数大小（位数 → 高位逐位）；
2. 小数减大数时交换并标记负号；
3. 逐位相减处理借位，去掉结果的前导零。`,
        code: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

// 比较数字字符串大小：a>b 返回 1，相等 0，a<b 返回 -1
int cmpNum(const string& a, const string& b) {
    if (a.size() != b.size()) return a.size() > b.size() ? 1 : -1;
    if (a == b) return 0;
    return a > b ? 1 : -1;
}

int main() {
    string sa, sb;
    cin >> sa >> sb;

    bool neg = false;
    if (cmpNum(sa, sb) < 0) { swap(sa, sb); neg = true; }

    vector<int> a, b;
    for (int i = sa.size() - 1; i >= 0; i--) a.push_back(sa[i] - '0');
    for (int i = sb.size() - 1; i >= 0; i--) b.push_back(sb[i] - '0');

    vector<int> c;
    for (int i = 0; i < (int)a.size(); i++) {
        int x = a[i] - (i < (int)b.size() ? b[i] : 0);
        if (x < 0) { x += 10; a[i+1]--; }   // 借位
        c.push_back(x);
    }
    while (c.size() > 1 && c.back() == 0) c.pop_back();

    if (neg && !(c.size() == 1 && c[0] == 0)) cout << '-';
    for (int i = c.size() - 1; i >= 0; i--) cout << c[i];
    cout << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**忘记处理最高位进位**：加法循环条件要写成 \`i<maxLen || carry\`。`,
      `**乘法不统一处理进位**：高精×高精时先把所有乘积累加，再从低位向高位统一进位，不要边乘边进（容易漏）。`,
      `**前导零没删**：减法和乘法结果高位可能有一串 0，输出前要 pop_back 到只剩一位。`,
      `**小整数乘数用 int**：\`a[i]*b\` 中 a[i]、b 都可能接近 10⁹，必须 1LL 或让 b 是 long long。`,
      `**除法方向搞反**：加减乘从低位算，唯独除法从高位算起，商最后再 reverse。`,
      `**0 的特殊情况**：两数相等相减应输出 0 而不是空串，去前导零时保留一位。`,
    ],
    exercises: [
      { title: '高精加+高精减综合', level: '基础',
        statement: '读入两个大整数和一个运算符（+ 或 -），输出精确结果。',
        hint: '复用加法模板；减法先比大小定符号。' },
      { title: '大整数乘普通整数', level: '基础',
        statement: '输入 500 位大整数和一个 int 整数 b（2≤b≤99999），输出乘积。',
        hint: '高精×小整模板，carry 用 long long。' },
      { title: '大整数除以 13', level: '提高',
        statement: '输入 500 位非负整数，输出它除以 13 的商和余数，分两行。',
        hint: '高精除小整模板，从高位扫，rem=rem*10+a[i]。' },
      { title: '2 的 n 次幂', level: '提高',
        statement: '输入 n（n≤2000），输出 2ⁿ 的精确值。',
        hint: '初值 1，循环 n 次乘 2；或直接大整数加自己。' },
    ],
    summary: `
- 内置整数最大约 19 位，再大就要**数组/vector 逆序存数字**模拟竖式；
- 加减乘从低位起：加法记进位、减法记借位、乘法先累加 i+j 位再统一进位；除法从高位起；
- 三大收尾：最高位进位、前导零、0 本身；
- 阶乘、幂、超大四则运算是高频考题，模板要能闭眼默写。
`,
  };

  Object.assign(window.TOPICS, T);
})();
