/* ============================================================
   核心模板速记 · 第七部分（字符串、网络流与多项式）
   ============================================================ */
(function () {
  if (!window.TEMPLATES) window.TEMPLATES = {};
  Object.assign(window.TEMPLATES, {

  'ntt': [
    {
      title: 'NTT 卷积（998244353 · 原根 3）',
      note: '模意义下的快速卷积，整数无误差。逆变换用原根逆元、乘 n 逆元。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
const long long MOD=998244353, G=3;
long long power(long long a,long long e){
    long long r=1;
    while(e){ if(e&1)r=r*a%MOD; a=a*a%MOD; e>>=1; }
    return r;
}
void ntt(vector<long long>& a,bool inv){
    int n=a.size();
    for(int i=1,j=0;i<n;i++){
        int bit=n>>1;
        for(;j&bit;bit>>=1)j^=bit;
        j^=bit;
        if(i<j)swap(a[i],a[j]);
    }
    for(int len=2;len<=n;len<<=1){
        long long wl=power(G,(MOD-1)/len);
        if(inv) wl=power(wl,MOD-2);
        for(int i=0;i<n;i+=len){
            long long w=1;
            for(int j=0;j<len/2;j++){
                long long u=a[i+j], v=a[i+j+len/2]*w%MOD;
                a[i+j]=(u+v)%MOD;
                a[i+j+len/2]=(u-v+MOD)%MOD;
                w=w*wl%MOD;
            }
        }
    }
    if(inv){ long long k=power(n,MOD-2); for(auto&x:a)x=x*k%MOD; }
}
int main(){
    int n,m; cin>>n>>m;
    int sz=1; while(sz<n+m-1)sz<<=1;
    vector<long long>a(sz,0),b(sz,0);
    for(int i=0;i<n;i++)cin>>a[i];
    for(int i=0;i<m;i++)cin>>b[i];
    ntt(a,false);ntt(b,false);
    for(int i=0;i<sz;i++)a[i]=a[i]*b[i]%MOD;
    ntt(a,true);
    for(int i=0;i<n+m-1;i++)cout<<a[i]<<(i+1==n+m-1?'\\n':' ');
    return 0;
}
\`\`\``,
    },
  ],

  'flow-cost': [
    {
      title: '最小费用最大流（SPFA）',
      note: '边带容量+单位费用，沿费用最短路增广；反向边费用取负。',
      code:
`\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
struct Edge{int to,cap,cost,rev;};
vector<Edge> g[5005];
int dist[5005],pv[5005],pe[5005];
void addEdge(int u,int v,int cap,int cost){
    g[u].push_back({v,cap,cost,(int)g[v].size()});
    g[v].push_back({u,0,-cost,(int)g[u].size()-1});
}
bool spfa(int s,int t){
    fill(dist,dist+5005,INT_MAX);
    dist[s]=0; vector<bool>inq(5005);
    queue<int>q;q.push(s);
    while(!q.empty()){
        int u=q.front();q.pop();inq[u]=false;
        for(int i=0;i<(int)g[u].size();i++){
            Edge&e=g[u][i];
            if(e.cap&&dist[e.to]>dist[u]+e.cost){
                dist[e.to]=dist[u]+e.cost;
                pv[e.to]=u;pe[e.to]=i;
                if(!inq[e.to]){q.push(e.to);inq[e.to]=true;}
            }
        }
    }
    return dist[t]!=INT_MAX;
}
int main(){
    int n,m,s,t;cin>>n>>m>>s>>t;
    for(int i=0;i<m;i++){
        int u,v,cap,cost;cin>>u>>v>>cap>>cost;
        addEdge(u,v,cap,cost);
    }
    int flow=0,cost=0;
    while(spfa(s,t)){
        int add=INT_MAX;
        for(int v=t;v!=s;v=pv[v])add=min(add,g[pv[v]][pe[v]].cap);
        for(int v=t;v!=s;v=pv[v]){
            Edge&e=g[pv[v]][pe[v]];
            e.cap-=add; g[v][e.rev].cap+=add;
            cost+=add*e.cost;
        }
        flow+=add;
    }
    cout<<flow<<" "<<cost;
    return 0;
}
\`\`\``,
    },
  ],

  });
})();
