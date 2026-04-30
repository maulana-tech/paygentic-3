"use client";

import { useEffect } from "react";

export function PageBackground() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-expert-url", "url('/bg-expert.webp')"
    );
  }, []);
  return null;
}
