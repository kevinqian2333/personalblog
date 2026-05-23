# 无敌猫猫拳の幻想乡 — 个人博客系统

基于 **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4** 构建的磨砂玻璃（Glassmorphism）风格个人博客。

## 功能概述

| 模块 | 描述 |
|------|------|
| 🏠 **首页** | 个人信息卡片 + 云端音乐播放器 + 文章轮播 + 照片墙预览 + 系统运行时间统计 |
| 📝 **博客** | Markdown 文章渲染（代码高亮 + 数学公式）、分类筛选、全文搜索、归档时间线 |
| 🚀 **项目** | 项目卡片展示，技术栈标签，GitHub/演示链接 |
| 🖼️ **照片墙** | 瀑布流布局，Lightbox 全屏查看，相册分类 |
| 🔗 **友链** | 友链卡片，申请格式展示 |
| 👤 **关于** | 个人简介、教育经历时间线、联系方式 |
| 🎵 **音乐** | 完整播放器（歌词、进度条、音量、播放模式）、网易云外链 |
| 🎨 **主题** | 明暗双主题切换，深空背景 + 流萤/樱花粒子特效 |
| 🐱 **AI 猫娘** | 右下角 DeepSeek 接口聊天助手，支持自定义 system prompt |
| ⚙️ **管理后台** | 文章 CRUD、相册管理、项目管理、站点配置、背景模糊度调节、操作队列部署 |

## 技术栈

### 前端框架
- **Next.js 16.2** — React 全栈框架（App Router + Server Components）
- **React 19** — 最新 React 版本
- **TypeScript 5** — 类型安全

### UI & 样式
- **Tailwind CSS v4** — 原子化 CSS 框架
- **Framer Motion 12** — 动画库（页面过渡、移动端菜单、操作队列）
- **Lucide React** — 图标库
- **Glassmorphism** — 磨砂玻璃风格（backdrop-blur + 半透明 + 细边框）

### 内容渲染
- **remark** + **rehype** — Markdown → HTML 渲染管线
- **remark-gfm** — GitHub Flavored Markdown
- **remark-math** + **rehype-katex** — 数学公式支持
- **rehype-highlight** + **highlight.js** — 代码语法高亮
- **gray-matter** — Markdown 前置元数据解析

### 编辑器
- **TipTap** — 基于 ProseMirror 的富文本编辑器
- 扩展：StarterKit、Image、Link、Placeholder、Underline、Highlight、TextAlign、TaskList

### 音乐
- 网易云音乐 API（injahow/meting）
- LRC 歌词解析
- 自定义 Audio 播放控制

### 3D & 特效
- **Three.js** + **@react-three/drei** + **@react-three/fiber**
- Canvas 粒子系统：萤火虫（流萤）、樱花、草地
- 鼠标点击涟漪波纹（Canvas Ripple + Particle）

### AI
- **DeepSeek Chat API** — 猫娘聊天助手

### 后端 API
- `/api/posts` — 文章 CRUD
- `/api/config` — 站点配置读写
- `/api/albums` — 相册管理
- `/api/projects` — 项目管理

## 项目目录结构

