/* ============================================================
   第二部分 · 第6章 贪心算法
   greedy
   ============================================================ */
(function () {
  const T = {};

  T['greedy'] = {
    chapter: '第6章 贪心算法',
    time: '约 50 分钟',
    body: `
## 一、贪心思想

**贪心算法**：每一步都选择“当前看起来最好”的方案，并且**不再回头**，期望由此得到全局最优。

贪心不是一种具体算法，而是一种“按某个标准每次取最优”的策略。解题关键永远是两步：

1. **找到贪心策略**（按什么排序/优先选什么）；
2. **证明或验证它是对的**（贪心可能错！）。

## 二、经典模型 1：排队接水

n 个人各需接水时间 tᵢ，一个水龙头，求所有人**等待总时间**最小的排队顺序。

- 策略：**用时短的人先接**（按 t 升序）；
- 直觉：让耗时长的人靠后，他的耗时被更少的人“等待”；
- 计算：排序后第 i 个人的接水时间被后面 n-i 个人等待，答案 Σ tᵢ×(n-i)。

## 三、经典模型 2：区间选择（活动安排）

n 个活动各有开始、结束时间，同一时刻只能参加一个，最多能参加几个？

- 策略：**按结束时间从小到大排序，能选就选**（与上一个选中的活动不冲突）；
- 证明：结束最早的活动永远不会比其他选择更差——它给后面留出最多时间。

\`\`\`cpp
sort(act, act+n, [](const pair<int,int>& a, const pair<int,int>& b){
    return a.second < b.second;        // 按结束时间升序
});
int cnt = 0, lastEnd = -1;
for (int i = 0; i < n; i++) {
    if (act[i].first >= lastEnd) {     // 起点不早于上一个的终点
        cnt++;
        lastEnd = act[i].second;
    }
}
\`\`\`

## 四、经典模型 3：部分背包

物品可分割，容量 W，每个物品有重量和价值，求最大价值。

- 策略：优先装**单价（价值/重量）最高**的物品；
- 注意：01 背包（物品不可分割）不能贪心，必须动态规划，这是著名反例。

## 五、经典模型 4：合并果子（哈夫曼贪心）

n 堆果子，每次合并两堆，体力 = 两堆之和，求总体力最小。

- 策略：**每次合并当前最小的两堆**；
- 实现：优先队列（小根堆），取两个最小、求和、放回；
- 正确性：越早合并的堆被重复计算的次数越多，所以小数先合并。

\`\`\`cpp
priority_queue<long long, vector<long long>, greater<long long>> pq;
// greater -> 小根堆；默认是大根堆
long long ans = 0;
while (pq.size() > 1) {
    long long x = pq.top(); pq.pop();
    long long y = pq.top(); pq.pop();
    ans += x + y;
    pq.push(x + y);
}
\`\`\`

## 六、贪心为什么可能错？

找零问题：面值 1、3、4，凑 6 元，最少硬币数？

- 贪心（先用大面值）：4+1+1 = 3 枚；
- 最优：3+3 = 2 枚。**贪心失败。**

人民币面值（1、2、5、10…）下贪心恰好正确，是因为面值设计特殊。所以用贪心前要问自己：**有没有反例？局部最优是否一定导向全局最优？**

常见证明方法：

- **交换论证**：假设最优方案与贪心方案不同，交换其中两个元素不会变差；
- **反证法/归纳**；
- 比赛时如果证不出来，**写暴力对拍**验证（小数据不会骗人）。

## 七、贪心题识别信号

- 题目问“最多/最少/最短”且每步选择独立；
- 可以按某个关键字排序后依次决定；
- 数据范围大（10⁵），暗示 O(n log n) 的排序扫描；
- DP 能做但状态简单到“只需当前最优”。
`,
    examples: [
      {
        title: '排队接水',
        level: '基础',
        statement: `**题目描述**

n 个人（n≤1000）各带一个接水时间，只有一个水龙头。求最小的平均等待时间（等待时间含自己接水时间），输出顺序和总等待时间。`,
        samples: [['5\n3 1 4 2 5', '顺序:2 4 1 3 5\n总等待:35']],
        analysis: `### 解题思路

按时间升序排列：第 2 人(1)、第 4 人(2)、第 1 人(3)、第 3 人(4)、第 5 人(5)，
累计等待 1+(1+2)+(1+2+3)+… = 35。注意输出的是**人员编号**，排序时排下标、不要直接排时间值。

实现上维护 prefix，第 i 人结束时间 prefix 累加到答案即可。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int a[1005], ord[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) { cin >> a[i]; ord[i] = i + 1; }
    // 按下标对应的时间升序，输出的顺序才是人员编号
    sort(ord, ord + n, [](int x, int y) { return a[x - 1] < a[y - 1]; });

    long long total = 0, prefix = 0;
    for (int i = 0; i < n; i++) {
        prefix += a[ord[i] - 1];   // 第 i 个人接完水的时刻
        total += prefix;           // 他后面的人（含他自己）都等到这一刻
    }

    cout << "顺序:";
    for (int i = 0; i < n; i++) cout << ord[i] << (i+1==n?'\\n':' ');
    cout << "总等待:" << total << '\\n';
    return 0;
}`,
      },
      {
        title: '活动安排（区间选择）',
        level: '提高',
        statement: `**题目描述**

n 个活动（n≤10⁵），每个给出开始、结束时刻（闭开区间，前一个在 s 结束、后一个 s 开始算不冲突）。最多能完整参加多少个活动？`,
        samples: [['4\n1 3\n2 4\n3 5\n4 6', '2']],
        analysis: `### 解题思路

按结束时刻升序，依次选取与已选活动不冲突者。样例选 [1,3) 和 [3,5)（或 [2,4)+[4,6)），共 2 个。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

pair<int,int> act[100005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> act[i].first >> act[i].second;

    sort(act, act + n, [](const pair<int,int>& a, const pair<int,int>& b){
        if (a.second != b.second) return a.second < b.second;
        return a.first < b.first;        // 结束相同时按开始排
    });

    int cnt = 0, lastEnd = -1;
    for (int i = 0; i < n; i++) {
        if (act[i].first >= lastEnd) {   // 与上一个不冲突
            cnt++;
            lastEnd = act[i].second;
        }
    }
    cout << cnt << '\\n';
    return 0;
}`,
      },
      {
        title: '合并果子',
        level: '提高',
        statement: `**题目描述**

n 堆果子（n≤10000），每堆重量已知。每次任选两堆合并成新堆，消耗体力等于新堆重量。求全部合并成一堆的最小体力。`,
        samples: [['3\n1 2 9', '15']],
        analysis: `### 解题思路

哈夫曼树：每次取最小两堆。1+2=3（体力 3），3+9=12（体力 12），合计 15。

用小根堆 priority_queue 维护，O(n log n)。总和可能超 int，用 long long。`,
        code: `#include <iostream>
#include <queue>
#include <vector>
#include <functional>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 小根堆：greater<T>；默认 priority_queue 是大根堆
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        pq.push(x);
    }

    long long ans = 0;
    while (pq.size() > 1) {
        long long x = pq.top(); pq.pop();
        long long y = pq.top(); pq.pop();
        ans += x + y;
        pq.push(x + y);
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**看到“最优”就贪心**：01 背包、某些找零问题贪心是错的，先找反例或对拍。`,
      `**排序关键字选错**：区间问题要想清楚按“开始”还是“结束”排——最多不重叠活动按结束排。`,
      `**优先队列方向搞反**：priority_queue 默认大根堆，求最小两堆必须 greater<T>。`,
      `**合并过程答案用 int**：每层代价重复累计，轻松超过 int，用 long long。`,
      `**区间端点开闭不清**：“前一个结束 = 后一个开始”算不算冲突，按题意决定用 > 还是 >=。`,
      `**只证明了一步没考虑全局**：贪心证明要能说明“这一步的最优选择不会让后续变差”。`,
    ],
    exercises: [
      { title: '找零钱（人民币版）', level: '基础',
        statement: '面值 1、5、10、20、50、100 元，输入金额，输出最少纸币数。',
        hint: '面值特殊，贪心正确：从大到小 while 扣除。' },
      { title: '最大不相交区间数量与覆盖', level: '提高',
        statement: 'n 条线段 [l,r]，求最多选多少条互不相交（端点相同算不相交）。',
        hint: '按右端点排序的标准活动安排。' },
      { title: '乘船问题', level: '提高',
        statement: 'n 个人体重已知，船限重 W、每船最多 2 人，求最少船数。',
        hint: '排序后双指针：最重的若能和最轻的同船就配对，否则最重的独乘。' },
      { title: '任务调度', level: '挑战',
        statement: 'n 个任务各有耗时和截止时间，全部完成，如何安排使最大延迟最小？',
        hint: '按截止时间升序执行（经典 EDD 贪心），累加时间算每个任务延迟取最大。' },
    ],
    summary: `
- 贪心 = **每步取当前最优且不回头**；核心是定排序/选择标准，并确认无反例；
- 四大模型：排队接水（短任务优先）、活动安排（按结束时间）、部分背包（按单价）、合并果子（最小两堆，小根堆）；
- 01 背包、1/3/4 找零是贪心反例，证不准就暴力对拍；
- 实现多为 sort + 一次扫描或 priority_queue，复杂度通常 O(n log n)。
`,
  };

  Object.assign(window.TOPICS, T);
})();
