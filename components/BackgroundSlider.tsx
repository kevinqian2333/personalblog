"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "../siteConfig";

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState(siteConfig.bgImages);
  const [blurValue, setBlurValue] = useState(siteConfig.bgBlur ?? 8);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let imgs = siteConfig.bgImages;
    let blur = siteConfig.bgBlur ?? 8;
    try {
      const saved = localStorage.getItem("site-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bgImages && Array.isArray(parsed.bgImages) && parsed.bgImages.length > 0) {
          imgs = parsed.bgImages.filter(Boolean);
        }
        if (typeof parsed.bgBlur === "number") {
          blur = parsed.bgBlur;
        }
      }
    } catch {}
    setImages(imgs);
    setBlurValue(blur);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

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
            visibility: Math.abs(i - index) <= 1 || (i === images.length - 1 && index === 0) ? "visible" : ("hidden" as any),
          }}
        />
      ))}
    </div>
  );
}
