import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, inject } from "@angular/core";
import { mountLumenText, mountLumenIcon, type TextController, type TextOptions, type IconController, type IconOptions } from "../../js/svg-text.mjs";

@Component({
  selector: "svg[lumenText]",
  standalone: true,
  template: "",
  host: {
    "class": "lumenmorph-svg",
    "role": "img",
    "[attr.aria-label]": "label ?? text",
    "[attr.width]": "width",
    "[attr.height]": "height",
    "[attr.viewBox]": "'0 0 ' + width + ' ' + height",
  },
})
export class LumenTextComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) text = "";
  @Input() width = 640;
  @Input() height = 120;
  @Input() fontSize = 80;
  @Input() strokeWidth = 2;
  @Input() textProps: TextOptions["textProps"] = {};
  @Input() label?: string;
  private readonly element = inject(ElementRef<SVGSVGElement>);
  private controller?: TextController;
  private options(): TextOptions {
    return { text: this.text, width: this.width, height: this.height, fontSize: this.fontSize, strokeWidth: this.strokeWidth, textProps: this.textProps, label: this.label ?? this.text };
  }
  ngAfterViewInit() {
    if (typeof window !== "undefined" && typeof this.element.nativeElement.getScreenCTM === "function") {
      this.controller = mountLumenText(this.element.nativeElement, this.options());
    }
  }
  ngOnChanges() { this.controller?.update(this.options()); }
  ngOnDestroy() { this.controller?.destroy(); }
}

@Component({
  selector: "svg[lumenIcon]", standalone: true, template: "",
  host: { "class": "lumenmorph-svg", "role": "img", "[attr.aria-label]": "label", "[attr.aria-hidden]": "label ? null : 'true'", "[attr.width]": "width", "[attr.height]": "height", "[attr.viewBox]": "viewBox" },
})
export class LumenIconComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) paths: string | readonly string[] = "";
  @Input() width = 128;
  @Input() height = 128;
  @Input() viewBox = "0 0 64 64";
  @Input() strokeWidth = 2;
  @Input() label?: string;
  private readonly element = inject(ElementRef<SVGSVGElement>);
  private controller?: IconController;
  private options(): IconOptions { return { paths: this.paths, width: this.width, height: this.height, viewBox: this.viewBox, strokeWidth: this.strokeWidth, label: this.label }; }
  ngAfterViewInit() {
    if (typeof window !== "undefined" && typeof this.element.nativeElement.getScreenCTM === "function") this.controller = mountLumenIcon(this.element.nativeElement, this.options());
  }
  ngOnChanges() { this.controller?.update(this.options()); }
  ngOnDestroy() { this.controller?.destroy(); }
}
