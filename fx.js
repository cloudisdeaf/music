/* =====================================================================
   CloudIsDeaf — fx.js  (v3)
   Capa de mejoras: etiquetas con datos reales, ventanas minimizables,
   progreso en la fila, pulso al BPM, contadores, nombre gigante en el footer...
   NO toca el motor de audio ni data.json: solo ESCUCHA los eventos del <audio> (A)
   y lee los datos (D). Se engancha con una línea al final de render0() en index.html.
   Para desactivar todo: quitar <script src="fx.js"> y <link href="fx.css"> de index.html
   ===================================================================== */
(function(){
"use strict";
if(typeof ED!=="undefined"&&ED)return; // en el editor del admin no hacemos nada

const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const body=document.body;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(RM)body.classList.add("fx-rm");
const X={bound:0,lp:{x:0,y:0,t:0}};
const BEST={en:"BEST VALUE",es:"MEJOR OFERTA",ca:"MILLOR OFERTA",fr:"MEILLEUR CHOIX",de:"BESTE WAHL",ja:"おすすめ"};

/* ---------- datos reales en forma de etiquetas ---------- */
function chipsHTML(d){
 const bp=d.beats.map(b=>+b.bpm).filter(Boolean),mp=Math.min.apply(null,d.licenses.map(l=>+l.price));
 return '<span class="fx-chip">'+d.beats.length+" "+esc(tr("beats"))+"</span>"
  +(bp.length?'<span class="fx-chip">'+Math.min.apply(null,bp)+"–"+Math.max.apply(null,bp)+" BPM</span>":"")
  +(isFinite(mp)?'<span class="fx-chip">'+esc(tr("from {p}").replace("{p}",S+mp))+"</span>":"");
}
function hero(d){
 const host=document.getElementById("c-hero");if(!host)return;
 host.classList.add("fx-host");
 const L=document.createElement("div");L.className="fx-hero";
 L.innerHTML='<div class="fx-chips fx-hch">'+chipsHTML(d)+'</div>';
 host.appendChild(L);
 qa(".fx-chm").forEach(e=>e.remove());
 const h=q("#beats h2");
 if(h){const c=document.createElement("div");c.className="fx-chips fx-chm";c.innerHTML=chipsHTML(d);h.after(c)}
}

/* ---------- nombre gigante dentro del footer ---------- */
function big(d){
 qa(".fx-big").forEach(e=>e.remove());
 const f=q("footer");if(!f)return;
 const b=document.createElement("div");b.className="fx-big";b.setAttribute("aria-hidden","true");
 b.innerHTML="<span>"+esc(String(d.artist||"CloudIsDeaf").toUpperCase())+"</span>";
 f.insertBefore(b,f.firstChild);fit();
}
function fit(){
 const b=q(".fx-big");if(!b||!b.clientWidth)return;const s=b.firstElementChild;if(!s)return;
 b.style.fontSize="100px";const w=s.getBoundingClientRect().width;
 if(w>0)b.style.fontSize=Math.min(260,100*b.clientWidth*.985/w)+"px";
}

/* ---------- pequeños extras ---------- */
function headings(){
 if(RM||!("IntersectionObserver"in window))return;
 const io=X.hio||(X.hio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("fx-in");X.hio.unobserve(e.target)}}),{threshold:.4}));
 qa("main h2").forEach(h=>{if(h._fx)return;h._fx=1;h.classList.add("fx-h2");io.observe(h)});
}
function counts(){
 if(RM||!("IntersectionObserver"in window))return;
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);count(e.target)}),{threshold:.6});
 qa("#ll .price").forEach(p=>io.observe(p));
}
function count(p){
 const m=/^(\D*)(\d+(?:[.,]\d+)?)(\D*)$/.exec(p.textContent);if(!m)return;
 const to=parseFloat(m[2].replace(",",".")),dec=(m[2].split(/[.,]/)[1]||"").length,t0=performance.now();
 (function st(t){const k=Math.min(1,(t-t0)/800),e=1-Math.pow(1-k,3);p.textContent=m[1]+(to*e).toFixed(dec)+m[3];if(k<1)requestAnimationFrame(st);else p.textContent=m[0]})(t0);
}
function best(){const w=BEST[LG]||BEST.en;qa("#ll .lic.best").forEach(e=>e.setAttribute("data-fxbest",w))}
function wins(){
 qa(".wt i").forEach(i=>{const b=i.firstElementChild;if(!b||b._fx)return;b._fx=1;b.setAttribute("role","button");b.setAttribute("tabindex","0");b.setAttribute("aria-label","Minimize")});
}

