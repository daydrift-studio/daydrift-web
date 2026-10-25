import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Candidate paths for mod_api.d.lua
const candidatePaths = [
  path.resolve(__dirname, "../../../daydrift-mod-sdk/types/mod_api.d.lua"),
  path.resolve("G:/Project/daydrift/daydrift-mod-sdk/types/mod_api.d.lua"),
  path.resolve("G:/godot-Project/daydrift/docs/mod_api.d.lua")
];

let luaPath = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    luaPath = p;
    break;
  }
}

if (!luaPath) {
  console.error("[ERROR] Could not find mod_api.d.lua in candidate paths.");
  process.exit(1);
}

const luaContent = fs.readFileSync(luaPath, "utf-8");
const targetMarkdownPath = path.resolve(__dirname, "../src/content/docs/modding/api.md");

interface ParamInfo {
  name: string;
  type: string;
  description: string;
}

interface ReturnInfo {
  type: string;
  name: string;
  description: string;
}

interface FunctionDoc {
  name: string;
  signature: string;
  summary: string;
  params: ParamInfo[];
  returns: ReturnInfo[];
  section: string;
  isHook: boolean;
}

function parseLuaDefs(content: string): { functions: FunctionDoc[]; sections: string[] } {
  const lines = content.split(/\r?\n/);
  const functions: FunctionDoc[] = [];
  const sections: string[] = [];

  let currentSection = "基础接口";
  let currentSummaryLines: string[] = [];
  let currentParams: ParamInfo[] = [];
  let currentReturns: ReturnInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Section header
    if (line.startsWith("-- ==") || line.startsWith("-- 1.") || line.startsWith("-- 2.") || line.startsWith("-- 3.") || line.startsWith("-- 4.") || line.startsWith("-- 5.")) {
      const nextLine = lines[i + 1]?.trim() || "";
      if (nextLine.startsWith("-- ") && !nextLine.startsWith("-- ==")) {
        currentSection = nextLine.replace(/^--\s*/, "").replace(/^[0-9.]+\s*/, "");
        if (!sections.includes(currentSection)) {
          sections.push(currentSection);
        }
      }
      continue;
    }

    if (line.startsWith("---@param")) {
      const match = line.match(/^---@param\s+([a-zA-Z0-9_?]+)\s+([a-zA-Z0-9_|.[\]]+)(?:\s+(.*))?$/);
      if (match) {
        currentParams.push({
          name: match[1],
          type: match[2],
          description: match[3] || ""
        });
      }
      continue;
    }

    if (line.startsWith("---@return")) {
      const match = line.match(/^---@return\s+([a-zA-Z0-9_|.[\]]+)(?:\s+([a-zA-Z0-9_]+))?(?:\s+(.*))?$/);
      if (match) {
        currentReturns.push({
          type: match[1],
          name: match[2] || "",
          description: match[3] || ""
        });
      }
      continue;
    }

    if (line.startsWith("---") && !line.startsWith("---@")) {
      currentSummaryLines.push(line.replace(/^---\s?/, ""));
      continue;
    }

    // Function definition
    const fnMatch = line.match(/^function\s+([a-zA-Z0-9_.]+)\((.*?)\)\s*end$/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const fnArgs = fnMatch[2];
      const isHook = fnName.startsWith("on_");

      functions.push({
        name: fnName,
        signature: `${fnName}(${fnArgs})`,
        summary: currentSummaryLines.join("\n"),
        params: [...currentParams],
        returns: [...currentReturns],
        section: currentSection,
        isHook
      });

      // reset accumulator
      currentSummaryLines = [];
      currentParams = [];
      currentReturns = [];
      continue;
    }

    // If blank line and no function, reset docstring buffer
    if (!line.startsWith("---") && !line.startsWith("--")) {
      currentSummaryLines = [];
      currentParams = [];
      currentReturns = [];
    }
  }

  return { functions, sections };
}

