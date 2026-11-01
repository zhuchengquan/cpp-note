/* ============================================================
   第三部分 · 第4章 堆
   heap
   ============================================================ */
(function () {
  const T = {};

  T['heap'] = {
    chapter: '第4章 堆',
    time: '约 50 分钟',
    body: `
## 一、堆是什么？

堆是一棵**完全二叉树**，满足：

- 大根堆：每个结点 ≥ 它的孩子（根是最大值）；
- 小根堆：每个结点 ≤ 它的孩子（根是最小值）。

因为完全二叉树可以直接用数组表示：根在下标 1，结点 i 的左孩子 2i、右孩子 2i+1、父亲 i/2。

## 二、两个基本操作

### 上浮 shiftUp（插入时用）

新元素放末尾，若比父亲大（大根堆）就与父亲交换，直到满足堆序。

### 下沉 shiftDown（删除堆顶时用）

堆顶与末尾交换后删除末尾，新堆顶不断与较大的孩子交换，直到不小于孩子。

插入、删除都是 O(log n)，取堆顶 O(1)，建堆 O(n)。

## 三、STL 优先队列

\`\`\`cpp
priority_queue<int> big;                    // 大根堆
priority_queue<int, vector<int>, greater<int>> small; // 小根堆
big.push(3); big.top(); big.pop();
big.size(); big.empty();
\`\`\`

自定义类型：

\`\`\`cpp
struct Node { int id, w; };
struct Cmp { bool operator()(const Node& a, const Node& b){ return a.w > b.w; } };
priority_queue<Node, vector<Node>, Cmp> pq;  // 按 w 的小根堆
\`\`\`

## 四、堆的经典应用

1. **合并果子（哈夫曼）**：每次取最小两堆合并；
2. **TopK**：小根堆维护 k 个最大；
3. **堆优化 Dijkstra**：堆存 (距离, 点)，O((n+m) log n)；
4. **动态中位数**：大根堆装较小一半、小根堆装较大一半；
5. **多路归并**：每路当前最小入堆，取堆顶推进对应序列。

## 五、手写堆的价值

需要“修改堆中某元素并调整”（如 Dijkstra decrease-key）时，优先队列做不到直接定位，常用方案：

- 懒惰删除：新值直接入堆，旧值出堆时发现已过期就丢弃（竞赛最常用）；
- 手写带位置映射的堆（pairing heap 思路复杂，一般不需要）。
`,
    examples: [
      {
        title: '手写大根堆',
        level: '基础',
        statement: `**题目描述**

用数组实现大根堆的插入、取最大值，完成 n 次操作（n≤10⁵）。`,
        samples: [['6\npush 3\npush 9\npush 5\ntop\npop\ntop', '9\n5']],
        analysis: `### 解题思路

完全二叉树下标映射 + 上浮/下沉。根固定在下标 1，下标 0 不用。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
int heapArr[MAXN], sz;

void shiftUp(int p) {
    while (p > 1 && heapArr[p] > heapArr[p/2]) {
        swap(heapArr[p], heapArr[p/2]);
        p /= 2;
    }
}
void shiftDown(int p) {
    while (2*p <= sz) {
        int ch = 2*p;
        if (ch+1 <= sz && heapArr[ch+1] > heapArr[ch]) ch++; // 取较大孩子
        if (heapArr[p] >= heapArr[ch]) break;
        swap(heapArr[p], heapArr[ch]);
        p = ch;
    }
}
void push(int x) {
    heapArr[++sz] = x;
    shiftUp(sz);
}
void popTop() {
    heapArr[1] = heapArr[sz--];
    shiftDown(1);
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    while (n--) {
        string op; cin >> op;
        if (op == "push") { int x; cin >> x; push(x); }
        else if (op == "top") cout << heapArr[1] << '\\n';
        else popTop();
    }
    return 0;
}`,
      },
      {
        title: '动态中位数（对顶堆）',
        level: '挑战',
        statement: `**题目描述**

依次插入数字，每次插入后输出当前所有数字的中位数（偶数个时取较小的中间值）。`,
        samples: [['5\n1 9 2 8 3', '1\n1\n2\n2\n3']],
        analysis: `### 解题思路

大根堆 lo 存较小一半，小根堆 hi 存较大一半，保持 lo.size() = hi.size() 或多 1。堆顶就是中位数边界。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    priority_queue<int> lo;                    // 大根堆：较小一半
    priority_queue<int, vector<int>, greater<int>> hi; // 小根堆：较大一半

    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (lo.empty() || x <= lo.top()) lo.push(x);
        else hi.push(x);

        if (lo.size() > hi.size() + 1) { hi.push(lo.top()); lo.pop(); }
        if (hi.size() > lo.size())     { lo.push(hi.top()); hi.pop(); }

        cout << lo.top() << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '第 k 大的流（TopK 复习）',
        level: '基础',
        statement: `**题目描述**

n 个数流式输入，只允许 O(k) 额外空间，输出第 k 大。`,
        samples: [['6 3\n5 1 9 3 7 2', '5']],
        analysis: `### 解题思路

大小 k 的小根堆：堆满后只有比堆顶大的才替换。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, k; cin >> n >> k;
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if ((int)heap.size() < k) heap.push(x);
        else if (x > heap.top()) { heap.pop(); heap.push(x); }
    }
    cout << heap.top() << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**大小根堆声明混淆**：默认大根堆；小根堆要 vector+greater。`,
      `**下沉时孩子选错**：大根堆选较大孩子交换，小根堆选较小孩子。`,
      `**下标从 0 用 2i 公式**：手写堆公式基于根在 1。`,
      `**pop 顺序错**：先取堆顶值，再用末尾覆盖，最后下沉。`,
      `**自定义比较器方向反**：priority_queue 的比较器返回 true 表示 a 优先级更低。`,
    ],
    exercises: [
      { title: '堆排序', level: '基础',
        statement: '用手写堆完成升序排序（不断取堆顶）。',
        hint: '建大根堆，每次堆顶换到末尾后缩小范围下沉。' },
      { title: '果子合并变体', level: '基础',
        statement: '每次合并代价为两堆重量之差（绝对值），求最小总代价。',
        hint: '仍然每次取最小两堆（合并后重量为两堆之和，代价按题意）。' },
      { title: '最大的 k 个数与最小的 k 个数', level: '基础',
        statement: '一次遍历分别求出两组结果。',
        hint: '最大 k 用小根堆，最小 k 用大根堆。' },
      { title: '双机调度（选做）', level: '挑战',
        statement: '理解堆优化 Dijkstra 模板，为图论章做准备：手写 (距离,点) 的小根堆。',
        hint: 'pair<int,int> 默认按 first 排序。' },
    ],
    summary: `
- 堆 = 堆序完全二叉树，数组表示（根 1，孩子 2i/2i+1）；
- 插入上浮、删堆顶下沉，均 O(log n)，取顶 O(1)；
- STL 用 priority_queue：默认大根堆，greater 得小根堆；
- 应用：哈夫曼合并、TopK、Dijkstra、对顶堆动态中位数；需要更新元素时常用懒惰删除。
`,
  };

  Object.assign(window.TOPICS, T);
})();
