"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";
import { getSiteConfig } from "../lib/config";
import { siteConfig as defaultConfig } from "../siteConfig";

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const wheelRef = useRef<HTMLDivElement>(null);
  const rawRotation = useMotionValue(0);
  const smoothRotation = useSpring(rawRotation, { stiffness: 200, damping: 25 });
  const inverseRotation = useTransform(smoothRotation, (r) => -r);

  const handlePan = (_event: any, info: PanInfo) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currX = info.point.x;
    const currY = info.point.y;
    const prevX = currX - info.delta.x;
    const prevY = currY - info.delta.y;
    const prevAngle = Math.atan2(prevY - centerY, prevX - centerX);
    const currAngle = Math.atan2(currY - centerY, currX - centerX);
    let deltaAngle = (currAngle - prevAngle) * (180 / Math.PI);
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    rawRotation.set(rawRotation.get() + deltaAngle);
  };

  const dragY = useMotionValue(0);
  const [constraints, setConstraints] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const vh = window.innerHeight;
      setConstraints({
        top: -(vh / 2) + 80,
        bottom: vh / 2 - 80,
      });
    }
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) rawRotation.set(0);
  }, [isMobileMenuOpen, rawRotation]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "首页", href: "/" },
    { name: "项目", href: "/projects" },
    { name: "归档", href: "/timeline" },
    { name: "照片墙", href: "/photowall" },
    { name: "音乐", href: "/music" },
    { name: "友链", href: "/friends" },
    { name: "关于", href: "/about" },
  ];

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector(`[data-active="true"]`) as HTMLElement;
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
        });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname]);

  const mobileNavLinks = navLinks;

  return (
    <>
      <header
        className={`hidden md:block w-full fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div className="w-[90%] max-w-6xl mx-auto h-16 flex items-center justify-between px-4 sm:px-[30px] box-border">
          <Link
            href="/"
            className="text-xl font-black text-slate-800 dark:text-white tracking-tighter hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 relative group"
          >
            {config.navTitle || config.authorName}
            <span className="text-indigo-500 mx-1">{config.navSuffix || "の"}</span>
            {config.navAfter || "幻想乡"}
            <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-indigo-500 rounded-full group-hover:w-full transition-all duration-300"></span>
          </Link>
          <nav ref={navRef as any} className="relative flex gap-1 text-sm font-bold">
            <motion.div
              className="absolute top-0 h-full rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 z-0 pointer-events-none"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname === `${link.href}/`;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive ? "true" : "false"}
                  className={`relative z-10 px-4 py-1.5 rounded-xl transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="md:hidden">
        <motion.button
          drag="y"
          dragConstraints={constraints}
          dragElastic={0.1}
          dragMomentum={false}
          style={{ y: dragY }}
          onClick={() => {
            if (Math.abs(dragY.getVelocity()) < 10) {
              setIsMobileMenuOpen(true);
            }
          }}
          className={`fixed top-1/2 right-0 -translate-y-1/2 w-12 h-28 bg-indigo-500/80 backdrop-blur-xl rounded-l-full shadow-[-5px_0_20px_rgba(99,102,241,0.4)] z-[60] flex items-center justify-center transition-all duration-500 border-y border-l border-white/30 touch-none ${
            isMobileMenuOpen ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
          }`}
        >
          <div className="flex flex-col gap-1.5 items-center justify-center mr-2">
            <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-full"></div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[65]"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] z-[70] pointer-events-none"
              >
                <motion.div
                  ref={wheelRef}
                  style={{ rotate: smoothRotation }}
                  onPan={handlePan}
                  className="w-full h-full rounded-full border border-white/30 dark:border-slate-500/50 bg-white/40 dark:bg-slate-800/50 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] pointer-events-auto relative cursor-grab active:cursor-grabbing"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-slate-300 dark:border-slate-500 flex items-center justify-center shadow-inner z-10">
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg hover:from-red-500 hover:to-pink-600 hover:rotate-90 transition-all duration-300 active:scale-95"
                    >
                      ✕
                    </button>
                  </div>
                  {mobileNavLinks.map((link, index) => {
                    const isActive = pathname === link.href || pathname === `${link.href}/`;
                    const angle = index * (360 / mobileNavLinks.length);
                    return (
                      <div
                        key={link.href}
                        className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7 flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-115px) rotate(${-angle}deg)`,
                        }}
                      >
                        <motion.div style={{ rotate: inverseRotation }} className="w-full h-full">
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-center w-full h-full rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.7)] scale-110"
                                : "bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-md hover:scale-110 hover:shadow-lg border border-white/50 dark:border-slate-600"
                            }`}
                          >
                            <span className="text-[11px] font-black">{link.name}</span>
                          </Link>
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
