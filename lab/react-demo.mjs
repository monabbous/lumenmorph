import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { LumenText, LumenIcon } from "../react/index.mjs";

createRoot(document.querySelector("#header-demo"), { identifierPrefix: "lm-header-" }).render(h(LumenText, {
  width: 800, height: 160, fontSize: 120, strokeWidth: 1.2, "aria-hidden": true,
  textProps: { fontFamily: "inherit", letterSpacing: "-2", fontWeight: 600 },
}, "Lumenmorph"));

export function mountDemo(target, { text, ...props }) {
  const root = createRoot(target, { identifierPrefix: "lm-preview-" });
  root.render(h(LumenText, props, text));
  return () => root.unmount();
}

export function mountIconDemo(target, props) {
  const root = createRoot(target, { identifierPrefix: "lm-icon-preview-" });
  root.render(h(LumenIcon, props));
  return () => root.unmount();
}
