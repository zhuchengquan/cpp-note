/* ============================================================
   核心模板速记 · 第三部分（CSP-S 提高篇）
   结构：TEMPLATES[知识点id] = [{ title, note?, code }]
   code 为 Markdown 代码围栏，全部是可直接编译运行的完整 C++17 程序。
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  /* ================= 第1章 STL 进阶 ================= */
  'stl-advanced': [
    {
      title: '常用 STL 容器与算法速记',
      note: '竞赛中 90% 的数据结构需求都能用这几个容器解决。priority_queue 默认是大根堆。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    /* vector：动态数组 */
    vector<int> a = {5, 2, 8, 1};
    sort(a.begin(), a.end());
    a.push_back(6); a.pop_back();
    cout << "lower_bound(5) 下标 = "
         << lower_bound(a.begin(), a.end(), 5) - a.begin() << '\\n';

    /* set：有序、去重，O(log n) */
    set<int> s(a.begin(), a.end());
    cout << "不同元素个数 = " << s.size()
         << "，含 8？" << s.count(8) << '\\n';

    /* map：有序键值对 */
    map<string, int> mp;
    mp["apple"] = 3; mp["banana"] = 1;
    for (auto [k, v] : mp) cout << k << " = " << v << '\\n';

    /* priority_queue：默认大根堆；greater 变小根堆 */
    priority_queue<int> big;
    for (int x : a) big.push(x);
    cout << "最大值 = " << big.top() << '\\n';
    priority_queue<int, vector<int>, greater<int>> small;
    for (int x : a) small.push(x);
    cout << "最小值 = " << small.top() << '\\n';

    /* pair 与 tuple：默认按分量依次比较 */
    vector<pair<int, int>> ps = {{1, 2}, {0, 5}};
    sort(ps.begin(), ps.end());
    cout << "排序后第一对 = " << ps[0].first << ',' << ps[0].second << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第2章 链表与单调结构 ================= */
  'linked-list': [
    {
      title: '数组模拟单链表（头插法）',
      note: '用下标当指针，比 new 快且不会 MLE。图的邻接表、链式前向星都是这个结构。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int head;                 // 头结点下标，-1 表示空
int val[MAXN], nxt[MAXN], sz;

void init() { head = -1; sz = 0; }
void addHead(int x) {                 // 头插：O(1)
    val[sz] = x;
    nxt[sz] = head;
    head = sz++;
}
void removeAfter(int p) {             // 删除 p 的后继结点
    nxt[p] = nxt[nxt[p]];
}

int main() {
    int n; cin >> n;
    init();
    for (int i = 0; i < n; i++) { int x; cin >> x; addHead(x); }
    for (int p = head; p != -1; p = nxt[p]) cout << val[p] << ' ';
    return 0;
}
\`\`\``,
    },
    {
      title: '数组模拟双链表（带哨兵）',
      note: '0 号作头哨兵、1 号作尾哨兵，任何位置的插入删除都是 O(1)，不用特判空表。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int prv[MAXN], nxt[MAXN], val[MAXN], sz;

void init() {              // 0=头哨兵 1=尾哨兵
    nxt[0] = 1; prv[1] = 0; sz = 2;
}
void insertAfter(int p, int x) {      // 在 p 后面插入 x
    val[sz] = x;
    nxt[sz] = nxt[p]; prv[sz] = p;
    prv[nxt[p]] = sz; nxt[p] = sz;
    sz++;
}
void removeNode(int p) {              // 删除结点 p
    nxt[prv[p]] = nxt[p];
    prv[nxt[p]] = prv[p];
}

int main() {
    int n; cin >> n;
    init();
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        insertAfter(0, x);            // 每次插在最前面
    }
    for (int p = nxt[0]; p != 1; p = nxt[p]) cout << val[p] << ' ';
    return 0;
}
\`\`\``,
    },
  ],

  'mono-stack-queue': [
    {
      title: '单调栈：右侧第一个更大元素',
      note: '栈中保留下标、对应值单调；新元素比栈顶大就弹栈并记录答案。每个元素最多入栈出栈各一次，O(n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int a[MAXN], ans[MAXN];

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];

    stack<int> st;                     // 存下标
    for (int i = 1; i <= n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            ans[st.top()] = i;         // i 是它右侧第一个更大的位置
            st.pop();
        }
        st.push(i);
    }
    while (!st.empty()) { ans[st.top()] = 0; st.pop(); }  // 0 表示不存在
    for (int i = 1; i <= n; i++) cout << ans[i] << ' ';
    return 0;
}
\`\`\``,
    },
    {
      title: '单调队列：滑动窗口最大值',
      note: '队头过期先出队，队尾比新元素小的直接丢弃——队列里始终保持下标递增、值递减。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1000005;
int a[MAXN];

int main() {
    int n, k; cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> a[i];

    deque<int> dq;                     // 存下标
    for (int i = 1; i <= n; i++) {
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front(); // 过期
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back(); // 保递减
        dq.push_back(i);
        if (i >= k) cout << a[dq.front()] << ' ';
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第3章 并查集 ================= */
  'dsu': [
    {
      title: '并查集：路径压缩 + 按大小合并',
      note: 'find 递归时顺手把路径上的结点直接挂到根；合并时小树接大树。单次操作接近 O(1)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int fa[MAXN], sz[MAXN];

void init(int n) {
    iota(fa, fa + n + 1, 0);          // fa[i] = i
    fill(sz, sz + n + 1, 1);
}
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);   // 路径压缩
}
bool unite(int a, int b) {            // 返回是否真的发生了合并
    a = find(a); b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    fa[b] = a; sz[a] += sz[b];        // 小集合挂到大集合上
    return true;
}

int main() {
    int n, m; cin >> n >> m;
    init(n);
    int components = n;
    while (m--) {
        int op, a, b; cin >> op >> a >> b;
        if (op == 1) components -= unite(a, b);
        else cout << (find(a) == find(b) ? "Y" : "N") << '\\n';
    }
    cout << "连通块数：" << components << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第4章 堆 ================= */
  'heap': [
    {
      title: 'TopK：求第 k 大（大小为 k 的小根堆）',
      note: '只保留目前最大的 k 个：堆满后，新数比堆顶（第 k 大候选）大才替换。O(n log k)、O(k) 空间，适合数据流。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, k; cin >> n >> k;
    priority_queue<int, vector<int>, greater<int>> heap; // 小根堆
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if ((int)heap.size() < k) heap.push(x);          // 还没满 k 个
        else if (x > heap.top()) { heap.pop(); heap.push(x); } // 更大才替换
    }
    cout << heap.top() << '\\n';   // 堆顶即第 k 大（堆内是最大的 k 个）
    return 0;
}
\`\`\``,
    },
    {
      title: '对顶堆：动态维护中位数',
      note: '大根堆 lo 装较小一半、小根堆 hi 装较大一半，始终让 lo.size() 等于 hi.size() 或恰好多 1，则 lo 堆顶就是中位数。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    priority_queue<int> lo;                       // 大根堆：较小的一半
    priority_queue<int, vector<int>, greater<int>> hi; // 小根堆：较大的一半
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (lo.empty() || x <= lo.top()) lo.push(x);
        else hi.push(x);
        /* 再平衡：保证 lo.size() == hi.size() 或 hi.size()+1 */
        if (lo.size() > hi.size() + 1) { hi.push(lo.top()); lo.pop(); }
        if (hi.size() > lo.size())     { lo.push(hi.top()); hi.pop(); }
        cout << lo.top() << '\\n';     // 当前中位数（偶数个时取较小的中间值）
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第5章 树状数组与线段树 ================= */
  'bit': [
    {
      title: '树状数组：单点修改 + 区间求和',
      note: '两个操作都走 lowbit（i & -i），O(log n)。下标必须从 1 开始。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
long long bit[MAXN];
int n;

void add(int i, long long v) {         // a[i] += v
    for (; i <= n; i += i & -i) bit[i] += v;
}
long long prefixSum(int i) {           // a[1] + … + a[i]
    long long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int q; cin >> n >> q;
    for (int i = 1; i <= n; i++) { long long x; cin >> x; add(i, x); }
    while (q--) {
        int op, l, r; cin >> op >> l >> r;
        if (op == 1) add(l, r);
        else cout << prefixSum(r) - prefixSum(l - 1) << '\\n';
    }
    return 0;
}
\`\`\``,
    },
    {
      title: '树状数组求逆序对',
      note: '从右往左扫，每个数查询它右侧更小的元素个数；再把自己插入。数据非 1~n 排列时先离散化。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
int bit[MAXN], a[MAXN], n;

void add(int i) { for (; i <= n; i += i & -i) bit[i]++; }
int countLess(int i) {                // 已插入且值 < i 的个数
    int s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n;                           // 输入一个 1~n 的排列
    for (int i = 1; i <= n; i++) cin >> a[i];
    long long ans = 0;
    for (int i = n; i >= 1; i--) {
        ans += countLess(a[i] - 1);     // 右侧比 a[i] 小的
        add(a[i]);
    }
    cout << ans << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'segment-tree': [
    {
      title: '线段树：单点修改 + 区间求和',
      note: '每个结点管一段区间；修改沿一条根到叶的路径，查询把区间拆成 O(log n) 个结点。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
long long seg[4 * MAXN];
int a[MAXN], n;

void build(int p, int l, int r) {
    if (l == r) { seg[p] = a[l]; return; }
    int mid = (l + r) >> 1;
    build(p << 1, l, mid);
    build(p << 1 | 1, mid + 1, r);
    seg[p] = seg[p << 1] + seg[p << 1 | 1];
}
void update(int p, int l, int r, int pos, int v) {
    if (l == r) { seg[p] = v; return; }
    int mid = (l + r) >> 1;
    if (pos <= mid) update(p << 1, l, mid, pos, v);
    else update(p << 1 | 1, mid + 1, r, pos, v);
    seg[p] = seg[p << 1] + seg[p << 1 | 1];
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return seg[p];
    int mid = (l + r) >> 1;
    long long res = 0;
    if (ql <= mid) res += query(p << 1, l, mid, ql, qr);
    if (qr > mid) res += query(p << 1 | 1, mid + 1, r, ql, qr);
    return res;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int q; cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op, x, y; cin >> op >> x >> y;
        if (op == 1) update(1, 1, n, x, y);
        else cout << query(1, 1, n, x, y) << '\\n';
    }
    return 0;
}
\`\`\``,
    },
    {
      title: '线段树：区间加 + 区间求和（懒标记）',
      note: '整段被覆盖时不下传，只打 tag；等将来必须访问儿子时才 pushDown 把标记传下去。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
long long seg[4 * MAXN], tag[4 * MAXN];
int a[MAXN], n;

void build(int p, int l, int r) {
    if (l == r) { seg[p] = a[l]; return; }
    int mid = (l + r) >> 1;
    build(p << 1, l, mid);
    build(p << 1 | 1, mid + 1, r);
    seg[p] = seg[p << 1] + seg[p << 1 | 1];
}
void pushDown(int p, int l, int r) {
    if (tag[p] == 0) return;
    int mid = (l + r) >> 1;
    seg[p << 1]     += tag[p] * (mid - l + 1);
    seg[p << 1 | 1] += tag[p] * (r - mid);
    tag[p << 1]     += tag[p];
    tag[p << 1 | 1] += tag[p];
    tag[p] = 0;
}
void rangeAdd(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { seg[p] += v * (r - l + 1); tag[p] += v; return; }
    pushDown(p, l, r);
    int mid = (l + r) >> 1;
    if (ql <= mid) rangeAdd(p << 1, l, mid, ql, qr, v);
    if (qr > mid) rangeAdd(p << 1 | 1, mid + 1, r, ql, qr, v);
    seg[p] = seg[p << 1] + seg[p << 1 | 1];
}
long long rangeSum(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return seg[p];
    pushDown(p, l, r);
    int mid = (l + r) >> 1;
    long long res = 0;
    if (ql <= mid) res += rangeSum(p << 1, l, mid, ql, qr);
    if (qr > mid) res += rangeSum(p << 1 | 1, mid + 1, r, ql, qr);
    return res;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int q; cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op, l, r; cin >> op >> l >> r;
        if (op == 1) { long long v; cin >> v; rangeAdd(1, 1, n, l, r, v); }
        else cout << rangeSum(1, 1, n, l, r) << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第6章 倍增与 ST 表 ================= */
  'st-table': [
    {
      title: 'ST 表：静态区间最值 RMQ',
      note: '预处理 st[k][i] 表示从 i 起长度 2ᵏ 的最值；查询用两个长度 2ᵏ 的区间覆盖，O(1)。只适用于不修改的数组。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005, LOG = 20;
int st[LOG][MAXN], lg[MAXN];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> st[0][i];

    lg[1] = 0;                                  // 预处理 log2
    for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;

    for (int k = 1; k < LOG; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = max(st[k - 1][i],
                           st[k - 1][i + (1 << (k - 1))]);

    while (q--) {
        int l, r; cin >> l >> r;
        int k = lg[r - l + 1];
        cout << max(st[k][l], st[k][r - (1 << k) + 1]) << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第7章 图论 ================= */
  'graph-store': [
    {
      title: '链式前向星存图',
      note: '数组模拟的邻接表头插法，省内存、速度快，是提高篇图论题的标准存法。无向边存两次。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005, MAXM = 500005;
int head[MAXN], to[MAXM], nxt[MAXM], edgeCnt;

void addEdge(int u, int v) {
    to[edgeCnt] = v;
    nxt[edgeCnt] = head[u];
    head[u] = edgeCnt++;
}

int main() {
    int n, m; cin >> n >> m;
    fill(head, head + n + 1, -1);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        addEdge(u, v);
        addEdge(v, u);                         // 无向图：反向再加一条
    }
    for (int u = 1; u <= n; u++) {
        cout << u << " 的邻接点：";
        for (int e = head[u]; e != -1; e = nxt[e])
            cout << to[e] << ' ';
        cout << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  'graph-traversal': [
    {
      title: '图的 DFS / BFS 与连通块计数',
      note: '每个未访问的点出发做一次遍历就是一个连通块。DFS 用递归（或栈），BFS 用队列。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> g[MAXN];
bool vis[MAXN];

void dfs(int u) {
    vis[u] = true;
    for (int v : g[u])
        if (!vis[v]) dfs(v);
}
void bfs(int start) {
    queue<int> q; q.push(start); vis[start] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u])
            if (!vis[v]) { vis[v] = true; q.push(v); }
    }
}

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    int components = 0;
    for (int u = 1; u <= n; u++)
        if (!vis[u]) { dfs(u); components++; }
    cout << components << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'topo-sort': [
    {
      title: '拓扑排序（Kahn 算法）',
      note: '不断取出入度为 0 的点并删除它的出边；处理不完所有点说明图中有环。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> g[MAXN];
int indeg[MAXN];

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;              // u → v
        g[u].push_back(v);
        indeg[v]++;
    }

    queue<int> q;                             // 需要字典序最小就改 priority_queue
    for (int u = 1; u <= n; u++)
        if (indeg[u] == 0) q.push(u);

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u])
            if (--indeg[v] == 0) q.push(v);
    }

    if ((int)order.size() < n) cout << "图中有环，无拓扑序\\n";
    else {
        for (int x : order) cout << x << ' ';
        cout << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  'shortest-path': [
    {
      title: 'Dijkstra 最短路（堆优化）',
      note: '非负权图通用，O((n+m) log n)。距离数组用 long long，INF 取 LLONG_MAX/4 防加法溢出。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

const int MAXN = 100005;
vector<pair<int, ll>> g[MAXN];               // (终点, 边权)
ll dist[MAXN];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, s; cin >> n >> m >> s;
    for (int i = 0; i < m; i++) {
        int u, v; ll w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }

    fill(dist + 1, dist + n + 1, INF);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>,
                   greater<pair<ll, int>>> pq;   // (距离, 点)
    dist[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;             // 过期的旧记录
        for (auto [v, w] : g[u])
            if (dist[v] > d + w) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
    }
    for (int i = 1; i <= n; i++)
        cout << (dist[i] >= INF / 2 ? -1 : dist[i]) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'SPFA（可处理负权边）',
      note: 'Bellman-Ford 的队列优化；一个点只有在距离被更新时才入队。还能判负环（入队次数 ≥ n）。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

const int MAXN = 100005;
vector<pair<int, ll>> g[MAXN];
ll dist[MAXN];
bool inQueue[MAXN];

int main() {
    int n, m, s; cin >> n >> m >> s;
    for (int i = 0; i < m; i++) {
        int u, v; ll w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }

    fill(dist + 1, dist + n + 1, INF);
    queue<int> q;
    dist[s] = 0; q.push(s); inQueue[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); inQueue[u] = false;
        for (auto [v, w] : g[u])
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                if (!inQueue[v]) { q.push(v); inQueue[v] = true; }
            }
    }
    for (int i = 1; i <= n; i++)
        cout << (dist[i] >= INF / 2 ? -1 : dist[i]) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'Floyd 多源最短路',
      note: '邻接矩阵 DP，O(n³)。关键点 k 必须在最外层；适合 n≤500 的稠密图或要求任意两点距离。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

const int MAXN = 505;
ll d[MAXN][MAXN];
int n, m;

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            d[i][j] = (i == j ? 0 : INF);
    for (int i = 0; i < m; i++) {
        int u, v; ll w; cin >> u >> v >> w;
        d[u][v] = min(d[u][v], w);               // 重边取最小
        d[v][u] = min(d[v][u], w);               // 无向图
    }

    for (int k = 1; k <= n; k++)                 // 中转点必须在最外层
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] < INF && d[k][j] < INF)
                    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);

    int q; cin >> q;
    while (q--) {
        int u, v; cin >> u >> v;
        cout << (d[u][v] >= INF / 2 ? -1 : d[u][v]) << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  'mst': [
    {
      title: 'Kruskal 最小生成树',
      note: '所有边按权排序后依次加入，用并查集跳过会成环的边；选够 n−1 条即结束。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Edge { int u, v; ll w; };
const int MAXN = 10005;
int fa[MAXN];
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }

int main() {
    int n, m; cin >> n >> m;
    vector<Edge> edges(m);
    for (auto &e : edges) cin >> e.u >> e.v >> e.w;
    sort(edges.begin(), edges.end(),
         [](const Edge &a, const Edge &b) { return a.w < b.w; });

    iota(fa, fa + n + 1, 0);
    ll answer = 0; int used = 0;
    for (const auto &e : edges) {
        int a = find(e.u), b = find(e.v);
        if (a == b) continue;                    // 已连通，加入会成环
        fa[a] = b;
        answer += e.w;
        if (++used == n - 1) break;
    }
    cout << (used == n - 1 ? to_string(answer) : "图不连通，无生成树") << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'Prim 最小生成树（O(n²)）',
      note: '从一个点开始，每次把离当前生成树最近的点拉进来。稠密图（邻接矩阵）下比 Kruskal 快。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

const int MAXN = 3005;
ll g[MAXN][MAXN], lowc[MAXN];
bool inTree[MAXN];
int n, m;

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            g[i][j] = (i == j ? 0 : INF);
    for (int i = 0; i < m; i++) {
        int u, v; ll w; cin >> u >> v >> w;
        g[u][v] = min(g[u][v], w);
        g[v][u] = min(g[v][u], w);
    }

    fill(lowc + 1, lowc + n + 1, INF);
    lowc[1] = 0;
    ll answer = 0;
    for (int i = 1; i <= n; i++) {
        int u = -1;
        for (int j = 1; j <= n; j++)
            if (!inTree[j] && (u == -1 || lowc[j] < lowc[u])) u = j;
        if (u == -1 || lowc[u] >= INF / 2) { cout << "图不连通\\n"; return 0; }
        inTree[u] = true; answer += lowc[u];
        for (int v = 1; v <= n; v++)
            if (!inTree[v]) lowc[v] = min(lowc[v], g[u][v]);
    }
    cout << answer << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'tarjan': [
    {
      title: 'Tarjan 求强连通分量（有向图）',
      note: 'dfn 是访问时间，low 是能绕回的最早时间；dfn==low 的点是某个 SCC 的栈底。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005;
vector<int> g[MAXN];
int dfn[MAXN], low[MAXN], belong[MAXN], timer = 0, sccCnt = 0;
stack<int> st;
bool inStack[MAXN];

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    st.push(u); inStack[u] = true;
    for (int v : g[u]) {
        if (!dfn[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (inStack[v]) {
            low[u] = min(low[u], dfn[v]);
        }
    }
    if (dfn[u] == low[u]) {                    // u 是一个 SCC 的根
        sccCnt++;
        while (true) {
            int x = st.top(); st.pop();
            inStack[x] = false; belong[x] = sccCnt;
            if (x == u) break;
        }
    }
}

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }
    for (int u = 1; u <= n; u++) if (!dfn[u]) tarjan(u);
    cout << "强连通分量数：" << sccCnt << '\\n';
    for (int u = 1; u <= n; u++) cout << u << " 属于 SCC " << belong[u] << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'Tarjan 求割点（无向图）',
      note: '根有 ≥2 个 DFS 子树则为割点；非根 u 存在子结点 v 满足 low[v] ≥ dfn[u] 则为割点。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> g[MAXN];
int dfn[MAXN], low[MAXN], timer = 0;
bool isCut[MAXN];

void tarjan(int u, bool isRoot) {
    dfn[u] = low[u] = ++timer;
    int child = 0;
    for (int v : g[u]) {
        if (!dfn[v]) {
            child++;
            tarjan(v, false);
            low[u] = min(low[u], low[v]);
            if ((isRoot && child > 1) || (!isRoot && low[v] >= dfn[u]))
                isCut[u] = true;
        } else {
            low[u] = min(low[u], dfn[v]);
        }
    }
}

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    for (int u = 1; u <= n; u++) if (!dfn[u]) tarjan(u, true);
    for (int u = 1; u <= n; u++)
        if (isCut[u]) cout << u << ' ';
    cout << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'bipartite': [
    {
      title: '二分图判定（染色法）',
      note: 'BFS 把相邻点染成相反颜色；出现相邻同色就不是二分图（等价于不存在奇环）。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> g[MAXN];
int color[MAXN];                                 // -1 未染色，0/1 两色

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    fill(color + 1, color + n + 1, -1);

    bool ok = true;
    for (int start = 1; start <= n && ok; start++) {
        if (color[start] != -1) continue;
        queue<int> q; q.push(start); color[start] = 0;
        while (!q.empty() && ok) {
            int u = q.front(); q.pop();
            for (int v : g[u]) {
                if (color[v] == -1) { color[v] = color[u] ^ 1; q.push(v); }
                else if (color[v] == color[u]) { ok = false; break; }
            }
        }
    }
    cout << (ok ? "是二分图" : "不是二分图") << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '匈牙利算法：二分图最大匹配',
      note: '给左部每个点尝试增广：能直接配就配，不能就让前任腾位置。匹配数即为答案。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1005;
vector<int> g[MAXN];        // 左部点 → 相邻的右部点
int matchR[MAXN];           // 右部点当前匹配的左部点，0 表示未匹配
bool tried[MAXN];

bool augment(int u) {
    for (int v : g[u]) {
        if (tried[v]) continue;
        tried[v] = true;
        if (matchR[v] == 0 || augment(matchR[v])) {
            matchR[v] = u;
            return true;
        }
    }
    return false;
}

int main() {
    int nL, nR, m; cin >> nL >> nR >> m;
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; g[u].push_back(v); }
    int matching = 0;
    for (int u = 1; u <= nL; u++) {
        fill(tried + 1, tried + nR + 1, false);
        if (augment(u)) matching++;
    }
    cout << matching << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第8章 树上算法 ================= */
  'lca': [
    {
      title: '倍增 LCA：O(n log n) 预处理，O(log n) 查询',
      note: 'up[k][u] 是 u 向上 2ᵏ 级祖先。查询时先把深的点提齐，再一起向上跳到 LCA 下方。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005, LOG = 20;
vector<int> tree[MAXN];
int dep[MAXN], up[LOG][MAXN];

void build(int root, int n) {               // BFS 预处理深度与倍增表
    queue<int> q; q.push(root);
    dep[root] = 1;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int k = 1; k < LOG; k++)
            up[k][u] = up[k - 1][up[k - 1][u]];
        for (int v : tree[u]) {
            if (v == up[0][u]) continue;
            dep[v] = dep[u] + 1;
            up[0][v] = u;
            q.push(v);
        }
    }
}
int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    for (int k = LOG - 1; k >= 0; k--)        // 提到同一深度
        if (dep[u] - (1 << k) >= dep[v]) u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        tree[u].push_back(v); tree[v].push_back(u);
    }
    build(1, n);
    while (q--) { int u, v; cin >> u >> v; cout << lca(u, v) << '\\n'; }
    return 0;
}
\`\`\``,
    },
  ],

  'tree-dp': [
    {
      title: '树形 DP：没有上司的舞会',
      note: 'f[u][0/1] 表示 u 不参加/参加时的最大快乐值；子树之间相互独立，后序位置合并。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 6005;
vector<int> children[MAXN];
long long happy[MAXN], f[MAXN][2];
bool hasParent[MAXN];

void dfs(int u) {
    f[u][1] = happy[u];                        // u 参加
    f[u][0] = 0;                               // u 不参加
    for (int v : children[u]) {
        dfs(v);
        f[u][1] += f[v][0];                    // 上司参加，下属不能参加
        f[u][0] += max(f[v][0], f[v][1]);      // 上司不参加，下属随意
    }
}

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cin >> happy[i];
    for (int i = 1; i < n; i++) {
        int boss, staff; cin >> staff >> boss; // staff 的直属上司是 boss
        children[boss].push_back(staff);
        hasParent[staff] = true;
    }
    int root = 1;
    while (hasParent[root]) root++;
    dfs(root);
    cout << max(f[root][0], f[root][1]) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '树形 DP：树的直径',
      note: 'd1[u]、d2[u] 是从 u 向下最长、次长的两条路径；经过 u 的最长链为二者之和。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005;
vector<pair<int, int>> g[MAXN];      // (邻接点, 边长)
long long d1[MAXN], d2[MAXN];
long long diameter = 0;

void dfs(int u, int parent) {
    for (auto [v, w] : g[u]) {
        if (v == parent) continue;
        dfs(v, u);
        long long d = d1[v] + w;
        if (d > d1[u]) { d2[u] = d1[u]; d1[u] = d; }
        else if (d > d2[u]) d2[u] = d;
    }
    diameter = max(diameter, d1[u] + d2[u]);
}

int main() {
    int n; cin >> n;
    for (int i = 0; i < n - 1; i++) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }
    dfs(1, 0);
    cout << diameter << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第9章 动态规划进阶 ================= */
  'knapsack-advanced': [
    {
      title: '多重背包：二进制拆分',
      note: '把 c 个相同物品拆成 1,2,4,…,余数 个"打包物品"，任意数量都能组合出来，再做 01 背包。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXW = 1005;
int f[MAXW];

int main() {
    int n, W; cin >> n >> W;
    vector<pair<int, int>> packs;         // (打包重量, 打包价值)
    for (int i = 0; i < n; i++) {
        int w, v, c; cin >> w >> v >> c;  // c 个该物品
        for (int k = 1; k < c; k <<= 1) {
            packs.push_back({w * k, v * k});
            c -= k;
        }
        if (c > 0) packs.push_back({w * c, v * c});
    }
    for (auto [w, v] : packs)
        for (int c = W; c >= w; c--)      // 每个包最多选一次
            f[c] = max(f[c], f[c - w] + v);
    cout << f[W] << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '分组背包：每组至多选一件',
      note: '组的循环在最外，容量倒序枚举在中间，组内物品在最内——保证同一件物品不会被重复使用。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXW = 1005;
int f[MAXW];

int main() {
    int G, W; cin >> G >> W;
    for (int g = 0; g < G; g++) {
        int k; cin >> k;
        vector<pair<int, int>> items(k);
        for (auto &[w, v] : items) cin >> w >> v;
        for (int c = W; c >= 0; c--)                 // 容量必须倒序
            for (auto [w, v] : items)
                if (c >= w)
                    f[c] = max(f[c], f[c - w] + v);
    }
    cout << f[W] << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'dp-interval': [
    {
      title: '区间 DP：石子合并',
      note: '枚举区间长度 → 起点 → 分界点。f[i][j] = 最优子区间 + 本区间合并代价（前缀和求）。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 305, INF = 0x3f3f3f3f;
int f[MAXN][MAXN], pre[MAXN];

int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) {
        int x; cin >> x;
        pre[i] = pre[i - 1] + x;
    }
    memset(f, 0x3f, sizeof(f));
    for (int i = 1; i <= n; i++) f[i][i] = 0;  // 一堆不用合并

    for (int len = 2; len <= n; len++)          // 区间长度
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            for (int k = i; k < j; k++)         // 最后一次在 k 后合并
                f[i][j] = min(f[i][j],
                              f[i][k] + f[k + 1][j] + pre[j] - pre[i - 1]);
        }
    cout << f[1][n] << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  'dp-bitmask': [
    {
      title: '状压 DP：旅行商 TSP',
      note: '用一个整数的二进制位表示"已访问集合"。dp[S][i]：走过集合 S 且停在 i 的最小代价。n ≤ 20。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

const int MAXN = 15;
ll dp[1 << MAXN][MAXN], w[MAXN][MAXN];

int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> w[i][j];

    for (int S = 0; S < (1 << n); S++)
        for (int i = 0; i < n; i++) dp[S][i] = INF;
    dp[1][0] = 0;                       // 从 0 号城市出发
    for (int S = 0; S < (1 << n); S++) {
        for (int i = 0; i < n; i++) {
            if (!(S & (1 << i)) || dp[S][i] >= INF / 2) continue;
            for (int j = 0; j < n; j++)
                if (!(S & (1 << j)))
                    dp[S | (1 << j)][j] =
                        min(dp[S | (1 << j)][j], dp[S][i] + w[i][j]);
        }
    }
    ll ans = INF;
    int full = (1 << n) - 1;
    for (int i = 1; i < n; i++) ans = min(ans, dp[full][i] + w[i][0]);
    cout << ans << '\\n';                              // 不要求回到起点就不加 w[i][0]
    return 0;
}
\`\`\``,
    },
  ],

  'dp-digit': [
    {
      title: '数位 DP：统计数位和等于 S 的数',
      note: '按位从高到低 DFS；tight 表示前缀是否贴着上界，不贴时状态可记忆化复用。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int digit[20], memo[20][205], targetSum;

int dfs(int pos, int sum, bool tight) {
    if (pos < 0) return sum == targetSum ? 1 : 0;
    if (!tight && memo[pos][sum] != -1) return memo[pos][sum];
    int upper = tight ? digit[pos] : 9;
    int res = 0;
    for (int d = 0; d <= upper; d++)
        res += dfs(pos - 1, sum + d, tight && d == upper);
    if (!tight) memo[pos][sum] = res;
    return res;
}

int countUpTo(int x) {                  // 统计 [0, x] 中数位和 = targetSum 的数
    int len = 0;
    while (x > 0) { digit[len++] = x % 10; x /= 10; }
    memset(memo, -1, sizeof(memo));
    return dfs(len - 1, 0, true);
}

int main() {
    int X; cin >> X >> targetSum;
    cout << countUpTo(X) << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第10章 数论进阶 ================= */
  'number-theory': [
    {
      title: '线性筛 + 欧拉函数 φ',
      note: '每个合数只被它的最小质因子筛掉，O(n)；筛的同时递推 φ：整除取 φ(n)·p，否则乘 p−1。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1000005;
bool composite[MAXN];
int phi[MAXN];
vector<int> primes;

int main() {
    int n; cin >> n;
    phi[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (!composite[i]) { primes.push_back(i); phi[i] = i - 1; }
        for (int p : primes) {
            if (1LL * i * p > n) break;
            composite[i * p] = true;
            if (i % p == 0) { phi[i * p] = phi[i] * p; break; }
            else phi[i * p] = phi[i] * (p - 1);
        }
    }
    long long sumPhi = 0;
    for (int i = 1; i <= n; i++) sumPhi += phi[i];
    cout << primes.size() << " 个质数，φ 之和 = " << sumPhi << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '扩展欧几里得 EXGCD',
      note: '在求 gcd 的同时解出 ax+by=gcd(a,b) 的一组整数解，是求逆元、解同余方程的基础。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll exgcd(ll a, ll b, ll &x, ll &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    ll d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}

int main() {
    ll a, b; cin >> a >> b;
    ll x, y;
    ll d = exgcd(a, b, x, y);
    cout << "gcd = " << d << '\\n';
    cout << "一组解 x = " << x << ", y = " << y << '\\n';
    cout << "校验 ax + by = " << a * x + b * y << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: '模逆元：快速幂法 + 线性递推',
      note: 'p 为质数时 a⁻¹ ≡ a^(p−2) (mod p)；要求 1~n 全部逆元时用 inv[i] 递推，O(n)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll qpow(ll a, ll b, ll mod) {
    ll res = 1;
    while (b) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

int main() {
    const ll P = 1000000007;
    int n; cin >> n;
    cout << n << "^(-1) (费马) = " << qpow(n, P - 2, P) << '\\n';

    /* 线性递推求 1..n 的全部逆元（P 为质数） */
    const int MAXN = 1000005;
    static ll inv[MAXN];
    inv[1] = 1;
    for (int i = 2; i <= n; i++)
        inv[i] = (P - P / i) * inv[P % i] % P;
    cout << "递推校验 inv[n] = " << inv[n] << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第11章 组合数学 ================= */
  'combinatorics': [
    {
      title: '组合数：阶乘 + 逆元预处理',
      note: '预处理 fac 与 ifac 后，C(n,k) 三次乘法 O(1)；适用于模数为大质数（如 1e9+7）。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const int MAXN = 1000005;
const ll P = 1000000007;
ll fac[MAXN], ifac[MAXN];

ll qpow(ll a, ll b) {
    ll res = 1;
    while (b) {
        if (b & 1) res = res * a % P;
        a = a * a % P;
        b >>= 1;
    }
    return res;
}
void prepare(int n) {
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % P;
    ifac[n] = qpow(fac[n], P - 2);
    for (int i = n; i >= 1; i--) ifac[i - 1] = ifac[i] * i % P;
}
ll C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fac[n] * ifac[k] % P * ifac[n - k] % P;
}

int main() {
    int n; cin >> n;
    prepare(n);
    int q; cin >> q;
    while (q--) { int a, b; cin >> a >> b; cout << C(a, b) << '\\n'; }
    return 0;
}
\`\`\``,
    },
  ],

  /* ================= 第12章 字符串与网络流 ================= */
  'string-kmp': [
    {
      title: 'KMP 字符串匹配',
      note: 'nxt[i] 是模式串前缀 s[0..i] 的最长相等前后缀长度；失配时沿 nxt 回跳而不回退文本指针，O(n+m)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXM = 10005;
int nxt[MAXM];

void buildNext(const string &p) {
    nxt[0] = 0;
    for (int i = 1, j = 0; i < (int)p.size(); i++) {
        while (j > 0 && p[i] != p[j]) j = nxt[j - 1];
        if (p[i] == p[j]) j++;
        nxt[i] = j;
    }
}
int countMatch(const string &s, const string &p) {
    int cnt = 0;
    for (int i = 0, j = 0; i < (int)s.size(); i++) {
        while (j > 0 && s[i] != p[j]) j = nxt[j - 1];
        if (s[i] == p[j]) j++;
        if (j == (int)p.size()) { cnt++; j = nxt[j - 1]; }
    }
    return cnt;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s, p; cin >> s >> p;
    buildNext(p);
    cout << countMatch(s, p) << '\\n';
    return 0;
}
\`\`\``,
    },
    {
      title: 'Trie 字典树',
      note: '公共前缀共用结点，边代表一个字符。插入与查询都是 O(单词长度)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXNODE = 100005;
int ch[MAXNODE][26], passCnt[MAXNODE], nodeCnt = 1;  // 1 是根结点

void insert(const string &s) {
    int u = 1;
    for (char c : s) {
        int x = c - 'a';
        if (ch[u][x] == 0) ch[u][x] = ++nodeCnt;
        u = ch[u][x];
        passCnt[u]++;
    }
}
int countPrefix(const string &s) {             // 以 s 为前缀的单词数
    int u = 1;
    for (char c : s) {
        int x = c - 'a';
        if (ch[u][x] == 0) return 0;
        u = ch[u][x];
    }
    return passCnt[u];
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, q; cin >> n >> q;
    for (int i = 0; i < n; i++) { string s; cin >> s; insert(s); }
    while (q--) { string s; cin >> s; cout << countPrefix(s) << '\\n'; }
    return 0;
}
\`\`\``,
    },
    {
      title: '字符串哈希（unsigned long long 自然溢出）',
      note: '利用 unsigned 溢出自动对 2⁶⁴ 取模；子串哈希 = h[r] − h[l−1]×base^长度。比较前先判长度。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ull = unsigned long long;

const ull BASE = 131;
const int MAXN = 100005;
ull h[MAXN], power[MAXN];

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin >> s;
    int n = (int)s.size();
    power[0] = 1;
    for (int i = 1; i <= n; i++) {
        h[i] = h[i - 1] * BASE + s[i - 1];
        power[i] = power[i - 1] * BASE;
    }
    auto subHash = [&](int l, int r) {        // 1-based 闭区间
        return h[r] - h[l - 1] * power[r - l + 1];
    };
    int q; cin >> q;
    while (q--) {
        int l1, r1, l2, r2; cin >> l1 >> r1 >> l2 >> r2;
        cout << (subHash(l1, r1) == subHash(l2, r2) ? "Yes" : "No") << '\\n';
    }
    return 0;
}
\`\`\``,
    },
  ],

  'network-flow': [
    {
      title: 'Dinic 最大流',
      note: 'BFS 建分层图 → DFS 沿层数递增的路多路增广，重复到不可达汇点。反边给流量"反悔"的机会。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX / 4;

struct Edge { int to, rev; ll cap; };
const int MAXN = 10005;
vector<Edge> g[MAXN];
int level[MAXN], cur[MAXN];

void addEdge(int u, int v, ll cap) {
    g[u].push_back({v, (int)g[v].size(), cap});
    g[v].push_back({u, (int)g[u].size() - 1, 0});   // 反向边容量为 0
}
bool bfs(int s, int t) {
    memset(level, -1, sizeof(level));
    queue<int> q; q.push(s); level[s] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (const auto &e : g[u])
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
    }
    return level[t] != -1;
}
ll dfs(int u, int t, ll flow) {
    if (u == t) return flow;
    for (int &i = cur[u]; i < (int)g[u].size(); i++) {
        Edge &e = g[u][i];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {
            ll pushed = dfs(e.to, t, min(flow, e.cap));
            if (pushed > 0) {
                e.cap -= pushed;
                g[e.to][e.rev].cap += pushed;
                return pushed;
            }
        }
    }
    return 0;
}
ll maxFlow(int s, int t) {
    ll total = 0;
    while (bfs(s, t)) {
        memset(cur, 0, sizeof(cur));
        while (ll pushed = dfs(s, t, INF)) total += pushed;
    }
    return total;
}

int main() {
    int n, m, s, t; cin >> n >> m >> s >> t;
    for (int i = 0; i < m; i++) {
        int u, v; ll c; cin >> u >> v >> c;
        addEdge(u, v, c);
    }
    cout << maxFlow(s, t) << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
