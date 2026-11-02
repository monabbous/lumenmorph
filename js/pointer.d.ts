export interface PointerOptions {
  /** Local coordinates for one surface; otherwise share viewport coordinates with descendants. */
  local?: boolean;
  /** Include touch pointers. Default: false. Does not prevent scrolling. */
  touch?: boolean;
  /** Respect prefers-reduced-motion. Default: true. */
  reducedMotion?: boolean;
}
/** Call in a browser effect, not during server rendering. Returns an idempotent cleanup. */
export declare function trackPointer(target?: HTMLElement, options?: PointerOptions): () => void;
