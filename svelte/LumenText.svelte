<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { mountLumenText, type TextOptions } from "../js/svg-text.mjs";

  type Props = Omit<SVGAttributes<SVGSVGElement>, "children" | "width" | "height" | "fontSize"> & Omit<TextOptions, "text"> & { text: string };
  let { text, width = 640, height = 120, fontSize = 80, strokeWidth = 2, textProps = {}, label, ...rest }: Props = $props();

  function render(node: SVGSVGElement, options: TextOptions) {
    const controller = mountLumenText(node, options);
    return { update: controller.update, destroy: controller.destroy };
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label ?? text} {...rest} use:render={{ text, width, height, fontSize, strokeWidth, textProps, label }}></svg>
