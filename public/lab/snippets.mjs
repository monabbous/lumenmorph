const play = "M18 12Q14 10 14 15v34q0 5 4 3l36-19q4-2 0-4Z";
const block = (title, language, code) => ({ title, language, code });
// Keep CDN examples pinned to the package release.
const cdn = "https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.1.3";

export function installationSnippets(format, { smoothing }) {
  if (format === "cdn") return [block("index.html — inside <head>", "xml", `<link rel="stylesheet" href="${cdn}/dist/css/lumenmorph.min.css">${smoothing ? `\n<link rel="stylesheet" href="${cdn}/dist/css/motion.min.css">` : ""}`)];
  return [block("Terminal — in your project folder", "bash", "npm install @monabbous/lumenmorph")];
}

export function foundationSnippets(format, values, { tracking, smoothing }) {
  const declarations = Object.entries(values).map(([key, value]) => `  --lumen-${key}: ${value};`).join("\n");
  const material = `.material {\n${declarations}\n}`;
  const motion = smoothing ? '@import "@monabbous/lumenmorph/motion";\n' : "";
  const note = smoothing ? '<!-- Add class="lumenmorph-motion" to your <html> once. -->\n' : "";
  const html = `${note}<article class="lumenmorph lumenmorph-border material">\n  <h2 class="lumenmorph-text">Glass &amp; light</h2>\n  Your content\n</article>`;
  const styles = {
    cdn: block("styles.css — link it after Lumenmorph", "css", material),
    css: block("styles.css", "css", `@import "@monabbous/lumenmorph/css";\n${motion}\n${material}`),
    scss: block("styles.scss", "scss", `@use "@monabbous/lumenmorph/scss";\n${smoothing ? '@use "@monabbous/lumenmorph/scss/motion";\n' : ""}\n${material}`),
    less: block("styles.less", "less", `@import "@monabbous/lumenmorph/less/classes";\n${smoothing ? '@import "@monabbous/lumenmorph/less/motion";\n' : ""}\n${material}`),
    tailwind: block("styles.css (Tailwind v4)", "css", `@import "tailwindcss";\n${motion}@plugin "@monabbous/lumenmorph/tailwind";\n/* Include the internal surface rule for optional SVG components too. */\n@source inline("lumenmorph lumenmorph-border lumenmorph-text");\n\n${material}`),
  };
  const blocks = [styles[format], block("HTML", "xml", html)];
  if (tracking) {
    if (format === "cdn") blocks.push(block("index.html — before </body> (optional pointer light)", "xml", `<script type="module">\n  import { trackPointer } from "${cdn}/js/pointer.mjs";\n  const stop = trackPointer();\n  // Call stop() if you remove the effect.\n</script>`));
    else blocks.push(block("pointer.js (browser entry, once per page)", "javascript", `import { trackPointer } from "@monabbous/lumenmorph";\n\nconst stop = trackPointer();\n// Call stop() on unmount. In SSR apps, initialize inside a browser effect.`));
  }
  return blocks;
}

export function componentSnippets(framework) {
  const jsx = `<div className="material">\n      <LumenText width={640} height={120} fontSize={80}>Lumenmorph</LumenText>\n      <LumenIcon paths={play} label="Play" />\n    </div>`;
  const examples = {
    react: [block("Preview.jsx", "javascript", `"use client";\nimport { LumenText, LumenIcon } from "@monabbous/lumenmorph/react";\n\nconst play = "${play}";\n\nexport function Preview() {\n  return ${jsx};\n}`)],
    vue: [block("Preview.vue", "xml", `<script setup>\nimport { LumenText, LumenIcon } from "@monabbous/lumenmorph/vue";\nconst play = "${play}";\n</script>\n\n<template>\n  <div class="material">\n    <LumenText text="Lumenmorph" :width="640" :height="120" :font-size="80" />\n    <LumenIcon :paths="play" label="Play" />\n  </div>\n</template>`)],
    svelte: [block("Preview.svelte", "xml", `<script>\n  import { LumenText, LumenIcon } from "@monabbous/lumenmorph/svelte";\n  const play = "${play}";\n</script>\n\n<div class="material">\n  <LumenText text="Lumenmorph" width={640} height={120} fontSize={80} />\n  <LumenIcon paths={play} label="Play" />\n</div>`)],
    angular: [block("preview.component.ts", "typescript", `import { Component } from "@angular/core";\nimport { LumenTextComponent, LumenIconComponent } from "@monabbous/lumenmorph/angular";\n\n@Component({\n  selector: "app-preview",\n  standalone: true,\n  imports: [LumenTextComponent, LumenIconComponent],\n  template: \`<div class="material">\n    <svg lumenText text="Lumenmorph" [width]="640" [height]="120" [fontSize]="80"></svg>\n    <svg lumenIcon [paths]="play" label="Play"></svg>\n  </div>\`,\n})\nexport class PreviewComponent {\n  readonly play = "${play}";\n}`)],
    "web-component": [
      block("components.js", "javascript", `import { defineLumenText, defineLumenIcon } from "@monabbous/lumenmorph/web-component";\n\ndefineLumenText();\ndefineLumenIcon();`),
      block("HTML", "xml", `<div class="material">\n  <lumen-text text="Lumenmorph" width="640" height="120" font-size="80"></lumen-text>\n  <lumen-icon path="${play}" aria-label="Play"></lumen-icon>\n</div>`),
    ],
  };
  return examples[framework];
}
