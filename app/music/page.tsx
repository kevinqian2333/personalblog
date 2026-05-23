"use client";

import { useMusic } from "../../components/MusicProvider";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return "00:00";
  const m = Math.floor(time / 60).toString().padStart(2, "0");
  const s = Math.floor(time % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const playModeIcon: Record<string, string> = {
  loop: "🔄",
  single: "🔂",
  random: "🔀",
};

const playModeLabel: Record<string, string> = {
  loop: "列表循环",
  single: "单曲循环",
  random: "随机播放",
};

export default function MusicPage() {
  const {
    playlist,
    currentIndex,
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    isLoading,
    volume,
    isMuted,
    playMode,
    togglePlay,
    nextSong,
    prevSong,
    handleSeek,
    playSong,
    setVolume,
    toggleMute,
    togglePlayMode,
  } = useMusic();

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-5xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold">正在加载歌单...</p>
              </div>
            )}

            {!isLoading && playlist.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-6xl mb-4">🎵</p>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold">歌单为空，请检查云音乐配置</p>
              </div>
            )}

            {!isLoading && playlist.length > 0 && currentSong && (
              <>
                <div className="flex flex-col items-center mb-10">
                  <div className="relative mb-8">
                    <div
                      className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-white/60 dark:border-white/20 shadow-2xl overflow-hidden"
                      style={{ animation: "spin 6s linear infinite", animationPlayState: isPlaying ? "running" : "paused" }}
                    >
                      <img
                        src={currentSong.cover}
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10 rounded-full" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-inner border border-white/60" />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center">
                    {currentSong.title}
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-bold mb-6">
                    {currentSong.artist}
                  </p>

                  <div className="w-full max-w-lg flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12 text-right tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-600 appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12 tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <button
                      onClick={prevSong}
                      className="w-12 h-12 rounded-full bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg className="w-5 h-5 text-slate-700 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-indigo-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                      {isPlaying ? (
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={nextSong}
                      className="w-12 h-12 rounded-full bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg className="w-5 h-5 text-slate-700 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <button
                      onClick={togglePlayMode}
                      className="text-xl p-2 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-md hover:scale-110 active:scale-95 transition-transform"
                      title={playModeLabel[playMode]}
                    >
                      {playModeIcon[playMode]}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleMute}
                        className="text-lg text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/30 dark:border-white/10 pt-6">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4">
                    播放列表 <span className="text-sm font-bold text-slate-400 dark:text-slate-500">({playlist.length})</span>
                  </h3>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                    {playlist.map((song, index) => (
                      <div
                        key={song.id || index}
                        onClick={() => playSong(index)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          index === currentIndex
                            ? "bg-indigo-500/20 dark:bg-indigo-500/30 border border-indigo-400/40 shadow-md"
                            : "hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md relative">
                          <img
                            src={song.cover}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {index === currentIndex && isPlaying && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="flex items-end gap-0.5 h-4">
                                <span className="w-0.5 bg-white rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ height: "60%" }} />
                                <span className="w-0.5 bg-white rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_0.2s]" style={{ height: "100%" }} />
                                <span className="w-0.5 bg-white rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_0.4s]" style={{ height: "40%" }} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              index === currentIndex
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {song.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {song.artist}
                          </p>
                        </div>
                        {index === currentIndex && (
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">
                            播放中
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
      <style jsx>{`
        @keyframes equalizer {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
