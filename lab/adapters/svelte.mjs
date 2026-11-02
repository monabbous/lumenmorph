import { mount, unmount } from "svelte";
import LumenText from "../../svelte/LumenText.svelte";
import LumenIcon from "../../svelte/LumenIcon.svelte";

export function mountDemo(target, props) {
  const component = mount(LumenText, { target, props });
  return () => unmount(component);
}

export function mountIconDemo(target, props) {
  const component = mount(LumenIcon, { target, props });
  return () => unmount(component);
}
