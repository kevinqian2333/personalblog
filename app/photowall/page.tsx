"use client";

import { useState } from "react";
import { albums } from "../../data/albums";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

export default function PhotowallPage() {
  const [selectedAlbum, setSelectedAlbum] = useState(albums[0]?.id || "");
  const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; caption: string } | null>(null);

  const activeAlbum = albums.find((a) => a.id === selectedAlbum) || albums[0];

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            照片墙
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
            镜头下的世界与生活碎片
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedAlbum === album.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/40 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                }`}
              >
                {album.title}
              </button>
            ))}
          </div>

          {activeAlbum && (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {activeAlbum.photos.map((photo, index) => (
                <div
                  key={index}
                  className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-[1.03] bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAlbum && activeAlbum.photos.length === 0 && (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              这个相册还没有照片
            </div>
          )}
        </div>
      </PageTransition>
      <FloatingPlayer />

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="max-w-4xl max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.src}
              alt={lightboxPhoto.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            {lightboxPhoto.caption && (
              <p className="text-white/90 text-center mt-4 text-sm sm:text-base font-medium">
                {lightboxPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
