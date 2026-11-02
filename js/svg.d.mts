export declare const svgPageStyle: Record<string, string>;
export declare function svgLayerStyle(outline: boolean, icon?: boolean): Record<string, string>;
export declare function observeSvgGeometry(element: SVGSVGElement): (() => void) & { refresh(): void };
export declare function parseViewBox(value?: string): { x: number; y: number; width: number; height: number };
