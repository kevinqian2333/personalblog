import { friends } from "../../data/friends";
import { siteConfig } from "../../siteConfig";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

export default function FriendsPage() {
  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            友链
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
            常逛的博客与有趣的灵魂
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {friends.map((friend) => (
              <a
                key={friend.url}
                href={friend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg p-4 flex items-center gap-4 transition-all duration-700 hover:scale-[1.02] hover:shadow-xl group"
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/60 dark:border-white/20 shadow-md flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {friend.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {friend.description}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                    {friend.url}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              申请友链
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              欢迎交换友链！请按照以下格式在评论区留言，我会尽快添加～
            </p>
            <pre className="bg-slate-100 dark:bg-slate-900/60 rounded-xl p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
              {siteConfig.friendLinkApplyFormat}
            </pre>
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
    </div>
  );
}
