import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { mountLumenText, mountLumenIcon } from "../js/svg-text.mjs";

export const LumenText = defineComponent({
  name: "LumenText",
  props: {
    text: { type: String, required: true }, width: { type: Number, default: 640 },
    height: { type: Number, default: 120 }, fontSize: { type: Number, default: 80 },
    strokeWidth: { type: Number, default: 2 }, textProps: { type: Object, default: () => ({}) },
    label: String,
  },
  setup(props) {
    const svg = ref(null);
    let controller;
    onMounted(() => { controller = mountLumenText(svg.value, props); });
    watch(() => ({ ...props }), value => controller?.update(value), { deep: true, flush: "post" });
    onBeforeUnmount(() => controller?.destroy());
    return () => h("svg", {
      ref: svg, xmlns: "http://www.w3.org/2000/svg", class: "lumenmorph-svg",
      width: props.width, height: props.height, viewBox: `0 0 ${props.width} ${props.height}`,
      role: "img", "aria-label": props.label ?? props.text,
    });
  },
});

export const LumenIcon = defineComponent({
  name: "LumenIcon",
  props: { paths: { type: [String, Array], required: true }, width: { type: Number, default: 128 }, height: { type: Number, default: 128 }, viewBox: { type: String, default: "0 0 64 64" }, strokeWidth: { type: Number, default: 2 }, label: String },
  setup(props) {
    const svg = ref(null);
    let controller;
    onMounted(() => { controller = mountLumenIcon(svg.value, props); });
    watch(() => ({ ...props }), value => controller?.update(value), { deep: true, flush: "post" });
    onBeforeUnmount(() => controller?.destroy());
    return () => h("svg", { ref: svg, xmlns: "http://www.w3.org/2000/svg", class: "lumenmorph-svg", width: props.width, height: props.height, viewBox: props.viewBox, role: "img", "aria-label": props.label, "aria-hidden": !props.label || undefined });
  },
});
