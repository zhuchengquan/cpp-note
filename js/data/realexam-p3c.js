/* ============================================================
   真题与经典名题精讲 · 第三部分 第三批 8 题（提高篇收尾）
   ============================================================ */
(function () {
  const R = {

  /* ---- stl-advanced：奖学金 ---- */
  'stl-advanced': {
    source: 'NOIP 2007 普及组 · 洛谷 P1093 奖学金',
    title: '奖学金（结构体多关键字排序）',
    level: '基础',
    statement: `**题目描述**

某小学 n 名学生参加期末考试，每人有语文、数学、英语三科成绩。先按**总分从高到低**排序，
总分相同按**语文从高到低**，再相同按**学号从小到大**。输出前 5 名（不足全输出）的学号和总分。`,
    input: '第一行 n；n 行 语文 数学 英语（第 i 行学号即 i）。',
    output: '至多 5 行：学号 总分。',
    samples: [['3\n90 67 80\n87 66 91\n78 89 91', `3 258
2 244
1 237`]],
    analysis: `### 解题思路

结构体保存三科与总分，用一个 \`cmp\` 写清三个关键字（总分→语文→学号），
sort 后输出前 5。多关键字排序是 STL 最常用技巧之一。`,
    code: `#include <bits/stdc++.h>
using namespace std;
struct Student { int id, chinese, math, english, total; };
int main() {
    int n; cin >> n;
    vector<Student> s(n);
    for (int i = 0; i < n; i++) {
        int c, m, e; cin >> c >> m >> e;
        s[i] = {i+1, c, m, e, c+m+e};
    }
    sort(s.begin(), s.end(), [](const Student &a, const Student &b) {
        if (a.total != b.total) return a.total > b.total;
        if (a.chinese != b.chinese) return a.chinese > b.chinese;
        return a.id < b.id;
    });
    for (int i = 0; i < min(5, n); i++)
        cout << s[i].id << " " << s[i].total << '\\n';
    return 0;
}`,
  },

  /* ---- graph-store：图的遍历（反向建图） ---- */
  'graph-store': {
    source: '洛谷 P3916 图的遍历',
    title: '图的遍历（反向建图 + 染色）',
    level: '提高',
    statement: `**题目描述**

给出 N 个点 M 条有向边，对每个点求：**从该点出发能到达的所有点中，编号最大是多少**。`,
    input: '第一行 N M；M 行 u v。',
    output: '一行 N 个整数。',
    samples: [['4 3\n1 2\n2 4\n4 3', '4 4 3 4']],
    analysis: `### 解题思路

正向对每点 DFS 会 O(N(N+M)) 超时。巧妙做法是**建反图**：
从编号 N 到 1 依次处理，若点 u 还没答案，就在反图上 DFS——
所有能沿反边走到 u 的点，正图中都能到达 u，故答案都是 u。`,
    code: `#include <bits/stdc++.h>
using namespace std;
vector<int> rev[100005];
int ans[100005];

void dfs(int u, int value) {
    ans[u] = value;
    for (int v : rev[u])
        if (ans[v] == 0) dfs(v, value);
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        rev[v].push_back(u);          // 反向边
    }
    for (int u = n; u >= 1; u--)
        if (ans[u] == 0) dfs(u, u);
    for (int u = 1; u <= n; u++)
        cout << ans[u] << (u==n?'\\n':' ');
    return 0;
}`,
  },

  /* ---- tarjan：受欢迎的牛 ---- */
  'tarjan': {
    source: 'USACO · 洛谷 P2341 受欢迎的牛',
    title: '受欢迎的牛（Tarjan SCC + 缩点）',
    level: '挑战',
    statement: `**题目描述**

N 头牛、M 条有向边（A 认为 B 受欢迎，记为 A→B）。若牛 B 能被**所有牛**到达，
称 B 受欢迎。求受欢迎的牛有多少头。`,
    input: '第一行 N M；M 行 u v。',
    output: '一个整数：受欢迎牛数。',
    samples: [['3 3\n1 2\n2 1\n2 3', '1']],
    analysis: `### 解题思路

- Tarjan 求所有强连通分量（SCC 内部互相可达）并缩点成 DAG；
- 在 DAG 上统计每个 SCC 的出度；
- 若**恰好一个** SCC 出度为 0，它能被所有 SCC 到达，答案为其大小；
  若有多个出度为 0，互相不可达，答案 0。
样例 SCC{1,2}→{3}，唯一出度 0 的 {3} 大小 1。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 10005;
vector<int> g[N];
int dfn[N], low[N], timer, sccId[N], sccCnt;
int stk[N], top_;
bool inStack[N];
int sccSize[N], outdeg[N];

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    stk[++top_] = u; inStack[u] = true;
    for (int v : g[u]) {
        if (!dfn[v]) { tarjan(v); low[u] = min(low[u], low[v]); }
        else if (inStack[v]) low[u] = min(low[u], dfn[v]);
    }
    if (low[u] == dfn[u]) {
        ++sccCnt;
        while (true) {
            int x = stk[top_--];
            inStack[x] = false;
            sccId[x] = sccCnt;
            sccSize[sccCnt]++;
            if (x == u) break;
        }
    }
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }

    for (int i = 1; i <= n; i++) if (!dfn[i]) tarjan(i);

    for (int u = 1; u <= n; u++)
        for (int v : g[u])
            if (sccId[u] != sccId[v]) outdeg[sccId[u]]++;

    int zeroOut = 0, answer = 0;
    for (int i = 1; i <= sccCnt; i++)
        if (outdeg[i] == 0) { zeroOut++; answer = sccSize[i]; }

    cout << (zeroOut == 1 ? answer : 0) << '\\n';
    return 0;
}`,
  },

  /* ---- knapsack-advanced：宝物筛选 ---- */
  'knapsack-advanced': {
    source: '洛谷 P1776 宝物筛选',
    title: '宝物筛选（多重背包 · 二进制拆分）',
    level: '提高',
    statement: `**题目描述**

共有 n 种宝物，第 i 种价值 v、重量 w、数量 c。背包最大承重 W，每件宝物可取至多 c 件，
求能获得的最大价值。`,
    input: '第一行 n W；n 行：价值 v 重量 w 数量 c。',
    output: '一个整数：最大价值。',
    samples: [['2 8\n3 2 2\n4 3 1', '10']],
    analysis: `### 解题思路

把数量 c **二进制拆分**：分成 1,2,4,… 和余数份，每份当成一个 01 物品，
就能用 01 背包表示"取 0..c 件"，物品数从 c 降到 log c。
样例：2 件 (w2,v3) 和 1 件 (w3,v4)，最优 w=7、价值 10。
数据极大时还可用单调队列进一步优化。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int dp[40005];
int main() {
    int n, W; cin >> n >> W;
    vector<pair<int,int>> items;   // (重量, 价值)
    for (int i = 0; i < n; i++) {
        int v, w, c; cin >> v >> w >> c;
        for (int k = 1; k <= c; k <<= 1) {     // 二进制拆分
            items.push_back({w*k, v*k});
            c -= k;
        }
        if (c > 0) items.push_back({w*c, v*c});
    }
    for (auto [w, v] : items)
        for (int j = W; j >= w; j--)
            dp[j] = max(dp[j], dp[j-w] + v);
    cout << dp[W] << '\\n';
    return 0;
}`,
  },

  /* ---- dp-interval：石子合并 ---- */
  'dp-interval': {
    source: 'NOIP 1995 · 洛谷 P1880 石子合并',
    title: '石子合并（环形区间 DP）',
    level: '挑战',
    statement: `**题目描述**

操场上摆着 n 堆石子排成**环形**，每次只能合并**相邻**两堆，得分等于两堆石子数之和。
求把所有石子合并成一堆的**最小、最大**总得分。`,
    input: '第一行 n；第二行 n 个石子数。',
    output: '两行：最小得分、最大得分。',
    samples: [['3\n1 2 3', `9\n11`]],
    analysis: `### 解题思路

- **破环为链**：把数组复制一倍（a[i+n]=a[i]），环上任意方案都对应长度 n 的一段；
- 区间 DP：\`f[i][j] = 最优分界 f[i][k]+f[k+1][j] + 区间石子和\`，
  按区间长度递增计算；
- 答案枚举起点 i=1..n、区间 [i, i+n−1] 的 min/max。
1,2,3：先并 1+2 再并最小为 9；先并 2+3 最大 11。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 205, INF = 1e9;
int a[2*N], pref[2*N];
int fmin_[2*N][2*N], fmax_[2*N][2*N];
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        a[i+n] = a[i];
    }
    for (int i = 1; i <= 2*n; i++) pref[i] = pref[i-1] + a[i];

    for (int len = 2; len <= n; len++) {
        for (int i = 1; i + len - 1 <= 2*n; i++) {
            int j = i + len - 1;
            fmin_[i][j] = INF;
            for (int k = i; k < j; k++) {
                int add = pref[j] - pref[i-1];
                fmin_[i][j] = min(fmin_[i][j], fmin_[i][k] + fmin_[k+1][j] + add);
                fmax_[i][j] = max(fmax_[i][j], fmax_[i][k] + fmax_[k+1][j] + add);
            }
        }
    }
    int ansMin = INF, ansMax = 0;
    for (int i = 1; i <= n; i++) {
        ansMin = min(ansMin, fmin_[i][i+n-1]);
        ansMax = max(ansMax, fmax_[i][i+n-1]);
    }
    cout << ansMin << '\\n' << ansMax;
    return 0;
}`,
  },

  /* ---- dp-bitmask：吃奶酪 ---- */
  'dp-bitmask': {
    source: '洛谷 P1433 吃奶酪',
    title: '吃奶酪（状压 DP）',
    level: '挑战',
    statement: `**题目描述**

房间里有 n 块奶酪，分别放在不同坐标。老鼠从原点 (0,0) 出发，每块奶酪恰好吃一次，
求吃完所有奶酪的最短路径长度。`,
    input: '一行 n；n 行坐标 x y。',
    output: '最短距离，保留 2 位小数。',
    samples: [['2\n1 0\n1 1', '2.00']],
    analysis: `### 解题思路

状压 DP：预处理原点到各点、各点之间距离。
\`dp[mask][i]\` 表示已吃集合为 mask、最后停在 i 的最短距离；
转移从 mask 中另一点 k 走到 i。最后取全 1 状态在各点的最小值。
样例先到 (1,0) 再 (1,1)：1+1=2。`,
    code: `#include <bits/stdc++.h>
using namespace std;
int n;
double x[20], y[20], d[20][20];
double dp[1<<15][15];

double dist(double x1,double y1,double x2,double y2) {
    return hypot(x1-x2, y1-y2);
}
int main() {
    cin >> n;
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            d[i][j] = dist(x[i],y[i],x[j],y[j]);

    for (int mask = 0; mask < (1<<n); mask++)
        for (int i = 0; i < n; i++) dp[mask][i] = 1e18;

    for (int i = 0; i < n; i++)
        dp[1<<i][i] = dist(0,0,x[i],y[i]);

    for (int mask = 1; mask < (1<<n); mask++) {
        for (int i = 0; i < n; i++) {
            if (!(mask & (1<<i))) continue;
            int pre = mask ^ (1<<i);
            if (pre == 0) continue;
            for (int k = 0; k < n; k++)
                if (pre & (1<<k))
                    dp[mask][i] = min(dp[mask][i], dp[pre][k] + d[k][i]);
        }
    }
    int full = (1<<n) - 1;
    double ans = 1e18;
    for (int i = 0; i < n; i++) ans = min(ans, dp[full][i]);
    cout << fixed << setprecision(2) << ans;
    return 0;
}`,
  },

  /* ---- dp-digit：数字计数 ---- */
  'dp-digit': {
    source: 'ZJOI 2010 · 洛谷 P2602 数字计数',
    title: '数字计数（数位统计）',
    level: '挑战',
    statement: `**题目描述**

给定两个正整数 a 和 b，求在 [a,b] 的所有整数中，数字 0~9 各出现了多少次。`,
    input: '一行 a b。',
    output: '一行 10 个整数：0~9 的出现次数。',
    samples: [['1 9', '0 1 1 1 1 1 1 1 1 1']],
    analysis: `### 解题思路

写函数 \`count(n, d)\` 统计 1..n 中数字 d 出现次数：按每一位（高位 high、当前 cur、低位 low、位权 base）分类讨论 cur 与 d 大小。
d=0 要减去前导零的情况。最后各数字答案 = count(b,d) − count(a−1,d)。`,
    code: `#include <bits/stdc++.h>
using namespace std;

long long countDigit(long long n, int d) {
    if (n <= 0) return 0;
    long long cnt = 0, base = 1;
    while (base <= n) {
        long long high = n / (base * 10);
        long long cur  = (n / base) % 10;
        long long low  = n % base;

        if (cur > d)  cnt += (high + 1) * base;
        else if (cur == d) cnt += high * base + low + 1;
        else cnt += high * base;

        if (d == 0) {                       // 去掉前导零
            cnt -= base;
            if (high == 0) break;
        }
        base *= 10;
    }
    return cnt;
}
int main() {
    long long a, b; cin >> a >> b;
    for (int d = 0; d <= 9; d++) {
        long long ans = countDigit(b, d) - countDigit(a-1, d);
        cout << ans << (d==9?'\\n':' ');
    }
    return 0;
}`,
  },

  /* ---- combinatorics：组合数问题 ---- */
  'combinatorics': {
    source: 'NOIP 2016 提高组 · 洛谷 P2822 组合数问题',
    title: '组合数问题（递推 + 二维前缀和）',
    level: '提高',
    statement: `**题目描述**

给定 n、m、k，对于所有 0≤i≤n、0≤j≤min(i,m)，求有多少对 (i,j) 使
组合数 C(i,j) 恰好是 **k 的倍数**。多组询问。`,
    input: '第一行 t k；t 行 n m。',
    output: '每行一个答案。',
    samples: [['1 2\n3 3', '1']],
    analysis: `### 解题思路

用杨辉三角递推组合数并对 k 取模：
\`c[i][j] = (c[i-1][j] + c[i-1][j-1]) % k\`，
c[i][j]==0 即 k 的倍数。再做二维前缀和，
\`ans[n][m]\` 一次 O(1) 回答。样例仅 C(2,1)=2 满足。`,
    code: `#include <bits/stdc++.h>
using namespace std;
const int N = 2005;
int c[N][N], pref[N][N];
int main() {
    int t, k; cin >> t >> k;
    c[0][0] = 1 % k;
    for (int i = 1; i < N; i++) {
        c[i][0] = c[i-1][0] % k;
        for (int j = 1; j <= i; j++)
            c[i][j] = (c[i-1][j] + c[i-1][j-1]) % k;
    }
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            int v = (j <= i && c[i][j] == 0) ? 1 : 0;
            pref[i][j] = v
                + (i?pref[i-1][j]:0)
                + (j?pref[i][j-1]:0)
                - (i&&j?pref[i-1][j-1]:0);
        }
    while (t--) {
        int n, m; cin >> n >> m;
        cout << pref[n][m] << '\\n';
    }
    return 0;
}`,
  },

  };

  for (const id of Object.keys(R)) {
    const t = window.TOPICS[id];
    if (t) { t.examples = t.examples || []; t.examples.push(R[id]); }
  }
})();
