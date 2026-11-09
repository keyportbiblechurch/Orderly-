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
