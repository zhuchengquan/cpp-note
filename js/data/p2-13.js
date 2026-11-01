/* ============================================================
   第二部分 · 第13章 栈、队列与树
   ds-stack-queue / tree-basic
   ============================================================ */
(function () {
  const T = {};

  T['ds-stack-queue'] = {
    chapter: '第13章 栈、队列与树',
    time: '约 45 分钟',
    body: `
## 一、栈 Stack：后进先出 LIFO

像一摞盘子：只能从顶部放（push）、取（pop）。

\`\`\`cpp
#include <stack>
stack<int> s;
s.push(1); s.push(2); s.push(3);
cout << s.top();    // 3：查看栈顶
s.pop();            // 删除栈顶（无返回值）
cout << s.size();   // 2
cout << s.empty();  // 0(false)
\`\`\`

经典用途：

- **括号匹配**：左括号入栈，右括号来检查栈顶是否配对；
- 表达式求值、中缀转后缀；
- DFS 的非显式递归实现、单调栈（提高篇）。

### 括号匹配模板

\`\`\`cpp
bool match(const string& str) {
    stack<char> st;
    for (char c : str) {
        if (c=='('||c=='['||c=='{') st.push(c);
        else {
            if (st.empty()) return false;
            char t = st.top();
            if ((c==')'&&t=='(')||(c==']'&&t=='[')||(c=='}'&&t=='{'))
                st.pop();
            else return false;
        }
    }
    return st.empty();
}
\`\`\`

## 二、队列 queue：先进先出 FIFO

像排队：队尾入队（push）、队首出队（pop）。

\`\`\`cpp
#include <queue>
queue<int> q;
q.push(1); q.push(2);
cout << q.front();  // 1：队首
q.pop();            // 队首出队
cout << q.back();   // 2：队尾
\`\`\`

用途：BFS、按顺序处理的任务调度。

## 三、双端队列 deque：两端都能进出

\`\`\`cpp
deque<int> dq;
dq.push_back(1); dq.push_front(2);
dq.pop_back(); dq.pop_front();
dq[0];                       // 还支持随机访问
\`\`\`

deque 是单调队列、滑动窗口（提高篇）的底层容器，也可直接当更灵活的队列用。

## 四、优先队列 priority_queue（堆）

默认每次取出最大元素（大根堆）：

\`\`\`cpp
priority_queue<int> pq;                    // 大根堆
priority_queue<int, vector<int>, greater<int>> minHeap; // 小根堆
\`\`\`

合并果子、TopK、Dijkstra 的核心结构，提高篇专门讲。

## 五、手写顺序栈（理解原理）

\`\`\`cpp
int stk[100005], topIdx = 0;       // topIdx 指向下一个空位
stk[topIdx++] = x;                 // push
int v = stk[--topIdx];             // pop
bool empty = (topIdx == 0);
\`\`\`

栈满、队列空等边界在题目中要显式判断。
`,
    examples: [
      {
        title: '括号匹配',
        level: '基础',
        statement: `**题目描述**

输入只含 ()[]{} 的字符串（长度≤10⁵），判断括号是否正确匹配。`,
        samples: [['({[]})', 'YES'], ['([)]', 'NO']],
        analysis: `### 解题思路

栈的标志题：左括号入栈，右括号与栈顶配对。最终栈必须为空。`,
        code: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    stack<char> st;
    bool ok = true;
    for (char c : s) {
        if (c=='('||c=='['||c=='{') {
            st.push(c);
        } else {
            if (st.empty()) { ok = false; break; }
            char t = st.top();
            if ((c==')'&&t=='(')||(c==']'&&t=='[')||(c=='}'&&t=='{'))
                st.pop();
            else { ok = false; break; }
        }
    }
    if (!st.empty()) ok = false;
    cout << (ok ? "YES" : "NO") << '\\n';
    return 0;
}`,
      },
      {
        title: '列车调度（栈混洗）',
        level: '提高',
        statement: `**题目描述**

火车按 1,2,…,n 的顺序入栈，可随时出栈。给定目标序列，判断能否由栈操作得到。`,
        samples: [['5\n3 2 1 5 4', 'YES'], ['5\n3 1 2 5 4', 'NO']],
        analysis: `### 解题思路

按序入栈；只要栈顶等于目标序列当前元素就持续弹出。入完后栈空则可行。`,
        code: `#include <iostream>
#include <stack>
using namespace std;

int target[100005];
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) cin >> target[i];

    stack<int> st;
    int cur = 1, p = 0;
    while (p < n) {
        while (st.empty() || st.top() != target[p]) {
            if (cur > n) break;
            st.push(cur++);
        }
        if (st.top() != target[p]) break;
        st.pop();
        p++;
    }
    cout << (p == n ? "YES" : "NO") << '\\n';
    return 0;
}`,
      },
      {
        title: '滑动窗口最大值（deque 预告）',
        level: '挑战',
        statement: `**题目描述**

数组和窗口长度 k，输出每个窗口的最大值（n≤10⁶）。`,
        samples: [['8 3\n1 3 -1 -3 5 3 6 7', '3 3 5 5 6 7']],
        analysis: `### 解题思路

deque 中维护**下标**，对应值单调递减：新元素入队前，把队尾比它小的全部弹出（它们永远不会再成为最大）；队首超出窗口的弹出。每个元素至多进出一次，O(n)。`,
        code: `#include <iostream>
#include <deque>
using namespace std;

int a[1000005];
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k; cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    deque<int> dq;               // 存下标，值单调递减
    for (int i = 0; i < n; i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();   // 移出窗口
        if (i >= k - 1)
            cout << a[dq.front()] << (i==n-1?'\\n':' ');
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**对空栈取 top/pop**：先判 empty。`,
      `**pop 有返回值的错觉**：STL 的 pop 是 void，取值先 top。`,
      `**括号匹配只检查最后非空**：中途出现无法配对的右括号就要立刻失败。`,
      `**优先队列默认方向记错**：默认大根堆，小根堆要 greater。`,
      `**单调队列存值不存下标**：无法判断队首何时滑出窗口，应存下标。`,
    ],
    exercises: [
      { title: '后缀表达式求值', level: '提高',
        statement: '输入逆波兰表达式（数字与 + - * /），用栈求值。',
        hint: '遇数入栈，遇运算符弹两个计算后压回（注意先弹的是右操作数）。' },
      { title: '循环队列模拟', level: '基础',
        statement: '用数组和取模下标手写固定容量循环队列的入队/出队。',
        hint: 'head、tail 指针，(p+1)%cap 推进。' },
      { title: '合法括号方案数', level: '提高',
        statement: 'n 对括号有多少种合法嵌套方式（n≤20）。',
        hint: '卡特兰数：dfs 记录已用左括号和未匹配左括号。' },
      { title: '最小的 k 个数', level: '基础',
        statement: 'n 个数中输出最小的 k 个（用大根堆维护，n 很大数据可流式读）。',
        hint: '堆大小保持 k：新数比堆顶小就替换。' },
    ],
    summary: `
- **栈 LIFO**：push/top/pop，括号匹配、表达式、DFS 是标志应用；
- **队列 FIFO**：push/front/pop，BFS 的基础；**deque** 两端可操作并支持随机访问；
- 优先队列（堆）默认大根堆，greater 得小根堆；
- 单调队列用 deque 存下标，O(n) 解决滑动窗口最值（提高篇细讲）。
`,
  };

  T['tree-basic'] = {
    chapter: '第13章 栈、队列与树',
    time: '约 45 分钟',
    body: `
## 一、树的基本概念

树是层级结构：有唯一一个**根结点**，除根外每个结点恰有一个**父结点**，零个或多个**子结点**。

术语：根、叶子（无子结点）、深度（到根的边数）、高度（到最深叶子的边数）、子树。

n 个结点的树恰有 **n−1 条边**。

## 二、二叉树

每个结点最多两个孩子：左孩子、右孩子（次序有意义）。

特殊形态：

- **满二叉树**：每层都满；
- **完全二叉树**：除最后一层外全满，最后一层结点靠左连续；
- 完全二叉树可用**数组**存储：根在 1，i 的左孩子 2i、右孩子 2i+1、父结点 i/2——这是堆的存储基础。

## 三、二叉树的表示

\`\`\`cpp
struct Node {
    int val;
    Node *left, *right;
};
\`\`\`

竞赛更常用数组模拟（快、不用动态内存）：

\`\`\`cpp
int lc[100005], rc[100005];   // lc[u]：u 的左孩子编号，0 表示无
\`\`\`

## 四、四大遍历（重点）

### 深度优先三种（递归极简）

\`\`\`cpp
void preorder(int u)   { if(!u) return; cout << val[u]; preorder(lc[u]);  preorder(rc[u]); }
void inorder(int u)    { if(!u) return; inorder(lc[u]); cout << val[u];  inorder(rc[u]); }
void postorder(int u)  { if(!u) return; postorder(lc[u]); postorder(rc[u]); cout << val[u]; }
\`\`\`

- 前序：根→左→右；中序：左→根→右；后序：左→右→根；
- **二叉搜索树 BST** 的中序遍历是有序序列；
- 已知“中序 + 前序（或后序）”可唯一重建二叉树。

### 层次遍历（BFS）

\`\`\`cpp
queue<int> q; q.push(root);
while (!q.empty()) {
    int u = q.front(); q.pop();
    cout << val[u];
    if (lc[u]) q.push(lc[u]);
    if (rc[u]) q.push(rc[u]);
}
\`\`\`

## 五、二叉搜索树 BST（概念）

左子树所有值 < 根 < 右子树所有值。查找/插入平均 O(log n)，最坏退化成链 O(n)（提高篇用堆、平衡树思想解决）。

## 六、树的通用存储（多叉树/图）

\`\`\`cpp
vector<int> child[100005];   // 邻接表：child[u] 存 u 的所有孩子
\`\`\`

无根树通常按“无向图”存，DFS 时带父参数防止回头：\`dfs(u, fa)\`。这是提高篇 LCA、树形 DP 的前奏。
`,
    examples: [
      {
        title: '由遍历序列计算二叉树深度',
        level: '基础',
        statement: `**题目描述**

给定二叉树的前序与中序序列（值互不相同，n≤1000），输出树的高度。`,
        samples: [['7\n1 2 4 5 3 6 7\n4 2 5 1 6 3 7', '2']],
        analysis: `### 解题思路

前序首元素是根；在中序中定位根，左侧即左子树、右侧即右子树，递归构建/直接递归计算高度。`,
        code: `#include <iostream>
using namespace std;

int pre[1005], in[1005], n;

int build(int pl, int pr, int il, int ir) {
    if (pl > pr) return -1;            // 空树高度 -1（按边数计）
    int root = pre[pl];
    int k = il;
    while (in[k] != root) k++;
    int leftSize = k - il;
    int hl = build(pl+1, pl+leftSize, il, k-1);
    int hr = build(pl+leftSize+1, pr, k+1, ir);
    return max(hl, hr) + 1;
}

int main() {
    cin >> n;
    for (int i = 0; i < n; i++) cin >> pre[i];
    for (int i = 0; i < n; i++) cin >> in[i];
    cout << build(0, n-1, 0, n-1) << '\\n';
    return 0;
}`,
      },
      {
        title: '二叉树遍历序列互推',
        level: '提高',
        statement: `**题目描述**

输入二叉树的前序和中序序列，输出后序序列。`,
        samples: [['7\nABDGCEF\nDGBAECF', 'GDBEFCA']],
        analysis: `### 解题思路

同样用前序定位根、中序切左右，递归顺序改为“左右根”收集结果。`,
        code: `#include <iostream>
#include <string>
using namespace std;

string pre, in;
string post;

void build(int pl, int pr, int il, int ir) {
    if (pl > pr) return;
    char root = pre[pl];
    int k = in.find(root, il);
    int leftSize = k - il;
    build(pl+1, pl+leftSize, il, k-1);
    build(pl+leftSize+1, pr, k+1, ir);
    post += root;              // 后序：最后访问根
}

int main() {
    int n; cin >> n;
    cin >> pre >> in;
    build(0, n-1, 0, n-1);
    cout << post << '\\n';
    return 0;
}`,
      },
      {
        title: '公司层级（普通树深度）',
        level: '基础',
        statement: `**题目描述**

n 个员工编号 1~n，给出每人的直接上级（根的上级为 0），求公司层级数（树的最大深度，根算第 1 层）。`,
        samples: [['5\n0 1 1 2 2', '3']],
        analysis: `### 解题思路

邻接表存孩子，从根 DFS 带深度参数，取最大值。`,
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> ch[100005];
int ans;

void dfs(int u, int depth) {
    ans = max(ans, depth);
    for (int v : ch[u]) dfs(v, depth + 1);
}

int main() {
    int n, root = 0;          // root 初始化为 0，合法数据中一定会被某个 p==0 的点覆盖
    cin >> n;
    for (int i = 1; i <= n; i++) {
        int p; cin >> p;
        if (p == 0) root = i;
        else ch[p].push_back(i);
    }
    dfs(root, 1);
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**三种遍历顺序混淆**：记忆点是“根”的位置——前/中/后序对应根在前/中/后。`,
      `**空孩子不判 0 直接递归**：数组模拟中 0 哨兵必须作为递归边界。`,
      `**父子关系只存单向**：无根树遍历需要防回头（带 fa 参数）或双向存边。`,
      `**重建树时下标算错**：左子树长度 k-il，前序右子树起点 pl+leftSize+1。`,
      `**完全二叉树数组下标从 0 还是 1**：2i 公式基于根在 1；从 0 开始公式不同。`,
    ],
    exercises: [
      { title: '叶子统计', level: '基础',
        statement: '给定二叉树数组表示，统计叶子结点个数。',
        hint: '递归：空树 0；无左右孩子返回 1；否则左右之和。' },
      { title: '层序换行', level: '基础',
        statement: '层次遍历按层输出，每层一行。',
        hint: '每轮先记下当前队列 size，只处理这么多结点。' },
      { title: 'BST 判定', level: '提高',
        statement: '判断一棵二叉树是否为二叉搜索树。',
        hint: '递归传递合法区间 (lo,hi)，不能只比较与父结点。' },
      { title: '树的直径（树上最长路径）', level: '挑战',
        statement: '给定一棵 n 个结点的无权树，求任意两点间最远距离。',
        hint: '两次 DFS：任一点找最远点 s，再从 s 找最远点，距离即直径（提高篇树形 DP 还会见）。' },
    ],
    summary: `
- 树有 n−1 条边；二叉树分左右孩子，完全二叉树可用数组（根 1，孩子 2i/2i+1）；
- **前/中/后序**是 DFS 三种顺序，层次遍历是 BFS；BST 中序有序；
- 中序 + 前/后序可唯一重建二叉树，关键是用根切分左右子树；
- 普通树用 vector 邻接表存储，无根树 DFS 带父参数，为 LCA、树形 DP 打基础。
`,
  };

  Object.assign(window.TOPICS, T);
})();
