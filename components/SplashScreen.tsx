"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../siteConfig";

interface StarState {
  width: string;
  height: string;
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState<StarState[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash") === "true";

    if (!hasSeenSplash) {
      setStars(
        Array.from({ length: 30 }).map(() => ({
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        }))
      );
      setShow(true);
      const interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 100 : p + 2));
      }, 30);
      const timer = setTimeout(() => {
        clearInterval(interval);
        exitSplash();
      }, 2500);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      document.documentElement.classList.add("splash-seen");
    }
  }, []);

  const exitSplash = () => {
    setShow(false);
    sessionStorage.setItem("hasSeenSplash", "true");
    setTimeout(() => {
      document.documentElement.classList.add("splash-seen");
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen-container"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-950"
        >
          <div className="fixed inset-0 z-[-1]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950" />
            <div className="absolute inset-0 opacity-30">
              {stars.map((star, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-pulse"
                  style={{
                    width: star.width,
                    height: star.height,
                    left: star.left,
                    top: star.top,
                    backgroundColor: "rgba(129, 140, 248, 0.6)",
                    animationDelay: star.animationDelay,
                    animationDuration: star.animationDuration,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
              className="relative w-28 h-28 mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-md"
              />
              <div className="relative w-full h-full rounded-full p-1.5 bg-slate-900 shadow-2xl">
                <img src={siteConfig.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-3xl font-black text-white mb-3 tracking-wider"
            >
              无敌猫猫拳
              <span className="text-indigo-400 mx-1">の</span>
              幻想乡
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-xs font-bold text-indigo-400 tracking-[0.3em] mb-10"
            >
              INITIALIZING SYSTEM
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-[10px] font-bold text-slate-500 mt-3 tracking-widest"
            >
              {progress}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
