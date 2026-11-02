import { createApp, h, ref } from "vue";
import { LumenText } from "../../vue/index.mjs";
const text = ref("Glass");
const app = createApp({ setup: () => () => h(LumenText, { text: text.value, width: 640, height: 120, fontSize: 80 }) });
app.mount("#app");
window.updateText = value => { text.value = value; };
window.dispose = () => app.unmount();
