"use client";

import { useMusic } from "./MusicProvider";

export default function LyricBar() {
  const { currentLyric, isPlaying } = useMusic();

  return (
    <div className="w-full rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-md border border-white/30 dark:border-white/10 px-4 py-2.5 transition-all duration-700">
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-0.5 ${isPlaying ? "opacity-100" : "opacity-30"}`}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-indigo-500 rounded-full safe-wave"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            ></div>
          ))}
        </div>
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{currentLyric}</p>
      </div>
    </div>
  );
}
