import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "siteConfig.ts");

function readCurrentConfig(): Record<string, any> {
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const match = raw.match(/export const siteConfig = ([\s\S]*?);\s*$/);
  if (!match) throw new Error("无法解析 siteConfig.ts");
  const escaped = match[1]
    .replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":')
    .replace(/'/g, '"');
  try {
    return JSON.parse(escaped);
  } catch {
    throw new Error("siteConfig.ts 格式错误，无法解析");
  }
}

function stringifyValue(val: any, indent = 0): string {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);

  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val.toString();
  if (typeof val === "number") return val.toString();
  if (typeof val === "string") {
    if (val.includes("\n")) {
      return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    const allSimple = val.every((v) => typeof v === "string" || typeof v === "number");
    if (allSimple && val.length <= 5) {
      return `[${val.map((v) => stringifyValue(v)).join(", ")}]`;
    }
    return `[\n${val.map((v) => `${pad1}${stringifyValue(v, indent + 1)}`).join(",\n")}\n${pad}]`;
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (keys.length === 0) return "{}";
    if (keys.length <= 3) {
      const items = keys.map((k) => `${k}: ${stringifyValue(val[k], indent + 1)}`);
      return `{ ${items.join(", ")} }`;
    }
    const items = keys.map((k) => `${pad1}${k}: ${stringifyValue(val[k], indent + 1)}`);
    return `{\n${items.join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(val);
}

function generateConfigFile(config: Record<string, any>): string {
  return `export const siteConfig = ${stringifyValue(config)};\n`;
}

export async function GET() {
  try {
    const config = readCurrentConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentConfig = readCurrentConfig();

    const merged = { ...currentConfig, ...body };

    const content = generateConfigFile(merged);
    fs.writeFileSync(CONFIG_PATH, content, "utf8");

    return NextResponse.json({
      success: true,
      message: "站点配置已写入 siteConfig.ts，重新构建后生效",
      data: merged,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
