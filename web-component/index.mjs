import { mountLumenText, mountLumenIcon } from "../js/svg-text.mjs";
import { css } from "./styles.mjs";

const sheets = new WeakMap();

/** Explicit registration keeps importing this module safe during server rendering. */
export function defineLumenText(name = "lumen-text") {
  return defineGraphic(name, false);
}

export function defineLumenIcon(name = "lumen-icon") {
  return defineGraphic(name, true);
}

function defineGraphic(name, icon) {
  if (!globalThis.customElements || !globalThis.HTMLElement) throw new Error("Call defineLumenText in a browser.");
  const existing = customElements.get(name);
  if (existing) {
    if (existing.lumenmorph === (icon ? "icon" : "text")) return existing;
    throw new Error(`The custom element ${name} is already registered by another library.`);
  }
  class LumenTextElement extends HTMLElement {
    static lumenmorph = icon ? "icon" : "text";
    static observedAttributes = ["text", "path", "view-box", "width", "height", "font-size", "stroke-width", "font-family", "font-weight", "letter-spacing", "aria-label"];
    #svg;
    #controller;
    #observer;
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      const styles = `${css}\n:host { display: inline-block; max-width: 100%; line-height: 0; } svg { display: block; width: 100%; height: auto; }`;
      if ("adoptedStyleSheets" in shadow && "replaceSync" in CSSStyleSheet.prototype) {
        let sheet = sheets.get(this.ownerDocument);
        if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(styles); sheets.set(this.ownerDocument, sheet); }
        shadow.adoptedStyleSheets = [sheet];
      } else {
        const style = this.ownerDocument.createElement("style"); style.textContent = styles; shadow.append(style);
      }
      this.#svg = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
      shadow.append(this.#svg);
    }
    #options() {
      const number = (name, fallback) => this.hasAttribute(name) ? Number(this.getAttribute(name)) : fallback;
      if (icon) return { paths: this.getAttribute("path") ?? "", viewBox: this.getAttribute("view-box") ?? "0 0 64 64", width: number("width", 128), height: number("height", 128), strokeWidth: number("stroke-width", 2), label: this.getAttribute("aria-label") ?? undefined };
      return {
        text: this.getAttribute("text") ?? this.textContent ?? "", label: this.getAttribute("aria-label") ?? undefined,
        width: number("width", 640), height: number("height", 120), fontSize: number("font-size", 80), strokeWidth: number("stroke-width", 2),
        textProps: Object.fromEntries([ ["font-family", "fontFamily"], ["font-weight", "fontWeight"], ["letter-spacing", "letterSpacing"] ].filter(([name]) => this.hasAttribute(name)).map(([name, key]) => [key, this.getAttribute(name)])),
      };
    }
    connectedCallback() {
      this.#controller = (icon ? mountLumenIcon : mountLumenText)(this.#svg, this.#options());
      this.#observer = new MutationObserver(() => this.#controller?.update(this.#options()));
      this.#observer.observe(this, { childList: true, characterData: true, subtree: true });
    }
    attributeChangedCallback() { this.#controller?.update(this.#options()); }
    disconnectedCallback() { this.#controller?.destroy(); this.#controller = undefined; this.#observer?.disconnect(); }
  }
  customElements.define(name, LumenTextElement);
  return LumenTextElement;
}
