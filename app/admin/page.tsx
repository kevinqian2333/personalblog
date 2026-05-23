"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";
import { siteConfig } from "../../siteConfig";
import { useOperations } from "../../context/OperationContext";
import { useToast } from "../../components/ToastProvider";

interface PostItem {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  cover: string;
}

type TabKey = "dashboard" | "posts" | "gallery" | "settings";

const menuItems: { key: TabKey; icon: string; label: string }[] = [
  { key: "dashboard", icon: "🌌", label: "全息仪表盘" },
  { key: "posts", icon: "📝", label: "文章与草稿" },
  { key: "gallery", icon: "🖼️", label: "光影画廊" },
  { key: "settings", icon: "⚙️", label: "系统核心配置" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwChanging, setPwChanging] = useState(false);
  const { operations, removeOperation, clearOperations } = useOperations();
  const { showToast } = useToast();
  const [albums, setAlbums] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState<{ id: string; title: string; description: string; cover: string; date: string; photos: any[] }>({ id: "", title: "", description: "", cover: "", date: "", photos: [] });
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ id: "", title: "", description: "", cover: "", techs: "", github: "", demo: "", category: "" });
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [editingEducation, setEditingEducation] = useState<any | null>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [newEducation, setNewEducation] = useState({ school: "", degree: "", period: "", description: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (!cancelled) setPosts(data.posts || []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch("/api/albums").then(r => r.json()).then(d => {
      if (d.albums) setAlbums(d.albums);
    }).catch(() => {});
    fetch("/api/projects").then(r => r.json()).then(d => {
      if (d.projects) setProjectsData(d.projects);
    }).catch(() => {});
    fetch("/api/education").then(r => r.json()).then(d => {
      if (d.education) setEducationData(d.education);
    }).catch(() => {});
  }, []);

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
      }
    } catch {
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleDeployAll = async () => {
    if (operations.length === 0) {
      showToast("操作队列为空，没有需要部署的配置", "info");
      return;
    }
    setDeploying(true);
    try {
      let merged: Record<string, any> = {};
      for (const op of operations) {
        if (op.payload) {
          if (op.payload.authorName !== undefined) {
            merged.authorName = op.payload.authorName;
            merged.bio = op.payload.bio;
            merged.avatarUrl = op.payload.avatarUrl;
            merged.social = {
              github: op.payload.github || siteConfig.social.github,
              email: op.payload.email || siteConfig.social.email,
              qq: op.payload.qq || siteConfig.social.qq,
              wechat: op.payload.wechat || siteConfig.social.wechat,
            };
          }
          if (op.payload.bgImages !== undefined) {
            merged.bgImages = typeof op.payload.bgImages === "string"
              ? op.payload.bgImages.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : op.payload.bgImages;
          }
          if (op.payload.themeColors !== undefined) {
            merged.themeColors = typeof op.payload.themeColors === "string"
              ? op.payload.themeColors.split(",").map((s: string) => s.trim()).filter(Boolean)
              : op.payload.themeColors;
          }
          if (op.payload.cloudMusicIds !== undefined) {
            merged.cloudMusicIds = typeof op.payload.cloudMusicIds === "string"
              ? op.payload.cloudMusicIds.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : op.payload.cloudMusicIds;
          }
          if (op.payload.buildDate !== undefined) {
            merged.buildDate = op.payload.buildDate;
            merged.icpConfig = { name: op.payload.icpName || "", link: op.payload.icpLink || "" };
          }
          if (op.payload.clientID !== undefined) {
            merged.gitalkConfig = {
              clientID: op.payload.clientID,
              clientSecret: op.payload.clientSecret,
              repo: op.payload.repo,
              owner: op.payload.owner,
              admin: [op.payload.owner || ""],
            };
          }
        }
      }
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (data.success) {
        clearOperations();
        showToast("✅ 全部配置已写入 siteConfig.ts！运行 npm run build 后永久生效", "success");
      } else {
        showToast("部署失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到部署服务", "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwCurrent || !pwNew) { setPwMsg("请填写所有字段"); return; }
    if (pwNew.length < 4) { setPwMsg("新密码至少4位"); return; }
    setPwChanging(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (data.success) {
        setPwMsg("✅ " + data.message);
        setPwCurrent("");
        setPwNew("");
        setShowPasswordForm(false);
        showToast("密码已修改", "success");
      } else {
        setPwMsg("❌ " + (data.error || "修改失败"));
      }
    } catch {
      setPwMsg("❌ 网络错误");
    } finally {
      setPwChanging(false);
    }
  };

  const saveAlbums = async (updated: any[]) => {
    setAlbums(updated);
    await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albums: updated }),
    });
    showToast("相册已保存", "success");
  };

  const saveProjects = async (updated: any[]) => {
    setProjectsData(updated);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: updated }),
    });
    showToast("项目已保存", "success");
  };

  const handleAddAlbum = () => {
    if (!newAlbum.id || !newAlbum.title) {
      showToast("请至少填写 ID 和标题", "error");
      return;
    }
    const updated = [...albums, { ...newAlbum, photos: newAlbum.photos || [] }];
    saveAlbums(updated);
    setNewAlbum({ id: "", title: "", description: "", cover: "", date: "", photos: [] });
    setShowAlbumForm(false);
  };

  const handleUpdateAlbum = () => {
    if (!editingAlbum) return;
    const updated = albums.map((a) =>
      a.id === editingAlbum.id ? { ...editingAlbum } : a
    );
    saveAlbums(updated);
    setEditingAlbum(null);
  };

  const handleDeleteAlbum = (id: string) => {
    const updated = albums.filter((a) => a.id !== id);
    saveAlbums(updated);
    setDeleteAlbumId(null);
  };

  const handleAddProject = () => {
    if (!newProject.id || !newProject.title) {
      showToast("请至少填写 ID 和标题", "error");
      return;
    }
    const project = {
      ...newProject,
      techs: newProject.techs ? newProject.techs.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    const updated = [...projectsData, project];
    saveProjects(updated);
    setNewProject({ id: "", title: "", description: "", cover: "", techs: "", github: "", demo: "", category: "" });
    setShowProjectForm(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    const project = {
      ...editingProject,
      techs: Array.isArray(editingProject.techs)
        ? editingProject.techs
        : editingProject.techs
          ? editingProject.techs.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
    };
    const updated = projectsData.map((p) =>
      p.id === project.id ? project : p
    );
    saveProjects(updated);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projectsData.filter((p) => p.id !== id);
    saveProjects(updated);
    setDeleteProjectId(null);
  };

  const saveEducation = async (updated: any[]) => {
    setEducationData(updated);
    await fetch("/api/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ education: updated }),
    });
    showToast("教育经历已保存", "success");
  };

  const handleAddEducation = () => {
    if (!newEducation.school) { showToast("请填写学校名称", "info"); return; }
    const updated = [...educationData, { ...newEducation }];
    saveEducation(updated);
    setNewEducation({ school: "", degree: "", period: "", description: "" });
    setShowEducationForm(false);
  };

  const handleUpdateEducation = () => {
    if (!editingEducation) return;
    const updated = educationData.map((e, i) => {
      if (i === educationData.indexOf(editingEducation)) return { ...editingEducation };
      return e;
    });
    saveEducation(updated);
    setEditingEducation(null);
  };

  const handleDeleteEducation = (index: number) => {
    const updated = educationData.filter((_, i) => i !== index);
    saveEducation(updated);
  };

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const draftsCount = 0;
  const projectsCount = 0;
  const photosCount = siteConfig.counts?.photos || 0;

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 text-center">
                  <img
                    src={siteConfig.avatarUrl}
                    alt="avatar"
                    className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-indigo-400/50"
                  />
                  <h2 className="mt-3 font-black text-slate-800 dark:text-white text-lg">
                    {siteConfig.authorName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CMS Administrator</p>
                </div>

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
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3 lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {menuItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`flex-shrink-0 rounded-2xl px-4 py-2 font-bold text-xs whitespace-nowrap transition-all ${
                        activeTab === item.key
                          ? "bg-indigo-500 text-white shadow-md"
                          : "bg-white/40 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 border border-white/40 dark:border-white/10"
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight capitalize">
                  {menuItems.find((m) => m.key === activeTab)?.label || activeTab}
                </h1>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setQueueOpen(!queueOpen)}
                      className="relative rounded-2xl px-3 py-2 font-bold transition-all bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                    >
                      <span className="text-xl">📥</span>
                      {operations.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {operations.length}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {queueOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-80 rounded-3xl bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl p-4 z-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-slate-800 dark:text-white text-sm">
                              操作队列 ({operations.length})
                            </h3>
                            {operations.length > 0 && (
                              <button
                                onClick={clearOperations}
                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                              >
                                清空
                              </button>
                            )}
                          </div>
                          {operations.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                              暂无待处理操作
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {operations.map((op) => (
                                <div
                                  key={op.id}
                                  className="flex items-center justify-between rounded-2xl bg-white/50 dark:bg-slate-700/40 px-3 py-2 text-sm"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 dark:text-white truncate">
                                      {op.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {op.description} · {op.timestamp}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeOperation(op.id)}
                                    className="ml-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDeployAll}
                    disabled={deploying}
                    className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
                  >
                    {deploying ? "部署中..." : "全部上传并部署"}
                  </motion.button>
                </div>
              </div>

              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">文章数</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{posts.length}</p>
                    </div>
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">草稿数</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{draftsCount}</p>
                    </div>
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">项目数</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{projectsCount}</p>
                    </div>
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">照片数</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{photosCount}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4">快速入口</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Link href="/editor?id=new" className="rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm text-center py-3 transition-all shadow-lg shadow-indigo-500/25">✏️ 写文章</Link>
                      <Link href="/drafts" className="rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm text-center py-3 transition-all shadow-lg shadow-purple-500/25">📝 草稿箱</Link>
                      <Link href="/settings" className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm text-center py-3 transition-all shadow-lg shadow-amber-500/25">⚙️ 设置</Link>
                      <Link href="/" className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm text-center py-3 transition-all shadow-lg shadow-emerald-500/25">🏠 首页</Link>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-3">系统状态</h3>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>文章分类数</span>
                        <span className="font-bold text-slate-800 dark:text-white">{categories.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>数据加载状态</span>
                        <span className="font-bold text-green-500">{loading ? "加载中..." : "✓ 就绪"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>操作队列待处理</span>
                        <span className="font-bold text-slate-800 dark:text-white">{operations.length} 项</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg">🔐 管理员密码</h3>
                      <button
                        onClick={() => { setShowPasswordForm(!showPasswordForm); setPwMsg(""); }}
                        className="rounded-xl px-4 py-2 font-bold text-sm transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                      >
                        {showPasswordForm ? "收起" : "修改密码"}
                      </button>
                    </div>
                    {showPasswordForm && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">当前密码</label>
                          <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="输入当前密码" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">新密码</label>
                          <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="输入新密码（至少4位）" />
                        </div>
                        {pwMsg && <p className={`text-xs font-bold ${pwMsg.startsWith("✅") ? "text-emerald-600" : "text-red-500"}`}>{pwMsg}</p>}
                        <button onClick={handleChangePassword} disabled={pwChanging} className="w-full rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md disabled:opacity-50">{pwChanging ? "修改中..." : "确认修改"}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "posts" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Link
                      href="/editor?id=new"
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm"
                    >
                      ✏️ 新建文章
                    </Link>
                  </div>

                  <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/20 dark:border-white/10">
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">标题</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hidden sm:table-cell">日期</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hidden md:table-cell">分类</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.length === 0 && !loading && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                暂无文章，点击上方按钮创建第一篇吧～
                              </td>
                            </tr>
                          )}
                          {loading && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                加载中...
                              </td>
                            </tr>
                          )}
                          {posts
                            .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                            .map((post) => (
                              <tr
                                key={post.slug}
                                className="border-b border-white/10 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <Link
                                    href={`/posts/${post.slug}`}
                                    className="font-bold text-slate-800 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                                  >
                                    {post.title}
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                                  {post.date}
                                </td>
                                <td className="px-6 py-4 text-sm hidden md:table-cell">
                                  {post.category && (
                                    <span className="inline-block rounded-xl px-3 py-1 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                      {post.category}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/editor?slug=${post.slug}`}
                                      className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                                    >
                                      编辑
                                    </Link>
                                    <button
                                      onClick={() => setDeleteSlug(post.slug)}
                                      className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {albums.length} 个相册</p>
                    <button
                      onClick={() => { setShowAlbumForm(true); setEditingAlbum(null); }}
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm"
                    >
                      🖼️ 新增相册
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAlbumForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 space-y-4">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg">新增相册</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ID *</label>
                              <input
                                type="text"
                                value={newAlbum.id}
                                onChange={(e) => setNewAlbum({ ...newAlbum, id: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="album-id"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">标题 *</label>
                              <input
                                type="text"
                                value={newAlbum.title}
                                onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="相册标题"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label>
                              <input
                                type="text"
                                value={newAlbum.description}
                                onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="相册描述"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">封面 URL</label>
                              <input
                                type="text"
                                value={newAlbum.cover}
                                onChange={(e) => setNewAlbum({ ...newAlbum, cover: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">日期</label>
                              <input
                                type="text"
                                value={newAlbum.date}
                                onChange={(e) => setNewAlbum({ ...newAlbum, date: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="2024-01-01"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => { setShowAlbumForm(false); setNewAlbum({ id: "", title: "", description: "", cover: "", date: "", photos: [] }); }}
                              className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleAddAlbum}
                              className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.map((album) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden"
                      >
                        {editingAlbum && editingAlbum.id === album.id ? (
                          <div className="p-6 space-y-4">
                            <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑相册</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ID</label>
                                <input
                                  type="text"
                                  value={editingAlbum.id}
                                  onChange={(e) => setEditingAlbum({ ...editingAlbum, id: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">标题</label>
                                <input
                                  type="text"
                                  value={editingAlbum.title}
                                  onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label>
                                <input
                                  type="text"
                                  value={editingAlbum.description || ""}
                                  onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">封面 URL</label>
                                <input
                                  type="text"
                                  value={editingAlbum.cover || ""}
                                  onChange={(e) => setEditingAlbum({ ...editingAlbum, cover: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">日期</label>
                                <input
                                  type="text"
                                  value={editingAlbum.date || ""}
                                  onChange={(e) => setEditingAlbum({ ...editingAlbum, date: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => setEditingAlbum(null)}
                                className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                              >
                                取消
                              </button>
                              <button
                                onClick={handleUpdateAlbum}
                                className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {album.cover && (
                              <img
                                src={album.cover}
                                alt={album.title}
                                className="w-full h-40 object-cover"
                              />
                            )}
                            <div className="p-5">
                              <h3 className="font-black text-slate-800 dark:text-white text-lg truncate">{album.title}</h3>
                              {album.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{album.description}</p>
                              )}
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                {album.photos ? `${album.photos.length} 张照片` : "0 张照片"}
                                {album.date ? ` · ${album.date}` : ""}
                              </p>
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => { setEditingAlbum({ ...album }); setShowAlbumForm(false); }}
                                  className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => setDeleteAlbumId(album.id)}
                                  className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {albums.length === 0 && (
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-lg">暂无相册，点击上方按钮创建～</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {projectsData.length} 个项目</p>
                    <button
                      onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm"
                    >
                      🚀 新增项目
                    </button>
                  </div>

                  <AnimatePresence>
                    {showProjectForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 space-y-4">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg">新增项目</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ID *</label>
                              <input
                                type="text"
                                value={newProject.id}
                                onChange={(e) => setNewProject({ ...newProject, id: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="project-id"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">标题 *</label>
                              <input
                                type="text"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="项目标题"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label>
                              <input
                                type="text"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="项目描述"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">封面 URL</label>
                              <input
                                type="text"
                                value={newProject.cover}
                                onChange={(e) => setNewProject({ ...newProject, cover: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">技术栈（逗号分隔）</label>
                              <input
                                type="text"
                                value={newProject.techs}
                                onChange={(e) => setNewProject({ ...newProject, techs: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="React, TypeScript, Tailwind"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">GitHub URL</label>
                              <input
                                type="text"
                                value={newProject.github}
                                onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Demo URL</label>
                              <input
                                type="text"
                                value={newProject.demo}
                                onChange={(e) => setNewProject({ ...newProject, demo: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">分类</label>
                              <input
                                type="text"
                                value={newProject.category}
                                onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                                className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="frontend / backend / fullstack"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => { setShowProjectForm(false); setNewProject({ id: "", title: "", description: "", cover: "", techs: "", github: "", demo: "", category: "" }); }}
                              className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleAddProject}
                              className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectsData.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden"
                      >
                        {editingProject && editingProject.id === project.id ? (
                          <div className="p-6 space-y-4">
                            <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑项目</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ID</label>
                                <input
                                  type="text"
                                  value={editingProject.id}
                                  onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">标题</label>
                                <input
                                  type="text"
                                  value={editingProject.title}
                                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label>
                                <input
                                  type="text"
                                  value={editingProject.description || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">封面 URL</label>
                                <input
                                  type="text"
                                  value={editingProject.cover || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, cover: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">技术栈（逗号分隔）</label>
                                <input
                                  type="text"
                                  value={Array.isArray(editingProject.techs) ? editingProject.techs.join(", ") : editingProject.techs || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, techs: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">GitHub URL</label>
                                <input
                                  type="text"
                                  value={editingProject.github || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Demo URL</label>
                                <input
                                  type="text"
                                  value={editingProject.demo || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, demo: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">分类</label>
                                <input
                                  type="text"
                                  value={editingProject.category || ""}
                                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                                  className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => setEditingProject(null)}
                                className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                              >
                                取消
                              </button>
                              <button
                                onClick={handleUpdateProject}
                                className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {project.cover && (
                              <img
                                src={project.cover}
                                alt={project.title}
                                className="w-full h-40 object-cover"
                              />
                            )}
                            <div className="p-5">
                              <h3 className="font-black text-slate-800 dark:text-white text-lg truncate">{project.title}</h3>
                              {project.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                              )}
                              {project.techs && Array.isArray(project.techs) && project.techs.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.techs.map((tech: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-block rounded-lg px-2 py-0.5 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {project.category && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">分类: {project.category}</p>
                              )}
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => { setEditingProject({ ...project }); setShowProjectForm(false); }}
                                  className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => setDeleteProjectId(project.id)}
                                  className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {projectsData.length === 0 && (
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-lg">暂无项目，点击上方按钮创建～</p>
                    </div>
                  )}

                <div className="mt-8 pt-6 border-t border-white/20 dark:border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg">🎓 教育经历管理</h3>
                    <button onClick={() => { setShowEducationForm(true); setEditingEducation(null); }} className="rounded-2xl px-4 py-2 font-bold transition-all bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25 text-sm">新增经历</button>
                  </div>
                  <AnimatePresence>
                    {showEducationForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 space-y-4">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg">新增教育经历</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学校 *</label><input type="text" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="学校名称" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学位</label><input type="text" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="硕士 · 计算化学" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">时间段</label><input type="text" value={newEducation.period} onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="2024 - 至今" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label><input type="text" value={newEducation.description} onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="研究方向描述" /></div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowEducationForm(false); setNewEducation({ school: "", degree: "", period: "", description: "" }); }} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                            <button onClick={handleAddEducation} className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">保存</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {educationData.length === 0 ? (
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-12 text-center"><p className="text-slate-500 dark:text-slate-400 text-lg">暂无教育经历，点击上方按钮添加～</p></div>
                  ) : (
                    <div className="space-y-3">
                      {educationData.map((item, index) => (
                        <div key={index} className="rounded-2xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg p-5">
                          {editingEducation === item ? (
                            <div className="space-y-3">
                              <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑教育经历</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学校</label><input type="text" value={editingEducation.school} onChange={(e) => setEditingEducation({ ...editingEducation, school: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学位</label><input type="text" value={editingEducation.degree || ""} onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">时间段</label><input type="text" value={editingEducation.period || ""} onChange={(e) => setEditingEducation({ ...editingEducation, period: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label><input type="text" value={editingEducation.description || ""} onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <button onClick={() => setEditingEducation(null)} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                                <button onClick={handleUpdateEducation} className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">保存</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{item.school}</h4>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{item.degree}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.period}</p>
                                {item.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">{item.description}</p>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <button onClick={() => setEditingEducation(item)} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500">编辑</button>
                                <button onClick={() => handleDeleteEducation(index)} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500">删除</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {deleteSlug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl p-8 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">确认删除</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                确定要删除文章 <span className="font-bold text-slate-800 dark:text-white">{deleteSlug}</span> 吗？此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteSlug(null)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteSlug)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteAlbumId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl p-8 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">确认删除</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                确定要删除相册 <span className="font-bold text-slate-800 dark:text-white">{deleteAlbumId}</span> 吗？此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteAlbumId(null)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteAlbum(deleteAlbumId)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteProjectId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-2xl p-8 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">确认删除</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                确定要删除项目 <span className="font-bold text-slate-800 dark:text-white">{deleteProjectId}</span> 吗？此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteProjectId(null)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteProjectId)}
                  className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingPlayer />
    </div>
  );
}
