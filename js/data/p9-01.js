/* ============================================================
   第九部分 · 第1章 动态树与高维结构
   link-cut-tree / k-d-tree
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- Link-Cut Tree ---------------- */
  T['link-cut-tree'] = {
    chapter: '第1章 动态树与高维结构',
    time: '约 50 分钟',
    body: `
## 一、动态树问题

树链剖分处理的是"**静态**树 + 路径操作"。若树本身会变化——动态**连边 link、删边 cut**，
还要支持路径查询，怎么办？**Link-Cut Tree（LCT，链接剪切树）**用一系列 **Splay** 维护"偏好路径"，
在**均摊 O(log n)** 内支持动态树操作，是处理动态森林的标准结构。

## 二、实边 / 虚边

LCT 不物理改树，而是把边分为：
- **实边（preferred edge）**：连接"偏好儿子"，若干实边连成**实路径**，每条实路径用一棵 Splay 维护
  （Splay 中按深度排序）；
- **虚边**：实路径之间用"路径指针"关联（只记父指针、不在 Splay 内双向连接）。

整片森林被表示成若干棵 Splay 通过虚边相连。

## 三、核心操作 access

\`access(x)\` 是 LCT 的灵魂：**把根到 x 的路径变成一条实路径**。

\`\`\`text
access(x):
  last=0
  for (y=x; y; y=父(y)) {
    splay(y);        // 把 y 转到其 Splay 根
    把 y 的右孩子设为 last（接上一条路径）
    last=y;
  }
\`\`\`

在 access 之上构造其他操作：
- **makeroot(x)**：access(x) 后 splay，并翻转路径（懒标记）→ x 成为整棵树的根；
- **findroot(x)**：access(x) 后沿左孩子找到最浅点（判断连通性）；
- **link(x,y)**：makeroot(x)，若 findroot 不同则把 x 的父指向 y；
- **cut(x,y)**：makeroot(x)+access(y)，若直接相连则断开；
- **路径查询 x→y**：makeroot(x)+access(y)+splay(y)，y 的 Splay 聚合值即路径信息。

> **💡 直觉：** LCT 用"**Splay 维护可变化的路径**"，access 像"临时把要走的路点亮成一条实链"，
> 操作完可恢复，所以能灵活 link/cut。

> **⚠️ 坑：** ①Splay 维护的是**路径（按深度）**，翻转要用懒标记；
> ②区分"Splay 内的父"与"虚路径父"（isRoot 判断）；③access/link/cut 后状态要更新完整。
> LCT 代码量大、调试难，建议先理解 access 再背模板。
`,
    examples: [
      {
        title: 'LCT 接口与 access 骨架（动态森林）',
        level: '挑战',
        samples: [['3', 'LCT nodes=3']],
        statement: `**题目描述（理解接口）**

维护一片森林，支持：连边、删边、判断两点是否连通、查询路径点权和。
本例展示 LCT 的节点结构与核心接口（完整 Splay 较长）。`,
        analysis: `### 关键结构

每个节点保存：Splay 的左右孩子、父（兼虚路径父）、子树聚合值、翻转标记。
接口：\`access / makeroot / findroot / link / cut / pathQuery\`，全部建立在 splay 旋转之上。
判断连通：makeroot(x) 后 findroot(y) 是否等于 x。`,
        code: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
struct Node {
    int ch[2], fa;
    long long val, sum;
    bool rev;
} tr[N];

bool isRoot(int x) {                 // 是否为其 Splay 的根
    int f = tr[x].fa;
    return tr[f].ch[0]!=x && tr[f].ch[1]!=x;
}
void pushUp(int x) {
    tr[x].sum = tr[tr[x].ch[0]].sum + tr[x].val + tr[tr[x].ch[1]].sum;
}
/* 完整实现还需 rotate(x)、splay(x)、applyRev、pushDown；
   下面给出 access / makeroot / link 的骨架 */
void access(int x) {
    for (int last=0; x; last=x, x=tr[x].fa) {
        // splay(x);               // 旋转到 Splay 根（此处省略旋转细节）
        tr[x].ch[1] = last;         // 接上前一段
        pushUp(x);
    }
}
void makeRoot(int x) {
    access(x);
    // splay(x); tr[x].rev ^= 1;    // 翻转路径使 x 成为根
}
int findRoot(int x) {
    access(x);
    while (tr[x].ch[0]) x = tr[x].ch[0];   // 最浅点
    return x;
}
void link(int x,int y) {
    makeRoot(x);
    if (findRoot(y) != x) tr[x].fa = y;
}
int main() {
    int n; cin >> n;
    for (int i=1;i<=n;i++) cin >> tr[i].val;
    // 之后可 link/cut/query；本例聚焦接口结构
    cout << "LCT nodes=" << n << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**Splay 父与虚路径父混淆**：用 isRoot 区分（是否被父的孩子指针指回）。`,
      `**翻转不下传**：makeroot 的路径反转是懒标记，旋转前 pushDown。`,
      `**access 右孩子接错**：应接"上一段 last"。`,
      `**link 前不判连通**：已连通再连会形成环，先 findRoot。`,
    ],
    exercises: [
      { title: '补全 rotate / splay', level: '挑战',
        statement: '在骨架上实现旋转与 splay，使 LCT 可真正运行。',
        hint: '旋转后更新 isRoot 父指针。' },
    ],
    summary: `
Link-Cut Tree 用 Splay 维护"实路径"、虚边连接各 Splay，**access** 把根到指定点亮成一条实路径；
在其上做 makeroot/findroot/link/cut/路径查询，均摊 O(log n)，解决动态森林。注意 isRoot 区分两类父、翻转懒标记。
`,
  };

  /* ---------------- K-D Tree ---------------- */
  T['k-d-tree'] = {
    chapter: '第1章 动态树与高维结构',
    time: '约 45 分钟',
    body: `
## 一、问题：高维点的检索

给定平面（或更高维）上的点，要支持：某个矩形/球范围内有哪些点、离某点最近的点。
数据维度 >1 时普通线段树/BST 无法直接用。**K-D Tree（k-dimensional tree）**按坐标
**轮流在不同维度上二分**，把空间递归切成两部分，是高维范围/最近邻检索的常用结构。

## 二、建树：交替选轴

\`\`\`text
build(点集, 深度):
  轴 axis = 深度 % k            （二维：先按 x、再按 y、再按 x …）
  按该轴坐标选中位数（nth_element）
  中位数作为节点；左/右半递归 build（axis+1）
  可维护该子树的包围盒（各维 min/max）
\`\`\`

## 三、矩形范围查询

\`\`\`text
range(节点, 矩形):
  若节点子树包围盒与矩形不相交 → 剪枝返回
  若节点本身在矩形内 → 计入
  递归左右孩子
\`\`\`
利用**包围盒**剪枝，平均不必遍历全部点。最近邻查询类似：用"到包围盒的最短距离"做下界剪枝。

## 四、复杂度与注意

- 期望建树 O(n log n)；
- 随机/低维数据下范围、最近邻查询平均很快；**维度很高或数据退化时可能退化为接近 O(n)**（"维度灾难"）；
- 因此 KDTree 适合**低维、需要灵活几何查询**的场景（注意：高维精确第 k 近邻常配合近似方法）。

> **💡 直觉：** KDTree 是"**按坐标轮流二分的二叉树 + 每块的包围盒**"，
> 查询时整块排除离得远的区域。

> **⚠️ 坑：** ①划分维度要**交替**、用中位数保证平衡（nth_element O(n)）；
> ②不维护包围盒就无法有效剪枝；③维度别太高，否则退化。
`,
    examples: [
      {
        title: '2D 矩形范围计数（KDTree）',
        level: '提高',
        statement: `**题目描述**

给定平面 n 个点和一个轴对齐矩形（左下 x1,y1、右上 x2,y2），求矩形内（含边界）点的个数。`,
        input: '第一行 n；n 行 x y；一行 x1 y1 x2 y2。',
        output: '一个整数：矩形内点数。',
        samples: [['5\n0 0\n1 1\n2 2\n3 3\n1 2\n0 0 2 2', '3']],
        analysis: `### 解题思路

- 交替按 x/y 选中位数建树；
- 查询用节点子树包围盒与矩形是否相交剪枝，统计落在矩形的点；
矩形 [0,2]² 含 (0,0),(1,1),(2,2) → 3。本例也可直接遍历，KDTree 优势在点多/多查询。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Point { int x, y, id; };
vector<Point> pts;
/* ---- 简化教学实现：递归按轴划分 + 范围计数 ---- */
int countRange(const vector<Point>& p,int depth,int x1,int y1,int x2,int y2){
    if(p.empty()) return 0;
    int axis=depth&1;
    vector<Point> L,R; Point mid{0,0,0};
    /* 找轴中位数 */
    vector<Point> s=p;
    nth_element(s.begin(),s.begin()+s.size()/2,s.end(),
        [&](const Point&a,const Point&b){
            return axis? a.y<b.y : a.x<b.x;
        });
    mid=s[s.size()/2];
    for(const Point& q:p){
        if(axis){ if(q.y<mid.y)L.push_back(q); else if(q.y>mid.y)R.push_back(q); }
      else { if(q.x<mid.x)L.push_back(q); else if(q.x>mid.x)R.push_back(q); }
    }
    int cur = (mid.x>=x1&&mid.x<=x2&&mid.y>=y1&&mid.y<=y2);
    /* 包围盒剪枝（此处简化：仍递归，教学示意） */
    return cur + countRange(L,depth+1,x1,y1,x2,y2)
               + countRange(R,depth+1,x1,y1,x2,y2);
}
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin>>n;
    pts.resize(n);
    for(int i=0;i<n;i++) cin>>pts[i].x>>pts[i].y;
    int x1,y1,x2,y2; cin>>x1>>y1>>x2>>y2;
    cout<<countRange(pts,0,x1,y1,x2,y2)<<'\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**不按中位数/固定一轴划分**：会失衡，必须交替选轴 + 中位数。`,
      `**不维护包围盒**：没有包围盒无法剪枝，退化成遍历。`,
      `**维度设太高**：高维下 KDTree 容易退化。`,
    ],
    exercises: [
      { title: '最近邻查询', level: '挑战',
        statement: '在树上用"到子树包围盒最短距离"做下界，找最近点。',
        hint: '维护最优距离并剪枝。' },
    ],
    summary: `
K-D Tree 按**交替维度选中位数**递归划分空间，每节点维护包围盒；范围/最近邻查询用包围盒剪枝，
期望建树 O(n log n)，低维高效、高维可能退化。
`,
  };

  Object.assign(window.TOPICS, T);
})();
