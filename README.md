# 无敌猫猫拳の幻想乡 — 个人博客系统

基于 **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4** 构建的磨砂玻璃（Glassmorphism）风格个人博客，内置完整 CMS 管理后台。

---

## 功能矩阵

| 模块 | 描述 | 数据来源 |
|------|------|----------|
| 🏠 **首页** | ProfileCard 3D 倾斜 + CloudPlayer 音乐卡片 + 文章轮播 + 照片墙预览 + SiteDashboard | `siteConfig.ts` + API |
| 📝 **博客** | Markdown → HTML（代码高亮 + KaTeX 数学公式）、分类筛选、全文搜索、归档时间线 | `posts/*.md` |
| 🚀 **项目** | 卡片网格 + 技术栈标签 + GitHub/Demo 外链 | `data/projects.json` (API) |
| 🖼️ **照片墙** | Masonry 瀑布流 + Lightbox 全屏 + 相册分类 Tab | `data/albums.json` (API) |
| 🔗 **友链** | 友链卡片网格 + 申请格式/介绍（动态） | `data/friends.json` (API) + `siteConfig` |
| 👤 **关于** | 简介 + 教育经历时间线 + 社交联系方式（点击复制） | `data/education.json` (API) |
| 🎵 **音乐** | 全功能播放器：封面旋转、LRC 歌词、进度条、音量、3 种播放模式 | 网易云 meting API |
| 🎨 **主题** | 明/暗双主题无缝切换 + 背景图片轮播 + 动态模糊叠加 | `next-themes` |
| 🐱 **AI 猫娘** | DeepSeek 聊天窗口，可自定义 system prompt + API Key | DeepSeek API |
| ⚙️ **管理后台** | 8 Tab CMS：仪表盘 / 文章 / 相册 / 项目 / 教育 / 友链 / 音乐 / 设置 | JSON + md 文件 |

---

## 技术栈全览

### 核心框架
| 包 | 版本 | 用途 |
|----|------|------|
| `next` | 16.2.6 | React 全栈框架（App Router + Turbopack 开发模式） |
| `react` / `react-dom` | 19.2.4 | UI 框架 |
| `typescript` | ^5 | 类型安全 |

### UI & 动效
| 包 | 版本 | 用途 |
|----|------|------|
| `tailwindcss` | ^4 | 原子化 CSS（v4 Vite 模式，无 `tailwind.config.js`） |
| `@tailwindcss/postcss` | ^4 | PostCSS 集成 |
| `@tailwindcss/typography` | ^0.5.19 | `prose` 文章排版 |
| `framer-motion` | ^12.40.0 | 声明式动画（页面过渡、3D 倾斜、spring、手势） |
| `lucide-react` | ^1.16.0 | SVG 图标库（`AlertTriangle` 等） |
| `next-themes` | ^0.4.6 | 明/暗主题切换 |

### 内容渲染
| 包 | 用途 |
|----|------|
| `gray-matter` | 解析 Markdown frontmatter |
| `remark` + `remark-parse` + `remark-html` | Markdown → HTML |
| `remark-gfm` | GitHub Flavored Markdown（表格/任务列表） |
| `remark-math` + `rehype-katex` + `katex` | LaTeX 数学公式 |
| `rehype-highlight` + `highlight.js` | 代码语法高亮 |
| `unified` + `remark-rehype` + `rehype-stringify` | 统一处理管线 |

### 编辑器
| 包 | 用途 |
|----|------|
| `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/pm` | 富文本编辑器核心 |
| `@tiptap/extension-*` (8个) | 图片、链接、占位符、下划线、高亮、对齐、任务列表（Item+List） |

### 3D / Canvas / 特效
| 包 | 用途 |
|----|------|
| `three` + `@react-three/fiber` + `@react-three/drei` | Three.js React 绑定 |
| 原生 Canvas API | `ClickEffect` 点击涟漪 (无额外依赖) |

### 后端 API (Next.js Route Handlers)

