<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { mountLumenIcon, type IconOptions } from "../js/svg-text.mjs";
  type Props = Omit<SVGAttributes<SVGSVGElement>, "children" | "width" | "height" | "viewBox"> & IconOptions;
  let { paths, width = 128, height = 128, viewBox = "0 0 64 64", strokeWidth = 2, label, ...rest }: Props = $props();
  function render(node: SVGSVGElement, options: IconOptions) {
    const controller = mountLumenIcon(node, options);
    return { update: controller.update, destroy: controller.destroy };
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} {viewBox} role="img" aria-label={label} aria-hidden={!label || undefined} {...rest} use:render={{ paths, width, height, viewBox, strokeWidth, label }}></svg>