```
my-blog/
├── app/
│   ├── api/
│   │   ├── albums/route.ts          # 相册管理 API
│   │   ├── config/route.ts          # 站点配置 API
│   │   ├── posts/
│   │   │   ├── route.ts             # 文章列表 API
│   │   │   └── [slug]/route.ts      # 单篇文章 API
│   │   └── projects/route.ts        # 项目管理 API
│   ├── about/page.tsx               # 关于页面
│   ├── admin/page.tsx               # 管理后台
│   ├── drafts/page.tsx              # 草稿管理
│   ├── editor/page.tsx              # TipTap 编辑器
│   ├── friends/page.tsx             # 友链页面
│   ├── music/page.tsx               # 音乐播放器
│   ├── photowall/page.tsx           # 照片墙
│   ├── posts/
│   │   ├── page.tsx                 # 博客列表
│   │   └── [slug]/page.tsx          # 文章详情
│   ├── projects/page.tsx            # 项目展示
│   ├── settings/page.tsx            # 站点设置
│   ├── timeline/page.tsx            # 归档时间线
│   ├── globals.css                  # 全局样式
│   ├── layout.tsx                   # 根布局
│   └── page.tsx                     # 首页
├── components/
│   ├── BackgroundEffects.tsx        # 粒子特效切换
│   ├── BackgroundSlider.tsx         # 背景图片轮播
│   ├── ClickEffect.tsx              # 点击涟漪
│   ├── ClientSocials.tsx            # 社交按钮
│   ├── CloudPlayer.tsx              # 首页播放器卡片
│   ├── CyberCat.tsx                 # AI 猫娘助手
│   ├── Fireflies.tsx                # 流萤飞舞
│   ├── FloatingPlayer.tsx           # 全局悬浮播放器
│   ├── LatestChatterCarousel.tsx    # 说说轮播
│   ├── LatestPostsCarousel.tsx      # 文章轮播
│   ├── LyricBar.tsx                 # 歌词条
│   ├── MusicProvider.tsx            # 音乐状态管理
│   ├── Navbar.tsx                   # 导航栏
│   ├── PageTransition.tsx           # 页面过渡
│   ├── PostsFilter.tsx              # 文章分类筛选
│   ├── ProfileCard.tsx              # 个人信息卡片
│   ├── Sakura.tsx                   # 樱花飘落
│   ├── SearchBar.tsx                # 搜索栏
│   ├── SiteDashboard.tsx            # 首页数据面板
│   ├── SplashScreen.tsx             # 启动动画
│   ├── ThemeProvider.tsx            # 主题管理
│   ├── ThemeToggleBlock.tsx         # 快速导航
│   ├── ToastProvider.tsx            # Toast 通知
│   └── WindyGrass.tsx               # 草地动画
├── context/
│   └── OperationContext.tsx         # 操作队列上下文
├── data/
│   ├── albums.ts                    # 相册数据
│   ├── friends.ts                   # 友链数据
│   └── projects.ts                  # 项目数据
├── lib/
│   ├── config.ts                    # 本地配置读取
│   └── types.ts                     # 共享类型定义
├── posts/                           # Markdown 文章
│   ├── hello-world.md
│   ├── nextjs-16-features.md
│   └── gromacs-guide.md
├── siteConfig.ts                    # 站点全局配置
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build --webpack

# 启动生产服务器
npm start
```

## 部署

### Vercel（推荐）
1. 将项目推送到 GitHub
2. 在 Vercel 中导入仓库
3. Build Command: `npm run build`
4. Output Directory: `.next`

### GitHub Pages
1. 修改 `next.config.ts` 添加 `output: 'export'`
2. 运行 `npm run build`
3. 将 `out/` 目录部署到 GitHub Pages

## 内容管理

### 添加文章
- 在 `posts/` 目录下创建 `.md` 文件
- 使用 frontmatter 元数据：
```yaml
---
title: "文章标题"
date: "2026-05-23"
description: "文章描述"
tags: ["标签1", "标签2"]
category: "分类"
cover: "封面图URL"
---
```
- 或通过管理后台 `/editor` 使用 TipTap 编辑器

### 管理相册
- 访问 `/admin` → 光影画廊 tab
- 可增删改相册及照片

### 管理项目
- 访问 `/admin` → 系统核心配置 tab
- 可增删改项目信息

### 自定义背景
- 访问 `/settings` → 视觉背景配置
- 修改背景图片 URL 和模糊度
- 点击"立即应用"即时生效
- 点击"保存到服务器"永久生效

### AI 猫娘配置
- 点击右下角 🐱 按钮
- 点击 ⚙️ 设置自定义 system prompt
- 输入 DeepSeek API Key

## 站点配置

修改 `siteConfig.ts` 或在管理后台 `/settings` 中调整：
- 网站标题、作者名称、个人简介
- 头像、社交链接
- 背景图片、主题色
- 网易云音乐 ID
- 友链申请格式
- 备案信息

## 更新日志

### 2026-05-23
- 🐱 新增 AI 猫娘聊天助手（DeepSeek 接口）
- 🖼️ 管理后台支持照片墙和项目管理
- 🎚️ 背景模糊度可调节滑块
- 🗑️ 删除关于页面技能栈
- 💾 管理页面部署按钮真正调用 API
- 🎬 启动加载动画 SplashScreen
- 📱 管理页面移动端适配
- 🖼️ 自定义背景上传 + 即时应用
- ⚙️ 站点配置 API 读写 siteConfig.ts
- 🔄 操作队列上下文 OperationContext
- ✨ 鼠标点击涟漪波纹 ClickEffect
- 📝 完整管理后台（文章、草稿、设置）

### 2026-05-22
- 🏗️ 项目初始化 Next.js 16 + React 19 + TypeScript
- 🎨 磨砂玻璃 Glassmorphism 全局样式
- 🌙 明暗双主题切换
- 🦟 流萤飞舞粒子特效
- 🏠 首页完整布局
- 📝 博客系统（Markdown + 代码高亮）
- 🚀 项目展示页
- 🖼️ 照片墙 + Lightbox
- 🔗 友链页面
- 👤 关于页面
- 🎵 全局音乐播放器
- ⏳ 归档时间线