| 路由 | 方法 | 存储 | 说明 |
|------|------|------|------|
| `/api/auth` | GET / POST | `data/admin.json` | GET 验证 token / POST 登录设置 cookie |
| `/api/auth/password` | POST | `data/admin.json` | 修改管理员密码 |
| `/api/posts` | GET | `posts/*.md` 目录 | 读取 frontmatter，返回文章列表 |
| `/api/posts/[slug]` | GET / PUT / DELETE | `posts/*.md` | 单篇文章读写删 |
| `/api/config` | GET / POST | `siteConfig.ts` | 读写站点配置（`deepMerge` 递归合并） |
| `/api/albums` | GET / POST | `data/albums.json` | 相册 + 照片 CRUD |
| `/api/projects` | GET / POST | `data/projects.json` | 项目 CRUD |
| `/api/education` | GET / POST | `data/education.json` | 教育经历 CRUD |
| `/api/friends` | GET / POST | `data/friends.json` | 友链 CRUD |

### 认证体系 (三层防护)

| 层级 | 机制 | 文件 |
|------|------|------|
| ① 服务端 Layout | `cookies().get("admin_token")` → `redirect("/login")` | `app/admin/layout.tsx` 等 4 个文件 |
| ② Middleware | `request.cookies.get("admin_token")` → `307 /login?redirect=` | `middleware.ts` |
| ③ Cookie | `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, 24h 过期 | `/api/auth POST` 设置 |

### 全局动画系统（14 关键帧）

| 名称 | 效果 | 使用场景 |
|------|------|----------|
| `float` / `float-delayed` | Y 轴浮动 + 微旋转 | 光球、卡片 |
| `orbit` / `orbit-reverse` | 绕圆轨道运动 | 轨道粒子 |
| `pulse-glow` | box-shadow 脉冲 | 光环、按钮 |
| `shimmer` | 背景渐变色滑动 | skeleton 骨架屏 |
| `breathe` | opacity + scale 呼吸 | 光球 |
| `border-dance` | 渐变色背景位置移动 | 边框动画 |
| `tilt` | perspective 透视旋转 | 卡片 |
| `gradient-mesh` | 渐变背景循环 | 背景叠加 |
| `aviator-float` | 不规则 X/Y 浮动 | 导航元素 |
| `ripple-expand` | 圆形扩大淡出 | 涟漪 |
| `text-shimmer` | 文字渐变色滑动 | 标题 |

### 玻璃态变体 (Glassmorphism)

| class | 特点 |
|-------|------|
| `glass-card` | 标准毛玻璃 + 内阴影高光线 |
| `glass-card-deep` | 深景毛玻璃 + 加强内高光 |
| `glass-card-elevated` | 悬浮毛玻璃 + 外发光环 |
| `hover-glow` | hover 时外发光 |
| `btn-magnetic` | 磁吸按钮 |
| `skeleton` | 流光加载骨架屏 |
| `animate-shimmer` | 通用流光动画 |

---

## 完整目录结构

```
my-blog/
├── app/                                    # Next.js App Router
│   ├── about/page.tsx                      # 关于页面（教育经历动态加载）
│   ├── admin/
│   │   ├── layout.tsx                      # 🆕 Server Component 鉴权 guard
│   │   └── page.tsx                        # 8 Tab 管理后台
│   ├── api/
│   │   ├── albums/route.ts                 # 相册 GET/POST
│   │   ├── auth/
│   │   │   ├── password/route.ts           # 密码修改
│   │   │   └── route.ts                    # 认证 GET/POST
│   │   ├── config/route.ts                 # 站点配置（deepMerge）
│   │   ├── education/route.ts              # 教育经历 GET/POST
│   │   ├── friends/route.ts                # 🆕 友链 GET/POST
│   │   ├── posts/
│   │   │   ├── route.ts                    # 文章列表 GET
│   │   │   └── [slug]/route.ts             # 单篇 GET/PUT/DELETE
│   │   └── projects/route.ts               # 项目 GET/POST
│   ├── drafts/
│   │   ├── layout.tsx                      # 🆕 auth guard
│   │   └── page.tsx                        # 草稿管理
│   ├── editor/
│   │   ├── layout.tsx                      # 🆕 auth guard
│   │   └── page.tsx                        # TipTap 富文本编辑器
│   ├── friends/page.tsx                    # 友链页（动态加载 + 申请格式）
│   ├── login/page.tsx                      # 登录页（SVG 锁 + 光球背景）
│   ├── music/page.tsx                      # 全功能音乐播放器
│   ├── photowall/page.tsx                  # 照片墙 + Lightbox
│   ├── posts/
│   │   ├── page.tsx                        # 博客列表
│   │   └── [slug]/page.tsx                 # 文章详情
│   ├── projects/page.tsx                   # 项目卡片列表
│   ├── settings/
│   │   ├── layout.tsx                      # 🆕 auth guard
│   │   └── page.tsx                        # Tab 式站点设置
│   ├── timeline/page.tsx                   # 归档时间线
│   ├── favicon.ico
│   ├── globals.css                         # 全局样式 (14 keyframes + glass variants + scrollbar)
│   ├── layout.tsx                          # 根布局（光球/粒子/模糊/DynamicBlurOverlay）
│   └── page.tsx                            # 首页（AnimatedCard 交错入场）
├── components/
│   ├── AnimatedCard.tsx                    # whileInView scroll 入场
│   ├── BackgroundEffects.tsx               # 粒子特效（FloatingParticles + Firefly/Sakura 切换）
│   ├── BackgroundSlider.tsx                # 背景图片轮播（localStorage 读取 bgImages/bgBlur）
│   ├── ClickEffect.tsx                     # Canvas 涟漪圆环点击特效
│   ├── ClientSocials.tsx                   # 社交按钮组
│   ├── CloudPlayer.tsx                     # 首页音乐播放器卡片
│   ├── CyberCat.tsx                        # AI 猫娘（SVG CatFace + DeepSeek + 呼吸光晕）
│   ├── DynamicBlurOverlay.tsx              # 🆕 动态模糊叠加层（site-settings-changed event）
│   ├── Fireflies.tsx                       # Three.js 流萤（暗色模式）
│   ├── FloatingPlayer.tsx                  # 底部全局悬浮播放器
│   ├── LatestChatterCarousel.tsx           # 杂谈轮播
│   ├── LatestPostsCarousel.tsx             # 文章轮播
│   ├── LyricBar.tsx                        # 首页歌词条
│   ├── MusicProvider.tsx                   # 音乐 Context（localStorage 合并 musicIds）
│   ├── Navbar.tsx                          # 桌面端弹簧指示器 + 移动端转盘菜单
│   ├── PageTransition.tsx                  # 页面入场动画（blur + fade + y）
│   ├── PostsFilter.tsx                     # 文章分类/搜索筛选
│   ├── ProfileCard.tsx                     # 3D tilt + 追光 + 头像光环 + 社交按钮
│   ├── Sakura.tsx                          # Three.js 樱花（亮色模式）
│   ├── SearchBar.tsx                       # 全局搜索栏
│   ├── SiteDashboard.tsx                   # 首页底部数据面板
│   ├── SplashScreen.tsx                    # 启动加载动画（星点 + 进度条）
│   ├── ThemeProvider.tsx                   # next-themes 封装
│   ├── ThemeToggleBlock.tsx                # 主题/音乐/页面快捷入口
│   ├── ToastProvider.tsx                   # Toast 通知系统
│   └── WindyGrass.tsx                      # windy grass 动画
├── context/
│   └── OperationContext.tsx                # 操作队列（暂存 + 批量部署）
├── data/
│   ├── admin.json                          # 管理员密码存储
│   ├── albums.json                         # 相册数据（3 相册 13 张照片）
│   ├── albums.ts                           # Album 接口类型
│   ├── education.json                      # 教育经历（2 条）
│   ├── friends.json                        # 🆕 友链数据（4 条）
│   ├── friends.ts                          # Friend 接口类型
│   ├── projects.json                       # 项目数据（3 个项目）
│   └── projects.ts                         # Project 接口类型
├── lib/
│   ├── config.ts                           # getSiteConfig()：localStorage 合并默认值
│   └── types.ts                            # PostMeta / SongMeta 共享类型
├── posts/
│   └── hello-world.md                      # Markdown 文章示例
├── siteConfig.ts                           # 站点全局配置（所有默认值）
├── middleware.ts                            # 路由保护中间件
├── next.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

