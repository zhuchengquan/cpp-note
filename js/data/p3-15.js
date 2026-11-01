/* ============================================================
   第三部分 · 第12章 字符串与网络流
   string-kmp
   ============================================================ */
(function () {
  const T = {};

  T['string-kmp'] = {
    chapter: '第12章 字符串与网络流',
    time: '约 65 分钟',
    body: `
## 一、字符串哈希

把字符串映射成一个大整数，O(1) 比较子串：

\`\`\`cpp
// 多项式哈希 h(s) = s[0]*P^(n-1) + ... + s[n-1] (mod M)
h[i+1] = (h[i] * P + s[i]) % M;
// 子串 s[l..r]（0基，闭区间）：
hash(l,r) = h[r+1] - h[l] * pwr[r-l+1]  (mod M)
\`\`\`

P 常取 131/911382323，M 取 10⁹+7（或 unsigned long long 自然溢出，即 mod 2⁶⁴）。防冲突可双哈希（两个模数）。

## 二、Trie 字典树

边代表字符，路径代表字符串：插入/查询 O(长度)，适合前缀匹配、异或最值。

\`\`\`cpp
int trie[MAXNODE][26], cnt[MAXNODE], tot = 1;
void insert(const string& s) {
    int p = 1;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[p][c]) trie[p][c] = ++tot;
        p = trie[p][c];
    }
    cnt[p]++;
}
\`\`\`

01-Trie：按二进制位建树，可查与 x 异或最大的数（贪心从高位选相反位）。

## 三、KMP：线性模式匹配

在文本 T 中查找模式 P，朴素 O(nm)，KMP 为 O(n+m)。

核心是 next（失配）数组：\`nxt[i]\` = P[0..i] 最长相等“真前缀/后缀”长度。

\`\`\`cpp
void buildNext(const string& p, vector<int>& nxt) {
    nxt.assign(p.size(), 0);
    for (int i = 1, j = 0; i < (int)p.size(); i++) {
        while (j > 0 && p[i] != p[j]) j = nxt[j-1];
        if (p[i] == p[j]) j++;
        nxt[i] = j;
    }
}
// 匹配：i 走文本，j 走模式；失配 j=nxt[j-1]，j==m 即出现一次
\`\`\`

## 四、Manacher：最长回文子串 O(n)

利用回文对称性维护中心、右边界，避免重复扩展；实现常插入分隔符统一奇偶长度。入门先掌握“中心扩展 O(n²)”，再学线性算法。

## 五、选型

| 需求 | 工具 |
| --- | --- |
| 判断子串相等/出现 | 哈希 |
| 前缀检索、异或最值 | Trie |
| 模式串所有出现位置 | KMP |
| 最长回文子串 | Manacher（或中心扩展） |
| 多模式匹配 | AC 自动机（KMP+Trie，进阶） |
`,
    examples: [
      {
        title: '字符串哈希判等',
        level: '提高',
        statement: `**题目描述**

给出字符串和 q 次询问：两个子串是否相同。n,q≤10⁵。`,
        samples: [['ababa\n3\n1 3 3 5\n1 2 2 3\n1 1 5 5', 'Yes\nNo\nYes']],
        analysis: `### 解题思路

预处理前缀哈希与 P 的幂，每次询问 O(1)。用 unsigned long long 自然溢出写法简洁。`,
        code: `#include <bits/stdc++.h>
using namespace std;
typedef unsigned long long ull;
const ull P = 131;
ull h[100005], pwr[100005];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin >> s;
    int n = s.size();
    pwr[0] = 1;
    for (int i = 0; i < n; i++) {
        h[i+1] = h[i] * P + s[i];
        pwr[i+1] = pwr[i] * P;
    }
    auto getHash = [&](int l, int r) { // 0基闭区间
        return h[r+1] - h[l] * pwr[r-l+1];
    };
    int q; cin >> q;
    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;
        cout << (getHash(l1-1,r1-1) == getHash(l2-1,r2-1) ? "Yes" : "No") << '\\n';
    }
    return 0;
}`,
      },
      {
        title: 'KMP 统计出现次数',
        level: '挑战',
        statement: `**题目描述**

模式串 P 在文本 T 中出现多少次（可重叠）？`,
        samples: [['aa aaa', '2']],
        analysis: `### 解题思路

构建 nxt 后一次扫描，匹配成功后 j=nxt[j-1] 继续，允许重叠计数。`,
        code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string P, T;
    cin >> P >> T;
    int m = P.size();
    vector<int> nxt(m, 0);
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && P[i] != P[j]) j = nxt[j-1];
        if (P[i] == P[j]) j++;
        nxt[i] = j;
    }
    int cnt = 0;
    for (int i = 0, j = 0; i < (int)T.size(); i++) {
        while (j > 0 && T[i] != P[j]) j = nxt[j-1];
        if (T[i] == P[j]) j++;
        if (j == m) {
            cnt++;
            j = nxt[j-1];      // 继续找可重叠的下一次
        }
    }
    cout << cnt << '\\n';
    return 0;
}`,
      },
      {
        title: 'Trie 统计前缀',
        level: '提高',
        statement: `**题目描述**

插入 n 个单词，q 次询问以某字符串为前缀的单词数。`,
        samples: [['3 3\napple app banana\napp\nappl\nbana', `2
1
1`]],
        analysis: `### 解题思路

每个结点额外维护经过该结点的单词数 pass，查询沿前缀走到的结点 pass 即答案。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXNODE = 200005;
int nxtNode[MAXNODE][26], pass[MAXNODE], tot = 1;

void insert(const string& s) {
    int p = 1;
    for (char ch : s) {
        int c = ch - 'a';
        if (!nxtNode[p][c]) nxtNode[p][c] = ++tot;
        p = nxtNode[p][c];
        pass[p]++;
    }
}
int query(const string& s) {
    int p = 1;
    for (char ch : s) {
        int c = ch - 'a';
        if (!nxtNode[p][c]) return 0;
        p = nxtNode[p][c];
    }
    return pass[p];
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    string s;
    while (n--) { cin >> s; insert(s); }
    while (q--) { cin >> s; cout << query(s) << '\\n'; }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**哈希只取单模且关键比赛被针对**：重要题用双哈希。`,
      `**子串哈希幂次写错**：h[r+1]-h[l]*p[r-l+1]。`,
      `**KMP 失配回退用 nxt[j]**：应回退 nxt[j-1]。`,
      `**Trie 结点数组开小**：总长度+1 个结点起步。`,
      `**Manacher 奇偶混写**：插入 # 分隔符统一处理。`,
    ],
    exercises: [
      { title: '最长公共前缀', level: '基础',
        statement: '多次询问两后缀的最长公共前缀长度。',
        hint: '二分长度 + 哈希判等。' },
      { title: '周期串', level: '提高',
        statement: '求字符串的最小周期。',
        hint: 'KMP：n-nxt[n-1]，能整除 n 时为周期。' },
      { title: '01-Trie 最大异或', level: '挑战',
        statement: '给定数组，选一个数使与 x 异或最大。',
        hint: '从高位起优先走与 x 当前位相反的分支。' },
      { title: '最长回文子串', level: '挑战',
        statement: 'O(n) 求最长回文子串。',
        hint: 'Manacher 维护 center/right 边界。' },
    ],
    summary: `
- **字符串哈希** O(1) 比较子串，前缀哈希+幂数组，重要题双模数防冲突；
- **Trie** 按字符建树，适合前缀计数与 01-Trie 异或最值；
- **KMP** 用 nxt（最长相等前后缀）把模式匹配降到 O(n+m)；
- Manacher O(n) 求最长回文；AC 自动机是 KMP 与 Trie 的结合（进阶）。
`,
  };

  Object.assign(window.TOPICS, T);
})();
