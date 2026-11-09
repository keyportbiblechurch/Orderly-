/* ===== Orderly: data, text engine, layouts (all drawing is canvas, in points) ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad2=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
const addDays=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d)};
const longDate=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const midDate=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
const shortDate=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const slug=s=>String(s||"bulletin").toLowerCase().replace(/[^\w]+/g,"-").replace(/^-|-$/g,"")||"bulletin";
const uid=()=>Math.random().toString(36).slice(2,9);
const nextSunday=()=>{const d=new Date();d.setDate(d.getDate()+((7-d.getDay())%7));return iso(d)};

/* ---------- Scripture ---------- */
const AL={GEN:"ge gen",EXO:"ex exo exod",LEV:"le lev",NUM:"nu num",DEU:"de deut dt",JOS:"jos josh",JDG:"jdg judg jg",RUT:"ru rut","1SA":"1sa 1sam","2SA":"2sa 2sam","1KI":"1ki 1kgs 1kin","2KI":"2ki 2kgs 2kin","1CH":"1ch 1chr","2CH":"2ch 2chr",EZR:"ezr",NEH:"ne neh",EST:"es est esth",JOB:"job",PSA:"ps psa psalm psalms pslm",PRO:"pr pro prov",ECC:"ec ecc eccl",SNG:"sng song sos songofsongs songofsolomon",ISA:"isa",JER:"jer",LAM:"la lam",EZK:"eze ezek ezk",DAN:"da dan",HOS:"ho hos",JOL:"joe joel",AMO:"am amo",OBA:"ob oba obad",JON:"jon jnh jonah",MIC:"mi mic",NAM:"na nah nam",HAB:"hab",ZEP:"zep zeph",HAG:"hag",ZEC:"zec zech",MAL:"mal",MAT:"mt mat matt",MRK:"mk mr mrk mark",LUK:"lk lu luk",JHN:"jn jhn joh john",ACT:"ac act acts",ROM:"ro rom",  "1CO":"1co 1cor","2CO":"2co 2cor",GAL:"ga gal",EPH:"eph",PHP:"php phil phi",COL:"col","1TH":"1th 1thes","2TH":"2th 2thes","1TI":"1ti 1tim","2TI":"2ti 2tim",TIT:"tit",PHM:"phm philem",HEB:"heb",JAS:"jas jam",  "1PE":"1pe 1pet","2PE":"2pe 2pet","1JN":"1jn 1jo 1john","2JN":"2jn 2john","3JN":"3jn 3john",JUD:"jud jude",REV:"re rev"};
const normB=s=>s.toLowerCase().replace(/^(iii|ii|i|first|second|third)\b\s*/,m=>({iii:"3",ii:"2",i:"1",first:"1",second:"2",third:"3"}[m.trim()])).replace(/[.\s]/g,"");
let BK=null;
function findBook(s){if(!BK){BK={ex:{},nm:[]};BIBLE.forEach((b,i)=>{BK.ex[normB(b[1])]=i;BK.ex[b[0].toLowerCase()]=i;BK.nm.push([normB(b[1]),i]);(AL[b[0]]||"").split(" ").forEach(a=>{if(a&&!(a in BK.ex))BK.ex[a]=i})})}
  const n=normB(s);if(!n)return -1;if(n in BK.ex)return BK.ex[n];if(n.length<3)return -1;const m=BK.nm.find(x=>x[0].startsWith(n));return m?m[1]:-1}
function parseRef(q){const m=String(q||"").match(/^\s*((?:[1-3]|iii|ii|i|first|second|third)?\s*[a-z][a-z. ]*?)\s*(?:(\d+)(?:\s*[:.]\s*(\d+)(?:\s*[-–—]\s*(\d+))?)?)?\s*$/i);if(!m)return null;
  const b=findBook(m[1]);if(b<0)return null;const nc=BIBLE[b][2].length;let c=m[2]?+m[2]:null;if(c==null||c<1||c>nc)return null;
  return{b,c:c-1,s:m[3]?+m[3]:null,e:m[4]?+m[4]:(m[3]?+m[3]:null)}}
/* returns {ref, verses:[[n,text]], cut} or null */
function passage(q){const p=parseRef(q);if(!p)return null;const bk=BIBLE[p.b],ch=bk[2][p.c];let a=0,z=ch.n.length-1;
  if(p.s!=null){a=ch.n.indexOf(p.s);if(a<0)return null;z=Math.min(ch.n.length-1,Math.max(a,ch.n.lastIndexOf(Math.min(p.e,ch.n[ch.n.length-1]))))}
  let cut=false;if(z-a>39){z=a+39;cut=true}
  const v=[];for(let i=a;i<=z;i++)v.push([ch.n[i],ch.v[i].replace(/\s*\n\s*/g," ").trim()]);
  const ref=bk[1]+" "+(p.c+1)+(p.s!=null?":"+ch.n[a]+(z>a?"–"+ch.n[z]:""):"");
  return{ref,verses:v,cut}}

/* ---------- Data ---------- */
const SECN={welcome:"Welcome",order:"Order of service",sermon:"Sermon",announce:"Announcements",events:"Coming up",prayer:"Prayer requests",giving:"Giving",connect:"Next steps",custom:"Custom section"};
const BACK={giving:1,connect:1};
function newSec(k){const b={id:uid(),k,on:true};
  if(k=="welcome")b.text="";if(k=="order")b.items=[];if(k=="sermon")Object.assign(b,{title:"",speaker:"",series:"",ref:"",showText:true,lines:-1});
  if(k=="announce")b.items=[];if(k=="events")b.items=[];if(k=="prayer")b.text="";if(k=="giving")b.text="";if(k=="connect")b.text="";if(k=="custom")Object.assign(b,{h:"",text:""});return b}
function sampleWeek(date){const S=k=>newSec(k);const w={id:uid(),date,theme:"",secs:[]};
  const wel=S("welcome");wel.text="We’re glad you’re here. Whether this is your first Sunday or your five hundredth, you are welcome. Children are invited to stay with their families or join the nursery downstairs.";
  const od=S("order");od.items=[{l:"Welcome and call to worship",n:""},{l:"Opening hymn",n:"“Come, Thou Fount”"},{l:"Prayer of confession",n:""},{l:"Scripture reading",n:"John 1:1–5"},{l:"Worship in song",n:""},{l:"Message",n:""},{l:"Response and offering",n:""},{l:"Benediction",n:""}];
  const se=S("sermon");se.title="The Word Became Flesh";se.speaker="Pastor Jesse";se.series="Gospel of John";se.ref="John 1:1-5";se.lines=-1;
  const an=S("announce");an.items=[{h:"Wednesday prayer",b:"Join us at 6:30 PM in the fellowship hall to pray for our church and our neighbors."},{h:"Kids’ choir",b:"Rehearsal moves to Saturday mornings at 10:00 AM."}];
  const ev=S("events");ev.items=[{d:"Sat, Nov 15",h:"Men’s breakfast",b:"8:00 AM, fellowship hall"},{d:"Sun, Nov 23",h:"Thanksgiving potluck",b:"After the service"},{d:"Sun, Dec 7",h:"Advent begins",b:""}];
  const pr=S("prayer");pr.text="Families traveling this week\nThose recovering from surgery\nOur missionaries and their churches";
  const gi=S("giving");gi.text="Give online or place your gift in the box at the back. Everything given supports the ministry of our church and our missions partners.";
  const co=S("connect");co.text="New here? Fill out a connect card and hand it to anyone wearing a lanyard, or stop by the welcome table after the service.";
  w.secs=[wel,od,se,an,ev,pr,gi,co];return w}
const DEF={c:{name:"Keyport Bible Church",tag:"Know Christ. Make Him known.",addr:"Keyport, Washington",phone:"",email:"",web:"keyportbible.org",qr:true,times:[{d:"Sunday",t:"10:00 AM",n:"Worship service"}],logo:""},
  l:{layout:"booklet",design:"editorial",photo:"",accent:"#1f3a68",font:"classic",size:"std",cover:"light",align:"left",pstyle:"columns",cf:{d:"Playfair Display",dw:700,b:"Lora",ds:1,bs:1},up:[],gf:[],art:"auto",ill:"none",pt:"natural",seed:0,pack:""}};
const KEY="folio.v1";
function loadDB(){try{const r=JSON.parse(localStorage.getItem(KEY)||"null");if(r&&r.weeks&&r.weeks.length)return{c:Object.assign({},DEF.c,r.c),l:Object.assign({},DEF.l,r.l),weeks:r.weeks,cur:r.cur}}catch(e){}
  const w=sampleWeek(nextSunday());return{c:JSON.parse(JSON.stringify(DEF.c)),l:Object.assign({},DEF.l),weeks:[w],cur:w.id}}
let DB=loadDB();if(!DB.weeks.find(w=>w.id==DB.cur))DB.cur=DB.weeks[0].id;
let saveT;const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}},300)};
const W=()=>DB.weeks.find(w=>w.id==DB.cur);

/* ---------- Look ---------- */
const FS={
 classic:{n:"Classic",d:["Cormorant Garamond",600],b:["EB Garamond",400],l:["Jost",500],ds:1.12,bs:1.1},
 modern:{n:"Modern",d:["DM Serif Display",400],b:["DM Sans",400],l:["DM Sans",600],ds:1,bs:.97},
 traditional:{n:"Traditional",d:["Libre Baskerville",700],b:["Source Serif 4",400],l:["Source Sans 3",600],ds:.9,bs:1},
 clean:{n:"Clean",d:["Manrope",700],b:["Manrope",400],l:["Manrope",700],ds:.92,bs:.95}};
const SWATCH=["#1f3a68","#2f5d46","#7a2e3a","#3d4a5c","#8a5a2b","#1f6f78","#5b3f86","#1a1a1a"];
const INK="#1c1f26",MUTE="#646a76",RULE="#d3d7de";
const FB='Georgia, "Times New Roman", serif';
const SANS=new Set(["DM Sans","Jost","Manrope","Source Sans 3"]);
const fnt=(wt,sz,f,it)=>(it?"italic ":"")+wt+" "+sz+'px "'+f[0]+'", '+(SANS.has(f[0])?"Helvetica, Arial, sans-serif":FB);
let fontsOK={};
async function loadFonts(){const k=DB.l.font,key=k=="custom"?"custom:"+JSON.stringify(DB.l.cf)+(DB.l.up||[]).length:k;if(fontsOK[key])return;const f=fontSet(k);if(k=="custom"){try{await Promise.race([ensureCustom(),new Promise(r=>setTimeout(r,6000))])}catch(x){}}
  const sp=[`${f.d[1]} 20px "${f.d[0]}"`,`400 12px "${f.b[0]}"`,`italic 400 12px "${f.b[0]}"`,`700 12px "${f.b[0]}"`,`${f.l[1]} 12px "${f.l[0]}"`];
  try{await Promise.race([Promise.all(sp.map(s=>document.fonts.load(s))),new Promise(r=>setTimeout(r,3500))])}catch(e){}fontsOK[key]=1}

/* ---------- Text engine ---------- */
const sc=document.createElement("canvas").getContext("2d");
function wrapT(t,font,w){sc.font=font;const out=[];String(t||"").split("\n").forEach(para=>{if(!para.trim()){out.push("");return}
  let line="";para.trim().split(/\s+/).forEach(wd=>{const tt=line?line+" "+wd:wd;if(sc.measureText(tt).width>w&&line){out.push(line);line=wd}else line=tt});if(line)out.push(line)});
  while(out.length&&out[out.length-1]==="")out.pop();return out}
const mw=(t,font)=>{sc.font=font;return sc.measureText(t).width};
function fit1(t,font,w){if(mw(t,font)<=w)return t;let s=t;while(s.length>1&&mw(s+"…",font)>w)s=s.slice(0,-1);return s.trimEnd()+"…"}

function ctxOf(L){ // style context for rows
  const f=fontSet(L.font),base=L.s;return{f,s:base,bs:base*f.bs,ds:f.ds,acc:L.accent,design:L.design,
    body:(sz,wt,it)=>fnt(wt||400,sz,f.b,it),disp:sz=>fnt(f.d[1],sz,f.d),lab:sz=>fnt(f.l[1],sz,f.l)}}

function T(t,o){const jf=o.align=="justify";let lines;
  if(jf){lines=[];String(t||"").split("\n").forEach(p=>{if(!p.trim()){lines.push({t:"",last:1});return}const L=wrapT(p,o.font,o.w-(o.ind||0));L.forEach((l,i)=>lines.push({t:l,last:i==L.length-1}))});while(lines.length&&lines[lines.length-1].t==="")lines.pop()}
  else lines=wrapT(t,o.font,o.w-(o.ind||0)).map(l=>({t:l}));
  return lines.map(L=>L.t===""?{h:o.lh*.5,blank:true,draw(){}}:{h:o.lh,draw(c,x,y,w){c.font=o.font;c.fillStyle=o.color;c.textBaseline="alphabetic";const by=y+o.lh*.5+o.size*.32,ww=w-(o.ind||0);
    if(jf&&!L.last){const ws=L.t.split(" "),tw=ws.reduce((a,v)=>a+mw(v,o.font),0),gp=ws.length>1?(ww-tw)/(ws.length-1):0,sp=mw(" ",o.font);if(ws.length>1&&gp<=sp*3.2){c.textAlign="left";let px=x+(o.ind||0);ws.forEach(v=>{c.fillText(v,px,by);px+=mw(v,o.font)+gp});return}}
    c.textAlign=o.align=="center"?"center":o.align=="right"?"right":"left";const px=o.align=="center"?x+w/2:o.align=="right"?x+w:x+(o.ind||0);c.fillText(L.t,px,by)}})}
function labelTxt(c,txt,x,y,font,color,sp){c.font=font;c.fillStyle=color;c.textAlign="left";c.textBaseline="alphabetic";try{c.letterSpacing=(sp||0)+"px"}catch(e){}c.fillText(txt,x,y);const w=c.measureText(txt).width;try{c.letterSpacing="0px"}catch(e){}return w}
const gap=h=>({h,blank:true,draw(){}});

/* verse text with small raised verse numbers */
function verseRows(X,ps,sz,w,al){const f=X.body(sz),nf=X.lab(sz*.62),lh=sz*1.4,sp=mw(" ",f),lines=[];let cur=[],x=0;
  const push=r=>{lines.push(cur);cur=[];x=0};
  ps.verses.forEach(v=>{const nw=mw(String(v[0]),nf)+sz*.14,gp=x>0?sp*1.1:0;if(x>0&&x+gp+nw+mw(v[1].split(" ")[0],f)>w)push();
    x+=(x>0?sp*1.1:0);cur.push({t:String(v[0]),n:1,x});x+=nw;
    v[1].split(/\s+/).forEach(wd=>{const ww=mw(wd,f);if(x>0&&x+sp+ww>w&&cur.length){push()}if(x>0&&!(cur.length&&cur[cur.length-1].n&&cur[cur.length-1].x+mw(cur[cur.length-1].t,nf)+sz*.14==x)){x+=sp}cur.push({t:wd,x});x+=ww})});
  if(cur.length)lines.push(cur);
  return lines.map((L,li)=>{const la=L[L.length-1],lw=la?la.x+(la.n?mw(la.t,nf)+sz*.14:mw(la.t,f)):0,isLast=li==lines.length-1;
    return{h:lh,draw(c,x0,y,ww){c.textBaseline="alphabetic";c.textAlign="left";const bl=y+lh*.5+sz*.32;let off=0,sh=null;
      if(al=="center")off=(ww-lw)/2;else if(al=="right")off=ww-lw;else if(al=="justify"&&!isLast&&L.length>1){let g=0;for(let q=1;q<L.length;q++)if(!L[q-1].n)g++;const ex=g?(ww-lw)/g:0;if(g&&ex>=0&&ex<=sp*3){sh=[];let acc=0;L.forEach((r,q)=>{if(q>0&&!L[q-1].n)acc+=ex;sh.push(acc)})}}
      L.forEach((r,q)=>{const px=x0+r.x+off+(sh?sh[q]:0);if(r.n){c.font=nf;c.fillStyle=X.acc;c.fillText(r.t,px,bl-sz*.3)}else{c.font=f;c.fillStyle=INK;c.fillText(r.t,px,bl)}})}}})}

