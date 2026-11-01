/* ============================================================
   第二部分 · 第9章 前缀和与差分
   prefix-diff
   ============================================================ */
(function () {
  const T = {};

  T['prefix-diff'] = {
    chapter: '第9章 前缀和与差分',
    time: '约 45 分钟',
    body: `
## 一、前缀和：O(1) 求区间和

给定数组 a，定义前缀和 \`s[i] = a[1]+a[2]+…+a[i]\`（下标从 1 开始最方便，s[0]=0）：

\`\`\`cpp
for (int i = 1; i <= n; i++) s[i] = s[i-1] + a[i];
\`\`\`

那么区间 [l, r] 的和：

\`\`\`text
sum(l,r) = s[r] - s[l-1]
\`\`\`

原本 O(n) 扫描的区间求和变成 O(1)。当询问次数 m 很大（10⁵），总复杂度从 O(nm) 降到 O(n+m)。

注意：前缀和数组用 long long，10⁵ 个 10⁹ 之和是 10¹⁴。

## 二、二维前缀和：矩形区域求和

\`s[i][j]\` 表示左上角 (1,1) 到 (i,j) 的矩形和：

\`\`\`cpp
s[i][j] = a[i][j] + s[i-1][j] + s[i][j-1] - s[i-1][j-1];
\`\`\`

矩形 (x1,y1)~(x2,y2) 的和（容斥）：

\`\`\`cpp
sum = s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1];
\`\`\`

画图记忆：加两块、减重复的一块。

## 三、差分：O(1) 做区间修改

差分是前缀和的**逆运算**。设 \`d[1]=a[1]\`，\`d[i]=a[i]-a[i-1]\`，则 a 是 d 的前缀和。

要在区间 [l,r] 上**每个数加 v**，只需：

\`\`\`cpp
d[l] += v;
d[r+1] -= v;
\`\`\`

原理：d 的前缀和就是 a，l 处 +v 让 l 之后全部 +v，r+1 处 -v 让 r+1 之后恢复。

所有修改做完后，对 d 求一次前缀和即恢复最终数组：

\`\`\`cpp
for (int i = 1; i <= n; i++) a[i] = a[i-1] + d[i];
\`\`\`

m 次区间修改从 O(nm) 暴降到 O(n+m)。

## 四、二维差分

对矩形 (x1,y1)~(x2,y2) 加 v，在差分数组四个角打标记：

\`\`\`cpp
d[x1][y1]     += v;
d[x2+1][y1]   -= v;
d[x1][y2+1]   -= v;
d[x2+1][y2+1] += v;
\`\`\`

最后对 d 做二维前缀和得到最终矩阵。

## 五、典型应用场景

- 多次询问区间和 / 矩形和 → 前缀和预处理；
- 多次区间加减、最后统一查询 → 差分；
- 区间修改 + 区间查询同时很多 → 提高篇的树状数组 / 线段树；
- 统计“满足和为某值的子数组”→ 前缀和 + 哈希；
- 差分思想也是扫描线、差分数组离散化的基础。
`,
    examples: [
      {
        title: '静态区间求和',
        level: '入门',
        statement: `**题目描述**

第一行 n 个整数，接下来 m 个询问，每个询问给 l、r（1 起下标），输出区间和。n,m≤10⁵。`,
        samples: [['5 3\n1 2 3 4 5\n1 3\n2 5\n3 3', '6\n14\n3']],
        analysis: `### 解题思路

朴素每次扫描是 O(nm)=10¹⁰ 次必超时。预处理前缀和后每次 O(1)。下标从 1 开始，s[0]=0。`,
        code: `#include <iostream>
using namespace std;

long long s[100005];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        long long x; cin >> x;
        s[i] = s[i-1] + x;
    }
    while (m--) {
        int l, r;
        cin >> l >> r;
        cout << s[r] - s[l-1] << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '教室借用（差分模板）',
        level: '基础',
        statement: `**题目描述**

n 间教室初始人数为 0。m 条借用记录：第 l~r 间各增加 v 人。输出操作完后每间教室的人数。n,m≤10⁶。`,
        samples: [['5 3\n1 3 2\n2 4 1\n5 5 3', '2 3 3 1 3']],
        analysis: `### 解题思路

每条记录只改 d[l]+=v、d[r+1]-=v，O(1)。最后求前缀和还原。这是 NOIP 借教室类题的简化版。`,
        code: `#include <iostream>
using namespace std;

long long d[1000005];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    while (m--) {
        int l, r; long long v;
        cin >> l >> r >> v;
        d[l]   += v;
        d[r+1] -= v;
    }

    long long cur = 0;
    for (int i = 1; i <= n; i++) {
        cur += d[i];
        cout << cur << (i == n ? '\\n' : ' ');
    }
    return 0;
}`,
      },
      {
        title: '子矩阵和（二维前缀和）',
        level: '提高',
        statement: `**题目描述**

输入 n×m 矩阵和 q 个询问，每次询问子矩形 (x1,y1)~(x2,y2) 的元素和。`,
        samples: [['2 3 1\n1 2 3\n4 5 6\n1 1 2 2', '12']],
        analysis: `### 解题思路

二维前缀和的构建与查询都用容斥公式。下标从 1 起，第 0 行/列天然是 0。`,
        code: `#include <iostream>
using namespace std;

long long s[1005][1005];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, q;
    cin >> n >> m >> q;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            long long x; cin >> x;
            s[i][j] = x + s[i-1][j] + s[i][j-1] - s[i-1][j-1];
        }

    while (q--) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        long long ans = s[x2][y2]
                      - s[x1-1][y2] - s[x2][y1-1]
                      + s[x1-1][y1-1];
        cout << ans << '\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**前缀和用 int**：区间和可达 10¹⁴，s 数组必须 long long。`,
      `**下标从 0 开始导致 s[l-1] 越界**：前缀和/差分统一下标从 1 开始，开数组时多开 5。`,
      `**差分忘记在 r+1 处减回**：区间修改会一直影响到数组末尾。`,
      `**r=n 时 d[r+1] 越界**：数组开到 n+2，d[n+1] 是合法位置（求前缀和时不输出它即可）。`,
      `**二维容斥符号写反**：构建式与查询式形式相似但加减不同，画图记忆。`,
      `**边修改边查询用差分**：差分只适合“全部修改完再看结果”；动态查询需要树状数组/线段树。`,
    ],
    exercises: [
      { title: '平均数区间', level: '基础',
        statement: '给数组和 m 个询问，输出区间平均值，保留 3 位小数。',
        hint: '(s[r]-s[l-1])/(r-l+1.0)。' },
      { title: '最大子段和（前缀和法）', level: '提高',
        statement: '求数组连续子段的最大和（允许 O(n)）。用前缀和：对每个 r 找最小的 s[l-1]。',
        hint: '维护 minS，ans=max(ans, s[r]-minS)。' },
      { title: '一维区间加后求单点', level: '基础',
        statement: 'm 次区间加，q 次单点查询。',
        hint: '差分标记后前缀和还原，再直接读 a[pos]。' },
      { title: '二维地毯覆盖', level: '提高',
        statement: 'n×n 地面铺 m 块矩形地毯（每块区域计数+1），输出最终每格被覆盖次数。',
        hint: '二维差分四角标记，最后二维前缀和。' },
    ],
    summary: `
- **前缀和** \`s[i]=s[i-1]+a[i]\`，区间和 \`s[r]-s[l-1]\`，把多次区间询问降到 O(1)；
- **差分**是前缀和逆运算：区间 [l,r] 加 v 只需 \`d[l]+=v, d[r+1]-=v\`，最后前缀和还原；
- 二维版本：前缀和用容斥公式构建/查询，差分在矩形四角打标记；
- 统一下标从 1 开始、和用 long long、数组多开两格防 r+1 越界。
`,
  };

  Object.assign(window.TOPICS, T);
})();
