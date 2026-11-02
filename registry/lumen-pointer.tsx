"use client";

import { useEffect } from "react";
import { trackPointer } from "@monabbous/lumenmorph";

/** Mount once in your app layout. Cards and buttons remain usable without it. */
export function LumenPointer({ smooth = true }: { smooth?: boolean }) {
  useEffect(() => {
    const owner = document.documentElement;
    const hadMotion = owner.classList.contains("lumenmorph-motion");
    if (smooth && !hadMotion) owner.classList.add("lumenmorph-motion");
    const stop = trackPointer(owner);
    return () => {
      stop();
      if (smooth && !hadMotion) owner.classList.remove("lumenmorph-motion");
    };
  }, [smooth]);
  return null;
}
