"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { siteConfig as defaultConfig } from "../siteConfig";
import { getSiteConfig } from "../lib/config";

export default function ProfileCard({
  postCount,
  chatterCount,
  photoCount,
}: {
  postCount: number;
  chatterCount: number;
  photoCount: number;
}) {
  const router = useRouter();
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = ((y - centerY) / centerY) * -6;
    const rotateYVal = ((x - centerX) / centerX) * 6;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    setGlowX((x / rect.width) * 100);
    setGlowY((y / rect.height) * 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => router.push("/about")}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group glass-card-elevated rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full min-h-[220px] md:min-h-[280px] transition-shadow duration-300 hover-glow"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out, box-shadow 0.4s ease",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4 md:gap-6 w-full">
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "conic-gradient(from 0deg, #818cf8, #a78bfa, #e879f9, #818cf8)",
                filter: "blur(4px)",
              }}
            />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg transition-transform duration-500 group-hover:scale-105">
              <img
                src={config.avatarUrl}
                alt="avatar"
                className="w-full h-full rounded-lg md:rounded-xl object-cover bg-white"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 pb-1 leading-snug tracking-wider transition-colors duration-700 truncate">
              {config.authorName}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md transition-colors duration-700 line-clamp-2 md:line-clamp-none">
              {config.bio}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-end justify-between mt-6 md:mt-8 gap-5 md:gap-6 relative z-10">
        <div className="flex gap-2 sm:gap-6 w-full md:w-auto justify-between sm:justify-around md:justify-start px-2 sm:px-0">
          <StatItem count={postCount} label="文章" color="text-indigo-600 dark:text-indigo-400" />
          <StatItem count={chatterCount} label="杂谈" color="text-purple-600 dark:text-purple-400" />
          <StatItem count={photoCount} label="照片" color="text-pink-600 dark:text-pink-400" />
        </div>

        <div className="flex gap-2 md:gap-3 flex-wrap justify-center md:justify-end w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
          <SocialBtn type="github" url={config.social?.github} />
          <SocialBtn type="email" onClick={() => copyToClipboard(config.social?.email || "")} />
          <SocialBtn type="qq" onClick={() => copyToClipboard(config.social?.qq || "")} />
          <SocialBtn type="wechat" onClick={() => copyToClipboard(config.social?.wechat || "")} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -2 }}
      className="text-center group/stat px-2 cursor-default"
    >
      <motion.div
        className={`text-xl md:text-2xl font-black ${color} transition-all duration-300`}
      >
        {count}
      </motion.div>
      <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 transition-colors group-hover/stat:text-indigo-500">
        {label}
      </div>
    </motion.div>
  );
}

function SocialBtn({ type, url, onClick }: { type: string; url?: string; onClick?: () => void }) {
  const [ripple, setRipple] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    onClick?.();
  };

  const getIcon = () => {
    switch (type) {
      case "github":
        return (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        );
      case "email":
        return (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "qq":
        return (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-4.418 0-8 3.582-8 8 0 1.25.289 2.433.805 3.49-1.024 1.708-1.53 3.843-1.021 5.308.203.585.806.84 1.341.57.828-.418 1.625-1.025 2.296-1.722 1.335.539 2.862.854 4.579.854 1.716 0 3.243-.315 4.578-.854.671.697 1.468 1.304 2.296 1.722.535.27 1.138.015 1.341-.57.509-1.465.003-3.6-1.021-5.308C19.71 12.433 20 11.25 20 10c0-4.418-3.582-8-8-8z" />
          </svg>
        );
      case "wechat":
        return (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5 13.5c-3.59 0-6.5-2.42-6.5-5.4 0-2.98 2.91-5.4 6.5-5.4s6.5 2.42 6.5 5.4c0 2.98-2.91 5.4-6.5 5.4zm7.5 7.8c-2.76 0-5-2.02-5-4.5 0-2.48 2.24-4.5 5-4.5s5 2.02 5 4.5c0 2.48-2.24 4.5-5 4.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const btnContent = (
    <motion.div
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/50 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white transition-colors duration-300 border border-white/40 dark:border-white/10 shadow-sm overflow-hidden group/btn"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">{getIcon()}</span>
      {ripple && (
        <span className="absolute inset-0 bg-white/30 rounded-xl animate-ping" />
      )}
    </motion.div>
  );

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {btnContent}
    </a>
  ) : (
    btnContent
  );
}
