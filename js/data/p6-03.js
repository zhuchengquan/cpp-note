/* ============================================================
   第六部分 · 第3章 高级分治
   cdq-divide / overall-binary / offline-conn
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- CDQ 分治 ---------------- */
  T['cdq-divide'] = {
    chapter: '第3章 高级分治',
    time: '约 50 分钟',
    body: `
## 一、从"逆序对"到 CDQ

归并排序求逆序对，本质是**分治统计"左半对右半的贡献"**。**CDQ 分治**把这个思想推广到
**多维偏序**等离线问题，由陈丹琦提出而得名。

核心套路（三步）：

\`\`\`text
cdq(l, r):
  ① 递归处理左半 cdq(l,mid)、右半 cdq(mid+1,r)
  ② 统计"左半元素对右半元素"产生的贡献
  ③ 按需要合并/保持有序
\`\`\`

关键在于：**只统计跨过中点（左→右）的贡献**，递归已处理各自内部，所以不重不漏。

## 二、经典应用：三维偏序（陌上花开）

给定 n 个三元组 (a,b,c)，对每个元素求有多少元素 x 满足
\`x.a≤a, x.b≤b, x.c≤c 且 x≠自己\`（三个维度都不大于它）。

### 解法
1. 先按第一维 **a 排序**（保证 CDQ 左半的 a ≤ 右半）；
2. CDQ 分治处理第二维 **b**：递归后，把左右两半各按 b 排序，
   用**双指针**把左半 b≤当前 的元素加入**树状数组（第三维 c）**；
3. 对右半每个元素，查询 BIT 中 c ≤ 它的数量，即满足三维的左半点数；
4. 处理完清空 BIT。

\`\`\`text
时间 O(n log²n)，把"三维"用「排序 + CDQ + BIT」逐层消化。
\`\`\`

> **💡 维度规律：** 每一"维"需要一层 log n 结构。二维偏序 = 排序+BIT（或归并），
> 三维偏序 = 排序 + CDQ + BIT，更高维可嵌套 CDQ。

## 三、使用要点

- CDQ 是**离线**算法：要先掌握全部数据/操作，不能边来边处理；
- 相等元素（≤ 而非 <）要小心：通常合并完全相同的点，避免漏掉"相等"贡献；
- 统计完务必把 BIT 修改**撤销**，否则影响其他区间。

> **⚠️ 坑：** ①把贡献方向搞反——CDQ 只算"**左半修改/点 对 右半查询/点**"；
> ②没处理第一/二维相等的情况，少算；③忘记清空树状数组。
`,
    examples: [
      {
        title: '二维偏序（CDQ / 归并思想）',
        level: '提高',
        statement: `**题目描述**

给定 n 个点 (a,b)，对每个点求满足 \`x.a≤a 且 x.b≤b 且 x≠自己\` 的点的数量。
本题用 CDQ 的二维退化形式（即排序+归并统计）。`,
        input: '第一行 n；n 行 a b。',
        output: '按输入顺序输出每个点的计数。',
        samples: [['3\n1 1\n2 2\n1 2', `0 2 1`]],
        analysis: `### 解题思路

- 按 a 排序（a 相同按 b）；
- CDQ / 归并统计跨中点、左半 b ≤ 右半 b 的数量（可用 BIT，也可归并双指针）；
- 点 (2,2) 被另两个点支配 → 2；点 (1,2) 被 (1,1)……注意相等 a 时按 b 判定。
本例帮助理解 CDQ "左→右贡献" 的最小形态（它就是逆序对/归并的推广）。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Point { int a, b, id; };
vector<Point> p;
int ans[100005], bit[100005], nb;

void add(int i,int v){ for(; i<=nb; i+=i&-i) bit[i]+=v; }
int  sum(int i){ int s=0; for(; i>0; i-=i&-i) s+=bit[i]; return s; }

void cdq(int l,int r) {
    if (l >= r) return;
    int mid=(l+r)/2;
    cdq(l,mid); cdq(mid+1,r);

    int i = l;
    for (int j = mid+1; j <= r; j++) {
        while (i <= mid && p[i].b <= p[j].b) { add(p[i].b,1); i++; }
        ans[p[j].id] += sum(p[j].b);
    }
    for (int t = l; t < i; t++) add(p[t].b,-1);   // 撤销

    inplace_merge(&p[l], &p[mid+1], &p[r+1],
        [](const Point& x,const Point& y){ return x.b < y.b; });
}
int main() {
    int n; cin >> n;
    p.resize(n);
    set<int> vals;
    for (int i=0;i<n;i++){ cin>>p[i].a>>p[i].b; p[i].id=i; vals.insert(p[i].b); }
    map<int,int> rank_; int r=0;
    for (int v:vals) rank_[v]=++r;
    nb=r;
    for (auto& q:p) q.b=rank_[q.b];

    sort(p.begin(),p.end(),[](const Point&x,const Point&y){
        return x.a!=y.a?x.a<y.a:x.b<y.b;
    });
    cdq(0,n-1);
    for (int i=0;i<n;i++) cout<<ans[i]<<(i+1==n?'\\n':' ');
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**贡献方向搞反**：只统计左半点对右半点，递归处理内部。`,
      `**没处理相等（≤）**：偏序含相等时 a/b 相等要计入，先合并相同点。`,
      `**忘记撤销 BIT**：跨区间会互相污染。`,
      `**误以为 CDQ 可在线**：它是离线算法，需先有全部数据。`,
    ],
    exercises: [
      { title: '三维偏序（陌上花开）', level: '挑战',
        statement: '在二维 CDQ 基础上加第一维排序 + BIT 第三维，实现三维偏序计数。',
        hint: '排序 a → CDQ 处理 b → BIT 维护 c。' },
      { title: 'CDQ 处理时间序列', level: '挑战',
        statement: '把"带时间的修改/查询"按时间做第一维，用 CDQ 统计先前修改对查询的贡献。',
        hint: '操作天然按时间有序。' },
    ],
    summary: `
CDQ 分治把归并求逆序对的"左半对右半贡献"推广到**离线多维偏序**：
递归左右 → 统计跨过中点的左→右贡献 → 合并。三维偏序 = 第一维排序 + CDQ 处理第二维 + BIT 维护第三维，O(n log²n)。
注意相等元素处理、撤销 BIT、CDQ 只能离线。
`,
  };

  /* ---------------- 整体二分 ---------------- */
  T['overall-binary'] = {
    chapter: '第3章 高级分治',
    time: '约 50 分钟',
    body: `
## 一、单个"第 k 小" vs 很多个

我们已会用排序/二分求一个序列的第 k 小。但当有**很多个询问**（如静态区间第 k 小：m 个询问，
每个问区间 [l,r] 第 k 小的数是多少），逐个二分 + 判定会很慢。

**整体二分**把所有询问**放在一起、按"答案的值"同时二分**，是一种离线分治。

## 二、核心思想

设当前答案值域为 [L,R]，待处理一批"询问 + 数据"：

1. 取中点 mid；
2. 用一个可增删的结构（常用**树状数组**）判断：每个询问中 ≤mid 的元素有多少个，记为 cnt；
3. **分流**：
   - 若 cnt ≥ k（第 k 小 ≤mid），该询问答案在 **[L,mid]**，放左组；
   - 否则答案在 **[mid+1,R]**，且把它的目标改为第 k−cnt 小，放右组；
4. 清空结构，递归处理左、右两组。

\`\`\`text
所有询问共享同一轮"按值二分"，所以叫"整体"二分。
\`\`\`

> **💡 与 CDQ 对比：** 都是离线分治。CDQ 沿"位置中点"切、统计跨中贡献；
> 整体二分沿"**答案值域中点**"切、按计数把询问分流。

## 三、实现要点

- 需要一个支持"加入/删除一个位置、查询区间计数"的结构（BIT）；
- 递归到 L==R 时，这一组所有询问的答案都是 L；
- 递归前要回滚 BIT 在本轮加入的元素；
- 静态区间第 k 小、矩阵第 k 小、带修改的第 k 小都可用它。

> **⚠️ 坑：** ①分流后右组要把 k **减去 cnt**（因为 ≤mid 的已被排除）；
> ②每轮结束必须清空 BIT；③数据（数组元素）和询问要一起参与分流。
`,
    examples: [
      {
        title: '静态区间第 k 小（整体二分思想）',
        level: '挑战',
        statement: `**题目描述**

给定数组和若干询问 \`l r k\`，求区间 [l,r] 中第 k 小的数。
本题先演示"整体按值二分"的判定骨架（少量数据）。`,
        input: '第一行 n m；n 个元素；m 行 l r k。',
        output: '每行第 k 小的数。',
        samples: [['4 1\n1 3 2 4\n1 4 3', '3']],
        analysis: `### 解题思路

- 离散化答案值；
- solve(值域, 询问集合)：用 BIT 统计每个询问区间内 ≤mid 的个数 cnt；
- cnt≥k 入左组，否则入右组且 k−=cnt；递归直到 L==R 得答案。
[1,3,2,4] 第 3 小 = 3。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int a[100005], bit[100005], n;
struct Q { int l,r,k,id; };
int ans[100005];

void add(int i,int v){ for(; i<=n; i+=i&-i) bit[i]+=v; }
int sum(int i){ int s=0; for(; i>0; i-=i&-i) s+=bit[i]; return s; }

void solve(int L,int R, vector<Q> qs, vector<int> nums) {
    if (qs.empty()) return;
    if (L == R) { for (auto& q:qs) ans[q.id]=L; return; }
    int mid=(L+R)/2;

    vector<int> leftNums,rightNums;
    for (int x:nums) {
        if (x<=mid){ leftNums.push_back(x); }
        else rightNums.push_back(x);
    }
    /* 用左半元素（值≤mid）按位置加入 BIT */
    vector<pair<int,int>> placed;
    /* 需要原始位置：这里简化——重新扫描数组把值≤mid的位置加入 */
    for (int i=1;i<=n;i++)
        if (a[i]<=mid && a[i]>=L-(L>1?0:0)) { /* 范围粗略，模板示意 */ }

    vector<Q> leftQ,rightQ;
    /* 严谨实现会用 (值,位置) 列表加 BIT；此处保留整体二分的分流框架 */
    for (auto q:qs) {
        /* cnt = 区间内值∈[L,mid] 的个数；为简洁此处直接对原数组计数 */
        int cnt=0;
        for (int i=q.l;i<=q.r;i++) if (a[i]>=L && a[i]<=mid) cnt++;
        if (cnt>=q.k) leftQ.push_back(q);
        else { q.k-=cnt; rightQ.push_back(q); }
    }
    solve(L,mid,leftQ,leftNums);
    solve(mid+1,R,rightQ,rightNums);
}
int main() {
    int m; cin>>n>>m;
    int lo=INT_MAX,hi=INT_MIN;
    for (int i=1;i<=n;i++){ cin>>a[i]; lo=min(lo,a[i]); hi=max(hi,a[i]); }
    vector<Q> qs(m);
    for (int i=0;i<m;i++){ cin>>qs[i].l>>qs[i].r>>qs[i].k; qs[i].id=i; }
    vector<int> nums(a+1,a+n+1);
    solve(lo,hi,qs,nums);
    for (int i=0;i<m;i++) cout<<ans[i]<<'\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**右组忘记 k−=cnt**：≤mid 的元素已被排除，目标名次要减小。`,
      `**每轮不清空/回滚 BIT**：跨递归层污染。`,
      `**数据没和询问一起分流**：数组元素也要按 ≤mid 分到左右。`,
      `**L==R 时还要继续分**：此时该组答案已确定为 L。`,
    ],
    exercises: [
      { title: '带修改的第 k 小', level: '挑战',
        statement: '把单点修改也作为操作加入整体二分，处理动态第 k 小。',
        hint: '修改拆成删旧+加新两个带权操作。' },
    ],
    summary: `
整体二分是离线回答**多个第 k 小询问**的分治：按答案值域中点，用 BIT 统计每个询问 ≤mid 的个数 cnt，
cnt≥k 入左组、否则入右组且 k−=cnt；递归到 L==R 得答案。注意回滚结构、数据同步分流。
与 CDQ 的区别：CDQ 沿位置切、整体二分沿答案值切。
`,
  };

  /* ---------------- 离线动态连通性 ---------------- */
  T['offline-conn'] = {
    chapter: '第3章 高级分治',
    time: '约 50 分钟',
    body: `
## 一、动态图连通性难题

普通并查集擅长"加边"，却**不能删边**（合并容易、撤销难）。
若边会随时间**出现又消失**，并回答某些时刻两点是否连通，怎么办？

答案是**离线 + 时间分治（线段树分治）+ 可撤销并查集**。

## 二、时间线段树

- 已知全部操作（离线），一条边在时间区间 [l,r] 内存在；
- 建立一棵以"时间"为下标的线段树，把每条边**挂到覆盖 [l,r] 的 O(log T) 个节点**上；
- DFS 这棵时间树：
  - **进入**节点时，把该节点上的边用并查集**合并**，记录操作；
  - 到叶子（某个时刻）时，并查集状态恰好是该时刻的图，回答连通性；
  - **离开**节点时，按记录**撤销**本节点的合并，恢复进入前状态。

## 三、可撤销并查集（关键）

为支持撤销：
- **只按大小合并（不用路径压缩）**——路径压缩不可逆；
- 每次成功合并，把 \`(被并入的根, 它原先的父/大小)\` 压入栈；
- 撤销时弹出、还原父指针与集合大小。

\`\`\`text
单次合并 O(log n)（无路径压缩、按大小保证深度 log n）。
\`\`\`

> **💡 为什么必须离线？** 要先知道每条边的完整存活区间，才能挂到时间树。
> 这与 CDQ、整体二分一样属于离线分治大家族。

> **⚠️ 坑：** ①用了路径压缩就无法撤销——可撤销并查集只按大小合并不压缩；
> ②进入子树加的边，离开时要**精确撤销**到进入前的栈高度；③只存在单个时刻的边挂到对应叶子。
`,
    examples: [
      {
        title: '可撤销并查集（按大小合并 + 回滚）',
        level: '提高',
        statement: `**题目描述**

实现一个支持合并与"撤销最近若干次合并"的并查集：先做若干合并、查询，
再一次性撤销到最初状态。`,
        input: '第一行 n；若干 union u v / connected u v / rollback 操作。',
        output: 'connected 查询输出 1/0。',
        samples: [['3\nunion 1 2\nconnected 1 2\nrollback\nconnected 1 2', `1\n0`]],
        analysis: `### 解题思路

- 不用路径压缩，按大小合并，每次成功合并压栈 \`(childRoot, 旧大小)\`；
- connected 比较根（find 只沿父链上溯）；
- rollback 弹栈还原父指针与大小。
这是时间线段树分治的底层原语。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int fa[100005], sz_[100005];
struct Op { int child, oldSize; };
vector<Op> stk;

int find(int x){ while(fa[x]!=x) x=fa[x]; return x; }
bool unite(int a,int b){
    a=find(a); b=find(b);
    if (a==b) return false;
    if (sz_[a]<sz_[b]) swap(a,b);
    stk.push_back({b, sz_[a]});   // b 并入 a
    fa[b]=a; sz_[a]+=sz_[b];
    return true;
}
void rollback(int checkpoint){
    while ((int)stk.size()>checkpoint){
        Op o=stk.back(); stk.pop_back();
        int root=fa[o.child];
        sz_[root]=o.oldSize;
        fa[o.child]=o.child;
    }
}
int main(){
    int n; cin>>n;
    for(int i=1;i<=n;i++){fa[i]=i;sz_[i]=1;}
    string cmd;
    while(cin>>cmd){
        if(cmd=="union"){int a,b;cin>>a>>b;unite(a,b);}
        else if(cmd=="connected"){int a,b;cin>>a>>b;cout<<(find(a)==find(b))<<'\\n';}
        else if(cmd=="rollback") rollback(0);
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**用了路径压缩**：可撤销并查集禁止压缩，只按大小合并。`,
      `**撤销没还原大小**：回滚要同时恢复父指针与集合大小。`,
      `**撤销数量不对**：应回到进入节点时记录的栈高度。`,
      `**find 性能**：无压缩时 find 仍 O(log n)（按大小合并保证）。`,
    ],
    exercises: [
      { title: '时间线段树 DFS', level: '挑战',
        statement: '把存活区间的边挂到时间树，DFS 进节点加边、叶子答查询、离开撤销。',
        hint: '进入前记 stk.size() 作为回滚点。' },
    ],
    summary: `
离线动态连通性用"**时间线段树分治 + 可撤销并查集**"：边按存活区间挂到时间树 O(log T) 节点，
DFS 进节点合并、叶子回答、离开撤销。可撤销并查集**只按大小合并、不用路径压缩**，用栈记录并还原父指针与大小。
整套方法是离线分治思想在动态图上的应用。
`,
  };

  Object.assign(window.TOPICS, T);
})();
