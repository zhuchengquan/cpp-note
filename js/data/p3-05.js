/* ============================================================
   第三部分 · 第5章 树状数组与线段树
   bit / segment-tree
   ============================================================ */
(function () {
  const T = {};

  T['bit'] = {
    chapter: '第5章 树状数组与线段树',
    time: '约 55 分钟',
    body: `
## 一、lowbit：二进制的魔法

\`lowbit(x) = x & (-x)\`：取 x 的二进制中最低位的 1 所表示的值。

例：x=12=1100₂，lowbit=4；x=10=1010₂，lowbit=2。

树状数组（Fenwick Tree / BIT）正是用 lowbit 把前缀和组织成一棵树。

## 二、树状数组解决什么问题？

维护一个序列，支持（下标从 1 开始）：

- **单点修改**：给 a[pos] 加 v；
- **前缀查询**：求 a[1]+…+a[x]；

均为 O(log n)。区间和 = 两个前缀和之差。

\`\`\`cpp
int bit[MAXN];
void add(int pos, int v) {
    for (int i = pos; i < MAXN; i += i & -i) bit[i] += v;
}
int prefix(int pos) {
    int s = 0;
    for (int i = pos; i > 0; i -= i & -i) s += bit[i];
    return s;
}
int rangeSum(int l, int r) { return prefix(r) - prefix(l - 1); }
\`\`\`

记忆：修改往**右上**（+lowbit），查询往**左下**（-lowbit）。

## 三、三大经典应用

### 1. 逆序对

从右往左扫，查询“已经出现且比当前小”的数量；或从左往右查“比当前大”的已出现数量：

\`\`\`cpp
for (int i = n; i >= 1; i--) {
    ans += prefix(a[i] - 1);  // 右边比 a[i] 小的个数
    add(a[i], 1);
}
\`\`\`

值域大时先**离散化**再入树。

### 2. 区间加 + 单点查（差分树状数组）

BIT 维护差分数组：区间 [l,r] 加 v → add(l,v)、add(r+1,-v)；点 x 的值 = prefix(x)。

### 3. 区间加 + 区间和（两个 BIT 的数学技巧）

维护 d[i]：Σa[i] = Σ(k+1)d[k]... 标准结论：用 BIT1 维护 d[i]，BIT2 维护 i·d[i]，
前缀和 = (x+1)·Σd − Σ(i·d)。

## 四、与线段树的取舍

- 只需“单点改+区间和”或“区间改+单点查” → BIT，代码短常数小；
- 区间同时修改+查询、区间最值、复杂合并 → 线段树；
- 下标必须从 1 开始（0 没有 lowbit），离散化常配合使用。
`,
    examples: [
      {
        title: '动态前缀和（模板）',
        level: '基础',
        statement: `**题目描述**

n 个数初始为 0，支持 m 个操作：1 x v 给位置 x 加 v；2 l r 查询区间和。n,m≤5×10⁵。`,
        samples: [['5 5\n1 2 3\n1 3 4\n2 1 3\n1 2 1\n2 2 3', '7\n8']],
        analysis: `### 解题思路

树状数组模板。两次修改后 a=[0,3,4,0,0]，区间 [1,3] 和 7；再给位置 2 加 1，[2,3] 和 8。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 500005;
long long bit[MAXN];
int n, m;

void add(int pos, long long v) {
    for (int i = pos; i <= n; i += i & -i) bit[i] += v;
}
long long prefix(int pos) {
    long long s = 0;
    for (int i = pos; i > 0; i -= i & -i) s += bit[i];
    return s;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    while (m--) {
        int op; cin >> op;
        if (op == 1) {
            int x; long long v; cin >> x >> v;
            add(x, v);
        } else {
            int l, r; cin >> l >> r;
            cout << prefix(r) - prefix(l - 1) << '\\n';
        }
    }
    return 0;
}`,
      },
      {
        title: '逆序对计数',
        level: '提高',
        statement: `**题目描述**

n 个数的排列，求逆序对数量（i<j 且 a[i]>a[j]）。n≤5×10⁵。`,
        samples: [['5\n5 3 4 2 1', '9']],
        analysis: `### 解题思路

从右往左，BIT 统计“已扫到的（右侧）数中比 a[i] 小”的个数。本题是排列可直接按下标；非排列先离散化。答案用 long long。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 500005;
int bit[MAXN], a[MAXN], n;

void add(int p, int v) { for (; p <= n; p += p & -p) bit[p] += v; }
int sum(int p) { int s = 0; for (; p > 0; p -= p & -p) s += bit[p]; return s; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];

    long long ans = 0;
    for (int i = n; i >= 1; i--) {
        ans += sum(a[i] - 1);   // 已出现且小于 a[i] 的
        add(a[i], 1);
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
      {
        title: '区间加 + 单点查',
        level: '提高',
        statement: `**题目描述**

n 个元素初始为 0，m 次操作：1 l r v 区间加；2 x 查询单点最终值。`,
        samples: [['4 3\n1 1 3 5\n1 2 4 2\n2 3', '7']],
        analysis: `### 解题思路

BIT 维护差分：区间 [l,r]+v 等价 d[l]+=v、d[r+1]-=v；位置 x 的值是差分前缀和。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 500005;
long long bit[MAXN];
int n, m;
void add(int p, long long v) { for (; p <= n; p += p & -p) bit[p] += v; }
long long prefix(int p) { long long s = 0; for (; p > 0; p -= p & -p) s += bit[p]; return s; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m;
    while (m--) {
        int op; cin >> op;
        if (op == 1) {
            int l, r; long long v; cin >> l >> r >> v;
            add(l, v);
            add(r + 1, -v);
        } else {
            int x; cin >> x;
            cout << prefix(x) << '\\n';
        }
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**下标从 0 开始**：lowbit(0)=0，BIT 必须 1-based，读入时平移下标。`,
      `**更新写错方向**：add 是 +=lowbit，query 是 -=lowbit，记反直接错。`,
      `**逆序对用 int**：最多 n(n-1)/2 ≈ 1.25×10¹¹，必须 long long。`,
      `**值域大不入离散化**：a[i] 到 10⁹ 不能直接当 BIT 下标。`,
      `**差分数组 r+1 越界**：数组开到 n+2。`,
    ],
    exercises: [
      { title: '单点修改+区间和变体', level: '基础',
        statement: '初始数组非全 0：先读入 n 个数，用 add(i,a[i]) 建树。',
        hint: 'BIT 没有“批量建树”也可 O(n log n) 逐个 add。' },
      { title: '顺序对计数', level: '提高',
        statement: '求 i<j 且 a[i]<a[j] 的数对数量。',
        hint: '总对数 n(n-1)/2 减去逆序对数，或直接查已出现的更小值。' },
      { title: '区间加+区间和', level: '挑战',
        statement: '同时支持区间加与区间求和。',
        hint: '双 BIT：(x+1)·Σd − Σi·d。' },
      { title: '二维树状数组', level: '挑战',
        statement: '矩阵上单点加、矩形求和。',
        hint: '双层 for 各自 lowbit，容斥输出矩形答案。' },
    ],
    summary: `
- lowbit(x)=x&(-x) 是树状数组的组织核心；单点修改 +=lowbit，前缀查询 -=lowbit，均 O(log n)；
- 区间和 = 前缀和之差；逆序对是经典应用（配合离散化）；
- BIT 维护差分可做“区间加+单点查”，双 BIT 可做“区间加+区间和”；
- 下标必须从 1 开始；复杂区间操作交线段树。
`,
  };

  T['segment-tree'] = {
    chapter: '第5章 树状数组与线段树',
    time: '约 65 分钟',
    body: `
## 一、线段树是什么？

把区间不断二分形成一棵二叉树：每个结点代表一段区间，保存该区间的聚合信息（和、最大值、最小值等）。

\`\`\`text
                    [1,8]
              /              \\
          [1,4]              [5,8]
         /    \\              /    \\
      [1,2] [3,4]        [5,6]  [7,8]
      ...
\`\`\`

任意区间查询会被拆成 O(log n) 个结点；单点修改沿一条根到叶子的路径更新，也是 O(log n)。

## 二、四个核心函数

\`\`\`cpp
long long sum[MAXN*4], lazy[MAXN*4];

void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int mid = (l+r)/2;
    build(p*2, l, mid);
    build(p*2+1, mid+1, r);
    sum[p] = sum[p*2] + sum[p*2+1];
}

void pushDown(int p, int l, int r) {       // 懒标记下放
    if (lazy[p] == 0) return;
    int mid = (l+r)/2;
    sum[p*2]   += lazy[p] * (mid-l+1);
    sum[p*2+1] += lazy[p] * (r-mid);
    lazy[p*2]  += lazy[p];
    lazy[p*2+1]+= lazy[p];
    lazy[p] = 0;
}

void rangeAdd(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) {              // 完全覆盖：打懒标记
        sum[p] += v * (r-l+1);
        lazy[p] += v;
        return;
    }
    pushDown(p, l, r);
    int mid = (l+r)/2;
    if (ql <= mid) rangeAdd(p*2, l, mid, ql, qr, v);
    if (qr > mid)  rangeAdd(p*2+1, mid+1, r, ql, qr, v);
    sum[p] = sum[p*2] + sum[p*2+1];
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushDown(p, l, r);
    int mid = (l+r)/2;
    long long res = 0;
    if (ql <= mid) res += query(p*2, l, mid, ql, qr);
    if (qr > mid)  res += query(p*2+1, mid+1, r, ql, qr);
    return res;
}
\`\`\`

## 三、懒标记思想（重点）

区间修改时，如果某结点区间被**完全覆盖**，不必进入子结点——只更新该结点的值并记一笔 lazy；将来必须进入子结点（查询/继续修改）时，再把标记**下放**。

这保证每次操作只碰 O(log n) 个结点。

## 四、线段树能做什么

- 区间加 / 区间乘 / 区间赋值（各有对应的标记，乘加混合要注意标记顺序）；
- 区间和、区间最值；
- 求满足条件的第一个位置（线段树上二分）；
- 扫描线、动态开点、权值线段树（提高篇进阶内容）。

## 五、注意事项

- 数组开 **4 倍 n**；
- build/修改/查询的区间参数 l、r 始终表示结点 p 自身区间，ql、qr 才是询问区间，别混用；
- “完全覆盖”是递归终止条件；部分覆盖先 pushDown 再递归；
- 赋值类标记需要额外的“是否有标记”布尔量。
`,
    examples: [
      {
        title: '线段树模板：区间加 + 区间求和',
        level: '提高',
        statement: `**题目描述**

n 个数，m 个操作：1 l r v 区间加；2 l r 查询区间和。n,m≤10⁵。`,
        samples: [['5 3\n1 2 3 4 5\n1 1 3 2\n2 2 4\n2 1 5', '13\n21']],
        analysis: `### 解题思路

加完 [1,3] 后数组 3,4,5,4,5。区间 [2,4] 和 11，[1,5] 和 20。完整套用懒标记模板。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
long long a[MAXN], sum[MAXN*4], lazy[MAXN*4];

void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int mid = (l+r)/2;
    build(p*2, l, mid);
    build(p*2+1, mid+1, r);
    sum[p] = sum[p*2] + sum[p*2+1];
}
void pushDown(int p, int l, int r) {
    if (!lazy[p]) return;
    int mid = (l+r)/2;
    sum[p*2] += lazy[p]*(mid-l+1);
    sum[p*2+1] += lazy[p]*(r-mid);
    lazy[p*2] += lazy[p];
    lazy[p*2+1] += lazy[p];
    lazy[p] = 0;
}
void rangeAdd(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) {
        sum[p] += v*(r-l+1);
        lazy[p] += v;
        return;
    }
    pushDown(p, l, r);
    int mid = (l+r)/2;
    if (ql <= mid) rangeAdd(p*2, l, mid, ql, qr, v);
    if (qr > mid)  rangeAdd(p*2+1, mid+1, r, ql, qr, v);
    sum[p] = sum[p*2] + sum[p*2+1];
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushDown(p, l, r);
    int mid = (l+r)/2;
    long long res = 0;
    if (ql <= mid) res += query(p*2, l, mid, ql, qr);
    if (qr > mid)  res += query(p*2+1, mid+1, r, ql, qr);
    return res;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (m--) {
        int op, l, r; cin >> op >> l >> r;
        if (op == 1) { long long v; cin >> v; rangeAdd(1,1,n,l,r,v); }
        else cout << query(1,1,n,l,r) << '\\n';
    }
    return 0;
}`,
      },
      {
        title: '区间最值与单点修改',
        level: '基础',
        statement: `**题目描述**

n 个数，支持单点修改与区间最大值查询。`,
        samples: [['5 3\n1 9 3 7 5\n2 1 5\n1 2 0\n2 1 3', '9\n3']],
        analysis: `### 解题思路

不含区间修改，无需懒标记。聚合操作换成 max。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 100005;
int a[MAXN], mx[MAXN*4];

void build(int p, int l, int r) {
    if (l == r) { mx[p] = a[l]; return; }
    int mid = (l+r)/2;
    build(p*2,l,mid); build(p*2+1,mid+1,r);
    mx[p] = max(mx[p*2], mx[p*2+1]);
}
void update(int p, int l, int r, int pos, int v) {
    if (l == r) { mx[p] = v; return; }
    int mid = (l+r)/2;
    if (pos <= mid) update(p*2,l,mid,pos,v);
    else update(p*2+1,mid+1,r,pos,v);
    mx[p] = max(mx[p*2], mx[p*2+1]);
}
int query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return mx[p];
    int mid = (l+r)/2, res = INT_MIN;
    if (ql <= mid) res = max(res, query(p*2,l,mid,ql,qr));
    if (qr > mid)  res = max(res, query(p*2+1,mid+1,r,ql,qr));
    return res;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1,1,n);
    while (m--) {
        int op; cin >> op;
        if (op == 1) { int p, v; cin >> p >> v; update(1,1,n,p,v); }
        else { int l, r; cin >> l >> r; cout << query(1,1,n,l,r) << '\\n'; }
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**数组只开 n 大小**：线段树要 4n。`,
      `**懒标记只更新值不下放**：子查询会丢信息；进入子结点前必须 pushDown。`,
      `**区间长度乘错**：左段 mid-l+1、右段 r-mid。`,
      `**忘记递归返回条件**：完全覆盖区间必须立即 return，否则重复更新。`,
      `**赋值与加法混用同一标记**：区间覆盖需要单独 bool 标记，并在收到赋值时清掉加标记。`,
    ],
    exercises: [
      { title: '区间最小值', level: '基础',
        statement: '把求和模板改成区间最小值查询。',
        hint: '聚合用 min，初值按题意；注意懒标记不适用于最值的普通加法场景外。' },
      { title: '区间乘 + 区间加', level: '挑战',
        statement: '支持区间乘 v、区间加 v、区间求和（取模）。',
        hint: '维护 mul 与 add 双标记，下放时先乘后加并同步变换 add。' },
      { title: '寻找第一个大于 x 的位置', level: '挑战',
        statement: '在线段树上二分求最左满足值>x 的下标。',
        hint: '左子树最大值>x 就进左，否则进右。' },
      { title: '借教室（NOIP 真题简化）', level: '挑战',
        statement: '区间加减与可行性判定结合二分答案。',
        hint: 'check 中按租借单做区间减，任意点变负即不可行。' },
    ],
    summary: `
- 线段树把区间二分组织成树，区间查询/修改 O(log n)，数组开 4n；
- 四件套：build、pushDown、rangeUpdate、query；完全覆盖立即返回是关键；
- **懒标记**把区间修改延迟到必须下钻时下放，保证 O(log n)；
- 可维护和/最值等任意满足结合律的信息；乘加混合、区间赋值需要更细致的标记设计。
`,
  };

  Object.assign(window.TOPICS, T);
})();
