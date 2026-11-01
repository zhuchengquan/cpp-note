/* ============================================================
   第三部分 · 第2章 链表与单调结构
   linked-list / mono-stack-queue
   ============================================================ */
(function () {
  const T = {};

  T['linked-list'] = {
    chapter: '第2章 链表与单调结构',
    time: '约 45 分钟',
    body: `
## 一、为什么竞赛用数组模拟链表？

链表支持 O(1) 在已知位置插入/删除，但指针链表常数大、调试难。竞赛的标准做法是**用数组模拟**：每个结点一个编号，前驱、后继都存成数组下标。

\`\`\`cpp
int val[MAXN], pre[MAXN], nxt[MAXN], idx;
\`\`\`

## 二、单链表基本操作

\`\`\`cpp
int head = -1;     // -1 表示空

// 头插法
void addHead(int x) {
    val[idx] = x;
    nxt[idx] = head;
    head = idx++;
}
// 在编号 p 的结点后插入 x
void insertAfter(int p, int x) {
    val[idx] = x;
    nxt[idx] = nxt[p];
    nxt[p] = idx++;
}
// 删除 p 的后继
void removeAfter(int p) {
    nxt[p] = nxt[nxt[p]];
}
\`\`\`

## 三、双向链表

\`\`\`cpp
// 删除编号 p 的结点
nxt[pre[p]] = nxt[p];
pre[nxt[p]] = pre[p];

// 在 p 后面插入新结点 idx
nxt[idx] = nxt[p]; pre[idx] = p;
pre[nxt[p]] = idx; nxt[p] = idx;
\`\`\`

经典题“**约瑟夫问题**”“**模拟移动**”都可用它。配合两个虚拟端点（左边界 0、右边界 n+1）能避免大量空指针判断。

## 四、邻接表：链式前向星

图论中最重要的“链表变体”：把每条边的编号串在顶点后面。

\`\`\`cpp
int head[MAXV], to[MAXE], w[MAXE], nxtEdge[MAXE], edgeCnt = 0;
memset(head, -1, sizeof(head));

void addEdge(int u, int v, int weight) {
    to[edgeCnt] = v;
    w[edgeCnt] = weight;
    nxtEdge[edgeCnt] = head[u];
    head[u] = edgeCnt++;
}
// 遍历 u 的所有出边：
for (int e = head[u]; e != -1; e = nxtEdge[e]) {
    int v = to[e], weight = w[e];
}
\`\`\`

vector 邻接表写法更简洁（\`vector<pair<int,int>> g[MAXV]\`），链式前向星适合极限优化与需要边编号的题（如网络流）。
`,
    examples: [
      {
        title: '数组模拟单链表',
        level: '基础',
        statement: `**题目描述**

依次实现：头插、在指定值结点后插入、删除指定值的后继，最后遍历输出。`,
        samples: [['', '1 2 99 3']],
        analysis: `### 解题思路

所有操作 O(1)（找到指定值除外，需 O(n) 遍历）。用 -1 表示链尾。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
int val[MAXN], nxt[MAXN], idx = 1, head = -1;

void addHead(int x) {
    val[idx] = x; nxt[idx] = head; head = idx++;
}
void insertAfter(int p, int x) {
    val[idx] = x; nxt[idx] = nxt[p]; nxt[p] = idx++;
}
int findNode(int x) {
    for (int p = head; p != -1; p = nxt[p])
        if (val[p] == x) return p;
    return -1;
}
int main() {
    addHead(3); addHead(2); addHead(1);   // 链表 1->2->3
    int p = findNode(2);
    if (p != -1) insertAfter(p, 99);      // 1->2->99->3
    for (int cur = head; cur != -1; cur = nxt[cur])
        cout << val[cur] << " ";
    return 0;
}`,
      },
      {
        title: '邻接表建图与遍历',
        level: '提高',
        statement: `**题目描述**

输入 n 个点、m 条带权有向边，输出每个点的出边列表（链式前向星实现）。`,
        samples: [['3 3\n1 2 5\n2 3 7\n1 3 9', `点1: ->3(9) ->2(5)
点2: ->3(7)
点3:`]],
        analysis: `### 解题思路

链式前向星中同一顶点的边按**插入逆序**串接（头插法），输出顺序与输入相反，这是正常现象。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXV = 100005, MAXE = 200005;
int head[MAXV], to[MAXE], w[MAXE], nxtE[MAXE], cnt;

void addEdge(int u, int v, int weight) {
    to[cnt] = v; w[cnt] = weight;
    nxtE[cnt] = head[u]; head[u] = cnt++;
}
int main() {
    int n, m; cin >> n >> m;
    memset(head, -1, sizeof(head));
    for (int i = 0; i < m; i++) {
        int u, v, weight; cin >> u >> v >> weight;
        addEdge(u, v, weight);
    }
    for (int u = 1; u <= n; u++) {
        cout << "点" << u << ":";
        for (int e = head[u]; e != -1; e = nxtE[e])
            cout << " ->" << to[e] << "(" << w[e] << ")";
        cout << '\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**head 不初始化为 -1**：遍历时访问非法下标。`,
      `**插入时赋值顺序错**：必须先让新结点指向旧后继，再改前驱指向。`,
      `**删除后仍访问该结点**：删除只是改变链接，结点数据仍在但不可达。`,
      `**无向图只加一条边**：要 addEdge 两次（正反方向）。`,
      `**数组容量**：链式前向星边数容量 = 有向 m、无向 2m。`,
    ],
    exercises: [
      { title: '双向链表模拟', level: '基础',
        statement: '实现带左右哨兵的双向链表，支持按编号插入与删除。',
        hint: '0 号与 n+1 号作为永远存在的左右边界。' },
      { title: '邻接表度数统计', level: '基础',
        statement: '建无向图，输出每个点的度。',
        hint: '每条无向边给两个端点度数 +1。' },
      { title: '静态链表逆序', level: '提高',
        statement: '数据按结点编号散落给出（每结点含数据和后继编号），输出整条链。',
        hint: '先找没有被任何结点指向的头结点。' },
    ],
    summary: `
- 竞赛链表用**数组模拟**：val/pre/nxt 三个数组 + 编号，避免指针；
- 单链表头插、指定位置插入/删除都是 O(1)；双向链表配合哨兵简化边界；
- **链式前向星**是图的紧凑存储：head/to/next 数组，边头插串接；
- 无向图边数开 2m，head 初始化为 -1。
`,
  };

  T['mono-stack-queue'] = {
    chapter: '第2章 链表与单调结构',
    time: '约 55 分钟',
    body: `
## 一、单调栈

栈中元素始终保持单调（递增或递减）。用途极其集中：**寻找每个元素左/右边第一个更大（或更小）的元素**。

### 模板：下一个更大元素（Next Greater）

\`\`\`cpp
vector<int> st, ans(n, -1);
for (int i = 0; i < n; i++) {
    while (!st.empty() && a[st.back()] < a[i]) {
        ans[st.back()] = i;   // i 就是栈顶元素右边第一个更大者
        st.pop_back();
    }
    st.push_back(i);
}
\`\`\`

每个元素至多入栈、出栈各一次，总复杂度 O(n)。栈中存的是**下标**，方便计算距离。

四种方向：右/左 × 更大/更小，通过遍历方向和比较符号切换。

## 二、单调队列：滑动窗口最值

队列中元素单调，队首是窗口最值。用 deque 实现：

\`\`\`cpp
deque<int> q;                       // 存下标，对应值单调递减
for (int i = 0; i < n; i++) {
    while (!q.empty() && a[q.back()] <= a[i]) q.pop_back(); // 队尾清理
    q.push_back(i);
    if (q.front() <= i - k) q.pop_front();                 // 过期队首
    if (i >= k - 1) cout << a[q.front()] << " ";
}
\`\`\`

与单调栈的区别：单调队列还要**从队首删除滑出窗口的元素**。

## 三、识别套路

- 出现“下一个比它大/小”“柱状图最大矩形”“每日温度”“接雨水”→ 单调栈；
- 出现“滑动窗口最大/最小”“窗口内最值”→ 单调队列；
- 关键转化：把 O(n²) 的“回头扫描”变成每个元素一次的入栈出栈。

## 四、柱状图最大矩形（经典难题）

对每根柱子 h[i]，求它向左右扩展的第一个更矮位置 L、R，以 h[i] 为高的面积 = h[i]×(R-L-1)。用两次单调栈预处理左右边界，O(n)。
`,
    examples: [
      {
        title: '下一个更大元素',
        level: '基础',
        statement: `**题目描述**

对数组每个位置，输出右边第一个比它大的元素的值，没有则输出 -1。`,
        samples: [['5\n2 1 4 3 5', '4 4 5 5 -1']],
        analysis: `### 解题思路

单调递减栈（栈底→栈顶非递增）。新元素更大时，它就是被弹出元素的答案。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    vector<int> ans(n, -1), st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.back()] < a[i]) {
            ans[st.back()] = a[i];
            st.pop_back();
        }
        st.push_back(i);
    }
    for (int i = 0; i < n; i++) cout << ans[i] << (i+1==n?'\\n':' ');
    return 0;
}`,
      },
      {
        title: '滑动窗口最小值',
        level: '提高',
        statement: `**题目描述**

输出数组每个长度 k 的窗口中的最小值（n≤10⁶）。`,
        samples: [['8 3\n1 3 -1 -3 5 3 6 7', '-1 -3 -3 -3 3 3']],
        analysis: `### 解题思路

单调递增队列，队首最小。注意先清理队尾、入队、删过期、取答案四步顺序。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int a[1000005];
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k; cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    deque<int> q;
    for (int i = 0; i < n; i++) {
        while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();
        q.push_back(i);
        if (q.front() <= i - k) q.pop_front();
        if (i >= k - 1) cout << a[q.front()] << (i==n-1?'\\n':' ');
    }
    return 0;
}`,
      },
      {
        title: '柱状图中最大矩形',
        level: '挑战',
        statement: `**题目描述**

n 根柱子高度 h[i]，宽度均为 1，求能勾勒出的最大矩形面积（n≤10⁵）。`,
        samples: [['6\n2 1 5 6 2 3', '10']],
        analysis: `### 解题思路

两次单调栈求每个高度左右第一个更矮的柱子，面积 h[i]×(r[i]-l[i]-1)，取最大。哨兵技巧：高度数组两端补 0，强制所有柱子出栈结算。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> h(n + 2, 0);
    for (int i = 1; i <= n; i++) cin >> h[i];

    vector<int> L(n + 2), R(n + 2), st;
    for (int i = 1; i <= n + 1; i++) {           // 左边第一个更矮
        while (!st.empty() && h[st.back()] >= h[i]) st.pop_back();
        L[i] = st.empty() ? 0 : st.back();
        st.push_back(i);
    }
    st.clear();
    for (int i = n; i >= 0; i--) {              // 右边第一个更矮
        while (!st.empty() && h[st.back()] >= h[i]) st.pop_back();
        R[i] = st.empty() ? n + 1 : st.back();
        st.push_back(i);
    }
    long long ans = 0;
    for (int i = 1; i <= n; i++)
        ans = max(ans, h[i] * (long long)(R[i] - L[i] - 1));
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**栈里存值不存下标**：算距离、窗口过期都需要位置，统一存下标。`,
      `**比较符号用错**：相等时弹不弹要想清楚；求边界时带等号表示“更矮”而非“不高于”。`,
      `**窗口过期判断时机**：先入队新元素，再删过期队首，顺序错答案错。`,
      `**以为 O(n²)**：每个元素各进出一次，总计 O(n)，不是每个位置都扫一遍栈。`,
      `**面积用 int**：高度×宽度可达 10¹⁰，用 long long。`,
    ],
    exercises: [
      { title: '每日温度', level: '基础',
        statement: '气温数组，输出每天还要等几天才遇到更暖的一天。',
        hint: '下一个更大元素，答案是下标差。' },
      { title: '窗口最大值+最小值', level: '提高',
        statement: '对每个长度 k 窗口同时输出最大与最小值。',
        hint: '维护两个方向相反的 deque。' },
      { title: '接雨水', level: '挑战',
        statement: '柱状高度图下过雨后能接多少单位水。',
        hint: '单调栈按“层”累加，或预处理左右最高。' },
      { title: '可见建筑', level: '提高',
        statement: '每栋建筑能看到多少栋右侧不被遮挡的建筑。',
        hint: '即右侧严格更大元素的距离链，单调栈变形。' },
    ],
    summary: `
- **单调栈** O(n) 求“下一个更大/更小元素”：栈存下标，保持单调，新元素弹出不满足者并赋予答案；
- **单调队列** = 单调栈 + 队首过期删除，解决滑动窗口最值；
- 经典题：柱状图最大矩形（两次栈求左右更矮边界）、接雨水；
- 核心价值：把回头扫描的 O(n²) 降为每元素一次的 O(n)。
`,
  };

  Object.assign(window.TOPICS, T);
})();
