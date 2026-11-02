import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { LumenText } from "../react/index.mjs";

createRoot(document.querySelector("#header-demo"), { identifierPrefix: "lm-header-" }).render(h(LumenText, {
  width: 800, height: 160, fontSize: 120, strokeWidth: 1.2, "aria-hidden": true,
  textProps: { fontFamily: "inherit", letterSpacing: "-2", fontWeight: 600 },
}, "Lumenmorph"));

createRoot(document.querySelector("#react-demo"), { identifierPrefix: "lm-preview-" }).render(h(LumenText, {
  width: 640, height: 130, fontSize: 88, strokeWidth: 1.5,
  textProps: { fontFamily: "inherit", letterSpacing: "-2" },
}, "Lumenmorph"));
