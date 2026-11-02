import "@angular/compiler";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { LumenTextComponent } from "@monabbous/lumenmorph/angular";

@Component({
  selector: "lumen-test-app", standalone: true, imports: [LumenTextComponent],
  template: '<svg lumenText [text]="text()" [width]="640" [height]="120" [fontSize]="80"></svg>',
})
class TestApp {
  text = signal("Glass");
  constructor() {
    (window as any).updateText = (value: string) => this.text.set(value);
  }
}
document.querySelector("#app")!.append(document.createElement("lumen-test-app"));
bootstrapApplication(TestApp, { providers: [provideZonelessChangeDetection()] }).then(app => {
  (window as any).dispose = () => app.destroy();
}).catch(error => { throw error; });
