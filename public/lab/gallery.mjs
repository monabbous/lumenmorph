import { initShowcase } from "./showcase.mjs";
import { trackPointer } from "./assets/pointer.mjs";
const root = document.querySelector(".lm-lab");
const hosted = Boolean(document.querySelector("[data-nabous-shell]"));
if (hosted) root.dataset.hosted = "";
const stopLight = hosted ? () => {} : trackPointer(root);
const stopGallery = initShowcase();
window.addEventListener("pagehide", event => { if (!event.persisted) { stopLight(); stopGallery(); } });
