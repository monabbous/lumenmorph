import { mount, unmount } from "svelte";
import Harness from "./Harness.svelte";
const component = mount(Harness, { target: document.querySelector("#app") });
window.dispose = () => unmount(component);
