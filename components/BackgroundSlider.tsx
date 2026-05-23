"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "../siteConfig";

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);

  const getImages = (): string[] => {
    if (typeof window === "undefined") return siteConfig.bgImages;
    const saved = localStorage.getItem("site-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bgImages && Array.isArray(parsed.bgImages) && parsed.bgImages.length > 0) {
          return parsed.bgImages.filter(Boolean);
        }
      } catch {}
    }
    return siteConfig.bgImages;
  };

  const getBlur = (): number => {
    if (typeof window === "undefined") return 8;
    const saved = localStorage.getItem("site-settings");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (typeof p.bgBlur === "number") return p.bgBlur;
      } catch {}
    }
    return 8;
  };

  const images = getImages();
  const blurValue = getBlur();

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-[-10] overflow-hidden">
      {images.map((img, i) => (
        <div
          key={img + i}
          className="absolute inset-0 transition-all duration-[2000ms] ease-in-out transform-gpu"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: `blur(${blurValue}px) brightness(0.4)`,
            transform: "scale(1.1)",
            opacity: i === index ? 1 : 0,
            visibility:
              Math.abs(i - index) <= 1 || (i === images.length - 1 && index === 0) ? "visible" : "hidden",
          }}
        />
      ))}
    </div>
  );
}
