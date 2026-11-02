import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";
const theme = EditorView.theme({
  "&": { color: "#d4e8df", backgroundColor: "#091d24", height: "100%", fontSize: "12px" },
  ".cm-content": { fontFamily: "ui-monospace, monospace", padding: "18px 0", caretColor: "#ffaa71" },
  ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, monospace", lineHeight: "1.8" },
  ".cm-line": { padding: "0 16px 0 9px" },
  ".cm-gutters": { backgroundColor: "#0b222a", color: "#6e9697", border: "none", paddingLeft: "8px" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#80b9ab0c" },
  "&.cm-focused": { outline: "1px solid #ffaa7160", outlineOffset: "-1px" },
  ".cm-cursor": { borderLeftColor: "#ffaa71" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "#47796970" },
  ".cm-tooltip": { border: "1px solid #72978d80", backgroundColor: "#17353a", borderRadius: "4px", color: "#e9f3ed" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#ffaa7126", color: "#ffd5af" },
  ".cm-matchingBracket": { color: "#fff0cd", backgroundColor: "#ffaa7120" },
}, { dark: true });
const colors = HighlightStyle.define([
  { tag: tags.keyword, color: "#ffaa71" },
  { tag: [tags.tagName, tags.typeName, tags.className], color: "#80d6c2" },
  { tag: [tags.attributeName, tags.propertyName], color: "#d6c4f0" },
  { tag: [tags.string, tags.attributeValue], color: "#b6dca6" },
  { tag: [tags.number, tags.bool, tags.null], color: "#f0c58a" },
  { tag: tags.comment, color: "#789b9c", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "#a2c6ca" },
  { tag: tags.function(tags.variableName), color: "#99d8e6" },
]);
export function createCodeEditor(textarea, language, onChange, onRun, onFormat, onBlur) {
  const mount = document.createElement("div"); mount.className = "code-editor";
  textarea.before(mount); textarea.hidden = true;
  const view = new EditorView({ parent: mount, state: EditorState.create({ doc: textarea.value, extensions: [
    basicSetup, ({ html, css, js: javascript })[language](), theme, syntaxHighlighting(colors),
    EditorView.contentAttributes.of({ "aria-label": `${language.toUpperCase()} code`, spellcheck: "false" }),
    keymap.of([{ key: "Mod-Enter", run: () => { onRun(); return true; } }, { key: "Shift-Alt-f", run: () => { onFormat(); return true; } }]),
    EditorView.updateListener.of(update => { if (update.docChanged) onChange(); }),
  ] }) });
  // Format only after leaving the editor, so typing and autocomplete keep their cursor.
  let blurTimer;
  const handleBlur = () => {
    clearTimeout(blurTimer);
    blurTimer = setTimeout(() => { if (!mount.contains(document.activeElement)) onBlur(); }, 0);
  };
  mount.addEventListener("focusout", handleBlur);
  return {
    get value() { return view.state.doc.toString(); },
    set value(value) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } }); },
    refresh() { view.requestMeasure(); },
    focus() { view.focus(); },
    destroy() { clearTimeout(blurTimer); mount.removeEventListener("focusout", handleBlur); view.destroy(); mount.remove(); },
  };
}