---

## 管理后台 — 8 Tab 详解

| Tab | 图标 | 功能 |
|-----|------|------|
| **全息仪表盘** | 4-grid | 4 统计卡片（文章/草稿/项目/照片）、快速入口、系统状态、密码修改 |
| **文章管理** | document | 文章表格（标题/日期/分类/操作）、编辑/删除 + 断言删除弹窗 |
| **光影画廊** | image | 相册 CRUD + **照片管理**（子面板添加/删除照片到 album.photos） |
| **项目管理** | code | 项目 CRUD（ID/标题/描述/封面/技术栈/GitHub/Demo/分类） |
| **教育经历** | graduation-cap | 教育经历 CRUD（学校/学位/时间段/描述），`editingEducationIndex` 追踪引用 |
| **友链管理** 🆕 | link | 友链 CRUD（名称/URL/头像/描述），带头像预览 |
| **音乐管理** | music-note | textarea 编辑云音乐 ID 列表，逐条删除，立即应用 + 保存服务器 |
| **系统设置** | gear | 4 块全展开内联表单：**个人资料**（含友链格式/介绍）→ **背景**（含模糊滑块）→ **页脚**→ **评论** |

### 部署双写模式

```
"立即应用" → localStorage.setItem("site-settings") → dispatchEvent("site-settings-changed")
           → DynamicBlurOverlay / MusicProvider / BackgroundSlider 实时更新

"保存到服务器" → POST /api/config → deepMerge(current, body) → 写入 siteConfig.ts
               → 重启/rebuild 后永久生效
```

