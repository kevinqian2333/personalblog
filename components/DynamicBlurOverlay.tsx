"use client";
import { useEffect, useState } from "react";
import { siteConfig } from "../siteConfig";

export default function DynamicBlurOverlay() {
  const [blur, setBlur] = useState(siteConfig.bgBlur ?? 8);

  const readBlur = () => {
    try {
      const saved = localStorage.getItem("site-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.bgBlur === "number") return parsed.bgBlur;
      }
    } catch {}
    return siteConfig.bgBlur ?? 8;
  };

  useEffect(() => {
    setBlur(readBlur());
  }, []);

  useEffect(() => {
    const onStorageChange = () => setBlur(readBlur());

    window.addEventListener("storage", onStorageChange);
    window.addEventListener("site-settings-changed", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("site-settings-changed", onStorageChange);
    };
  }, []);

  const blurPx = blur * 1.5;

  return (
    <div
      className="absolute inset-0 z-[-9] bg-white/25 dark:bg-slate-900/35 transition-all duration-1000"
      style={{
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
      }}
    />
  );
}
