"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { siteConfig } from "../siteConfig";
import type { SongMeta } from "../lib/types";

function parseLrc(lrcText: string) {
  if (!lrcText || lrcText.length > 30000) return [];
  const lines = lrcText.split(/\r?\n/);
  const result: { time: number; text: string }[] = [];
  for (const line of lines) {
    const matches = [...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)];
    if (matches.length > 0) {
      const text = line.replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, "").trim();
      const cleanText = text.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");
      if (cleanText) {
        for (const match of matches) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3]) : 0;
          const divisor = match[3] && match[3].length === 3 ? 1000 : 100;
          const time = min * 60 + sec + ms / divisor;
          result.push({ time, text: cleanText });
        }
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

type PlayMode = "loop" | "single" | "random";

interface MusicContextType {
  playlist: SongMeta[];
  currentIndex: number;
  currentSong: SongMeta | undefined;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<SongMeta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("正在连接高可用神经云端...");
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("loop");

  const audioRef = useRef<HTMLAudioElement>(null);
  const mountRef = useRef(true);

  function getMusicIds(): string[] {
    try {
      const saved = localStorage.getItem("site-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.cloudMusicIds) && parsed.cloudMusicIds.length > 0) {
          return parsed.cloudMusicIds;
        }
      }
    } catch {}
    return siteConfig.cloudMusicIds || [];
  }

  const fetchMusicData = useCallback(async () => {
    setIsLoading(true);
    const ids = getMusicIds();
    if (!ids || ids.length === 0) {
      setPlaylist([]);
      setCurrentLyric("请配置 cloudMusicIds");
      setIsLoading(false);
      return;
    }
    try {
      const fetchPromises = ids.map((id) =>
        fetch(`https://api.injahow.cn/meting/?server=netease&type=song&id=${id}`)
          .then((res) => res.json())
          .catch(() => null)
      );
      const results = await Promise.all(fetchPromises);
      const mergedPlaylist = results
        .filter((res) => res && res.length > 0)
        .map((res) => ({
          id: res[0].id || Math.random().toString(),
          title: res[0].name || res[0].title || "未知歌曲",
          artist: res[0].author || res[0].artist || "未知歌手",
          cover: res[0].pic || res[0].cover || "https://bu.dusays.com/2026/03/24/69c24230a5ff8.jpg",
          src: res[0].url,
          lrcUrl: res[0].lrc,
          lyrics: [],
        }))
        .filter((song) => song.src);

      if (mountRef.current) {
        if (mergedPlaylist.length > 0) {
          setPlaylist(mergedPlaylist);
          setCurrentIndex(0);
        } else {
          setCurrentLyric("云端链路受阻");
        }
        setIsLoading(false);
      }
    } catch {
      if (mountRef.current) {
        setCurrentLyric("网络初始化失败");
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountRef.current = true;
    fetchMusicData();

    const handleSettingsChange = () => {
      fetchMusicData();
    };

    window.addEventListener("site-settings-changed", handleSettingsChange);
    window.addEventListener("storage", handleSettingsChange);

    return () => {
      mountRef.current = false;
      window.removeEventListener("site-settings-changed", handleSettingsChange);
      window.removeEventListener("storage", handleSettingsChange);
    };
  }, [fetchMusicData]);

  useEffect(() => {
    if (playlist.length === 0) return;
    let isMounted = true;
    const currentSong = playlist[currentIndex];
    setLyrics([]);
    setCurrentLyric("♪ 正在缓冲 ♪");

    if (currentSong.lrcUrl) {
      fetch(currentSong.lrcUrl)
        .then((res) => res.text())
        .then((text) => {
          if (isMounted) {
            const parsed = parseLrc(text);
            setLyrics(parsed);
            setPlaylist((prev) => {
              const newPlaylist = [...prev];
              newPlaylist[currentIndex].lyrics = parsed;
              return newPlaylist;
            });
          }
        })
        .catch(() => {
          if (isMounted) setCurrentLyric("♪ 纯享音乐 ♪");
        });
    }

    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
    return () => {
      isMounted = false;
    };
  }, [currentIndex, playlist.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    if (playMode === "random") {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevSong = () => {
    if (playMode === "random") {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const playSong = (index: number) => {
    setCurrentIndex(index);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime: ct, duration: d } = audioRef.current;
      setCurrentTime(ct);
      setDuration(d || 0);
      setProgress((ct / (d || 1)) * 100);

      if (lyrics.length > 0) {
        const activeLyric = lyrics
          .slice()
          .reverse()
          .find((l) => ct >= l.time);
        if (activeLyric && activeLyric.text !== currentLyric) {
          setCurrentLyric(activeLyric.text);
        }
      }
    }
  };

  const handleEnded = () => {
    if (playMode === "single" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    setPlayMode((prev) => {
      if (prev === "loop") return "single";
      if (prev === "single") return "random";
      return "loop";
    });
  };

  const currentSong = playlist[currentIndex];

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentIndex,
        currentSong,
        isPlaying,
        progress,
        currentTime,
        duration,
        currentLyric,
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
      }}
    >
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};
