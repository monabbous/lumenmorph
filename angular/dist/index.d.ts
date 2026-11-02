import { AfterViewInit, OnChanges, OnDestroy } from "@angular/core";
import { type TextOptions } from "../../js/svg-text.mjs";
import * as i0 from "@angular/core";
export declare class LumenTextComponent implements AfterViewInit, OnChanges, OnDestroy {
    text: string;
    width: number;
    height: number;
    fontSize: number;
    strokeWidth: number;
    textProps: TextOptions["textProps"];
    label?: string;
    private readonly element;
    private controller?;
    private options;
    ngAfterViewInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LumenTextComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LumenTextComponent, "svg[lumenText]", never, { "text": { "alias": "text"; "required": true; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "fontSize": { "alias": "fontSize"; "required": false; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; }; "textProps": { "alias": "textProps"; "required": false; }; "label": { "alias": "label"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class LumenIconComponent implements AfterViewInit, OnChanges, OnDestroy {
    paths: string | readonly string[];
    width: number;
    height: number;
    viewBox: string;
    strokeWidth: number;
    label?: string;
    private readonly element;
    private controller?;
    private options;
    ngAfterViewInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LumenIconComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LumenIconComponent, "svg[lumenIcon]", never, { "paths": { "alias": "paths"; "required": true; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "viewBox": { "alias": "viewBox"; "required": false; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; }; "label": { "alias": "label"; "required": false; }; }, {}, never, never, true, never>;
}
