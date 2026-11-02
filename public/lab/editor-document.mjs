// User-edited code runs only in an opaque-origin sandbox, with no network access.
const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
const scriptSafe = value => value.replace(/<\/script/gi, "<\\/script");
const styleSafe = value => value.replace(/<\/style/gi, "<\\/style");
export function previewDocument(source, runtime, run = "") {
  const bridge = `const run=${JSON.stringify(run)}; const report=(type,message)=>parent.postMessage({lumenPreview:true,run,type,message:String(message).slice(0,2000)},'*'); addEventListener('error',e=>report('error',e.message)); addEventListener('unhandledrejection',e=>report('error',e.reason?.message || e.reason)); addEventListener('DOMContentLoaded',()=>report('ready',''));`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>${styleSafe(runtime.css + "\n" + source.css)}</style><script>${bridge}</script></head><body>${source.html}<script>${scriptSafe(runtime.js)}</script><script type="module">${scriptSafe(source.js)}</script></body></html>`;
}
export function downloadDocument(source, runtime) {
  return previewDocument(source, runtime).replace(/<script>const run=[\s\S]*?<\/script>/, "");
}
