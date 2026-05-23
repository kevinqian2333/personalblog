import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "-");
  const filePath = path.join(postsDirectory, `${safeSlug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return NextResponse.json({
    slug: safeSlug,
    title: data.title || "",
    date: data.date || "",
    description: data.description || "",
    tags: data.tags || [],
    category: data.category || "",
    cover: data.cover || "",
    content: content.trim(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { title, content, description, date, tags, category, cover } = body;

  const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "-");
  const filePath = path.join(postsDirectory, `${safeSlug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const frontmatter = [
    "---",
    `title: "${(title || "").replace(/"/g, '\\"')}"`,
    `date: "${date || new Date().toISOString().slice(0, 10)}"`,
    `description: "${(description || "").replace(/"/g, '\\"')}"`,
    tags && tags.length > 0 ? `tags: [${tags.map((t: string) => `"${t}"`).join(", ")}]` : "",
    `category: "${category || ""}"`,
    `cover: "${cover || ""}"`,
    "---",
    "",
    content || "",
  ]
    .filter(Boolean)
    .join("\n");

  fs.writeFileSync(filePath, frontmatter, "utf8");
  return NextResponse.json({ success: true, slug: safeSlug });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "-");
  const filePath = path.join(postsDirectory, `${safeSlug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
