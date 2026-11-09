/* ---------- generated art, line illustrations, seasons ---------- */
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function hslOf(hex){const n=parseInt(hex.slice(1),16);let r=(n>>16)/255,g=(n>>8&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!=mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s*100,l*100]}
const hsl=(h,s,l,a)=>"hsla("+(((h%360)+360)%360).toFixed(1)+","+Math.max(0,Math.min(100,s)).toFixed(1)+"%,"+Math.max(0,Math.min(100,l)).toFixed(1)+"%,"+(a==null?1:a)+")";
const ART=[["auto","Automatic"],["wash","Watercolor"],["topo","Contours"],["rays","Sunrise"],["facets","Facets"],["hills","Hills"],["grain","Soft gradient"],["none","Flat color"]];
const ART_AUTO={bold:"wash",photo:"hills",arch:"wash",cross:"rays",poster:"topo",card:"wash",split:"grain",editorial:"grain",minimal:"grain",traditional:"none"};
function artSeed(){const w=typeof W=="function"?W():null;return hashS((w&&w.date||"x")+"|"+(DB.l.seed|0))}
function artKey(d){const k=DB.l.art||"auto";return k=="auto"?(ART_AUTO[d]||"none"):k}
function speck(c,w,h,R,amt){const n=Math.min(5200,w*h/55);for(let i=0;i<n;i++){c.fillStyle=R()<.5?"rgba(255,255,255,"+(amt*R()).toFixed(3)+")":"rgba(0,0,0,"+(amt*R()).toFixed(3)+")";c.fillRect(R()*w,R()*h,.7,.7)}}
function artFill(c,x,y,w,h,key,o){o=o||{};const acc=o.acc||DB.l.accent,lt=!!o.light,R=rng((o.seed||1)+hashS(key)),hs=hslOf(acc),H=hs[0],S=hs[1],L=hs[2];
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(x,y);c.fillStyle=lt?tint(acc,.1):acc;c.fillRect(0,0,w,h);
  const Lt=a=>"rgba(255,255,255,"+a+")",Dk=a=>lt?hsl(H,S,L,a*.4):"rgba(0,0,0,"+a+")",Ln=a=>lt?hsl(H,S,L,Math.min(1,a*1.7)):"rgba(255,255,255,"+a+")",mx=Math.max(w,h);
  if(key=="wash"){for(let i=0;i<9;i++){const cx=R()*w,cy=R()*h,r=(.3+R()*.5)*mx,hh=H+(R()-.5)*60,k=i%3,col=k==0?Lt(lt?.55:.26):k==1?hsl(hh,S+8,L+(lt?22:18),lt?.45:.5):Dk(.3),g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(.6,col.replace(/[\d.]+\)$/,(k==2?.12:.1)+")"));g.addColorStop(1,col.replace(/[\d.]+\)$/,"0)"));c.fillStyle=g;c.fillRect(0,0,w,h)}
    speck(c,w,h,R,.07)}
  else if(key=="topo"){const cs=[[w*(.2+R()*.5),h*(.15+R()*.4)],[w*(.4+R()*.5),h*(.55+R()*.4)]],ph=[R()*6,R()*6,R()*6];
    cs.forEach((cc,ci)=>{for(let k=1;k<=26;k++){const r0=k*mx*.04;c.beginPath();for(let a=0;a<=72;a++){const t=a/72*6.2832,rr=r0*(1+.2*Math.sin(2*t+ph[0]+k*.12+ci)+.11*Math.sin(3*t+ph[1]-k*.09)+.05*Math.sin(5*t+ph[2]+k*.2));const px=cc[0]+Math.cos(t)*rr,py=cc[1]+Math.sin(t)*rr*.82;a?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.strokeStyle=Ln(k%5==0?.2:.1);c.lineWidth=k%5==0?1.1:.6;c.stroke()}});
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,Dk(.0));g.addColorStop(1,Dk(.28));c.fillStyle=g;c.fillRect(0,0,w,h);speck(c,w,h,R,.04)}
  else if(key=="rays"){const cx=w*(.38+R()*.24),cy=h*.98,n=26;const g0=c.createLinearGradient(0,0,0,h);g0.addColorStop(0,Dk(.3));g0.addColorStop(1,Lt(lt?.4:.12));c.fillStyle=g0;c.fillRect(0,0,w,h);
    for(let i=0;i<n;i++){const a0=Math.PI+i*Math.PI/n,a1=a0+Math.PI/n*.5;c.fillStyle=Lt(lt?.4:.1);c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,mx*1.6,a0,a1);c.closePath();c.fill()}
    const g=c.createRadialGradient(cx,cy,0,cx,cy,h*.8);g.addColorStop(0,Lt(lt?.7:.5));g.addColorStop(.4,Lt(.12));g.addColorStop(1,Lt(0));c.fillStyle=g;c.fillRect(0,0,w,h);speck(c,w,h,R,.05)}
  else if(key=="facets"){const cols=6,rows=Math.max(4,Math.round(cols*h/w)),P=[];for(let j=0;j<=rows;j++){P[j]=[];for(let i=0;i<=cols;i++){const jx=(i==0||i==cols)?0:(R()-.5)*.8,jy=(j==0||j==rows)?0:(R()-.5)*.8;P[j][i]=[(i+jx)*w/cols,(j+jy)*h/rows]}}
    const tri=(a,b,d)=>{const sh=(R()-.5);c.fillStyle=lt?hsl(H+sh*14,S,L+10,.05+R()*.14):hsl(H+sh*16,S,L+sh*26,1);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();c.fill();c.strokeStyle=Ln(.1);c.lineWidth=.5;c.stroke()};
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=P[j][i],b=P[j][i+1],d=P[j+1][i],e=P[j+1][i+1];if(R()<.5){tri(a,b,d);tri(b,e,d)}else{tri(a,b,e);tri(a,e,d)}}
    const g=c.createLinearGradient(0,0,w*.6,h);g.addColorStop(0,Lt(.14));g.addColorStop(1,Dk(.3));c.fillStyle=g;c.fillRect(0,0,w,h)}
  else if(key=="hills"){const sk=c.createLinearGradient(0,0,0,h);sk.addColorStop(0,Dk(.34));sk.addColorStop(.7,Lt(lt?.45:.2));sk.addColorStop(1,Lt(.08));c.fillStyle=sk;c.fillRect(0,0,w,h);
    const sx=w*(.3+R()*.4),sy=h*(.34+R()*.12),sg=c.createRadialGradient(sx,sy,0,sx,sy,w*.5);sg.addColorStop(0,Lt(.6));sg.addColorStop(.25,Lt(.2));sg.addColorStop(1,Lt(0));c.fillStyle=sg;c.fillRect(0,0,w,h);c.fillStyle=Lt(.7);c.beginPath();c.arc(sx,sy,w*.055,0,6.2832);c.fill();
    for(let i=0;i<5;i++){const yb=h*(.5+i*.11),amp=h*(.05+R()*.04),f1=(1.2+R()*1.6)/w*6.28,f2=(3+R()*3)/w*6.28,p1=R()*6.28,p2=R()*6.28;c.beginPath();c.moveTo(0,h);for(let xx=0;xx<=w;xx+=3)c.lineTo(xx,yb+amp*Math.sin(xx*f1+p1)+amp*.35*Math.sin(xx*f2+p2));c.lineTo(w,h);c.closePath();c.fillStyle=Dk(.12+i*.1);c.fill();const hg=c.createLinearGradient(0,yb-amp,0,yb+amp*2.5);hg.addColorStop(0,Lt(.1));hg.addColorStop(1,Lt(0));c.fillStyle=hg;c.fill()}speck(c,w,h,R,.05)}
  else if(key=="grain"){const g=c.createLinearGradient(0,0,w*.7,h);g.addColorStop(0,hsl(H,S,L+(lt?18:13),lt?.25:1));g.addColorStop(1,hsl(H,S,L-(lt?4:12),lt?.25:1));c.fillStyle=g;c.fillRect(0,0,w,h);speck(c,w,h,R,.1)}
  c.restore()}
