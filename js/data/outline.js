/* ============================================================
   大纲数据（知识点地图）
   结构：PART → CHAPTER → TOPIC
   每个 topic 的正文在 p1-xx.js / p2-xx.js / p3-xx.js 中，
   若正文尚未编写，页面会自动用 preview 生成"编写中"占位页。
   ============================================================ */

window.OUTLINE = [
/* ============================================================
   第一部分 · 入门篇
   ============================================================ */
{
  part: 1,
  icon: '🌱',
  title: '入门篇 · C++ 基础语法',
  desc: '零基础起步，学会用 C++ 写顺序、分支、循环程序，为算法学习打地基',
  chapters: [
    {
      title: '第1章 初识 C++',
      topics: [
        { id: 'intro-oi', title: '信息学竞赛与 C++', diff: 1, tags: ['竞赛常识', 'CSP'],
          preview: '什么是信息学奥赛（CSP-J/S、NOIP）？为什么竞赛统一用 C++？初赛复赛考什么？零基础学员的完整学习路线图。' },
        { id: 'intro-env', title: '开发环境与第一个程序', diff: 1, tags: ['Dev-C++', '环境搭建'],
          preview: '安装 Dev-C++ / 了解编译与运行，亲手写出 Hello World，理解从源代码到可执行程序的完整过程。' },
        { id: 'intro-structure', title: 'C++ 程序的基本结构', diff: 1, tags: ['main', '头文件', '注释'],
          preview: '逐行拆解 #include、using namespace std、main 函数、语句与分号、两种注释写法。' },
      ]
    },
    {
      title: '第2章 变量与数据类型',
      topics: [
        { id: 'var-const', title: '变量与常量', diff: 1, tags: ['变量', 'const', '命名规则'],
          preview: '变量的定义、赋值、初始化，const 常量，标识符命名规则与规范，内存的初步概念。' },
        { id: 'type-int', title: '整数类型与溢出', diff: 2, tags: ['int', 'long long', '溢出'],
          preview: 'int / long long 的范围与字节数，整数运算溢出的原因和惨痛案例，什么时候必须开 long long。' },
        { id: 'type-other', title: '浮点型、字符型与布尔型', diff: 2, tags: ['double', 'char', 'bool', 'ASCII'],
          preview: 'double 浮点与精度陷阱、char 与 ASCII 码、bool 布尔值、各类型字节数与取值范围总表。' },
      ]
    },
    {
      title: '第3章 运算符与表达式',
      topics: [
        { id: 'op-arithmetic', title: '算术、赋值与自增运算符', diff: 1, tags: ['运算符', '整除取余', '复合赋值'],
          preview: '加减乘除、整数除截断、取余 % 的妙用、复合赋值、i++ 与 ++i 的区别。' },
        { id: 'op-logic', title: '关系、逻辑与位运算符', diff: 2, tags: ['逻辑运算', '位运算', '短路求值'],
          preview: '比较运算、与或非与短路求值、真值表、& | ^ ~ << >> 位运算入门、运算符优先级总表。' },
      ]
    },
    {
      title: '第4章 输入输出与顺序结构',
      topics: [
        { id: 'io-cin-cout', title: 'cin / cout 输入输出', diff: 1, tags: ['iostream', '输入输出', '格式控制'],
          preview: 'cin/cout 基本用法、换行、setw/fixed 格式控制、输入输出重定向、关闭同步加速。' },
        { id: 'io-printf-scanf', title: 'printf / scanf 格式化', diff: 2, tags: ['printf', 'scanf', '占位符'],
          preview: 'C 风格格式化输入输出，%d/%lld/%f/%c/%s 占位符大全，小数位数与对齐控制。' },
      ]
    },
    {
      title: '第5章 分支结构',
      topics: [
        { id: 'flow-if', title: 'if 条件判断', diff: 1, tags: ['if', 'else', '嵌套'],
          preview: 'if / if-else / if-else if-else 链、嵌套分支、关系与逻辑条件的写法、常见判断套路（奇偶、闰年、区间）。' },
        { id: 'flow-switch', title: 'switch 与三目运算符', diff: 2, tags: ['switch', 'break', '三目'],
          preview: 'switch-case 多分支与 break 穿透陷阱、条件三目运算符、两种多分支写法的取舍。' },
      ]
    },
    {
      title: '第6章 循环结构',
      topics: [
        { id: 'loop-for', title: 'for 循环', diff: 2, tags: ['for', '累加器', '累乘器'],
          preview: 'for 循环执行流程、循环变量三要素、累加/累乘/计数三大套路、循环与表格输出。' },
        { id: 'loop-while', title: 'while 与 do-while', diff: 2, tags: ['while', '迭代', '死循环'],
          preview: 'while 循环适用场景、数位拆分、辗转迭代、do-while、死循环与循环的选择。' },
        { id: 'loop-nested', title: '循环嵌套与流程控制', diff: 3, tags: ['嵌套循环', 'break', 'continue', '图形打印'],
          preview: '双重循环的执行次数、打印九九乘法表与各种图形、break/continue 区别、质数判断等经典模型。' },
      ]
    },
    {
      title: '第7章 数组',
      topics: [
        { id: 'arr-1d', title: '一维数组', diff: 2, tags: ['数组', '下标', '遍历', '桶'],
          preview: '数组定义与下标规则、越界问题、输入输出与遍历、数组做计数（桶思想入门）、数组的实际用途。' },
        { id: 'arr-2d', title: '二维与多维数组', diff: 3, tags: ['二维数组', '矩阵', '行列遍历'],
          preview: '二维数组的内存形象、行列下标、矩阵输入输出、杨辉三角、多维数组与常见错误。' },
      ]
    },
    {
      title: '第8章 字符串',
      topics: [
        { id: 'str-cstr', title: '字符数组与 cstring', diff: 2, tags: ['字符数组', 'strlen', '大小写转换'],
          preview: 'C 风格字符数组、0 号结尾标志、strlen/strcmp/strcpy、cctype 字符判断与转换函数。' },
        { id: 'str-string', title: 'string 类型详解', diff: 2, tags: ['string', '拼接', '查找', 'substr'],
          preview: 'string 的定义、拼接与比较、长度、下标遍历、find/substr/insert/erase、字符串读行 getline。' },
      ]
    },
    {
      title: '第9章 函数',
      topics: [
        { id: 'func-basic', title: '函数定义与调用', diff: 2, tags: ['函数', '返回值', '形参实参'],
          preview: '为什么要写函数、定义语法、形参与实参、返回值、函数声明、void 函数、代码复用思想。' },
        { id: 'func-params', title: '参数传递、引用与作用域', diff: 3, tags: ['值传递', '引用传递', '全局变量', '作用域'],
          preview: '值传递为何改不动变量、引用传递 & 交换两数、局部/全局变量、变量遮蔽与命名冲突。' },
        { id: 'func-recursion', title: '递归入门', diff: 4, tags: ['递归', '递归边界', '栈'],
          preview: '递归三要素、函数调用栈、阶乘与斐波那契、递归改循环、递归为什么是搜索与分治的基础。' },
      ]
    },
    {
      title: '第10章 结构体与 STL 入门',
      topics: [
        { id: 'struct-basic', title: '结构体 struct', diff: 2, tags: ['结构体', '自定义类型', '结构体排序'],
          preview: '把相关数据打包成一个类型、结构体变量与数组、成员访问、结合 sort 的多关键字排序。' },
        { id: 'stl-basic', title: 'STL 入门：sort 与常用函数', diff: 2, tags: ['sort', 'pair', 'max/min', 'STL'],
          preview: 'algorithm 库最常用函数：sort 排序、max/min/swap/abs、pair 二元组、reverse、lower_bound 初见。' },
      ]
    },
    {
      title: '第11章 指针与引用（竞赛视角）',
      topics: [
        { id: 'pointer-ref', title: '指针与引用', diff: 3, tags: ['指针', '地址', '引用'],
          preview: '地址与指针变量、取地址 & 与解引用 *、指针与数组的关系、引用的本质、竞赛中需要掌握到什么程度。' },
      ]
    },
    {
      title: '第12章 文件操作与调试',
      topics: [
        { id: 'file-io', title: '文件输入输出 freopen', diff: 2, tags: ['freopen', '文件', '复赛'],
          preview: '复赛要求的文件读写：freopen 三行模板、in/out 文件、提交前的检查清单。' },
        { id: 'debug-guide', title: '调试方法与常见错误', diff: 2, tags: ['调试', '编译错误', 'DEVC++'],
          preview: '编译错误/运行错误/逻辑错误三类排查、cout 调试法、常见报错中英对照、新手错误 Top 10。' },
      ]
    },
  ]
},

/* ============================================================
   第二部分 · CSP-J 普及组算法
   ============================================================ */
{
  part: 2,
  icon: '🚀',
  title: '普及篇 · CSP-J 算法基础',
  desc: '掌握枚举模拟、排序贪心、二分递归、搜索与入门动态规划，具备普及组获奖实力',
  chapters: [
    {
      title: '第1章 算法与复杂度',
      topics: [
        { id: 'algo-complexity', title: '时间复杂度与空间复杂度', diff: 2, tags: ['大O', '复杂度', '估算'],
          preview: '什么是算法、大 O 表示法、常见复杂度排行榜、如何根据数据范围反推算法、TLE 超时的根源。' },
      ]
    },
    {
      title: '第2章 枚举法',
      topics: [
        { id: 'enum-method', title: '枚举算法', diff: 2, tags: ['枚举', '暴力', '循环'],
          preview: '枚举的思想：让计算机替你试遍所有可能。单重/双重/多重枚举、枚举范围优化、计数器模型。' },
      ]
    },
    {
      title: '第3章 模拟法',
      topics: [
        { id: 'simulate-method', title: '模拟算法', diff: 2, tags: ['模拟', '过程', '日期'],
          preview: '按题意一步步还原过程：图形模拟、日期推算、约瑟夫环、筛豆子……模拟题的细心大法。' },
      ]
    },
    {
      title: '第4章 排序',
      topics: [
        { id: 'sort-basic', title: '基础排序算法', diff: 3, tags: ['冒泡', '选择', '插入', '稳定性'],
          preview: '冒泡排序、选择排序、插入排序的原理与手写、稳定性概念、排序算法复杂度对比。' },
        { id: 'sort-bucket', title: 'sort 深入与桶排序', diff: 3, tags: ['sort', '计数排序', '桶排序', '结构体排序'],
          preview: 'sort 的 cmp 规则、逆序/多关键字/结构体排序、桶排序与计数排序：用空间换时间。' },
      ]
    },
    {
      title: '第5章 高精度计算',
      topics: [
        { id: 'bigint', title: '大整数高精度', diff: 4, tags: ['高精度', '竖式', '数组模拟'],
          preview: '当 long long 也装不下：用数组模拟竖式，实现大整数的加、减、乘、除。' },
      ]
    },
    {
      title: '第6章 贪心算法',
      topics: [
        { id: 'greedy', title: '贪心策略', diff: 3, tags: ['贪心', '区间问题', '排序'],
          preview: '每一步都选当前最优：排队接水、区间选择、部分背包；贪心的直觉与反例、如何"证明"贪心。' },
      ]
    },
    {
      title: '第7章 二分',
      topics: [
        { id: 'binary-search', title: '二分查找与二分答案', diff: 4, tags: ['二分', '单调性', 'lower_bound'],
          preview: '有序序列中的折半查找、手写二分边界、lower_bound/upper_bound、二分答案套路化模板。' },
      ]
    },
    {
      title: '第8章 递归与分治',
      topics: [
        { id: 'divide-conquer', title: '递归与分治', diff: 4, tags: ['汉诺塔', '归并排序', '快速排序', '分治'],
          preview: '分治三步：分解-解决-合并；汉诺塔、归并排序、快速排序手写与复杂度分析。' },
      ]
    },
    {
      title: '第9章 前缀和与差分',
      topics: [
        { id: 'prefix-diff', title: '前缀和与差分', diff: 3, tags: ['前缀和', '差分', '区间'],
          preview: 'O(1) 求区间和、二维前缀和、差分数组把区间修改降到 O(1)，竞赛高频技巧。' },
      ]
    },
    {
      title: '第10章 搜索',
      topics: [
        { id: 'search-dfs', title: '深度优先搜索 DFS', diff: 4, tags: ['DFS', '回溯', '排列组合', '迷宫'],
          preview: '一条路走到黑的回溯艺术：递归枚举排列/组合/子集、迷宫DFS、回溯与剪枝入门。' },
        { id: 'search-bfs', title: '广度优先搜索 BFS', diff: 4, tags: ['BFS', '队列', '最短路', '层次遍历'],
          preview: '按层扩展的队列搜索：迷宫最少步数、状态最少操作次数，BFS 为什么天然求最短。' },
      ]
    },
    {
      title: '第11章 动态规划入门',
      topics: [
        { id: 'dp-linear', title: '线性动态规划', diff: 4, tags: ['DP', '数字三角形', 'LIS', '状态转移'],
          preview: '从记忆化到递推：动态规划三要素、数字三角形、最长上升子序列、最大子段和。' },
        { id: 'dp-knapsack', title: '背包问题', diff: 4, tags: ['01背包', '完全背包', '滚动数组'],
          preview: '01 背包与完全背包的状态设计、一维滚动数组优化、背包方案数、模板代码背诵。' },
      ]
    },
    {
      title: '第12章 数学基础',
      topics: [
        { id: 'math-prime', title: '质数与筛法', diff: 3, tags: ['质数', '埃氏筛', '试除'],
          preview: '质数判断、试除法分解质因数、埃拉托斯特尼筛法 O(n log log n) 求质数表。' },
        { id: 'math-gcd-power', title: 'GCD、快速幂与进制', diff: 3, tags: ['gcd', '快速幂', '进制转换'],
          preview: '辗转相除求最大公约数、LCM、二进制思想的快速幂、十进制↔二/八/十六进制转换。' },
      ]
    },
    {
      title: '第13章 栈、队列与树',
      topics: [
        { id: 'ds-stack-queue', title: '栈与队列', diff: 3, tags: ['stack', 'queue', '括号匹配'],
          preview: '后进先出与先进先出、STL stack/queue/deque、括号匹配、表达式求值入门。' },
        { id: 'tree-basic', title: '树与二叉树入门', diff: 3, tags: ['树', '二叉树', '遍历'],
          preview: '树的术语、二叉树的数组/指针表示、前中后序与层次遍历、二叉搜索树概念。' },
      ]
    },
    {
      title: '第14章 应试实战',
      topics: [
        { id: 'contest-skills', title: '复赛应试技巧与对拍', diff: 3, tags: ['对拍', '造数据', '时间分配', '检查清单'],
          preview: '考试时间分配、暴力拿分策略、对拍调试三件套、文件操作检查、常见丢分点清单。' },
      ]
    },
  ]
},

/* ============================================================
   第三部分 · CSP-S 提高组
   ============================================================ */
{
  part: 3,
  icon: '🏆',
  title: '提高篇 · CSP-S 算法进阶',
  desc: '高级数据结构、图论、动态规划进阶、数论组合与字符串算法，冲击提高组一等奖',
  chapters: [
    {
      title: '第1章 STL 进阶',
      topics: [
        { id: 'stl-advanced', title: 'STL 容器与算法全景', diff: 3, tags: ['vector', 'set', 'map', '迭代器', 'lambda'],
          preview: 'vector/deque/set/map/unordered_set/priority_queue 原理与选用、迭代器、lambda 与自定义排序。' },
      ]
    },
    {
      title: '第2章 链表与单调结构',
      topics: [
        { id: 'linked-list', title: '链表（数组模拟）', diff: 3, tags: ['链表', '数组模拟', '邻接表'],
          preview: '为什么竞赛用数组模拟指针链表、单/双向链表的插入删除、邻接表与链式前向星的基础。' },
        { id: 'mono-stack-queue', title: '单调栈与单调队列', diff: 5, tags: ['单调栈', '单调队列', '滑动窗口'],
          preview: '维护单调结构在 O(n) 解决：下一个更大元素、滑动窗口最值、对顶栈等经典问题。' },
      ]
    },
    {
      title: '第3章 并查集',
      topics: [
        { id: 'dsu', title: '并查集 Disjoint Set Union', diff: 3, tags: ['并查集', '路径压缩', '按秩合并'],
          preview: '集合的合并与查询、路径压缩与按秩合并、团伙/亲戚问题、带权并查集入门。' },
      ]
    },
    {
      title: '第4章 堆',
      topics: [
        { id: 'heap', title: '堆与优先队列', diff: 4, tags: ['堆', 'priority_queue', 'TopK'],
          preview: '完全二叉树上的堆序、上浮下沉手写堆、优先队列应用、堆优化 Dijkstra 的前置知识。' },
      ]
    },
    {
      title: '第5章 树状数组与线段树',
      topics: [
        { id: 'bit', title: '树状数组 BIT', diff: 4, tags: ['树状数组', 'lowbit', '区间查询'],
          preview: 'lowbit 的二进制奥秘、单点修改区间查询、区间修改单点查询、逆序对统计。' },
        { id: 'segment-tree', title: '线段树', diff: 5, tags: ['线段树', '懒标记', '区间修改'],
          preview: '线段树的建树/查询/修改、lazy 懒标记区间修改、扫描线思想入门。' },
      ]
    },
    {
      title: '第6章 倍增与 ST 表',
      topics: [
        { id: 'st-table', title: '倍增思想与 ST 表', diff: 4, tags: ['倍增', 'ST表', 'RMQ'],
          preview: '用 2 的幂预处理一切：ST 表 O(1) 回答区间最值（RMQ），倍增是 LCA 与快速幂的共同内核。' },
      ]
    },
    {
      title: '第7章 图论',
      topics: [
        { id: 'graph-store', title: '图的存储与基本概念', diff: 3, tags: ['图', '邻接矩阵', '邻接表', '链式前向星'],
          preview: '有向/无向图、度、连通性；邻接矩阵、vector 邻接表、链式前向星三种存储对比。' },
        { id: 'graph-traversal', title: '图的 DFS / BFS 遍历', diff: 3, tags: ['图遍历', '连通块', '环'],
          preview: '在图上进行深度/广度遍历、连通块计数与染色、基环树与简单环判定。' },
        { id: 'topo-sort', title: '拓扑排序', diff: 3, tags: ['拓扑排序', '入度', 'DAG'],
          preview: '有向无环图上的排队问题、Kahn 算法、判环、拓扑序的 DP 应用。' },
        { id: 'shortest-path', title: '最短路算法', diff: 5, tags: ['Dijkstra', 'SPFA', 'Floyd', 'Bellman-Ford'],
          preview: 'Dijkstra（含堆优化）、Bellman-Ford/SPFA、Floyd 三大最短路算法的模板、证明与选型。' },
        { id: 'mst', title: '最小生成树', diff: 4, tags: ['Kruskal', 'Prim', '并查集'],
          preview: 'Kruskal 贪心+并查集、Prim 算法、最小生成树性质、次小生成树入门。' },
        { id: 'tarjan', title: 'Tarjan 与连通性', diff: 5, tags: ['Tarjan', '强连通', '割点', '桥'],
          preview: 'dfs 时间戳与 low 值、强连通分量缩点、割点与桥的判定、2-SAT 入门。' },
        { id: 'bipartite', title: '二分图判定与匹配', diff: 4, tags: ['二分图', '染色', '匈牙利算法'],
          preview: '染色法判定二分图、匈牙利增广路求最大匹配、最小点覆盖=最大匹配（Konig 定理）。' },
      ]
    },
    {
      title: '第8章 树上算法',
      topics: [
        { id: 'lca', title: '最近公共祖先 LCA', diff: 4, tags: ['LCA', '倍增', '树上距离'],
          preview: '倍增法预处理祖先、二进制拆分求 LCA、树上两点距离、Tarjan 离线 LCA 了解。' },
        { id: 'tree-dp', title: '树形动态规划', diff: 5, tags: ['树形DP', '没有上司的舞会', '树的直径'],
          preview: '在 DFS 回溯时完成的 DP：没有上司的舞会、树的直径、树的重心、树形背包入门。' },
      ]
    },
    {
      title: '第9章 动态规划进阶',
      topics: [
        { id: 'knapsack-advanced', title: '背包问题进阶', diff: 5, tags: ['多重背包', '分组背包', '有依赖背包', '二进制拆分'],
          preview: '多重背包的单调队列/二进制优化、分组背包、有依赖的树形背包、背包方案方案数与具体方案。' },
        { id: 'dp-interval', title: '区间动态规划', diff: 5, tags: ['区间DP', '石子合并', '括号匹配'],
          preview: '按区间长度转移：石子合并、矩阵连乘、回文子串、区间 DP 的枚举顺序。' },
        { id: 'dp-bitmask', title: '状压动态规划', diff: 5, tags: ['状态压缩', '位运算', '旅行商问题'],
          preview: '把集合状态压成二进制整数：棋盘覆盖、旅行商 TSP、拓扑状压、位运算技巧。' },
        { id: 'dp-digit', title: '数位动态规划', diff: 5, tags: ['数位DP', '记忆化', '计数'],
          preview: '按位统计满足条件的数：不含某个数字、数字计数问题，记忆化搜索模板。' },
      ]
    },
    {
      title: '第10章 数论进阶',
      topics: [
        { id: 'number-theory', title: '质数、欧拉函数与逆元', diff: 5, tags: ['线性筛', '欧拉函数', 'EXGCD', '逆元', '费马小定理'],
          preview: '线性筛 O(n)、欧拉函数、扩展欧几里得、乘法逆元三种求法、费马小定理与 CRT。' },
      ]
    },
    {
      title: '第11章 组合数学与概率',
      topics: [
        { id: 'combinatorics', title: '排列组合、容斥与期望', diff: 5, tags: ['组合数', '容斥', '卡特兰', '期望DP'],
          preview: '加法/乘法原理、组合数递推与取模、二项式定理、容斥原理、卡特兰数、期望 DP 入门。' },
      ]
    },
    {
      title: '第12章 字符串与网络流',
      topics: [
        { id: 'string-kmp', title: '字符串算法', diff: 5, tags: ['KMP', 'Trie', '字符串哈希', 'Manacher'],
          preview: 'KMP 失配函数、Trie 字典树、字符串哈希与冲突、Manacher 回文、AC 自动机了解。' },
        { id: 'network-flow', title: '网络流入门', diff: 5, tags: ['最大流', 'Dinic', '最小割'],
          preview: '残量网络与增广路、Dinic 算法、最大流最小割定理、二分图匹配的网络流建模。' },
      ]
    },
  ]
},

/* ============================================================
   第四部分 · 考级与初赛专题
   ============================================================ */
{
  part: 4,
  icon: '🎯',
  title: '考级与初赛专题',
  desc: 'GESP 考级与 CSP-J/S 初赛通关：赛制全解析、计算机硬件、操作系统、网络、信息安全与前沿科技',
  chapters: [
    {
      title: '第1章 考级与赛事指南',
      topics: [
        { id: 'grade-gesp', title: 'CCF GESP 等级认证全解析', diff: 1, tags: ['GESP', '考级', 'CCF'],
          preview: 'GESP 是什么？1~8 级如何对应 CSP-J/S？C++/Python/图形化三个方向、考试题型、报名与分数线、各级备考路线。' },
        { id: 'csp-prelim', title: 'CSP-J/S 初赛全解析', diff: 2, tags: ['初赛', 'CSP', '备考'],
          preview: '初赛赛制、题型分值（选择/阅读程序/完善程序）、各省晋级分数线、零基础备考计划与高频考点分布。' },
        { id: 'contests-overview', title: '青少年编程赛事与考级对比', diff: 1, tags: ['白名单', '赛事', '考级'],
          preview: '教育部白名单赛事盘点：CSP、蓝桥杯、NOC、电子学会等级考试、GESP 怎么选？按目标（兴趣/升学/竞赛）给出选择建议。' },
      ]
    },
    {
      title: '第2章 计算机硬件基础',
      topics: [
        { id: 'hardware-history', title: '计算机发展史与工作原理', diff: 2, tags: ['图灵', '冯诺依曼', '历史'],
          preview: '从算盘到 ENIAC、电子管到超大规模集成电路四代演变；图灵机与冯·诺依曼体系结构，存储程序思想。' },
        { id: 'hardware-components', title: '计算机硬件组成', diff: 2, tags: ['CPU', '存储器', '硬件'],
          preview: 'CPU（运算器+控制器）、寄存器/缓存/内存/外存的层次与速度、输入输出设备、总线，一张图看懂电脑内部。' },
        { id: 'data-representation', title: '数据表示：原码、反码与补码', diff: 3, tags: ['补码', '二进制', '初赛'],
          preview: '初赛难点：为什么负数用补码？原码/反码/补码对照、补码如何把减法变加法、取值范围计算。' },
      ]
    },
    {
      title: '第3章 软件、系统与网络',
      topics: [
        { id: 'software-os', title: '系统软件、操作系统与文件管理', diff: 2, tags: ['操作系统', 'Windows', '文件'],
          preview: '系统软件与应用软件、操作系统五大功能、进程与文件系统、常见文件扩展名、Windows 常用操作。' },
        { id: 'network-basics', title: '计算机网络基础', diff: 2, tags: ['网络', 'IP', 'DNS', 'Internet'],
          preview: '网络分类（LAN/WAN）、OSI 与 TCP/IP、IP 地址与端口、DNS 域名解析、路由器与 Internet 原理。' },
        { id: 'web-http', title: '网页、HTTP 与上网原理', diff: 2, tags: ['HTTP', 'HTML', '浏览器'],
          preview: '打开一个网页背后发生了什么：URL、HTTP 请求响应、HTML/CSS/JS、Cookie、HTTPS 加密；前端与后端分工。' },
      ]
    },
    {
      title: '第4章 安全、多媒体与前沿',
      topics: [
        { id: 'security-basics', title: '信息安全、病毒与密码', diff: 2, tags: ['安全', '病毒', '密码'],
          preview: '计算机病毒/木马/蠕虫/勒索软件、黑客攻击手段、防火墙、强密码与双因素、个人信息保护法规常识。' },
        { id: 'multimedia', title: '多媒体基础：图像、音频与视频', diff: 2, tags: ['多媒体', '像素', '压缩'],
          preview: '像素与分辨率、位图与矢量图、位图深度与文件大小、采样率与音频、有损/无损压缩、常见格式对比。' },
        { id: 'ai-frontier', title: '人工智能与前沿科技', diff: 2, tags: ['人工智能', '大数据', '云计算'],
          preview: '人工智能发展与机器学习/深度学习、大数据、云计算、物联网、区块链、量子计算等前沿概念科普。' },
      ]
    },
  ]
},

/* ============================================================
   第五部分 · 竞赛算法进阶
   ============================================================ */
{
  part: 5,
  icon: '⚔️',
  title: '竞赛算法进阶（CSP-S 高阶）',
  desc: '双指针滑窗、树上进阶、矩阵快速幂、高斯消元与博弈论——冲击 NOIP 与提高组难题',
  chapters: [
    {
      title: '第1章 双指针与滑动窗口',
      topics: [
        { id: 'two-pointers', title: '双指针技巧', diff: 3, tags: ['双指针', '对撞指针', '快慢指针'],
          preview: '相向（对撞）、同向（快慢）双指针：有序数组两数之和、回文判断、原地去重、移动零，把 O(n²) 降到 O(n)。' },
        { id: 'sliding-window', title: '滑动窗口', diff: 4, tags: ['滑动窗口', '双指针', '计数'],
          preview: '定长窗口最值与变长窗口：无重复字符最长子串、窗口计数，维护 [l,r] 右端扩展左端收缩。' },
      ]
    },
    {
      title: '第2章 树上进阶',
      topics: [
        { id: 'tree-difference', title: '树上差分', diff: 4, tags: ['树上差分', 'LCA', '路径覆盖'],
          preview: '点差分与边差分：用 LCA 把一条路径的修改拆成 4 个标记，DFS 累加求每点/每边被经过次数。' },
        { id: 'tree-hld', title: '树链剖分', diff: 5, tags: ['树链剖分', '重链', '线段树'],
          preview: '重链剖分把树映射成序列：两次 DFS 求重儿子与链顶，路径操作沿链跳段，结合线段树/BIT 做路径查询修改。' },
      ]
    },
    {
      title: '第3章 数学进阶',
      topics: [
        { id: 'matrix-exponent', title: '矩阵与矩阵快速幂', diff: 4, tags: ['矩阵', '快速幂', '递推加速'],
          preview: '矩阵乘法与矩阵快速幂 O(k³ log n)，把斐波那契等线性递推加速到 O(log n)。' },
        { id: 'gaussian-elim', title: '高斯消元', diff: 5, tags: ['高斯消元', '线性方程组', '选主元'],
          preview: '增广矩阵选主元消元 + 回代，解多元一次方程组，判断唯一解/无解/无穷多解。' },
        { id: 'game-theory', title: '公平组合游戏与 SG 函数', diff: 5, tags: ['博弈论', 'Nim', 'SG', 'mex'],
          preview: '必胜/必败态、Nim 异或、SG 函数与 mex、多子游戏 SG 异或定理。' },
      ]
    },
  ]
},

/* ============================================================
   第六部分 · 高阶算法专题
   ============================================================ */
{
  part: 6,
  icon: '🏆',
  title: '高阶算法专题（NOIP / CSP-S 高分段）',
  desc: '计算几何、数论进阶与高级分治——冲击省一及 NOIP 难题',
  chapters: [
    {
      title: '第1章 计算几何',
      topics: [
        { id: 'geometry-cross', title: '叉积与点线关系', diff: 4, tags: ['叉积', '计算几何', '向量'],
          preview: '向量叉积的几何含义：判左右转、点在直线哪一侧、两线段是否相交、三角形面积。' },
        { id: 'geometry-convexhull', title: '凸包', diff: 5, tags: ['凸包', 'Andrew', '计算几何'],
          preview: 'Andrew 单调链求凸包：排序后用叉积维护上下凸壳，O(n log n)。' },
      ]
    },
    {
      title: '第2章 数论进阶',
      topics: [
        { id: 'lucas-theorem', title: 'Lucas 定理', diff: 4, tags: ['Lucas', '组合数', '取模'],
          preview: '在小质数模下求大组合数 C(n,m) mod p，Lucas 拆成低位组合数乘积。' },
        { id: 'crt', title: '中国剩余定理（CRT）', diff: 4, tags: ['CRT', '同余', '数论'],
          preview: '解模数两两互质的同余方程组，CRT 构造唯一解；扩展 CRT 处理模数不互质。' },
      ]
    },
    {
      title: '第3章 高级分治',
      topics: [
        { id: 'cdq-divide', title: 'CDQ 分治', diff: 5, tags: ['CDQ', '分治', '偏序'],
          preview: '离线处理多维偏序：三维偏序用 CDQ 分治 + BIT，统计左半对右半的贡献。' },
        { id: 'overall-binary', title: '整体二分', diff: 5, tags: ['整体二分', '离线', '第 k 小'],
          preview: '同时回答多个第 k 小询问：按答案值二分、用 BIT 判定，避免逐个二分。' },
        { id: 'offline-conn', title: '离线动态连通性', diff: 5, tags: ['离线', '并查集', '撤销'],
          preview: '按时间分治（线段树分治）处理边的增删：可撤销并查集，解决动态连通问题。' },
      ]
    },
  ]
},

/* ============================================================
   第七部分 · 字符串、网络流与多项式（省选 / NOI）
   ============================================================ */
{
  part: 7,
  icon: '🎓',
  title: '字符串、网络流与多项式（省选 / NOI）',
  desc: 'AC 自动机、后缀数组/自动机、费用流与 FFT/NTT——冲击省选与 NOI',
  chapters: [
    {
      title: '第1章 字符串高级',
      topics: [
        { id: 'ac-automaton', title: 'AC 自动机', diff: 5, tags: ['AC自动机', '多模式匹配', '失配指针'],
          preview: 'Trie + KMP 失配思想：一次扫描统计多个模式串的出现，fail 指针与优化建图。' },
        { id: 'suffix-array', title: '后缀数组（SA）', diff: 5, tags: ['后缀数组', 'SA', '基数排序'],
          preview: '倍增 + 基数排序求所有后缀的字典序排名 sa/rank，height 数组求最长公共前缀。' },
        { id: 'suffix-automaton', title: '后缀自动机（SAM）', diff: 5, tags: ['后缀自动机', 'SAM', 'endpos'],
          preview: '用 endpos 等价类压缩所有子串：状态、len/link/转移，克隆分裂，线性大小。' },
      ]
    },
    {
      title: '第2章 网络流进阶',
      topics: [
        { id: 'flow-cost', title: '最小费用最大流', diff: 5, tags: ['费用流', 'SPFA', '最短路'],
          preview: '在保证最大流的前提下费用最小：沿最短路（费用）增广，SPFA/Dijkstra+势。' },
      ]
    },
    {
      title: '第3章 多项式',
      topics: [
        { id: 'fft', title: '快速傅里叶变换（FFT）', diff: 5, tags: ['FFT', '卷积', '复数'],
          preview: '用分治 O(n log n) 计算多项式卷积：蝴蝶变换、位逆序、复数旋转因子。' },
        { id: 'ntt', title: '数论变换（NTT）', diff: 5, tags: ['NTT', '卷积', '原根'],
          preview: '在模意义下做 FFT：用原根代替复数，无精度误差，结果为整数。' },
      ]
    },
  ]
},

/* ============================================================
   第八部分 · 可持久化、线性基与莫队（省选）
   ============================================================ */
{
  part: 8,
  icon: '💎',
  title: '可持久化、线性基与莫队（省选）',
  desc: '主席树、可持久化 Trie、线性基与莫队算法——省选高频高级数据结构',
  chapters: [
    {
      title: '第1章 可持久化数据结构',
      topics: [
        { id: 'chairman-tree', title: '可持久化线段树（主席树）', diff: 5, tags: ['主席树', '可持久化', '区间第k小'],
          preview: '动态开点 + 版本复用：前缀版本差分求区间第 k 小，每次只新建 O(log n) 节点。' },
        { id: 'persistent-trie', title: '可持久化 01 Trie', diff: 5, tags: ['可持久化Trie', '最大异或', '前缀版本'],
          preview: '为每个前缀建 Trie 版本，区间最大异或用两版本差分，按位贪心。' },
      ]
    },
    {
      title: '第2章 线性基',
      topics: [
        { id: 'linear-basis', title: '线性基（异或基）', diff: 4, tags: ['线性基', '异或', '高斯消元'],
          preview: '用一组基向量表示所有异或结果：最大异或和、第 k 小、查询某值能否表示。' },
      ]
    },
    {
      title: '第3章 莫队算法',
      topics: [
        { id: 'mo-algorithm', title: '普通莫队', diff: 4, tags: ['莫队', '离线', '区间询问'],
          preview: '排序 + 端点移动回答大量区间询问：奇偶/块排序，端点增删 O(1)，O(n√n)。' },
        { id: 'mo-with-update', title: '带修莫队', diff: 5, tags: ['带修莫队', '三维', '时间维'],
          preview: '增加"时间"维度处理带修改的区间询问：三维排序、时间前进/回退。' },
      ]
    },
  ]
},

/* ============================================================
   第九部分 · NOI 前沿专题
   ============================================================ */
{
  part: 9,
  icon: '🌌',
  title: 'NOI 前沿专题',
  desc: '动态树、K-D Tree、多项式进阶、生成函数、最小割树与 LGV 引理——NOI 级',
  chapters: [
    {
      title: '第1章 动态树与高维结构',
      topics: [
        { id: 'link-cut-tree', title: 'Link-Cut Tree（动态树）', diff: 5, tags: ['LCT', '动态树', 'Splay'],
          preview: '用 Splay 维护偏好路径，动态 link/cut、路径查询：实边虚边、access 操作。' },
        { id: 'k-d-tree', title: 'K-D Tree', diff: 5, tags: ['KDTree', '高维', '范围查询'],
          preview: '按坐标交替划分的二叉树：最近邻、范围/矩形查询，高维数据检索。' },
      ]
    },
    {
      title: '第2章 多项式进阶',
      topics: [
        { id: 'polynomial-newton', title: '多项式牛顿迭代（ln / exp）', diff: 5, tags: ['牛顿迭代', '多项式exp', '形式幂级数'],
          preview: '形式幂级数上用牛顿迭代求逆/ln/exp，倍增构造，O(n log n)。' },
        { id: 'generating-function', title: '生成函数（OGF / EGF）', diff: 4, tags: ['生成函数', '组合数学', '卡特兰'],
          preview: '把数列/组合计数编码成幂级数：普通/指数生成函数，斐波那契、卡特兰数的统一推导。' },
      ]
    },
    {
      title: '第3章 高级图论',
      topics: [
        { id: 'mincut-tree', title: '最小割树（Gomory–Hu Tree）', diff: 5, tags: ['最小割树', 'GomoryHu', '所有点对割'],
          preview: '用 n−1 次最小割构造一棵树，树上路径最小边即任意点对的最小割。' },
        { id: 'lgv-lemma', title: 'LGV 引理', diff: 5, tags: ['LGV', '不相交路径', '行列式'],
          preview: '用行列式计算顶点不相交路径组的带权方案数，图论与线性代数的结合。' },
      ]
    },
  ]
},
];

/* 便捷工具：根据 topic id 反查它在大纲中的位置 */
window.findTopicLocation = function (id) {
  for (const p of window.OUTLINE) {
    for (let ci = 0; ci < p.chapters.length; ci++) {
      const c = p.chapters[ci];
      const ti = c.topics.findIndex(t => t.id === id);
      if (ti !== -1) return { part: p, chapter: c, chapterIndex: ci, topicIndex: ti, meta: c.topics[ti] };
    }
  }
  return null;
};

/* 扁平化的上一/下一页导航 */
window.flatTopics = function () {
  const list = [];
  for (const p of window.OUTLINE)
    for (const c of p.chapters)
      for (const t of c.topics)
        list.push({ partTitle: p.title, partIcon: p.icon, chapterTitle: c.title, ...t });
  return list;
};
