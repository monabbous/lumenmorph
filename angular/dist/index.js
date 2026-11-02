import { Component, ElementRef, Input, inject } from "@angular/core";
import { mountLumenText, mountLumenIcon } from "../../js/svg-text.mjs";
import * as i0 from "@angular/core";
export class LumenTextComponent {
    constructor() {
        this.text = "";
        this.width = 640;
        this.height = 120;
        this.fontSize = 80;
        this.strokeWidth = 2;
        this.textProps = {};
        this.element = inject((ElementRef));
    }
    options() {
        return { text: this.text, width: this.width, height: this.height, fontSize: this.fontSize, strokeWidth: this.strokeWidth, textProps: this.textProps, label: this.label ?? this.text };
    }
    ngAfterViewInit() {
        if (typeof window !== "undefined" && typeof this.element.nativeElement.getScreenCTM === "function") {
            this.controller = mountLumenText(this.element.nativeElement, this.options());
        }
    }
    ngOnChanges() { this.controller?.update(this.options()); }
    ngOnDestroy() { this.controller?.destroy(); }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: LumenTextComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: LumenTextComponent, isStandalone: true, selector: "svg[lumenText]", inputs: { text: "text", width: "width", height: "height", fontSize: "fontSize", strokeWidth: "strokeWidth", textProps: "textProps", label: "label" }, host: { attributes: { "role": "img" }, properties: { "attr.aria-label": "label ?? text", "attr.width": "width", "attr.height": "height", "attr.viewBox": "'0 0 ' + width + ' ' + height" }, classAttribute: "lumenmorph-svg" }, usesOnChanges: true, ngImport: i0, template: "", isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: LumenTextComponent, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { text: [{
                type: Input,
                args: [{ required: true }]
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], fontSize: [{
                type: Input
            }], strokeWidth: [{
                type: Input
            }], textProps: [{
                type: Input
            }], label: [{
                type: Input
            }] } });
export class LumenIconComponent {
    constructor() {
        this.paths = "";
        this.width = 128;
        this.height = 128;
        this.viewBox = "0 0 64 64";
        this.strokeWidth = 2;
        this.element = inject((ElementRef));
    }
    options() { return { paths: this.paths, width: this.width, height: this.height, viewBox: this.viewBox, strokeWidth: this.strokeWidth, label: this.label }; }
    ngAfterViewInit() {
        if (typeof window !== "undefined" && typeof this.element.nativeElement.getScreenCTM === "function")
            this.controller = mountLumenIcon(this.element.nativeElement, this.options());
    }
    ngOnChanges() { this.controller?.update(this.options()); }
    ngOnDestroy() { this.controller?.destroy(); }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: LumenIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: LumenIconComponent, isStandalone: true, selector: "svg[lumenIcon]", inputs: { paths: "paths", width: "width", height: "height", viewBox: "viewBox", strokeWidth: "strokeWidth", label: "label" }, host: { attributes: { "role": "img" }, properties: { "attr.aria-label": "label", "attr.aria-hidden": "label ? null : 'true'", "attr.width": "width", "attr.height": "height", "attr.viewBox": "viewBox" }, classAttribute: "lumenmorph-svg" }, usesOnChanges: true, ngImport: i0, template: "", isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: LumenIconComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "svg[lumenIcon]", standalone: true, template: "",
                    host: { "class": "lumenmorph-svg", "role": "img", "[attr.aria-label]": "label", "[attr.aria-hidden]": "label ? null : 'true'", "[attr.width]": "width", "[attr.height]": "height", "[attr.viewBox]": "viewBox" },
                }]
        }], propDecorators: { paths: [{
                type: Input,
                args: [{ required: true }]
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], viewBox: [{
                type: Input
            }], strokeWidth: [{
                type: Input
            }], label: [{
                type: Input
            }] } });
