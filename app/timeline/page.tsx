import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { siteConfig } from "../../siteConfig";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";
import type { PostMeta } from "../../lib/types";

function formatDate(dateString: string) {
  if (!dateString || dateString === "1970-01-01") return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
  } catch {
    return dateString;
  }
}

interface TimelinePost extends PostMeta {
  year: string;
}

export default function TimelinePage() {
  const postsDirectory = path.join(process.cwd(), "posts");
  let allPosts: TimelinePost[] = [];

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
      allPosts = fileNames
        .map((fileName) => {
          const fullPath = path.join(postsDirectory, fileName);
          const { data } = matter(fs.readFileSync(fullPath, "utf8"));
          const rawDate = data.date || "1970-01-01";
          const d = new Date(rawDate);
          return {
            slug: fileName.replace(/\.md$/, ""),
            title: data.title || "",
            description: data.description || "",
            cover: data.cover || siteConfig.defaultPostCover,
            tags: data.tags || [],
            category: data.category || "",
            date: rawDate,
            formattedDate: formatDate(rawDate),
            year: isNaN(d.getTime()) ? "未知" : String(d.getFullYear()),
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return b.slug.localeCompare(a.slug);
        });
    }
  } catch (e) {
    console.error("Failed to read posts for timeline:", e);
  }

  const postsByYear: Record<string, TimelinePost[]> = {};
  allPosts.forEach((post) => {
    const year = post.year;
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  const years = Object.keys(postsByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-4xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            归档
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
            {allPosts.length} 篇文章，记录学习与思考
          </p>

          {allPosts.length === 0 ? (
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-8 text-center text-slate-500 dark:text-slate-400">
              还没有文章，快去写第一篇吧！
            </div>
          ) : (
            <div className="space-y-8">
              {years.map((year) => (
                <div key={year}>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                      {year}
                    </h2>
                    <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {postsByYear[year].length} 篇
                    </span>
                  </div>

                  <div className="space-y-3">
                    {postsByYear[year].map((post) => (
                      <Link
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex items-center gap-4 transition-all duration-700 hover:scale-[1.02] group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={post.cover}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {post.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
                          {post.formattedDate}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
      <FloatingPlayer />
    </div>
  );
}
