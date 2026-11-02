import type { Component } from "svelte";
import type { SVGAttributes } from "svelte/elements";
import type { TextOptions, IconOptions } from "../js/svg-text.mjs";
export type LumenTextProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "width" | "height" | "fontSize"> & Omit<TextOptions, "text"> & { text: string };
export declare const LumenText: Component<LumenTextProps>;
export type LumenIconProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "width" | "height" | "viewBox"> & IconOptions;
export declare const LumenIcon: Component<LumenIconProps>;
export default LumenText;
