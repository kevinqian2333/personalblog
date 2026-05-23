import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export async function GET() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json({ posts: [] });
    }
    const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
    const posts = files.map((file) => {
      const content = fs.readFileSync(path.join(postsDirectory, file), "utf8");
      const { data } = matter(content);
      return {
        slug: file.replace(".md", ""),
        title: data.title || "",
        date: data.date || "",
        description: data.description || "",
        tags: data.tags || [],
        category: data.category || "",
        cover: data.cover || "",
      };
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, content, description, date, tags, category, cover } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: "slug 和 title 为必填项" }, { status: 400 });
    }

    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    const safeSlug = slug.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "-");
    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
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

    fs.writeFileSync(path.join(postsDirectory, `${safeSlug}.md`), frontmatter, "utf8");
    return NextResponse.json({ success: true, slug: safeSlug });
  } catch (e) {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
