// The live star card and runnable export share markup and app layout.
// Published CSS owns all surface, text, and border paint.
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
export const previewDefaults = { bg: "#302028b3", "glow-color": "#ffaa71", "border-glow-color": "#ffd4a3", "glow-size": "460px", "glow-opacity": ".3", "border-opacity": ".9", blur: "32px", saturation: "1.6", radius: "4px", "border-width": "1.5px" };
export const defaultDescription = "Blur the background and catch the pointer light along the edge.";
export function cardMarkup() {
  return `<article class="lumenmorph lumenmorph-border specimen main-card lm-card-demo"><span class="chip">Surface</span><div class="material-icon" aria-hidden="true"><i class="fa-solid fa-asterisk" aria-hidden="true"></i></div><h2>Glass surface</h2><p id="card-description">${defaultDescription}</p><a class="sample-link" href="#code">Get the CSS <span aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span></a></article>`;
}
export const previewLayout = `.lm-card-demo { padding: 22px; min-height: 350px; display: flex; align-items: flex-start; flex-direction: column; color: #e8f6fa; font: 14px/1.6 ui-monospace, monospace; }
.lm-card-demo .chip { font-size: 11px; letter-spacing: .1em; color: #b4cbd5; }
.lm-card-demo .material-icon { font-size: 64px; line-height: 1; margin: 26px 0 24px; color: var(--lumen-glow-color, #ffaa71); }
.lm-card-demo h2 { font-size: 21px; letter-spacing: -.04em; margin: 0 0 10px; }
.lm-card-demo #card-description { font-size: 12px; color: #b4cbd5; margin: 0 0 24px; max-width: 240px; overflow-wrap: anywhere; }
.lm-card-demo .sample-link { margin-top: auto; width: 100%; display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: inherit; text-decoration: none; }
@media (forced-colors: active) { .lm-card-demo, .lm-card-demo :is(.chip, #card-description, .material-icon) { color: CanvasText; } }
`;

export function playgroundDocument({ text = "Lumenmorph", values = {}, tracking = true, smoothing = true } = {}) {
  const lumen = "https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.3.2";
  const theme = { ...previewDefaults, ...values };
  const declarations = Object.keys(previewDefaults).map(key => {
    const value = String(theme[key]);
    if (!/^[#\w.,()% /-]+$/.test(value)) throw new TypeError("Invalid theme value");
    return `      --lumen-${key}: ${value};`;
  }).join("\n");
  return `<!doctype html>
<html lang="en"${smoothing ? ' class="lumenmorph-motion"' : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(text)} — glass preview</title>
  <link rel="stylesheet" href="${lumen}/dist/css/lumenmorph.min.css">
  ${smoothing ? `<link rel="stylesheet" href="${lumen}/dist/css/motion.min.css">` : ""}
  <!-- Optional icons used by this example, not a Lumenmorph dependency. -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <style>
    /* A single inherited theme. The package supplies all material paint. */
    :root {
      color-scheme: dark;
${declarations}
    }
    /* App layout, spacing, and readable foregrounds only. */
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; padding: 24px; background: repeating-linear-gradient(135deg, transparent 0 28px, #a1c7d80c 28px 29px), #152530; color: #e8f6fa; font: 14px/1.6 ui-monospace, monospace; }
    main { width: 100%; max-width: 520px; margin: 24px auto; }
    .text-example { margin-top: 28px; }
    .text-example h2 { font-size: clamp(28px, 6vw, 52px); overflow-wrap: anywhere; }
    a:focus-visible { outline: 2px solid Highlight; outline-offset: 4px; }
    #code { font-size: 11px; margin-top: 28px; }
    #code a { color: inherit; text-underline-offset: 4px; }
    @media (forced-colors: active) { body { background: Canvas; color: CanvasText; } }
${previewLayout}  </style>
</head>
<body>
  <main>
${cardMarkup()}
    <section class="text-example" aria-label="Selectable HTML glass text"><h2 class="lumenmorph-text">${escape(text)}</h2></section>
    <p id="code"><a href="https://github.com/monabbous/lumenmorph/tree/main/docs">Lumenmorph documentation</a></p>
  </main>
  ${tracking ? `<script type="module">
    import { trackPointer } from "${lumen}/js/pointer.mjs";
    // One tracker for the whole page, not one per surface.
    const stop = trackPointer();
    window.addEventListener("pagehide", event => { if (!event.persisted) stop(); });
  </script>` : ""}
</body>
</html>
`;
}
