"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  const activeTheme = mounted ? theme : "light";

  return (
    <button
      type="button"
      aria-label={`Switch to ${activeTheme === "light" ? "dark" : "light"} mode`}
      aria-pressed={activeTheme === "dark"}
      onClick={toggleTheme}
      className="focus-ring top-nav-shell group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-text-main transition-transform duration-200 hover:scale-105"
    >
      {activeTheme === "light" ? (
        <svg className="theme-icon-enter h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3c0 .34.02.67.06 1A7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg className="theme-icon-enter h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25M12 18.75V21m9-9h-2.25M5.25 12H3m15.114 6.364-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0-1.591 1.591M7.477 16.523l-1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )}
    </button>
  );
}
