/* ============================================================
   第二部分 · 第4章 排序
   sort-basic / sort-bucket
   ============================================================ */
(function () {
  const T = {};

  T['sort-basic'] = {
    chapter: '第4章 排序',
    time: '约 45 分钟',
    body: `
## 一、为什么要学手写排序？

竞赛实际编码几乎都用 \`sort\`（O(n log n) 又快又稳）。但手写三大基础排序仍是必学内容：

1. 理解“排序”这件事的机制，为快排、归并打基础；
2. 初赛（笔试）常考排序过程、比较次数、稳定性；
3. 训练数组、交换、嵌套循环基本功。

## 二、冒泡排序 Bubble Sort

**思想**：相邻元素两两比较，逆序就交换。每一轮把当前最大值“冒泡”到末尾。

\`\`\`cpp
void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {           // 共 n-1 轮
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {   // 末尾 i 个已就位
            if (a[j] > a[j+1]) {
                swap(a[j], a[j+1]);
                swapped = true;
            }
        }
        if (!swapped) break;   // 一轮无交换 = 已有序，提前结束
    }
}
\`\`\`

- 比较次数：最坏 n(n-1)/2，时间 **O(n²)**；最好（已有序+提前退出）O(n)；
- **稳定排序**：相等元素不交换，相对顺序保持不变。

## 三、选择排序 Selection Sort

**思想**：每轮在未排序区间找最小值，与区间首元素交换。

\`\`\`cpp
void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minPos = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[minPos]) minPos = j;
        swap(a[i], a[minPos]);
    }
}
\`\`\`

- 交换次数最多 n−1 次（适合“交换代价大”的场景）；
- 时间恒为 **O(n²)**；
- **不稳定**：例如 \`5a 5b 2\`，2 与 5a 交换后两个 5 顺序颠倒。

## 四、插入排序 Insertion Sort

**思想**：像整理手牌，把每张新牌插入前面已排好的部分。

\`\`\`cpp
void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i];          // 新摸到的牌
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j+1] = a[j];      // 比 key 大的牌整体后移
            j--;
        }
        a[j+1] = key;           // 插入正确位置
    }
}
\`\`\`

- 最坏 O(n²)，对**基本有序**的数据接近 O(n)；
- **稳定**；小规模数据（n<50）实际很快，STL 排序内部在小区间就退化为插排。

## 五、稳定性

相等关键字排序后相对顺序不变，叫**稳定**。

- 稳定：冒泡、插入、归并；
- 不稳定：选择、快排、堆排、sort（不保证稳定）；
- 多关键字排序时（先按成绩排，再按班级排），稳定性有实际意义；用 sort 做稳定多关键字排序的方法是：**cmp 中比较所有关键字**。

## 六、复杂度对比表

| 排序 | 平均 | 最坏 | 额外空间 | 稳定性 |
| --- | --- | --- | --- | --- |
| 冒泡 | O(n²) | O(n²) | O(1) | 稳定 |
| 选择 | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入 | O(n²) | O(n²) | O(1) | 稳定 |
| sort | O(n log n) | O(n log n) | O(log n) | 不稳定 |
| 计数/桶 | O(n+k) | O(n+k) | O(k) | 稳定（实现得当） |

n≤2000 时 O(n²) 尚可（约 400 万次），n=10⁵ 必须 O(n log n)。
`,
    examples: [
      {
        title: '手动模拟冒泡全过程',
        level: '入门',
        statement: `**题目描述**

对 \`5 3 8 1 4\` 执行冒泡排序，写出每轮结束时数组的状态，并编程验证。`,
        samples: [['5\n5 3 8 1 4', `3 5 1 4 |8
3 1 4 |5 8
1 3 |4 5 8`]],
        analysis: `### 手工推演

- 第1轮：相邻比较 4 次，8 沉底 → 3 5 1 4 | **8**
- 第2轮：前 4 个中 5 沉底 → 3 1 4 | **5 8**
- 第3轮 → 1 3 | **4 5 8**
- 第4轮无交换，整体已有序。

代码在每轮后打印未归位部分，观察“冒泡”过程。`,
        code: `#include <iostream>
using namespace std;
int a[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j+1]) {
                swap(a[j], a[j+1]);
                swapped = true;
            }
        }
        if (!swapped) break;              // 本轮无交换：已有序，不再打印
        // 竖线左侧是未排序前缀，右侧是本轮沉底的已排序后缀
        for (int k = 0; k < n - 1 - i; k++)
            cout << a[k] << ' ';
        cout << '|';
        for (int k = n - 1 - i; k < n; k++)
            cout << a[k] << (k == n - 1 ? '\\n' : ' ');
    }
    return 0;
}`,
      },
      {
        title: '排序后统计相邻相等段',
        level: '基础',
        statement: `**题目描述**

输入 n 个成绩，输出每个分数出现的次数（按分数从小到大，格式“分数:次数”），要求先用选择排序排好序再统计（不用 map）。`,
        samples: [['7\n90 85 90 70 85 90 70', `70:2
85:2
90:3`]],
        analysis: `### 解题思路

排序后相同分数必然相邻，扫描一遍，用“当前分数+计数”的方式分段：遇到不同值就结算上一段。这是顺序数据统计的通用写法。`,
        code: `#include <iostream>
using namespace std;
int a[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    // 选择排序
    for (int i = 0; i < n - 1; i++) {
        int p = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[p]) p = j;
        swap(a[i], a[p]);
    }

    // 分段统计
    int cur = a[0], cnt = 1;
    for (int i = 1; i <= n; i++) {
        if (i < n && a[i] == cur) cnt++;
        else {
            cout << cur << ":" << cnt << '\\n';
            if (i < n) { cur = a[i]; cnt = 1; }
        }
    }
    return 0;
}`,
      },
      {
        title: '逆序对数量（插入排序视角）',
        level: '挑战',
        statement: `**题目描述**

输入 n 个数（n≤2000），统计逆序对数量：满足 i<j 且 a[i]>a[j] 的数对数。提示：插入排序每插入一个元素移动的次数之和就是答案；双重循环直接枚举也可。`,
        samples: [['4\n4 3 2 1', '6']],
        analysis: `### 解题思路

O(n²) 双重枚举即可过 n≤2000。对每个右端点 j，数左边比它大的元素。n 更大时用归并排序求逆序对（O(n log n)，分治章）。`,
        code: `#include <iostream>
using namespace std;
int a[2005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    long long ans = 0;
    for (int j = 1; j < n; j++) {       // 逐个“插入”
        int key = a[j], k = j - 1;
        while (k >= 0 && a[k] > key) {
            a[k+1] = a[k];              // 后移一次 = 一个逆序对
            k--;
            ans++;
        }
        a[k+1] = key;
    }
    cout << ans << '\\n';
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**轮数/边界写错**：冒泡每轮区间长度减 1；j 走到 n-2 保证 j+1 不越界。`,
      `**选择排序找最小值时存值不存位置**：要交换必须记录下标 minPos。`,
      `**插入排序后移覆盖数据**：先把 key 备份，再后移，最后插入。`,
      `**n=1 等小数据崩溃**：保证 n-1 轮循环在 n=1 时不执行，边界天然安全；额外处理空数组。`,
      `**10⁵ 数据还手写 O(n²)**：约 10¹⁰ 次必 TLE，直接用 sort。`,
    ],
    exercises: [
      { title: '三种排序默写', level: '基础',
        statement: '合上书独立默写冒泡、选择、插入排序，各用随机数据验证。',
        hint: '这三份模板要达到肌肉记忆。' },
      { title: '排序后求中位数', level: '入门',
        statement: '输入 n 个数，排序后输出中位数（n 为偶数时输出中间两个的平均值，保留 1 位）。',
        hint: '下标 (n-1)/2 与 n/2。' },
      { title: '移动次数统计', level: '提高',
        statement: '用插入排序对序列排序，输出元素总共向后移动了多少次。',
        hint: '每次 a[k+1]=a[k] 计数。' },
      { title: '冠军序列', level: '基础',
        statement: '输入选手成绩，输出成绩严格大于前面所有人的选手位置（“破纪录”时刻）。',
        hint: '边读边维护当前最大值即可，甚至不必排序。' },
    ],
    summary: `
- **冒泡**：相邻比较逆序交换，每轮沉底一个最大；可加无交换提前结束；稳定，O(n²)；
- **选择**：每轮选最小交换到前面；交换少但不稳定，O(n²)；
- **插入**：把新元素插入有序前缀；对基本有序数据很快；稳定，O(n²)；
- 稳定性、比较次数是初赛考点；工程与竞赛实战一律 sort（下一知识点）。
`,
  };

  T['sort-bucket'] = {
    chapter: '第4章 排序',
    time: '约 40 分钟',
    body: `
## 一、sort 的完整用法

\`sort(首地址, 尾后地址, 比较规则)\`，区间左闭右开：

\`\`\`cpp
int a[5] = {3, 1, 4, 1, 5};
sort(a, a + 5);               // 默认升序：1 1 3 4 5
sort(a, a + 5, greater<int>()); // 降序：5 4 3 1 1
\`\`\`

### cmp 规则回顾

\`\`\`cpp
bool cmp(int x, int y) { return x > y; }   // 降序：x 该在 y 前面就 true
sort(a, a + n, cmp);
\`\`\`

cmp 的铁律：**等价元素必须返回 false**（不能用 >=、<=），否则排序行为未定义。

### lambda 就地写法

\`\`\`cpp
sort(v.begin(), v.end(), [](int x, int y) {
    return abs(x) < abs(y);     // 按绝对值升序
});
\`\`\`

## 二、多关键字排序

cmp 中逐层比较，是处理“主次序+次次序”的标准方法：

\`\`\`cpp
struct Student { string name; int score, cls; };
bool cmp(const Student &a, const Student &b) {
    if (a.score != b.score) return a.score > b.score;  // 成绩降序
    if (a.cls != b.cls) return a.cls < b.cls;          // 同班内？班级升序
    return a.name < b.name;                            // 姓名升序兜底
}
\`\`\`

## 三、桶排序思想：用下标计数

当待排序数据是**范围有限的整数**（如成绩 0~100、年龄 1~120），不必两两比较：

1. 开一个覆盖取值范围的计数数组 \`cnt\`；
2. 扫一遍数据，\`cnt[x]++\`；
3. 按**下标从小到大**输出，值出现几次就输出几次。

\`\`\`cpp
int cnt[101] = {0};
for (int i = 0; i < n; i++) { int x; cin >> x; cnt[x]++; }
for (int v = 0; v <= 100; v++)
    for (int k = 0; k < cnt[v]; k++)
        cout << v << " ";
\`\`\`

- 时间 **O(n+V)**（V 为数据范围），比比较排序的 O(n log n) 更快；
- 代价是 O(V) 空间，且只能排“有整数键、范围不大”的数据。

## 四、计数排序的完整形态（稳定版）

需要保持相等元素原有顺序（多关键字处理）时，借助前缀和确定每个元素的位置：

\`\`\`cpp
// 统计 → 前缀和(得到每个值的结束位置) → 从后往前放置 → 拷回
for (int i = 1; i <= V; i++) cnt[i] += cnt[i-1];
for (int i = n-1; i >= 0; i--) out[--cnt[a[i]]] = a[i];
\`\`\`

入门阶段理解“桶计数 + 按下标输出”即可。

## 五、桶排序的变体与应用

- **频率统计**：众数、去重、分段人数；
- **计数代替排序**：只问“有没有/多少次”时，桶完就有答案；
- **基数排序（了解）**：按个位、十位……逐趟桶排，可对更大整数做 O(n×位数) 排序；
- **离散化（提高篇常用）**：数据很大但数量有限时，sort+unique 压缩下标，是桶思想与比较排序的结合。

## 六、排序算法选型

| 场景 | 选择 |
| --- | --- |
| 一般数值/结构体排序 | sort |
| 数据范围小且为整数（成绩、年龄） | 桶/计数排序，O(n+V) |
| 需要稳定且要求自己实现 | 归并排序（分治章） |
| 只需频率/众数/存在性 | 直接桶计数，不排序 |
`,
    examples: [
      {
        title: '成绩分段统计',
        level: '入门',
        statement: `**题目描述**

输入 n 个 0~100 的成绩，输出满分人数、及格率（百分数保留 1 位），并用桶排序输出全部成绩升序。`,
        samples: [['5\n100 60 59 100 90', `2
80.0%
59 60 90 100 100`]],
        analysis: `### 解题思路

cnt[101] 一桶多用：cnt[100] 是满分人数；cnt[60..100] 之和是及格人数；最后从 0 到 100 按下标输出即完成排序。`,
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int cnt[101];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cnt[x]++;
    }

    cout << cnt[100] << '\\n';

    int pass = 0;
    for (int v = 60; v <= 100; v++) pass += cnt[v];
    cout << fixed << setprecision(1) << 100.0 * pass / n << "%\\n";

    for (int v = 0; v <= 100; v++)
        for (int k = 0; k < cnt[v]; k++)
            cout << v << " ";
    cout << '\\n';
    return 0;
}`,
      },
      {
        title: '众数与重数（桶计数）',
        level: '基础',
        statement: `**题目描述**

输入 n 个 1~1000 的整数，输出出现次数最多的数及其次数；若有多个众数，输出数值最小的那个。`,
        samples: [['8\n2 5 2 8 5 5 2 9', '2 3']],
        analysis: `### 解题思路

桶计数后从小到大扫描，只在次数**严格大于**当前最大值时更新——这样次数相同时保留较小值，正好满足平局规则。`,
        code: `#include <iostream>
using namespace std;

int cnt[1005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cnt[x]++;
    }

    int mode = 0, best = 0;
    for (int v = 1; v <= 1000; v++) {
        if (cnt[v] > best) {   // 严格大于：并列时保留小值
            best = cnt[v];
            mode = v;
        }
    }
    cout << mode << " " << best << '\\n';
    return 0;
}`,
      },
      {
        title: '奇偶排序（自定义规则）',
        level: '基础',
        statement: `**题目描述**

输入 n 个整数，排序规则：所有奇数在前、偶数在后；奇数之间降序，偶数之间升序。`,
        samples: [['6\n3 2 8 1 4 5', '5 3 1 2 4 8']],
        analysis: `### 解题思路

cmp 分三种情况：

1. 一奇一偶：奇在前；
2. 都是奇：大数在前（降序）；
3. 都是偶：小数在前（升序）。

判奇偶用 x&1 或 x%2，注意先处理负数（负数取模符号问题，本题数据为正）。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int a[100005];
bool isOdd(int x) { return x % 2 != 0; }

bool cmp(int x, int y) {
    if (isOdd(x) != isOdd(y)) return isOdd(x);  // 奇偶不同：奇在前
    if (isOdd(x)) return x > y;                 // 同奇：降序
    return x < y;                               // 同偶：升序
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a, a + n, cmp);
    for (int i = 0; i < n; i++)
        cout << a[i] << (i + 1 == n ? '\\n' : ' ');
    return 0;
}`,
      },
      {
        title: '范围超限怎么办（离散化思想演示）',
        level: '挑战',
        statement: `**题目描述**

n≤10⁵ 个整数，数值范围在 pm10⁹，只需统计不同数值的个数并输出第 3 小的不同值。直接开 cnt[2×10⁹] 不可能，演示 sort+unique 的解法。`,
        samples: [['8\n1000000000 -5 12 12 7 7 -5 100', '-5 7 12\n共 5 个不同值（第3小:12）']],
        analysis: `### 解题思路

1. sort 让相同值相邻；
2. unique 去重得到新长度 m；
3. 下标 a[2] 即第 3 小。
这就是**离散化**：不管原值多大，只保留它们之间的大小次序，为提高篇树状数组等结构铺路。`,
        code: `#include <iostream>
#include <algorithm>
using namespace std;

long long a[100005];
int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a, a + n);
    int m = unique(a, a + n) - a;   // 去重后个数

    cout << a[0] << " " << a[1] << " " << a[2] << '\\n';
    cout << "共 " << m << " 个不同值（第3小:" << a[2] << "）\\n";
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**cmp 写 <=**：等价时必须 false，写成 <= 可能排序崩溃或结果错误。`,
      `**桶范围开小**：数据到 1000 至少开 cnt[1001]，下标上界要核对。`,
      `**桶排序用于超大值/小数**：键分散到 10⁹ 或 double 时不能直接开桶，用 sort 或离散化。`,
      `**多关键字忘记平局兜底**：主、次关键字都相等时最好用第三规则（如下标、姓名）保证顺序确定。`,
      `**stable 误解**：sort 不保证稳定，需要稳定次序就在 cmp 里比完全部关键字。`,
    ],
    exercises: [
      { title: '年龄排序', level: '入门',
        statement: 'n 个人年龄在 1~120，用计数排序输出升序年龄（n 可能达 10⁶）。',
        hint: 'cnt[121]，注意输入输出加速。' },
      { title: '奖学金名单', level: '基础',
        statement: '按总分降序、语文降序、学号升序排序，输出前 5 名学号。',
        hint: '结构体 + 三层 cmp。' },
      { title: '出现次数前 3', level: '提高',
        statement: '1~1000 的数据中输出出现次数最多的前 3 种值及其次数（次数相同值小者优先）。',
        hint: '桶统计后把 (值,次数) 结构体排序，或直接扫描取前三。' },
      { title: '洗牌判定', level: '挑战',
        statement: '输入两次各 n 张牌的排列，判断第二次是否能由某种稳定排序（只按花色）得到，输出 yes/no。',
        hint: '同花色内部相对顺序应保持不变，按花色稳定排序后比较。' },
    ],
    summary: `
- sort 左闭右开、默认升序；降序用 greater 或 cmp(x>y)，lambda 可就地写规则；
- cmp：a 应排在 b 前返回 true，等价必须 false；多关键字逐层比较到底；
- **桶/计数排序**：键为范围有限的整数时 O(n+V)，cnt[x]++ 后按下标输出；
- 频率、众数、去重不必排序直接用桶；键很大时 sort+unique **离散化**；
- 选型：通用 sort、小整数键桶排、问频率直接计数。
`,
  };

  Object.assign(window.TOPICS, T);
})();
