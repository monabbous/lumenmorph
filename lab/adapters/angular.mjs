import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { LumenTextComponent, LumenIconComponent } from "../../angular/dist/index.js";

export async function mountDemo(target, props) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("lumenText", "");
  target.append(svg);
  const app = await bootstrapApplication(LumenTextComponent, { providers: [provideZonelessChangeDetection()] });
  const component = app.components[0];
  for (const [key, value] of Object.entries(props)) component.setInput(key, value);
  component.changeDetectorRef.detectChanges();
  return () => { app.destroy(); svg.remove(); };
}

export async function mountIconDemo(target, props) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("lumenIcon", ""); target.append(svg);
  const app = await bootstrapApplication(LumenIconComponent, { providers: [provideZonelessChangeDetection()] });
  const component = app.components[0];
  for (const [key, value] of Object.entries(props)) component.setInput(key, value);
  component.changeDetectorRef.detectChanges();
  return () => { app.destroy(); svg.remove(); };
}
