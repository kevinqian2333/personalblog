import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { siteConfig as bundledConfig } from "../../../siteConfig";

const CONFIG_PATH = path.join(process.cwd(), "siteConfig.ts");

function readCurrentConfig(): Record<string, any> {
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const match = raw.match(/export const siteConfig = ([\s\S]*?);\s*$/);
    if (match) {
      try {
        const fn = new Function(`return ${match[1]}`);
        return fn();
      } catch {}
    }
  }
  return bundledConfig as unknown as Record<string, any>;
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

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentConfig = readCurrentConfig();
    const merged = deepMerge(currentConfig, body);

    let written = false;
    try {
      if (fs.existsSync(path.dirname(CONFIG_PATH))) {
        const content = generateConfigFile(merged);
        fs.writeFileSync(CONFIG_PATH, content, "utf8");
        written = true;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: written
        ? "站点配置已写入 siteConfig.ts，重新构建后生效"
        : "配置已接收（生产环境仅本地存储生效，本地开发保存后执行 npm run build 永久生效）",
      data: merged,
      persisted: written,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
