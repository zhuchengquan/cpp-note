/* ============================================================
   第一部分 · 第10章 结构体与 STL 入门
   struct-basic / stl-basic
   ============================================================ */
(function () {
  const T = {};

  T['struct-basic'] = {
    chapter: '第10章 结构体与 STL 入门',
    time: '约 35 分钟',
    body: `
## 一、为什么需要结构体？

一个学生有：姓名、年龄、成绩；一个矩形有：长、宽、颜色。这些数据**含义不同但属于一个整体**，用多个零散数组管理极易错乱。**结构体 struct** 允许你自己创造一种“组合类型”：

\`\`\`cpp
struct Student {
    string name;    // 姓名
    int age;        // 年龄
    double score;   // 成绩
};                 // ← 分号不能忘！
\`\`\`

## 二、定义变量与访问成员

\`\`\`cpp
Student s;                          // 创建一个学生
s.name = "Li Hua";                  // 用“点”访问成员
s.age = 13;
s.score = 95.5;
cout << s.name << " " << s.age;

Student s2 = {"Han Meimei", 12, 99.0};  // 按声明顺序整体初始化
\`\`\`

结构体可以当函数参数、返回值；**传参建议用 const 引用**避免复制：

\`\`\`cpp
void printStudent(const Student &s) {
    cout << s.name << " " << s.score << '\\n';
}
\`\`\`

## 三、结构体数组：管理一批对象

\`\`\`cpp
Student cls[45];
cin >> cls[0].name >> cls[0].age >> cls[0].score;   // 第1个学生
int n; cin >> n;
for (int i = 0; i < n; i++) cin >> cls[i].name >> cls[i].age >> cls[i].score;
\`\`\`

这正是竞赛最常见的数据组织形式：\`Edge{ u, v, w }\`（边）、\`Job{ t, d }\`（任务）、\`Point{ x, y }\`（点）。

## 四、结构体 + sort：最有价值的组合（重点）

排序时经常需要“**按某一项排，相同再按另一项**”。给 sort 传一个比较函数（或 lambda）：

\`\`\`cpp
#include <algorithm>
bool cmp(const Student &a, const Student &b) {
    if (a.score != b.score) return a.score > b.score;  // 成绩高在前
    return a.age < b.age;                              // 成绩相同，年龄小在前
}
sort(cls, cls + n, cmp);
\`\`\`

比较函数的铁律：**a 应该排在 b 前面就返回 true**。

- 升序：\`a.x < b.x\`
- 降序：\`a.x > b.x\`
- 多关键字：先比较主关键字，相等再比较次关键字

### C++11 lambda 写法（简洁，越来越主流）

\`\`\`cpp
sort(cls, cls + n, [](const Student &a, const Student &b) {
    return a.score > b.score;
});
\`\`\`

## 五、运算符重载（入门了解）

可以让结构体直接用 \`==\`、\`<\` 比较：

\`\`\`cpp
struct Point {
    int x, y;
    bool operator<(const Point &o) const {
        if (x != o.x) return x < o.x;   // 先按 x 升序
        return y < o.y;                // x 相同按 y 升序
    }
};
sort(points, points + n);   // 不用写 cmp 也能排
\`\`\`

现在只需能读懂，多关键字排序用 cmp 函数更直观。
`,
    examples: [
      {
        title: '学生成绩排名',
        level: '基础',
        statement: `**题目描述**

输入 n 个学生的姓名、语文、数学成绩（n≤1000）。按总分从高到低排序，总分相同按语文从高到低，再相同按姓名字典序，输出排名后的名单。`,
        samples: [['3\nTom 90 95\nAmy 95 90\nBob 88 88',
          `Amy 95 90 185
Tom 90 95 185
Bob 88 88 176`]],
        analysis: `### 解题思路

结构体存四要素，cmp 写三层比较。注意字符串用 \`a.name < b.name\` 就是字典序比较，string 原生支持。`,
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int chinese;
    int math;
    int total;
};

bool cmp(const Student &a, const Student &b) {
    if (a.total != b.total) return a.total > b.total;       // 1. 总分降序
    if (a.chinese != b.chinese) return a.chinese > b.chinese; // 2. 语文降序
    return a.name < b.name;                                 // 3. 姓名升序
}

int main() {
    int n;
    cin >> n;
    Student a[1005];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].chinese >> a[i].math;
        a[i].total = a[i].chinese + a[i].math;
    }

    sort(a, a + n, cmp);

    for (int i = 0; i < n; i++)
        cout << a[i].name << " " << a[i].chinese << " "
             << a[i].math << " " << a[i].total << '\\n';
    return 0;
}`,
      },
      {
        title: '成绩修改与查找',
        level: '基础',
        statement: `**题目描述**

先输入 n 个学生的学号（int）和成绩。再输入 m 条修改指令“学号 新成绩”，输出修改后所有学生的平均成绩（保留 1 位）。保证学号存在。`,
        samples: [['3\n1 80\n2 90\n3 70\n2\n2 95\n1 100', '88.3']],
        analysis: `### 解题思路

体会“结构体数组按成员检索”：对每条指令遍历找到学号匹配的元素，修改其 score 成员，最后统一求和。数据量大时以后会用 map 把查找降到 O(log n)。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

struct Stu {
    int id;
    int score;
};

int main() {
    int n;
    cin >> n;
    Stu a[1005];
    for (int i = 0; i < n; i++) cin >> a[i].id >> a[i].score;

    int m;
    cin >> m;
    for (int k = 0; k < m; k++) {
        int id, newScore;
        cin >> id >> newScore;
        for (int i = 0; i < n; i++) {
            if (a[i].id == id) {          // 按学号找到本人
                a[i].score = newScore;    // 修改成员
                break;
            }
        }
    }

    long long sum = 0;
    for (int i = 0; i < n; i++) sum += a[i].score;
    cout << fixed << setprecision(1) << (double)sum / n << '\\n';
    return 0;
}`,
      },
      {
        title: '点到原点距离排序',
        level: '提高',
        statement: `**题目描述**

输入 n 个平面点的坐标（整数，|x|,|y|≤10⁴），按到原点距离平方从小到大排序，相同则按 x 升序，输出排序后的坐标。`,
        samples: [['3\n3 4\n1 1\n0 5', `1 1
0 5
3 4`]],
        analysis: `### 解题思路

距离平方 = x²+y²，用平方比较可避免开方与浮点误差（最大 2×10⁸，int 足够；再大就 long long）。cmp 中直接现算即可。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

struct Point {
    int x, y;
};

int dist2(const Point &p) {
    return p.x * p.x + p.y * p.y;
}

bool cmp(const Point &a, const Point &b) {
    if (dist2(a) != dist2(b)) return dist2(a) < dist2(b);
    return a.x < b.x;
}

int main() {
    int n;
    cin >> n;
    Point p[1005];
    for (int i = 0; i < n; i++) cin >> p[i].x >> p[i].y;

    sort(p, p + n, cmp);

    for (int i = 0; i < n; i++)
        cout << p[i].x << " " << p[i].y << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**结构体定义末尾漏分号**：右花括号后的 \`;\` 是高频漏项。`,
      `**cmp 比较方向写反**：记住“a 应在 b 前面就 true”，升序 <、降序 >。`,
      `**cmp 用 <= 代替 <**：比较函数必须是“严格弱序”，相等时必须返回 false，写 <= 可能导致排序崩溃/未定义。`,
      `**多关键字只比一项**：总分相同不代表名次关系结束，要继续比次关键字。`,
      `**结构体按值传递大数组对象**：参数用 const 引用。`,
    ],
    exercises: [
      { title: '图书排序', level: '基础',
        statement: '图书有书名、价格、库存。按价格升序，价格相同按库存降序排序输出。',
        hint: 'cmp 里两层判断即可。' },
      { title: '时间先后比较', level: '基础',
        statement: '输入 n 个时刻（时 分 秒），按时间先后排序输出，补零成 HH:MM:SS。',
        hint: 'cmp 可先化成总秒数比较，或依次比时、分、秒。' },
      { title: '分数排名（同分同名次）', level: '提高',
        statement: '结构体含姓名成绩，按成绩降序输出并标名次：成绩相同名次相同（如 100,100,90 → 1,1,3）。',
        hint: "排序后第 1 名名次 1；之后成绩与前一名相同则同名次，否则名次=i+1。" },
      { title: '区间合并预处理', level: '挑战',
        statement: '输入 n 个 [l,r] 区间，按左端点升序、左相同按右端升序排序（为以后区间合并/贪心做准备）。',
        hint: 'struct Seg{int l,r;} 加 cmp。' },
    ],
    summary: `
- struct 把多个相关成员打包成自定义类型，用 \`对象.成员\` 访问，结尾分号不能漏；
- 结构体数组管理成批对象，传参用 const 引用；
- **结构体 + sort + cmp** 是竞赛最高频组合：a 该在 b 前返回 true，多关键字逐层比较，相等必须 false；
- 可重载 operator< 让排序更简洁；后续 Edge/Point/Job 都会用这种组织方式。
`,
  };

  T['stl-basic'] = {
    chapter: '第10章 结构体与 STL 入门',
    time: '约 30 分钟',
    body: `
## 一、什么是 STL？

STL（标准模板库）是 C++ 自带的“算法与数据结构工具箱”。本知识点先入门最常用的一批，提高篇再系统学习容器。

## 二、algorithm 里的高频函数

使用前 \`#include <algorithm>\`（万能头已含），均在 \`std\` 命名空间：

| 函数 | 作用 | 例子 |
| --- | --- | --- |
| \`sort(begin,end)\` | 区间排序（默认升序） | \`sort(a,a+n)\` |
| \`sort(begin,end,cmp)\` | 自定义规则排序 | 见结构体章 |
| \`max(a,b)\` / \`min(a,b)\` | 最大/最小值 | max(3,5)=5 |
| \`swap(a,b)\` | 交换两变量 | — |
| \`abs(x)\` | 整数绝对值 | abs(-4)=4 |
| \`reverse(begin,end)\` | 区间反转 | reverse(a,a+n) |
| \`fill(begin,end,v)\` | 区间填充 | fill(a,a+n,-1) |
| \`lower_bound(begin,end,x)\` | 第一个 gex 的位置（需有序） | 二分，详讲在普及篇 |
| \`upper_bound(...)\` | 第一个 >x 的位置 | — |
| \`count / find / sum 类\` | 计数/查找（部分在 numeric） | — |

\`\`\`cpp
int a[5] = {3, 1, 4, 1, 5};
sort(a, a + 5);              // 1 1 3 4 5
reverse(a, a + 5);           // 5 4 3 1 1
cout << max(a[0], a[1]) << " " << min(3, 9) << '\\n';
swap(a[0], a[1]);            // 交换
\`\`\`

> **💡 区间参数都是“左闭右开” [begin, end)**：数组写 \`a\` 到 \`a+n\`（末位是“最后元素的下一个位置”），这是 STL 的统一风格。

## 三、pair：两个值的快捷打包

\`pair<第一个类型, 第二个类型>\` 适合临时捆绑两个值（坐标、键值、边）：

\`\`\`cpp
#include <utility>
pair<int, int> p = {3, 7};
cout << p.first << " " << p.second;     // 3 7

pair<int, int> arr[3] = {{1,9},{2,5},{3,7}};
sort(arr, arr + 3);
// 默认排序规则：先按 first 升序，first 相同按 second 升序——零成本的“双关键字排序”
\`\`\`

\`\`\`cpp
pair<int,int> make_pair(int a, int b);  // 老写法；C++11 起可直接 {a,b}
\`\`\`

## 四、其他必备小工具

\`\`\`cpp
#include <cmath>
sqrt(2.0);  fabs(-1.5);  pow(2,10);  ceil(2.1);  floor(2.9);  round(2.5);
\`\`\`

\`\`\`cpp
// 整数上下界（<climits>）
INT_MAX  INT_MIN  LLONG_MAX  LLONG_MIN
\`\`\`

\`\`\`cpp
// 取最值的三目/嵌套
int mx = max(a, max(b, c));
\`\`\`

## 五、sort 原理与注意

- sort 内部是**快排+插排+堆排的混合（introsort）**，时间复杂度约 O(n log n)，竞赛排序几乎一律 sort，不必手写基础排序（但普及篇仍要学手写以理解原理）；
- 对 vector 排序：\`sort(v.begin(), v.end())\`（提高篇）；
- 排序会改变原顺序，需要保留下标时存“值+原下标”的结构体。

## 六、一个综合例子：成绩去重排序

\`\`\`cpp
sort(a, a + n);                          // 升序
int m = unique(a, a + n) - a;            // 去重（要求先排序），m 是去重后个数
for (int i = 0; i < m; i++) cout << a[i];
\`\`\`

\`unique\` 把相邻重复元素移到后面，返回新结尾位置；这是离散化等提高篇技巧的基础。
`,
    examples: [
      {
        title: '奖牌统计（min/max/swap 综合）',
        level: '入门',
        statement: `**题目描述**

输入 n 个裁判打分（n≤100），按规则“去掉一个最高分、一个最低分，剩余求平均”输出选手得分（保留 2 位小数）。`,
        samples: [['5\n9.0 8.5 9.5 8.0 9.0', '8.83']],
        analysis: `### 解题思路

方法一：边读边累加并记录最高最低，结果 (sum−max−min)/(n−2)，无需数组。

方法二（本例）：存入数组后 sort，中间 n−2 个就是去掉头尾的分数。两种方法都要掌握。`,
        code: `#include <iostream>
#include <iomanip>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    double a[105];
    double sum = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        sum += a[i];
    }

    double mx = a[0], mn = a[0];
    for (int i = 1; i < n; i++) {
        mx = max(mx, a[i]);
        mn = min(mn, a[i]);
    }

    double score = (sum - mx - mn) / (n - 2);
    cout << fixed << setprecision(2) << score << '\\n';
    return 0;
}`,
      },
      {
        title: 'pair 双关键字排序',
        level: '基础',
        statement: `**题目描述**

输入 n 个学生的“班级 班内编号”（都是整数），先按班级升序，班级相同按编号升序排序后输出。要求直接用 pair，不写结构体。`,
        samples: [['4\n3 5\n1 2\n3 1\n1 9', `1 2
1 9
3 1
3 5`]],
        analysis: `### 解题思路

pair<int,int> 默认排序规则恰好就是题目要求：first 优先、second 次之。这就是“白送的双关键字排序”。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    pair<int, int> a[1005];
    for (int i = 0; i < n; i++) {
        cin >> a[i].first >> a[i].second;
    }

    sort(a, a + n);    // pair 的默认比较：先 first 后 second

    for (int i = 0; i < n; i++)
        cout << a[i].first << " " << a[i].second << '\\n';
    return 0;
}`,
      },
      {
        title: '排序 + unique 去重统计',
        level: '提高',
        statement: `**题目描述**

输入 n 个整数（n≤10⁵），输出其中不同数字的个数，并按升序输出去重后的序列。`,
        samples: [['8\n3 1 2 3 5 2 1 9', `5
1 2 3 5 9`]],
        analysis: `### 解题思路

sort 后相同元素相邻，unique 把重复项“挪”到尾部并返回新的逻辑结尾，\`unique-a\` 即去重后数量。这是提高篇**离散化**的核心两步。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int a[100005];

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a, a + n);                    // 必须先排序
    int m = unique(a, a + n) - a;      // 去重，返回新结尾位置

    cout << m << '\\n';
    for (int i = 0; i < m; i++)
        cout << a[i] << (i + 1 == m ? '\\n' : ' ');
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**区间端点写错**：sort(a,a+n-1) 会漏排最后一个元素，牢记左闭右开。`,
      `**没排序就 unique**：unique 只去掉相邻重复，必须先 sort。`,
      `**abs 用于 long long**：int 版 abs 在某些环境处理 long long 会截断，用 llabs 或直接 <cmath> 的 fabs（浮点）/ 自定义。`,
      `**pair 规则记反**：默认先比 first，再比 second。`,
      `**手写排序浪费时间**：竞赛中直接 sort，把时间留给算法设计；手写排序只用于学习原理与特殊限制题。`,
    ],
    exercises: [
      { title: 'sort 三连', level: '入门',
        statement: '输入 n 个数，分别输出升序、降序、逆序原数组三种结果各一行。',
        hint: '升序 sort；降序 sort+cmp(a>b)；reverse 得到原序逆序。' },
      { title: '第 k 大', level: '基础',
        statement: '输入 n 个数和 k，输出第 k 大的数。',
        hint: '降序排序后 a[k-1]，或升序 a[n-k]。' },
      { title: '相邻最大差', level: '基础',
        statement: '输入 n 个数，排序后输出相邻元素的最大差值。',
        hint: 'sort 后枚举 a[i+1]-a[i] 打擂台。' },
      { title: '坐标排序', level: '提高',
        statement: '输入 n 个点 (x,y)，x 降序、x 相同 y 升序，用 pair 或 cmp 实现。',
        hint: 'pair 默认是双升序，需要特殊方向时还是写 cmp。' },
    ],
    summary: `
- algorithm 高频：\`sort/max/min/swap/reverse/fill/unique/lower_bound\`，区间参数左闭右开；
- sort 复杂度 O(n log n)，默认升序，cmp 中 a 在 b 前返回 true，禁用 <=；
- \`pair\` 自带“先 first 后 second”的双关键字排序，成员是 .first/.second；
- sort + unique 是去重与离散化的标准两步。
`,
  };

  Object.assign(window.TOPICS, T);
})();
