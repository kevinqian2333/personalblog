"use client";

import Link from "next/link";
import { siteConfig } from "../siteConfig";

export default function LatestChatterCarousel({ chatters }: { chatters: any[] }) {
  if (!chatters || chatters.length === 0) {
    return (
      <div className="h-full w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 flex flex-col items-center justify-center transition-all duration-700">
        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {siteConfig.chatterTitle}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          暂无记录
        </span>
      </div>
    );
  }
  return null;
}
