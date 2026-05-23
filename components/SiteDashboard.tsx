"use client";

import { siteConfig } from "../siteConfig";
import { useEffect, useState } from "react";

export default function SiteDashboard() {
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const calcUptime = () => {
      const buildDate = new Date(siteConfig.buildDate);
      const now = new Date();
      const diff = now.getTime() - buildDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setUptime(`${days} 天 ${hours} 小时`);
    };
    calcUptime();
    const timer = setInterval(calcUptime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 transition-all duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardItem label="运行时间" value={uptime} />
        <DashboardItem label="技术栈" value="Next.js 16 + React 19" />
        <DashboardItem label="主题" value="磨砂玻璃 · 深空" />
        <DashboardItem label="备案" value={siteConfig.icpConfig.name} link={siteConfig.icpConfig.link} />
      </div>
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/20 dark:border-white/10">
        {siteConfig.footerBadges.map((badge) => (
          <div key={badge.name} className={`flex items-center gap-1.5 text-xs font-bold ${badge.color}`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d={badge.svg} />
            </svg>
            {badge.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardItem({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  const content = (
    <div className="text-center">
      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</div>
    </div>
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
        {content}
      </a>
    );
  }
  return content;
}
