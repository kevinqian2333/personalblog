import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "albums.json");

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({ success: true, albums: [] });
    }
    const content = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(content);
    return NextResponse.json({ success: true, albums: data.albums || data || [] });
  } catch (e) {
    console.error("Failed to read albums:", e);
    return NextResponse.json({ success: true, albums: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { albums: newAlbums } = body;
    if (!Array.isArray(newAlbums)) {
      return NextResponse.json({ error: "无效数据" }, { status: 400 });
    }
    const content = JSON.stringify({ albums: newAlbums }, null, 2);
    if (!fs.existsSync(path.dirname(DATA_PATH))) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, content, "utf8");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Failed to save albums:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
