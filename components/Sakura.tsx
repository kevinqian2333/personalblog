"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

export default function Sakura() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * -20,
      duration: 8 + Math.random() * 12,
      size: 8 + Math.random() * 12,
      rotate: Math.random() * 360,
    }));
    setPetals(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      <style>{`
        @keyframes sakuraFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: petal.left,
            top: "-5%",
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animation: `sakuraFall ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="rgba(255,182,193,0.7)" className="w-full h-full">
            <path d="M12 2C12 2 8 6 8 10c0 2.2 1.8 4 4 4s4-1.8 4-4c0-4-4-8-4-8z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
