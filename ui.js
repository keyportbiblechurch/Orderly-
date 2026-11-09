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
