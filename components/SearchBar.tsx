"use client";

import { useState } from "react";
import Link from "next/link";

import type { PostMeta } from "../lib/types";

export default function SearchBar({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query
    ? posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <div className="flex items-center bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg rounded-2xl px-4 py-3 transition-all duration-700">
        <svg className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索文章..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="bg-transparent w-full outline-none text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400"
        />
      </div>

      {isOpen && query && filtered.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          {filtered.slice(0, 5).map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="block px-4 py-3 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors border-b border-white/20 dark:border-white/5 last:border-0"
            >
              <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{post.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{post.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
