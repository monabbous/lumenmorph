import { previewDocument, downloadDocument } from "./editor-document.mjs";
import { trackPointer } from "./assets/pointer.mjs";
const root = document.querySelector(".example-studio");
const hosted = Boolean(document.querySelector("[data-nabous-shell]"));
if (hosted) { root.style.setProperty("--lumen-x", "var(--mouse-x, 50vw)"); root.style.setProperty("--lumen-y", "var(--mouse-y, 35vh)"); }
const stopLight = hosted ? () => {} : trackPointer(root);
const controller = new AbortController();
const { signal } = controller;
const editors = Object.fromEntries(["html", "css", "js"].map(language => [language, document.querySelector(`#code-${language}`)]));
const tabs = [...document.querySelectorAll("[data-language]")];
const frame = document.querySelector("#example-preview");
const error = document.querySelector("#preview-error");
const state = document.querySelector("#preview-state");
const status = document.querySelector("#edit-status");
const auto = document.querySelector("#auto-run");
let original, runtime, timer, currentRun, runCount = 0, loaded = false;
const codeEditors = {};
let activeLanguage = "html", formatting = false;
const schedule = () => { status.textContent = auto.checked ? "Updating…" : "Changes pending"; clearTimeout(timer); if (auto.checked) timer = setTimeout(run, 500); };
const formatActive = () => formatLanguage(activeLanguage);
async function formatLanguage(language, silent = false) {
  if (!loaded || formatting) return;
  formatting = true;
  const editor = codeEditors[language] ?? editors[language];
  const before = editor.value;
  if (!silent) status.textContent = "Formatting…";
  try {
    const { formatCode } = await import("./assets/code-formatter.mjs");
    const formatted = await formatCode(before, language);
    if (!signal.aborted && editor.value === before) { if (formatted !== before) editor.value = formatted; if (!silent) status.textContent = "Code formatted"; }
  } catch { if (!silent) status.textContent = "Check syntax before formatting."; }
  finally { formatting = false; }
}
const values = () => Object.fromEntries(Object.entries(editors).map(([key, editor]) => [key, (codeEditors[key] ?? editor).value]));
function run() {
  clearTimeout(timer);
  if (!loaded) return;
  currentRun = String(++runCount);
  error.hidden = true;
  error.textContent = "";
  state.textContent = "Rendering";
  document.querySelector("#preview-poster").hidden = true;
  frame.hidden = false;
  frame.srcdoc = previewDocument(values(), runtime, currentRun);
  status.textContent = "Preview updated";
}
window.addEventListener("message", event => {
  if (event.source !== frame.contentWindow || !event.data?.lumenPreview || event.data.run !== currentRun) return;
  if (event.data.type === "error") { error.textContent = String(event.data.message).slice(0, 2000); error.hidden = false; state.textContent = "Check your code"; }
  else if (event.data.type === "ready" && error.hidden) state.textContent = "Live";
}, { signal });
for (const tab of tabs) {
  const select = () => {
    activeLanguage = tab.dataset.language;
    for (const other of tabs) {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected)); other.tabIndex = selected ? 0 : -1;
      document.querySelector(`#panel-${other.dataset.language}`).hidden = !selected;
    }
    codeEditors[activeLanguage]?.refresh();
  };
  tab.addEventListener("click", select, { signal });
  tab.addEventListener("keydown", event => {
    const index = tabs.indexOf(tab);
    const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
    if (next < 0) return;
    event.preventDefault(); tabs[next].click(); tabs[next].focus();
  }, { signal });
}
for (const editor of Object.values(editors)) {
  editor.addEventListener("input", () => {
    status.textContent = auto.checked ? "Updating…" : "Changes pending";
    clearTimeout(timer); if (auto.checked) timer = setTimeout(run, 500);
  }, { signal });
  editor.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); run(); }
    // Keep Tab available for keyboard navigation out of the editor.
  }, { signal });
}
auto.addEventListener("change", () => { clearTimeout(timer); if (auto.checked) run(); }, { signal });
document.querySelector("#format-code").addEventListener("click", formatActive, { signal });
document.querySelector("#run-code").addEventListener("click", run, { signal });
document.querySelector("#reset-code").addEventListener("click", () => {
  for (const key of Object.keys(editors)) (codeEditors[key] ?? editors[key]).value = original[key];
  run(); status.textContent = "Original restored";
}, { signal });
const shareButton = document.querySelector("#share-example");
const shareOptions = document.querySelector("#share-options");
const shareStatus = document.querySelector("#share-status");
const shareField = document.querySelector("#share-url");
const shareDevice = document.querySelector("#share-device");
const shareUrl = new URL(location.href); shareUrl.hash = ""; shareUrl.search = "";
const shareData = { title: document.title, url: shareUrl.href };
shareField.value = shareData.url;
const encodedUrl = encodeURIComponent(shareData.url);
const encodedTitle = encodeURIComponent(shareData.title);
const shareLinks = {
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`,
  x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
};
for (const link of shareOptions.querySelectorAll("[data-share]")) link.href = shareLinks[link.dataset.share];
shareDevice.hidden = typeof navigator.share !== "function";
function closeSharing(restoreFocus = false) {
  shareOptions.hidden = true;
  shareButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) shareButton.focus();
}
shareButton.addEventListener("click", () => {
  if (!shareOptions.hidden) { closeSharing(); return; }
  shareStatus.textContent = "";
  shareField.hidden = true;
  shareOptions.hidden = false;
  shareButton.setAttribute("aria-expanded", "true");
  shareOptions.querySelector("button:not([hidden])").focus();
}, { signal });
document.addEventListener("click", event => {
  if (!shareOptions.hidden && !event.target.closest(".share-control")) closeSharing();
}, { signal });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !shareOptions.hidden) { event.preventDefault(); closeSharing(true); }
}, { signal });
document.addEventListener("focusin", event => {
  if (!shareOptions.hidden && !event.target.closest(".share-control")) closeSharing();
}, { signal });
shareDevice.addEventListener("click", async () => {
  try { await navigator.share(shareData); closeSharing(true); }
  catch (error) { if (error.name !== "AbortError") shareStatus.textContent = "Sharing unavailable. Choose an option or copy the link."; }
}, { signal });
document.querySelector("#copy-example-link").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(shareData.url); shareStatus.textContent = "Link copied."; }
  catch { shareField.hidden = false; shareField.focus(); shareField.select(); shareStatus.textContent = "Copy this link:"; }
}, { signal });
document.querySelector("#download-example").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([downloadDocument(values(), runtime)], { type: "text/html" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `lumenmorph-${original.id}.html`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}, { signal });
document.querySelector("#codepen-form").addEventListener("submit", () => {
  const source = values();
  document.querySelector("#codepen-data").value = JSON.stringify({ title: `${original.title} · Lumenmorph`, description: original.description, html: source.html, css: runtime.css + "\n" + source.css, js: runtime.js + "\n" + source.js, editors: "111", layout: "left", tags: ["lumenmorph", "glassmorphism"], css_starter: "neither" });
}, { signal });
try {
  [original, runtime] = await Promise.all([new URL("./source.json", location.href), new URL("./editor-runtime.json", import.meta.url)].map(async url => {
    const response = await fetch(url, { signal }); if (!response.ok) throw new Error("Source unavailable"); return response.json();
  }));
  if (!signal.aborted) {
    for (const key of Object.keys(editors)) { editors[key].value = original[key]; editors[key].disabled = false; }
    try {
      const { createCodeEditor } = await import("./assets/code-editor.mjs");
      if (signal.aborted) throw new Error("Editor closed");
      for (const key of Object.keys(editors)) codeEditors[key] = createCodeEditor(editors[key], key, schedule, run, formatActive, () => formatLanguage(key, true));
    } catch { /* Native textareas remain usable if the optional editor cannot load. */ }
    for (const id of ["run-code", "reset-code", "download-example", "open-codepen", "format-code"]) document.getElementById(id).disabled = false;
    loaded = true; run();
  }
} catch { if (!signal.aborted) { state.textContent = "Preview image"; status.textContent = "Could not load the editor. Reload to try again."; } }
window.addEventListener("pagehide", event => { if (!event.persisted) { clearTimeout(timer); controller.abort(); stopLight(); for (const editor of Object.values(codeEditors)) editor.destroy(); } });