/* ---------- Section rows ---------- */
function secRows(X,sec,w,wk){const s=X.bs,lh=s*1.42,R=[];const body=X.body(s),mute=MUTE,al=sec.al||DB.l.align||"left",al2=al=="justify"?"left":al;
  const para=(t,o)=>T(t,Object.assign({font:body,color:INK,size:s,lh,w,align:al},o||{}));
  if(sec.k=="welcome"){if(!sec.text.trim())return R;R.push(head(X,"Welcome",al),...para(sec.text),gap(s*.5))}
  else if(sec.k=="order"){const it=sec.items.filter(i=>(i.l||"").trim());if(!it.length)return R;R.push(head(X,"Order of service",al));
    it.forEach(i=>R.push({h:lh*1.08,draw(c,x,y,w){const bl=y+lh*.5+s*.32,nf=X.body(s*.95,400,true),nt=(i.n||"").trim(),nw=nt?mw(nt,nf):0,lf=fit1(i.l.trim(),body,w-nw-(nt?16:0));
      c.textBaseline="alphabetic";c.textAlign="left";c.font=body;c.fillStyle=INK;
      if(al=="center"||al=="right"){const lt=i.l.trim(),sep="  ·  ",tot=mw(lt,body)+(nt?mw(sep,body)+nw:0);if(tot<=w){let px=al=="center"?x+(w-tot)/2:x+w-tot;c.fillText(lt,px,bl);if(nt){px+=mw(lt,body);c.fillStyle=mute;c.fillText(sep,px,bl);px+=mw(sep,body);c.font=nf;c.fillText(nt,px,bl)}return}}
      c.fillText(lf,x,bl);
      if(nt){c.font=nf;c.fillStyle=mute;c.textAlign="right";c.fillText(nt,x+w,bl);const lw=mw(lf,body);c.save();c.strokeStyle="#b9bec8";c.lineWidth=.7;c.setLineDash([.5,2.6]);c.beginPath();c.moveTo(x+lw+6,bl-1);c.lineTo(x+w-nw-6,bl-1);c.stroke();c.restore()}}}));R.push(gap(s*.5))}
  else if(sec.k=="sermon"){const hasAny=sec.title||sec.ref||sec.speaker||sec.series;if(!hasAny)return R;R.push(head(X,"Sermon",al));
    const kp=a=>{a.forEach(r=>r.keep=true);return a};
    if(sec.title)R.push(...kp(T(sec.title,{font:X.disp(s*1.75*X.ds),color:INK,size:s*1.75*X.ds,lh:s*1.75*X.ds*1.15,w,align:al2})));
    const sub=[sec.speaker,sec.series].filter(Boolean).join("  ·  ");if(sub)R.push(...kp(T(sub,{font:X.body(s*.98,400,true),color:mute,size:s,lh,w,align:al2})));
    const ps=passage(sec.ref);
    if(sec.ref.trim()){const g1=gap(s*.35);g1.keep=true;R.push(g1,...kp(T(ps?ps.ref:sec.ref,{font:X.lab(s*.86),color:X.acc,size:s*.86,lh,w,align:al2})));
      if(ps&&sec.showText){const g2=gap(s*.2);g2.keep=true;R.push(g2,...verseRows(X,ps,s*.98,w,al),...T("Berean Standard Bible (public domain)",{font:X.body(s*.72,400,true),color:mute,size:s*.72,lh:s*1.2,w,align:al2}))}}
    if(sec.lines!=0){R.push(gap(s*.5));const nr=T("Notes",{font:X.lab(s*.72),color:mute,size:s*.72,lh:s*1.3,w});nr.forEach(r=>r.keep=true);R.push(...nr);const st=lh*1.35,n=sec.lines>0?sec.lines:3;R.push({h:st*n,fill:sec.lines<0,draw(c,x,y,w,hh){const cnt=sec.lines<0?Math.max(3,Math.floor((hh||st*n)/st)):n;c.strokeStyle=RULE;c.lineWidth=.6;for(let i=0;i<cnt;i++){c.beginPath();c.moveTo(x,y+lh*1.2+i*st);c.lineTo(x+w,y+lh*1.2+i*st);c.stroke()}}})}
    R.push(gap(s*.6))}
  else if(sec.k=="announce"){const it=sec.items.filter(i=>(i.h||"").trim()||(i.b||"").trim());if(!it.length)return R;R.push(head(X,"Announcements",al));
    it.forEach(i=>{if((i.h||"").trim())R.push(...T(i.h.trim(),{font:X.body(s,700),color:INK,size:s,lh,w,align:al2}));if((i.b||"").trim())R.push(...T(i.b.trim(),{font:body,color:INK,size:s,lh,w,align:al}));R.push(gap(s*.45))})}
  else if(sec.k=="events"){const it=sec.items.filter(i=>(i.h||"").trim());if(!it.length)return R;R.push(head(X,"Coming up",al));const dw=Math.min(w*.3,Math.max(52,w*.26));
    it.forEach(i=>{const hl=T(i.h.trim(),{font:X.body(s,700),color:INK,size:s,lh,w:w-dw-8}),bl=(i.b||"").trim()?T(i.b.trim(),{font:body,color:mute,size:s*.96,lh,w:w-dw-8}):[],ds=wrapT((i.d||"").trim(),X.lab(s*.82),dw);
      const rows=[...hl,...bl];rows.forEach((r,ix)=>{const o=r.draw,dl=ix==0?ds:[];r.draw=(c,x,y,ww)=>{o(c,x+dw+8,y,ww-dw-8);dl.forEach((l,j)=>{c.font=X.lab(s*.82);c.fillStyle=X.acc;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(l,x,y+lh*.5+s*.3+j*lh*.9)})}});
      if(ds.length>rows.length)for(let q=rows.length;q<ds.length;q++)rows.push({h:lh*.9,draw(){}});R.push(...rows,gap(s*.4))})}
  else if(sec.k=="prayer"){const ls=sec.text.split("\n").map(x=>x.trim()).filter(Boolean);if(!ls.length)return R;R.push(head(X,"Prayer requests",al));const bul=al=="left"||al=="justify";
    ls.forEach(l=>{const rs=T(l,{font:body,color:INK,size:s,lh,w,ind:bul?s*1.1:0,align:al});rs.forEach((r,i)=>{if(i==0&&bul){const o=r.draw;r.draw=(c,x,y,ww)=>{o(c,x,y,ww);c.fillStyle=X.acc;c.beginPath();c.arc(x+s*.32,y+lh*.5,s*.15,0,6.29);c.fill()}}});R.push(...rs)});R.push(gap(s*.5))}
  else if(sec.k=="giving"||sec.k=="connect"||sec.k=="custom"){const h=sec.k=="custom"?(sec.h||"").trim():SECN[sec.k];if(!sec.text.trim())return R;if(h)R.push(head(X,h,al));R.push(...para(sec.text),gap(s*.5))}
  return R}

/* ---------- Pagination ---------- */
function flow(rows,next,dry){let reg=next();if(!reg)return rows.length;let y=0,i=0;
  while(i<rows.length){const r=rows[i];if(y==0&&r.blank){i++;continue}
    if(r.blank&&y+r.h>reg.h+.01){i++;continue}
    let need=r.h,j=i;while(rows[j].keep&&rows[j+1]){j++;need+=rows[j].h}
    if(y+need>reg.h+.01&&y>0){reg=next();if(!reg)return rows.length-i;y=0;continue}
    const hh=r.fill?Math.max(r.h,reg.h-y):r.h;if(!dry&&r.draw)r.draw(reg.c,reg.x,reg.y+y,reg.w,hh);y+=hh;i++}
  return 0}
function mkPage(Wp,Hp,k,bg){const cv=document.createElement("canvas");cv.width=Math.round(Wp*k);cv.height=Math.round(Hp*k);const c=cv.getContext("2d");c.scale(k,k);c.fillStyle=bg||"#fff";c.fillRect(0,0,Wp,Hp);return{cv,c,W:Wp,H:Hp}}
function qrDraw(c,url,px,py,size,col){if(typeof qrcode!="function"||!url)return;try{const q=qrcode(0,"M");q.addData(url);q.make();const n=q.getModuleCount(),m=size/(n+2);c.fillStyle="#fff";c.fillRect(px,py,size,size);c.fillStyle=col||"#000";
  for(let r=0;r<n;r++)for(let cc=0;cc<n;cc++)if(q.isDark(r,cc))c.fillRect(px+(cc+1)*m,py+(r+1)*m,m+.15,m+.15)}catch(e){}}
