/* ============================================================
   第八部分 · 第1章 可持久化数据结构
   chairman-tree / persistent-trie
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- 主席树 ---------------- */
  T['chairman-tree'] = {
    chapter: '第1章 可持久化数据结构',
    time: '约 50 分钟',
    body: `
## 一、可持久化思想

普通数据结构更新会覆盖旧状态。**可持久化**保留每次修改后的"**版本**"，从而能访问历史状态。
技巧：更新时**只新建发生变化的节点，没有变化的子节点直接复用（共享）**。
每次单点修改沿一条根→叶路径，只新建 **O(log n)** 个节点，其余指向旧节点。

\`\`\`text
版本 0（空树）
插入 a1 → 根 v1
插入 a2 → 根 v2   ……  根 v[i] 表示"前 i 个数"构成的树
\`\`\`

## 二、主席树：静态区间第 k 小

这是可持久化线段树最经典的应用。

### 建树（值域线段树）
- 先把数值**离散化**（只关心相对大小），线段树下标是"离散化后的值"，节点存"该值域内数的个数"；
- 依次插入数组每个元素，得到 n 个前缀版本，\`root[i]\` 对应前 i 个数。

### 查询区间 [l,r] 第 k 小
关键观察：**版本 r 减去版本 l−1**，得到的恰好是"区间 [l,r]"在各值域的计数
\`\`\`text
在值域线段树上：
  左半区间元素个数 cnt = count_r[左] − count_{l-1}[左]
  若 cnt ≥ k，答案在左半；否则 k−=cnt 走右半
\`\`\`
递归到叶子即第 k 小的离散值，映射回原值。

> **💡 为什么省空间：** 插入一个元素只改变一条根→叶路径（log n 个节点），
> n 次插入共 O(n log n) 节点，而不是 n 棵完整树。

> **⚠️ 坑：** ①节点是"**动态开点**"，数组要按 n log n 开足；
> ②新建节点要先**复制旧节点**再改；③离散化后记得映射回原数值输出。
`,
    examples: [
      {
        title: '主席树：区间第 k 小',
        level: '挑战',
        statement: `**题目描述**

给定长度 n 的静态数组和 m 个询问 \`l r k\`，回答区间第 k 小的数。`,
        input: '第一行 n m；一行 n 个数；m 行 l r k。',
        output: '每行第 k 小的数。',
        samples: [['4 1\n1 3 2 4\n1 4 3', '3'], ['5 2\n5 1 4 2 3\n1 5 1\n2 4 3', `1\n4`]],
        analysis: `### 解题思路

- 离散化；依次插入建 root[0..n]（动态开点、复用不变子节点）；
- 查询用版本 r 与 l−1 计数差，按左半计数决定走左/右；
[1,3,2,4] 第 3 小 = 3；[5,1,4,2,3] 最小 = 1；[1,4,2] 第 3 小 = 4。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 200005;
int lc[N*20], rc[N*20], sum_[N*20], root[N], nodeCnt;
int a[N], n;
vector<int> vals;

int build(int l,int r){
    int o=++nodeCnt;
    if(l<r){ int m=(l+r)/2; lc[o]=build(l,m); rc[o]=build(m+1,r); }
    return o;
}
int update(int prev,int l,int r,int pos){
    int o=++nodeCnt;
    lc[o]=lc[prev]; rc[o]=rc[prev]; sum_[o]=sum_[prev]+1;  // 复制旧节点
    if(l<r){
        int m=(l+r)/2;
        if(pos<=m) lc[o]=update(lc[prev],l,m,pos);
        else       rc[o]=update(rc[prev],m+1,r,pos);
    }
    return o;
}
int query(int u,int v,int l,int r,int k){
    if(l==r) return l;
    int m=(l+r)/2;
    int cnt=sum_[lc[v]]-sum_[lc[u]];
    if(k<=cnt) return query(lc[u],lc[v],l,m,k);
    return query(rc[u],rc[v],m+1,r,k-cnt);
}
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int q; cin>>n>>q;
    for(int i=1;i<=n;i++){ cin>>a[i]; vals.push_back(a[i]); }
    sort(vals.begin(),vals.end());
    vals.erase(unique(vals.begin(),vals.end()),vals.end());
    int sz=vals.size();

    root[0]=build(1,sz);
    for(int i=1;i<=n;i++){
        int pos=lower_bound(vals.begin(),vals.end(),a[i])-vals.begin()+1;
        root[i]=update(root[i-1],1,sz,pos);
    }
    while(q--){
        int l,r,k; cin>>l>>r>>k;
        int pos=query(root[l-1],root[r],1,sz,k);
        cout<<vals[pos-1]<<'\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**节点数组开太小**：动态开点总数约 n log n，按此预留。`,
      `**新节点没复制旧节点**：必须先拷 lc/rc/sum 再改，否则版本断裂。`,
      `**查询用错版本**：区间 = 版本 r 减版本 l−1，不是单版本。`,
      `**忘记离散化映射**：返回的是排名，要映射回原值。`,
    ],
    exercises: [
      { title: '区间第 k 大', level: '提高',
        statement: '把第 k 小改写为第 k 大（k = 区间长度−k+1）。',
        hint: '直接换算名次。' },
      { title: '区间不同/计数扩展', level: '挑战',
        statement: '思考如何用主席树回答值域内的计数类询问。',
        hint: '本质是值域前缀计数差。' },
    ],
    summary: `
可持久化保留历史版本：更新只新建变化路径（O(log n) 节点）、复用其余子树。
**主席树**在离散化值域上为每个前缀建版本，区间 [l,r] 第 k 小用**版本 r − 版本 l−1** 的计数差、按左半计数向下找。
动态开点数组按 n log n 预留，新节点先复制旧节点。
`,
  };

  /* ---------------- 可持久化 01 Trie ---------------- */
  T['persistent-trie'] = {
    chapter: '第1章 可持久化数据结构',
    time: '约 50 分钟',
    body: `
## 一、问题：区间内选一个数使异或最大

给定数组，询问区间 [l,r]，在其中选一个数 a[j] 使 \`x XOR a[j]\` 最大。
普通 01 Trie 只能处理"整段前缀/全部"，区间限制需要可持久化。

## 二、思路：前缀版本 + 计数差分

- 对每个前缀 i 建一棵 01 Trie 版本，记录每个节点"经过的数字个数"；
- 插入一个数同样**只新建一条路径（位数个节点）、复用另一子树**；
- 查询区间 [l,r]：用版本 r 与版本 l−1 的节点计数差，
  判断"该位分支在区间内是否存在数字"，再按 x 的位贪心——
  **优先走与 x 当前位相反的分支**（使异或该位为 1）。

\`\`\`text
节点存在性：cnt(节点, 版本r) − cnt(节点, 版本l−1) > 0 才可选
\`\`\`

### 贪心为什么对
异或结果高位权值远大于所有低位之和，所以从最高位起，
能取 1 就一定取 1（选择相反位），逐位确定即得最大值。

> **💡 与主席树同源：** 都是"前缀版本 + 两版本差分表示区间 + 动态开点复用"，
> 只是把"值域线段树"换成"二进制 Trie"。

> **⚠️ 坑：** ①节点计数要随版本维护、差分判存在；
> ②从最高位（一般 30/31 位）开始；③插入复用未改子树、只新建路径。
`,
    examples: [
      {
        title: '可持久化 01 Trie：区间最大异或',
        level: '挑战',
        statement: `**题目描述**

给定数组与询问 [l,r,x]，在区间中选数使 x XOR a[j] 最大，输出最大值。`,
        input: '第一行 n m；一行 n 个数；m 行 l r x。',
        output: '每行最大异或值。',
        samples: [['4 1\n1 2 3 4\n1 4 4', '7']],
        analysis: `### 解题思路

- 前缀建可持久化 01 Trie（节点带计数）；
- 查询用版本计数差，从高位起优先走相反位；
x=4(100) 与 3(011) 异或 = 7(111)，区间内最优。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 200005, B = 30;
int ch[N*32][2], cnt[N*32], root[N], nodeCnt;

int insert(int prev,int x){
    int o=++nodeCnt, cur=o;
    for(int b=B;b>=0;b--){
        int bit=(x>>b)&1;
        ch[cur][bit^1]=ch[prev][bit^1];      // 复用另一分支
        ch[cur][bit]=++nodeCnt;
        cnt[ch[cur][bit]]=cnt[ch[prev][bit]]+1;
        cur=ch[cur][bit]; prev=ch[prev][bit];
    }
    return o;
}
int query(int rRoot,int lRoot,int x){
    int ans=0, u=rRoot, v=lRoot;
    for(int b=B;b>=0;b--){
        int bit=(x>>b)&1, want=bit^1;
        int num=cnt[ch[u][want]]-cnt[ch[v][want]];
        if(num>0){ ans|=(1<<b); }          // 能走相反位 → 该位取1
        else want=bit;
        u=ch[u][want]; v=ch[v][want];
    }
    return ans;
}
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,m; cin>>n>>m;
    root[0]=0;
    for(int i=1;i<=n;i++){ int x;cin>>x; root[i]=insert(root[i-1],x); }
    while(m--){
        int l,r,x; cin>>l>>r>>x;
        cout<<query(root[r],root[l-1],x)<<'\\n';
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**没做计数差分**：区间存在性要用版本 r 减 l−1 的节点计数。`,
      `**起始位太低**：覆盖 int 一般从第 30 位（非负）开始。`,
      `**插入未复用另一分支**：只应新建一条路径，另一子树共享。`,
      `**贪心取同位**：要优先相反位使异或为 1。`,
    ],
    exercises: [
      { title: '整段最大异或（退化）', level: '基础',
        statement: '不做版本、用单棵 01 Trie 求"全部数"与 x 的最大异或。',
        hint: '无需差分，直接贪心。' },
    ],
    summary: `
可持久化 01 Trie 为每个前缀建版本，区间 [l,r] 用**版本计数差**判断分支内是否有数，
从高位起**优先走与 x 相反位**贪心，得区间最大异或。与主席树同属"前缀版本+差分+动态开点"。
`,
  };

  Object.assign(window.TOPICS, T);
})();
