/* ============================================================
   知识图谱：知识点之间的先修关系
   结构：RELATIONS[知识点id] = [直接先修知识点id, ...]
   "后续延伸"由 app.js 自动反查，无需在此重复书写。
   只收录"直接先修"，隔层的前置关系不必列出。
   ============================================================ */
(function () {
  window.RELATIONS = {
  /* ================= 第一部分 · 入门篇 ================= */
  'intro-env':        ['intro-oi'],
  'intro-structure':  ['intro-env'],
  'var-const':        ['intro-structure'],
  'type-int':         ['var-const'],
  'type-other':       ['type-int'],
  'op-arithmetic':    ['var-const'],
  'op-logic':         ['op-arithmetic', 'type-other'],
  'io-cin-cout':      ['intro-structure', 'var-const'],
  'io-printf-scanf':  ['io-cin-cout', 'type-other'],
  'flow-if':          ['op-logic', 'io-cin-cout'],
  'flow-switch':      ['flow-if'],
  'loop-for':         ['flow-if'],
  'loop-while':       ['loop-for'],
  'loop-nested':      ['loop-while'],
  'arr-1d':           ['loop-for'],
  'arr-2d':           ['arr-1d', 'loop-nested'],
  'str-cstr':         ['arr-1d', 'type-other'],
  'str-string':       ['str-cstr'],
  'func-basic':       ['flow-if'],
  'func-params':      ['func-basic'],
  'func-recursion':   ['func-params'],
  'struct-basic':     ['arr-1d', 'func-basic'],
  'stl-basic':        ['struct-basic'],
  'pointer-ref':      ['func-params', 'arr-1d'],
  'file-io':          ['io-cin-cout'],
  'debug-guide':      ['file-io', 'func-basic'],

  /* ================= 第二部分 · 普及篇 ================= */
  'algo-complexity':  ['loop-for'],
  'enum-method':      ['algo-complexity', 'arr-1d'],
  'simulate-method':  ['enum-method', 'str-string'],
  'sort-basic':       ['arr-1d', 'loop-nested'],
  'sort-bucket':      ['sort-basic', 'stl-basic'],
  'bigint':           ['arr-1d', 'str-string'],
  'greedy':           ['sort-bucket', 'algo-complexity'],
  'binary-search':    ['loop-while', 'arr-1d'],
  'divide-conquer':   ['func-recursion', 'sort-basic'],
  'prefix-diff':      ['arr-1d'],
  'search-dfs':       ['func-recursion', 'arr-2d'],
  'search-bfs':       ['search-dfs', 'arr-2d'],
  'dp-linear':        ['func-recursion', 'prefix-diff'],
  'dp-knapsack':      ['dp-linear'],
  'math-prime':       ['enum-method', 'op-arithmetic'],
  'math-gcd-power':   ['math-prime', 'func-basic'],
  'ds-stack-queue':   ['struct-basic', 'arr-1d'],
  'tree-basic':       ['func-recursion', 'struct-basic'],
  'contest-skills':   ['file-io', 'debug-guide', 'sort-bucket'],

  /* ================= 第三部分 · 提高篇 ================= */
  'stl-advanced':     ['stl-basic'],
  'linked-list':      ['stl-advanced', 'struct-basic'],
  'mono-stack-queue': ['ds-stack-queue', 'linked-list'],
  'dsu':              ['tree-basic', 'stl-advanced'],
  'heap':             ['tree-basic', 'stl-advanced'],
  'bit':              ['prefix-diff', 'stl-advanced'],
  'segment-tree':     ['bit', 'divide-conquer'],
  'st-table':         ['bit'],
  'graph-store':      ['linked-list', 'stl-advanced'],
  'graph-traversal':  ['graph-store', 'search-dfs', 'search-bfs'],
  'topo-sort':        ['graph-store', 'ds-stack-queue'],
  'shortest-path':    ['graph-store', 'heap', 'search-bfs'],
  'mst':              ['graph-store', 'dsu', 'heap'],
  'tarjan':           ['graph-traversal'],
  'bipartite':        ['graph-traversal'],
  'lca':              ['st-table', 'graph-traversal'],
  'tree-dp':          ['lca', 'dp-linear'],
  'knapsack-advanced':['dp-knapsack', 'binary-search'],
  'dp-interval':      ['dp-linear', 'divide-conquer'],
  'dp-bitmask':       ['dp-linear', 'op-logic'],
  'dp-digit':         ['dp-bitmask', 'math-gcd-power'],
  'number-theory':    ['math-gcd-power', 'math-prime'],
  'combinatorics':    ['number-theory', 'dp-linear'],
  'string-kmp':       ['str-string'],
  'network-flow':     ['graph-store', 'shortest-path', 'bipartite'],

  /* ================= 第四部分 · 考级与初赛 ================= */
  'hardware-components':  ['hardware-history'],
  'data-representation':  ['op-logic'],
  'software-os':          ['hardware-components'],
  'network-basics':       ['software-os'],
  'web-http':             ['network-basics'],
  'csp-prelim':           ['grade-gesp'],
  'contests-overview':    ['csp-prelim'],
  'security-basics':      ['web-http'],
  'multimedia':           ['data-representation'],
  'ai-frontier':          ['security-basics', 'multimedia'],

  /* ================= 第五部分 · 竞赛算法进阶 ================= */
  'two-pointers':         ['sort-bucket', 'arr-1d'],
  'sliding-window':       ['two-pointers'],
  'tree-difference':      ['lca', 'prefix-diff'],
  'tree-hld':             ['tree-difference', 'segment-tree'],
  'matrix-exponent':      ['math-gcd-power', 'dp-linear'],
  'gaussian-elim':        ['matrix-exponent'],
  'game-theory':          ['search-dfs', 'math-gcd-power'],

  /* ================= 第六部分 · 高阶算法专题 ================= */
  'geometry-cross':       ['op-logic'],
  'geometry-convexhull':  ['geometry-cross', 'sort-bucket'],
  'lucas-theorem':        ['number-theory'],
  'crt':                  ['number-theory'],
  'cdq-divide':           ['divide-conquer', 'bit'],
  'overall-binary':       ['binary-search', 'sort-bucket'],
  'offline-conn':         ['dsu'],

  /* ================= 第七部分 · 字符串、网络流与多项式 ================= */
  'ac-automaton':         ['string-kmp', 'str-string'],
  'suffix-array':         ['string-kmp'],
  'suffix-automaton':     ['string-kmp'],
  'flow-cost':            ['network-flow'],
  'fft':                  ['dp-linear'],
  'ntt':                  ['number-theory'],

  /* ================= 第八部分 · 可持久化、线性基与莫队 ================= */
  'chairman-tree':        ['segment-tree', 'overall-binary'],
  'persistent-trie':      ['bit'],
  'linear-basis':         ['op-logic'],
  'mo-algorithm':         ['algo-complexity'],
  'mo-with-update':       ['mo-algorithm'],

  /* ================= 第九部分 · NOI 前沿 ================= */
  'link-cut-tree':        ['tree-hld'],
  'k-d-tree':             ['geometry-cross'],
  'polynomial-newton':    ['ntt'],
  'generating-function':  ['combinatorics'],
  'mincut-tree':          ['network-flow'],
  'lgv-lemma':            ['combinatorics'],
  };
})();
