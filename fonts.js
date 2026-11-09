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
