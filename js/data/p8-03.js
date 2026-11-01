/* ============================================================
   第八部分 · 第3章 莫队算法
   mo-algorithm / mo-with-update
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- 普通莫队 ---------------- */
  T['mo-algorithm'] = {
    chapter: '第3章 莫队算法',
    time: '约 50 分钟',
    body: `
## 一、问题：很多个区间询问

给定静态数组和大量询问，每个问区间 [l,r] 的某种信息（不同数个数、众数、区间和…）。
若每个询问都扫一遍区间，太慢。**莫队算法**用"**聪明的排序 + 区间端点逐步移动**"，
在移动中 O(1) 增删元素，整体约 **O(n√n)**。

## 二、核心：从一个区间"挪"到另一个

维护当前区间 [L,R] 与答案。切换到相邻询问时，只需：
- 右扩 \`R++\`、右缩 \`R--\`、左扩 \`L--\`、左缩 \`L++\`；
- 每加入/移除一个元素，O(1) 更新计数与答案。

关键是**排序询问，使端点总移动量最小**。

## 三、分块排序

- 设块大小 ≈ √n；
- 询问主要按 \`l/块\` 排序；
- **奇数块按 r 升序、偶数块按 r 降序**（奇偶优化），减少 R 的来回；
排序后依次处理，L 总移动 O(n√n)，R 在每块内 O(n)、共 √n 块，O(n√n)。

\`\`\`text
add(pos):  把 a[pos] 计入、更新答案
remove(pos): 移出、更新答案
四方向 while 移动到目标 [l,r]，然后记录 ans
\`\`\`

> **💡 适用条件：** 询问可离线、元素的加入/移除能 O(1) 更新答案；
> 数组静态（不带修改）。带修改见带修莫队。

> **⚠️ 坑：** ①排序与分块大小要对（√n）；
> ②四个方向的 add/remove 别写反；③先移动再记录答案。
`,
    examples: [
      {
        title: '莫队：区间不同数个数',
        level: '提高',
        statement: `**题目描述**

给定数组和 m 个区间询问，求每个区间中不同数字的个数。`,
        input: '第一行 n m；一行 n 个数；m 行 l r。',
        output: '每行不同数个数。',
        samples: [['5 2\n1 2 1 3 2\n1 5\n2 4', `3\n3`]],
        analysis: `### 解题思路

- 块 √n，奇偶排序询问；
- 维护 cnt[值] 与 distinct：加入时 cnt 0→1 则 +1，移除 1→0 则 −1；
[1,2,1,3,2] 不同为 {1,2,3}=3；[2,1,3] 也是 3。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 500005;
int a[N], cnt[N], ans[N], blockSize;
struct Query { int l,r,id; };

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,m; cin>>n>>m;
    for(int i=1;i<=n;i++) cin>>a[i];
    blockSize=max(1,(int)sqrt(n));

    vector<Query> q(m);
    for(int i=0;i<m;i++){ cin>>q[i].l>>q[i].r; q[i].id=i; }
    sort(q.begin(),q.end(),[&](const Query&x,const Query&y){
        int bx=x.l/blockSize, by=y.l/blockSize;
        if(bx!=by) return bx<by;
        return (bx&1)? x.r>y.r : x.r<y.r;     // 奇偶优化
    });

    int L=1,R=0,distinct=0;
    auto add=[&](int p){ if(++cnt[a[p]]==1)distinct++; };
    auto remove=[&](int p){ if(--cnt[a[p]]==0)distinct--; };

    for(const auto& qu:q){
        while(L>qu.l) add(--L);
        while(R<qu.r) add(++R);
        while(L<qu.l) remove(L++);
        while(R>qu.r) remove(R--);
        ans[qu.id]=distinct;
    }
    for(int i=0;i<m;i++) cout<<ans[i]<<'\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**块大小写错**：约 √n，过大过小都会劣化。`,
      `**add/remove 计数方向反**：0→1 加、1→0 减。`,
      `**四方向移动顺序/运算符错**：注意 --L 与 L-- 的区别。`,
      `**未离线排序直接处理**：不排序退化为 O(nm)。`,
    ],
    exercises: [
      { title: '区间众数（莫队）', level: '挑战',
        statement: '用莫队配合"出现次数的桶"维护区间众数。',
        hint: '同时记录每种次数的值个数。' },
    ],
    summary: `
莫队把大量区间询问离线，按 √n 分块 + 奇偶排序，处理时用四个方向 O(1) 增删元素、维护答案，
整体 **O(n√n)**。要求询问离线、元素增删可 O(1)、数组静态。
`,
  };

  /* ---------------- 带修莫队 ---------------- */
  T['mo-with-update'] = {
    chapter: '第3章 莫队算法',
    time: '约 50 分钟',
    body: `
## 一、问题：区间询问 + 单点修改

若数组会被修改，询问的是"截至某个时刻"的区间，普通莫队无法处理（答案随时间变化）。
**带修莫队**增加第三个指针——**时间 t**，在三维（l、r、t）上移动。

## 二、三维状态

当前状态 \`[L,R]\` 已处理前 t 个修改。切换时除了左右端点，还要：
- **时间前进 t++**：若被修改位置在当前区间内，先把旧值移出、新值加入；记录以便撤销；
- **时间回退 t--**：同理用保存的旧值还原。

\`\`\`text
每个修改保存 (位置 pos, 新值)；前进时现场记录"当前值"作为回退值。
\`\`\`

## 三、排序与复杂度

- 块大小取 \`n^(2/3)\`，询问按 \`l/块、r/块、t\` 三维排序；
- 三维各移动总量约 \`n^(5/3)\`，即 **O(n^(5/3))**。

\`\`\`text
处理一个询问：while 移动 L、R、t 到目标，再记录答案
\`\`\`

> **💡 维度规律：** 普通莫队 2 维 O(n√n)，每加一个维度（时间）块指数相应变化，
> 带修 3 维 O(n^(5/3))。

> **⚠️ 坑：** ①时间前进/回退只在"修改位置落在当前区间"时影响答案，但**都要更新数组与记录**；
> ②块大小用 n^(2/3)；③修改要保存可还原的值。
`,
    examples: [
      {
        title: '带修莫队（框架：不同数个数）',
        level: '挑战',
        statement: `**题目描述**

操作分两类：\`Q l r\` 问当前区间不同数个数；\`C p x\` 把位置 p 改为 x。按询问顺序回答。`,
        input: '若干 Q / C 操作。',
        output: '每个 Q 的答案。',
        samples: [['5\nC 1 2\nQ 1 3\n', '2']],
        analysis: `### 解题思路

- 区分询问（带时间戳）与修改（编号）；
- 三维排序；移动 L/R 用 add/remove，移动时间时若位置在区间则换值、始终更新数组；
初始假设位置 1 原值，改成 2 后区间 [2,原a2,原a3]，按数据不同数为 2（模板示意）。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N=200005;
int a[N],cnt[N],ans[N],bs;
struct Query{int l,r,t,id;};
struct Change{int pos,val;};

int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n; cin>>n;
    vector<Query> q; vector<Change> c;
    string op;
    int qcnt=0;
    while(cin>>op){
        if(op=="Q"){
            int l,r;cin>>l>>r;
            q.push_back({l,r,(int)c.size(),qcnt++});
        }else{
            int p,x;cin>>p>>x;
            c.push_back({p,x});
        }
    }
    bs=max(1,(int)pow(n,2.0/3));
    sort(q.begin(),q.end(),[&](const Query&x,const Query&y){
        int bl=x.l/bs,bm=x.r/bs;
        int cl=y.l/bs,cm=y.r/bs;
        if(bl!=cl)return bl<cl;
        if(bm!=cm)return bm<cm;
        return x.t<y.t;
    });

    int L=1,R=0,t=0,distinct=0;
    auto add=[&](int v){if(++cnt[v]==1)distinct++;};
    auto rem=[&](int v){if(--cnt[v]==0)distinct--;};

    for(const auto& qu:q){
        while(L>qu.l)add(a[--L]);
        while(R<qu.r)add(a[++R]);
        while(L<qu.l)rem(a[L++]);
        while(R>qu.r)rem(a[R--]);
        while(t<qu.t){
            int p=c[t].pos;
            if(p>=L&&p<=R){rem(a[p]);add(c[t].val);}
            swap(a[p],c[t].val);   // 交换，回退时再交换即可
            t++;
        }
        while(t>qu.t){
            --t;
            int p=c[t].pos;
            if(p>=L&&p<=R){rem(a[p]);add(c[t].val);}
            swap(a[p],c[t].val);
        }
        ans[qu.id]=distinct;
    }
    for(int i=0;i<qcnt;i++)cout<<ans[i]<<'\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**时间移动没更新数组**：即使位置不在区间也要 swap、保存回退值。`,
      `**块大小用 √n**：带修应用 n^(2/3)。`,
      `**回退逻辑错误**：用 swap 保存，前进/回退对称。`,
    ],
    exercises: [
      { title: '带修改的区间和', level: '提高',
        statement: '把维护目标换成区间和，练习时间维换值。',
        hint: '换值时区间和加差值。' },
    ],
    summary: `
带修莫队在 L、R 之外加**时间指针 t**：前进/回退修改时，若位置在当前区间则换值，并始终更新数组（用 swap 对称还原）。
按 n^(2/3) 分块、三维排序，复杂度 **O(n^(5/3))**。
`,
  };

  Object.assign(window.TOPICS, T);
})();
