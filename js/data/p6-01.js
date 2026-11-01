/* ============================================================
   第六部分 · 第1章 计算几何
   geometry-cross / geometry-convexhull
   ============================================================ */
(function () {
  const T = {};

  /* ---------------- 叉积 ---------------- */
  T['geometry-cross'] = {
    chapter: '第1章 计算几何',
    time: '约 45 分钟',
    body: `
## 一、点与向量

平面上的点用坐标 \`(x,y)\` 表示。两个点相减得到**向量**：\`AB = (B.x-A.x, B.y-A.y)\`，
向量可看作"从原点出发的箭头"。

\`\`\`cpp
struct Point {
    long long x, y;
    Point operator-(const Point& b) const { return {x-b.x, y-b.y}; }
};
\`\`\`

## 二、叉积：计算几何的核心运算 ⭐

两个二维向量 \`a=(ax,ay)\`、\`b=(bx,by)\` 的**叉积（外积）**定义为：

\`\`\`text
cross(a, b) = ax·by − ay·bx
\`\`\`

\`\`\`cpp
long long cross(Point a, Point b) { return a.x*b.y - a.y*b.x; }
\`\`\`

### 叉积的几何含义（必背）

叉积值的**符号**表示方向：

| cross(a,b) | 含义 |
| --- | --- |
| **> 0** | b 在 a 的**逆时针（左）侧**，从 a 到 b 是左转 |
| **< 0** | b 在 a 的**顺时针（右）侧**，是右转 |
| **= 0** | a、b **共线**（平行） |

且叉积的**绝对值等于以 a、b 为邻边的平行四边形面积**，
所以**三角形面积 = cross/2**。

## 三、四大经典用途

### 1. 判断连续三点的转向
\`cross(B-A, C-B)\`：正 = 左转、负 = 右转、0 = 三点共线。

### 2. 点在有向直线哪一侧
\`cross(B-A, P-A)\` 的正负即 P 在直线 AB 的左侧还是右侧。

### 3. 两线段是否相交（跨立实验）
线段 AB、CD 相交的快速判定：C、D 分别在 AB 两侧（两个叉积异号），
且 A、B 也分别在 CD 两侧。还要处理落在直线上（叉积=0）的边界情况。

### 4. 求三角形 / 多边形面积
三角形 ABC 面积 = \`|cross(B-A, C-A)| / 2\`。

> **⚠️ 注意：** ①坐标可能很大时乘积用 **long long**（或 long double）防溢出；
> ②浮点坐标才需要 EPS 判 0，整数坐标可直接比较符号；③叉积**不满足交换律**，cross(a,b)=−cross(b,a)。
`,
    examples: [
      {
        title: '叉积判转向与三角形面积',
        level: '基础',
        statement: `**题目描述**

依次输入三个点 A、B、C（各含 x y），判断从 A→B→C 是左转、右转还是共线，
并输出三角形 ABC 面积的两倍（|叉积|）。`,
        input: '一行 6 个整数：Ax Ay Bx By Cx Cy。',
        output: '第一行 left/right/collinear；第二行叉积绝对值。',
        samples: [['0 0 1 0 1 1', `left\n1`], ['0 0 2 0 1 -1', 'right\n2']],
        analysis: `### 解题思路

\`cross(B-A, C-A)\`：
- (1,0)×(1,1)=1>0，左转，平行四边形面积 1；
- (2,0)×(1,-1)= -2<0，右转，面积 2。
**面积两倍即叉积绝对值**，避免除以 2 的小数。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Point { long long x, y; };
long long cross(Point a, Point b) { return a.x*b.y - a.y*b.x; }
int main() {
    Point A, B, C;
    cin >> A.x >> A.y >> B.x >> B.y >> C.x >> C.y;

    Point AB = {B.x-A.x, B.y-A.y};
    Point AC = {C.x-A.x, C.y-A.y};
    long long c = cross(AB, AC);

    if (c > 0) cout << "left";
    else if (c < 0) cout << "right";
    else cout << "collinear";
    cout << '\\n' << llabs(c) << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**坐标乘积溢出**：叉积是两坐标相乘，大用 long long / long double。`,
      `**叉积顺序写反**：cross(a,b)=−cross(b,a)，方向会相反。`,
      `**忘记处理共线（叉积=0）的边界**：线段相交要含端点落在直线的情况。`,
      `**用浮点不设 EPS**：浮点判 0 要用 fabs<EPS。`,
    ],
    exercises: [
      { title: '判断两线段是否相交', level: '挑战',
        statement: '用两次跨立实验（叉积异号）判断线段 AB、CD 是否相交。',
        hint: 'C、D 在 AB 两侧 且 A、B 在 CD 两侧。' },
      { title: '多边形面积', level: '提高',
        statement: '按顺序给多边形顶点，用相邻点叉积之和求面积。',
        hint: '面积 = |Σ cross(pi, p{i+1})| / 2。' },
      { title: '点到直线关系', level: '基础',
        statement: '判断点 P 在有向直线 AB 的左侧、右侧还是线上。',
        hint: '看 cross(B−A,P−A) 符号。' },
    ],
    summary: `
点用坐标表示，向量由两点相减。**叉积 cross(a,b)=ax·by−ay·bx** 是计算几何核心：
符号判左右转/点在直线哪一侧，绝对值是平行四边形面积（三角形面积=叉积/2）。
可做三点转向、线段跨立相交、多边形面积。乘积注意溢出，叉积不可交换。
`,
  };

  /* ---------------- 凸包 ---------------- */
  T['geometry-convexhull'] = {
    chapter: '第1章 计算几何',
    time: '约 50 分钟',
    body: `
## 一、什么是凸包

给定平面上 n 个点，**凸包（Convex Hull）**是包含所有点的**最小凸多边形**——
直观想象：用一根橡皮筋套住所有点，橡皮筋收缩后形成的多边形就是凸包。

凸包上的点叫"极点"，所有其他点都在它内部或边上。

## 二、Andrew 单调链算法（最常用）

\`O(n log n)\`，思路清晰：

1. 把所有点按 **x 升序（x 相同按 y 升序）排序**；
2. **从左到右**构造下凸壳（lower hull）：依次加点，用叉积检查，
   若最后三个点不是"左转"（叉积 ≤ 0）就弹出中间点；
3. **从右到左**构造上凸壳（upper hull），规则相同；
4. 拼接两壳、去掉首尾重复点，得到完整凸包。

\`\`\`text
维护栈时的关键判断：
while (栈内≥2 且 cross(栈顶−次顶, 新点−栈顶) <= 0) 弹出栈顶
\`\`\`

> **💡 为什么用叉积？** 凸包要求每处都是"外凸（左转）"；
> 一旦出现右转或共线（叉积 ≤ 0），中间点就在内部或边上、必须删除。

## 三、实现细节

- 点先用 \`sort\` + 自定义比较排序；
- 用一个 vector 当栈，\`pop_back\` 弹点；
- **共线点**：\`< 0\` 会保留边上的点，\`<= 0\` 只保留端点——按题意选择；
- 凸包常用后续：求凸包直径（旋转卡壳）、凸包面积。

> **⚠️ 坑：** ①只有 1~2 个点时凸包就是这些点，要特判；
> ②上下壳拼接会重复首尾点，记得各 −1；③所有点共线时凸包退化成线段。
`,
    examples: [
      {
        title: '凸包（Andrew 单调链）',
        level: '挑战',
        statement: `**题目描述**

给定 n 个整数坐标点，求它们的凸包，按逆时针顺序输出凸包上的点（不含边上的多余共线点），
并输出凸包顶点数。`,
        input: '第一行 n；n 行 x y。',
        output: '凸包顶点坐标（逆时针）+ 顶点个数。',
        samples: [['5\n0 0\n2 0\n2 2\n0 2\n1 1', `0 0\n2 0\n2 2\n0 2\n4`]],
        analysis: `### 解题思路

- 排序后分别构造下壳、上壳；
- 用叉积 \`<=0\` 弹出非左转向的点（中心点 (1,1) 在正方形内部，被排除）；
- 拼接两壳去掉重复首尾，得到正方形四角，逆时针输出。`,
        code: `#include <bits/stdc++.h>
using namespace std;
struct Point {
    long long x, y;
    bool operator<(const Point& b) const {
        return x != b.x ? x < b.x : y < b.y;
    }
};
long long cross(Point a, Point b) { return a.x*b.y - a.y*b.x; }
Point sub(Point a, Point b) { return {a.x-b.x, a.y-b.y}; }

int main() {
    int n; cin >> n;
    vector<Point> p(n);
    for (auto& q : p) cin >> q.x >> q.y;
    sort(p.begin(), p.end());

    if (n <= 1) { cout << n; return 0; }

    vector<Point> hull(2*n);
    int k = 0;
    for (int i = 0; i < n; i++) {                 // 下壳
        while (k >= 2 && cross(sub(hull[k-1],hull[k-2]), sub(p[i],hull[k-1])) <= 0) k--;
        hull[k++] = p[i];
    }
    int lower = k + 1;
    for (int i = n-2; i >= 0; i--) {             // 上壳
        while (k >= lower && cross(sub(hull[k-1],hull[k-2]), sub(p[i],hull[k-1])) <= 0) k--;
        hull[k++] = p[i];
    }
    hull.resize(k - 1);                          // 去掉重复的起点

    for (const auto& q : hull) cout << q.x << " " << q.y << '\\n';
    cout << hull.size();
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**叉积判断方向写反**：凸包要保留左转向，出现右转/共线才弹点。`,
      `**n≤2 或全部共线未特判**：凸包退化为点/线段。`,
      `**拼接未去首尾重复点**：上下壳各会重复一个端点。`,
      `**共线点处理不符题意**：<=0 只留端点，<0 保留边上点。`,
    ],
    exercises: [
      { title: '凸包面积', level: '提高',
        statement: '求出点集凸包后，用叉积计算凸包多边形面积。',
        hint: '沿凸包相邻点叉积求和。' },
      { title: '保留共线点的凸包', level: '挑战',
        statement: '修改判定为 <0，使凸包边上的所有给定点都被保留。',
        hint: '只在右转向时弹点。' },
    ],
    summary: `
凸包是包含所有点的最小凸多边形（橡皮筋模型）。**Andrew 单调链**：点排序后从左到右建下壳、从右到左建上壳，
用**叉积弹出非左转（≤0）的点**，拼接去重，O(n log n)。注意 n≤2 与共线退化、共线点是否保留。
`,
  };

  Object.assign(window.TOPICS, T);
})();
