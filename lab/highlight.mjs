import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import less from "highlight.js/lib/languages/less";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";

for (const [name, grammar] of Object.entries({ css, scss, less, xml, javascript, typescript, bash })) hljs.registerLanguage(name, grammar);

export function highlight(code, language) {
  return hljs.highlight(code, { language, ignoreIllegals: true }).value;
}
