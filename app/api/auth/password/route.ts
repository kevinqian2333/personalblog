import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "admin.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "请填写当前密码和新密码" }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ success: false, error: "新密码至少4位" }, { status: 400 });
    }

    let current: string;
    try {
      if (fs.existsSync(DATA_PATH)) {
        current = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")).password || "12345";
      } else {
        current = "12345";
      }
    } catch {
      current = "12345";
    }

    if (currentPassword !== current) {
      return NextResponse.json({ success: false, error: "当前密码错误" }, { status: 401 });
    }

    const content = JSON.stringify({ password: newPassword }, null, 2);
    if (!fs.existsSync(path.dirname(DATA_PATH))) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, content, "utf8");

    return NextResponse.json({ success: true, message: "密码已修改，下次登录生效" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
