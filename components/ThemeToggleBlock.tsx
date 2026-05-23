"use client";

import { siteConfig } from "../siteConfig";

export default function ThemeToggleBlock() {
  return (
    <div className="h-full w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex flex-col items-center justify-center transition-all duration-700 hover:scale-[1.02]">
      <div className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2">快速导航</div>
      <div className="grid grid-cols-2 gap-2 w-full">
        <NavBtn label="GitHub" href={siteConfig.social.github} color="bg-slate-700 hover:bg-slate-900" />
        <NavBtn label="邮箱" href={`mailto:${siteConfig.social.email}`} color="bg-indigo-500 hover:bg-indigo-700" />
        <NavBtn label="友链" href="/friends" color="bg-purple-500 hover:bg-purple-700" />
        <NavBtn label="关于" href="/about" color="bg-pink-500 hover:bg-pink-700" />
      </div>
    </div>
  );
}

function NavBtn({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`${color} text-white text-xs font-bold py-2 px-3 rounded-xl text-center transition-all duration-300 hover:scale-105 shadow-md`}
    >
      {label}
    </a>
  );
}
