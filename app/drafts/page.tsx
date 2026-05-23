"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

interface Draft {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  category: string;
  cover: string;
  updatedAt: string;
}

const DRAFTS_KEY = "blog-drafts";

function getSnapshot(): Draft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): Draft[] {
  return [];
}

function subscribe(): () => void {
  return () => {};
}

function saveDrafts(drafts: Draft[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export default function DraftsPage() {
  const drafts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    saveDrafts(drafts.filter((d) => d.id !== id));
    setDeleteId(null);
  };

  const passDraftToEditor = (draft: Draft) => {
    sessionStorage.setItem("edit-draft", JSON.stringify(draft));
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "刚刚";
      if (mins < 60) return `${mins} 分钟前`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} 小时前`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} 天前`;
      return d.toLocaleDateString("zh-CN");
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-4xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              草稿管理
            </h1>
            <Link
              href="/editor"
              className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md inline-block w-fit"
            >
              ✏️ 新建草稿
            </Link>
          </div>

          {drafts.length === 0 ? (
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg">暂无草稿</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                在编辑器中写文章时，内容会自动保存～
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts
                .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
                .map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                          {draft.title || "未命名草稿"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {draft.description || draft.content?.slice(0, 120) || "暂无内容预览"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {draft.category && (
                            <span className="inline-block rounded-xl px-3 py-0.5 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                              {draft.category}
                            </span>
                          )}
                          {(draft.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block rounded-lg px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            最后更新：{formatTime(draft.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href="/editor"
                          onClick={() => passDraftToEditor(draft)}
                          className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 text-sm"
                        >
                          继续编辑
                        </Link>
                        <button
                          onClick={() => setDeleteId(draft.id)}
                          className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </PageTransition>

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">确认删除</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              确定要删除这个草稿吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingPlayer />
    </div>
  );
}
