/* ============================================================
   核心模板速记 · 第八部分（可持久化、线性基与莫队）
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  'linear-basis': [
    {
      title: '线性基（插入 + 最大异或和）',
      note: '异或上的高斯消元：basis[i] 是最高位在 i 的基；从高位贪心求最大异或。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
long long basis[63];

void insertNum(long long x) {
    for (int i = 62; i >= 0; i--) {
        if (!((x >> i) & 1)) continue;
        if (!basis[i]) { basis[i] = x; return; }
        x ^= basis[i];
    }
}
int main() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) { long long x; cin >> x; insertNum(x); }

    long long ans = 0;
    for (int i = 62; i >= 0; i++)
        if ((ans ^ basis[i]) > ans) ans ^= basis[i];
    cout << ans << '\\n';
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
