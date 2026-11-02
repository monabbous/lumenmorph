import { useEffect, useRef } from "react";
import { trackPointer } from "@monabbous/lumenmorph";
import { LumenText } from "@monabbous/lumenmorph/react";

export function Example() {
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => trackPointer(), []);
  useEffect(() => surface.current ? trackPointer(surface.current, { local: true }) : undefined, []);
  return <div ref={surface}><LumenText width={500} height={100} fontSize={70} textProps={{ fontFamily: "sans-serif" }}>Hello glass</LumenText></div>;
}
