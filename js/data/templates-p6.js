/* ============================================================
   核心模板速记 · 第六部分（高阶算法专题）
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  'geometry-cross': [
    {
      title: '叉积与转向判定',
      note: 'cross(a,b)=ax·by−ay·bx：符号判左右转、绝对值为平行四边形面积。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
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
    return 0;
}
\`\`\``,
    },
  ],

  'lucas-theorem': [
    {
      title: 'Lucas：大组合数 mod 小质数',
      note: '预处理 fac 到 p−1；Lucas(n,m)=C(n%p,m%p)·Lucas(n/p,m/p)。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
long long p, fac[100005];
long long power(long long a,long long e){
    long long r=1;
    while(e){ if(e&1)r=r*a%p; a=a*a%p; e>>=1; }
    return r;
}
long long C(long long a,long long b){
    if(b<0||b>a) return 0;
    return fac[a]*power(fac[b],p-2)%p*power(fac[a-b],p-2)%p;
}
long long lucas(long long n,long long m){
    if(m==0) return 1;
    return C(n%p,m%p)*lucas(n/p,m/p)%p;
}
int main(){
    long long n,m; cin>>p>>n>>m;
    fac[0]=1;
    for(int i=1;i<p;i++) fac[i]=fac[i-1]*i%p;
    cout<<lucas(n,m);
    return 0;
}
\`\`\``,
    },
  ],

  'crt': [
    {
      title: '中国剩余定理（扩展欧几里得求逆元）',
      note: '模数两两互质：x=Σ aᵢ·Mᵢ·inv(Mᵢ,mᵢ) mod M。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
long long extgcd(long long a,long long b,long long&x,long long&y){
    if(!b){x=1;y=0;return a;}
    long long x1,y1,g=extgcd(b,a%b,x1,y1);
    x=y1; y=x1-(a/b)*y1;
    return g;
}
long long modInv(long long a,long long m){
    long long x,y; extgcd(a,m,x,y);
    return (x%m+m)%m;
}
int main(){
    int n; cin>>n;
    vector<long long>a(n),m(n);
    long long M=1;
    for(int i=0;i<n;i++){cin>>a[i]>>m[i];M*=m[i];}
    long long x=0;
    for(int i=0;i<n;i++){
        long long Mi=M/m[i];
        long long t=modInv(Mi%m[i],m[i]);
        x=(x+a[i]*Mi%M*t)%M;
    }
    cout<<x;
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
