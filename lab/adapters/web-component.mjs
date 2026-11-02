import { defineLumenText, defineLumenIcon } from "../../web-component/index.mjs";

export function mountDemo(target, props) {
  defineLumenText();
  const element = document.createElement("lumen-text");
  for (const [name, value] of Object.entries({ text: props.text, width: props.width, height: props.height, "font-size": props.fontSize, "stroke-width": props.strokeWidth, "font-family": "inherit", "letter-spacing": -2 })) element.setAttribute(name, String(value));
  element.style.width = "100%";
  target.append(element);
  return () => element.remove();
}

export function mountIconDemo(target, props) {
  defineLumenIcon();
  const element = document.createElement("lumen-icon");
  for (const [name, value] of Object.entries({ path: props.paths, "view-box": props.viewBox, width: props.width, height: props.height, "stroke-width": props.strokeWidth, "aria-label": props.label })) element.setAttribute(name, String(value));
  target.append(element);
  return () => element.remove();
}
