"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FloatingPlayer from "../../components/FloatingPlayer";

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active
          ? "bg-indigo-500 text-white"
          : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
      }`}
    >
      {children}
    </button>
  );
}

function EditorInner() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [cover, setCover] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!slugParam) return;
    setIsLoading(true);
    fetch(`/api/posts/${slugParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setSlug(data.slug || "");
        setTitle(data.title || "");
        setDescription(data.description || "");
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "");
        setCategory(data.category || "");
        setCover(data.cover || "");
        if (data.content && editor) {
          editor.commands.setContent(data.content);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slugParam]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none min-h-[400px] focus:outline-none",
      },
    },
  });

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("链接 URL", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("图片 URL");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setIsSaving(true);
    setSaveMessage("");

    const htmlContent = editor.getHTML();
    const finalSlug =
      slug.trim() ||
      title
        .trim()
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() ||
      `post-${Date.now()}`;

    const tagsArray = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      slug: finalSlug,
      title: title.trim(),
      content: htmlContent,
      description: description.trim(),
      tags: tagsArray,
      category: category.trim(),
      cover: cover.trim(),
    };

    try {
      let res: Response;
      if (slugParam) {
        res = await fetch(`/api/posts/${slugParam}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        setSavedSlug(data.slug);
        if (!slugParam) {
          setSlug(data.slug);
        }
        setSaveMessage("✅ 保存成功！");
      } else {
        setSaveMessage(`❌ 保存失败：${data.error || "未知错误"}`);
      }
    } catch {
      setSaveMessage("❌ 网络错误，请稍后重试");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [editor, slug, title, tags, category, cover, description, slugParam]);

  if (!editor) {
    return (
      <>
        <Navbar />
        <PageTransition>
          <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 pb-20 relative z-10">
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
              <div className="text-center py-20 text-slate-500">正在初始化编辑器...</div>
            </div>
          </div>
        </PageTransition>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 pb-20 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {slugParam ? "编辑文章" : "新增文章"}
            </h1>
            <Link
              href="/posts"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              ← 返回管理
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-72 flex-shrink-0">
              <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 sticky top-28 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="文章标题"
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="自动生成或手动输入"
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    描述
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="文章摘要..."
                    rows={3}
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    标签
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="用逗号分隔"
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    分类
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="文章分类"
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    封面 URL
                  </label>
                  <input
                    type="text"
                    value={cover}
                    onChange={(e) => setCover(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/60 dark:bg-slate-700/60 border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "保存中..." : "保存文章"}
                </button>
                {saveMessage && (
                  <p className="text-sm text-center font-bold text-slate-700 dark:text-slate-300">
                    {saveMessage}
                  </p>
                )}
                {savedSlug && (
                  <Link
                    href={`/posts/${savedSlug}`}
                    className="block text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    查看文章 →
                  </Link>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 p-2 flex flex-wrap gap-1 mb-4 sticky top-24 z-20">
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="粗体"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="斜体"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="下划线"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                    title="删除线"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.08-1.47-2.15-1.47-1.32 0-2.35.98-2.35 2.33 0 .55.19 1.05.51 1.44H6.85zm13.15 3.42v3H4v-3h16zM8.17 18.17c.41.6 1.01 1.07 2.03 1.07 1.32 0 2.35-.98 2.35-2.33 0-.52-.17-.98-.47-1.34H8.17z" />
                    </svg>
                  </ToolbarBtn>

                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-1" />

                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="标题 1"
                  >
                    <span className="text-sm font-black">H1</span>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="标题 2"
                  >
                    <span className="text-sm font-black">H2</span>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="标题 3"
                  >
                    <span className="text-sm font-black">H3</span>
                  </ToolbarBtn>

                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-1" />

                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="无序列表"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="有序列表"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    active={editor.isActive("taskList")}
                    title="任务列表"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z" />
                    </svg>
                  </ToolbarBtn>

                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-1" />

                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="引用"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive("code")}
                    title="行内代码"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                    title="代码块"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 19V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v14H2v2h20v-2h-2zM13 5h1.5v14H13V5zm-2 14H9.5V5H11v14zM6 5h1.5v14H6V5zm10.5 14V5H18v14h-1.5z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="分割线"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 11h20v2H2z" />
                    </svg>
                  </ToolbarBtn>

                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-1" />

                  <ToolbarBtn onClick={addImage} title="插入图片">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="插入链接">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                    </svg>
                  </ToolbarBtn>

                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-1" />

                  <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    active={editor.isActive({ textAlign: "left" })}
                    title="左对齐"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    active={editor.isActive({ textAlign: "center" })}
                    title="居中"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                    </svg>
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    active={editor.isActive({ textAlign: "right" })}
                    title="右对齐"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                    </svg>
                  </ToolbarBtn>
                </div>

                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
      <style
        dangerouslySetInnerHTML={{
          __html: `
.ProseMirror { outline: none; min-height: 400px; padding: 1rem; }
.ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; }
.ProseMirror h1 { font-size: 2rem; font-weight: 900; margin: 1rem 0 0.5rem; }
.ProseMirror h2 { font-size: 1.5rem; font-weight: 800; margin: 0.75rem 0 0.5rem; }
.ProseMirror h3 { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
.ProseMirror pre { background: #1e293b; color: #e2e8f0; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; }
.ProseMirror code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
.ProseMirror pre code { background: transparent; padding: 0; }
.ProseMirror blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; color: #64748b; }
.ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
.ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
.ProseMirror img { max-width: 100%; border-radius: 0.75rem; margin: 1rem 0; }
.ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
`,
        }}
      />
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <PageTransition>
            <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 pb-20 relative z-10">
              <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6">
                <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                  加载编辑器中...
                </div>
              </div>
            </div>
          </PageTransition>
        </>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
