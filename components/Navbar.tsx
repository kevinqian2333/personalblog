"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";
import { getSiteConfig } from "../lib/config";
import { siteConfig as defaultConfig } from "../siteConfig";

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoverIndicator, setHoverIndicator] = useState({ left: 0, width: 0, active: false });
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const updateActiveIndicator = useCallback(() => {
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
  }, []);

  useEffect(() => {
    updateActiveIndicator();
    window.addEventListener("resize", updateActiveIndicator);
    return () => window.removeEventListener("resize", updateActiveIndicator);
  }, [pathname, updateActiveIndicator]);

  const handleNavHover = useCallback((linkEl: HTMLElement | null, isEnter: boolean) => {
    if (!navRef.current) return;
    if (isEnter && linkEl) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = linkEl.getBoundingClientRect();
      setHoverIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        active: true,
      });
    } else {
      setHoverIndicator((prev) => ({ ...prev, active: false }));
    }
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

  const mobileNavLinks = navLinks;

  return (
    <>
      <header
        className={`hidden md:block w-full fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-[90%] max-w-6xl mx-auto h-16 flex items-center justify-between px-4 sm:px-[30px] box-border">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter relative group flex items-baseline gap-0.5"
          >
            <span className="text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {config.navTitle || config.authorName}
            </span>
            <span className="text-indigo-400 dark:text-indigo-500 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{config.navSuffix || "の"}</span>
            <span className="text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {config.navAfter || "幻想乡"}
            </span>
            <span
              className="absolute -bottom-1 left-0 h-[2px] rounded-full bg-indigo-500/70"
              style={{ width: "var(--underline-width, 0%)", transition: "width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.setProperty("--underline-width", "100%"); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.setProperty("--underline-width", "0%"); }}
            />
          </Link>
          <nav ref={navRef as any} className="relative flex gap-1 text-sm font-bold">
            <motion.div
              className="absolute top-0 h-full rounded-xl bg-indigo-500/8 dark:bg-indigo-400/10 z-0 pointer-events-none"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
            <motion.div
              className="absolute bottom-1.5 h-[2px] rounded-full z-0 pointer-events-none bg-indigo-500/60"
              initial={false}
              animate={{
                left: hoverIndicator.active ? hoverIndicator.left : -100,
                width: hoverIndicator.active ? hoverIndicator.width : 0,
                opacity: hoverIndicator.active ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname === `${link.href}/`;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive ? "true" : "false"}
                  onMouseEnter={(e) => handleNavHover(e.currentTarget, true)}
                  onMouseLeave={() => handleNavHover(null as any, false)}
                  className={`relative z-10 px-4 py-1.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-300 font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-indigo-500/70 transition-all duration-300 ease-out ${
                      isActive ? "w-[60%] opacity-100" : "w-0 opacity-0"
                    }`}
                  />
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
