import type { SVGProps, ReactElement } from "react";
export interface LumenTextProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "fontSize"> {
  children: string;
  width?: number;
  height?: number;
  fontSize?: number;
  strokeWidth?: number;
  textProps?: SVGProps<SVGTextElement>;
}
export declare function LumenText(props: LumenTextProps): ReactElement;
