"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "../siteConfig";

import type { PostMeta } from "../lib/types";

export default function LatestPostsCarousel({ posts }: { posts: PostMeta[] }) {
  const [index, setIndex] = useState(0);
  const post = posts[index];

  if (!post || posts.length === 0) return null;

  return (
    <div className="h-full w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-700 group relative flex flex-col">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={post.slug}
            src={post.cover || siteConfig.defaultPostCover}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIndex((i) => (i - 1 + posts.length) % posts.length);
            }}
            className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/60 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIndex((i) => (i + 1) % posts.length);
            }}
            className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/60 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={post.slug + "-content"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col p-4"
        >
          <Link href={`/posts/${post.slug}`} className="flex-1 flex flex-col">
            <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {post.title || "无标题"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">{post.description || ""}</p>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">
              {post.formattedDate || ""}
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5 pb-3">
        {posts.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-indigo-500 w-4" : "bg-slate-300 dark:bg-slate-600"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
