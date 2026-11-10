/* ===== Orderly: data, text engine, layouts (all drawing is canvas, in points) ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad2=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
const addDays=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d)};
const PBH=()=>DB.l.pin!==false&&PH.has(DB.l.design)&&photoImg()?1:0;
const longDate=s=>new Date(s+"T12:00:00").toLocaleDateString(dloc(),{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const midDate=s=>new Date(s+"T12:00:00").toLocaleDateString(dloc(),{month:"long",day:"numeric",year:"numeric"});
const shortDate=s=>new Date(s+"T12:00:00").toLocaleDateString(dloc(),{month:"short",day:"numeric"});
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
const DEF={c:{name:"Your Church Name",tag:"",addr:"123 Main Street, Your Town",phone:"",email:"",web:"",qr:true,times:[{d:"Sunday",t:"10:00 AM",n:"Worship service"}],logo:""},
  l:{layout:"booklet",design:"editorial",photo:"",accent:"#1f3a68",hi:"",font:"classic",size:"std",cover:"light",align:"left",pstyle:"columns",cf:{d:"Playfair Display",dw:700,b:"Lora",ds:1,bs:1},up:[],gf:[],art:"auto",ill:"none",pt:"natural",seed:0,pack:""}};
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
const SCHEMES=[["Navy & gold","#1f3a68","#c9a24a"],["Forest & cream","#2f5d46","#c9a24a"],["Burgundy & gold","#7a2e3a","#c9a24a"],["Slate & coral","#3d4a5c","#c2562f"],["Teal & amber","#1f6f78","#d4a017"],["Plum & rose","#5b3f86","#b0436a"],["Classic navy","#1f3a68",""],["Charcoal","#1a1a1a",""]];
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
  const f=fontSet(L.font),base=L.s;return{f,s:base,bs:base*f.bs,ds:f.ds,acc:L.accent,hi:HT(L.hi||L.accent),design:L.design,
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
      L.forEach((r,q)=>{const px=x0+r.x+off+(sh?sh[q]:0);if(r.n){c.font=nf;c.fillStyle=X.hi;c.fillText(r.t,px,bl-sz*.3)}else{c.font=f;c.fillStyle=INK;c.fillText(r.t,px,bl)}})}}})}

/* ---------- Section rows ---------- */
function secRows(X,sec,w,wk){const s=X.bs,lh=s*1.42,R=[];const body=X.body(s),mute=MUTE,al=sec.al||DB.l.align||"left",al2=al=="justify"?"left":al;
  const para=(t,o)=>T(t,Object.assign({font:body,color:INK,size:s,lh,w,align:al},o||{}));
  if(sec.k=="welcome"){if(!sec.text.trim())return R;R.push(head(X,tr("welcome"),al),...para(sec.text),gap(s*.5))}
  else if(sec.k=="order"){const it=sec.items.filter(i=>(i.l||"").trim());if(!it.length)return R;R.push(head(X,tr("order"),al));
    it.forEach(i=>R.push({h:lh*1.08,draw(c,x,y,w){const bl=y+lh*.5+s*.32,nf=X.body(s*.95,400,true),nt=(i.n||"").trim(),nw=nt?mw(nt,nf):0,lf=fit1(i.l.trim(),body,w-nw-(nt?16:0));
      c.textBaseline="alphabetic";c.textAlign="left";c.font=body;c.fillStyle=INK;
      if(al=="center"||al=="right"){const lt=i.l.trim(),sep="  ·  ",tot=mw(lt,body)+(nt?mw(sep,body)+nw:0);if(tot<=w){let px=al=="center"?x+(w-tot)/2:x+w-tot;c.fillText(lt,px,bl);if(nt){px+=mw(lt,body);c.fillStyle=mute;c.fillText(sep,px,bl);px+=mw(sep,body);c.font=nf;c.fillText(nt,px,bl)}return}}
      c.fillText(lf,x,bl);
      if(nt){c.font=nf;c.fillStyle=mute;c.textAlign="right";c.fillText(nt,x+w,bl);const lw=mw(lf,body);c.save();c.strokeStyle="#b9bec8";c.lineWidth=.7;c.setLineDash([.5,2.6]);c.beginPath();c.moveTo(x+lw+6,bl-1);c.lineTo(x+w-nw-6,bl-1);c.stroke();c.restore()}}}));R.push(gap(s*.5))}
  else if(sec.k=="sermon"){const hasAny=sec.title||sec.ref||sec.speaker||sec.series;if(!hasAny)return R;R.push(head(X,tr("sermon"),al));
    const kp=a=>{a.forEach(r=>r.keep=true);return a};
    if(sec.title)R.push(...kp(T(sec.title,{font:X.disp(s*1.75*X.ds),color:INK,size:s*1.75*X.ds,lh:s*1.75*X.ds*1.15,w,align:al2})));
    const sub=[sec.speaker,sec.series].filter(Boolean).join("  ·  ");if(sub)R.push(...kp(T(sub,{font:X.body(s*.98,400,true),color:mute,size:s,lh,w,align:al2})));
    const ps=passage(sec.ref);
    if(sec.ref.trim()){const g1=gap(s*.35);g1.keep=true;R.push(g1,...kp(T(ps?ps.ref:sec.ref,{font:X.lab(s*.86),color:X.hi,size:s*.86,lh,w,align:al2})));
      if(ps&&sec.showText){const g2=gap(s*.2);g2.keep=true;R.push(g2,...verseRows(X,ps,s*.98,w,al),...T("Berean Standard Bible (public domain)",{font:X.body(s*.72,400,true),color:mute,size:s*.72,lh:s*1.2,w,align:al2}))}}
    if(sec.lines!=0){R.push(gap(s*.5));const nr=T(tr("notes"),{font:X.lab(s*.72),color:mute,size:s*.72,lh:s*1.3,w});nr.forEach(r=>r.keep=true);R.push(...nr);const st=lh*1.35,n=sec.lines>0?sec.lines:3;R.push({h:st*n,fill:sec.lines<0,draw(c,x,y,w,hh){const cnt=sec.lines<0?Math.max(3,Math.floor((hh||st*n)/st)):n;c.strokeStyle=RULE;c.lineWidth=.6;for(let i=0;i<cnt;i++){c.beginPath();c.moveTo(x,y+lh*1.2+i*st);c.lineTo(x+w,y+lh*1.2+i*st);c.stroke()}}})}
    R.push(gap(s*.6))}
  else if(sec.k=="announce"){const it=sec.items.filter(i=>(i.h||"").trim()||(i.b||"").trim());if(!it.length)return R;R.push(head(X,tr("announce"),al));
    it.forEach(i=>{if((i.h||"").trim())R.push(...T(i.h.trim(),{font:X.body(s,700),color:INK,size:s,lh,w,align:al2}));if((i.b||"").trim())R.push(...T(i.b.trim(),{font:body,color:INK,size:s,lh,w,align:al}));R.push(gap(s*.45))})}
  else if(sec.k=="events"){const it=sec.items.filter(i=>(i.h||"").trim());if(!it.length)return R;R.push(head(X,tr("events"),al));const dw=Math.min(w*.3,Math.max(52,w*.26));
    it.forEach(i=>{const hl=T(i.h.trim(),{font:X.body(s,700),color:INK,size:s,lh,w:w-dw-8}),bl=(i.b||"").trim()?T(i.b.trim(),{font:body,color:mute,size:s*.96,lh,w:w-dw-8}):[],ds=wrapT((i.d||"").trim(),X.lab(s*.82),dw);
      const rows=[...hl,...bl];rows.forEach((r,ix)=>{const o=r.draw,dl=ix==0?ds:[];r.draw=(c,x,y,ww)=>{o(c,x+dw+8,y,ww-dw-8);dl.forEach((l,j)=>{c.font=X.lab(s*.82);c.fillStyle=X.hi;c.textAlign="left";c.textBaseline="alphabetic";c.fillText(l,x,y+lh*.5+s*.3+j*lh*.9)})}});
      if(ds.length>rows.length)for(let q=rows.length;q<ds.length;q++)rows.push({h:lh*.9,draw(){}});R.push(...rows,gap(s*.4))})}
  else if(sec.k=="prayer"){const ls=sec.text.split("\n").map(x=>x.trim()).filter(Boolean);if(!ls.length)return R;R.push(head(X,tr("prayer"),al));const bul=al=="left"||al=="justify";
    ls.forEach(l=>{const rs=T(l,{font:body,color:INK,size:s,lh,w,ind:bul?s*1.1:0,align:al});rs.forEach((r,i)=>{if(i==0&&bul){const o=r.draw;r.draw=(c,x,y,ww)=>{o(c,x,y,ww);c.fillStyle=X.hi;c.beginPath();c.arc(x+s*.32,y+lh*.5,s*.15,0,6.29);c.fill()}}});R.push(...rs)});R.push(gap(s*.5))}
  else if(sec.k=="giving"||sec.k=="connect"||sec.k=="custom"){const h=sec.k=="custom"?(sec.h||"").trim():tr(sec.k);if(!sec.text.trim())return R;if(h)R.push(head(X,h,al));R.push(...para(sec.text),gap(s*.5))}
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
let LX=0;
function drawLogo(c,x,y,bw,bh,align,o){o=o||{};const im=logoImg();LX=0;if(!im)return 0;const ls=Math.max(.5,Math.min(o.cap||2.4,parseFloat(DB.c.ls)||1)),nw=bw*ls,nh=bh*ls;LX=Math.max(0,nh-bh);if(o.top){}else y-=(nh-bh)/2;if(align=="right")x-=nw-bw;else if(align=="ctr")x-=(nw-bw)/2;const r=Math.min(nw/im.naturalWidth,nh/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;c.drawImage(im,align=="right"?x+nw-w:align=="ctr"?x+(nw-w)/2:x,y+(o.top?0:(nh-h)/2),w,h);return w}
const churchLine=()=>[DB.c.name,DB.c.addr,webShow(DB.c.web)].filter(Boolean).join("  ·  ");

/* ---------- Layouts ---------- */
const SIZES={std:1,large:1.14};
function HI(){return DB.l.hi||DB.l.accent}
function HT(h){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16),l=(.299*r+.587*g+.114*b)/255;if(l<=.62)return h;const k=.62/l;return"#"+[r,g,b].map(v=>("0"+Math.round(v*k).toString(16)).slice(-2)).join("")}
function styleOf(base){return ctxOf({font:DB.l.font,accent:DB.l.accent,hi:DB.l.hi,design:DB.l.design,s:base})}
function insideSecs(wk){return wk.secs.filter(s=>s.on&&!BACK[s.k])}
function backSecs(wk){return wk.secs.filter(s=>s.on&&BACK[s.k])}
function title4(wk){const se=wk.secs.find(s=>s.k=="sermon"&&s.on);return (wk.theme||"").trim()||(se&&se.title)||tr("worship")}
function timesList(){return DB.c.times.filter(t=>(t.d||"").trim()||(t.t||"").trim()||(t.n||"").trim())}

function drawBack(pg,wk,s,warn,pre){const c=pg.c,Wp=pg.W,Hp=pg.H,nar=Wp<300,m=nar?26:36,X=styleOf(s),w=Wp-2*m;
  const tl=timesList(),blockH=nar?148:150;
  const rows=pre?pre.slice():[];if(!pre)backSecs(wk).forEach(sec=>rows.push(...secRows(X,sec,w,wk)));
  let used=0;const r=flow(rows,()=>used++?null:{c,x:m,y:m,w,h:Hp-2*m-blockH-10});if(r)warn.push(r);
  {const top=m+hOf(rows),free=Hp-m-blockH-2-top,tg=(DB.c.tag||"").trim();if(!r&&tg&&DB.c.btag!==false&&free>(nar?120:130)){const sz=(nar?12.5:15)*X.f.bs,f=X.body(sz,400,true);c.font=f;const ls=wrapT(tg,f,w*(nar?.9:.78)),lh=sz*1.4,bh=20+ls.length*lh,y0=top+(free-bh)*.5+4;ornament(c,Wp/2,y0,nar?30:40,DB.l.accent,.8);c.textAlign="center";c.fillStyle=MUTE;c.textBaseline="alphabetic";ls.forEach((l,i)=>c.fillText(l,Wp/2,y0+22+i*lh));c.textAlign="left"}}
  // info block
  const by=Hp-m-blockH+6;c.strokeStyle=RULE;c.lineWidth=.6;c.beginPath();c.moveTo(m,by-8);c.lineTo(Wp-m,by-8);c.stroke();
  const qs=nar?64:86,url=webUrl(DB.c.web),showQ=!!url&&DB.c.qr!==false,tw=w-(showQ?qs+20:0);let ix=m;
  c.textAlign="left";c.textBaseline="alphabetic";c.font=X.disp(15*X.ds);c.fillStyle=INK;c.fillText(DB.c.name,m,by+14);
  let y=by+32;c.font=X.lab(7.5);
  labelTxt(c,tr("join").toUpperCase(),m,y,X.lab(7.2),X.hi,1.4);y+=13;
  tl.slice(0,4).forEach(t=>{c.font=X.body(9.2*X.f.bs);c.fillStyle=INK;c.fillText(fit1([t.d,t.t].filter(Boolean).join("  "),X.body(9.2*X.f.bs),tw)+(t.n?"  ·  "+t.n:""),m,y);y+=12.2});
  y+=3;[DB.c.addr,DB.c.phone,DB.c.email,webShow(DB.c.web)].filter(Boolean).forEach(l=>{c.font=X.body(8.8*X.f.bs);c.fillStyle=MUTE;c.fillText(fit1(l,X.body(8.8*X.f.bs),tw),m,y);y+=11.4});
  if(showQ){qrDraw(c,url,Wp-m-qs,Hp-m-qs-12,qs,INK);c.font=X.lab(6.4);c.fillStyle=MUTE;c.textAlign="right";try{c.letterSpacing="1px"}catch(e){}c.fillText(tr("scan").toUpperCase(),Wp-m,Hp-m+2);try{c.letterSpacing="0px"}catch(e){}c.textAlign="left"}}
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
function buildBooklet(k,wk,warn){const ser=sermonOf(wk),Wp=396,Hp=612,m=36,w=Wp-2*m,base=10*SIZES[DB.l.size],regH=Hp-2*m-8,backH=Hp-2*m-160,ins=insideSecs(wk).filter(s=>s!==ser),bks=backSecs(wk),PB0=PBH()?98-m:0;
  const mk=(X,secs,back)=>secs.map(sec=>{const rows=secRows(X,sec,w,wk);return grp(rows,{back})}).filter(g=>g.rows.length),hs=(ser?[regH,backH]:[regH,regH,backH]).map((x,i)=>i?x:x-PB0),one=h=>{let u=0;return()=>u++?null:{h}};
  let s=base,P=null,xtra=false;const groupsAt=f=>{const X=styleOf(base*f);return mk(X,ins,false).concat(mk(X,bks,true))};
  for(const f of [1,.95,.9,.86,.82,.78,.74,.7]){s=base*f;P=packGroups(groupsAt(f),hs);if(!P.fail)break}
  let sRows=[];if(ser)for(const f of [1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,w,wk);if(!flow(sRows,one(regH),true))break}
  const sMin=sRows.map(r=>r.fill?Object.assign({},r,{fill:false}):r);
  if(P.fail){const left=ser?Math.max(0,regH-hOf(sMin)-8):0,hs2=ser?hs.concat(left):hs;
    for(const f of [.7,.66,.62,.58]){s=base*f;P=packLoose(groupsAt(f),hs2,hs.length-1);if(!P.fail)break}
    xtra=!!(ser&&P.out[hs.length]&&P.out[hs.length].length)}
  const cover=mkPage(Wp,Hp,k),in1=mkPage(Wp,Hp,k),in2=mkPage(Wp,Hp,k),back=mkPage(Wp,Hp,k);
  drawCover(cover,wk,{bold:DB.l.cover=="bold"});decor(in1,"in");decor(in2,"in");decor(back,"back");if(PB0)photoBand(in1.c,0,0,Wp,84);
  const pgs=ser?[in1,back]:[in1,in2,back],rowsOn=i=>P.out[i].flatMap(g=>g.rows);
  pgs.forEach((pg,i)=>{if(pg===back)return;const l=flow(rowsOn(i),one1(pg.c,m,i?m:m+PB0,w,i?regH:regH-PB0));if(l)warn.push(l)});
  if(ser){const l=flow(xtra?sMin.concat(P.out[hs.length].flatMap(g=>g.rows)):sRows,one1(in2.c,m,m,w,regH));if(l)warn.push(l)}
  folio(in1,DB.c.name+" · "+shortDate(wk.date));folio(in2,tr("lords")+" · "+shortDate(wk.date),true);
  drawBack(back,wk,s,warn,rowsOn(pgs.length-1));
  return{kind:"booklet",pages:[{...cover,label:"Cover"},{...in1,label:"Inside left"},{...in2,label:ser?"Sermon":"Inside right"},{...back,label:"Back"}],W:Wp,H:Hp}}
const one1=(c,x,y,w,h)=>{let u=0;return()=>u++?null:{c,x,y,w,h}};



function buildTrifold(k,wk,warn){const ser=sermonOf(wk),Wp=264,Hp=612,m=26,w=Wp-2*m,base=9*SIZES[DB.l.size],regH=Hp-2*m-8,backH=Hp-2*m-148,ins=insideSecs(wk).filter(s=>s!==ser),bks=backSecs(wk),PB0=PBH()?82-m:0;
  const mk=(X,secs,back)=>secs.map(sec=>{const rows=secRows(X,sec,w,wk);return grp(rows,{back})}).filter(g=>g.rows.length),hs=(ser?[regH,regH,regH,backH]:[regH,regH,regH,regH,backH]).map((x,i)=>i?x:x-PB0),one=h=>{let u=0;return()=>u++?null:{h}};
  let s=base,P=null,xtra=false;const groupsAt=f=>{const X=styleOf(base*f);return mk(X,ins,false).concat(mk(X,bks,true))};
  for(const f of [1,.95,.9,.86,.82,.78,.74,.7]){s=base*f;P=packGroups(groupsAt(f),hs);if(!P.fail)break}
  let sRows=[];if(ser)for(const f of [1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,w,wk);if(!flow(sRows,one(regH),true))break}
  const sMin=sRows.map(r=>r.fill?Object.assign({},r,{fill:false}):r);
  if(P.fail){const left=ser?Math.max(0,regH-hOf(sMin)-8):0,hs2=ser?hs.concat(left):hs;
    for(const f of [.7,.66,.62,.58]){s=base*f;P=packLoose(groupsAt(f),hs2,hs.length-1);if(!P.fail)break}
    xtra=!!(ser&&P.out[hs.length]&&P.out[hs.length].length)}
  const cover=mkPage(Wp,Hp,k),in1=mkPage(Wp,Hp,k),in2=mkPage(Wp,Hp,k),in3=mkPage(Wp,Hp,k),flap=mkPage(Wp,Hp,k),back=mkPage(Wp,Hp,k);
  drawCover(cover,wk,{bold:DB.l.cover=="bold"});[in1,in2,in3,flap].forEach(p=>decor(p,"in"));decor(back,"back");if(PB0)photoBand(in1.c,0,0,Wp,70);
  const pgs=ser?[in1,in3,flap,back]:[in1,in2,in3,flap,back],rowsOn=i=>P.out[i].flatMap(g=>g.rows);
  pgs.forEach((pg,i)=>{if(pg===back)return;const l=flow(rowsOn(i),one1(pg.c,m,i?m:m+PB0,w,i?regH:regH-PB0));if(l)warn.push(l)});
  if(ser){const l=flow(xtra?sMin.concat(P.out[hs.length].flatMap(g=>g.rows)):sRows,one1(in2.c,m,m,w,regH));if(l)warn.push(l)}
  pgs.forEach((pg,i)=>{if(pg===back||rowsOn(i).length)return;const c=pg.c,X=styleOf(10);c.save();c.font=X.lab(7);c.fillStyle=MUTE;try{c.letterSpacing="1.5px"}catch(e){}c.fillText(tr("notes").toUpperCase(),m,m+10);try{c.letterSpacing="0px"}catch(e){}c.strokeStyle="#d5d8de";c.lineWidth=.6;for(let y=m+34;y<Hp-m-6;y+=22){c.beginPath();c.moveTo(m,y);c.lineTo(m+w,y);c.stroke()}c.restore()});
  folio(in1,shortDate(wk.date));folio(in3,shortDate(wk.date),true);
  drawBack(back,wk,s,warn,rowsOn(pgs.length-1));
  return{kind:"trifold",pages:[{...cover,label:"Cover"},{...in1,label:"Inside left"},{...in2,label:ser?"Sermon":"Inside center"},{...in3,label:"Inside right"},{...flap,label:"Flap"},{...back,label:"Back"}],W:Wp,H:Hp}}

const SIDE={announce:1,events:1,prayer:1,giving:1,connect:1};
function buildPage(k,wk,warn){const ser=sermonOf(wk),Wp=612,Hp=792,m=44,cg=26,cw=(Wp-2*m-cg)/2,base=9.6*SIZES[DB.l.size],sty=DB.l.pstyle||"columns",hero=sty=="hero",bnd=!hero&&PBH()?92:0,HH=210,topH=hero?HH-m+22:84+bnd,foot=34,oSecs=wk.secs.filter(s=>s.on&&s!==ser),maxP=ser?3:4;
  const sbw=176,sbg=22,mainW=Wp-2*m-sbw-sbg,sbIn=sbw-28;let sb=null;
  if(sty=="sidebar"&&oSecs.length){const mSecs=oSecs.filter(s=>!SIDE[s.k]),sSecs=oSecs.filter(s=>SIDE[s.k]),y0=m+topH,hh=Hp-y0-m-foot+10;
    for(const f of [1,.95,.91,.87,.83,.8]){const X=styleOf(base*f),mr=[],sr=[];mSecs.forEach(x=>mr.push(...secRows(X,x,mainW,wk)));sSecs.forEach(x=>sr.push(...secRows(X,x,sbIn,wk)));let u1=0,u2=0;if(!flow(mr,()=>u1++?null:{h:hh},true)&&!flow(sr,()=>u2++?null:{h:hh-28},true)){sb={mr,sr,y0,hh,f};break}}}
  const colH=p=>Hp-(p==0?m+topH:m)-m-foot+10,mk=sz=>{const X=styleOf(sz);return oSecs.map(sec=>{const rows=secRows(X,sec,cw,wk);return grp(rows)}).filter(g=>g.rows.length)};
  const hsOf=n=>{const o=[];for(let p=0;p<n;p++)for(let c=0;c<2;c++)o.push(colH(p));return o};
  let nO=0,fb=1,P={out:[]},probe=mk(base);
  if(sb){nO=1;P={out:[]};probe=[1]}
  else if(probe.length){let done=false;for(let n=1;n<=maxP&&!done;n++){const fs=n==1?[1.3,1.22,1.15,1.08,1,.95,.91]:n<maxP?[1,.95,.9,.86,.82]:[1,.95,.9,.86,.82,.78,.74,.7];for(const f of fs){P=packGroups(mk(base*f),hsOf(n));nO=n;fb=f;if(!P.fail){done=true;break}}}
    if(!done)for(const f of [.7,.66,.62,.58]){P=packLoose(mk(base*f),hsOf(maxP),-1);nO=maxP;fb=f;if(!P.fail)break}
    if(nO==1&&!P.fail&&P.out[1]){const gs=mk(base*fb),tot=gs.reduce((a,g)=>a+g.H-g.T,0);for(let h=Math.max(Math.ceil(tot/2),60);h<colH(0);h+=5){const Q=packGroups(gs,[h,h]);if(!Q.fail){P=Q;break}}}}
  const sw=Math.min(Wp-2*m,430),sx=(Wp-sw)/2,sy=probe.length?m:m+topH,sh=Hp-sy-m-foot+10;let sRows=[];
  if(ser)for(const f of [1.2,1.12,1.05,1,.94,.88,.82,.76,.7]){sRows=secRows(styleOf(base*f),ser,sw,wk);let u=0;if(!flow(sRows,()=>u++?null:{h:sh},true))break}
  const pgs=[];for(let i=0;i<nO+1;i++){const pp=mkPage(Wp,Hp,k);if(!(hero&&i==0))decor(pp,"page");pgs.push(pp)}if(bnd)photoBand(pgs[0].c,m,m+84,Wp-2*m,80);
  let last=-1;if(sb){last=0;const c0=pgs[0].c,px=Wp-m-sbw,ph=sb.hh;c0.save();c0.fillStyle=tint(DB.l.accent,.07);c0.beginPath();if(c0.roundRect)c0.roundRect(px,sb.y0,sbw,ph,6);else c0.rect(px,sb.y0,sbw,ph);c0.fill();c0.restore();
    const l1=flow(sb.mr,one1(c0,m,sb.y0,mainW,sb.hh));if(l1)warn.push(l1);const l2=flow(sb.sr,one1(c0,px+14,sb.y0+14,sbIn,ph-28));if(l2)warn.push(l2);
    const used=sumH(sb.sr),url=webUrl(DB.c.web);if(url&&DB.c.qr!==false&&ph-28-used>108){const q=74;qrDraw(c0,url,px+(sbw-q)/2,sb.y0+ph-14-q-12,q,INK);const XX=styleOf(10);c0.font=XX.lab(6.2);c0.fillStyle=MUTE;c0.textAlign="center";try{c0.letterSpacing="1px"}catch(e2){}c0.fillText(tr("scan").toUpperCase(),px+sbw/2,sb.y0+ph-12);try{c0.letterSpacing="0px"}catch(e2){}c0.textAlign="left"}}
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
  const cl=mk(false);body.push(cl);{const c=cl.c;let y=96;const w=Wp-2*m;const rows=[head(X,tr("join"))];timesList().forEach(t=>rows.push(...T([t.d,t.t].filter(Boolean).join("  ")+(t.n?"  ·  "+t.n:""),{font:X.body(X.bs),color:INK,size:X.bs,lh:X.bs*1.5,w})));rows.push(gap(X.bs*.6));[DB.c.addr,DB.c.phone,DB.c.email,webShow(DB.c.web)].filter(Boolean).forEach(l=>rows.push(...T(l,{font:X.body(X.bs*.95),color:MUTE,size:X.bs,lh:X.bs*1.5,w})));
    let u=0;flow(rows,()=>u++?null:{c,x:m,y:96,w,h:260});const url=webUrl(DB.c.web);if(url&&DB.c.qr!==false){qrDraw(c,url,m,Hp-m-150-30,130,INK)}}
  body.forEach((p,i)=>{const c=p.c;slideHeader(c,wk,Wp,Hp,m);c.font=styleOf(10).lab(8);c.fillStyle="#8a909b";c.textAlign="right";c.textBaseline="alphabetic";c.fillText((i+2)+" / "+(body.length+1),Wp-m,Hp-m+10);c.textAlign="left"});
  return{kind:"digital",pages:pgs.map((p,i)=>({...p,label:i==0?"Cover":i==pgs.length-1?"Closing":"Slide "+(i+1)})),W:Wp,H:Hp}}

function build(kind,k){const wk=W(),warn=[];const r=kind=="booklet"?buildBooklet(k,wk,warn):kind=="trifold"?buildTrifold(k,wk,warn):kind=="page"?buildPage(k,wk,warn):buildDigital(k,wk,warn);r.warn=warn.reduce((a,b)=>a+b,0);return r}
