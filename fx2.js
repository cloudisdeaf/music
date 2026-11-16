/* =====================================================================
   CloudIsDeaf — fx2.js  (mejora visual, capa 2 · «fanzine + escritorio 98»)
   Esta capa NO guarda contenido: todo el collage son elementos normales del
   diseñador de admin.html (data.json → canvases / over). Aquí solo se les da forma
   según dos campos nuevos de cada elemento:
     · texto  → st: marker | ransom | scrap | dlg | dlgs | burst | ico | cur   (+ tp: cinta)
     · imagen → fx: xb | xr | xy | xg | xk (fotocopia) | paint                  (+ cut, sl, tp, lv)
   Los textos sueltos de la capa están en index.html (#fx2-tx) y se cambian en «Texts».
   Corre también dentro del editor del panel, para que se vea lo mismo que en la web.
   NO toca el motor de audio: solo ESCUCHA el <audio> (A) y lee los datos (D).
   Para desactivar: quitar <script src="fx2.js"> y <link href="fx2.css"> de index.html
   ===================================================================== */
(function(){
"use strict";
const EDIT=typeof ED!=="undefined"&&ED;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const body=document.body;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const X={bound:0,imgs:{},eq:0};
const INK="#0d0d0d",RED="#e8321c",YEL="#ffd400",BLU="#1b46c9";

/* ---------- traducciones de los textos de partida (se cambian en «Translations») ---------- */
const T={
 es:{"TYPE BEATS\nFOR SALE!":"TYPE BEATS\n¡EN VENTA!","Heavy 808s inside.\nPlay the latest beat?":"808s pesados dentro.\n¿Escuchar el último beat?","Yes, please":"Sí, dale","Pause":"Pausar","Licenses from {p}":"Licencias desde {p}","Click the picture to play":"Haz clic en la imagen para escuchar","Hear beats":"Escuchar beats","untagged files after payment":"archivos sin tag tras el pago","pick one":"elige una","Some beats cooked up late at night. Press play and let it clear your mind.":"Beats cocinados de madrugada. Dale al play y deja que te despeje la cabeza."},
 ca:{"TYPE BEATS\nFOR SALE!":"TYPE BEATS\nEN VENDA!","Heavy 808s inside.\nPlay the latest beat?":"808s pesants a dins.\nEscoltar l'últim beat?","Yes, please":"Sí, endavant","Pause":"Pausar","Licenses from {p}":"Llicències des de {p}","Click the picture to play":"Fes clic a la imatge per escoltar","Hear beats":"Escoltar beats","untagged files after payment":"arxius sense tag després del pagament","pick one":"tria'n una","Some beats cooked up late at night. Press play and let it clear your mind.":"Beats cuinats de matinada. Prem play i deixa que t'aclareixi el cap."}
};
if(window.I18N)for(const l in T)window.I18N[l]=Object.assign({},T[l],window.I18N[l]||{});
// texto editable desde «Texts» (render0 ya lo deja traducido en #fx2-tx)
const tx=k=>{const e=q('#fx2-tx [data-tx="fx2-'+k+'"]');return e?e.textContent:""};
const price=()=>{const m=Math.min.apply(null,(D.licenses||[]).map(l=>+l.price));return isFinite(m)?S+m:""};

/* ---------- utilidades ---------- */
function rng(seed){let s=0;for(const c of String(seed))s=(s*31+c.charCodeAt(0))>>>0;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
const slug=s=>String(s).toLowerCase().normalize("NFD").replace(/\.[a-z0-9]+$/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"beat";
const RF=["'Archivo Black'","Anton","'Bebas Neue'","'Special Elite'","'Space Mono'","'Permanent Marker'","VT323","Inter","Georgia","'Times New Roman'","'Courier New'","Impact"];
const RB=[["#fffdf4",INK],[INK,"#fffdf4"],[YEL,INK],[RED,"#fff"],[BLU,"#fff"],["#e3dcc6",INK],["#fff",RED],[INK,YEL],["#e3dcc6",BLU]];
function ransom(txt,seed){
 const r=rng(seed);let n=0,lb=-1;const j=()=>(r()*8)|0;
 return String(txt).split(/\s+/).filter(Boolean).map(w=>'<span class="fx2-rw">'+[...w].map(c=>{
  let bi=(r()*RB.length)|0;if(bi===lb)bi=(bi+1)%RB.length;lb=bi;const b=RB[bi],f=RF[(r()*RF.length)|0];
  return '<i style="font-family:'+f+';background:'+b[0]+';color:'+b[1]+';--a:'+(r()*14-7).toFixed(1)+'deg;--k:'+(.86+r()*.32).toFixed(2)+';--y:'+(r()*.16-.08).toFixed(2)+'em;--d:'+(n++*38)+'ms;clip-path:polygon('+j()+'% '+j()+'%,'+(100-j())+'% '+j()+'%,'+(100-j())+'% '+(100-j())+'%,'+j()+'% '+(100-j())+'%)">'+esc(r()>.28?c.toUpperCase():c.toLowerCase())+'</i>';
 }).join("")+'</span>').join(" ");
}
const POLY=["polygon(5% 3%,46% 0,94% 4%,100% 37%,95% 71%,99% 97%,56% 100%,9% 96%,0 61%,3% 27%)","polygon(0 6%,38% 2%,71% 0,100% 8%,96% 49%,100% 92%,62% 100%,24% 96%,2% 100%,5% 55%)","polygon(8% 0,60% 4%,97% 0,100% 44%,93% 100%,49% 95%,6% 100%,0 58%,4% 30%)","polygon(2% 9%,30% 0,66% 5%,98% 2%,100% 60%,94% 98%,40% 100%,0 93%,5% 48%)"];
function burst(seed,n){const r=rng(seed),P=[];n=n||13;for(let i=0;i<n*2;i++){const a=Math.PI*2*(i+(r()-.5)*.35)/(n*2),R=i%2?26+r()*8:44+r()*6;P.push((50+Math.cos(a)*R).toFixed(1)+"% "+(50+Math.sin(a)*R).toFixed(1)+"%")}return"polygon("+P.join(",")+")"}
function torn(seed){const r=rng(seed),P=[];for(let x=0;x<=100;x+=9)P.push(x+"% "+(r()*9).toFixed(1)+"%");for(let x=100;x>=0;x-=8)P.push(x+"% "+(100-r()*10).toFixed(1)+"%");return"polygon("+P.join(",")+")"}

/* ---------- filtros: fotocopia en dos tintas ---------- */
function defs(){
 if(q(".fx2-defs"))return;
 const xf=(id,mid,lt,dk)=>'<filter id="fx2-'+id+'" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix type="saturate" values="0" result="g"/><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="1" seed="5"/><feColorMatrix values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="n"/><feComposite in="g" in2="n" operator="arithmetic" k1="0" k2="1.35" k3=".4" k4="-.38"/>'
  +'<feComponentTransfer><feFuncR type="discrete" tableValues="0 0 .5 1 1"/><feFuncG type="discrete" tableValues="0 0 .5 1 1"/><feFuncB type="discrete" tableValues="0 0 .5 1 1"/></feComponentTransfer>'
  +'<feComponentTransfer><feFuncR type="table" tableValues="'+dk[0]+" "+mid[0]+" "+lt[0]+'"/><feFuncG type="table" tableValues="'+dk[1]+" "+mid[1]+" "+lt[1]+'"/><feFuncB type="table" tableValues="'+dk[2]+" "+mid[2]+" "+lt[2]+'"/></feComponentTransfer><feComposite operator="in" in2="SourceGraphic"/></filter>';
 const K=[.05,.05,.07],P=[.97,.96,.92];
 const s=document.createElement("div");s.className="fx2-defs";s.setAttribute("aria-hidden","true");
 s.innerHTML='<svg width="0" height="0"><defs>'
  +xf("xb",[.24,.47,.9],P,K)+xf("xr",[.93,.24,.12],P,K)+xf("xy",[1,.83,0],P,K)+xf("xk",[.62,.61,.58],P,K)+xf("xg",[.2,.7,.2],[1,.9,.25],[.33,.14,.5])
  +'<filter id="fx2-inks" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>'
  +'</defs></svg>';
 body.appendChild(s);
}

/* ---------- piezas de interfaz ---------- */
const CTL='<i aria-hidden="true"><b></b><b></b></i>';
const CUR='<svg viewBox="0 0 22 30" aria-hidden="true"><path d="M2 1v22l5-5 4 9 4-2-4-9h8z" fill="#fff" stroke="#000" stroke-width="1.6"/></svg>';
const g=s=>'<svg viewBox="0 0 16 16" fill="none" stroke="#000" stroke-width="1.3">'+s+'</svg>';
const TOOLS=['<path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" stroke-dasharray="2 1.4"/>','<rect x="2.5" y="4" width="11" height="8" stroke-dasharray="2 1.4"/>','<path d="M9 3l4 4-6 6H4l-1-3z" fill="#fff"/><path d="M6 7l3 3"/>','<path d="M4 9l5-5 4 4-5 5z" fill="#fff"/><path d="M13 9c1 2 1 3 0 4" stroke="#000080"/>','<path d="M3 13l1-3 6-6 2 2-6 6z"/><path d="M10 3l3 3"/>','<circle cx="7" cy="7" r="4"/><path d="M10 10l4 4" stroke-width="2"/>','<path d="M3 13l1-3 7-7 2 2-7 7z" fill="#ffd400"/>','<path d="M9 2v6M7 8h4v3c0 2-4 2-4 0z" fill="#000"/>','<rect x="4" y="7" width="5" height="7" fill="#fff"/><path d="M6 7V5h2M11 3h.5M13 5h.5M12 7h.5M13 2h.5" stroke-width="1.6"/>','<path d="M4 13L8 3l4 10M5.5 9.5h5" stroke-width="1.6"/>','<path d="M3 3l10 10"/>','<path d="M3 13C3 3 13 13 13 3"/>','<rect x="2.5" y="4" width="11" height="8"/>','<path d="M3 13V6l5-3 5 4-2 6z"/>','<ellipse cx="8" cy="8" rx="5.5" ry="4"/>','<rect x="2.5" y="4" width="11" height="8" rx="3"/>'].map(g);
const PALC=["#000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080ff","#004080","#4000ff","#804000","#fff","#c0c0c0","#f00","#ff0","#0f0","#0ff","#00f","#f0f","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040"];
const ICO=k=>k==="exe"?'<svg viewBox="0 0 38 38" aria-hidden="true"><rect x="3.5" y="6.5" width="31" height="25" fill="#c0c0c0" stroke="#000"/><rect x="5" y="8" width="28" height="6" fill="#000080"/><rect x="6" y="16" width="26" height="14" fill="#fff" stroke="#808080"/><path d="M14 19v8l8-4z" fill="#000"/></svg>':'<svg viewBox="0 0 38 38" aria-hidden="true"><path d="M8.5 3.5h15l7 7v24h-22z" fill="#fff" stroke="#000"/><path d="M23.5 3.5v7h7" fill="#c0c0c0" stroke="#000"/><path d="M12 15h14M12 19h14M12 23h14M12 27h9" stroke="#000080"/></svg>';
const PLAY='<svg class="tr" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg><svg class="ps" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
const SEL='<span class="fx2-sel" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></span>';
const TAPE='<i class="fx2-tape" aria-hidden="true"></i>';

/* ---------- dar forma a los elementos del diseñador ---------- */
const itemOf=el=>{const o=el.dataset.o,b=el.dataset.b,i=+el.dataset.i;try{return o==="c"?D.canvases[b].items[i]:D.over[b][i]}catch(e){return null}};
function dress(){
 qa(".it[data-b]").forEach(el=>{
  if(el._fx2)return;el._fx2=1;
  const it=itemOf(el);if(!it)return;
  const key=el.dataset.o+el.dataset.b+el.dataset.i;
  if(it.t==="img"){
   const img=el.querySelector("img");if(!img)return;const src=img.getAttribute("src");
   if(it.fx==="paint"){
    el.classList.add("fx2-pw");
    el.innerHTML='<div class="w95 fx2-paint"><div class="w95-t"><span class="fx2-pt"></span>'+CTL+'</div><div class="w95-m" aria-hidden="true"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>I</u>mage</span><span><u>O</u>ptions</span><span><u>H</u>elp</span></div>'
     +'<div class="fx2-pb"><div class="fx2-tools" aria-hidden="true">'+TOOLS.map(t=>"<b>"+t+"</b>").join("")+'</div><button class="fx2-cvw" type="button" aria-label="'+esc(tx("yes"))+'"><canvas class="fx2-px" width="96" height="82" data-src0="'+esc(src)+'"'+(it.lv?' data-lv="1"':"")+'></canvas></button></div>'
     +'<div class="fx2-pal" aria-hidden="true"><b></b><span>'+PALC.map(c=>'<i style="background:'+c+'"></i>').join("")+'</span></div>'
     +'<div class="w95-s"><span>'+esc(tx("paint"))+'</span><span>96 × 82</span></div></div>';
    el.querySelector(".fx2-cvw").addEventListener("click",go);
   }else{
    if(it.fx)img.style.filter="url(#fx2-"+it.fx+")";
    if(it.cut){const p=(key.length+(+el.dataset.i))%4;img.style.clipPath=POLY[(p+1)%4];const w=document.createElement("span");w.className="fx2-cut";w.style.clipPath=POLY[p];img.replaceWith(w);w.appendChild(img)}
   }
   if(it.sl)el.insertAdjacentHTML("afterbegin",SEL);
   if(it.tp)el.insertAdjacentHTML("beforeend",TAPE);
   return;
  }
  const st=it.st||"",s=el.textContent;
  if(st)el.classList.add("fx2s-"+(st==="dlgs"?"dlg":st));
  if(st==="marker")el.classList.add("fx2-ink");
  else if(st==="ransom"){el.setAttribute("aria-label",s);el.innerHTML='<span aria-hidden="true">'+ransom(s,key+s)+'</span>'}
  else if(st==="scrap")el.innerHTML='<span class="fx2-scrap" style="clip-path:'+torn(key)+'">'+esc(s)+'</span>';
  else if(st==="burst"){el.setAttribute("aria-hidden","true");el.innerHTML='<span class="fx2-burst" style="clip-path:'+burst(key,12+(+el.dataset.i)%4)+'"></span>'}
  else if(st==="cur"){el.setAttribute("aria-hidden","true");el.innerHTML=CUR}
  else if(st==="ico")el.innerHTML=ICO(/\.exe$/i.test(s.trim())?"exe":"txt")+"<span>"+esc(s)+"</span>";
  else if(st==="dlg"||st==="dlgs"){
   const L=s.split("\n"),head=L.shift()||"",rest=L.join(" "),art=esc(String(D.artist||"")),P=price();
   const msg='<div class="fx2-db"><i aria-hidden="true"></i><p><b>'+esc(head)+'</b>'+esc(rest)+'</p></div>';
   const one=(c,real)=>'<div class="w95 fx2-dlg '+c+'"'+(real?"":' aria-hidden="true"')+'><div class="w95-t"><span>'+art+' 98</span>'+CTL+'</div>'+msg+'<div class="fx2-dk">'+(real?'<button class="w95-b df fx2-play" type="button">'+PLAY+'<span></span></button>'+(it.link?'<span class="w95-b fx2-go">'+esc(tx("lic").replace("{p}",P))+'</span>':""):'<span class="w95-b df">'+esc(tx("yes"))+'</span>')+'</div></div>';
   el.innerHTML=(st==="dlgs"?one("g g2",0)+one("g g1",0):"")+one("r",1);
   // el botón de play no debe seguir el enlace del elemento (que es el del segundo botón)
   el.querySelector(".fx2-play").addEventListener("click",e=>{e.preventDefault();e.stopPropagation();go()});
  }
  if(it.tp)el.insertAdjacentHTML("beforeend",TAPE);
 });
 syncPlay();
}
function go(){if(EDIT)return;try{play(cur>-1?cur:0)}catch(e){}}

/* ---------- ventanas de Paint: la imagen, pixelada ---------- */
function drawPx(c){
 const b=D&&D.beats&&D.beats[cur>-1?cur:0],live=c.dataset.lv&&b&&b.cover;
 const src=live?si(b.cover):c.dataset.src0,t=c.closest(".fx2-paint").querySelector(".fx2-pt");
 if(t)t.textContent=(live?slug(b.title):slug(String(src).split("/").pop()))+".bmp - Paint";
 if(c.dataset.src===src&&c._base)return;c.dataset.src=src;c._base=null;
 const im=X.imgs[src]||(X.imgs[src]=new Image());
 const paint=()=>{if(c.dataset.src!==src||!c.isConnected)return;
  try{const x=c.getContext("2d",{willReadFrequently:true}),W=c.width,H=c.height,s=Math.max(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,hh=im.naturalHeight*s;
   x.imageSmoothingEnabled=true;x.drawImage(im,(W-w)/2,(H-hh)/2,w,hh);
   const d=x.getImageData(0,0,W,H),p=d.data;
   for(let i=0;i<p.length;i+=4){const m=(p[i]+p[i+1]+p[i+2])/3;for(let k=0;k<3;k++){let v=m+(p[i+k]-m)*1.7;v=(v-128)*1.25+128;p[i+k]=Math.max(0,Math.min(255,Math.round(v/85)*85))}}
   x.putImageData(d,0,0);c._base=d;
  }catch(e){c.style.backgroundImage="url('"+src+"')"}};
 if(im.complete&&im.naturalWidth)paint();else{im.addEventListener("load",paint);if(!im.src)im.src=src}
}
function eqTick(){
 if(document.hidden)return;
 qa(".fx2-px[data-lv]").forEach(c=>{if(!c._base)return;
  try{const x=c.getContext("2d"),H=c.height;x.putImageData(c._base,0,0);
   for(let i=0;i<12;i++){const h=4+((Math.random()*Math.random()*46)|0);x.fillStyle=YEL;x.fillRect(i*8,H-h,7,h);x.fillStyle=RED;x.fillRect(i*8,H-h,7,2)}}catch(e){}});
}
function syncPlay(){
 const on=typeof A!=="undefined"&&!A.paused;
 qa(".fx2-play").forEach(pb=>{pb.classList.toggle("on",on);pb.lastElementChild.textContent=on?tx("pause"):tx("yes")});
 qa(".fx2-px").forEach(drawPx);
 clearInterval(X.eq);X.eq=0;
 const b=D&&D.beats&&D.beats[cur>-1?cur:0];
 if(on&&!RM&&!EDIT){const bpm=Math.max(60,Math.min(220,+(b&&b.bpm)||120));X.eq=setInterval(eqTick,30000/bpm)}
 else qa(".fx2-px").forEach(c=>{if(c._base)try{c.getContext("2d").putImageData(c._base,0,0)}catch(e){}});
}

/* ---------- navegación, titulares, ventanas, filas ---------- */
function cta(){
 qa(".fx2-cta").forEach(e=>e.remove());
 const nr=q(".nav .nr"),t=tx("cta");if(!nr||!t.trim())return;
 const a=document.createElement("a");a.className="fx2-cta w95-b";a.href="#beats";a.textContent=t+" ▶";nr.appendChild(a);
}
function heads(){
 qa("main h2").forEach((h,n)=>{
  if(h.querySelector(".fx2-rw"))return;
  const t=h.textContent.trim();h.setAttribute("aria-label",t);
  h.innerHTML='<span aria-hidden="true">'+ransom(t,"h"+n+t)+'</span>';
 });
}
function wins(){
 qa(".win>.wt").forEach(t=>{
  if(t.nextElementSibling&&t.nextElementSibling.classList.contains("fx2-mb"))return;
  const m=document.createElement("div");m.className="fx2-mb";m.setAttribute("aria-hidden","true");
  m.innerHTML="<span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span>";t.after(m);
 });
}
function rows(){
 qa(".beat").forEach(r=>{
  if(r._fx2)return;r._fx2=1;
  const i=+r.dataset.row,b=D&&D.beats[i];if(!b)return;
  const m=document.createElement("b");m.className="fx2-bpm";m.setAttribute("aria-hidden","true");m.innerHTML=esc(b.bpm)+"<small>BPM</small>";
  const a=r.querySelector(".act");if(a)a.before(m);
 });
}
function bind(){
 if(X.bound)return;X.bound=1;
 if(typeof A!=="undefined")["play","pause","ended"].forEach(ev=>A.addEventListener(ev,syncPlay));
 if("MutationObserver"in window)["#bl","#bl2"].forEach(s=>{const e=q(s);if(e)new MutationObserver(rows).observe(e,{childList:true})});
}

/* ---------- punto de entrada: envolvemos fxInit (lo llama render0() tras cada render) ---------- */
const prev=window.fxInit;
window.fxInit=function(d){
 try{if(prev)prev(d)}catch(e){console.warn("fx:",e)}
 try{
  if(!d||!d.beats||!d.licenses)return;
  body.classList.add("fx2");
  defs();bind();cta();heads();wins();rows();dress();
 }catch(e){console.warn("fx2:",e)}
};
// si data.json llegó antes que este archivo, el primer render ya pasó: nos aplicamos ahora
try{if(typeof D!=="undefined"&&D&&D.beats){if(typeof render==="function")render(D);else window.fxInit(D)}}catch(e){console.warn("fx2:",e)}
})();
