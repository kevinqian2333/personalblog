import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "admin.json");

function getPassword(): string {
  try {
    if (!fs.existsSync(DATA_PATH)) return "12345";
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    return data.password || "12345";
  } catch {
    return "12345";
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;
  const adminPassword = getPassword();

  if (password === adminPassword) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", "admin_authenticated", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  return NextResponse.json({ success: false, error: "密码错误" }, { status: 401 });
}
