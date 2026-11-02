import type { DefineComponent } from "vue";
import type { TextOptions, IconOptions } from "../js/svg-text.mjs";
export type LumenTextProps = Omit<TextOptions, "text"> & { text: string };
export declare const LumenText: DefineComponent<LumenTextProps>;
export type LumenIconProps = IconOptions;
export declare const LumenIcon: DefineComponent<LumenIconProps>;
