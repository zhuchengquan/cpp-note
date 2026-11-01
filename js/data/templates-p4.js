/* ============================================================
   核心模板速记 · 第四部分（考级与初赛专题）
   结构：TEMPLATES[知识点id] = [{ title, note?, code }]
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  /* ================= 第2章 补码 ================= */
  'data-representation': [
    {
      title: '补码验证：把减法 a−b 变成加法',
      note: '计算机里没有减法：a−b 被实现成 a 加上 (−b 的补码)，超出 8 位的进位丢弃。本程序把 8 位补码的相加过程完整打印出来。',
      code:
`\`\`\`cpp
#include <iostream>
using namespace std;

void print8(unsigned char x) {           // 打印一个字节的 8 位二进制
    for (int i = 7; i >= 0; i--) cout << ((x >> i) & 1);
}

int main() {
    int a, b;
    cin >> a >> b;                       // 例如 5 3，验证 5 - 3

    cout << a << " 的补码: "; print8((unsigned char)(signed char)a); cout << '\\n';
    cout << -b << " 的补码: "; print8((unsigned char)(signed char)(-b)); cout << '\\n';

    unsigned char sum = (unsigned char)((unsigned char)(signed char)a
                     + (unsigned char)(signed char)(-b));
    cout << "相加结果(丢弃进位): "; print8(sum); cout << '\\n';
    cout << "即 a-b = " << (int)(signed char)sum << '\\n';
    cout << "直接计算 a-b = " << a - b << '\\n';   // 两者应完全一致
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
