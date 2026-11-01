/* ============================================================
   第三部分 · 第9章 动态规划进阶
   dp-bitmask / dp-digit
   ============================================================ */
(function () {
  const T = {};

  T['dp-bitmask'] = {
    chapter: '第9章 动态规划进阶',
    time: '约 55 分钟',
    body: `
## 一、把集合压成整数

n≤20 时，可用一个 n 位二进制数表示“哪些元素已被使用/选择”：

- 第 i 位为 1：元素 i 在集合中；
- 集合大小最多 2ⁿ：n=20 约 100 万，n=21 翻倍到 200 万。

位操作速查：

\`\`\`cpp
if (s & (1 << i))      // 元素 i 是否在集合中
s | (1 << i)           // 加入 i
s & ~(1 << i)          // 删除 i
s ^ (1 << i)           // 翻转 i
__builtin_popcount(s)  // 集合元素个数
\`\`\`

## 二、状压 DP 一般形式

\`f[state]\`（可再加维度）表示处理到 state 这个集合时的最优值/方案数，转移：枚举下一个选哪个元素。

### 经典：旅行商 TSP

f[S][i]：访问过的点集为 S、当前在 i 的最短路径：

\`\`\`cpp
f[1][0] = 0;
for (int S = 1; S < (1<<n); S++)
    for (int i = 0; i < n; i++) {
        if (!(S & (1<<i))) continue;
        for (int j = 0; j < n; j++)
            if (!(S & (1<<j)))
                f[S|(1<<j)][j] = min(f[S|(1<<j)][j], f[S][i] + g[i][j]);
    }
\`\`\`

复杂度 O(n²2ⁿ)，n≤16 左右舒适。

## 三、排列枚举式状压

f[S]：把集合 S 中的数排成序列的代价/方案数（如互不侵犯的国王、棋盘放棋子按行压缩）。

## 四、典型棋盘题

把一行的棋子摆放压成二进制状态：

- 先预处理所有“合法行状态”（相邻不能同时放等）；
- 行间兼容性：(s₁ & s₂)==0，再按题附加条件；
- f[row][s]：第 row 行状态为 s 的最优。

状压是“小 n 大组合”的通用武器。
`,
    examples: [
      {
        title: '最短哈密顿路径（TSP）',
        level: '挑战',
        statement: `**题目描述**

n 个城市（n≤16）完全图，从 0 出发经过每城恰一次，求最短总路程。`,
        samples: [['4\n0 1 2 3\n1 0 4 5\n2 4 0 6\n3 5 6 0', '11']],
        analysis: `### 解题思路

f[S][i] 标准状压。INF 初始化，起点 f[1][0]=0。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int INF = 1e9;
int g[20][20], f[1<<16][16];
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> g[i][j];

    for (int S = 0; S < (1<<n); S++)
        fill(f[S], f[S]+n, INF);
    f[1][0] = 0;

    for (int S = 1; S < (1<<n); S++)
        for (int i = 0; i < n; i++) {
            if (!(S & (1<<i))) continue;
            for (int j = 0; j < n; j++) {
                if (S & (1<<j)) continue;
                int ns = S | (1<<j);
                f[ns][j] = min(f[ns][j], f[S][i] + g[i][j]);
            }
        }
    int full = (1<<n) - 1, ans = INF;
    for (int i = 1; i < n; i++) ans = min(ans, f[full][i]);
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '棋盘放国王',
        level: '挑战',
        statement: `**题目描述**

n×n 棋盘放 k 个国王，国王攻击周围 8 格，求方案数。n≤10。`,
        samples: [['3 2', '16'], ['1 1', '1']],
        analysis: `### 解题思路

枚举合法行状态（无相邻 1），行间兼容：上下、斜向都不相邻。f[row][state][count]。`,
        code: `#include <bits/stdc++.h>
using namespace std;
long long f[11][1<<10][110];
int cnt[1<<10];
bool legalSelf[1<<10];
int main() {
    int n, k; cin >> n >> k;
    vector<int> states;
    for (int s = 0; s < (1<<n); s++) {
        cnt[s] = __builtin_popcount(s);
        if ((s & (s << 1)) == 0) { states.push_back(s); legalSelf[s]=true; }
    }
    f[0][0][0] = 1;
    for (int row = 1; row <= n; row++) {
        for (int s : states) {
            for (int t : states) {
                if (s & t) continue;
                if (s & (t << 1)) continue;
                if (s & (t >> 1)) continue;
                for (int c = cnt[s]; c <= k; c++)
                    f[row][s][c] += f[row-1][t][c-cnt[s]];
            }
        }
    }
    long long ans = 0;
    for (int s : states) ans += f[n][s][k];
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**n 太大强行状压**：2²⁰≈10⁶ 是舒适上限，再大考虑别的 DP。`,
      `**1<<i 溢出**：i≥31 用 1LL<<i。`,
      `**漏初始化不可达状态**：f 全置 INF，只有合法起点为 0。`,
      `**行状态兼容条件漏斜向**：要检查 s&t、s&(t<<1)、s&(t>>1)。`,
    ],
    exercises: [
      { title: '子集和方案数', level: '提高',
        statement: 'n 个数和为 S 的子集有多少个（n≤20）。',
        hint: '枚举子集求和，或 meet-in-the-middle。' },
      { title: '互不侵犯（简化版）', level: '挑战',
        statement: '只考虑同一行不相邻，n 个位置的放置方案总数。',
        hint: '统计无相邻 1 的 n 位二进制数。' },
      { title: '涂色冲突', level: '挑战',
        statement: 'n 个任务分配给 n 个人，给出冲突矩阵，求合法分配数。',
        hint: 'f[col][usedSet] 逐列安排。' },
    ],
    summary: `
- 用二进制位集合表示“已选元素”，n≤20 时 2ⁿ 状态可承受；
- 核心：f[state]（可带位置/计数维度），枚举“下一个加入谁”转移；
- TSP：f[S][i] 已访问集合 S 当前在 i，O(n²2ⁿ)；
- 棋盘问题：预处理合法行状态 + 行间兼容性（含斜向）。
`,
  };

  T['dp-digit'] = {
    chapter: '第9章 动态规划进阶',
    time: '约 50 分钟',
    body: `
## 一、数位 DP 解决什么问题

统计区间 [L,R] 中满足某种“按位条件”的整数个数：不含数字 4、相邻位限制、数字和整除 k、数码 1 出现次数等。

套路：\`ans(R) - ans(L-1)\`，其中 ans(x) 统计 [0,x] 的答案。

## 二、记忆化搜索模板（推荐）

按十进制位从高到低 DFS，关键两参数：

- \`pos\`：当前第几位；
- \`tight\`：前缀是否仍与上界相同（为真时本位最多填 bound[pos]，否则 0~9）；
- 按题目再加状态：前一位数字、数字和、是否已出现非零（前导零）等。

\`\`\`cpp
int digit[20], len;
long long memo[20][2][/*题目状态*/];

long long dfs(int pos, bool tight, /*状态*/, bool leading) {
    if (pos == len) return 1;                 // 构造出一个合法数
    if (!tight && memo[pos][...] != -1) return memo[pos][...];
    int up = tight ? digit[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= up; d++) {
        // 合法性判断（如禁止 4、相邻关系）
        res += dfs(pos+1, tight && d==up, /*新状态*/, leading && d==0);
    }
    if (!tight) memo[pos][...] = res;
    return res;
}
\`\`\`

记忆化只在 tight=false 时使用：贴边路径唯一，没有复用价值。

## 三、前导零的处理

数 5 写作 0005 时前面的 0 不是真实数码。用 leading 标记“前面是否全是 0”：

- leading 且本位仍填 0：继续保持；
- 涉及“前一位数码”的限制（如不能有 69）只对真实位生效。

## 四、常见题眼

- 不含某数码：循环跳过；
- 相邻位约束：状态保存 pre；
- 数字和/模值：状态带 sum、remain（取模问题 k 一般不大）；
- 出现次数统计：记忆化返回“个数+总数码数”二元结果。
`,
    examples: [
      {
        title: '不含 4 的数',
        level: '提高',
        statement: `**题目描述**

统计 [1,R] 中十进制不含数码 4 的整数个数。R≤10⁹。`,
        samples: [['20', '18']],
        analysis: `### 解题思路

数位 DP 入门：逐位填数，跳过 4。本题不需要额外状态，核心是 tight 与前导零。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int dig[15], len;
long long memo[15][2];

long long dfs(int pos, bool tight, bool leading) {
    if (pos == len) return leading ? 0 : 1;   // 0 本身不计入 [1,R]
    if (!tight && memo[pos][leading] != -1)
        return memo[pos][leading];
    int up = tight ? dig[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= up; d++) {
        if (d == 4) continue;
        res += dfs(pos+1, tight && d==up, leading && d==0);
    }
    if (!tight) memo[pos][leading] = res;
    return res;
}
long long solve(long long x) {
    if (x <= 0) return 0;
    len = 0;
    while (x) { dig[len++] = x % 10; x /= 10; }
    reverse(dig, dig+len);
    memset(memo, -1, sizeof(memo));
    return dfs(0, true, true);
}
int main() {
    long long R; cin >> R;
    cout << solve(R) << '\\n';
    return 0;
}`,
      },
      {
        title: '数字和为 s 的数',
        level: '挑战',
        statement: `**题目描述**

统计 [L,R] 中各位数字之和等于 S 的数个数。R≤10¹⁸，S≤162。`,
        samples: [['1 20 5', '2']],
        analysis: `### 解题思路

状态加“剩余/已用数字和”。差分区间。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int dig[20], len, need;
long long memo[20][200][2];

long long dfs(int pos, int sum, bool tight, bool leading) {
    if (sum > need) return 0;
    if (pos == len) return (!leading && sum == need) ? 1 : 0;
    if (!tight && memo[pos][sum][leading] != -1)
        return memo[pos][sum][leading];
    int up = tight ? dig[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= up; d++)
        res += dfs(pos+1, sum + (leading && d==0 ? 0 : d),
                   tight && d==up, leading && d==0);
    if (!tight) memo[pos][sum][leading] = res;
    return res;
}
long long solve(long long x) {
    if (x <= 0) return 0;
    len = 0;
    while (x) { dig[len++] = x%10; x /= 10; }
    reverse(dig, dig+len);
    memset(memo, -1, sizeof(memo));
    return dfs(0, 0, true, true);
}
int main() {
    long long L, R;
    cin >> L >> R >> need;
    cout << solve(R) - solve(L-1) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**memo 不含 tight 维却在 tight 时缓存**：只缓存 tight=false 的结果。`,
      `**前导零被当数码**：数字和、相邻限制要排除 leading 段的零。`,
      `**上界拆位顺序错**：取出是低位在前，记得 reverse。`,
      `**差分 L-1 溢出**：L=0/1 单独处理。`,
      `**memset 重置遗漏**：每次 solve 前清空记忆数组。`,
    ],
    exercises: [
      { title: '出现 13', level: '挑战',
        statement: '统计 [1,n] 中含连续子串 "13" 的数个数。',
        hint: '状态：上一位是否为 1、是否已出现 13。' },
      { title: '不要 62（车牌经典题）', level: '挑战',
        statement: '统计不含 4 且不含连续 62 的号码数。',
        hint: 'pre=6 时本位不能填 2。' },
      { title: '被 k 整除', level: '挑战',
        statement: '统计 [L,R] 中数字和能被 k 整除的数。',
        hint: '状态带模 k 余数。' },
    ],
    summary: `
- 数位 DP 用 \`ans(R)-ans(L-1)\` 统计按位条件的数，推荐**记忆化搜索**写法；
- 必备参数：pos、tight（是否贴住上界），按题加 pre/sum/remain/leading；
- 只在 tight=false 时记忆化；前导零用 leading 单独处理；
- 典型题：禁数码、相邻限制、数字和/整除、数码出现次数。
`,
  };

  Object.assign(window.TOPICS, T);
})();
