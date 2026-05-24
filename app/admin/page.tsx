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

type TabKey = "dashboard" | "posts" | "gallery" | "projects" | "education" | "friends" | "music" | "settings";

const menuItems: { key: TabKey; label: string; svg: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "全息仪表盘",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "posts",
    label: "文章与草稿",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    key: "gallery",
    label: "光影画廊",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
  },
  {
    key: "projects",
    label: "项目管理",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
  },
  {
    key: "education",
    label: "教育经历",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    key: "friends",
    label: "友链管理",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    key: "music",
    label: "音乐管理",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "系统设置",
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
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
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);

  const [musicForm, setMusicForm] = useState({ cloudMusicIds: siteConfig.cloudMusicIds ? siteConfig.cloudMusicIds.join("\n") : "" });
  const [musicApplying, setMusicApplying] = useState(false);
  const [musicSaving, setMusicSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    authorName: siteConfig.authorName || "",
    bio: siteConfig.bio || "",
    avatarUrl: siteConfig.avatarUrl || "",
    github: siteConfig.social?.github || "",
    email: siteConfig.social?.email || "",
    qq: siteConfig.social?.qq || "",
    wechat: siteConfig.social?.wechat || "",
    friendLinkApplyFormat: siteConfig.friendLinkApplyFormat || "",
    friendLinkIntro: siteConfig.friendLinkIntro || "",
  });
  const [profileApplying, setProfileApplying] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [backgroundForm, setBackgroundForm] = useState({
    themeColors: siteConfig.themeColors ? siteConfig.themeColors.join(", ") : "",
    bgImages: siteConfig.bgImages ? siteConfig.bgImages.join("\n") : "",
    bgBlur: siteConfig.bgBlur ?? 8,
  });
  const [bgApplying, setBgApplying] = useState(false);
  const [bgSaving, setBgSaving] = useState(false);

  const [footerForm, setFooterForm] = useState({
    buildDate: siteConfig.buildDate || "",
    icpName: siteConfig.icpConfig?.name || "",
    icpLink: siteConfig.icpConfig?.link || "",
  });
  const [footerApplying, setFooterApplying] = useState(false);
  const [footerSaving, setFooterSaving] = useState(false);

  const [commentForm, setCommentForm] = useState({
    clientID: siteConfig.gitalkConfig?.clientID || "",
    clientSecret: siteConfig.gitalkConfig?.clientSecret || "",
    repo: siteConfig.gitalkConfig?.repo || "",
    owner: siteConfig.gitalkConfig?.owner || "",
  });
  const [commentApplying, setCommentApplying] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  const [newPhoto, setNewPhoto] = useState({ src: "", caption: "" });
  const [friendsData, setFriendsData] = useState<{ name: string; url: string; avatar: string; description: string }[]>([]);
  const [editingFriend, setEditingFriend] = useState<any | null>(null);
  const [editingFriendIndex, setEditingFriendIndex] = useState<number | null>(null);
  const [showFriendForm, setShowFriendForm] = useState(false);
  const [newFriend, setNewFriend] = useState({ name: "", url: "", avatar: "", description: "" });

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
    fetch("/api/friends").then(r => r.json()).then(d => {
      if (d.friends) setFriendsData(d.friends);
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
        showToast("\u2705 全部配置已写入 siteConfig.ts！运行 npm run build 后永久生效", "success");
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
        setPwMsg("\u2705 " + data.message);
        setPwCurrent("");
        setPwNew("");
        setShowPasswordForm(false);
        showToast("密码已修改", "success");
      } else {
        setPwMsg("\u274c " + (data.error || "修改失败"));
      }
    } catch {
      setPwMsg("\u274c 网络错误");
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
      a.id === editingAlbum.id ? { ...editingAlbum, photos: editingAlbum.photos || [] } : a
    );
    saveAlbums(updated);
    setEditingAlbum(null);
  };

  const handleDeleteAlbum = (id: string) => {
    const updated = albums.filter((a) => a.id !== id);
    saveAlbums(updated);
    setDeleteAlbumId(null);
  };

  const handleAddPhotoToAlbum = () => {
    if (!editingAlbum || !newPhoto.src) {
      showToast("请填写照片 URL", "error");
      return;
    }
    const currentPhotos = editingAlbum.photos || [];
    const updatedPhotos = [...currentPhotos, { src: newPhoto.src, caption: newPhoto.caption }];
    setEditingAlbum({ ...editingAlbum, photos: updatedPhotos });
    setNewPhoto({ src: "", caption: "" });
    showToast("照片已添加（请点击上方保存按钮以持久化）", "success");
  };

  const handleDeletePhotoFromAlbum = (index: number) => {
    if (!editingAlbum) return;
    const currentPhotos = editingAlbum.photos || [];
    const updatedPhotos = currentPhotos.filter((_: any, i: number) => i !== index);
    setEditingAlbum({ ...editingAlbum, photos: updatedPhotos });
    showToast("照片已删除（请点击上方保存按钮以持久化）", "info");
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
    if (editingEducation == null || editingEducationIndex == null) return;
    const updated = educationData.map((e, i) =>
      i === editingEducationIndex ? { ...editingEducation } : e
    );
    saveEducation(updated);
    setEditingEducation(null);
    setEditingEducationIndex(null);
  };

  const handleDeleteEducation = (index: number) => {
    const updated = educationData.filter((_, i) => i !== index);
    saveEducation(updated);
  };

  const handleApplyMusic = () => {
    setMusicApplying(true);
    try {
      const ids = musicForm.cloudMusicIds.split("\n").map((s) => s.trim()).filter(Boolean);
      const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
      existing.cloudMusicIds = ids;
      localStorage.setItem("site-settings", JSON.stringify(existing));
      window.dispatchEvent(new Event("site-settings-changed"));
      showToast("音乐ID已应用到本地", "success");
    } catch {
      showToast("应用失败", "error");
    } finally {
      setMusicApplying(false);
    }
  };

  const handleSaveMusic = async () => {
    setMusicSaving(true);
    try {
      const ids = musicForm.cloudMusicIds
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloudMusicIds: ids }),
      });
      const data = await res.json();
      if (data.success) {
        const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
        existing.cloudMusicIds = ids;
        localStorage.setItem("site-settings", JSON.stringify(existing));
        window.dispatchEvent(new Event("site-settings-changed"));
        showToast("\u2705 音乐配置已保存到服务器", "success");
      } else {
        showToast("保存失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到服务器", "error");
    } finally {
      setMusicSaving(false);
    }
  };

  const handleApplyProfile = () => {
    setProfileApplying(true);
    try {
      const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
      Object.assign(existing, {
        authorName: profileForm.authorName,
        bio: profileForm.bio,
        avatarUrl: profileForm.avatarUrl,
        github: profileForm.github,
        email: profileForm.email,
        qq: profileForm.qq,
        wechat: profileForm.wechat,
        friendLinkApplyFormat: profileForm.friendLinkApplyFormat,
        friendLinkIntro: profileForm.friendLinkIntro,
      });
      localStorage.setItem("site-settings", JSON.stringify(existing));
      window.dispatchEvent(new Event("site-settings-changed"));
      showToast("个人资料已应用到本地", "success");
    } catch {
      showToast("应用失败", "error");
    } finally {
      setProfileApplying(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: profileForm.authorName,
          bio: profileForm.bio,
          avatarUrl: profileForm.avatarUrl,
          social: {
            github: profileForm.github,
            email: profileForm.email,
            qq: profileForm.qq,
            wechat: profileForm.wechat,
          },
          friendLinkApplyFormat: profileForm.friendLinkApplyFormat,
          friendLinkIntro: profileForm.friendLinkIntro,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("\u2705 个人资料已保存到服务器", "success");
      } else {
        showToast("保存失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到服务器", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleApplyBackground = () => {
    setBgApplying(true);
    try {
      const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
      Object.assign(existing, {
        themeColors: backgroundForm.themeColors.split(",").map((s) => s.trim()).filter(Boolean),
        bgImages: backgroundForm.bgImages.split("\n").map((s) => s.trim()).filter(Boolean),
        bgBlur: Number(backgroundForm.bgBlur),
      });
      localStorage.setItem("site-settings", JSON.stringify(existing));
      window.dispatchEvent(new Event("site-settings-changed"));
      showToast("背景设置已应用到本地", "success");
    } catch {
      showToast("应用失败", "error");
    } finally {
      setBgApplying(false);
    }
  };

  const handleSaveBackground = async () => {
    setBgSaving(true);
    try {
      const themeColors = backgroundForm.themeColors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const bgImages = backgroundForm.bgImages
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeColors,
          bgImages,
          bgBlur: Number(backgroundForm.bgBlur),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("\u2705 背景设置已保存到服务器", "success");
      } else {
        showToast("保存失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到服务器", "error");
    } finally {
      setBgSaving(false);
    }
  };

  const handleApplyFooter = () => {
    setFooterApplying(true);
    try {
      const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
      Object.assign(existing, {
        buildDate: footerForm.buildDate,
        icpName: footerForm.icpName,
        icpLink: footerForm.icpLink,
      });
      localStorage.setItem("site-settings", JSON.stringify(existing));
      window.dispatchEvent(new Event("site-settings-changed"));
      showToast("页脚设置已应用到本地", "success");
    } catch {
      showToast("应用失败", "error");
    } finally {
      setFooterApplying(false);
    }
  };

  const handleSaveFooter = async () => {
    setFooterSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildDate: footerForm.buildDate,
          icpConfig: {
            name: footerForm.icpName,
            link: footerForm.icpLink,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("\u2705 页脚设置已保存到服务器", "success");
      } else {
        showToast("保存失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到服务器", "error");
    } finally {
      setFooterSaving(false);
    }
  };

  const handleApplyComment = () => {
    setCommentApplying(true);
    try {
      const existing = JSON.parse(localStorage.getItem("site-settings") || "{}");
      Object.assign(existing, {
        clientID: commentForm.clientID,
        clientSecret: commentForm.clientSecret,
        repo: commentForm.repo,
        owner: commentForm.owner,
      });
      localStorage.setItem("site-settings", JSON.stringify(existing));
      window.dispatchEvent(new Event("site-settings-changed"));
      showToast("评论设置已应用到本地", "success");
    } catch {
      showToast("应用失败", "error");
    } finally {
      setCommentApplying(false);
    }
  };

  const handleSaveComment = async () => {
    setCommentSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gitalkConfig: {
            clientID: commentForm.clientID,
            clientSecret: commentForm.clientSecret,
            repo: commentForm.repo,
            owner: commentForm.owner,
            admin: [commentForm.owner || ""],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("\u2705 评论设置已保存到服务器", "success");
      } else {
        showToast("保存失败: " + (data.error || "未知错误"), "error");
      }
    } catch {
      showToast("无法连接到服务器", "error");
    } finally {
      setCommentSaving(false);
    }
  };

  const saveFriends = async (updated: any[]) => {
    setFriendsData(updated);
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friends: updated }),
    });
    showToast("友链已保存", "success");
  };

  const handleAddFriend = () => {
    if (!newFriend.name || !newFriend.url) { showToast("请至少填写名称和链接", "info"); return; }
    const updated = [...friendsData, { ...newFriend }];
    saveFriends(updated);
    setNewFriend({ name: "", url: "", avatar: "", description: "" });
    setShowFriendForm(false);
  };

  const handleUpdateFriend = () => {
    if (editingFriend == null || editingFriendIndex == null) return;
    const updated = friendsData.map((e, i) =>
      i === editingFriendIndex ? { ...editingFriend } : e
    );
    saveFriends(updated);
    setEditingFriend(null);
    setEditingFriendIndex(null);
  };

  const handleDeleteFriend = (index: number) => {
    const updated = friendsData.filter((_, i) => i !== index);
    saveFriends(updated);
  };

  const handleDeleteMusicId = (index: number) => {
    const ids = musicForm.cloudMusicIds
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    ids.splice(index, 1);
    setMusicForm({ cloudMusicIds: ids.join("\n") });
  };

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const draftsCount = 0;

  return (
    <div className="min-h-screen relative pb-10">
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-28 space-y-4">
                <div className="glass-card-elevated rounded-2xl p-6 text-center">
                  <div className="relative inline-block">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur-sm" />
                    <img
                      src={siteConfig.avatarUrl}
                      alt="avatar"
                      className="relative w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-white/60 dark:ring-white/20"
                    />
                  </div>
                  <h2 className="mt-3 font-black text-slate-800 dark:text-white text-lg">
                    {siteConfig.authorName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wider">CMS ADMIN</p>
                </div>

                <nav className="glass-card rounded-2xl p-3 space-y-1">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full text-left rounded-xl px-4 py-3 font-bold text-sm transition-all duration-300 flex items-center gap-3 ${
                        activeTab === item.key
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white translate-x-2 shadow-lg shadow-indigo-500/25"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/8 hover:translate-x-1"
                      }`}
                    >
                      <span className="flex-shrink-0">{item.svg}</span>
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
                      className={`flex-shrink-0 rounded-2xl px-4 py-2 font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeTab === item.key
                          ? "bg-indigo-500 text-white shadow-md"
                          : "bg-white/40 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 border border-white/40 dark:border-white/10"
                      }`}
                    >
                      <span className="flex-shrink-0">{item.svg}</span>
                      {item.label}
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
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
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
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
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

              {/* ============================ DASHBOARD ============================ */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "文章数", value: posts.length, color: "from-indigo-500 to-blue-500" },
                      { label: "草稿数", value: draftsCount, color: "from-purple-500 to-pink-500" },
                      { label: "项目数", value: projectsData.length, color: "from-emerald-500 to-teal-500" },
                      { label: "照片数", value: siteConfig.counts?.photos || 0, color: "from-amber-500 to-orange-500" },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="glass-card rounded-2xl p-5 relative overflow-hidden group cursor-default"
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity duration-500`} />
                        <div className="relative z-10">
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                          <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4">快速入口</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { href: "/editor?id=new", label: "写文章", color: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25" },
                        { href: "/drafts", label: "草稿箱", color: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/25" },
                        { onClick: () => setActiveTab("settings"), label: "设置", color: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25" },
                        { href: "/", label: "首页", color: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25" },
                      ].map((btn) =>
                        btn.href ? (
                          <Link
                            key={btn.label}
                            href={btn.href}
                            className={`rounded-2xl text-white font-bold text-sm text-center py-3 transition-all duration-300 shadow-lg ${btn.color} hover:scale-105 hover:-translate-y-0.5 active:scale-95`}
                          >
                            {btn.label}
                          </Link>
                        ) : (
                          <button
                            key={btn.label}
                            onClick={btn.onClick}
                            className={`rounded-2xl text-white font-bold text-sm text-center py-3 transition-all duration-300 shadow-lg ${btn.color} hover:scale-105 hover:-translate-y-0.5 active:scale-95`}
                          >
                            {btn.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-3">系统状态</h3>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                      {[
                        { label: "文章分类数", value: categories.length },
                        { label: "数据加载状态", value: loading ? "加载中..." : "就绪", color: loading ? "text-amber-500" : "text-emerald-500" },
                        { label: "操作队列待处理", value: `${operations.length} 项` },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/10 dark:border-white/5 last:border-0">
                          <span>{item.label}</span>
                          <span className={`font-bold text-slate-800 dark:text-white ${item.color || ""}`}>
                            {item.value === "就绪" && "✓ "}{item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg">
                        <svg className="w-5 h-5 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        管理员密码
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowPasswordForm(!showPasswordForm); setPwMsg(""); }}
                        className="rounded-xl px-4 py-2 font-bold text-sm transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                      >
                        {showPasswordForm ? "收起" : "修改密码"}
                      </motion.button>
                    </div>
                    {showPasswordForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 mt-3"
                      >
                        <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">当前密码</label>
                          <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="输入当前密码" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">新密码</label>
                          <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="输入新密码（至少4位）" />
                        </div>
                        {pwMsg && <p className={`text-xs font-bold ${pwMsg.startsWith("\u2705") ? "text-emerald-600" : "text-red-500"}`}>{pwMsg}</p>}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword} disabled={pwChanging} className="w-full rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md disabled:opacity-50">{pwChanging ? "修改中..." : "确认修改"}</motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================ POSTS ============================ */}
              {activeTab === "posts" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Link
                      href="/editor?id=new"
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      新建文章
                    </Link>
                  </div>

                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/3">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">标题</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">日期</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">分类</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.length === 0 && !loading && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                暂无文章，点击上方按钮创建第一篇吧
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

              {/* ============================ GALLERY ============================ */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {albums.length} 个相册</p>
                    <button
                      onClick={() => { setShowAlbumForm(true); setEditingAlbum(null); }}
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      新增相册
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
                        whileHover={{ y: -4 }}
                        className="glass-card rounded-2xl overflow-hidden group"
                      >
                        {editingAlbum && editingAlbum.id === album.id ? (
                          <div className="p-6 space-y-4">
                            <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑相册</h3>

                            {/* Album fields */}
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

                            {/* Photo Management Section */}
                            <div className="pt-4 border-t border-white/20 dark:border-white/10">
                              <h4 className="font-black text-slate-800 dark:text-white text-base mb-3">
                                照片管理 ({(editingAlbum.photos || []).length} 张)
                              </h4>

                              {/* Existing photos list */}
                              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                {(editingAlbum.photos || []).length === 0 ? (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">暂无照片</p>
                                ) : (
                                  (editingAlbum.photos || []).map((photo: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 rounded-xl bg-white/40 dark:bg-slate-700/30 p-2"
                                    >
                                      <img
                                        src={photo.src}
                                        alt={photo.caption || `photo-${idx}`}
                                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{photo.src}</p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{photo.caption || "无标题"}</p>
                                      </div>
                                      <button
                                        onClick={() => handleDeletePhotoFromAlbum(idx)}
                                        className="flex-shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <polyline points="3,6 5,6 21,6" />
                                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Add photo form */}
                              <div className="rounded-xl bg-white/20 dark:bg-slate-700/20 p-3 space-y-2">
                                <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">添加照片</h5>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newPhoto.src}
                                    onChange={(e) => setNewPhoto({ ...newPhoto, src: e.target.value })}
                                    className="flex-1 rounded-lg px-3 py-1.5 text-xs bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="照片 URL *"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newPhoto.caption}
                                    onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                                    className="flex-1 rounded-lg px-3 py-1.5 text-xs bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="照片标题（可选）"
                                  />
                                  <button
                                    onClick={handleAddPhotoToAlbum}
                                    className="rounded-lg px-3 py-1.5 text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-all flex-shrink-0"
                                  >
                                    添加
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                              <button
                                onClick={() => { setEditingAlbum(null); setNewPhoto({ src: "", caption: "" }); }}
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
                                  onClick={() => { setEditingAlbum({ ...album }); setShowAlbumForm(false); setNewPhoto({ src: "", caption: "" }); }}
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
                      <p className="text-slate-500 dark:text-slate-400 text-lg">暂无相册，点击上方按钮创建</p>
                    </div>
                  )}
                </div>
              )}

              {/* ============================ PROJECTS ============================ */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {projectsData.length} 个项目</p>
                    <button
                      onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 text-sm inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      新增项目
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
                        whileHover={{ y: -4 }}
                        className="glass-card rounded-2xl overflow-hidden group"
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
                      <p className="text-slate-500 dark:text-slate-400 text-lg">暂无项目，点击上方按钮创建</p>
                    </div>
                  )}
                </div>
              )}

              {/* ============================ EDUCATION ============================ */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {educationData.length} 条记录</p>
                    <button
                      onClick={() => { setShowEducationForm(true); setEditingEducation(null); setEditingEducationIndex(null); }}
                      className="rounded-2xl px-4 py-2 font-bold transition-all bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25 text-sm inline-flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      新增经历
                    </button>
                  </div>

                  <AnimatePresence>
                    {showEducationForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 space-y-4">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg">新增教育经历</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学校 *</label>
                              <input type="text" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="学校名称" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学位</label>
                              <input type="text" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="硕士 · 计算化学" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">时间段</label>
                              <input type="text" value={newEducation.period} onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="2024 - 至今" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label>
                              <input type="text" value={newEducation.description} onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="研究方向描述" />
                            </div>
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
                    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-lg">暂无教育经历，点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {educationData.map((item, index) => (
                        <div key={index} className="glass-card rounded-2xl p-5">
                          {editingEducationIndex === index ? (
                            <div className="space-y-3">
                              <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑教育经历</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学校</label><input type="text" value={editingEducation.school} onChange={(e) => setEditingEducation({ ...editingEducation, school: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">学位</label><input type="text" value={editingEducation.degree || ""} onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">时间段</label><input type="text" value={editingEducation.period || ""} onChange={(e) => setEditingEducation({ ...editingEducation, period: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label><input type="text" value={editingEducation.description || ""} onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <button onClick={() => { setEditingEducation(null); setEditingEducationIndex(null); }} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
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
                                <button onClick={() => { setEditingEducation(item); setEditingEducationIndex(index); }} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500">编辑</button>
                                <button onClick={() => handleDeleteEducation(index)} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500">删除</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================ FRIENDS ============================ */}
              {activeTab === "friends" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">共 {friendsData.length} 个友链</p>
                    <button onClick={() => { setShowFriendForm(true); setEditingFriend(null); setEditingFriendIndex(null); }} className="rounded-2xl px-4 py-2 font-bold transition-all bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25 text-sm">新增友链</button>
                  </div>
                  <AnimatePresence>
                    {showFriendForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                        <div className="glass-card rounded-2xl p-6 space-y-4">
                          <h3 className="font-black text-slate-800 dark:text-white text-lg">新增友链</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">名称 *</label><input type="text" value={newFriend.name} onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="博客名称" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">链接 *</label><input type="text" value={newFriend.url} onChange={(e) => setNewFriend({ ...newFriend, url: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="https://..." /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">头像 URL</label><input type="text" value={newFriend.avatar} onChange={(e) => setNewFriend({ ...newFriend, avatar: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="https://..." /></div>
                            <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label><input type="text" value={newFriend.description} onChange={(e) => setNewFriend({ ...newFriend, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="博客描述" /></div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowFriendForm(false); setNewFriend({ name: "", url: "", avatar: "", description: "" }); }} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                            <button onClick={handleAddFriend} className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">保存</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {friendsData.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center"><p className="text-slate-500 dark:text-slate-400 text-lg">暂无友链，点击上方按钮添加～</p></div>
                  ) : (
                    <div className="space-y-3">
                      {friendsData.map((item, index) => (
                        <div key={index} className="glass-card rounded-2xl p-5">
                          {editingFriendIndex === index ? (
                            <div className="space-y-3">
                              <h3 className="font-black text-slate-800 dark:text-white text-lg">编辑友链</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">名称</label><input type="text" value={editingFriend.name} onChange={(e) => setEditingFriend({ ...editingFriend, name: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">链接</label><input type="text" value={editingFriend.url || ""} onChange={(e) => setEditingFriend({ ...editingFriend, url: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">头像</label><input type="text" value={editingFriend.avatar || ""} onChange={(e) => setEditingFriend({ ...editingFriend, avatar: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                                <div><label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">描述</label><input type="text" value={editingFriend.description || ""} onChange={(e) => setEditingFriend({ ...editingFriend, description: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" /></div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <button onClick={() => { setEditingFriend(null); setEditingFriendIndex(null); }} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                                <button onClick={handleUpdateFriend} className="rounded-xl px-4 py-2 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">保存</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                {item.avatar && <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/60 dark:border-white/20 flex-shrink-0" />}
                                <div>
                                  <h4 className="font-bold text-slate-800 dark:text-white">{item.name}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{item.url}</p>
                                  {item.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <button onClick={() => { setEditingFriend(item); setEditingFriendIndex(index); }} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500">编辑</button>
                                <button onClick={() => handleDeleteFriend(index)} className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500">删除</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================ MUSIC ============================ */}
              {activeTab === "music" && (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-3">云音乐 ID 管理</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      每行一个网易云音乐歌单/歌曲 ID，修改后请点击"立即应用"或"保存到服务器"
                    </p>

                    <textarea
                      value={musicForm.cloudMusicIds}
                      onChange={(e) => setMusicForm({ cloudMusicIds: e.target.value })}
                      rows={8}
                      className="w-full rounded-xl px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm resize-y"
                      placeholder="1809646618&#10;3361076230&#10;1859390262"
                    />

                    <div className="flex flex-wrap gap-3 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApplyMusic}
                        disabled={musicApplying}
                        className="rounded-xl px-5 py-2.5 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm"
                      >
                        {musicApplying ? "应用中..." : "立即应用"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveMusic}
                        disabled={musicSaving}
                        className="rounded-xl px-5 py-2.5 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm"
                      >
                        {musicSaving ? "保存中..." : "保存到服务器"}
                      </motion.button>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-3">
                      当前 ID 列表
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                        ({musicForm.cloudMusicIds.split("\n").filter(Boolean).length} 个)
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {musicForm.cloudMusicIds.split("\n").filter(Boolean).length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">暂无音乐 ID</p>
                      ) : (
                        musicForm.cloudMusicIds.split("\n").filter(Boolean).map((id, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl bg-white/40 dark:bg-slate-700/30 px-4 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-mono text-sm text-slate-800 dark:text-white">{id.trim()}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteMusicId(idx)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================ SETTINGS ============================ */}
              {activeTab === "settings" && (
                <div className="space-y-6">

                  {/* Profile Section */}
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      个人资料
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">昵称</label>
                        <input type="text" value={profileForm.authorName} onChange={(e) => setProfileForm({ ...profileForm, authorName: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="作者名称" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">头像 URL</label>
                        <input type="text" value={profileForm.avatarUrl} onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="https://..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">个人简介</label>
                        <input type="text" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="个人简介" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">GitHub</label>
                        <input type="text" value={profileForm.github} onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="https://github.com/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">邮箱</label>
                        <input type="text" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="email@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">QQ</label>
                        <input type="text" value={profileForm.qq} onChange={(e) => setProfileForm({ ...profileForm, qq: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="QQ号" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">微信</label>
                        <input type="text" value={profileForm.wechat} onChange={(e) => setProfileForm({ ...profileForm, wechat: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="微信号" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">友链申请格式</label>
                        <textarea value={profileForm.friendLinkApplyFormat} onChange={(e) => setProfileForm({ ...profileForm, friendLinkApplyFormat: e.target.value })} rows={3} className="w-full rounded-xl px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-y" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">友链申请介绍</label>
                        <textarea value={profileForm.friendLinkIntro} onChange={(e) => setProfileForm({ ...profileForm, friendLinkIntro: e.target.value })} rows={2} className="w-full rounded-xl px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-y" placeholder="欢迎交换友链！请按照以下格式在评论区留言～" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyProfile} disabled={profileApplying} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm">{profileApplying ? "应用中..." : "立即应用"}</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={profileSaving} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm">{profileSaving ? "保存中..." : "保存到服务器"}</motion.button>
                    </div>
                  </div>

                  {/* Background Section */}
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                      背景设置
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">主题颜色（逗号分隔）</label>
                        <input type="text" value={backgroundForm.themeColors} onChange={(e) => setBackgroundForm({ ...backgroundForm, themeColors: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="#a18cd1, #fbc2eb, #a1c4fd, #c2e9fb" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">背景图片 URL（每行一个）</label>
                        <textarea value={backgroundForm.bgImages} onChange={(e) => setBackgroundForm({ ...backgroundForm, bgImages: e.target.value })} rows={4} className="w-full rounded-xl px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-y" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                          背景模糊度: <span className="text-indigo-600 dark:text-indigo-400">{backgroundForm.bgBlur}</span>
                        </label>
                        <input type="range" min="0" max="30" value={backgroundForm.bgBlur} onChange={(e) => setBackgroundForm({ ...backgroundForm, bgBlur: Number(e.target.value) })} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyBackground} disabled={bgApplying} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm">{bgApplying ? "应用中..." : "立即应用"}</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveBackground} disabled={bgSaving} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm">{bgSaving ? "保存中..." : "保存到服务器"}</motion.button>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      页脚设置
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">建站日期</label>
                        <input type="text" value={footerForm.buildDate} onChange={(e) => setFooterForm({ ...footerForm, buildDate: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="2026-03-23T00:00:00" />
                      </div>
                      <div />
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ICP 备案名称</label>
                        <input type="text" value={footerForm.icpName} onChange={(e) => setFooterForm({ ...footerForm, icpName: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="萌ICP备 20260240号" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">ICP 链接</label>
                        <input type="text" value={footerForm.icpLink} onChange={(e) => setFooterForm({ ...footerForm, icpLink: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="https://icp.gov.moe/..." />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyFooter} disabled={footerApplying} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm">{footerApplying ? "应用中..." : "立即应用"}</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveFooter} disabled={footerSaving} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm">{footerSaving ? "保存中..." : "保存到服务器"}</motion.button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      评论系统 (Gitalk)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Client ID</label>
                        <input type="text" value={commentForm.clientID} onChange={(e) => setCommentForm({ ...commentForm, clientID: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="GitHub OAuth App Client ID" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Client Secret</label>
                        <input type="password" value={commentForm.clientSecret} onChange={(e) => setCommentForm({ ...commentForm, clientSecret: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="GitHub OAuth App Client Secret" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">仓库名</label>
                        <input type="text" value={commentForm.repo} onChange={(e) => setCommentForm({ ...commentForm, repo: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="my-blog" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Owner</label>
                        <input type="text" value={commentForm.owner} onChange={(e) => setCommentForm({ ...commentForm, owner: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="GitHub 用户名" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyComment} disabled={commentApplying} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm">{commentApplying ? "应用中..." : "立即应用"}</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveComment} disabled={commentSaving} className="rounded-xl px-5 py-2.5 font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm">{commentSaving ? "保存中..." : "保存到服务器"}</motion.button>
                    </div>
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
                确定要删除文章 <span className="font-bold text-slate-800 dark:text-white">{deleteSlug}</span> 吗?此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteSlug(null)} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                <button onClick={() => handleDelete(deleteSlug)} className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md">确认删除</button>
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
                确定要删除相册 <span className="font-bold text-slate-800 dark:text-white">{deleteAlbumId}</span> 吗?此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteAlbumId(null)} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                <button onClick={() => handleDeleteAlbum(deleteAlbumId)} className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md">确认删除</button>
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
                确定要删除项目 <span className="font-bold text-slate-800 dark:text-white">{deleteProjectId}</span> 吗?此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteProjectId(null)} className="rounded-xl px-4 py-2 font-bold transition-all bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600">取消</button>
                <button onClick={() => handleDeleteProject(deleteProjectId)} className="rounded-xl px-4 py-2 font-bold transition-all bg-red-500 text-white hover:bg-red-600 shadow-md">确认删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingPlayer />
    </div>
  );
}