function coverArt(c,x,y,w,h,d,o){o=o||{};const k=artKey(d);if(k=="none"){c.fillStyle=o.light?tint(o.acc||DB.l.accent,.1):(o.acc||DB.l.accent);c.fillRect(x,y,w,h);return}artFill(c,x,y,w,h,k,Object.assign({seed:artSeed()},o))}

/* ---------- line illustrations (unit box, centered, half-size s) ---------- */
const ILL=[["olive","Olive branch"],["wheat","Wheat"],["star","Star"],["candle","Candle"],["wreath","Wreath"],["lily","Lily"],["flame","Flame"],["sun","Sunrise"],["cross","Cross"]];
function leafP(c,len,wid){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.5,-wid,len,0);c.quadraticCurveTo(len*.5,wid,0,0);c.closePath()}
function leafAt(c,x,y,ang,len,wid,fa){c.save();c.translate(x,y);c.rotate(ang);leafP(c,len,wid);if(fa){c.globalAlpha*=fa;c.fill();c.globalAlpha/=fa}c.stroke();c.beginPath();c.moveTo(0,0);c.lineTo(len*.82,0);c.stroke();c.restore()}
function drawIll(c,key,cx,cy,s,col,lw,alpha){c.save();c.translate(cx,cy);c.scale(s,s);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=(lw||1.4)/s;c.lineCap="round";c.lineJoin="round";c.globalAlpha=alpha==null?1:alpha;
  const Q=(t,a,b,d)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*d[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*d[1]],TG=(t,a,b,d)=>{const dx=2*(1-t)*(b[0]-a[0])+2*t*(d[0]-b[0]),dy=2*(1-t)*(b[1]-a[1])+2*t*(d[1]-b[1]);return Math.atan2(dy,dx)};
  if(key=="olive"){const A=[-.95,.62],B=[-.05,.62],D=[.95,-.45];c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(B[0],B[1],D[0],D[1]);c.stroke();
    for(let i=0;i<8;i++){const t=.1+i*.105,p=Q(t,A,B,D),a=TG(t,A,B,D),sd=i%2?1:-1;leafAt(c,p[0],p[1],a+sd*.85,.34,.085,.12)}
    const e=Q(1,A,B,D);leafAt(c,e[0],e[1],TG(1,A,B,D),.32,.08,.12);
    [[.3,1],[.52,-1],[.7,1]].forEach(o=>{const p=Q(o[0],A,B,D),a=TG(o[0],A,B,D)+o[1]*1.5,ex=p[0]+Math.cos(a)*.16,ey=p[1]+Math.sin(a)*.16;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(ex,ey);c.stroke();c.beginPath();c.ellipse(ex+Math.cos(a)*.06,ey+Math.sin(a)*.06,.06,.085,a+1.57,0,6.2832);c.globalAlpha*=.3;c.fill();c.globalAlpha/=.3;c.stroke()})}
  else if(key=="wheat"){const A=[-.05,1],B=[.12,.1],D=[.02,-.62];c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(B[0],B[1],D[0],D[1]);c.stroke();
    for(let i=0;i<4;i++){const t=.5+i*.13,p=Q(t,A,B,D),a=TG(t,A,B,D);[-1,1].forEach(sd=>leafAt(c,p[0],p[1],a+sd*.6,.34,.095,.18))}
    leafAt(c,D[0],D[1],TG(1,A,B,D),.3,.07,.15);leafAt(c,A[0]+.02,A[1]-.15,-1.1,.5,.06,0);leafAt(c,A[0]+.02,A[1]-.25,-2.05,.45,.055,0)}
  else if(key=="star"){const n=8;c.beginPath();for(let i=0;i<n*2;i++){const a=-1.5708+i*Math.PI/n,r=i%2?.2:(i%4==0?1:.56);i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.globalAlpha*=.14;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke();c.beginPath();c.arc(0,0,.09,0,6.2832);c.fill();
    for(let i=0;i<4;i++){const a=i*Math.PI/2+.785;c.beginPath();c.moveTo(Math.cos(a)*.7,Math.sin(a)*.7);c.lineTo(Math.cos(a)*.86,Math.sin(a)*.86);c.stroke()}}
  else if(key=="candle"){c.beginPath();c.moveTo(-.2,.95);c.lineTo(-.2,-.1);c.lineTo(.2,-.1);c.lineTo(.2,.95);c.stroke();c.beginPath();c.ellipse(0,.95,.2,.05,0,0,6.2832);c.stroke();c.beginPath();c.ellipse(0,-.1,.2,.05,0,0,6.2832);c.stroke();
    c.beginPath();c.moveTo(0,-.12);c.lineTo(0,-.24);c.stroke();c.beginPath();c.moveTo(0,-.27);c.bezierCurveTo(-.17,-.45,-.1,-.62,0,-.85);c.bezierCurveTo(.1,-.62,.17,-.45,0,-.27);c.closePath();c.globalAlpha*=.25;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke();
    for(let i=0;i<5;i++){const a=-2.5+i*.5,r1=.45,r2=.55;c.beginPath();c.moveTo(Math.cos(a)*r1,-.55+Math.sin(a)*r1);c.lineTo(Math.cos(a)*r2,-.55+Math.sin(a)*r2);c.stroke()}
    c.beginPath();c.ellipse(0,.98,.5,.09,0,0,6.2832);c.globalAlpha*=.12;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke()}
  else if(key=="wreath"){const n=15;c.beginPath();c.arc(0,0,.7,0,6.2832);c.stroke();for(let i=0;i<n;i++){const a=i/n*6.2832,px=Math.cos(a)*.7,py=Math.sin(a)*.7,t=a+1.5708;leafAt(c,px,py,t-.85,.3,.1,.14);leafAt(c,px,py,t+.85,.26,.09,.14)}
    [[-.13,.0],[.13,.0],[0,.16]].forEach(q=>{c.beginPath();c.arc(q[0],.98+q[1]-.08,.055,0,6.2832);c.globalAlpha*=.45;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke()})}
  else if(key=="lily"){c.beginPath();c.moveTo(0,1);c.quadraticCurveTo(.08,.3,0,-.1);c.stroke();leafAt(c,0,.85,-2.4,.65,.12,.12);leafAt(c,0,.7,-.75,.6,.11,.12);
    const pet=(a,l,wd)=>{c.save();c.translate(0,-.12);c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(l*.35,-wd*1.2,l*.8,-wd*.9,l,0);c.bezierCurveTo(l*.8,wd*.9,l*.35,wd*1.2,0,0);c.closePath();c.globalAlpha*=.1;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke();c.beginPath();c.moveTo(l*.1,0);c.lineTo(l*.85,0);c.stroke();c.restore()};
    pet(-2.45,.78,.2);pet(-.7,.78,.2);pet(-1.5708,.9,.24);for(let i=0;i<3;i++){const a=-1.5708+(i-1)*.45;c.beginPath();c.moveTo(0,-.14);c.lineTo(Math.cos(a)*.36,-.14+Math.sin(a)*.36);c.stroke();c.beginPath();c.arc(Math.cos(a)*.38,-.14+Math.sin(a)*.38,.03,0,6.2832);c.fill()}}
  else if(key=="flame"){const fl=(k,dx,dy)=>{c.save();c.translate(dx,dy);c.scale(k,k);c.beginPath();c.moveTo(0,1);c.bezierCurveTo(-.55,1,-.66,.42,-.32,-.08);c.bezierCurveTo(-.26,.12,-.12,.16,-.08,.04);c.bezierCurveTo(-.14,-.38,.02,-.72,.12,-1);c.bezierCurveTo(.32,-.6,.76,-.12,.58,.5);c.bezierCurveTo(.52,.86,.32,1,0,1);c.closePath();c.restore()};
    fl(1,0,0);c.save();c.globalAlpha*=.12;c.fill();c.restore();c.stroke();fl(.5,.02,.42);c.stroke()}
  else if(key=="sun"){c.beginPath();c.arc(0,.35,.5,Math.PI,0);c.stroke();for(let i=0;i<9;i++){const a=Math.PI+.22+i*(Math.PI-.44)/8;c.beginPath();c.moveTo(Math.cos(a)*.66,.35+Math.sin(a)*.66);c.lineTo(Math.cos(a)*.92,.35+Math.sin(a)*.92);c.stroke()}
    c.beginPath();c.moveTo(-1,.35);c.lineTo(1,.35);c.stroke();c.beginPath();c.moveTo(-.9,.62);c.quadraticCurveTo(-.4,.45,0,.62);c.quadraticCurveTo(.4,.78,.9,.55);c.stroke();c.beginPath();c.moveTo(-.55,.88);c.quadraticCurveTo(0,.74,.55,.88);c.stroke()}
  else if(key=="cross"){const v=.09;c.beginPath();c.rect(-v,-.85,2*v,1.75);c.rect(-.5,-.4,1,2*v);c.globalAlpha*=.12;c.fill();c.globalAlpha=alpha==null?1:alpha;c.stroke();
    for(let i=0;i<7;i++){const a=-2.6+i*.37,r1=.6,r2=.78;c.beginPath();c.moveTo(Math.cos(a)*r1,-.28+Math.sin(a)*r1);c.lineTo(Math.cos(a)*r2,-.28+Math.sin(a)*r2);c.stroke()}
    c.beginPath();c.moveTo(-.9,.9);c.quadraticCurveTo(-.3,.78,0,.9);c.quadraticCurveTo(.3,1,.9,.88);c.stroke()}
  c.restore()}
function ornament(c,cx,cy,w,col,lw){c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw||.7;c.beginPath();c.moveTo(cx-w/2,cy);c.lineTo(cx-w*.08,cy);c.moveTo(cx+w*.08,cy);c.lineTo(cx+w/2,cy);c.stroke();c.beginPath();c.arc(cx,cy,w*.025,0,6.2832);c.fill();c.restore()}

/* ---------- seasons ---------- */
const SEASONS=[
 {k:"advent",n:"Advent",d:"Deep purple, candlelight",acc:"#43286b",dsn:"bold",font:"traditional",art:"rays",ill:"candle"},
 {k:"christmas",n:"Christmas",d:"Evergreen and a star",acc:"#1e4d3a",dsn:"cross",font:"classic",art:"wash",ill:"star"},
 {k:"lent",n:"Lent",d:"Quiet, plum and stone",acc:"#4f3a55",dsn:"minimal",font:"clean",art:"topo",ill:"olive"},
 {k:"easter",n:"Easter",d:"Sunrise over the hills",acc:"#b8862e",dsn:"arch",font:"classic",art:"hills",ill:"lily"},
 {k:"pentecost",n:"Pentecost",d:"Flame red, bold",acc:"#a6281f",dsn:"bold",font:"modern",art:"facets",ill:"flame"},
 {k:"thanksgiving",n:"Thanksgiving",d:"Harvest rust and wheat",acc:"#9a4f24",dsn:"poster",font:"traditional",art:"wash",ill:"wheat"}];
function easterOf(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da)}
function seasonFor(ds){const p=(ds||"").split("-").map(Number);if(p.length<3||!p[0])return null;const d=new Date(p[0],p[1]-1,p[2]),y=p[0],D=n=>new Date(y,0,1+n),day=86400000,E=easterOf(y);
  const ash=new Date(E.getTime()-46*day),pent=new Date(E.getTime()+49*day);
  if(d>=ash&&d<E)return"lent";if(+d==+pent)return"pentecost";if(d>=E&&d<pent)return"easter";
  const dec25=new Date(y,11,25),w=dec25.getDay(),adv=new Date(dec25.getTime()-(w==0?28:w+21)*day);if(d>=adv&&d<dec25)return"advent";
  if(d>=dec25||d<=new Date(y,0,5))return"christmas";
  const nov1=new Date(y,10,1),th=new Date(y,10,1+((4-nov1.getDay()+7)%7)+21),sun=new Date(th.getTime()-4*day);if(+d==+sun||+d==+new Date(th.getTime()-11*day))return"thanksgiving";return null}
