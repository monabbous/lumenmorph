var j={"--_lumen-page-x":"var(--lumen-x, 50vw)","--_lumen-page-y":"var(--lumen-y, 35vh)","--_lumen-page-size":"var(--lumen-glow-size, 460px)"},$={"--lumen-x":"0px","--lumen-y":"0px","--_lumen-page-x":"0px","--_lumen-page-y":"0px"};function M(t,e=!1){return{width:"100%",height:"100%",borderRadius:"0",backdropFilter:"none",WebkitBackdropFilter:"none","--lumen-attachment":"scroll","--lumen-space":"100% 100%","--lumen-x":"calc(var(--_lumen-page-x) * var(--_lumen-svg-a, 1) + var(--_lumen-page-y) * var(--_lumen-svg-c, 0) + var(--_lumen-svg-e, 0px))","--lumen-y":"calc(var(--_lumen-page-x) * var(--_lumen-svg-b, 0) + var(--_lumen-page-y) * var(--_lumen-svg-d, 1) + var(--_lumen-svg-f, 0px))","--lumen-glow-size":"calc(var(--_lumen-page-size) * var(--_lumen-svg-radius-scale, 1))","--lumen-bg":t?e?"var(--lumen-icon-outline, var(--lumen-text-outline, #ffffff80))":"var(--lumen-text-outline, #ffffff80)":e?"var(--lumen-icon-fill, var(--lumen-text-fill, #ffffff30))":"var(--lumen-text-fill, #ffffff30)","--lumen-glow-opacity":t?"1":"0.5"}}function B(t){let e=t.ownerDocument.defaultView,n=e.matchMedia("(forced-colors: active)");function l(){let u=t.querySelector(".lumenmorph-svg-fallback");u&&(u.style.display=n.matches?"":"none");for(let b of t.querySelectorAll("foreignObject"))b.style.display=n.matches?"none":""}let c=0;function r(){c=0;let u=t.getScreenCTM();if(!u||Math.abs(u.a*u.d-u.b*u.c)<1e-10)return;let b=u.inverse();for(let v of["a","b","c","d","e","f"])t.style.setProperty(`--_lumen-svg-${v}`,`${b[v]}${v==="e"||v==="f"?"px":""}`);t.style.setProperty("--_lumen-svg-radius-scale",String(Math.hypot(b.a,b.b)))}function o(){c||(c=e.requestAnimationFrame(r))}r(),l(),n.addEventListener("change",l);let a=new e.ResizeObserver(o);a.observe(t),t.parentElement&&a.observe(t.parentElement),e.addEventListener("resize",o),e.addEventListener("scroll",o,!0);let w=()=>{a.disconnect(),n.removeEventListener("change",l),e.removeEventListener("resize",o),e.removeEventListener("scroll",o,!0),c&&e.cancelAnimationFrame(c)};return w.refresh=r,w}function W(t="0 0 64 64"){let e=t.trim().split(/[\s,]+/).map(Number);if(e.length!==4||e.some(n=>!Number.isFinite(n))||e[2]<=0||e[3]<=0)throw new TypeError("viewBox must contain four finite numbers with positive width and height.");return{x:e[0],y:e[1],width:e[2],height:e[3]}}var R="http://www.w3.org/2000/svg",L={fontFamily:"font-family",fontWeight:"font-weight",fontStyle:"font-style",letterSpacing:"letter-spacing",wordSpacing:"word-spacing",textAnchor:"text-anchor",dominantBaseline:"dominant-baseline",x:"x",y:"y",dx:"dx",dy:"dy",direction:"direction",textLength:"textLength",lengthAdjust:"lengthAdjust"};function D(t,e={}){return N(t,e,!1)}function F(t,e){return N(t,e,!0)}function N(t,e,n){let l=t.ownerDocument,c=`lumen-dom-${[...l.defaultView.crypto.getRandomValues(new Uint32Array(2))].map(m=>m.toString(16).padStart(8,"0")).join("")}`,r=(m,h={},p=[])=>{let d=l.createElementNS(R,m);for(let[y,g]of Object.entries(h))d.setAttribute(y,String(g));return d.append(...p),d},o=n?"g":"text",a=[r(o),r(o,{filter:`url(#${c}-ring)`})],w=r(o,{class:"lumenmorph-svg-fallback","aria-hidden":"true",style:"display:none"}),u=r("feMorphology",{in:"SourceGraphic",operator:"dilate",result:"expanded"}),b=r("feMorphology",{in:"SourceGraphic",operator:"erode",result:"contracted"}),v=r("filter",{id:`${c}-ring`,filterUnits:"userSpaceOnUse",x:0,y:0,"color-interpolation-filters":"sRGB"},[u,b,r("feComposite",{in:"expanded",in2:"contracted",operator:"out"})]),A=a.map((m,h)=>r("mask",{id:`${c}-${h}`,maskUnits:"userSpaceOnUse",x:0,y:0,style:"mask-type:alpha"},[m])),z=A.map((m,h)=>{let p=l.createElementNS("http://www.w3.org/1999/xhtml","div");p.setAttribute("class","lumenmorph");for(let[d,y]of Object.entries(M(h===1,n))){let g=d.startsWith("--")?d:d.replace(/[A-Z]/g,S=>`-${S.toLowerCase()}`);p.style.setProperty(g,y)}return r("foreignObject",{x:0,y:0,mask:`url(#${m.id})`},[p])});t.classList.add("lumenmorph-svg");let C=r("defs",{},[v,...A]);for(let[m,h]of Object.entries($))C.style.setProperty(m,h);t.replaceChildren(C,r("g",{"aria-hidden":"true"},z),w);let T=[],x={},E;function O(m){x={...x,...m};let{text:h="",width:p=n?128:640,height:d=n?128:120,fontSize:y=80,strokeWidth:g=2,textProps:S={},label:_=n?"":h}=x,k=n?W(x.viewBox):{x:0,y:0,width:p,height:d};for(let[s,i]of Object.entries({width:p,height:d,fontSize:y}))if(!Number.isFinite(i)||i<=0)throw new TypeError(`${s} must be a positive finite number.`);if(!Number.isFinite(g)||g<0)throw new TypeError("strokeWidth must be a non-negative finite number.");for(let[s,i]of Object.entries(j))t.style.setProperty(s,i);for(let[s,i]of Object.entries({width:p,height:d,viewBox:`${k.x} ${k.y} ${k.width} ${k.height}`,role:"img","aria-label":_}))t.setAttribute(s,String(i));n&&!_?t.setAttribute("aria-hidden","true"):n&&t.removeAttribute("aria-hidden");for(let s of[v,...A,...z])for(let[i,f]of Object.entries(k))s.setAttribute(i,String(f));for(let s of[...a,w]){for(let i of T)s.removeAttribute(i);for(let[i,f]of Object.entries({x:"50%",y:"50%","dominant-baseline":"middle","text-anchor":"middle","font-size":y,"font-weight":700,fill:"white",stroke:"none"}))s.setAttribute(i,String(f));for(let[i,f]of Object.entries(S))L[i]&&(typeof f=="string"||typeof f=="number")&&s.setAttribute(L[i],String(f));if(n){let i=typeof x.paths=="string"?[x.paths]:x.paths;if(!Array.isArray(i)||i.some(f=>typeof f!="string"))throw new TypeError("paths must be an SVG path string or array of path strings.");s.replaceChildren(...i.map(f=>r("path",{d:f})))}else s.textContent=h;s===w&&s.setAttribute("fill","CanvasText")}T=Object.keys(S).map(s=>L[s]).filter(Boolean),u.setAttribute("radius",String(g/2)),b.setAttribute("radius",String(g/2)),E?.refresh()}return O(e),E=B(t),{update:O,destroy:E}}var P=`/* A surface needs no wrapper. Add the border class to opt into one pseudo-element. */
.lumenmorph {
  background-color: var(--lumen-bg, #302028b3);
  border-radius: var(--lumen-radius, 0.25rem);
  -webkit-backdrop-filter: blur(var(--lumen-blur, 32px)) saturate(var(--lumen-saturation, 1.6));
  backdrop-filter: blur(var(--lumen-blur, 32px)) saturate(var(--lumen-saturation, 1.6));
}

.lumenmorph-border {
  position: relative;
  border: var(--lumen-border-width, 1.5px) solid var(--lumen-border-color, #ffffff30);
}

.lumenmorph-border::before {
  content: "";
  position: absolute;
  inset: calc(-1 * var(--lumen-border-width, 1.5px));
  border-radius: inherit;
  padding: var(--lumen-border-width, 1.5px);
  pointer-events: none;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.lumenmorph-text,
.glassmorphism-text {
  color: var(--lumen-text-color, #ffffffb3);
}

@supports (background: color-mix(in srgb, red, transparent)) {
  .lumenmorph {
    background-image: radial-gradient(circle var(--lumen-glow-size, 460px) at var(--lumen-x, 50vw) var(--lumen-y, 35vh), color-mix(in srgb, var(--lumen-glow-color, #ffaa71) calc(var(--lumen-glow-opacity, 0.3) * 100%), transparent), transparent);
    background-attachment: var(--lumen-attachment, fixed);
    background-size: var(--lumen-space, 100vw 100vh);
    background-repeat: no-repeat;
  }

  .lumenmorph-border::before {
    background-image: radial-gradient(circle var(--lumen-glow-size, 460px) at var(--lumen-x, 50vw) var(--lumen-y, 35vh), color-mix(in srgb, var(--lumen-border-glow-color, var(--lumen-glow-color, #ffd4a3)) calc(var(--lumen-border-opacity, 0.9) * 100%), transparent), transparent);
    background-attachment: var(--lumen-attachment, fixed);
    background-size: var(--lumen-space, 100vw 100vh);
    background-repeat: no-repeat;
  }

  @supports (background-clip: text) or (-webkit-background-clip: text) {
    .lumenmorph-text,
    .glassmorphism-text {
      background-color: transparent;
      background-image: radial-gradient(circle at bottom center, color-mix(in srgb, var(--lumen-glow-color, #ffaa71) 10%, transparent), transparent 50%), radial-gradient(circle var(--lumen-text-glow-size, var(--lumen-glow-size, 80vmax)) at var(--lumen-x, 50vw) var(--lumen-y, 35vh), color-mix(in srgb, var(--lumen-glow-color, #ffaa71) calc(var(--lumen-text-glow-opacity, 1) * 100%), transparent), transparent);
      background-attachment: scroll, var(--lumen-attachment, fixed);
      background-size: var(--lumen-space, 100vw 100vh);
      background-position: center center, 0 0;
      background-repeat: no-repeat;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      -webkit-text-stroke: var(--lumen-text-stroke-width, 2px) transparent;
    }
  }
}

@media (prefers-reduced-transparency: reduce) {
  .lumenmorph {
    background: var(--lumen-solid-bg, #302028);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (forced-colors: active) {
  .lumenmorph {
    background: Canvas;
    color: CanvasText;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .lumenmorph-border { border-color: CanvasText; }
  .lumenmorph-border::before { display: none; }
  .lumenmorph-text,
  .glassmorphism-text { background: none; color: CanvasText; -webkit-text-stroke: 0; }
}
`;var G=new WeakMap;function V(t="lumen-text"){return U(t,!1)}function I(t="lumen-icon"){return U(t,!0)}function U(t,e){if(!globalThis.customElements||!globalThis.HTMLElement)throw new Error("Call defineLumenText in a browser.");let n=customElements.get(t);if(n){if(n.lumenmorph===(e?"icon":"text"))return n;throw new Error(`The custom element ${t} is already registered by another library.`)}class l extends HTMLElement{static lumenmorph=e?"icon":"text";static observedAttributes=["text","path","view-box","width","height","font-size","stroke-width","font-family","font-weight","letter-spacing","aria-label"];#t;#e;#n;constructor(){super();let r=this.attachShadow({mode:"open"}),o=`${P}
:host { display: inline-block; max-width: 100%; line-height: 0; } svg { display: block; width: 100%; height: auto; }`;if("adoptedStyleSheets"in r&&"replaceSync"in CSSStyleSheet.prototype){let a=G.get(this.ownerDocument);a||(a=new CSSStyleSheet,a.replaceSync(o),G.set(this.ownerDocument,a)),r.adoptedStyleSheets=[a]}else{let a=this.ownerDocument.createElement("style");a.textContent=o,r.append(a)}this.#t=this.ownerDocument.createElementNS("http://www.w3.org/2000/svg","svg"),r.append(this.#t)}#r(){let r=(o,a)=>this.hasAttribute(o)?Number(this.getAttribute(o)):a;return e?{paths:this.getAttribute("path")??"",viewBox:this.getAttribute("view-box")??"0 0 64 64",width:r("width",128),height:r("height",128),strokeWidth:r("stroke-width",2),label:this.getAttribute("aria-label")??void 0}:{text:this.getAttribute("text")??this.textContent??"",label:this.getAttribute("aria-label")??void 0,width:r("width",640),height:r("height",120),fontSize:r("font-size",80),strokeWidth:r("stroke-width",2),textProps:Object.fromEntries([["font-family","fontFamily"],["font-weight","fontWeight"],["letter-spacing","letterSpacing"]].filter(([o])=>this.hasAttribute(o)).map(([o,a])=>[a,this.getAttribute(o)]))}}connectedCallback(){this.#e=(e?F:D)(this.#t,this.#r()),this.#n=new MutationObserver(()=>this.#e?.update(this.#r())),this.#n.observe(this,{childList:!0,characterData:!0,subtree:!0})}attributeChangedCallback(){this.#e?.update(this.#r())}disconnectedCallback(){this.#e?.destroy(),this.#e=void 0,this.#n?.disconnect()}}return customElements.define(t,l),l}function ee(t,e){V();let n=document.createElement("lumen-text");for(let[l,c]of Object.entries({text:e.text,width:e.width,height:e.height,"font-size":e.fontSize,"stroke-width":e.strokeWidth,"font-family":"inherit","letter-spacing":-2}))n.setAttribute(l,String(c));return n.style.width="100%",t.append(n),()=>n.remove()}function te(t,e){I();let n=document.createElement("lumen-icon");for(let[l,c]of Object.entries({path:e.paths,"view-box":e.viewBox,width:e.width,height:e.height,"stroke-width":e.strokeWidth,"aria-label":e.label}))n.setAttribute(l,String(c));return t.append(n),()=>n.remove()}export{ee as mountDemo,te as mountIconDemo};
