import { mkdir, writeFile, copyFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("public/__slidebox-tests/", root);
await mkdir(output, { recursive: true });
await copyFile(new URL("node_modules/@monabbous/slidebox/experimental/range.mjs", root), new URL("range.mjs", output));
await writeFile(new URL("index.html", output), `<!doctype html><html lang="en"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slidebox glass integration</title>
<link rel="stylesheet" href="../lab/assets/slidebox.css">
<link rel="stylesheet" href="../lab/assets/slidebox-group.css">
<link rel="stylesheet" href="../lab/assets/slidebox-range.css">
<link rel="stylesheet" href="../lab/material-picker.css">
<link rel="stylesheet" href="../lab/assets/preset-highlight.css">
<link rel="stylesheet" href="../lab/assets/lumenmorph-slidebox.css">
<style>
  body { margin:24px; max-width:640px; background:#101b24; color:#e8f6fa; font:16px/1.6 system-ui;
    --slidebox-size:36px; --slidebox-track:#2a5b7c; --slidebox-border:#5289a6;
    --slidebox-off:#e8f6fa; --slidebox-on:#00b2b2; --slidebox-text:#e8f6fa;
    --slidebox-selected-text:#fff; --lumen-glow-color:#00b2b2; }
  label { display:flex; align-items:center; gap:12px; margin:12px 0; }
  .slidebox-group { width:100%; } .slidebox-group > label { margin:0; }
  #group { --slidebox-track:#063c5940; --slidebox-border:#5289a6; --slidebox-size:40px;
    --slidebox-spacing:.1; --slidebox-radius:4px; --slidebox-on:#ffaa71; --lumen-glow-color:#ffaa71; }
  #group > label { font-size:11px; }
  #group > label > span { padding:0 6px; line-height:1.2; }
  .slidebox-range { max-width:100%; } button { margin:16px 0; }
</style></head><body>
<h1>Slidebox glass integration</h1>
<form id="form">
  <label><input id="plain" class="slidebox" type="checkbox" name="plain">Unstyled reference</label>
  <label><input id="glass" class="slidebox lumenmorph-slidebox" type="checkbox" name="glass" value="on">Glass switch</label>
  <label><input id="disabled" class="slidebox lumenmorph-slidebox" type="checkbox" name="disabled" disabled checked>Disabled switch</label>
  <section class="lumenmorph-slidebox" id="scope">
    <div class="slidebox-group" id="group" role="group" aria-label="Period">
      <label><input type="radio" name="period" value="day" checked><span>Day</span></label>
      <label><input type="radio" name="period" value="week"><span>Week</span></label>
      <label><input type="radio" name="period" value="month" disabled><span>Month</span></label>
    </div>
    <label for="range">Intensity</label><input id="range" type="range" class="slidebox-range" name="intensity" min="0" max="100" value="40">
  </section>
  <button type="submit">Save settings</button>
</form>
<section class="lm-lab" style="--lm-accent:#ffaa71">
  <h2>Lumenmorph lab reference</h2>
  <div id="reference-group" class="slidebox-group material-picker" role="group" aria-label="Lab reference">
    <label><input type="radio" name="reference-period" value="day" aria-label="Reference Day" checked><span>Day</span></label>
    <label><input type="radio" name="reference-period" value="week" aria-label="Reference Week"><span>Week</span></label>
    <label><input type="radio" name="reference-period" value="month" aria-label="Reference Month" disabled><span>Month</span></label>
  </div>
</section>
<script type="module">
import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from './range.mjs';
window.startRangeEnhancements=()=>{
  const range=document.querySelector('#range');
  const stopMotion=enhanceSlideboxRange(range), stopFill=enhanceSlideboxRangeFill(range);
  return ()=>{stopMotion();stopFill();};
};
document.querySelector('#form').addEventListener('submit',event=>{
  event.preventDefault();window.submitted=Object.fromEntries(new FormData(event.currentTarget));
});
</script></body></html>`);
console.log("Built the isolated Slidebox integration fixture (not shipped).");
