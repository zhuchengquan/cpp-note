/* ============================================================
   真题与经典名题精讲 · 第二部分 第二批 10 题（普及篇全覆盖）
   ============================================================ */
(function () {
  const R = {

  /* ---- algo-complexity：成绩 ---- */
  'algo-complexity': {
    source: 'NOIP 2017 普及组 · 洛谷 P3954 成绩',
    title: '成绩（加权平均）',
    level: '入门',
    statement: `**题目描述**

牛牛这学期的作业成绩、小测成绩、期末成绩分别为 A、B、C（0~100）。
总评 = A×20% + B×30% + C×50%，求总评（整数）。`,
    input: '一行三个整数 A B C。',
    output: '一个整数：总评成绩。',
    samples: [['100 100 80', '90'], ['60 90 80', '79']],
    analysis: `### 解题思路

为避免小数，直接用整数：\`(A*2 + B*3 + C*5) / 10\`。
60×2+90×3+80×5 = 120+270+400 = 790，/10 = 79。`,
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << (a*2 + b*3 + c*5) / 10 << '\\n';
    return 0;
}`,
  },

  /* ---- enum-method：统计方形 ---- */
  'enum-method': {
    source: '洛谷 P2241 统计方形（数据加强版）',
    title: '统计方形（枚举正方形 / 长方形）',
    level: '提高',
    statement: `**题目描述**

有一个 n×m 格的棋盘，求：其中正方形格子（子正方形）共有多少个；长方形（矩形中去掉正方形）共有多少个。`,
    input: '一行两个整数 n m。',
    output: '一行两个整数：正方形个数 长方形个数。',
    samples: [['2 3', '8 10'], ['1 1', '1 0']],
    analysis: `### 解题思路（公式枚举）

- 边长为 k 的正方形个数 = (n−k+1)(m−k+1)，枚举 k = 1..min(n,m) 累加；
- 所有矩形数 = \`n(n+1)/2 × m(m+1)/2\`（任选两行线、两列线）；
- 长方形 = 总矩形 − 正方形。
2×3：正方形 1×1 有 6、2×2 有 2，共 8；总矩形 3×6=18，长方形 10。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long n, m; cin >> n >> m;
    long long square = 0;
    for (long long k = 1; k <= min(n, m); k++)
        square += (n-k+1) * (m-k+1);
    long long total = n*(n+1)/2 * (m*(m+1)/2);
    cout << square << " " << total - square << '\\n';
    return 0;
}`,
  },

  /* ---- simulate-method：统计单词数 ---- */
  'simulate-method': {
    source: 'NOIP 2011 普及组 · 洛谷 P1308 统计单词数',
    title: '统计单词数（字符串模拟）',
    level: '提高',
    statement: `**题目描述**

给定一个单词和一行英文文章，求该单词在文章中（**独立单词、不区分大小写**）出现了多少次，
以及第一次出现时首字母的位置（从 0 开始），未出现输出 \`-1\`。`,
    input: '第一行单词；第二行文章。',
    output: '出现次数 + 首次位置，空格隔开。',
    samples: [['To\nto be or not to be', '2 0'], ['Hello\nhello world', '1 0']],
    analysis: `### 解题思路

统一转小写；把"单词"和"文章"都按空格切分后逐个比较，
或在文章两端补空格、查找 " word "。统计次数并记录第一次匹配下标。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string word, line;
    getline(cin, word);
    getline(cin, line);
    for (char &c : word) c = tolower(c);
    for (char &c : line) c = tolower(c);

    word = " " + word + " ";
    line = " " + line + " ";
    int cnt = 0, first = -1;
    size_t p = line.find(word);
    while (p != string::npos) {
        if (cnt == 0) first = (int)p;
        cnt++;
        p = line.find(word, p + 1);
    }
    if (cnt) cout << cnt << " " << first;
    else cout << -1;
    return 0;
}`,
  },

  /* ---- sort-basic：快速排序模板 ---- */
  'sort-basic': {
    source: '洛谷 P1177【模板】快速排序',
    title: '快速排序',
    level: '基础',
    statement: `**题目描述**

给定 n 个整数，将它们从小到大排序后输出。`,
    input: '第一行 n；第二行 n 个整数。',
    output: '一行升序整数。',
    samples: [['5\n4 2 4 1 3', '1 2 3 4 4']],
    analysis: `### 解题思路

手写快速排序：选基准、分区（小于基准放左、大于放右）、递归；
也可直接用 \`sort\`。平均 O(n log n)。`,
    code: `#include <bits/stdc++.h>
using namespace std;
void quickSort(int a[], int l, int r) {
    int i = l, j = r, pivot = a[(l+r)/2];
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) swap(a[i++], a[j--]);
    }
    if (l < j) quickSort(a, l, j);
    if (i < r) quickSort(a, i, r);
}
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int &x : a) cin >> x;
    quickSort(a.data(), 0, n-1);
    for (int i = 0; i < n; i++)
        cout << a[i] << (i+1==n?'\\n':' ');
    return 0;
}`,
  },

  /* ---- bigint：A+B 高精 ---- */
  'bigint': {
    source: '洛谷 P1601 A+B Problem（高精）',
    title: 'A+B Problem（高精度加法）',
    level: '基础',
    statement: `**题目描述**

给出两个非负整数（位数不超过 500），求它们的和。`,
    input: '两行，每行一个非负整数。',
    output: '一行：两数之和。',
    samples: [['1\n999', '1000'], ['123\n456', '579']],
    analysis: `### 解题思路

按字符串读入，从个位对齐，逐位相加并记录进位；
结果最高位的进位要补上，最后去掉前导零。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string a, b; cin >> a >> b;
    reverse(a.begin(), a.end());
    reverse(b.begin(), b.end());
    string res;
    int carry = 0, n = max(a.size(), b.size());
    for (int i = 0; i < n || carry; i++) {
        int sum = carry;
        if (i < (int)a.size()) sum += a[i]-'0';
        if (i < (int)b.size()) sum += b[i]-'0';
        res += char('0' + sum % 10);
        carry = sum / 10;
    }
    reverse(res.begin(), res.end());
    cout << res;
    return 0;
}`,
  },

  /* ---- math-prime：质数筛选 ---- */
  'math-prime': {
    source: '洛谷 P5736【深基7.例3】质数筛选',
    title: '质数筛选（试除法判定）',
    level: '基础',
    statement: `**题目描述**

输入 n 个正整数，把其中的素数原样输出、非素数替换成 0，空格隔开。
注意 **1 不是素数**。`,
    input: '第一行 n；第二行 n 个整数。',
    output: '一行，素数保留、其余为 0。',
    samples: [['6\n1 2 3 4 5 6', '0 2 3 0 5 0']],
    analysis: `### 解题思路

写 \`isPrime(x)\`：x<2 非素数，枚举 2..√x 试除。
逐个数判断，素数保留否则输出 0。`,
    code: `#include <bits/stdc++.h>
using namespace std;
bool isPrime(int x) {
    if (x < 2) return false;
    for (int i = 2; i*i <= x; i++)
        if (x % i == 0) return false;
    return true;
}
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        cout << (isPrime(x) ? x : 0) << (i+1==n?'\\n':' ');
    }
    return 0;
}`,
  },

  /* ---- math-gcd-power：最大公约数与最小公倍数 ---- */
  'math-gcd-power': {
    source: 'NOIP 2001 · 洛谷 P1029 最大公约数和最小公倍数问题',
    title: '最大公约数和最小公倍数问题',
    level: '提高',
    statement: `**题目描述**

输入两个正整数 x0、y0，求满足下列条件的正整数对 (P,Q) 的个数：
P、Q 的最大公约数为 x0，最小公倍数为 y0。`,
    input: '一行 x0 y0。',
    output: '一个整数：数对个数。',
    samples: [['3 60', '4'], ['2 2', '1']],
    analysis: `### 解题思路

必要条件 x0 整除 y0。令 \`t = y0/x0\`，把 t 分解质因数得到 k 种不同质因子，
答案 = **2ᵏ**（每种质因子整体分配给 P 或 Q）。样例 t=20=2²·5，k=2，2²=4。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long x, y; cin >> x >> y;
    if (y % x != 0) { cout << 0; return 0; }
    long long t = y / x;
    int k = 0;                          // 不同质因子个数
    for (long long p = 2; p*p <= t; p++) {
        if (t % p == 0) {
            k++;
            while (t % p == 0) t /= p;
        }
    }
    if (t > 1) k++;
    cout << (1LL << k) << '\\n';
    return 0;
}`,
  },

  /* ---- ds-stack-queue：括号匹配 ---- */
  'ds-stack-queue': {
    source: '洛谷 P1739 表达式括号匹配',
    title: '表达式括号匹配（栈思想）',
    level: '基础',
    statement: `**题目描述**

给定一个表达式（含若干对小括号），判断其中括号是否正确配对，正确输出 \`Yes\`，否则 \`No\`。`,
    input: '一行表达式（以 @ 结束）。',
    output: 'Yes 或 No。',
    samples: [['(a+b)*(c-d)@', 'Yes'], ['(a+b))@', 'No']],
    analysis: `### 解题思路

用计数器模拟栈：遇到 '(' 加 1，遇到 ')' 减 1；
中途变负（右括号先出现）或最后不为 0 都不匹配。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    char c;
    int depth = 0;
    while (cin >> c && c != '@') {
        if (c == '(') depth++;
        if (c == ')') depth--;
        if (depth < 0) break;
    }
    cout << (depth == 0 ? "Yes" : "No");
    return 0;
}`,
  },

  /* ---- tree-basic：新二叉树 ---- */
  'tree-basic': {
    source: '洛谷 P1305 新二叉树',
    title: '新二叉树（先序遍历）',
    level: '基础',
    statement: `**题目描述**

输入一棵二叉树（每个结点给出它的左、右孩子，\`*\` 表示空），输出该树的**先序遍历**。`,
    input: '第一行 n；n 行，每行三个字符：结点 左孩子 右孩子。',
    output: '一行先序序列。',
    samples: [['3\nabc\nb**\nc**', 'abc'], ['2\nab*\nb*c', 'abc']],
    analysis: `### 解题思路

用数组记录每个结点的左右孩子，第一行的结点即根；
先序 DFS：访问根 → 递归左 → 递归右。空孩子 '*' 要跳过；
数组未赋值处是 '\\0'，也必须一并挡下，否则会无限递归。`,
    code: `#include <bits/stdc++.h>
using namespace std;
char lc[128], rc[128];
void preorder(char u) {
    if (u == '*' || u == '\\0') return;
    cout << u;
    preorder(lc[(int)u]);
    preorder(rc[(int)u]);
}
int main() {
    int n; cin >> n;
    char root;
    for (int i = 0; i < n; i++) {
        char u, l, r; cin >> u >> l >> r;
        if (i == 0) root = u;
        lc[(int)u] = l; rc[(int)u] = r;
    }
    preorder(root);
    return 0;
}`,
  },

  /* ---- contest-skills：不高兴的津津 ---- */
  'contest-skills': {
    source: 'NOIP 2004 普及组 · 洛谷 P1085 不高兴的津津',
    title: '不高兴的津津（找最大 · 考前热身）',
    level: '入门',
    statement: `**题目描述**

津津一周 7 天，每天在校学习和上补习班的时间分别为 a、b。若某天两者之和 **大于 8** 就会不高兴。
请输出她最不高兴的是星期几（取总和最大的一天）；若都不超过 8 输出 0。`,
    input: '7 行，每行两个整数。',
    output: '一个整数：星期几（1~7）或 0。',
    samples: [['5 3\n6 2\n7 2\n5 3\n5 4\n0 4\n0 6', '3']],
    analysis: `### 解题思路

逐天求总和，记录第一个（也是最大的）超过 8 的天；
没有任何一天超过 8 输出 0。这类简单题也是对拍/热身的好素材。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int ans = 0, best = 8;
    for (int day = 1; day <= 7; day++) {
        int a, b; cin >> a >> b;
        if (a + b > best) { best = a+b; ans = day; }
    }
    cout << ans;
    return 0;
}`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