---

## 站点配置完整清单

管理后台 **系统设置** 或直接修改 `siteConfig.ts` 可控制：

| 配置区 | 字段 | 类型 |
|--------|------|------|
| 基本信息 | `authorName`, `bio`, `avatarUrl`, `navTitle`, `navSuffix`, `navAfter` | `string` |
| 社交 | `social.github`, `social.email`, `social.qq`, `social.wechat` | `string` |
| 背景 | `bgImages[]`, `themeColors[]`, `bgBlur` (0-30) | `string[]` + `number` |
| 音乐 | `cloudMusicIds[]` | `string[]` |
| 友链 | `friendLinkApplyFormat`, `friendLinkIntro` | `string` |
| 页脚 | `buildDate`, `icpConfig.name`, `icpConfig.link` | `string` |
| 评论 | `gitalkConfig.{clientID,clientSecret,repo,owner,admin}` | `string` |

---

## 本地开发

```bash
npm install                # 安装依赖

npm run dev                # 启动 Turbopack dev server → http://localhost:3000
npm run build --webpack    # 生产构建
npm start                  # 生产启动

# 关键页面
# http://localhost:3000          首页
# http://localhost:3000/login     登录（初始密码: 12345）
# http://localhost:3000/admin     管理后台（登录后）
```

---

## 完整更新日志

