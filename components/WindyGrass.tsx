"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface GrassBlade {
  left: string;
  height: string;
  background: string;
  swayDuration: string;
  swayDelay: string;
  waveDuration: string;
  waveDelay: string;
}

export default function WindyGrass() {
  const { isDark } = useTheme();
  const [blades, setBlades] = useState<GrassBlade[]>([]);

  useEffect(() => {
    const generated: GrassBlade[] = [...Array(20)].map((_, i) => {
      const colorValue = 0.1 + Math.random() * 0.15;
      return {
        left: `${i * 5 + Math.random() * 3}%`,
        height: `${20 + Math.random() * 40}px`,
        background: isDark
          ? `rgba(99, 102, 241, ${colorValue})`
          : `rgba(34, 197, 94, ${colorValue})`,
        swayDuration: `${2 + Math.random() * 3}s`,
        swayDelay: `${Math.random() * -3}s`,
        waveDuration: `${1.5 + Math.random() * 2}s`,
        waveDelay: `${Math.random() * -2}s`,
      };
    });
    setBlades(generated);
  }, [isDark]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-10 overflow-hidden">
      <style>{`
        @keyframes grassSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes grassWave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
      {blades.map((blade, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: blade.left,
            animation: `grassSway ${blade.swayDuration} ease-in-out infinite`,
            animationDelay: blade.swayDelay,
          }}
        >
          <div
            className="w-0.5 rounded-full origin-bottom"
            style={{
              height: blade.height,
              background: blade.background,
              animation: `grassWave ${blade.waveDuration} ease-in-out infinite`,
              animationDelay: blade.waveDelay,
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
