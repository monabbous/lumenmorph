import { createApp, h } from "vue";
import { LumenText, LumenIcon } from "../../vue/index.mjs";

export function mountDemo(target, props) {
  const app = createApp({ render: () => h(LumenText, props) });
  app.mount(target);
  return () => app.unmount();
}

export function mountIconDemo(target, props) {
  const app = createApp({ render: () => h(LumenIcon, props) });
  app.mount(target);
  return () => app.unmount();
}
