var j={"--_lumen-page-x":"var(--lumen-x, 50vw)","--_lumen-page-y":"var(--lumen-y, 35vh)","--_lumen-page-size":"var(--lumen-glow-size, 460px)"};function _(t,e=!1){return{width:"100%",height:"100%",borderRadius:"0",backdropFilter:"none",WebkitBackdropFilter:"none","--lumen-attachment":"scroll","--lumen-space":"100% 100%","--lumen-x":"calc(var(--_lumen-page-x) * var(--_lumen-svg-a, 1) + var(--_lumen-page-y) * var(--_lumen-svg-c, 0) + var(--_lumen-svg-e, 0px))","--lumen-y":"calc(var(--_lumen-page-x) * var(--_lumen-svg-b, 0) + var(--_lumen-page-y) * var(--_lumen-svg-d, 1) + var(--_lumen-svg-f, 0px))","--lumen-glow-size":"calc(var(--_lumen-page-size) * var(--_lumen-svg-radius-scale, 1))","--lumen-bg":t?e?"var(--lumen-icon-outline, var(--lumen-text-outline, #ffffff80))":"var(--lumen-text-outline, #ffffff80)":e?"var(--lumen-icon-fill, var(--lumen-text-fill, #ffffff30))":"var(--lumen-text-fill, #ffffff30)","--lumen-glow-opacity":t?"1":"0.5"}}function $(t){let e=t.ownerDocument.defaultView,n=e.matchMedia("(forced-colors: active)");function l(){let u=t.querySelector(".lumenmorph-svg-fallback");u&&(u.style.display=n.matches?"":"none");for(let p of t.querySelectorAll("foreignObject"))p.style.display=n.matches?"none":""}let c=0;function r(){c=0;let u=t.getScreenCTM();if(!u||Math.abs(u.a*u.d-u.b*u.c)<1e-10)return;let p=u.inverse();for(let v of["a","b","c","d","e","f"])t.style.setProperty(`--_lumen-svg-${v}`,`${p[v]}${v==="e"||v==="f"?"px":""}`);t.style.setProperty("--_lumen-svg-radius-scale",String(Math.hypot(p.a,p.b)))}function o(){c||(c=e.requestAnimationFrame(r))}r(),l(),n.addEventListener("change",l);let a=new e.ResizeObserver(o);a.observe(t),t.parentElement&&a.observe(t.parentElement),e.addEventListener("resize",o),e.addEventListener("scroll",o,!0);let w=()=>{a.disconnect(),n.removeEventListener("change",l),e.removeEventListener("resize",o),e.removeEventListener("scroll",o,!0),c&&e.cancelAnimationFrame(c)};return w.refresh=r,w}function B(t="0 0 64 64"){let e=t.trim().split(/[\s,]+/).map(Number);if(e.length!==4||e.some(n=>!Number.isFinite(n))||e[2]<=0||e[3]<=0)throw new TypeError("viewBox must contain four finite numbers with positive width and height.");return{x:e[0],y:e[1],width:e[2],height:e[3]}}var I="http://www.w3.org/2000/svg",L={fontFamily:"font-family",fontWeight:"font-weight",fontStyle:"font-style",letterSpacing:"letter-spacing",wordSpacing:"word-spacing",textAnchor:"text-anchor",dominantBaseline:"dominant-baseline",x:"x",y:"y",dx:"dx",dy:"dy",direction:"direction",textLength:"textLength",lengthAdjust:"lengthAdjust"};function W(t,e={}){return D(t,e,!1)}function M(t,e){return D(t,e,!0)}function D(t,e,n){let l=t.ownerDocument,c=`lumen-dom-${[...l.defaultView.crypto.getRandomValues(new Uint32Array(2))].map(f=>f.toString(16).padStart(8,"0")).join("")}`,r=(f,b={},h=[])=>{let m=l.createElementNS(I,f);for(let[y,g]of Object.entries(b))m.setAttribute(y,String(g));return m.append(...h),m},o=n?"g":"text",a=[r(o),r(o,{filter:`url(#${c}-ring)`})],w=r(o,{class:"lumenmorph-svg-fallback","aria-hidden":"true",style:"display:none"}),u=r("feMorphology",{in:"SourceGraphic",operator:"dilate",result:"expanded"}),p=r("feMorphology",{in:"SourceGraphic",operator:"erode",result:"contracted"}),v=r("filter",{id:`${c}-ring`,filterUnits:"userSpaceOnUse",x:0,y:0,"color-interpolation-filters":"sRGB"},[u,p,r("feComposite",{in:"expanded",in2:"contracted",operator:"out"})]),A=a.map((f,b)=>r("mask",{id:`${c}-${b}`,maskUnits:"userSpaceOnUse",x:0,y:0},[f])),z=A.map((f,b)=>{let h=l.createElementNS("http://www.w3.org/1999/xhtml","div");h.setAttribute("class","lumenmorph");for(let[m,y]of Object.entries(_(b===1,n))){let g=m.startsWith("--")?m:m.replace(/[A-Z]/g,S=>`-${S.toLowerCase()}`);h.style.setProperty(g,y)}return r("foreignObject",{x:0,y:0,mask:`url(#${f.id})`},[h])});t.classList.add("lumenmorph-svg"),t.replaceChildren(r("defs",{},[v,...A]),r("g",{"aria-hidden":"true"},z),w);let C=[],x={},E;function T(f){x={...x,...f};let{text:b="",width:h=n?128:640,height:m=n?128:120,fontSize:y=80,strokeWidth:g=2,textProps:S={},label:O=n?"":b}=x,k=n?B(x.viewBox):{x:0,y:0,width:h,height:m};for(let[s,i]of Object.entries({width:h,height:m,fontSize:y}))if(!Number.isFinite(i)||i<=0)throw new TypeError(`${s} must be a positive finite number.`);if(!Number.isFinite(g)||g<0)throw new TypeError("strokeWidth must be a non-negative finite number.");for(let[s,i]of Object.entries(j))t.style.setProperty(s,i);for(let[s,i]of Object.entries({width:h,height:m,viewBox:`${k.x} ${k.y} ${k.width} ${k.height}`,role:"img","aria-label":O}))t.setAttribute(s,String(i));n&&!O?t.setAttribute("aria-hidden","true"):n&&t.removeAttribute("aria-hidden");for(let s of[v,...A,...z])for(let[i,d]of Object.entries(k))s.setAttribute(i,String(d));for(let s of[...a,w]){for(let i of C)s.removeAttribute(i);for(let[i,d]of Object.entries({x:"50%",y:"50%","dominant-baseline":"central","text-anchor":"middle","font-size":y,"font-weight":700,fill:"white",stroke:"none"}))s.setAttribute(i,String(d));for(let[i,d]of Object.entries(S))L[i]&&(typeof d=="string"||typeof d=="number")&&s.setAttribute(L[i],String(d));if(n){let i=typeof x.paths=="string"?[x.paths]:x.paths;if(!Array.isArray(i)||i.some(d=>typeof d!="string"))throw new TypeError("paths must be an SVG path string or array of path strings.");s.replaceChildren(...i.map(d=>r("path",{d})))}else s.textContent=b;s===w&&s.setAttribute("fill","CanvasText")}C=Object.keys(S).map(s=>L[s]).filter(Boolean),u.setAttribute("radius",String(g/2)),p.setAttribute("radius",String(g/2)),E?.refresh()}return T(e),E=$(t),{update:T,destroy:E}}var F=`/* A surface needs no wrapper. Add the border class to opt into one pseudo-element. */
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
`;var N=new WeakMap;function G(t="lumen-text"){return V(t,!1)}function P(t="lumen-icon"){return V(t,!0)}function V(t,e){if(!globalThis.customElements||!globalThis.HTMLElement)throw new Error("Call defineLumenText in a browser.");let n=customElements.get(t);if(n){if(n.lumenmorph===(e?"icon":"text"))return n;throw new Error(`The custom element ${t} is already registered by another library.`)}class l extends HTMLElement{static lumenmorph=e?"icon":"text";static observedAttributes=["text","path","view-box","width","height","font-size","stroke-width","font-family","font-weight","letter-spacing","aria-label"];#t;#e;#n;constructor(){super();let r=this.attachShadow({mode:"open"}),o=`${F}
:host { display: inline-block; max-width: 100%; line-height: 0; } svg { display: block; width: 100%; height: auto; }`;if("adoptedStyleSheets"in r&&"replaceSync"in CSSStyleSheet.prototype){let a=N.get(this.ownerDocument);a||(a=new CSSStyleSheet,a.replaceSync(o),N.set(this.ownerDocument,a)),r.adoptedStyleSheets=[a]}else{let a=this.ownerDocument.createElement("style");a.textContent=o,r.append(a)}this.#t=this.ownerDocument.createElementNS("http://www.w3.org/2000/svg","svg"),r.append(this.#t)}#r(){let r=(o,a)=>this.hasAttribute(o)?Number(this.getAttribute(o)):a;return e?{paths:this.getAttribute("path")??"",viewBox:this.getAttribute("view-box")??"0 0 64 64",width:r("width",128),height:r("height",128),strokeWidth:r("stroke-width",2),label:this.getAttribute("aria-label")??void 0}:{text:this.getAttribute("text")??this.textContent??"",label:this.getAttribute("aria-label")??void 0,width:r("width",640),height:r("height",120),fontSize:r("font-size",80),strokeWidth:r("stroke-width",2),textProps:Object.fromEntries([["font-family","fontFamily"],["font-weight","fontWeight"],["letter-spacing","letterSpacing"]].filter(([o])=>this.hasAttribute(o)).map(([o,a])=>[a,this.getAttribute(o)]))}}connectedCallback(){this.#e=(e?M:W)(this.#t,this.#r()),this.#n=new MutationObserver(()=>this.#e?.update(this.#r())),this.#n.observe(this,{childList:!0,characterData:!0,subtree:!0})}attributeChangedCallback(){this.#e?.update(this.#r())}disconnectedCallback(){this.#e?.destroy(),this.#e=void 0,this.#n?.disconnect()}}return customElements.define(t,l),l}function X(t,e){G();let n=document.createElement("lumen-text");for(let[l,c]of Object.entries({text:e.text,width:e.width,height:e.height,"font-size":e.fontSize,"stroke-width":e.strokeWidth,"font-family":"inherit","letter-spacing":-2}))n.setAttribute(l,String(c));return n.style.width="100%",t.append(n),()=>n.remove()}function Y(t,e){P();let n=document.createElement("lumen-icon");for(let[l,c]of Object.entries({path:e.paths,"view-box":e.viewBox,width:e.width,height:e.height,"stroke-width":e.strokeWidth,"aria-label":e.label}))n.setAttribute(l,String(c));return t.append(n),()=>n.remove()}export{X as mountDemo,Y as mountIconDemo};
