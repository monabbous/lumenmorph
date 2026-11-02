import { defineLumenText } from "../../web-component/index.mjs";
defineLumenText();
defineLumenText(); // Repeated registration is harmless for this component.
const element = document.createElement("lumen-text");
element.setAttribute("text", "Glass");
document.querySelector("#app").append(element);
window.updateText = value => element.setAttribute("text", value);
window.dispose = () => element.remove();
window.reconnect = () => document.querySelector("#app").append(element);