const webUrl=u=>{u=(u||"").trim();return u?(/^https?:/i.test(u)?u:"https://"+u):""};
const webShow=u=>(u||"").trim().replace(/^https?:\/\//i,"").replace(/\/$/,"");
let LOGO={src:"",img:null};
function logoImg(){const s=DB.c.logo;if(!s){return null}if(LOGO.src!=s){LOGO={src:s,img:new Image()};LOGO.img.onload=()=>{if(typeof relayout=="function")relayout()};LOGO.img.src=s}return LOGO.img.complete&&LOGO.img.naturalWidth?LOGO.img:null}
function drawLogo(c,x,y,bw,bh,align){const im=logoImg();if(!im)return 0;const r=Math.min(bw/im.naturalWidth,bh/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;c.drawImage(im,align=="right"?x+bw-w:x,y+(bh-h)/2,w,h);return w}
const churchLine=()=>[DB.c.name,DB.c.addr,webShow(DB.c.web)].filter(Boolean).join("  ·  ");

/* ---------- Layouts ---------- */
const SIZES={std:1,large:1.14};
function styleOf(base){return ctxOf({font:DB.l.font,accent:DB.l.accent,design:DB.l.design,s:base})}
function insideSecs(wk){return wk.secs.filter(s=>s.on&&!BACK[s.k])}
function backSecs(wk){return wk.secs.filter(s=>s.on&&BACK[s.k])}
function title4(wk){const se=wk.secs.find(s=>s.k=="sermon"&&s.on);return (wk.theme||"").trim()||(se&&se.title)||"Sunday Worship"}
function timesList(){return DB.c.times.filter(t=>(t.d||"").trim()||(t.t||"").trim()||(t.n||"").trim())}

function drawBack(pg,wk,s,warn,pre){const c=pg.c,Wp=pg.W,Hp=pg.H,nar=Wp<300,m=nar?26:36,X=styleOf(s),w=Wp-2*m;
  const tl=timesList(),blockH=nar?148:150;
  const rows=pre?pre.slice():[];if(!pre)backSecs(wk).forEach(sec=>rows.push(...secRows(X,sec,w,wk)));
  let used=0;const r=flow(rows,()=>used++?null:{c,x:m,y:m,w,h:Hp-2*m-blockH-10});if(r)warn.push(r);
  // info block
  const by=Hp-m-blockH+6;c.strokeStyle=RULE;c.lineWidth=.6;c.beginPath();c.moveTo(m,by-8);c.lineTo(Wp-m,by-8);c.stroke();
  const qs=nar?64:86,url=webUrl(DB.c.web),showQ=!!url&&DB.c.qr!==false,tw=w-(showQ?qs+20:0);let ix=m;
  c.textAlign="left";c.textBaseline="alphabetic";c.font=X.disp(15*X.ds);c.fillStyle=INK;c.fillText(DB.c.name,m,by+14);
  let y=by+32;c.font=X.lab(7.5);const lw=drawLogo(c,Wp-m-60,by-2,60,34,"right");
  labelTxt(c,"JOIN US",m,y,X.lab(7.2),DB.l.accent,1.4);y+=13;
  tl.slice(0,4).forEach(t=>{c.font=X.body(9.2*X.f.bs);c.fillStyle=INK;c.fillText(fit1([t.d,t.t].filter(Boolean).join("  "),X.body(9.2*X.f.bs),tw)+(t.n?"  ·  "+t.n:""),m,y);y+=12.2});
  y+=3;[DB.c.addr,DB.c.phone,DB.c.email,webShow(DB.c.web)].filter(Boolean).forEach(l=>{c.font=X.body(8.8*X.f.bs);c.fillStyle=MUTE;c.fillText(fit1(l,X.body(8.8*X.f.bs),tw),m,y);y+=11.4});
  if(showQ){qrDraw(c,url,Wp-m-qs,Hp-m-qs-12,qs,INK);c.font=X.lab(6.4);c.fillStyle=MUTE;c.textAlign="right";try{c.letterSpacing="1px"}catch(e){}c.fillText("SCAN TO VISIT",Wp-m,Hp-m+2);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left"}}
function folio(pg,txt,right){const c=pg.c,X=styleOf(10);c.font=X.lab(6.8);c.fillStyle="#8a909b";c.textBaseline="alphabetic";c.textAlign=right?"right":"left";try{c.letterSpacing="1px"}catch(e){}c.fillText(txt.toUpperCase(),right?pg.W-34:34,pg.H-24);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left"}


const sermonOf=wk=>wk.secs.find(s=>s.k=="sermon"&&s.on);
const sumH=rows=>rows.reduce((a,r)=>a+r.h,0),trailH=rows=>{let t=0,n=rows.length;while(n&&rows[n-1].blank)t+=rows[--n].h;return t},grp=(rows,o)=>Object.assign({rows,H:sumH(rows),T:trailH(rows)},o);
const hOf=rows=>{let h=0,n=rows.length;while(n&&rows[n-1].blank)n--;for(let i=0;i<n;i++)h+=rows[i].h;return h};
function packGroups(groups,hs){let cur=0,y=0,fail=false;const out=hs.map(()=>[]);
  groups.forEach(g=>{if(g.back&&cur<hs.length-1){cur=hs.length-1;y=0}
    if(y>0&&y+g.H-g.T>hs[cur]+.01){if(cur<hs.length-1){cur++;y=0}else fail=true}
    if(y==0&&g.H-g.T>hs[cur]+.01)fail=true;
    out[cur].push(g);y+=g.H});return{out,fail}}
function packLoose(groups,hs,backIdx){const rem=hs.slice(),out=hs.map(()=>[]);let fail=false;
  groups.forEach(g=>{let idx=-1;const c=g.back&&backIdx>=0?[backIdx]:hs.map((_,i)=>i);for(const i of c)if(rem[i]>=g.H-g.T-.01){idx=i;break}
    if(idx<0){fail=true;idx=c[c.length-1]}out[idx].push(g);rem[idx]-=g.H});return{out,fail}}
function buildBooklet(k,wk,warn){const ser=sermonOf(wk),Wp=396,Hp=612,m=36,w=Wp-2*m,base=10*SIZES[DB.l.size],regH=Hp-2*m-8,backH=Hp-2*m-160,ins=insideSecs(wk).filter(s=>s!==ser),bks=backSecs(wk);
  const mk=(X,secs,back)=>secs.map(sec=>{const rows=secRows(X,sec,w,wk);return grp(rows,{back})}).filter(g=>g.rows.length),hs=ser?[regH,backH]:[regH,regH,backH],one=h=>{let u=0;return()=>u++?null:{h}};
  let s=base,P=null,xtra=false;const groupsAt=f=>{const X=styleOf(base*f);return mk(X,ins,false).concat(mk(X,bks,true))};
  for(const f of [1,.95,.9,.86,.82,.78,.74,.7]){s=base*f;P=packGroups(groupsAt(f),hs);if(!P.fail)break}
  let sRows=[];if(ser)for(const f of [1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,w,wk);if(!flow(sRows,one(regH),true))break}
  const sMin=sRows.map(r=>r.fill?Object.assign({},r,{fill:false}):r);
  if(P.fail){const left=ser?Math.max(0,regH-hOf(sMin)-8):0,hs2=ser?hs.concat(left):hs;
    for(const f of [.7,.66,.62,.58]){s=base*f;P=packLoose(groupsAt(f),hs2,hs.length-1);if(!P.fail)break}
    xtra=!!(ser&&P.out[hs.length]&&P.out[hs.length].length)}
  const cover=mkPage(Wp,Hp,k),in1=mkPage(Wp,Hp,k),in2=mkPage(Wp,Hp,k),back=mkPage(Wp,Hp,k);
  drawCover(cover,wk,{bold:DB.l.cover=="bold"});decor(in1,"in");decor(in2,"in");decor(back,"back");
  const pgs=ser?[in1,back]:[in1,in2,back],rowsOn=i=>P.out[i].flatMap(g=>g.rows);
  pgs.forEach((pg,i)=>{if(pg===back)return;const l=flow(rowsOn(i),one1(pg.c,m,m,w,regH));if(l)warn.push(l)});
  if(ser){const l=flow(xtra?sMin.concat(P.out[hs.length].flatMap(g=>g.rows)):sRows,one1(in2.c,m,m,w,regH));if(l)warn.push(l)}
  folio(in1,DB.c.name+" · "+shortDate(wk.date));folio(in2,"Lord’s Day · "+shortDate(wk.date),true);
  drawBack(back,wk,s,warn,rowsOn(pgs.length-1));
  return{kind:"booklet",pages:[{...cover,label:"Cover"},{...in1,label:"Inside left"},{...in2,label:ser?"Sermon":"Inside right"},{...back,label:"Back"}],W:Wp,H:Hp}}
const one1=(c,x,y,w,h)=>{let u=0;return()=>u++?null:{c,x,y,w,h}};



function buildTrifold(k,wk,warn){const ser=sermonOf(wk),Wp=264,Hp=612,m=26,w=Wp-2*m,base=9*SIZES[DB.l.size],regH=Hp-2*m-8,backH=Hp-2*m-148,ins=insideSecs(wk).filter(s=>s!==ser),bks=backSecs(wk);
  const mk=(X,secs,back)=>secs.map(sec=>{const rows=secRows(X,sec,w,wk);return grp(rows,{back})}).filter(g=>g.rows.length),hs=ser?[regH,regH,regH,backH]:[regH,regH,regH,regH,backH],one=h=>{let u=0;return()=>u++?null:{h}};
  let s=base,P=null,xtra=false;const groupsAt=f=>{const X=styleOf(base*f);return mk(X,ins,false).concat(mk(X,bks,true))};
  for(const f of [1,.95,.9,.86,.82,.78,.74,.7]){s=base*f;P=packGroups(groupsAt(f),hs);if(!P.fail)break}
  let sRows=[];if(ser)for(const f of [1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,w,wk);if(!flow(sRows,one(regH),true))break}
  const sMin=sRows.map(r=>r.fill?Object.assign({},r,{fill:false}):r);
  if(P.fail){const left=ser?Math.max(0,regH-hOf(sMin)-8):0,hs2=ser?hs.concat(left):hs;
    for(const f of [.7,.66,.62,.58]){s=base*f;P=packLoose(groupsAt(f),hs2,hs.length-1);if(!P.fail)break}
    xtra=!!(ser&&P.out[hs.length]&&P.out[hs.length].length)}
  const cover=mkPage(Wp,Hp,k),in1=mkPage(Wp,Hp,k),in2=mkPage(Wp,Hp,k),in3=mkPage(Wp,Hp,k),flap=mkPage(Wp,Hp,k),back=mkPage(Wp,Hp,k);
  drawCover(cover,wk,{bold:DB.l.cover=="bold"});[in1,in2,in3,flap].forEach(p=>decor(p,"in"));decor(back,"back");
  const pgs=ser?[in1,in3,flap,back]:[in1,in2,in3,flap,back],rowsOn=i=>P.out[i].flatMap(g=>g.rows);
  pgs.forEach((pg,i)=>{if(pg===back)return;const l=flow(rowsOn(i),one1(pg.c,m,m,w,regH));if(l)warn.push(l)});
  if(ser){const l=flow(xtra?sMin.concat(P.out[hs.length].flatMap(g=>g.rows)):sRows,one1(in2.c,m,m,w,regH));if(l)warn.push(l)}
  pgs.forEach((pg,i)=>{if(pg===back||rowsOn(i).length)return;const c=pg.c,X=styleOf(10);c.save();c.font=X.lab(7);c.fillStyle=MUTE;try{c.letterSpacing="1.5px"}catch(e){}c.fillText("NOTES",m,m+10);try{c.letterSpacing="0px"}catch(e){}c.strokeStyle="#d5d8de";c.lineWidth=.6;for(let y=m+34;y<Hp-m-6;y+=22){c.beginPath();c.moveTo(m,y);c.lineTo(m+w,y);c.stroke()}c.restore()});
  folio(in1,shortDate(wk.date));folio(in3,shortDate(wk.date),true);
  drawBack(back,wk,s,warn,rowsOn(pgs.length-1));
  return{kind:"trifold",pages:[{...cover,label:"Cover"},{...in1,label:"Inside left"},{...in2,label:ser?"Sermon":"Inside center"},{...in3,label:"Inside right"},{...flap,label:"Flap"},{...back,label:"Back"}],W:Wp,H:Hp}}

const SIDE={announce:1,events:1,prayer:1,giving:1,connect:1};
function buildPage(k,wk,warn){const ser=sermonOf(wk),Wp=612,Hp=792,m=44,cg=26,cw=(Wp-2*m-cg)/2,base=9.6*SIZES[DB.l.size],sty=DB.l.pstyle||"columns",hero=sty=="hero",HH=210,topH=hero?HH-m+22:84,foot=34,oSecs=wk.secs.filter(s=>s.on&&s!==ser),maxP=ser?3:4;
  const sbw=176,sbg=22,mainW=Wp-2*m-sbw-sbg,sbIn=sbw-28;let sb=null;
  if(sty=="sidebar"&&oSecs.length){const mSecs=oSecs.filter(s=>!SIDE[s.k]),sSecs=oSecs.filter(s=>SIDE[s.k]),y0=m+topH,hh=Hp-y0-m-foot+10;
    for(const f of [1,.95,.91,.87,.83,.8]){const X=styleOf(base*f),mr=[],sr=[];mSecs.forEach(x=>mr.push(...secRows(X,x,mainW,wk)));sSecs.forEach(x=>sr.push(...secRows(X,x,sbIn,wk)));let u1=0,u2=0;if(!flow(mr,()=>u1++?null:{h:hh},true)&&!flow(sr,()=>u2++?null:{h:hh-28},true)){sb={mr,sr,y0,hh,f};break}}}
  const colH=p=>Hp-(p==0?m+topH:m)-m-foot+10,mk=sz=>{const X=styleOf(sz);return oSecs.map(sec=>{const rows=secRows(X,sec,cw,wk);return grp(rows)}).filter(g=>g.rows.length)};
  const hsOf=n=>{const o=[];for(let p=0;p<n;p++)for(let c=0;c<2;c++)o.push(colH(p));return o};
  let nO=0,P={out:[]},probe=mk(base);
  if(sb){nO=1;P={out:[]};probe=[1]}
  else if(probe.length){let done=false;for(let n=1;n<=maxP&&!done;n++){const fs=n==1?[1,.95,.91]:n<maxP?[1,.95,.9,.86,.82]:[1,.95,.9,.86,.82,.78,.74,.7];for(const f of fs){P=packGroups(mk(base*f),hsOf(n));nO=n;if(!P.fail){done=true;break}}}
    if(!done)for(const f of [.7,.66,.62,.58]){P=packLoose(mk(base*f),hsOf(maxP),-1);nO=maxP;if(!P.fail)break}}
  const sw=Math.min(Wp-2*m,430),sx=(Wp-sw)/2,sy=probe.length?m:m+topH,sh=Hp-sy-m-foot+10;let sRows=[];
  if(ser)for(const f of [1.2,1.12,1.05,1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,sw,wk);let u=0;if(!flow(sRows,()=>u++?null:{h:sh},true))break}
  const pgs=[];for(let i=0;i<nO+1;i++){const pp=mkPage(Wp,Hp,k);if(!(hero&&i==0))decor(pp,"page");pgs.push(pp)}
  let last=-1;if(sb){last=0;const c0=pgs[0].c,px=Wp-m-sbw,ph=sb.hh;c0.save();c0.fillStyle=tint(DB.l.accent,.07);c0.beginPath();if(c0.roundRect)c0.roundRect(px,sb.y0,sbw,ph,6);else c0.rect(px,sb.y0,sbw,ph);c0.fill();c0.restore();
    const l1=flow(sb.mr,one1(c0,m,sb.y0,mainW,sb.hh));if(l1)warn.push(l1);const l2=flow(sb.sr,one1(c0,px+14,sb.y0+14,sbIn,ph-28));if(l2)warn.push(l2);
    const used=sumH(sb.sr),url=webUrl(DB.c.web);if(url&&DB.c.qr!==false&&ph-28-used>108){const q=74;qrDraw(c0,url,px+(sbw-q)/2,sb.y0+ph-14-q-12,q,INK);const XX=styleOf(10);c0.font=XX.lab(6.2);c0.fillStyle=MUTE;c0.textAlign="center";try{c0.letterSpacing="1px"}catch(e2){}c0.fillText("SCAN TO VISIT",px+sbw/2,sb.y0+ph-12);try{c0.letterSpacing="0px"}catch(e2){}c0.textAlign="left"}}
  P.out.forEach((gs,i)=>{if(!gs.length)return;const pn=Math.floor(i/2);last=Math.max(last,pn);const l=flow(gs.flatMap(g=>g.rows),one1(pgs[pn].c,m+(i%2)*(cw+cg),pn==0?m+topH:m,cw,colH(pn)));if(l)warn.push(l)});
  const nUsed=last+1,sp=pgs[nUsed];let outPg=pgs.slice(0,nUsed);if(ser){const ls=flow(sRows,one1(sp.c,sx,sy,sw,sh));if(ls)warn.push(ls);outPg.push(sp)}
  if(!outPg.length)outPg=[pgs[0]];const X=styleOf(10);if(hero)heroHeader(outPg[0].c,wk,Wp,m,HH);else pageHeader(outPg[0].c,wk,Wp,m);
  outPg.forEach((p,i)=>{p.c.font=X.body(7.8*X.f.bs);p.c.fillStyle="#7a808b";p.c.textAlign="left";p.c.fillText(fit1(churchLine(),X.body(7.8*X.f.bs),Wp-2*m-40),m,Hp-m+8);if(outPg.length>1){p.c.textAlign="right";p.c.fillText((i+1)+" / "+outPg.length,Wp-m,Hp-m+8);p.c.textAlign="left"}});
  return{kind:"page",pages:outPg.map((p,i)=>({...p,label:ser&&i==outPg.length-1&&outPg.length>1?"Sermon":outPg.length==1?"Page":i==0?"Front":i==1&&outPg.length==2?"Back":"Page "+(i+1)})),W:Wp,H:Hp}}

function buildDigital(k,wk,warn){const Wp=540,Hp=675,m=42,base=19.5*SIZES[DB.l.size],X=styleOf(base),pgs=[];
  const mk=bold=>{const p=mkPage(Wp,Hp,k,bold?DB.l.accent:"#fff");if(!bold)decor(p,"slide");pgs.push(p);return p};
  const cv=mk(true);drawCover(cv,wk,{bold:true,digital:true});
  const body=[],rh=Hp-96-70,cw=Wp-2*m;let cur=null,y=0;const newS=()=>{cur=mk(false);body.push(cur);y=0};
  wk.secs.filter(s=>s.on).forEach(sec=>{const isS=sec.k=="sermon";let rows=[],H=0;const trim=()=>{while(rows.length&&rows[rows.length-1].blank)rows.pop();H=rows.reduce((a,r)=>a+r.h,0)};
    for(const f of [1,.92,.84,.76,.7]){rows=secRows(f==1?X:styleOf(base*f),sec,cw,wk);trim();if(H<=rh)break}if(!rows.length)return;
    if(!cur||isS||(y+H>rh&&H<=rh))newS();
    rows.forEach((r,i)=>{let need=r.h,j=i;while(rows[j].keep&&rows[j+1]){j++;need+=rows[j].h}if(y+need>rh&&y>0)newS();if(y==0&&r.blank)return;const hh=r.fill?Math.max(r.h,rh-y):r.h;if(r.draw)r.draw(cur.c,m,96+y,cw,hh);y+=hh});
    y+=X.bs*.9;if(isS)cur=null});
  // closing
  const cl=mk(false);body.push(cl);{const c=cl.c;let y=96;const w=Wp-2*m;const rows=[head(X,"Join us")];timesList().forEach(t=>rows.push(...T([t.d,t.t].filter(Boolean).join("  ")+(t.n?"  ·  "+t.n:""),{font:X.body(X.bs),color:INK,size:X.bs,lh:X.bs*1.5,w})));rows.push(gap(X.bs*.6));[DB.c.addr,DB.c.phone,DB.c.email,webShow(DB.c.web)].filter(Boolean).forEach(l=>rows.push(...T(l,{font:X.body(X.bs*.95),color:MUTE,size:X.bs,lh:X.bs*1.5,w})));
    let u=0;flow(rows,()=>u++?null:{c,x:m,y:96,w,h:260});const url=webUrl(DB.c.web);if(url&&DB.c.qr!==false){qrDraw(c,url,m,Hp-m-150-30,130,INK)}}
  body.forEach((p,i)=>{const c=p.c;slideHeader(c,wk,Wp,Hp,m);c.font=styleOf(10).lab(8);c.fillStyle="#8a909b";c.textAlign="right";c.textBaseline="alphabetic";c.fillText((i+2)+" / "+(body.length+1),Wp-m,Hp-m+10);c.textAlign="left"});
  return{kind:"digital",pages:pgs.map((p,i)=>({...p,label:i==0?"Cover":i==pgs.length-1?"Closing":"Slide "+(i+1)})),W:Wp,H:Hp}}

function build(kind,k){const wk=W(),warn=[];const r=kind=="booklet"?buildBooklet(k,wk,warn):kind=="trifold"?buildTrifold(k,wk,warn):kind=="page"?buildPage(k,wk,warn):buildDigital(k,wk,warn);r.warn=warn.reduce((a,b)=>a+b,0);return r}
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

/* ---------- custom fonts: Google Fonts and uploaded files ---------- */
const GF=[["Serif",["Playfair Display","Lora","Merriweather","Cormorant Garamond","EB Garamond","Libre Baskerville","Crimson Pro","Spectral","Source Serif 4","Bitter","DM Serif Display","Fraunces","Cinzel","Abril Fatface","Newsreader","PT Serif"]],
 ["Sans serif",["Inter","Montserrat","Poppins","Lato","Open Sans","Raleway","Nunito","Work Sans","DM Sans","Manrope","Jost","Josefin Sans","Quicksand","Archivo","Rubik","Libre Franklin","Oswald","Bebas Neue"]],
 ["Script and display",["Caveat","Dancing Script","Great Vibes","Playball","Amatic SC","Lobster"]]];
GF[1][1].forEach(n=>SANS.add(n));
const STATICF=new Set(Object.values(FS).flatMap(f=>[f.d[0],f.b[0],f.l[0]]));
const cleanFam=n=>String(n||"").replace(/["'\;{}<>\n]/g,"").replace(/\s+/g," ").trim().slice(0,60);
function customSet(){const c=DB.l.cf;return{n:"Custom",d:[c.d,c.dw],b:[c.b,400],l:[c.b,600],ds:c.ds||1,bs:c.bs||1}}
function fontSet(k){return k=="custom"?customSet():FS[k]||FS.classic}
const GFL={};
function gfLoad(fam){if(GFL[fam])return GFL[fam];const q=encodeURIComponent(fam).replace(/%20/g,"+");
  const tryUrl=u=>new Promise(res=>{const l=document.createElement("link");let done=0;const fin=v=>{if(!done){done=1;if(!v)l.remove();res(v)}};l.rel="stylesheet";l.href=u;l.onload=()=>fin(true);l.onerror=()=>fin(false);document.head.appendChild(l);setTimeout(()=>fin(false),7000)});
  return GFL[fam]=(async()=>{let ok=await tryUrl("https://fonts.googleapis.com/css?family="+q+":400,500,600,700,400i,700i&display=swap");if(!ok)ok=await tryUrl("https://fonts.googleapis.com/css?family="+q+"&display=swap");if(!ok)delete GFL[fam];return ok})()}
const UPR={};
function upLoad(u){return UPR[u.n]||(UPR[u.n]=(async()=>{try{const ff=new FontFace(u.n,"url("+u.d+")");await ff.load();document.fonts.add(ff);return true}catch(e){delete UPR[u.n];return false}})())}
async function ensureCustom(){const c=DB.l.cf,fams=[c.d,c.b].filter((v,i,a)=>a.indexOf(v)==i);
  await Promise.all(fams.map(async fam=>{const u=(DB.l.up||[]).find(x=>x.n==fam);if(u)return upLoad(u);if(STATICF.has(fam))return 1;return gfLoad(fam)}))}
function saveOK(){try{localStorage.setItem(KEY,JSON.stringify(DB));return true}catch(e){return false}}
function fontOpts(cur){const up=DB.l.up||[],gf=(DB.l.gf||[]).filter(n=>!GF.some(g=>g[1].includes(n)));
  const o=(n)=>`<option value="${esc(n)}" ${n==cur?"selected":""}>${esc(n)}</option>`;
  return (up.length?`<optgroup label="Your uploaded fonts">${up.map(u=>o(u.n)).join("")}</optgroup>`:"")+(gf.length?`<optgroup label="Added from Google Fonts">${gf.map(o).join("")}</optgroup>`:"")+
    `<optgroup label="Included">${[...STATICF].filter(n=>!GF.some(g=>g[1].includes(n))).sort().map(o).join("")}</optgroup>`+GF.map(g=>`<optgroup label="${g[0]}">${g[1].map(o).join("")}</optgroup>`).join("")}
function fontEditor(){const c=DB.l.cf,up=DB.l.up||[],pv=(f,w)=>`font-family:'${esc(f)}',Georgia,serif;font-weight:${w}`;
  return `<div class="card cfe"><div class="cfp" style="${pv(c.d,c.dw)}">The Word Became Flesh</div><div class="cfp2" style="${pv(c.b,400)}">In the beginning was the Word, and the Word was with God, and the Word was God.</div>
  <div class="cfr"><label class="fl"><span>Headings</span><select data-c="l.cf.d">${fontOpts(c.d)}</select></label><label class="fl cfw"><span>Weight</span><select data-c="l.cf.dw">${[400,500,600,700].map(w=>`<option value="${w}" ${c.dw==w?"selected":""}>${w==400?"Regular":w==500?"Medium":w==600?"Semibold":"Bold"}</option>`).join("")}</select></label></div>
  <div class="cfr"><label class="fl"><span>Body text</span><select data-c="l.cf.b">${fontOpts(c.b)}</select></label></div>
  <div class="cfr2"><div><div class="hint" style="margin:0 0 4px">Heading size</div>${seg([["0.92","Smaller"],["1","Normal"],["1.1","Larger"]],c.ds||1,"cfds")}</div><div><div class="hint" style="margin:0 0 4px">Body size</div>${seg([["0.92","Smaller"],["1","Normal"],["1.08","Larger"]],c.bs||1,"cfbs")}</div></div>
  <h4 class="cfh">Add a Google Font</h4><div class="cfr add"><input id="gfin" type="text" placeholder="For example: Libre Caslon Text" autocomplete="off" spellcheck="false"><select id="gfrole" aria-label="Use for"><option value="d">Headings</option><option value="b">Body</option></select><button class="btn sm" data-a="gfadd">Add</button></div>
  <p class="hint">Type the name exactly as it appears on fonts.google.com. Needs an internet connection.</p>
  <h4 class="cfh">Upload your own font</h4><div class="cfr add"><label class="btn ghost sm file">Choose file<input type="file" accept=".ttf,.otf,.woff,.woff2" data-c="fontfile"></label><select id="uprole" aria-label="Use for"><option value="d">Headings</option><option value="b">Body</option></select></div>
  <p class="hint">TrueType, OpenType or WOFF files up to 1.5 MB. Only upload fonts you have the right to use. They stay in this browser and are never sent anywhere. For a family with several weights, upload the regular file.</p>
  ${up.length?`<div class="cfu">${up.map(u=>`<div><span style="font-family:'${esc(u.n)}',Georgia,serif">${esc(u.n)}</span><button class="btn ghost sm" data-a="rmfont" data-v="${esc(u.n)}">Remove</button></div>`).join("")}</div>`:""}</div>`}
/* ===== Designs: cover, headings and headers per template ===== */
const DESIGNS=[
 ["editorial","Editorial","Clean and modern, left aligned","classic"],
 ["traditional","Traditional","Framed cover, centered, hymnal feel","traditional"],
 ["bold","Bold","Big color block and large type","clean"],
 ["photo","Photo","Your photo behind the title","modern"],
 ["minimal","Minimal","Oversized date, lots of white","clean"],
 ["split","Side Band","Color band down the left edge","modern"],
 ["arch","Arch","Soft arched window, centered","classic"],
 ["poster","Poster","Huge type on a tinted page","modern"],
 ["cross","Cross","Large cross on a color field","traditional"],
 ["card","Journal","Tinted page with a white card","classic"]];
const HC=new Set(["traditional","arch","card"]),HB=new Set(["bold","photo","poster","cross"]);
function tint(hex,a){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=v=>Math.round(v*a+255*(1-a));return"rgb("+m(r)+","+m(g)+","+m(b)+")"}
let PHOTO={src:"",img:null};
function photoImg(){const s=DB.l.photo;if(!s)return null;if(PHOTO.src!=s){PHOTO={src:s,img:new Image()};PHOTO.img.onload=()=>{if(typeof relayout=="function"){relayout();if(typeof thumbs=="function")thumbs()}};PHOTO.img.src=s}return PHOTO.img.complete&&PHOTO.img.naturalWidth?PHOTO.img:null}
function drawPhoto(c,x,y,w,h){const im=photoImg();if(!im)return false;const r=Math.max(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*r,ih=im.naturalHeight*r;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);treat(c,x,y,w,h);c.restore();return true}
const PH=new Set(["photo","bold","cross","arch"]),PT=[["natural","Natural"],["duotone","Duotone"],["mono","Black & white"],["warm","Warm"]];
function treat(c,x,y,w,h){const t=DB.l.pt||"natural";if(t=="natural")return;const hs=hslOf(DB.l.accent);const gray=()=>{c.globalCompositeOperation="saturation";c.fillStyle="#808080";c.fillRect(x,y,w,h)};
  if(t=="mono"){gray();c.globalCompositeOperation="source-over"}
  else if(t=="duotone"){gray();c.globalCompositeOperation="multiply";c.fillStyle=hsl(hs[0],Math.min(100,hs[1]+10),Math.min(70,hs[2]+18),1);c.fillRect(x,y,w,h);c.globalCompositeOperation="screen";c.fillStyle=hsl(hs[0],hs[1],14,1);c.fillRect(x,y,w,h);c.globalCompositeOperation="source-over"}
  else if(t=="warm"){c.globalCompositeOperation="multiply";c.fillStyle="#f2dcc0";c.fillRect(x,y,w,h);c.globalCompositeOperation="soft-light";c.fillStyle="rgba(255,150,60,.35)";c.fillRect(x,y,w,h);c.globalCompositeOperation="source-over"}}
function blockFill(c,x,y,w,h,d){if(PH.has(d)&&d!="photo"&&photoImg()){drawPhoto(c,x,y,w,h);const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,"rgba(0,0,0,.25)");g.addColorStop(.5,"rgba(0,0,0,.06)");g.addColorStop(1,"rgba(0,0,0,.6)");c.fillStyle=g;c.fillRect(x,y,w,h);return true}coverArt(c,x,y,w,h,d);return false}
function coverIll(pg,d,o){const k=DB.l.ill;if(!k||k=="none")return;const c=pg.c,Wp=pg.W,Hp=pg.H,u=Wp/396,m=38*u,acc=DB.l.accent,bd=!!o.bold;
  if(d=="bold"||(d=="photo"&&!photoImg())){if(!photoImg())drawIll(c,k,Wp-m-62*u,Hp*.64*.36,78*u,"#fff",1.6*u,.4)}
  else if(d=="photo")drawIll(c,k,Wp-m-24*u,m+10*u,24*u,"#fff",1.4*u,.9);
  else if(d=="poster")drawIll(c,k,Wp-m-30*u,Hp-m-30*u,30*u,acc,1.3*u,.95);
  else if(d=="editorial"||d=="minimal"||d=="split")drawIll(c,k,Wp-m-24*u,m+22*u,24*u,bd&&d!="split"?"#fff":acc,1.3*u,.95)}
function lblW(c,txt,font,sp){c.font=font;try{c.letterSpacing=(sp||0)+"px"}catch(e){}const w=c.measureText(txt).width;try{c.letterSpacing="0px"}catch(e){}return w}
function labelC(c,txt,cx,y,font,color,sp){const w=lblW(c,txt,font,sp);c.textAlign="left";labelTxt(c,txt,cx-w/2+ (sp||0)/2,y,font,color,sp);return w}
function drawCover(pg,wk,o){o=o||{};const c=pg.c,Wp=pg.W,Hp=pg.H,u=Wp/396,X=styleOf(10),d=o.design||DB.l.design,acc=DB.l.accent,m=38*u;
  const tt=title4(wk),se=wk.secs.find(s=>s.k=="sermon"&&s.on&&(s.ref||"").trim()),p=se&&passage(se.ref);
  const subL=(se?((wk.theme||"").trim()&&se.title?se.title+"  ·  ":"")+(p?p.ref:se.ref):"")+(o.digital&&se&&se.speaker?"  ·  "+se.speaker:"");
  const dateL=longDate(wk.date),fit=(max,min,w,ml)=>{let sz=max,L;for(;sz>=min;sz-=1){L=wrapT(tt,X.disp(sz),w);if(L.length<=ml)break}return{sz,L}};
  let tb=0;const hasQ=!!coverQuote(),ill=DB.l.ill&&DB.l.ill!="none"?DB.l.ill:null;const dispT=(L,sz,x,y,col,al)=>{tb=Math.max(tb,y+(L.length-1)*sz*1.1+sz*.25);c.font=X.disp(sz);c.fillStyle=col;c.textAlign=al||"left";c.textBaseline="alphabetic";L.forEach((l,i)=>c.fillText(l,x,y+i*sz*1.1));c.textAlign="left"};
  const ital=(t,sz,x,y,col,al)=>{if(y<Hp*.88)tb=Math.max(tb,y+sz*.3);c.font=X.body(sz,400,true);c.fillStyle=col;c.textAlign=al||"left";c.textBaseline="alphabetic";c.fillText(t,x,y);c.textAlign="left"};
  const foot=(col,sub,x0)=>{const lw=drawLogo(c,x0,Hp-m-50*u,120*u,50*u,"left");const tx=x0+(lw?lw+12*u:0);c.textAlign="left";c.textBaseline="alphabetic";c.font=X.disp(15*u*X.ds);c.fillStyle=col;c.fillText(DB.c.name,tx,Hp-m-(DB.c.tag?20*u:5*u));if(DB.c.tag)ital(DB.c.tag,10.5*u*X.f.bs,tx,Hp-m-5*u,sub)};
  c.fillStyle="#fff";c.fillRect(0,0,Wp,Hp);
  if(d=="traditional"){const cx=Wp/2,fr=m*.5;c.strokeStyle=acc;c.lineWidth=1.5*u;c.strokeRect(fr,fr,Wp-2*fr,Hp-2*fr);c.lineWidth=.5*u;c.strokeRect(fr+5*u,fr+5*u,Wp-2*fr-10*u,Hp-2*fr-10*u);
    let y=m+22*u;if(ill)drawIll(c,ill,cx,y,17*u,acc,1.1*u);else{c.strokeStyle=acc;c.lineWidth=1.3*u;c.beginPath();c.moveTo(cx,y-12*u);c.lineTo(cx,y+14*u);c.moveTo(cx-8*u,y-3*u);c.lineTo(cx+8*u,y-3*u);c.stroke()}
    y+=40*u;const lw=drawLogo(c,cx-45*u,y-6*u,90*u,36*u,"left");if(lw){y+=40*u}
    labelC(c,DB.c.name.toUpperCase(),cx,y,X.lab(9*u),acc,2.2*u);y+=14*u;c.strokeStyle=RULE;c.lineWidth=.6*u;c.beginPath();c.moveTo(cx-24*u,y);c.lineTo(cx+24*u,y);c.stroke();
    labelC(c,dateL.toUpperCase(),cx,Hp*.4-60*u,X.lab(8*u),MUTE,1.6*u);
    const f=fit(34*u*X.ds,20*u,Wp-2*m-24*u,4);dispT(f.L,f.sz,cx,Hp*.4,INK,"center");if(subL)ital(subL,12*u*X.f.bs,cx,Hp*.4+f.L.length*f.sz*1.1+14*u,MUTE,"center");
    if(DB.c.tag)ital(DB.c.tag,10.5*u*X.f.bs,cx,Hp-m-14*u,MUTE,"center");
    c.strokeStyle=acc;c.lineWidth=.8*u;c.beginPath();c.moveTo(cx-30*u,Hp-m-34*u);c.lineTo(cx+30*u,Hp-m-34*u);c.stroke()}
  else if(d=="bold"||(d=="photo"&&!photoImg())){const bh=Hp*.64;blockFill(c,0,0,Wp,bh,d);
    labelTxt(c,dateL.toUpperCase(),m,m+8*u,X.lab(8.5*u),"rgba(255,255,255,.82)",1.8*u);
    const f=fit(44*u*X.ds,24*u,Wp-2*m,5);dispT(f.L,f.sz,m,bh-m-(f.L.length-1)*f.sz*1.1,"#fff");
    if(subL)ital(subL,12*u*X.f.bs,m,bh+30*u,INK);foot(INK,MUTE,m)}
  else if(d=="photo"){drawPhoto(c,0,0,Wp,Hp);const g=c.createLinearGradient(0,0,0,Hp);g.addColorStop(0,"rgba(0,0,0,.35)");g.addColorStop(.45,"rgba(0,0,0,.12)");g.addColorStop(1,"rgba(0,0,0,.82)");c.fillStyle=g;c.fillRect(0,0,Wp,Hp);
    labelTxt(c,dateL.toUpperCase(),m,m+8*u,X.lab(8.5*u),"rgba(255,255,255,.9)",1.8*u);
    const f=fit(42*u*X.ds,24*u,Wp-2*m,4),by=Hp-m-62*u;dispT(f.L,f.sz,m,by-(f.L.length-1)*f.sz*1.1-(subL?36*u:0),"#fff");if(subL)ital(subL,12*u*X.f.bs,m,by-8*u,"rgba(255,255,255,.88)");
    c.fillStyle="rgba(255,255,255,.5)";c.fillRect(m,Hp-m-44*u,Wp-2*m,.6*u);const lw=drawLogo(c,m,Hp-m-36*u,90*u,34*u,"left");c.font=X.disp(14*u*X.ds);c.fillStyle="#fff";c.textAlign="left";c.fillText(DB.c.name,m+(lw?lw+10*u:0),Hp-m-10*u)}
  else if(d=="minimal"){const day=String(new Date(wk.date+"T12:00:00").getDate()),mon=new Date(wk.date+"T12:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"}),wd=new Date(wk.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long"});
    if(o.bold)coverArt(c,0,0,Wp,Hp,d);const ink=o.bold?"#fff":INK,mu=o.bold?"rgba(255,255,255,.78)":MUTE,ac=o.bold?"#fff":acc;
    c.font=X.disp(150*u*X.ds);c.fillStyle=ac;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(day,m-4*u,m+118*u*X.ds);const dw=c.measureText(day).width;
    labelTxt(c,wd.toUpperCase(),m+dw+14*u,m+62*u,X.lab(8.5*u),mu,1.8*u);labelTxt(c,mon.toUpperCase(),m+dw+14*u,m+78*u,X.lab(8.5*u),mu,1.8*u);
    c.fillStyle=mu;c.globalAlpha=.4;c.fillRect(m,Hp*.5-18*u,Wp-2*m,.6*u);c.globalAlpha=1;
    const f=fit(26*u*X.ds,18*u,Wp-2*m,4);dispT(f.L,f.sz,m,Hp*.5+22*u,ink);if(subL)ital(subL,11.5*u*X.f.bs,m,Hp*.5+22*u+f.L.length*f.sz*1.1+6*u,mu);foot(ink,mu,m)}
  else if(d=="split"){const sw=58*u,x0=sw+34*u;coverArt(c,0,0,sw,Hp,d);c.save();c.translate(sw/2+3*u,Hp-m);c.rotate(-Math.PI/2);labelTxt(c,dateL.toUpperCase(),0,0,X.lab(8.5*u),"#fff",2*u);c.restore();
    const f=fit(38*u*X.ds,22*u,Wp-x0-m,5),ty=Hp*.36;dispT(f.L,f.sz,x0,ty,INK);c.fillStyle=acc;c.fillRect(x0,ty-f.sz-16*u,34*u,3*u);if(subL)ital(subL,12*u*X.f.bs,x0,ty+f.L.length*f.sz*1.1+10*u,MUTE);foot(INK,MUTE,x0)}
  else if(d=="arch"){const cx=Wp/2,aw=Wp-2*m*1.25,ax=cx-aw/2,ay=m*1.1,ah=Hp*(hasQ?.42:.5),r=aw/2;c.save();c.beginPath();c.moveTo(ax,ay+ah);c.lineTo(ax,ay+r);c.arc(cx,ay+r,r,Math.PI,0);c.lineTo(ax+aw,ay+ah);c.closePath();c.clip();
    if(!drawPhoto(c,ax,ay,aw,ah)){coverArt(c,ax,ay,aw,ah,d);c.fillStyle="rgba(255,255,255,.1)";c.beginPath();c.arc(cx,ay+r,r*.62,Math.PI,0);c.lineTo(cx+r*.62,ay+ah);c.lineTo(cx-r*.62,ay+ah);c.closePath();c.fill()}c.restore();if(ill&&!photoImg())drawIll(c,ill,cx,ay+ah*.66,aw*.24,"#fff",1.6*u,.92);
    labelC(c,dateL.toUpperCase(),cx,ay+ah+26*u,X.lab(8*u),MUTE,1.8*u);const f=fit(30*u*X.ds,19*u,Wp-2*m,3);dispT(f.L,f.sz,cx,ay+ah+26*u+14*u+f.sz*.8,INK,"center");
    if(subL)ital(subL,11.5*u*X.f.bs,cx,ay+ah+26*u+14*u+f.sz*.8+f.L.length*f.sz*1.1+2*u,MUTE,"center");labelC(c,DB.c.name.toUpperCase(),cx,Hp-m-2*u,X.lab(8*u),acc,2*u)}
  else if(d=="poster"){coverArt(c,0,0,Wp,Hp,d,{light:true});labelTxt(c,dateL.toUpperCase(),m,m+6*u,X.lab(8.5*u),acc,1.8*u);
    const T=tt.toUpperCase();let sz=72*u*X.ds,L;for(;sz>=26*u;sz-=2){L=wrapT(T,X.disp(sz),Wp-2*m);if(L.length<=4&&L.every(l=>mw(l,X.disp(sz))<=Wp-2*m)&&m+34*u+sz*.85+(L.length-1)*sz*1.1+60*u<Hp-m-72*u)break}
    dispT(L,sz,m,m+34*u+sz*.85,INK);const ey=m+34*u+sz*.85+(L.length-1)*sz*1.1+22*u;c.fillStyle=acc;c.fillRect(m,ey,60*u,5*u);if(subL)ital(subL,12.5*u*X.f.bs,m,ey+30*u,INK);foot(INK,MUTE,m)}
  else if(d=="cross"){const cx=Wp/2,bh=Hp*(hasQ?.45:.54);blockFill(c,0,0,Wp,bh,d);c.fillStyle="#fff";const cw=6.5*u,vh=150*u,vy=bh/2-vh/2-6*u;if(ill)drawIll(c,ill,cx,bh/2,Math.min(70*u,bh*.3),"#fff",1.7*u);else{c.fillRect(cx-cw/2,vy,cw,vh);c.fillRect(cx-46*u,vy+44*u,92*u,cw);
    c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=.8*u;c.beginPath();c.arc(cx,vy+44*u+cw/2,64*u,0,6.29);c.stroke()}
    labelC(c,dateL.toUpperCase(),cx,bh+34*u,X.lab(8*u),MUTE,1.8*u);const f=fit(32*u*X.ds,20*u,Wp-2*m,3);dispT(f.L,f.sz,cx,bh+34*u+14*u+f.sz*.8,INK,"center");
    if(subL)ital(subL,11.5*u*X.f.bs,cx,bh+34*u+14*u+f.sz*.8+f.L.length*f.sz*1.1+2*u,MUTE,"center");labelC(c,DB.c.name.toUpperCase(),cx,Hp-m-2*u,X.lab(8*u),acc,2*u)}
  else if(d=="card"){coverArt(c,0,0,Wp,Hp,d,{light:true});const cx=Wp/2,p=m*.5,cw=Wp-2*p,ch=Hp-2*p;c.save();c.shadowColor="rgba(0,0,0,.12)";c.shadowBlur=16*u;c.shadowOffsetY=4*u;c.fillStyle="#fff";c.fillRect(p,p,cw,ch);c.restore();c.strokeStyle=acc;c.lineWidth=.7*u;c.strokeRect(p+8*u,p+8*u,cw-16*u,ch-16*u);
    let y=p+60*u;const lw=drawLogo(c,cx-40*u,y-28*u,80*u,40*u,"left");if(lw)y+=26*u;else if(ill)drawIll(c,ill,cx,p+34*u,15*u,acc,1*u);labelC(c,DB.c.name.toUpperCase(),cx,y,X.lab(8.5*u),acc,2*u);
    const cy=ch*(hasQ?.34:.42)+p*.5;labelC(c,dateL.toUpperCase(),cx,cy,X.lab(8*u),MUTE,1.6*u);const f=fit(32*u*X.ds,20*u,cw-60*u,4);dispT(f.L,f.sz,cx,cy+36*u,INK,"center");
    const sy=cy+36*u+f.L.length*f.sz*1.1+6*u;c.fillStyle=acc;c.beginPath();c.arc(cx,sy+4*u,2.2*u,0,6.3);c.fill();if(subL)ital(subL,11.5*u*X.f.bs,cx,sy+26*u,MUTE,"center");if(DB.c.tag)ital(DB.c.tag,10.5*u*X.f.bs,cx,Hp-p-26*u,MUTE,"center")}
  else{const bold=o.bold,ink=bold?"#fff":INK,sub=bold?"rgba(255,255,255,.78)":MUTE;if(bold)coverArt(c,0,0,Wp,Hp,d);
    c.fillStyle=bold?"#fff":acc;c.fillRect(m,m,34*u,3*u);labelTxt(c,dateL.toUpperCase(),m,m+26*u,X.lab(8.5*u),sub,1.6*u);
    const f=fit(36*u*X.ds,22*u,Wp-2*m,4),ty=Hp*.34;dispT(f.L,f.sz,m,ty,ink);if(subL)ital(subL,12*u*X.f.bs,m,ty+f.L.length*f.sz*1.1+10*u,sub);foot(ink,sub,m)};coverIll(pg,d,o);pg.tb=tb;coverVerse(pg,d,o.digital,!!o.bold)}
/* section headings */
function head(X,txt,al){if(al=="right"||(al=="center"&&X.design!="traditional"&&X.design!="arch"))return headA(X,txt,al);return headBase(X,txt)}
function headA(X,txt,al){const sz=X.s,d=X.design,ctr=al=="center",place=(wd,w)=>ctr?(w-wd)/2:w-wd;
  if(d=="bold")return{h:sz*3.1,keep:true,draw(c,x,y,w){const t=txt.toUpperCase(),f=X.lab(sz*.7),wd=lblW(c,t,f,1.3)+14,hh=sz*1.45,yy=y+sz*1.0,px=x+place(wd,w);c.fillStyle=X.acc;c.beginPath();if(c.roundRect)c.roundRect(px,yy,wd,hh,3);else c.rect(px,yy,wd,hh);c.fill();labelTxt(c,t,px+7,yy+hh*.7,f,"#fff",1.3)}};
  if(d=="minimal"||d=="poster"||d=="card"){const po=d=="poster",cd=d=="card";return{h:sz*(po?3.2:3),keep:true,draw(c,x,y,w){const t=po?txt.toUpperCase():txt;c.font=cd?X.body(sz*1.2,400,true):X.disp(sz*(po?1.3:1.25)*X.ds);const wd=c.measureText(t).width,px=x+place(wd,w);c.fillStyle=cd?X.acc:INK;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(t,px,y+sz*2.0);
    if(po){c.fillStyle=X.acc;c.fillRect(x,y+sz*2.3,w,2.2)}else if(cd){c.strokeStyle=RULE;c.lineWidth=.6;c.beginPath();c.moveTo(x,y+sz*2.35);c.lineTo(x+w,y+sz*2.35);c.stroke()}else{c.fillStyle=X.acc;c.fillRect(px+(ctr?wd/2-11:wd-22),y+sz*2.35,22,1.8)}}}}
  return{h:sz*3.1,keep:true,draw(c,x,y,w){const t=txt.toUpperCase(),f=X.lab(sz*.72),wd=lblW(c,t,f,1.4),px=x+place(wd,w),bl=y+sz*2.05;labelTxt(c,t,px,bl,f,X.acc,1.4);c.strokeStyle=RULE;c.lineWidth=.6;const yy=bl-sz*.28;c.beginPath();c.moveTo(x,yy);c.lineTo(px-(ctr?9:8),yy);if(ctr){c.moveTo(px+wd+9,yy);c.lineTo(x+w,yy)}c.stroke()}}}
function headBase(X,txt){const sz=X.s,d=X.design;
  if(d=="traditional")return{h:sz*3.1,keep:true,draw(c,x,y,w){const bl=y+sz*2.05,t=txt.toUpperCase(),wd=lblW(c,t,X.lab(sz*.72),1.6),cx=x+w/2;labelTxt(c,t,cx-wd/2,bl,X.lab(sz*.72),X.acc,1.6);
    c.strokeStyle=RULE;c.lineWidth=.6;const yy=bl-sz*.28;c.beginPath();c.moveTo(x,yy);c.lineTo(cx-wd/2-9,yy);c.moveTo(cx+wd/2+9,yy);c.lineTo(x+w,yy);c.stroke()}};
  if(d=="bold")return{h:sz*3.1,keep:true,draw(c,x,y,w){const t=txt.toUpperCase(),f=X.lab(sz*.7),wd=lblW(c,t,f,1.3)+14,hh=sz*1.45,yy=y+sz*1.0;c.fillStyle=X.acc;c.beginPath();if(c.roundRect)c.roundRect(x,yy,wd,hh,3);else c.rect(x,yy,wd,hh);c.fill();labelTxt(c,t,x+7,yy+hh*.7,f,"#fff",1.3)}};
  if(d=="minimal")return{h:sz*3.0,keep:true,draw(c,x,y,w){c.font=X.disp(sz*1.25*X.ds);c.fillStyle=INK;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(txt,x,y+sz*2.0);c.fillStyle=X.acc;c.fillRect(x,y+sz*2.35,22,1.8)}};
  if(d=="split")return{h:sz*3.1,keep:true,draw(c,x,y,w){c.fillStyle=X.acc;c.fillRect(x,y+sz*.95,3,sz*1.3);labelTxt(c,txt.toUpperCase(),x+9,y+sz*2.0,X.lab(sz*.78),INK,1.3)}};
  if(d=="arch")return{h:sz*3.1,keep:true,draw(c,x,y,w){const t=txt.toUpperCase(),f=X.lab(sz*.72),wd=lblW(c,t,f,1.6),cx=x+w/2,bl=y+sz*2.05;labelTxt(c,t,cx-wd/2,bl,f,X.acc,1.6);c.fillStyle=X.acc;[-1,1].forEach(sg=>{const px=cx+sg*(wd/2+11),py=bl-sz*.28;c.beginPath();c.moveTo(px,py-2.6);c.lineTo(px+2.6,py);c.lineTo(px,py+2.6);c.lineTo(px-2.6,py);c.fill()})}};
  if(d=="poster")return{h:sz*3.2,keep:true,draw(c,x,y,w){c.font=X.disp(sz*1.3*X.ds);c.fillStyle=INK;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(txt.toUpperCase(),x,y+sz*2.0);c.fillStyle=X.acc;c.fillRect(x,y+sz*2.3,w,2.2)}};
  if(d=="cross")return{h:sz*3.1,keep:true,draw(c,x,y,w){c.fillStyle=X.acc;const px=x+5,py=y+sz*1.1;c.fillRect(px-1,py,2,sz*1.35);c.fillRect(px-4,py+sz*.4,8,2);labelTxt(c,txt.toUpperCase(),x+17,y+sz*2.0,X.lab(sz*.74),INK,1.5)}};
  if(d=="card")return{h:sz*3.1,keep:true,draw(c,x,y,w){c.font=X.body(sz*1.2,400,true);c.fillStyle=X.acc;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(txt,x,y+sz*2.0);c.strokeStyle=RULE;c.lineWidth=.6;c.beginPath();c.moveTo(x,y+sz*2.35);c.lineTo(x+w,y+sz*2.35);c.stroke()}};
  return{h:sz*3.1,keep:true,draw(c,x,y,w){const bl=y+sz*2.05,t=txt.toUpperCase(),wd=labelTxt(c,t,x,bl,X.lab(sz*.72),X.acc,1.4);c.strokeStyle=RULE;c.lineWidth=.6;c.beginPath();c.moveTo(x+wd+8,bl-sz*.28);c.lineTo(x+w,bl-sz*.28);c.stroke()}}}
/* letter-page masthead */
function pageHeader(c,wk,Wp,m){const X=styleOf(10),d=DB.l.design,acc=DB.l.accent,th=(wk.theme||"").trim(),dl=longDate(wk.date);c.textBaseline="alphabetic";
  if(HC.has(d)){const cx=Wp/2,lw=drawLogo(c,cx-30,m-12,60,28,"left");c.textAlign="center";c.fillStyle=INK;c.font=X.disp(22*X.ds);c.fillText(DB.c.name,cx,m+(lw?28:14));labelC(c,dl.toUpperCase(),cx,m+(lw?42:30),X.lab(7.6),MUTE,1.4);if(th){c.textAlign="center";c.font=X.body(11*X.f.bs,400,true);c.fillStyle=acc;c.fillText(th,cx,m+(lw?56:46))}
    c.fillStyle=acc;c.fillRect(m,m+62,Wp-2*m,1.6);c.fillRect(m,m+66,Wp-2*m,.5);c.textAlign="left";return}
  if(HB.has(d)){const bh=m+66;c.fillStyle=acc;c.fillRect(0,0,Wp,bh);if(d=="photo"&&photoImg()){drawPhoto(c,0,0,Wp,bh);c.fillStyle="rgba(0,0,0,.45)";c.fillRect(0,0,Wp,bh)}
    const lw=drawLogo(c,m,m-8,80,40,"left"),tx=m+(lw?lw+12:0);c.textAlign="left";c.fillStyle="#fff";c.font=X.disp(22*X.ds);c.fillText(DB.c.name,tx,m+14);labelTxt(c,dl.toUpperCase(),tx,m+32,X.lab(7.6),"rgba(255,255,255,.85)",1.4);if(th){c.font=X.body(11*X.f.bs,400,true);c.fillStyle="#fff";c.fillText(th,tx,m+50)}return}
  if(d=="minimal"){const day=String(new Date(wk.date+"T12:00:00").getDate());c.textAlign="left";c.font=X.disp(58*X.ds);c.fillStyle=acc;c.fillText(day,m-2,m+44);const dw=c.measureText(day).width;c.fillStyle=INK;c.font=X.disp(15*X.ds);c.fillText(DB.c.name,m+dw+14,m+20);
    labelTxt(c,dl.toUpperCase(),m+dw+14,m+36,X.lab(7.4),MUTE,1.4);if(th){c.font=X.body(10.5*X.f.bs,400,true);c.fillStyle=acc;c.fillText(th,m+dw+14,m+50)}c.fillStyle=RULE;c.fillRect(m,m+62,Wp-2*m,.7);return}
  const lw=drawLogo(c,m,m-4,90,44,"left"),tx=m+(lw?lw+12:0);c.textAlign="left";c.fillStyle=INK;c.font=X.disp(20*X.ds);c.fillText(DB.c.name,tx,m+14);labelTxt(c,dl.toUpperCase(),tx,m+32,X.lab(7.6),MUTE,1.4);
  if(th){c.font=X.body(11*X.f.bs,400,true);c.fillStyle=acc;c.fillText(th,tx,m+48)}c.fillStyle=acc;c.fillRect(m,m+60,Wp-2*m,1.6);if(d=="split")c.fillRect(m-16,m-6,3.6,58)}
/* letter-page hero banner */
function heroHeader(c,wk,Wp,m,H){const X=styleOf(10),acc=DB.l.accent,u=Wp/396,se=wk.secs.find(s=>s.k=="sermon"&&s.on&&(s.ref||"").trim()),p=se&&passage(se.ref);
  if(photoImg()){drawPhoto(c,0,0,Wp,H);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(0,0,0,.3)");g.addColorStop(1,"rgba(0,0,0,.7)");c.fillStyle=g;c.fillRect(0,0,Wp,H)}else coverArt(c,0,0,Wp,H,"bold");
  const lw=drawLogo(c,m,m-10,70,34,"left"),tx=m+(lw?lw+10:0);c.textAlign="left";c.textBaseline="alphabetic";c.fillStyle="#fff";c.font=X.disp(15*X.ds);c.fillText(DB.c.name,tx,m+8);labelTxt(c,longDate(wk.date).toUpperCase(),tx,m+22,X.lab(7.4),"rgba(255,255,255,.85)",1.5);
  const tt=title4(wk),w=Wp-2*m-(DB.l.ill&&DB.l.ill!="none"?110:0);let sz=44*X.ds,L;for(;sz>=24;sz-=2){L=wrapT(tt,X.disp(sz),w);if(L.length<=2)break}
  const sub=se?[p?p.ref:se.ref,se.speaker].filter(Boolean).join("  ·  "):"",by=H-m+6-(sub?24:0)-(L.length-1)*sz*1.1;c.font=X.disp(sz);c.fillStyle="#fff";L.forEach((l,i)=>c.fillText(l,m,by+i*sz*1.1));
  if(sub){c.font=X.body(11.5*X.f.bs,400,true);c.fillStyle="rgba(255,255,255,.9)";c.fillText(sub,m,H-m+6)}
  if(DB.l.ill&&DB.l.ill!="none")drawIll(c,DB.l.ill,Wp-m-42,H*.5,44,"#fff",1.5,.45)}

/* digital slide header */
function slideHeader(c,wk,Wp,Hp,m){const X=styleOf(10),d=DB.l.design,acc=DB.l.accent,nm=DB.c.name.toUpperCase(),dt=shortDate(wk.date).toUpperCase();c.textBaseline="alphabetic";
  if(HC.has(d)){labelC(c,nm,Wp/2,46,X.lab(8.4),acc,1.8);c.strokeStyle=acc;c.lineWidth=.9;c.beginPath();c.moveTo(m,60);c.lineTo(Wp-m,60);c.stroke();c.lineWidth=.4;c.beginPath();c.moveTo(m,63.5);c.lineTo(Wp-m,63.5);c.stroke();return}
  if(HB.has(d)){c.fillStyle=acc;c.fillRect(0,0,Wp,16);labelTxt(c,nm,m,50,X.lab(8.4),acc,1.6);c.textAlign="right";c.font=X.lab(8.4);c.fillStyle=MUTE;try{c.letterSpacing="1px"}catch(e){}c.fillText(dt,Wp-m,50);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left";return}
  if(d=="minimal"){labelTxt(c,dt,m,50,X.lab(8.4),acc,1.6);c.textAlign="right";c.font=X.lab(8.4);c.fillStyle=MUTE;try{c.letterSpacing="1px"}catch(e){}c.fillText(nm,Wp-m,50);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left";return}
  labelTxt(c,nm,m,48,X.lab(8.4),acc,1.6);c.font=X.lab(8.4);c.fillStyle=MUTE;c.textAlign="right";try{c.letterSpacing="1px"}catch(e){}c.fillText(dt,Wp-m,48);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left";c.strokeStyle=RULE;c.lineWidth=.7;c.beginPath();c.moveTo(m,60);c.lineTo(Wp-m,60);c.stroke()}

/* ---------- page decoration (drawn first, behind text) ---------- */
function decor(pg,role){const c=pg.c,Wp=pg.W,Hp=pg.H,d=DB.l.design,acc=DB.l.accent,u=Wp/396,cx=Wp/2;
  if(d=="editorial"){c.fillStyle=acc;c.fillRect(34*u,16*u,26*u,2.4*u)}
  else if(d=="traditional"){const fr=13*u;c.strokeStyle=acc;c.lineWidth=1.1*u;c.strokeRect(fr,fr,Wp-2*fr,Hp-2*fr);c.lineWidth=.4*u;c.strokeRect(fr+4*u,fr+4*u,Wp-2*fr-8*u,Hp-2*fr-8*u)}
  else if(d=="bold"){c.fillStyle=acc;c.fillRect(0,0,Wp,9*u)}
  else if(d=="photo"){const h=22*u;if(drawPhoto(c,0,0,Wp,h)){c.fillStyle="rgba(0,0,0,.22)";c.fillRect(0,0,Wp,h)}else{c.fillStyle=acc;c.fillRect(0,0,Wp,h*.4)}}
  else if(d=="split"){c.fillStyle=acc;c.fillRect(0,0,10*u,Hp)}
  else if(d=="arch"){c.strokeStyle=acc;c.lineWidth=1.1*u;c.beginPath();c.moveTo(cx-6*u,27*u);c.lineTo(cx-6*u,19*u);c.arc(cx,19*u,6*u,Math.PI,0);c.lineTo(cx+6*u,27*u);c.stroke()}
  else if(d=="poster"){c.fillStyle=tint(acc,.12);c.fillRect(0,0,Wp,Hp)}
  else if(d=="cross"){c.fillStyle=acc;c.fillRect(cx-.9*u,13*u,1.8*u,15*u);c.fillRect(cx-4.5*u,17.5*u,9*u,1.8*u)}
  else if(d=="card"){c.fillStyle=tint(acc,.1);c.fillRect(0,0,Wp,Hp);const p=15*u;c.save();c.shadowColor="rgba(0,0,0,.1)";c.shadowBlur=12*u;c.shadowOffsetY=3*u;c.fillStyle="#fff";c.fillRect(p,p,Wp-2*p,Hp-2*p);c.restore();c.strokeStyle=acc;c.lineWidth=.6*u;c.strokeRect(p+6*u,p+6*u,Wp-2*p-12*u,Hp-2*p-12*u)}}
/* verse on the cover */
function coverQuote(){const se=W().secs.find(s=>s.k=="sermon"&&s.on);if(!se||se.cv===false)return null;let t=(se.cvt||"").trim();if(t)return{t:t,ref:""};
  const p=passage(se.ref);if(!p||!p.verses.length)return null;const v=p.verses[0];t=v[1];if(t.length>150){t=t.slice(0,150);t=t.slice(0,t.lastIndexOf(" "))+"…"}return{t:"“"+t.replace(/^“/,"")+(t.endsWith("…")?"":""),ref:p.ref.split("–")[0]}}
function drawQuote(c,X,q,x,y,w,al,col,sz,max,refcol){let L=wrapT(q.t,X.body(sz,400,true),w);if(L.length>max){L=L.slice(0,max);L[max-1]=L[max-1].replace(/[,;:.\s]+$/,"")+"…"}
  c.font=X.body(sz,400,true);c.fillStyle=col;c.textAlign=al;c.textBaseline="alphabetic";const lh=sz*1.4;L.forEach((l,i)=>c.fillText(l,x,y+i*lh));
  if(q.ref){const ry=y+L.length*lh+sz*.5;c.textAlign="left";const f=X.lab(sz*.62),wd=lblW(c,q.ref.toUpperCase(),f,1.4);labelTxt(c,q.ref.toUpperCase(),al=="center"?x-wd/2:x,ry,f,refcol||col,1.4)}c.textAlign="left"}
function coverVerse(pg,d,digital,bold){const q=coverQuote();if(!q)return;const c=pg.c,Wp=pg.W,Hp=pg.H,u=Wp/396,X=styleOf(10),m=38*u,cx=Wp/2,sz=11.5*u*X.f.bs,fy=digital?.0:0;
  const P={editorial:[m,Hp*.62,Wp-2*m,"left",MUTE,4,0],minimal:[m,Hp*.67,Wp-2*m,"left",MUTE,4,0],split:[58*u+34*u,Hp*.64,Wp-58*u-34*u-m,"left",MUTE,4,0],bold:[m,Hp*.64+64*u,Wp-2*m,"left",MUTE,3,0],
    traditional:[cx,Hp*.62,Wp-2*m-40*u,"center",MUTE,4,0],arch:[cx,Hp*.77,Wp-2*m-50*u,"center",MUTE,3,0],cross:[cx,Hp*.77,Wp-2*m-40*u,"center",MUTE,3,0],card:[cx,Hp*.66,Wp-2*m-50*u,"center",MUTE,4,0]}[d];if(!P)return;
  const dark=bold&&(d=="editorial"||d=="minimal"),pp=m*.75,lg=DB.c.logo?56*u:40*u;
  const lim={traditional:Hp-m-52*u,arch:Hp-m-26*u,cross:Hp-m-26*u,card:Hp-pp-26*u-20*u}[d]||Hp-m-lg;
  const y=Math.max(P[1],(pg.tb||0)+sz*1.9),n=Math.min(P[5],Math.floor((lim-y-sz*1.4)/(sz*1.4)));if(n<2)return;
  drawQuote(c,X,q,P[0],y,P[2],P[3],dark?"rgba(255,255,255,.8)":P[4],sz,n,dark?"#fff":DB.l.accent)}
/* ===== Orderly: interface, export ===== */
if(!DESIGNS.some(d=>d[0]==DB.l.design))DB.l.design="editorial";
const S={tab:"week",open:{},ov:null,cpt:null,del:false,busy:""};
const A={},I={},C={};
const getP=(path,root)=>{const p=path.split(".");let o=p[0]=="c"?DB.c:p[0]=="l"?DB.l:W();for(let i=1;i<p.length;i++){if(o==null)return;o=o[p[i]]}return o};
const setP=(path,v)=>{const p=path.split(".");let o=p[0]=="c"?DB.c:p[0]=="l"?DB.l:W();for(let i=1;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=v};
const secById=id=>W().secs.find(s=>s.id==id);
let toastT;function toast(m,ms){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}t.textContent=m;t.className="show";clearTimeout(toastT);toastT=setTimeout(()=>t.className="",ms||2400)}
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();

/* ---------- editor fragments ---------- */
const fld=(label,path,o)=>{o=o||{};const v=getP(path);const id="f_"+path.replace(/\W/g,"_");
  return `<label class="fl" for="${id}"><span>${label}</span>${o.area?`<textarea id="${id}" data-i="${path}" rows="${o.rows||3}" placeholder="${esc(o.ph||"")}">${esc(v)}</textarea>`:`<input id="${id}" data-i="${path}" type="${o.type||"text"}" value="${esc(v)}" placeholder="${esc(o.ph||"")}" autocomplete="off">`}</label>`};
const seg=(items,cur,act)=>`<div class="seg">${items.map(([v,l])=>`<button class="${v==cur?"on":""}" data-a="${act}" data-v="${v}">${l}</button>`).join("")}</div>`;
function listEd(path,cols,addLbl,newItem){const arr=getP(path)||[];
  return `<div class="items">${arr.map((it,i)=>`<div class="it">${cols.map(c=>`<input data-i="${path}.${i}.${c[0]}" value="${esc(it[c[0]])}" placeholder="${esc(c[1])}" aria-label="${esc(c[1])}" class="${c[2]||""}">`).join("")}<button class="x" data-a="deli" data-v="${path}.${i}" aria-label="Remove">×</button></div>`).join("")}</div><button class="add" data-a="addi" data-v="${path}">+ ${addLbl}</button>`}
function secSummary(s){if(s.k=="order")return s.items.filter(i=>i.l).length+" items";if(s.k=="sermon")return s.title||s.ref||"Not set";if(s.k=="announce"||s.k=="events")return s.items.length+" items";
  const t=(s.text||"").trim();return t?t.slice(0,48)+(t.length>48?"…":""):"Empty"}
const ALS=[["","Same as bulletin"],["left","Left"],["center","Centered"],["right","Right"],["justify","Justified"]],alSel=(p,s)=>`<label class="fl"><span>Text alignment</span><select data-c="${p}.al">${ALS.map(a=>`<option value="${a[0]}" ${(s.al||"")==a[0]?"selected":""}>${a[1]}</option>`).join("")}</select></label>`;
function secEditor(s,i,n){const p="w.secs."+i,op=S.open[s.id];let b="";
  if(op){
    if(s.k=="welcome"||s.k=="giving"||s.k=="connect")b=fld("Text",p+".text",{area:1,rows:4});
    else if(s.k=="custom")b=fld("Heading",p+".h")+fld("Text",p+".text",{area:1,rows:4});
    else if(s.k=="prayer")b=fld("One request per line",p+".text",{area:1,rows:5});
    else if(s.k=="order")b=listEd(p+".items",[["l","Item"],["n","Note, like a hymn or reader","sm"]],"Add item");
    else if(s.k=="announce")b=`<div class="items">${s.items.map((it,j)=>`<div class="it col"><input data-i="${p}.items.${j}.h" value="${esc(it.h)}" placeholder="Headline"><textarea data-i="${p}.items.${j}.b" rows="2" placeholder="Details">${esc(it.b)}</textarea><button class="x" data-a="deli" data-v="${p}.items.${j}" aria-label="Remove">×</button></div>`).join("")}</div><button class="add" data-a="addi" data-v="${p}.items">+ Add announcement</button>`;
    else if(s.k=="events")b=`<div class="items">${s.items.map((it,j)=>`<div class="it col"><div class="two"><input data-i="${p}.items.${j}.d" value="${esc(it.d)}" placeholder="Date, like Sat, Nov 15"><input data-i="${p}.items.${j}.h" value="${esc(it.h)}" placeholder="Event"></div><input data-i="${p}.items.${j}.b" value="${esc(it.b)}" placeholder="Time and place"><button class="x" data-a="deli" data-v="${p}.items.${j}" aria-label="Remove">×</button></div>`).join("")}</div><button class="add" data-a="addi" data-v="${p}.items">+ Add event</button><details class="pst"><summary>Paste a list of events</summary><textarea id="evpaste" rows="4" placeholder="One per line: Date - Event - Time and place\nSat, Nov 15 - Men’s breakfast - 8:00 AM, fellowship hall"></textarea><button class="add" data-a="pasteev" data-v="${p}.items">Add these events</button></details>`;
    else if(s.k=="sermon"){const ps=(s.ref||"").trim()?passage(s.ref):null;b=fld("Title",p+".title")+`<div class="two">${fld("Speaker",p+".speaker")}${fld("Series",p+".series")}</div>`+fld("Passage",p+".ref",{ph:"John 1:1-14"})+
      `<p class="hint" id="pstat">${(s.ref||"").trim()?(ps?`${esc(ps.ref)} · ${ps.verses.length} verse${ps.verses.length>1?"s":""}${ps.cut?" (first 40 shown)":""}`:"Reference not found. Try “John 3:16-21” or “Psalm 23”."):"Type a reference to insert the Berean Standard Bible text."}</p>`+
      `<div class="opt"><label class="chk"><input type="checkbox" data-c="${p}.cv" ${s.cv!==false?"checked":""}> Show a verse on the cover</label></div>${s.cv!==false?fld("Cover verse (optional)",p+".cvt",{area:1,rows:2,ph:"Leave blank to use the first verse of the passage"}):""}<div class="opt"><label class="chk"><input type="checkbox" data-c="${p}.showText" ${s.showText?"checked":""}> Print the passage text</label><label class="inl">Note lines<select data-c="${p}.lines" aria-label="Note lines">${[0,3,4,6,8,10,12,15,20,-1].map(n=>`<option value="${n}" ${s.lines==n?"selected":""}>${n==0?"None":n<0?"Fill the page":n}</option>`).join("")}</select></label></div>`}
    if(s.k!="events")b+=alSel(p,s);
  }
  return `<section class="sec ${s.on?"":"off"}"><header><button class="tg" data-a="opn" data-v="${s.id}" aria-expanded="${op?"true":"false"}"><b>${s.k=="custom"&&s.h?esc(s.h):SECN[s.k]}</b><small>${esc(secSummary(s))}</small></button><span class="ctl"><button data-a="mv" data-v="${i},-1" ${i==0?"disabled":""} aria-label="Move up">↑</button><button data-a="mv" data-v="${i},1" ${i==n-1?"disabled":""} aria-label="Move down">↓</button><button class="sw ${s.on?"on":""}" data-a="tgl" data-v="${s.id}" role="switch" aria-checked="${s.on}" aria-label="Include in bulletin"><i></i></button></span></header>${op?`<div class="bd">${b}${s.k=="custom"?`<button class="add dng" data-a="delsec" data-v="${s.id}">Remove this section</button>`:""}</div>`:""}</section>`}
const wlabel=w=>shortDate(w.date)+(w.theme?" · "+w.theme:"");
function weekTab(){const w=W(),n=w.secs.length;
  return `<div class="card pick"><label class="fl" for="wsel"><span>Bulletin</span><select id="wsel" data-c="cur">${DB.weeks.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<option value="${x.id}" ${x.id==w.id?"selected":""}>${esc(wlabel(x))}</option>`).join("")}</select></label>
  <div class="row"><button class="btn" data-a="newwk">New week</button><button class="btn ghost" data-a="dupwk">Duplicate</button><button class="btn ghost ${S.del?"dng":""}" data-a="delwk" ${DB.weeks.length<2?"disabled":""}>${S.del?"Tap again to delete":"Delete"}</button></div>
  <p class="hint">New week copies this one and moves the date to the following Sunday. Clear what changes and keep the rest.</p></div>
  <div class="card"><div class="two">${fld("Date","w.date",{type:"date"})}${fld("Theme or series line","w.theme",{ph:"Optional. Appears on the cover"})}</div></div>
  <h3 class="h3">Sections</h3><div class="secs">${w.secs.map((s,i)=>secEditor(s,i,n)).join("")}</div>
  <button class="add big" data-a="addsec">+ Add a custom section</button>`}
function churchTab(){const c=DB.c;
  return `<div class="card">${fld("Church name","c.name")}${fld("Tagline","c.tag",{ph:"Optional"})}
  <div class="two">${fld("Address","c.addr")}${fld("Phone","c.phone")}</div><div class="two">${fld("Website","c.web")}${fld("Email","c.email")}</div><div class="opt"><label class="chk"><input type="checkbox" data-c="c.qr" ${c.qr!==false?"checked":""}> Show a QR code for the website</label></div></div>
  <h3 class="h3">Service times</h3><div class="card">${listEd("c.times",[["d","Day","sm"],["t","Time","sm"],["n","Service name"]],"Add time")}</div>
  <h3 class="h3">Logo</h3><div class="card logo">${c.logo?`<img src="${c.logo}" alt="Church logo">`:`<div class="nologo">No logo</div>`}<div class="row"><label class="btn ghost file">${c.logo?"Replace logo":"Add logo"}<input type="file" accept="image/*" data-c="logo"></label>${c.logo?`<button class="btn ghost" data-a="nologo">Remove</button>`:""}</div><p class="hint">A transparent PNG works best. The website address also becomes the QR code on the back of the booklet.</p></div>
  <h3 class="h3">Your data</h3><div class="card"><p class="hint" style="margin-top:0">Everything is saved in this browser only. Download a backup to keep it safe or move it to another device.</p><div class="row"><button class="btn" data-a="bk">Download backup</button><label class="btn ghost file">Restore backup<input type="file" accept=".json,application/json" data-c="rs"></label></div></div>`}
function lookTab(){const l=DB.l,sl=l.design=="editorial"||l.design=="minimal",sg=seasonFor(W().date),ss=SEASONS.find(x=>x.k==sg),light=l.design=="poster"||l.design=="card",artOK=l.design!="traditional"&&(!sl||l.cover=="bold");
  const seasons=`<h3 class="h3 first">Seasons</h3><div class="card">${ss?`<p class="hint" style="margin:0 0 10px">This Sunday falls in <b>${ss.n}</b>.${l.pack==ss.k?"":` <button class="btn ghost sm" data-a="pack" data-v="${ss.k}">Use the ${ss.n} look</button>`}</p>`:`<p class="hint" style="margin:0 0 10px">One tap sets the design, color, typefaces, art and illustration for a season.</p>`}<div class="seas">${SEASONS.map(x=>`<button class="scard ${l.pack==x.k?"on":""}" data-a="pack" data-v="${x.k}" aria-pressed="${l.pack==x.k}"><i style="background:${x.acc}"></i><b>${x.n}</b><small>${x.d}</small></button>`).join("")}</div>${l.pack?`<button class="btn ghost sm" data-a="pack" data-v="" style="margin-top:10px">Clear season look</button>`:""}</div>`;
  const artH=artOK?`<h3 class="h3">Cover art</h3><div class="card"><div class="artg">${ART.map(a=>`<button class="acard ${l.art==a[0]?"on":""}" data-a="art" data-v="${a[0]}" aria-pressed="${l.art==a[0]}"><canvas data-art="${a[0]}" width="132" height="176"></canvas><small>${a[1]}</small></button>`).join("")}</div><div class="row" style="margin:10px 0 0"><button class="btn ghost sm" data-a="shuf">Shuffle art</button></div><p class="hint" style="margin-top:8px">The art is drawn fresh from your accent color, and it changes every week. Shuffle until you like it.</p></div>`:"";
  const illH=`<h3 class="h3">Illustration</h3><div class="card"><div class="illg"><button class="icard ${l.ill=="none"?"on":""}" data-a="ill" data-v="none" aria-pressed="${l.ill=="none"}"><span>None</span></button>${ILL.map(a=>`<button class="icard ${l.ill==a[0]?"on":""}" data-a="ill" data-v="${a[0]}" aria-pressed="${l.ill==a[0]}" title="${a[1]}" aria-label="${a[1]}"><canvas data-ill="${a[0]}" width="96" height="96"></canvas></button>`).join("")}</div></div>`;
  return seasons+`<h3 class="h3">Design</h3><div class="dsg">${DESIGNS.map(d=>`<button class="dcard ${l.design==d[0]?"on":""}" data-a="dsn" data-v="${d[0]}" aria-pressed="${l.design==d[0]}"><canvas data-d="${d[0]}" width="150" height="232"></canvas><b>${d[1]}</b><small>${d[2]}</small></button>`).join("")}</div>
  ${PH.has(l.design)?`<div class="card" style="margin-top:12px"><div class="phr">${l.photo?`<img src="${l.photo}" alt="Cover photo">`:`<div class="nologo">No photo yet</div>`}<div><div class="row" style="margin:0"><label class="btn ghost file">${l.photo?"Replace photo":"Add cover photo"}<input type="file" accept="image/*" data-c="photo"></label>${l.photo?`<button class="btn ghost" data-a="nophoto">Remove</button>`:""}</div><p class="hint" style="margin-top:8px">A portrait or square photo works best. ${l.design=="arch"||l.design=="cross"||l.design=="bold"||l.design=="photo"?"Without one, this design shows generated art.":""}</p></div></div>${l.photo?`<div style="margin-top:12px"><div class="hint" style="margin:0 0 6px">Photo style</div>${seg(PT,l.pt||"natural","pt")}</div>`:""}</div>`:""}
  ${artH}
  ${illH}
  <h3 class="h3">Accent color</h3><div class="card"><div class="sw8">${SWATCH.map(c=>`<button class="swt ${l.accent.toLowerCase()==c?"on":""}" style="--c:${c}" data-a="acc" data-v="${c}" aria-label="${c}"></button>`).join("")}<label class="swt cust ${SWATCH.includes(l.accent.toLowerCase())?"":"on"}" style="--c:${l.accent}" aria-label="Custom color"><input type="color" value="${l.accent}" data-c="l.accent"></label></div></div>
  <h3 class="h3">Typefaces</h3><div class="fonts">${Object.keys(FS).map(k=>{const f=FS[k];return `<button class="fcard ${l.font==k?"on":""}" data-a="fnt" data-v="${k}"><span style="font-family:'${f.d[0]}',Georgia,serif;font-weight:${f.d[1]}">${f.n}</span><small style="font-family:'${f.b[0]}',Georgia,serif">${f.d[0]} with ${f.b[0]}</small></button>`}).join("")}<button class="fcard ${l.font=="custom"?"on":""}" data-a="fnt" data-v="custom"><span style="font-family:'${esc(l.cf.d)}',Georgia,serif;font-weight:${l.cf.dw}">Custom</span><small style="font-family:'${esc(l.cf.b)}',Georgia,serif">${esc(l.cf.d)} with ${esc(l.cf.b)}</small></button></div>${l.font=="custom"?fontEditor():`<p class="hint" style="margin-top:8px">Choose Custom to use any Google Font or upload your own.</p>`}
  <h3 class="h3">Text alignment</h3><div class="card">${seg([["left","Left"],["center","Center"],["right","Right"],["justify","Justified"]],l.align||"left","aln")}<p class="hint">Applies to paragraphs, headings and the sermon text. Any section can use its own alignment in This week. Events keep their date column.</p></div>
  <h3 class="h3">Text size</h3><div class="card">${seg([["std","Standard"],["large","Large print"]],l.size,"sz")}<p class="hint">Large print enlarges all text by about 14 percent. Long bulletins may shrink slightly to fit.</p></div>
  ${sl?`<h3 class="h3">Cover</h3><div class="card">${seg([["light","Light"],["bold","Bold color"]],l.cover,"cov")}<p class="hint">Light covers print cleanly on any office printer. Bold covers suit commercial printing and digital use. The digital cover is always bold.</p></div>`:`<p class="hint" style="margin-top:18px">This design uses color to the edge of the page, so print it borderless or on a commercial printer. Editorial and Minimal have light covers that suit any office printer.</p>`}`}
async function thumbs(){const cs=document.querySelectorAll("canvas[data-d],canvas[data-art],canvas[data-ill]");if(!cs.length)return;await loadFonts();cs.forEach(cv=>{try{if(cv.dataset.art){const c=cv.getContext("2d"),k=cv.dataset.art,d=DB.l.design,kk=k=="auto"?(ART_AUTO[d]||"none"):k,lt=d=="poster"||d=="card";c.clearRect(0,0,cv.width,cv.height);if(kk=="none"){c.fillStyle=lt?tint(DB.l.accent,.1):DB.l.accent;c.fillRect(0,0,cv.width,cv.height)}else artFill(c,0,0,cv.width,cv.height,kk,{seed:artSeed(),light:lt});return}
    if(cv.dataset.ill){const c=cv.getContext("2d");c.clearRect(0,0,cv.width,cv.height);drawIll(c,cv.dataset.ill,cv.width/2,cv.height/2,cv.width*.4,DB.l.accent,2.4);return}const pg=mkPage(396,612,cv.width/396);drawCover(pg,W(),{design:cv.dataset.d,bold:false});const c=cv.getContext("2d");c.clearRect(0,0,cv.width,cv.height);c.drawImage(pg.cv,0,0,cv.width,cv.height)}catch(e){}})}
A.dsn=v=>{const d=DESIGNS.find(x=>x[0]==v);DB.l.design=v;DB.l.font=d[3];persist();render(true)};
A.pack=v=>{if(!v){DB.l.pack="";DB.l.art="auto";DB.l.ill="none"}else{const x=SEASONS.find(y=>y.k==v);Object.assign(DB.l,{pack:v,design:x.dsn,accent:x.acc,art:x.art,ill:x.ill,cover:"bold",font:x.font})}persist();render(true)};
A.art=v=>{DB.l.art=v;persist();render(true)};A.ill=v=>{DB.l.ill=v;persist();render(true)};A.shuf=()=>{DB.l.seed=(DB.l.seed|0)+1;persist();render(true)};A.pt=v=>{DB.l.pt=v;persist();render(true)};
A.nophoto=()=>{DB.l.photo="";persist();render(true)};
function setPhoto(f){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const mx=1600,k=Math.min(1,mx/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);DB.l.photo=cv.toDataURL("image/jpeg",.86);persist();render(true);res()};im.onerror=()=>{toast("Couldn’t read that image");res()};im.src=r.result};r.readAsDataURL(f)})}

/* ---------- preview panel ---------- */
const LAY=[["booklet","Folded booklet"],["trifold","Tri-fold"],["page","Letter page"],["digital","Digital"]],PST=[["columns","Columns"],["sidebar","Sidebar"],["hero","Hero banner"]];
const LAYNOTE={trifold:"Letter sheet folded in three, six panels. Prints on two sides of one landscape letter sheet, then folds like a brochure.",booklet:"Half-letter, four pages. Prints on two sides of one letter sheet, then folds in half.",page:"One full letter page, two columns. Expands to a second side only if needed.",digital:"Square-ish slides for social media, email and text. One topic per slide."};
function pvPanel(){const l=DB.l.layout;
  return `<div class="pvh">${seg(LAY,l,"lay")}${l=="page"?`<div style="margin-top:8px">${seg(PST,DB.l.pstyle||"columns","pst")}</div>`:""}<p class="hint" style="margin:8px 0 0">${LAYNOTE[l]}${l=="page"&&DB.l.pstyle=="sidebar"?" If it won’t fit on one page, it switches to columns.":""}</p></div><div id="warn"></div><div id="pv" class="pgs ${l}"></div>
  <div class="exp" id="exp">${l=="digital"?`<button class="btn" data-a="share">${navigator.canShare?"Share slides":"Save slides"}</button><button class="btn ghost" data-a="zip">Download all (ZIP)</button>`:
    `<button class="btn" data-a="pdf">Download PDF</button>${inFrame?"":`<button class="btn ghost" data-a="print">Print</button>`}<button class="btn ghost" data-a="zip">Images (ZIP)</button>`}<button class="btn ghost" data-a="cptext">Copy as text</button></div>
  ${l=="booklet"||l=="trifold"?`<p class="hint">Print double-sided, flipping on the <b>short edge</b>, on letter paper, landscape. Fold in half and the pages fall in order.</p>`:l=="page"?`<p class="hint">Print double-sided if there is a back page. Use 100% scale, not “fit to page”.</p>`:`<p class="hint">Tap a slide to enlarge it or save it as an image.</p>`}
  ${inFrame&&l!="digital"?`<p class="hint">To print, download the PDF and open it on your computer.</p>`:""}`}
let relT,relN=0;
function relayout(){clearTimeout(relT);relT=setTimeout(doLayout,160)}
async function doLayout(){const el=$("pv");if(!el)return;const n=++relN;await loadFonts();if(n!=relN)return;
  let R;try{R=build(DB.l.layout,1.5)}catch(e){console.error(e);el.innerHTML='<p class="hint">Something went wrong drawing this layout.</p>';return}
  el.innerHTML="";R.pages.forEach((p,i)=>{const f=document.createElement("figure");f.dataset.a="ovp";f.dataset.v=i;f.tabIndex=0;const d=document.createElement("div");d.className="pg";p.cv.removeAttribute("style");d.appendChild(p.cv);const cap=document.createElement("figcaption");cap.textContent=p.label;f.appendChild(d);f.appendChild(cap);el.appendChild(f)});
  const wn=$("warn");if(wn)wn.innerHTML=R.warn?`<div class="note">Some text doesn’t fit and is cut off. Turn off a section, shorten it, or ${DB.l.layout=="booklet"?"switch to Letter page.":DB.l.layout=="page"?"use a smaller text size.":"shorten the text."}</div>`:""}

/* ---------- render ---------- */
const TABS=[["week","This week"],["church","Church"],["look","Look"],["prev","Preview"]];
function render(keepScroll){if(S.tab=="prev"&&matchMedia("(min-width:980px)").matches)S.tab="week";const y=window.scrollY,body=S.tab=="church"?churchTab():S.tab=="look"?lookTab():weekTab();
  $("app").innerHTML=`<header class="top"><div class="brand"><b>Orderly</b><span>Church bulletins</span></div></header>
  <nav class="tabs" role="tablist">${TABS.map(t=>`<button role="tab" class="${S.tab==t[0]?"on":""} ${t[0]=="prev"?"pvt":""}" data-a="tab" data-v="${t[0]}" aria-selected="${S.tab==t[0]}">${t[1]}</button>`).join("")}</nav>
  <div class="cols t-${S.tab}"><main class="edit">${S.tab=="prev"?"":body}</main><aside class="side">${pvPanel()}</aside></div>
  ${S.ov!=null?ovHtml():""}${S.cpt?`<div class="ov cpo" data-a="cptx"><div class="ovb" data-stop="1"><p>${esc(S.cpt.m)}</p><textarea id="cpt" readonly>${esc(S.cpt.t)}</textarea><button class="btn" data-a="cptx">Done</button></div></div>`:""}`;
  if(keepScroll)window.scrollTo(0,y);doLayout();if(S.tab=="look")thumbs();if(S.cpt){const x=$("cpt");if(x){x.focus();x.select()}}}
function ovHtml(){return `<div class="ov" data-a="ovx"><div class="ovb" data-stop="1"><img id="ovimg" alt="Page preview"><div class="row"><button class="btn" data-a="ovsave">Save image</button><button class="btn ghost" data-a="ovx">Close</button></div></div></div>`}
async function fillOv(){const i=S.ov;await loadFonts();const R=build(DB.l.layout,3),p=R.pages[i];if(!p)return;const im=$("ovimg");if(im)im.src=p.cv.toDataURL("image/png");S.ovName=slug(DB.c.name)+"-"+slug(p.label)+".png";S.ovBlob=await new Promise(r=>p.cv.toBlob(r,"image/png"))}

/* ---------- actions ---------- */
A.tab=v=>{S.tab=v;S.del=false;render();window.scrollTo(0,0)};
A.lay=v=>{DB.l.layout=v;persist();render(true)};A.pst=v=>{DB.l.pstyle=v;persist();render(true)};
A.aln=v=>{DB.l.align=v;persist();render(true)};A.sz=v=>{DB.l.size=v;persist();render(true)};A.cov=v=>{DB.l.cover=v;persist();render(true)};A.fnt=async v=>{DB.l.font=v;persist();render(true);if(v=="custom"){await ensureCustom();render(true)}};
A.cfds=v=>{DB.l.cf.ds=+v;persist();render(true)};A.cfbs=v=>{DB.l.cf.bs=+v;persist();render(true)};
A.gfadd=async()=>{const el=$("gfin"),fam=cleanFam(el&&el.value);if(!fam)return;const role=$("gfrole").value;toast("Looking for “"+fam+"”…",4000);const ok=await gfLoad(fam);if(!ok){toast("Couldn’t load “"+fam+"” from Google Fonts. Check the spelling and your connection.",4500);return}
  if(!GF.some(g=>g[1].includes(fam))&&!(DB.l.gf||[]).includes(fam)){DB.l.gf=(DB.l.gf||[]).concat(fam)}DB.l.cf[role]=fam;DB.l.font="custom";persist();render(true);toast("Added “"+fam+"”")};
A.rmfont=n=>{DB.l.up=(DB.l.up||[]).filter(x=>x.n!=n);delete UPR[n];if(DB.l.cf.d==n)DB.l.cf.d="Playfair Display";if(DB.l.cf.b==n)DB.l.cf.b="Lora";persist();render(true)};
async function addFontFile(f,role){if(f.size>1.5e6){toast("That font file is over 1.5 MB. Try a WOFF2 version or a smaller file.",4500);return}
  const d=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>res(null);r.readAsDataURL(f)});if(!d){toast("Couldn’t read that file");return}
  let n=cleanFam(f.name.replace(/\.[^.]+$/,"").replace(/[-_]+/g," "))||"My font";const base=n;let i=2;while((DB.l.up||[]).some(x=>x.n==n)||STATICF.has(n))n=base+" "+(i++);
  const u={n:n,d:d};if(!await upLoad(u)){toast("That file couldn’t be read as a font.",4500);return}
  DB.l.up=(DB.l.up||[]).concat(u);DB.l.cf[role]=n;DB.l.font="custom";const ok=saveOK();render(true);toast(ok?"Added “"+n+"”":"Added, but this browser can’t store it. It will be gone when you close the page.",ok?2500:5000)}
A.acc=v=>{DB.l.accent=v;persist();render(true)};
A.opn=v=>{S.open[v]=!S.open[v];render(true)};
A.tgl=v=>{const s=secById(v);s.on=!s.on;persist();render(true)};
A.mv=v=>{const[i,d]=v.split(",").map(Number),a=W().secs,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];persist();render(true)};
A.delsec=v=>{const w=W();w.secs=w.secs.filter(s=>s.id!=v);persist();render(true)};
A.addsec=()=>{const s=newSec("custom");W().secs.push(s);S.open[s.id]=true;persist();render(true)};
const NEWI={order:{l:"",n:""},announce:{h:"",b:""},events:{d:"",h:"",b:""},times:{d:"",t:"",n:""}};
A.addi=v=>{const arr=getP(v),p=v.split("."),k=p[0]=="c"?"times":W().secs[+p[2]].k;arr.push(Object.assign({},NEWI[k]));persist();render(true);setTimeout(()=>{const l=document.querySelectorAll('[data-i^="'+v+'."]');const t=l[l.length-(k=="events"?3:k=="announce"?2:k=="times"?3:2)];if(t)t.focus()},30)};
A.deli=v=>{const p=v.split("."),i=+p.pop(),arr=getP(p.join("."));arr.splice(i,1);persist();render(true)};
A.newwk=()=>{const w=W(),n=JSON.parse(JSON.stringify(w));n.id=uid();n.date=addDays(w.date,7);n.theme="";n.secs.forEach(s=>{s.id=uid();if(s.k=="events"){const y=+n.date.slice(0,4),t0=Date.parse(n.date+"T00:00:00");s.items=s.items.filter(it=>{const d=Date.parse((it.d||"").replace(/^[A-Za-z]{3,9},?\s+(?=[A-Za-z])/,"")+" "+y);return isNaN(d)||d>=t0})}if(s.k=="sermon"){s.title="";s.ref="";s.speaker=s.speaker}if(s.k=="prayer")s.text=""});DB.weeks.push(n);DB.cur=n.id;persist();render();window.scrollTo(0,0);toast("New week ready")};
A.pasteev=v=>{const ta=document.getElementById("evpaste");if(!ta||!ta.value.trim())return;const arr=getP(v);ta.value.split(/\n+/).map(l=>l.trim()).filter(Boolean).forEach(l=>{const q=l.split(/\s+[-–—|]\s+/);if(q.length==1)arr.push({d:"",h:q[0],b:""});else arr.push({d:q[0],h:q[1]||"",b:q.slice(2).join(" · ")})});persist();render(true);toast("Events added")};
A.dupwk=()=>{const n=JSON.parse(JSON.stringify(W()));n.id=uid();n.secs.forEach(s=>s.id=uid());DB.weeks.push(n);DB.cur=n.id;persist();render();toast("Duplicated")};
A.delwk=()=>{if(DB.weeks.length<2)return;if(!S.del){S.del=true;render(true);setTimeout(()=>{if(S.del){S.del=false;render(true)}},3500);return}
  DB.weeks=DB.weeks.filter(w=>w.id!=DB.cur);DB.cur=DB.weeks[DB.weeks.length-1].id;S.del=false;persist();render();toast("Deleted")};
A.nologo=()=>{DB.c.logo="";persist();render(true)};
A.ovp=v=>{S.ov=+v;S.ovBlob=null;render(true);fillOv()};
A.ovx=()=>{S.ov=null;render(true)};
A.cptx=()=>{S.cpt=null;render(true)};
A.ovsave=async()=>{if(S.ovBlob)await deliver(S.ovName,S.ovBlob)};

document.addEventListener("input",e=>{const t=e.target,p=t.dataset&&t.dataset.i;if(!p)return;setP(p,t.value);persist();
  if(p=="w.secs"||/\.ref$/.test(p)){const m=p.match(/^w\.secs\.(\d+)\.ref$/);if(m){const s=W().secs[+m[1]],ps=(s.ref||"").trim()?passage(s.ref):null,el=$("pstat");if(el)el.textContent=(s.ref||"").trim()?(ps?ps.ref+" · "+ps.verses.length+" verse"+(ps.verses.length>1?"s":"")+(ps.cut?" (first 40 shown)":""):"Reference not found. Try “John 3:16-21” or “Psalm 23”."):"Type a reference to insert the Berean Standard Bible text."}}
  relayout()});
document.addEventListener("change",async e=>{const t=e.target,p=t.dataset&&t.dataset.c;if(!p)return;
  if(p=="cur"){DB.cur=t.value;persist();S.open={};render();return}
  if(p=="logo"){const f=t.files[0];if(f)await setLogo(f);return}
  if(p=="photo"){const f=t.files[0];if(f)await setPhoto(f);return}
  if(p=="rs"){const f=t.files[0];if(f)restore(f);return}
  if(p=="fontfile"){const f=t.files[0];t.value="";if(f)await addFontFile(f,$("uprole").value);return}
  if(p=="l.cf.d"||p=="l.cf.b"){setP(p,t.value);persist();await ensureCustom();render(true);return}
  if(p=="l.cf.dw"){setP(p,+t.value);persist();render(true);return}
  if(t.type=="checkbox")setP(p,t.checked);else if(t.tagName=="SELECT"&&/lines$/.test(p))setP(p,+t.value);else setP(p,t.value);
  persist();if(p=="l.accent")render(true);else relayout()});
document.addEventListener("click",e=>{if(e.target.closest("[data-stop]")&&!e.target.closest("[data-a]"))return;let t=e.target.closest("[data-a]");if(!t)return;const a=t.dataset.a;if(a&&A[a]){e.preventDefault();A[a](t.dataset.v)}});
document.addEventListener("keydown",e=>{if((e.key=="Enter"||e.key==" ")&&e.target.matches&&e.target.matches("figure[data-a]")){e.preventDefault();A[e.target.dataset.a](e.target.dataset.v)}if(e.key=="Escape"){if(S.ov!=null)A.ovx();else if(S.cpt)A.cptx()}});

/* ---------- logo, backup ---------- */
function setLogo(f){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const mx=700,k=Math.min(1,mx/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);DB.c.logo=cv.toDataURL("image/png");persist();render(true);res()};im.onerror=()=>{toast("Couldn’t read that image");res()};im.src=r.result};r.readAsDataURL(f)})}
A.bk=async()=>{const b=new Blob([JSON.stringify(DB)],{type:"application/json"});await deliver("orderly-backup-"+iso(new Date())+".json",b)};
function restore(f){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o.weeks||!o.weeks.length||!o.c)throw 0;DB={c:Object.assign({},DEF.c,o.c),l:Object.assign({},DEF.l,o.l),weeks:o.weeks,cur:o.cur};if(!W())DB.cur=DB.weeks[0].id;persist();S.open={};render();toast("Backup restored")}catch(e){toast("That file isn’t an Orderly backup")}};r.readAsText(f)}

/* ---------- export ---------- */
async function deliver(name,blob){try{const d=window.claude&&await window.claude.use("downloads");if(d){await d.save({filename:name,data:blob});return}}catch(e){if(e&&e.code=="declined")return}
  try{const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast("Saved to your downloads");return}catch(e){}toast("Saving isn’t available in this view")}
const u8=async b=>new Uint8Array(await b.arrayBuffer());
const toBlob=(cv,t,q)=>new Promise(r=>cv.toBlob(r,t,q));
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=-1;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function makeZip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;const u16=n=>[n&255,n>>8&255],u32=n=>[n&255,n>>8&255,n>>16&255,n>>>24&255];
  files.forEach(f=>{const nm=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length;
    const lh=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0)]);
    cen.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm);
    parts.push(lh,nm,f.data);off+=lh.length+nm.length+sz});
  const cs=off;let cl=0;cen.forEach(c=>{parts.push(c);cl+=c.length});
  parts.push(new Uint8Array([0x50,0x4b,5,6,...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cl),...u32(cs),...u16(0)]));return new Blob(parts,{type:"application/zip"})}
function buildPDF(jpgs,wpx,hpx,wpt,hpt){const enc=new TextEncoder(),parts=[],offs=[];let off=0;const push=b=>{parts.push(b);off+=b.length},s=t=>push(enc.encode(t)),n=jpgs.length;
  s("%PDF-1.4\n");const obj=(id,fn)=>{offs[id]=off;s(id+" 0 obj\n");fn();s("\nendobj\n")};
  obj(1,()=>s("<< /Type /Catalog /Pages 2 0 R >>"));obj(2,()=>s("<< /Type /Pages /Count "+n+" /Kids ["+jpgs.map((_,i)=>(3+3*i)+" 0 R").join(" ")+"] >>"));
  jpgs.forEach((j,i)=>{const pg=3+3*i,ct=4+3*i,im=5+3*i,c=`q ${wpt} 0 0 ${hpt} 0 0 cm /Im0 Do Q`;
    obj(pg,()=>s(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wpt} ${hpt}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
    obj(ct,()=>s(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`));
    obj(im,()=>{s(`<< /Type /XObject /Subtype /Image /Width ${wpx} /Height ${hpx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>\nstream\n`);push(j);s("\nendstream")})});
  const xr=off,tot=3*n+3;s("xref\n0 "+tot+"\n0000000000 65535 f \n");for(let id=1;id<tot;id++)s(String(offs[id]).padStart(10,"0")+" 00000 n \n");
  s(`trailer\n<< /Size ${tot} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:"application/pdf"})}
const KP=200/72;
/* printable sheets: booklet imposes onto landscape letter (back|cover, inside left|inside right) */
function sheets(R){if(R.kind=="trifold"){const mk3=(a,b,c3)=>{const cv=document.createElement("canvas");cv.width=a.cv.width*3;cv.height=a.cv.height;const x=cv.getContext("2d");x.drawImage(a.cv,0,0);x.drawImage(b.cv,a.cv.width,0);x.drawImage(c3.cv,a.cv.width*2,0);return cv},P=R.pages;return{cvs:[mk3(P[4],P[5],P[0]),mk3(P[1],P[2],P[3])],w:R.W*3,h:R.H}}if(R.kind!="booklet")return{cvs:R.pages.map(p=>p.cv),w:R.W,h:R.H};
  const k=R.pages[0].cv.width/R.W,mk=(a,b)=>{const cv=document.createElement("canvas");cv.width=R.pages[0].cv.width*2;cv.height=R.pages[0].cv.height;const c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);c.drawImage(a.cv,0,0);c.drawImage(b.cv,a.cv.width,0);return cv};
  return{cvs:[mk(R.pages[3],R.pages[0]),mk(R.pages[1],R.pages[2])],w:R.W*2,h:R.H}}
const fname=ext=>slug(DB.c.name)+"-bulletin-"+W().date+"."+ext;
A.pdf=async()=>{toast("Building PDF…",6000);try{await loadFonts();const R=build(DB.l.layout,300/72),sh=sheets(R),jp=[];for(const cv of sh.cvs)jp.push(await u8(await toBlob(cv,"image/jpeg",.95)));
  const b=buildPDF(jp,sh.cvs[0].width,sh.cvs[0].height,Math.round(sh.w),Math.round(sh.h));await deliver(fname("pdf"),b)}catch(e){console.error(e);toast("Couldn’t build the PDF")}};
async function pngFiles(){await loadFonts();const R=build(DB.l.layout,DB.l.layout=="digital"?2:KP),f=[];let i=0;for(const p of R.pages){i++;f.push({name:String(i).padStart(2,"0")+"-"+slug(p.label)+".png",data:await u8(await toBlob(p.cv,"image/png"))})}return f}
A.zip=async()=>{toast("Building images…",6000);try{const z=makeZip(await pngFiles());await deliver(fname("zip"),z)}catch(e){toast("Couldn’t build the images")}};
A.share=async()=>{if(!navigator.canShare){A.zip();return}toast("Preparing slides…",5000);try{const fl=(await pngFiles()).map(f=>new File([f.data],f.name,{type:"image/png"}));if(navigator.canShare({files:fl})){await navigator.share({files:fl,title:DB.c.name+" · "+shortDate(W().date)});return}}catch(e){if(e&&e.name=="AbortError")return}A.zip()};
A.print=async()=>{await loadFonts();const R=build(DB.l.layout,2.6),sh=sheets(R),land=R.kind=="booklet"||R.kind=="trifold";let pa=$("pa");if(!pa){pa=document.createElement("div");pa.id="pa";document.body.appendChild(pa)}
  pa.innerHTML=sh.cvs.map(cv=>`<img src="${cv.toDataURL("image/jpeg",.92)}" alt="">`).join("");let st=$("pst");if(!st){st=document.createElement("style");st.id="pst";document.head.appendChild(st)}
  st.textContent=`@page{size:${land?"11in 8.5in":"8.5in 11in"};margin:0}`;setTimeout(()=>{try{window.print()}catch(e){toast("Printing isn’t available here. Download the PDF instead.")}},350)};
function textOut(){const w=W(),c=DB.c,o=[];o.push(c.name);o.push(longDate(w.date));if((w.theme||"").trim())o.push(w.theme.trim());o.push("");
  w.secs.filter(s=>s.on).forEach(s=>{const R=[];
    if(s.k=="welcome"&&s.text.trim())R.push("WELCOME",s.text.trim());
    else if(s.k=="order"&&s.items.some(i=>i.l))R.push("ORDER OF SERVICE",...s.items.filter(i=>i.l).map(i=>"• "+i.l+(i.n?" — "+i.n:"")));
    else if(s.k=="sermon"&&(s.title||s.ref)){R.push("SERMON");if(s.title)R.push(s.title);const sub=[s.speaker,s.series].filter(Boolean).join(" · ");if(sub)R.push(sub);const p=passage(s.ref);if(p)R.push(p.ref+" (BSB)");else if(s.ref)R.push(s.ref)}
    else if(s.k=="announce"&&s.items.length)R.push("ANNOUNCEMENTS",...s.items.map(i=>"• "+[i.h,i.b].filter(Boolean).join(": ")));
    else if(s.k=="events"&&s.items.length)R.push("COMING UP",...s.items.map(i=>"• "+[i.d,i.h,i.b].filter(Boolean).join(" — ")));
    else if(s.k=="prayer"&&s.text.trim())R.push("PRAYER REQUESTS",...s.text.split("\n").filter(x=>x.trim()).map(x=>"• "+x.trim()));
    else if((s.k=="giving"||s.k=="connect")&&s.text.trim())R.push(SECN[s.k].toUpperCase(),s.text.trim());
    else if(s.k=="custom"&&s.text.trim())R.push((s.h||"").toUpperCase(),s.text.trim());
    if(R.length){o.push(...R.filter(x=>x!==""),"")}});
  const tl=timesList().map(t=>[t.d,t.t].filter(Boolean).join(" ")+(t.n?" · "+t.n:""));if(tl.length)o.push("JOIN US",...tl);[c.addr,c.phone,c.email,webShow(c.web)].filter(Boolean).forEach(x=>o.push(x));return o.join("\n").replace(/\n{3,}/g,"\n\n").trim()}
A.cptext=()=>{const t=textOut(),manual=()=>{S.cpt={t,m:"Press and hold to select, then copy."};render(true)};try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>toast("Copied. Paste it into an email or message."),manual);return}}catch(e){}manual()};

/* ---------- start ---------- */
render();
