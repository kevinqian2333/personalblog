"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../../siteConfig";
import { useToast } from "../../components/ToastProvider";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

type TabKey = "profile" | "background" | "music" | "footer" | "comment";

const menuItems: { key: TabKey; icon: string; label: string }[] = [
  { key: "profile", icon: "👤", label: "个人名片设置" },
  { key: "background", icon: "🌌", label: "视觉背景配置" },
  { key: "music", icon: "🎵", label: "音乐播放设置" },
  { key: "footer", icon: "⚡", label: "首页底部设置" },
  { key: "comment", icon: "💬", label: "评论系统配置" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [deployMsg, setDeployMsg] = useState("");
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    authorName: siteConfig.authorName,
    bio: siteConfig.bio,
    avatarUrl: siteConfig.avatarUrl,
    github: siteConfig.social.github,
    email: siteConfig.social.email,
    qq: siteConfig.social.qq,
    wechat: siteConfig.social.wechat,
  });

  const [backgroundForm, setBackgroundForm] = useState({
    themeColors: siteConfig.themeColors.join(", "),
    bgImages: siteConfig.bgImages.join("\n"),
    bgBlur: 8,
  });

  const [musicForm, setMusicForm] = useState({
    cloudMusicIds: siteConfig.cloudMusicIds.join("\n"),
  });

  const [footerForm, setFooterForm] = useState({
    buildDate: siteConfig.buildDate,
    icpName: siteConfig.icpConfig.name,
    icpLink: siteConfig.icpConfig.link,
  });

  const [commentForm, setCommentForm] = useState({
    clientID: siteConfig.gitalkConfig.clientID,
    clientSecret: siteConfig.gitalkConfig.clientSecret,
    repo: siteConfig.gitalkConfig.repo,
    owner: siteConfig.gitalkConfig.owner,
  });

  const handleApply = (formData: Record<string, any>) => {
    const existing = localStorage.getItem("site-settings");
    let all: Record<string, any> = {};
    try { if (existing) all = JSON.parse(existing); } catch {}
    Object.assign(all, formData);
    localStorage.setItem("site-settings", JSON.stringify(all));
    window.dispatchEvent(new Event("site-settings-changed"));
    showToast("已应用，刷新页面生效", "success");
  };

  const handleDeploy = async (section: string, formData: Record<string, any>) => {
    setSaving(true);
    setDeployMsg("");
    try {
      const payload: Record<string, any> = {};
      if (section === "profile") {
        payload.authorName = formData.authorName;
        payload.bio = formData.bio;
        payload.avatarUrl = formData.avatarUrl;
        payload.social = { ...siteConfig.social, github: formData.github, email: formData.email, qq: formData.qq, wechat: formData.wechat };
      } else if (section === "background") {
        payload.themeColors = formData.themeColors.split(",").map((s: string) => s.trim()).filter(Boolean);
        payload.bgImages = formData.bgImages.split("\n").map((s: string) => s.trim()).filter(Boolean);
        payload.bgBlur = formData.bgBlur;
      } else if (section === "music") {
        payload.cloudMusicIds = formData.cloudMusicIds.split("\n").map((s: string) => s.trim()).filter(Boolean);
      } else if (section === "footer") {
        payload.buildDate = formData.buildDate;
        payload.icpConfig = { name: formData.icpName, link: formData.icpLink };
      } else if (section === "comment") {
        payload.gitalkConfig = { clientID: formData.clientID, clientSecret: formData.clientSecret, repo: formData.repo, owner: formData.owner, admin: [formData.owner] };
      }
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (section === "music") {
          const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
          existing.cloudMusicIds = payload.cloudMusicIds;
          localStorage.setItem("site-settings", JSON.stringify(existing));
          window.dispatchEvent(new Event("site-settings-changed"));
        }
        setDeployMsg("✅ 已写入 siteConfig.ts！运行 `npm run build` 后永久生效");
        showToast("配置已保存到服务器", "success");
      } else {
        setDeployMsg("❌ 保存失败: " + (data.error || "未知错误"));
        showToast("保存失败", "error");
      }
    } catch {
      setDeployMsg("❌ 无法连接到服务器");
      showToast("连接失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyProfile = () => {
    handleApply({
      authorName: profileForm.authorName,
      bio: profileForm.bio,
      avatarUrl: profileForm.avatarUrl,
      github: profileForm.github,
      email: profileForm.email,
      qq: profileForm.qq,
      wechat: profileForm.wechat,
    });
  };

  const handleApplyBackground = () => {
    const bgList = backgroundForm.bgImages.split("\n").map((s) => s.trim()).filter(Boolean);
    const colors = backgroundForm.themeColors.split(",").map((s) => s.trim()).filter(Boolean);
    handleApply({ bgImages: bgList, themeColors: colors, bgBlur: backgroundForm.bgBlur });
  };

  const handleApplyMusic = () => {
    const ids = musicForm.cloudMusicIds.split("\n").map((s) => s.trim()).filter(Boolean);
    handleApply({ cloudMusicIds: ids });
  };

  const handleApplyFooter = () => {
    handleApply({
      buildDate: footerForm.buildDate,
      icpName: footerForm.icpName,
      icpLink: footerForm.icpLink,
    });
  };

  const handleApplyComment = () => {
    handleApply({
      clientID: commentForm.clientID,
      clientSecret: commentForm.clientSecret,
      repo: commentForm.repo,
      owner: commentForm.owner,
    });
  };

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-28">
                <nav className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-3 space-y-1">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full text-left rounded-2xl px-4 py-3 font-bold text-sm transition-all flex items-center gap-3 ${
                        activeTab === item.key
                          ? "bg-indigo-500 text-white translate-x-2 shadow-lg shadow-indigo-500/25"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  系统核心配置
                </h1>
              </div>

              <div className="lg:hidden mb-6 overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-2xl px-4 py-2 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                        activeTab === item.key
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-white/40 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 backdrop-blur-md border border-white/40 dark:border-white/10"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                        👤 个人名片设置
                      </h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            作者名称
                          </label>
                          <input
                            type="text"
                            value={profileForm.authorName}
                            onChange={(e) => setProfileForm({ ...profileForm, authorName: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            个人简介
                          </label>
                          <textarea
                            rows={3}
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            头像 URL
                          </label>
                          <input
                            type="text"
                            value={profileForm.avatarUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            社交链接
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                GitHub
                              </label>
                              <input
                                type="text"
                                value={profileForm.github}
                                onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                Email
                              </label>
                              <input
                                type="text"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                QQ
                              </label>
                              <input
                                type="text"
                                value={profileForm.qq}
                                onChange={(e) => setProfileForm({ ...profileForm, qq: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                微信
                              </label>
                              <input
                                type="text"
                                value={profileForm.wechat}
                                onChange={(e) => setProfileForm({ ...profileForm, wechat: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApplyProfile}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-sm"
                        >
                          立即应用
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={saving}
                          onClick={() => handleDeploy("profile", profileForm)}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                        >
                          {saving ? "保存中..." : "保存到服务器"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "background" && (
                  <motion.div
                    key="background"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                        🌌 视觉背景配置
                      </h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            主题色（多个用逗号分隔）
                          </label>
                          <input
                            type="text"
                            value={backgroundForm.themeColors}
                            onChange={(e) => setBackgroundForm({ ...backgroundForm, themeColors: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            背景图片 URL（每行一个）
                          </label>
                          <textarea
                            rows={4}
                            value={backgroundForm.bgImages}
                            onChange={(e) => setBackgroundForm({ ...backgroundForm, bgImages: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors resize-none"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          背景模糊度: {backgroundForm.bgBlur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={backgroundForm.bgBlur}
                          onChange={(e) => setBackgroundForm({ ...backgroundForm, bgBlur: Number(e.target.value) })}
                          className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-600 appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>清晰</span><span>模糊</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          背景预览
                        </label>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {backgroundForm.bgImages
                            .split("\n")
                            .filter((u) => u.trim())
                            .slice(0, 5)
                            .map((url, i) => (
                              <div
                                key={i}
                                className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/60 dark:border-white/20 shadow-md bg-center bg-cover"
                                style={{ backgroundImage: `url(${url.trim()})` }}
                              />
                            ))}
                          {backgroundForm.bgImages.split("\n").filter((u) => u.trim()).length === 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 py-3">暂无背景图片</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApplyBackground}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-sm"
                        >
                          立即应用
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={saving}
                          onClick={() => handleDeploy("background", backgroundForm)}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                        >
                          {saving ? "保存中..." : "保存到服务器"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "music" && (
                  <motion.div
                    key="music"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                        🎵 音乐播放设置
                      </h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            网易云音乐 ID（每行一个）
                          </label>
                          <textarea
                            rows={4}
                            value={musicForm.cloudMusicIds}
                            onChange={(e) => setMusicForm({ ...musicForm, cloudMusicIds: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors resize-none"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApplyMusic}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-sm"
                        >
                          立即应用
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={saving}
                          onClick={() => handleDeploy("music", musicForm)}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                        >
                          {saving ? "保存中..." : "保存到服务器"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "footer" && (
                  <motion.div
                    key="footer"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                        ⚡ 首页底部设置
                      </h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            构建日期
                          </label>
                          <input
                            type="text"
                            value={footerForm.buildDate}
                            onChange={(e) => setFooterForm({ ...footerForm, buildDate: e.target.value })}
                            className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            备案配置
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                备案名称
                              </label>
                              <input
                                type="text"
                                value={footerForm.icpName}
                                onChange={(e) => setFooterForm({ ...footerForm, icpName: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                备案链接
                              </label>
                              <input
                                type="text"
                                value={footerForm.icpLink}
                                onChange={(e) => setFooterForm({ ...footerForm, icpLink: e.target.value })}
                                className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApplyFooter}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-sm"
                        >
                          立即应用
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={saving}
                          onClick={() => handleDeploy("footer", footerForm)}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                        >
                          {saving ? "保存中..." : "保存到服务器"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "comment" && (
                  <motion.div
                    key="comment"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                        💬 评论系统配置
                      </h2>
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              Client ID
                            </label>
                            <input
                              type="text"
                              value={commentForm.clientID}
                              onChange={(e) => setCommentForm({ ...commentForm, clientID: e.target.value })}
                              className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              Client Secret
                            </label>
                            <input
                              type="text"
                              value={commentForm.clientSecret}
                              onChange={(e) => setCommentForm({ ...commentForm, clientSecret: e.target.value })}
                              className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              仓库名
                            </label>
                            <input
                              type="text"
                              value={commentForm.repo}
                              onChange={(e) => setCommentForm({ ...commentForm, repo: e.target.value })}
                              className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              仓库所有者
                            </label>
                            <input
                              type="text"
                              value={commentForm.owner}
                              onChange={(e) => setCommentForm({ ...commentForm, owner: e.target.value })}
                              className="bg-white/60 dark:bg-slate-700/60 border rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500 text-slate-800 dark:text-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleApplyComment}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-sm"
                        >
                          立即应用
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={saving}
                          onClick={() => handleDeploy("comment", commentForm)}
                          className="rounded-2xl px-5 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                        >
                          {saving ? "保存中..." : "保存到服务器"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {deployMsg && (
                <div className={`mt-6 rounded-3xl backdrop-blur-md border shadow-lg p-6 sm:p-8 ${
                  deployMsg.startsWith("✅")
                    ? "bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/30"
                    : "bg-red-50/80 dark:bg-red-900/30 border-red-200 dark:border-red-700/30"
                }`}>
                  <p className={`font-bold ${deployMsg.startsWith("✅") ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                    {deployMsg}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
    </div>
  );
}
