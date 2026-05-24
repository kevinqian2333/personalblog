"use client";
import { useEffect, useRef } from "react";

export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ripples: Ripple[] = [];
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Ripple {
      x: number;
      y: number;
      r: number;
      opacity: number;
      velocity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = 0;
        this.opacity = 0.45;
        this.velocity = 2;
      }

      update() {
        this.r += this.velocity;
        this.velocity *= 0.94;
        this.opacity -= 0.01;
      }

      draw() {
        if (!ctx || this.opacity <= 0) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    const handleClick = (e: MouseEvent) => {
      ripples.push(new Ripple(e.clientX, e.clientY));
    };

    window.addEventListener("click", handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].draw();
        if (ripples[i].opacity <= 0) ripples.splice(i, 1);
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
}