function generateMarkdown(parsed: { functions: FunctionDoc[]; sections: string[] }): string {
  const { functions } = parsed;

  let md = `---
title: ModAPI 接口参考
description: 《度日：Daydrift》Mod 安全沙箱门面接口与生命周期完整定义（自动同步自 mod_api.d.lua）
---

在模组脚本中，所有游戏能力均封装于全局安全门面 \`ModAPI\` 中。严禁直接访问底层操作系统或未经授权的文件系统。

本文档由 \`types/mod_api.d.lua\` 自动提取生成，并严格通过 CI 一致性校验（函数数量：${functions.length}）。

`;

  const modApiFns = functions.filter((f) => !f.isHook);
  const hookFns = functions.filter((f) => f.isHook);

  // Group ModAPI fns by section
  const sectionsMap = new Map<string, FunctionDoc[]>();
  for (const fn of modApiFns) {
    const list = sectionsMap.get(fn.section) || [];
    list.push(fn);
    sectionsMap.set(fn.section, list);
  }

  let sectionIdx = 1;
  for (const [secName, fns] of sectionsMap.entries()) {
    md += `## ${sectionIdx++}. ${secName}\n\n`;
    for (const fn of fns) {
      md += `### \`${fn.signature}\`\n\n`;
      if (fn.summary) {
        md += `${fn.summary}\n\n`;
      }

      if (fn.params.length > 0) {
        md += `**参数：**\n\n`;
        for (const p of fn.params) {
          const opt = p.name.endsWith("?") ? " *(可选)*" : "";
          const cleanName = p.name.replace(/\?$/, "");
          md += `- \`${cleanName}\` (\`${p.type}\`${opt}): ${p.description}\n`;
        }
        md += `\n`;
      }

      if (fn.returns.length > 0) {
        md += `**返回值：**\n\n`;
        for (const r of fn.returns) {
          const retName = r.name ? ` \`${r.name}\`` : "";
          md += `- \`${r.type}\`${retName}: ${r.description}\n`;
        }
        md += `\n`;
      }

      md += `---\n\n`;
    }
  }

  if (hookFns.length > 0) {
    md += `## ${sectionIdx}. 标准生命周期回调函数 (Lifecycle Hooks)\n\n`;
    md += `创作者在 Mod 主脚本中直接实现以下顶级函数，游戏主循环在特定时机将自动回调：\n\n`;

    for (const fn of hookFns) {
      md += `### \`${fn.signature}\`\n\n`;
      if (fn.summary) {
        md += `${fn.summary}\n\n`;
      }

      if (fn.params.length > 0) {
        md += `**参数：**\n\n`;
        for (const p of fn.params) {
          md += `- \`${p.name}\` (\`${p.type}\`): ${p.description}\n`;
        }
        md += `\n`;
      }

      md += `---\n\n`;
    }
  }

  return md;
}

const parsed = parseLuaDefs(luaContent);
const generatedMd = generateMarkdown(parsed);

const isCheck = process.argv.includes("--check");

if (isCheck) {
  if (!fs.existsSync(targetMarkdownPath)) {
    console.error(`[FAIL] Target docs file does not exist: ${targetMarkdownPath}`);
    process.exit(1);
  }
  const existing = fs.readFileSync(targetMarkdownPath, "utf-8");

  // Check if all parsed function names exist in the target markdown
  const missingFns: string[] = [];
  for (const fn of parsed.functions) {
    if (!existing.includes(fn.name)) {
      missingFns.push(fn.name);
    }
  }

  if (missingFns.length > 0) {
    console.error(`[FAIL] Documentation is missing functions defined in mod_api.d.lua:`);
    for (const m of missingFns) {
      console.error(`  - ${m}`);
    }
    process.exit(1);
  }

  console.log(`[OK] All ${parsed.functions.length} functions from mod_api.d.lua are documented.`);
  process.exit(0);
} else {
  fs.writeFileSync(targetMarkdownPath, generatedMd, "utf-8");
  console.log(`[OK] Successfully generated ${targetMarkdownPath} with ${parsed.functions.length} functions.`);
}
