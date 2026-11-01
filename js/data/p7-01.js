/* ============================================================
   第七部分 · 第1章 字符串高级
   ac-automaton / suffix-array / suffix-automaton
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- AC 自动机 ---------------- */
  T['ac-automaton'] = {
    chapter: '第1章 字符串高级',
    time: '约 50 分钟',
    body: `
## 一、问题：一次扫描匹配多个模式串

KMP 只能匹配**一个**模式串。若有很多个敏感词（模式串），要在一篇文章中找出它们各自出现的位置，
逐个 KMP 会很慢。**AC 自动机（Aho-Corasick）**把 **Trie（多模式前缀树）与 KMP 的失配思想**结合，
一次扫描完成**多模式匹配**。

## 二、两个核心结构

### 1. Trie
把所有模式串插入一棵前缀树，每条边是一个字符，节点代表一个前缀。

### 2. fail 指针（失配指针）
类似 KMP 的 next：节点 u 的 \`fail[u]\` 指向"**当前前缀的最长真后缀**所对应的 Trie 节点"。
匹配时若当前字符走不通，就沿 fail 回退，而不必从头开始。

\`\`\`text
构建 fail：用 BFS 按层（Trie 上层浅→深）
  根的孩子 fail 指向根；
  对节点 u、字符 c 的孩子 v：
    从 fail[u] 开始找有 c 出边的祖先，令 fail[v] 指向它；找不到则指向根。
\`\`\`

### 常用优化：路径补全（Trie 图）
BFS 时直接补出缺失的转移：若 u 没有 c 孩子，就让它指向 \`fail[u]\` 的 c 孩子，
匹配时**只需一步、不用反复跳 fail**。

## 三、匹配与统计

- 文章从根出发逐字符转移（路径补全后 O(1)）；
- 每到一个节点，它自身以及沿 fail 链上的所有模式串都在此结束；
- 高频做法：匹配时只在节点打标记，最后按 fail 树（BFS 倒序）把子节点计数累加到 fail，
  统计每个模式串出现次数——避免匹配时跳链。

> **⚠️ 坑：** ①fail 必须**按层 BFS**（父节点的 fail 已先算出）；
> ②根节点的失配处理要统一；③多模式计数用 fail 树"下传/上送"更高效。
`,
    examples: [
      {
        title: 'AC 自动机：多模式串出现计数（路径补全）',
        level: '挑战',
        statement: `**题目描述**

给定 n 个模式串和一篇文章，输出每个模式串在文章中出现的次数（允许重叠）。`,
        input: '第一行 n；n 行模式串；一行文章。',
        output: 'n 行：各模式串出现次数。',
        samples: [['2\na\nab\nabab', `2\n2`], ['1\naba\nababa', '2']],
        analysis: `### 解题思路

- 建 Trie，记录每个模式串的结束节点；
- BFS 求 fail 并做路径补全（缺边指向 fail 的孩子）；
- 扫描文章转移、经过节点 +1；
- 按 BFS 序倒序把计数送给 fail 节点；
- 每个模式串答案 = 其结束节点累计值。
"a" 在 abab 中出现 2 次、"ab" 2 次；aba 在 ababa 中重叠出现 2 次。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 200005;
int tr[N][26], fail[N], end_[N], cnt[N], nodeCnt;
vector<int> failTree[N], bfsOrder;

void insert(const string& s, int id) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!tr[u][c]) tr[u][c] = ++nodeCnt;
        u = tr[u][c];
    }
    end_[id] = u;
}
void build() {
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (tr[0][c]) q.push(tr[0][c]);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        bfsOrder.push_back(u);
        for (int c = 0; c < 26; c++) {
            int v = tr[u][c];
            if (v) { fail[v] = tr[fail[u]][c]; q.push(v); }
            else tr[u][c] = tr[fail[u]][c];      // 路径补全
        }
    }
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    vector<string> pat(n);
    for (int i = 0; i < n; i++) { cin >> pat[i]; insert(pat[i], i); }
    build();

    string text; cin >> text;
    int u = 0;
    for (char ch : text) {
        u = tr[u][ch - 'a'];
        cnt[u]++;
    }
    for (int i = bfsOrder.size() - 1; i >= 0; i--)
        cnt[fail[bfsOrder[i]]] += cnt[bfsOrder[i]];
    for (int i = 0; i < n; i++)
        cout << cnt[end_[i]] << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**fail 不按层 BFS**：必须父层先确定，子节点才能沿之求 fail。`,
      `**匹配时反复跳 fail 计数**：用路径补全 + fail 树倒序累加更快。`,
      `**根节点失配未统一**：根的孩子 fail 应指向根。`,
      `**漏做路径补全**：缺边不补，匹配要写 while 跳 fail，易出错。`,
    ],
    exercises: [
      { title: '敏感词过滤', level: '挑战',
        statement: '用 AC 自动机找出文章中所有敏感词出现位置并替换。',
        hint: '匹配到结束节点即命中。' },
    ],
    summary: `
AC 自动机 = **Trie + KMP 失配思想**，一次扫描完成多模式匹配。BFS 求 fail（最长真后缀节点），
常用**路径补全**把缺失转移直接指向 fail 的孩子使匹配 O(1)。计数按 BFS 倒序沿 fail 树上送。
`,
  };

  /* ---------------- 后缀数组 ---------------- */
  T['suffix-array'] = {
    chapter: '第1章 字符串高级',
    time: '约 50 分钟',
    body: `
## 一、什么是后缀数组

一个长度 n 的字符串有 n 个**后缀**（从每个位置开始到末尾）。**后缀数组 SA**：把所有后缀按字典序排序，
\`sa[i]\` 表示排第 i 的后缀的起始位置；与之对应的 \`rank[i]\` 是后缀 i 的名次（sa 与 rank 互逆）。

\`\`\`text
"banana" 的后缀排序后：
5:a  3:ana  1:anana  0:banana  4:na  2:nana
sa = [5,3,1,0,4,2]
\`\`\`

## 二、倍增法 + 基数排序（O(n log n)）

直接比较后缀是 O(n² log n)。倍增思想：

1. 初始每个位置按"单字符"排名；
2. 已知每个后缀按**前 2ᵏ 个字符**的排名后，后缀 i 的下一轮排序关键字为
   **(rank[i], rank[i+2ᵏ])** 二元组（第二关键字越界取 0）；
3. 对二元组做**双关键字基数排序**（O(n)）得到新排名；
4. 翻倍 k 重复，直到所有排名互不相同。

配合**基数排序（计数排序）**而非 sort，整体 O(n log n)。

## 三、height 数组与 LCP

\`height[i] = 后缀 sa[i] 与 sa[i−1] 的最长公共前缀（LCP）长度\`。
重要性质：\`height[rank[i]] ≥ height[rank[i−1]]−1\`，可 O(n) 求出。
用途：两后缀 LCP、不同子串个数 = \`n(n+1)/2 − Σheight\`、重复子串问题。

> **💡 何时用 SA：** 子串/后缀的字典序、LCP、不同子串计数、最长重复子串等。
> 相比 SAM，SA 概念直观、数组实现，是字符串题的常用工具。

> **⚠️ 坑：** ①第二关键字越界要当最小(0)；②基数排序要稳定、下标别越界；
> ③height 用性质递推，不要两两比较（否则退化）。
`,
    examples: [
      {
        title: '后缀数组：求不同子串个数',
        level: '挑战',
        statement: `**题目描述**

给定字符串，求它**本质不同的子串**一共有多少个。`,
        input: '一行字符串（小写字母）。',
        output: '一个整数：不同子串数。',
        samples: [['aab', '5'], ['aaa', '3']],
        analysis: `### 解题思路

- 倍增 + 基数排序求 sa、rank；
- 用性质求 height；
- 所有子串 n(n+1)/2 个，按后缀依次加入时只有 \`n−sa[i]−height[i]\` 个是新的，
  答案 = \`n(n+1)/2 − Σheight\`。
"aab" 子串共 6 个，重复 1 个（"a" 出现两次）→ 5。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
int sa[N], rank_[N], tmp[N], height[N], n;

void buildSA(const string& s) {
    for (int i = 0; i < n; i++) { sa[i] = i; rank_[i] = (unsigned char)s[i]; }
    for (int k = 1; k < n; k <<= 1) {
        auto cmp = [&](int a, int b) {
            if (rank_[a] != rank_[b]) return rank_[a] < rank_[b];
            int ra = (a+k<n)?rank_[a+k]:-1;
            int rb = (b+k<n)?rank_[b+k]:-1;
            return ra < rb;
        };
        sort(sa, sa+n, cmp);          // 教学版用 sort，O(n log²n)；竞赛换基数排序 O(n log n)
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++)
            tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1],sa[i])?1:0);
        for (int i = 0; i < n; i++) rank_[i] = tmp[i];
        if (rank_[sa[n-1]] == n-1) break;
    }
}
void buildHeight(const string& s) {
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank_[i] > 0) {
            int j = sa[rank_[i]-1];
            while (i+h<n && j+h<n && s[i+h]==s[j+h]) h++;
            height[rank_[i]] = h;
            if (h) h--;
    }   }
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin >> s;
    n = s.size();
    buildSA(s);
    buildHeight(s);
    long long total = 1LL*n*(n+1)/2;
    for (int i = 1; i < n; i++) total -= height[i];
    cout << total << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**第二关键字越界未当最小**：i+k≥n 时应取比所有排名小的值。`,
      `**height 两两比较**：要用 height[rank[i]]≥height[rank[i−1]]−1 的性质 O(n) 求。`,
      `**教学版 sort 复杂度**：示例 sort 为 O(n log²n)，大数据须基数排序。`,
    ],
    exercises: [
      { title: '最长重复子串', level: '提高',
        statement: '用 height 数组最大值求至少出现两次的最长子串长度。',
        hint: '答案即 max(height)。' },
      { title: '两后缀 LCP', level: '挑战',
        statement: '多次询问两后缀的 LCP，用 height + RMQ 回答。',
        hint: 'LCP = min(height) 区间，ST表维护。' },
    ],
    summary: `
后缀数组 SA 把所有后缀按字典序排序（sa/rank 互逆）。**倍增法**用 (rank[i],rank[i+2ᵏ]) 二元组逐轮翻倍，
配合基数排序 O(n log n)。**height** 是相邻后缀的 LCP，可 O(n) 求，用于不同子串个数（n(n+1)/2−Σheight）、LCP、重复子串。
`,
  };

  /* ---------------- 后缀自动机 ---------------- */
  T['suffix-automaton'] = {
    chapter: '第1章 字符串高级',
    time: '约 50 分钟',
    body: `
## 一、思想：用等价类压缩所有子串

字符串的子串数量是 O(n²)，但很多子串"出现的位置集合"性质相同。**后缀自动机（SAM）**按
**endpos（结束位置集合）**把所有子串划分为等价类：两个子串若 endpos 相同就归为一个**状态**。
SAM 用 O(n) 个状态和转移，紧凑地表示了字符串的**所有子串**。

## 二、状态的三个要素

每个状态 v 有：

- \`len[v]\`：该状态代表的子串中最长长度；
- \`link[v]\`（后缀链接）：指向"更短、endpos 严格更大"的状态；
- \`next[v][c]\`：读入字符 c 的转移。

同一状态代表长度在 **(len[link[v]], len[v]]** 区间内的一组 endpos 相同的子串。

## 三、扩展（逐个加字符）

\`\`\`text
extend(c):
  新建 cur，len[cur]=len[last]+1；
  从 last 沿 link 走，没有 c 转移就都指向 cur；
  若找到状态 p 有 c 转移到 q：
    若 len[p]+1==len[q]，link[cur]=q；
    否则**克隆 clone**（复制 q 的转移/link，len=len[p]+1），
      把 q 与 cur 的 link 指向 clone，并沿 p 把指向 q 的 c 转移改向 clone；
  last=cur。
\`\`\`

**克隆**是 SAM 的关键：当 q 中混有长度更短、endpos 不同的子串时，把它们分裂到 clone。

## 四、典型应用

- 本质不同子串数 = \`Σ (len[v]−len[link[v]])\`；
- 每个状态子串出现次数：建新点 +1、克隆 +0，按 len 倒序沿 link 累加；
- 子串是否存在、多串公共子串（广义 SAM）。

> **💡 SAM vs SA：** SAM 以"自动机/状态"视角，处理出现次数、在线追加尤其优雅；
> SA 以"排序"视角。两者常可互换，按题与熟悉度选择。

> **⚠️ 坑：** ①状态数最多 **2n−1**，数组按 2 倍开；
> ②克隆要**复制转移和 link**、只改 len；③统计次数时克隆初始为 0。
`,
    examples: [
      {
        title: 'SAM：本质不同子串数',
        level: '挑战',
        statement: `**题目描述**

用后缀自动机求字符串本质不同子串个数。`,
        input: '一行字符串。',
        output: '一个整数。',
        samples: [['aab', '5'], ['aaa', '3']],
        analysis: `### 解题思路

逐字符 extend（含克隆分裂），最后
\`answer = Σ(len[v] − len[link[v]])\`（每个状态贡献其代表的不同子串数）。
与后缀数组方法结果一致。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 200005;
int len_[N], link_[N], nxt[N][26], sz, last;

void init() {
    sz = 1; last = 0; link_[0] = -1;
}
void extend(int c) {
    int cur = sz++;
    len_[cur] = len_[last] + 1;
    int p = last;
    while (p != -1 && !nxt[p][c]) { nxt[p][c] = cur; p = link_[p]; }
    if (p == -1) link_[cur] = 0;
    else {
        int q = nxt[p][c];
        if (len_[p]+1 == len_[q]) link_[cur] = q;
        else {
            int clone = sz++;
            len_[clone] = len_[p]+1;
            link_[clone] = link_[q];
            memcpy(nxt[clone], nxt[q], sizeof(nxt[q]));
            while (p != -1 && nxt[p][c] == q) { nxt[p][c] = clone; p = link_[p]; }
            link_[q] = link_[cur] = clone;
        }
    }
    last = cur;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin >> s;
    init();
    for (char ch : s) extend(ch - 'a');

    long long ans = 0;
    for (int v = 1; v < sz; v++)
        ans += len_[v] - len_[link_[v]];
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**状态数组只开 n**：SAM 最多 2n−1 状态，按 2 倍开。`,
      `**克隆忘记复制转移**：clone 要复制 q 的全部 next 与 link，仅 len 改。`,
      `**统计次数克隆算 1**：只有新建 cur 初始 +1，clone 为 0。`,
      `**link[根] 未设 -1**：根的后缀链接用 -1 作哨兵。`,
    ],
    exercises: [
      { title: '子串出现次数', level: '挑战',
        statement: '求每个状态对应子串在串中的出现次数。',
        hint: 'cur +1、按 len 倒序沿 link 累加。' },
      { title: '多串最长公共子串', level: '挑战',
        statement: '用 SAM 求多个字符串的最长公共子串。',
        hint: '在第一个串 SAM 上跑其余串并更新匹配。' },
    ],
    summary: `
后缀自动机按 **endpos 等价类**用 O(n) 状态表示所有子串，状态含 len/link/next。
extend 沿 link 补转移，遇到长度不匹配时**克隆分裂**；状态数 ≤2n−1。
不同子串数 = Σ(len[v]−len[link[v]])，出现次数按 len 倒序沿 link 累加。
`,
  };

  Object.assign(window.TOPICS, T);
})();
