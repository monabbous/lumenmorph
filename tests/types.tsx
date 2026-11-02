import { useEffect, useRef } from "react";
import { trackPointer } from "@monabbous/lumenmorph";
import { LumenText, LumenIcon } from "@monabbous/lumenmorph/react";
import { h } from "vue";
import { LumenText as VueLumenText, LumenIcon as VueLumenIcon } from "@monabbous/lumenmorph/vue";
import SvelteLumenText, { LumenIcon as SvelteLumenIcon } from "@monabbous/lumenmorph/svelte";
import { LumenTextComponent, LumenIconComponent } from "@monabbous/lumenmorph/angular";
import { defineLumenText, defineLumenIcon } from "@monabbous/lumenmorph/web-component";

export const vueExample = () => h(VueLumenText, { text: "Glass", width: 640 });
export const vueIconExample = () => h(VueLumenIcon, { paths: "M8 8h48v48H8Z", label: "Square" });
export const svelteComponent = SvelteLumenText;
export const svelteIconComponent = SvelteLumenIcon;
export const angularComponent = LumenTextComponent;
export const angularIconComponent = LumenIconComponent;
export const registerWebComponent = () => defineLumenText();
export const registerWebIconComponent = () => defineLumenIcon();

export function Example() {
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => trackPointer(), []);
  useEffect(() => surface.current ? trackPointer(surface.current, { local: true }) : undefined, []);
  return <div ref={surface}><LumenText width={500} height={100} fontSize={70} textProps={{ fontFamily: "sans-serif" }}>Hello glass</LumenText><LumenIcon paths="M8 8h48v48H8Z" label="Square" /></div>;
}
