import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import SearchBar from "../components/SearchBar";
import { siteConfig } from "../siteConfig";
import CloudPlayer from "../components/CloudPlayer";
import ThemeToggleBlock from "../components/ThemeToggleBlock";
import ProfileCard from "../components/ProfileCard";
import SiteDashboard from "../components/SiteDashboard";
import { albums } from "../data/albums";
import LyricBar from "../components/LyricBar";
import { ToastProvider } from "../components/ToastProvider";
import LatestPostsCarousel from "../components/LatestPostsCarousel";
import LatestChatterCarousel from "../components/LatestChatterCarousel";
import BackgroundEffects from "../components/BackgroundEffects";
import FloatingPlayer from "../components/FloatingPlayer";
import AnimatedCard from "../components/AnimatedCard";
import type { PostMeta } from "../lib/types";

function formatUpdateTime(dateString: string) {
  if (!dateString || dateString === "1970-01-01") return "刚刚更新";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
}

export default function Home() {
  const postsDirectory = path.join(process.cwd(), "posts");
  let allPosts: PostMeta[] = [];
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
      allPosts = fileNames
        .map((fileName) => {
          const fullPath = path.join(postsDirectory, fileName);
          const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
          const rawDate = data.date || "1970-01-01";
          return {
            slug: fileName.replace(/\.md$/, ""),
            title: data.title || "",
            description: data.description || "",
            cover: data.cover || siteConfig.defaultPostCover,
            tags: data.tags || [],
            category: data.category || "",
            content: content || "",
            date: rawDate,
            formattedDate: formatUpdateTime(rawDate),
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
    console.error("Failed to read posts directory:", e);
  }

  const top5Posts: PostMeta[] =
    allPosts.length > 0
      ? allPosts.slice(0, 5)
      : [
          {
            slug: "none",
            title: "暂无文章",
            description: "快去写第一篇吧！",
            cover: siteConfig.defaultPostCover,
            tags: [],
            category: "",
            date: "",
            formattedDate: "",
          },
        ];

  const realPhotoCount = albums.reduce((total, album) => total + album.photos.length, 0);
  const latestAlbum =
    albums.length > 0
      ? albums[0]
      : { id: "", title: "照片墙", description: "查看摄影", cover: siteConfig.photoWallImage, date: "" };

  return (
    <ToastProvider>
      <div className="min-h-screen relative pb-10">
        <Navbar />
        <PageTransition>
          <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
            <SearchBar posts={allPosts} />

            <main className="flex flex-col gap-6 w-full mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <AnimatedCard delay={0} direction="left" className="col-span-1 lg:col-span-7 flex flex-col">
                  <ProfileCard postCount={allPosts.length} chatterCount={0} photoCount={realPhotoCount} />
                </AnimatedCard>
                <AnimatedCard delay={0.1} direction="right" className="col-span-1 lg:col-span-5 flex flex-col">
                  <CloudPlayer />
                </AnimatedCard>
              </div>

              <AnimatedCard delay={0.15} className="w-full mt-[-10px]">
                <LyricBar />
              </AnimatedCard>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <AnimatedCard delay={0.2} direction="left" className="col-span-1 lg:col-span-4 flex flex-col min-h-[300px]">
                  <LatestPostsCarousel posts={top5Posts} />
                </AnimatedCard>

                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
                  <AnimatedCard delay={0.25} direction="right">
                    <Link
                      href="/photowall"
                      className="w-full rounded-3xl overflow-hidden transition-all duration-700 hover:scale-[1.02] relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0 block"
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      <img
                        src={latestAlbum.cover}
                        className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-colors duration-500"></div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                          background: "radial-gradient(circle at 30% 70%, rgba(99,102,241,0.2) 0%, transparent 50%)",
                        }}
                      />
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-6">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                          {latestAlbum.title}
                        </h3>
                        <p className="text-white/90 text-sm sm:text-lg line-clamp-1 drop-shadow">
                          {latestAlbum.description}
                        </p>
                      </div>
                    </Link>
                  </AnimatedCard>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full flex-1">
                    <AnimatedCard delay={0.3} className="sm:col-span-2 flex flex-col min-h-[200px]">
                      <LatestChatterCarousel chatters={[]} />
                    </AnimatedCard>
                    <AnimatedCard delay={0.35} className="sm:col-span-1 flex flex-col min-h-[120px]">
                      <ThemeToggleBlock />
                    </AnimatedCard>
                  </div>
                </div>
              </div>

              <AnimatedCard delay={0.4} className="w-full mt-4">
                <SiteDashboard />
              </AnimatedCard>
            </main>
          </div>
        </PageTransition>
        <FloatingPlayer />
        <div className="hidden md:block">
          <BackgroundEffects />
        </div>
      </div>
    </ToastProvider>
  );
}
