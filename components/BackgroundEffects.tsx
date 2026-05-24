"use client";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import Fireflies from "./Fireflies";
import Sakura from "./Sakura";
import WindyGrass from "./WindyGrass";

export default function BackgroundEffects() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className={`transition-opacity duration-1000 ${isDark ? "opacity-100" : "opacity-0"}`}>
        <Fireflies />
      </div>
      <div className={`transition-opacity duration-1000 ${isDark ? "opacity-0" : "opacity-100"}`}>
        <Sakura />
      </div>
      <WindyGrass />
      <FloatingParticles />
    </>
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number }>>([]);

  useEffect(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }
    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-400/20 dark:bg-indigo-300/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
