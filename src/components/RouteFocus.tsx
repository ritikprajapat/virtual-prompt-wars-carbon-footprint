"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Moves keyboard focus to the main content region on client-side navigation so
 * screen-reader and keyboard users are placed at the start of the new page
 * instead of retaining focus on the activated nav link. Skips the initial load
 * (where focus should remain at the document start) and respects an existing
 * `#main-content` element with `tabindex="-1"`.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById("main-content");
    main?.focus();
  }, [pathname]);

  return null;
}
