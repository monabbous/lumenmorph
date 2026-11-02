"use client";

import { useEffect, useId, useRef, type CSSProperties, type SVGProps } from "react";
import { observeSvgGeometry, parseViewBox, svgPageStyle, svgMaskStyle, svgLayerStyle } from "../../js/svg.mjs";

export interface LumenTextProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "fontSize" | "strokeWidth" | "ref"> {
  children: string;
  width?: number;
  height?: number;
  fontSize?: number;
  strokeWidth?: number;
  textProps?: SVGProps<SVGTextElement>;
}

export function LumenText({ children, width = 640, height = 120, fontSize = 80, strokeWidth = 2, textProps = {}, className = "", style, ...props }: LumenTextProps) {
  const id = `lumen-${useId().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => svg.current ? observeSvgGeometry(svg.current) : undefined, [width, height]);

  const text = (outline = false, fallback = false) => <text
    x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={fontSize} fontWeight={700}
    {...textProps} fill={fallback ? "CanvasText" : "white"} stroke="none"
    filter={outline ? `url(#${id}-ring)` : undefined}
    className={fallback ? "lumenmorph-svg-fallback" : undefined}
    style={fallback ? { display: "none" } : textProps.style}
    aria-hidden={fallback || undefined}
  >{children}</text>;

  const layer = (outline: boolean) => <foreignObject x={0} y={0} width={width} height={height} mask={`url(#${id}-${outline ? "outline" : "fill"})`}>
    <div className="lumenmorph" style={svgLayerStyle(outline) as CSSProperties} />
  </foreignObject>;

  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
    role="img" aria-label={props["aria-label"] ?? children} {...props} ref={svg}
    className={`lumenmorph-svg ${className}`.trim()} style={{ ...svgPageStyle, ...style }}>
    <defs style={svgMaskStyle as CSSProperties}>
      <filter id={`${id}-ring`} filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height} colorInterpolationFilters="sRGB">
        <feMorphology in="SourceGraphic" operator="dilate" radius={Math.max(0, strokeWidth) / 2} result="expanded" />
        <feMorphology in="SourceGraphic" operator="erode" radius={Math.max(0, strokeWidth) / 2} result="contracted" />
        <feComposite in="expanded" in2="contracted" operator="out" />
      </filter>
      <mask id={`${id}-fill`} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height} style={{ maskType: "alpha" }}>{text()}</mask>
      <mask id={`${id}-outline`} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height} style={{ maskType: "alpha" }}>{text(true)}</mask>
    </defs>
    <g aria-hidden="true">{layer(false)}{layer(true)}</g>
    {text(false, true)}
  </svg>;
}

export interface LumenIconProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "strokeWidth" | "ref"> {
  paths: string | readonly string[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  label?: string;
}

export function LumenIcon({ paths, width = 128, height = 128, viewBox = "0 0 64 64", strokeWidth = 2, label, className = "", style, ...props }: LumenIconProps) {
  const id = `lumen-icon-${useId().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const svg = useRef<SVGSVGElement>(null);
  const bounds = parseViewBox(viewBox);
  const accessibleLabel = label ?? props["aria-label"];
  useEffect(() => svg.current ? observeSvgGeometry(svg.current) : undefined, [width, height, viewBox]);
  const data = typeof paths === "string" ? [paths] : paths;
  if (!Array.isArray(data) || data.some(path => typeof path !== "string")) throw new TypeError("paths must be an SVG path string or array of path strings.");
  const shape = (extra: SVGProps<SVGGElement> = {}) => <g fill="white" stroke="none" {...extra}>{data.map((d, key) => <path key={key} d={d} />)}</g>;
  const layer = (outline: boolean) => <foreignObject {...bounds} mask={`url(#${id}-${outline ? "outline" : "fill"})`}>
    <div className="lumenmorph" style={svgLayerStyle(outline, true) as CSSProperties} />
  </foreignObject>;

  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={viewBox} role="img"
    aria-label={accessibleLabel} aria-hidden={!accessibleLabel || undefined} {...props} ref={svg}
    className={`lumenmorph-svg ${className}`.trim()} style={{ ...svgPageStyle, ...style }}>
    <defs style={svgMaskStyle as CSSProperties}>
      <filter id={`${id}-ring`} filterUnits="userSpaceOnUse" {...bounds} colorInterpolationFilters="sRGB">
        <feMorphology in="SourceGraphic" operator="dilate" radius={Math.max(0, strokeWidth) / 2} result="expanded" />
        <feMorphology in="SourceGraphic" operator="erode" radius={Math.max(0, strokeWidth) / 2} result="contracted" />
        <feComposite in="expanded" in2="contracted" operator="out" />
      </filter>
      <mask id={`${id}-fill`} maskUnits="userSpaceOnUse" {...bounds} style={{ maskType: "alpha" }}>{shape()}</mask>
      <mask id={`${id}-outline`} maskUnits="userSpaceOnUse" {...bounds} style={{ maskType: "alpha" }}>{shape({ filter: `url(#${id}-ring)` })}</mask>
    </defs>
    <g aria-hidden="true">{layer(false)}{layer(true)}</g>
    {shape({ className: "lumenmorph-svg-fallback", fill: "CanvasText", "aria-hidden": true, style: { display: "none" } })}
  </svg>;
}
