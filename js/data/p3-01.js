/* ============================================================
   第三部分 · 第1章 STL 进阶
   stl-advanced
   ============================================================ */
(function () {
  const T = {};

  T['stl-advanced'] = {
    chapter: '第1章 STL 进阶',
    time: '约 60 分钟',
    body: `
## 一、STL 容器总览

| 容器 | 底层 | 特点 | 典型用途 |
| --- | --- | --- | --- |
| vector | 动态数组 | 尾插 O(1) 均摊，随机访问 O(1) | 默认选择 |
| deque | 分段数组 | 两端 O(1)，随机访问 O(1) | 单调队列、BFS |
| stack/queue | 容器适配器 | LIFO/FIFO | 括号、BFS |
| priority_queue | 堆 | 取最值 O(log n) | TopK、Dijkstra |
| set/map | 红黑树 | 有序，操作 O(log n) | 有序集合/字典 |
| unordered_set/map | 哈希表 | 平均 O(1)，无序 | 快速判重 |
| pair/tuple | 组合类型 | 自带比较 | 双关键字 |
| list | 双向链表 | 插删 O(1)（竞赛少用，多用数组模拟） | |

## 二、vector 必备用法

\`\`\`cpp
vector<int> a(n, 0);       // n 个 0
a.push_back(3); a.pop_back();
a.size(); a.empty(); a.clear();
a.resize(2*n);
sort(a.begin(), a.end());
a.erase(a.begin() + k);    // 删第 k 个，O(n)
vector<vector<int>> g(n);  // 邻接表
\`\`\`

二维 vector 可代替定长二维数组，注意 vector<bool> 是特化的位压缩容器，取地址等行为特殊。

## 三、set / map：有序性是关键

\`\`\`cpp
set<int> s;
s.insert(3); s.erase(3);
s.count(3);                // 0 或 1
auto it = s.lower_bound(5);// 第一个 >=5
auto it2 = s.upper_bound(5);
for (int x : s) cout << x; // 按升序遍历
\`\`\`

\`\`\`cpp
map<string,int> mp;
mp["abc"] = 5;
cout << mp["abc"];
if (mp.count("abc")) ;
for (auto& [k, v] : mp) ; // C++17 结构化绑定
\`\`\`

set/map 的 key 唯一；允许重复用 multiset/multimap。**[] 访问 map 时若 key 不存在会插入默认值**，只想查询用 find/count。

## 四、unordered 容器

平均 O(1) 的增删查：

\`\`\`cpp
unordered_map<long long,int> cnt;
cnt[x]++;
\`\`\`

最坏 O(n)（哈希冲突/被卡）。竞赛若数据被针对，退回 map 或自定义哈希。

## 五、迭代器与算法

\`\`\`cpp
auto it = find(v.begin(), v.end(), x);
int c = count(v.begin(), v.end(), x);
sort(v.begin(), v.end(), [](int a, int b){ return a > b; });
nth_element(v.begin(), v.begin()+k-1, v.end()); // 第 k 小就位
v.erase(unique(v.begin(), v.end()), v.end());   // 去重
reverse(v.begin(), v.end());
long long s = accumulate(v.begin(), v.end(), 0LL); // 求和，初值类型决定结果类型
\`\`\`

## 六、lambda 与自定义类型

\`\`\`cpp
auto cmp = [](const Node& a, const Node& b) { return a.w < b.w; };
sort(arr.begin(), arr.end(), cmp);

int add = 5;
sort(a.begin(), a.end(), [add](int x, int y){ return x+add < y+add; }); // 捕获
\`\`\`

自定义类型放入 set/map 需要重载 operator< 或提供比较器；放入优先队列要写比较结构体。

## 七、复杂度与常数意识

- map/set 单次 O(log n)，10⁶ 次约 2×10⁷ 比较，一般可过但常数不小；
- 能用数组（值域小）或 unordered（只查不排序）就不用 map；
- vector 头部插入删除 O(n)，需要频繁两端操作用 deque；
- 不要在遍历 set/map 时直接 erase（用 it=s.erase(it) 或先保存后继）。
`,
    examples: [
      {
        title: '词频统计',
        level: '基础',
        statement: `**题目描述**

输入 n 个单词（n≤10⁵），按字典序输出每个单词及其出现次数。`,
        samples: [['6\napple banana apple cherry banana apple', 'apple 3\nbanana 2\ncherry 1']],
        analysis: `### 解题思路

要求字典序 → map（红黑树有序）天然满足；若只要求频率不要求顺序，unordered_map 更快。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    map<string,int> cnt;
    while (n--) { string s; cin >> s; cnt[s]++; }
    for (const auto& [word, c] : cnt)
        cout << word << " " << c << '\\n';
    return 0;
}`,
      },
      {
        title: '第 k 大与动态 TopK',
        level: '提高',
        statement: `**题目描述**

流式读入 n 个数，始终维护当前最大的 k 个数，最后升序输出（n≤10⁶）。`,
        samples: [['6 3\n5 1 9 3 7 2', '5 7 9']],
        analysis: `### 解题思路

维护大小为 k 的**小根堆**：堆顶是当前 TopK 中最小的。新数比堆顶大才替换。总复杂度 O(n log k)，空间 O(k)，适合海量数据。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k; cin >> n >> k;
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if ((int)heap.size() < k) heap.push(x);
        else if (x > heap.top()) { heap.pop(); heap.push(x); }
    }
    vector<int> ans;
    while (!heap.empty()) { ans.push_back(heap.top()); heap.pop(); }
    for (int i = 0; i < (int)ans.size(); i++)
        cout << ans[i] << (i+1==(int)ans.size()?'\\n':' ');
    return 0;
}`,
      },
      {
        title: '离散化',
        level: '提高',
        statement: `**题目描述**

n 个数（值域 ±10⁹），将它们映射为 1~m 的排名（m 为不同值个数），输出每个数的排名。`,
        samples: [['5\n100 -5 100 7 999', '3 1 3 2 4']],
        analysis: `### 解题思路

sort + unique 经典两步，lower_bound 查排名。离散化是树状数组/线段树处理大值域的前置技术。`,
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> a(n), b;
    for (auto& x : a) { cin >> x; b.push_back(x); }
    sort(b.begin(), b.end());
    b.erase(unique(b.begin(), b.end()), b.end()); // b：所有不同值，升序
    for (int i = 0; i < n; i++) {
        int rank = lower_bound(b.begin(), b.end(), a[i]) - b.begin() + 1;
        cout << rank << (i+1==n?'\\n':' ');
    }
    return 0;
}`,
      },
    ],
    pitfalls: [
      `**用 [] 对 map 做纯查询**：会悄悄插入不存在的键，用 count/find。`,
      `**遍历中 erase**：for(int x:s) s.erase(x) 会迭代器失效；用 it=s.erase(it) 写法。`,
      `**priority_queue 方向混淆**：默认大根堆，最小 k 个用 greater。`,
      `**accumulate 初值写 0**：元素 long long 时发生 int 溢出，写 0LL。`,
      `**unordered 被极端数据卡超时**：关键比赛可用 map 或自定义哈希保险。`,
      `**vector 循环中 push_back 后使用旧引用/迭代器**：扩容会使引用失效。`,
    ],
    exercises: [
      { title: '并集去重排序', level: '基础',
        statement: '两串整数，输出合并、去重、升序后的序列。',
        hint: '全放 set 或 vector+sort+unique。' },
      { title: '最近访问记录', level: '提高',
        statement: '模拟浏览器历史：新访问的 URL 置顶，已存在则移到最前，最多保留 k 条。',
        hint: 'list  splice 或 map 定位+vector 重建。' },
      { title: '多关键字排序再分组', level: '基础',
        statement: '学生成绩按班级升序、班内总分降序排序后输出。',
        hint: 'vector<Student>+lambda 多关键字。' },
      { title: '滑动中位数', level: '挑战',
        statement: '对每个长度 k 的窗口求中位数（n≤10⁵）。',
        hint: '两个 multiset 分别维护较小一半和较大一半。' },
    ],
    summary: `
- vector 是默认容器；set/map 有序 O(log n)，unordered 平均 O(1)；
- lower_bound/upper_bound/unique/accumulate/nth_element 是高频算法；
- TopK 用大小 k 的小根堆；离散化 = sort+unique+lower_bound；
- 注意 map[] 插入副作用、遍历中删除、容器常数与最坏复杂度。
`,
  };

  Object.assign(window.TOPICS, T);
})();
