/** Options shared by client-rendered SVG text adapters. */
export interface TextOptions {
  text?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  strokeWidth?: number;
  label?: string;
  textProps?: Partial<Record<"fontFamily" | "fontWeight" | "fontStyle" | "letterSpacing" | "wordSpacing" | "textAnchor" | "dominantBaseline" | "x" | "y" | "dx" | "dy" | "direction" | "textLength" | "lengthAdjust", string | number>>;
}
export interface TextController { update(options: TextOptions): void; destroy(): void; }
export declare function mountLumenText(svg: SVGSVGElement, options?: TextOptions): TextController;
export interface IconOptions {
  paths: string | readonly string[];
  width?: number;
  height?: number;
  viewBox?: string;
  strokeWidth?: number;
  label?: string;
}
export interface IconController { update(options: Partial<IconOptions>): void; destroy(): void; }
export declare function mountLumenIcon(svg: SVGSVGElement, options: IconOptions): IconController;
