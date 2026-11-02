import { type SVGProps } from "react";
export interface LumenTextProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "fontSize" | "strokeWidth" | "ref"> {
    children: string;
    width?: number;
    height?: number;
    fontSize?: number;
    strokeWidth?: number;
    textProps?: SVGProps<SVGTextElement>;
}
export declare function LumenText({ children, width, height, fontSize, strokeWidth, textProps, className, style, ...props }: LumenTextProps): import("react").JSX.Element;
export interface LumenIconProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "strokeWidth" | "ref"> {
    paths: string | readonly string[];
    width?: number;
    height?: number;
    strokeWidth?: number;
    label?: string;
}
export declare function LumenIcon({ paths, width, height, viewBox, strokeWidth, label, className, style, ...props }: LumenIconProps): import("react").JSX.Element;