/* ---------- reproducción: solo escuchamos el <audio>, no lo tocamos ---------- */
function setPlay(on){
 body.classList.toggle("fx-play",on);
 if(on&&D&&D.beats&&D.beats[cur]){
  const b=D.beats[cur],bpm=Math.max(60,Math.min(220,+b.bpm||120));
  body.style.setProperty("--bt",(120/bpm).toFixed(3)+"s");
  document.title="▶ "+b.title+" · "+D.artist;
 }else if(D)document.title=D.artist+" | Type beats for sale";
}
function burst(){
 if(RM)return;
 const o=Date.now()-X.lp.t<1500?X.lp:{x:innerWidth/2,y:innerHeight-70},C=["var(--acc)","var(--fx-red)","var(--ink)","#fff"];
 for(let i=0;i<12;i++){
  const p=document.createElement("i");p.className="fx-pt fx-pt"+(i%4);
  p.style.cssText="left:"+o.x+"px;top:"+o.y+"px;background:"+C[i%4];document.body.appendChild(p);
  const a=Math.PI*2*i/12+Math.random()*.4,r=50+Math.random()*50;
  p.animate([{transform:"translate(-50%,-50%) scale(1) rotate(0deg)",opacity:1},{transform:"translate(calc(-50% + "+Math.cos(a)*r+"px),calc(-50% + "+Math.sin(a)*r+"px)) scale(.2) rotate("+((Math.random()*360)|0)+"deg)",opacity:0}],{duration:650+Math.random()*250,easing:"cubic-bezier(.1,.8,.3,1)"}).onfinish=()=>p.remove();
 }
}

/* ---------- listeners (una sola vez) ---------- */
function bind(){
 if(X.bound)return;X.bound=1;
 const nv=q(".nav");let pg=document.getElementById("fx-prog");
 if(!pg&&nv){pg=document.createElement("i");pg.id="fx-prog";nv.appendChild(pg)}
 const prog=()=>{if(!pg)return;const h=document.documentElement.scrollHeight-innerHeight;pg.style.transform="scaleX("+(h>0?Math.min(1,scrollY/h):0).toFixed(4)+")"};
 addEventListener("scroll",prog,{passive:true});
 addEventListener("resize",()=>{prog();fit()});
 addEventListener("hashchange",()=>setTimeout(()=>{prog();fit()},60));
 prog();
 document.addEventListener("pointerdown",e=>{X.lp={x:e.clientX,y:e.clientY,t:Date.now()}},true);
 // ventanas: el cuadradito izquierdo minimiza / restaura
 const tog=b=>{const w=b.closest(".win");if(w)w.classList.toggle("fx-min")};
 document.addEventListener("click",e=>{const b=e.target.closest(".wt i b:first-child");if(b)tog(b)});
 document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const b=e.target.closest&&e.target.closest(".wt i b:first-child");if(b){e.preventDefault();tog(b)}});
 if(typeof A!=="undefined"){
  A.addEventListener("play",()=>{setPlay(true);burst()});
  A.addEventListener("pause",()=>setPlay(false));
  A.addEventListener("ended",()=>setPlay(false));
  A.addEventListener("timeupdate",()=>{const p=A.duration?A.currentTime/A.duration*100:0;qa(".beat.on").forEach(r=>r.style.setProperty("--pr",p.toFixed(2)))});
 }
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
}

/* ---------- punto de entrada: lo llama render0() tras cada render ---------- */
window.fxInit=function(d){
 try{
  if(!d||!d.beats||!d.licenses)return;
  body.classList.add("fx-on");
  hero(d);big(d);best();wins();headings();counts();bind();
 }catch(e){console.warn("fx:",e)}
};
})();