### 2026-05-23
- 🔐 **认证三层防护**：Server Component Layout（`cookies()` 重定向）+ Middleware（307）+ httpOnly Cookie
- 🆕 **友链管理系统**：`/api/friends` API + `data/friends.json` + admin 友链 Tab（名称/URL/头像/描述 CRUD）
- 🆕 **友链申请介绍**：`friendLinkIntro` 字段（管理端可编辑，友链页面动态渲染）
- 🆕 **友链页面动态化**：`friends/page.tsx` 改为 `"use client"`，从 `/api/friends` 和 `getSiteConfig()` 加载
- 🐛 **登录死循环修复**：`/api/auth` 新增 GET 端点（服务端验证 httpOnly cookie），替换客户端 `document.cookie` 读取
- 🐛 **SplashScreen 修复**：`Math.random()` 从 JSX 移到 `useEffect` → `setStars()`，消除 hydration mismatch
- 🐛 **背景模糊度修复**：`DynamicBlurOverlay` 用 `site-settings-changed` custom event 实时更新 + `storage` event 跨标签页支持
- 📊 **种子数据填充**：`education.json`(2条) + `projects.json`(3个) + `albums.json`(3相册13照片) + `friends.json`(4条)
- 🔄 **config API 深度合并**：`deepMerge` 递归合并替代 `{...a,...b}` 浅拷贝
- 🎧 **音乐热加载**：`MusicProvider` 优先从 `localStorage` 读取 `cloudMusicIds`
- 🎚️ **BackgroundSlider SSR 修复**：移除 `!mounted` 条件，SSR 用默认值渲染
- 🎨 **UI 精简**：登录页简化（移除复杂浮动几何体）；CyberCat 猫脸 SVG 去噪（移除胡须线/舌头）；ClickEffect 改为纯涟漪（去掉粒子爆破）
- 📖 **README 全面重写**：完整目录结构 + 技术栈表 + 功能矩阵 + 架构图

### 2026-05-22
- 🏗️ **管理后台全面重构**：删 emoji → 全 SVG 图标；4 Tab → 8 Tab
- 🖼️ 照片管理（album.photos 子面板增删）
- 🎓 教育经历：`indexOf` 引用 bug → `editingEducationIndex` 索引追踪
- 💾 所有 `handleApply*` 统一写 `site-settings` key + `dispatchEvent` 通知
- 🧩 `handleSave*` 嵌套结构：`social`/`icpConfig`/`gitalkConfig`

### 2026-05-20~21
- 项目初始化：Next.js 16 + React 19 + Tailwind 4 + 全局 Glassmorphism
- 首页 / 博客 / 项目 / 照片墙 / 友链 / 关于 / 音乐 / 归档 全页面
- 明暗双主题 + Three.js 流萤/樱花/草地
- SplashScreen + AI 猫娘(DeepSeek) + Cookie 认证 + 操作队列 + TipTap 编辑器

---

## 架构设计

### 认证流程（三层）

```
用户访问 /admin
  → ① middleware.ts: match('/admin/:path*') → 读取 cookie → 无/错 → 307 /login
  → ② app/admin/layout.tsx: cookies().get("admin_token") → 无/错 → redirect("/login")
  → ③ /api/auth POST: 验证密码 → res.cookies.set("admin_token", httpOnly, 24h)
```

### z-index 分层体系

```
┌────────────────────────────────────────────────┐
│ z-[100000]   SplashScreen 启动动画              │
│ z-[9999]     ClickEffect Canvas 点击涟漪         │
│ z-[9998]     CyberCat 猫娘助手                  │
│ z-[100]      删除确认弹窗                        │
│ z-[50-70]    Navbar / 移动端菜单                 │
│ z-10         页面内容                            │
│ z-[-1]       背景容器 boundary                   │
│ z-[-4]       脉冲光环 (animate-pulse-glow)       │
│ z-[-5]       轨道粒子 (animate-orbit)            │
│ z-[-6]       BackgroundEffects (Three.js)        │
│ z-[-7]       浮动光球 (animate-breathe/float)    │
│ z-[-8]       渐变网格 (gradient-mesh 20s)        │
│ z-[-9]       DynamicBlurOverlay 动态模糊         │
│ z-[-10]      BackgroundSlider 背景轮播           │
└────────────────────────────────────────────────┘
```

### 数据流

```
siteConfig.ts (默认)
    ↓ import
getSiteConfig() → localStorage.getItem("site-settings") → 合并 → 实时生效
    ↓
components (Navbar / ProfileCard / BackgroundSlider / DynamicBlurOverlay / friends page)

Admin Tab "系统设置"
    ↓ "保存到服务器"
POST /api/config → deepMerge → fs.writeFileSync(siteConfig.ts) → 永久生效
Admin Tab "立即应用"
    ↓
localStorage.setItem("site-settings") → dispatchEvent("site-settings-changed") → 实时
```
