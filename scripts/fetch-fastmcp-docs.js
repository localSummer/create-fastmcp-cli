#!/usr/bin/env node

import https from "https";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_URL =
  "https://raw.githubusercontent.com/punkpeye/fastmcp/refs/heads/main/README.md";
const OUTPUT_DIR = path.join(__dirname, "..", "docs");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "fastmcp.md");

async function fetchReadmeContent() {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue("正在获取 FastMCP README 内容..."));

    const request = https
      .get(README_URL, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`),
          );
          return;
        }

        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          console.log(chalk.green("✓ 成功获取 README 内容"));
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });

    // 设置30秒超时
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error("请求超时"));
    });
  });
}

function extractCoreConcepts(content) {
  console.log(chalk.blue("正在提取 Core Concepts 部分..."));

  const lines = content.split("\n");
  let startIndex = -1;
  let endIndex = lines.length;

  // 找到 "## Core Concepts" 的起始位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "## Core Concepts") {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) {
    throw new Error('未找到 "## Core Concepts" 部分');
  }

  // 找到下一个一级或二级标题的位置作为结束位置
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("# ") || line.startsWith("## ")) {
      endIndex = i;
      break;
    }
  }

  const extractedContent = lines.slice(startIndex, endIndex).join("\n").trim();
  console.log(chalk.green("✓ 成功提取 Core Concepts 部分"));

  return extractedContent;
}

async function createDocsDirectory() {
  console.log(chalk.blue("确保 docs 目录存在..."));

  try {
    await fs.ensureDir(OUTPUT_DIR);
    console.log(chalk.green("✓ docs 目录已准备就绪"));
  } catch (error) {
    throw new Error(`创建 docs 目录失败: ${error.message}`);
  }
}

async function writeToFile(content) {
  console.log(chalk.blue("正在写入文件..."));

  try {
    await fs.writeFile(OUTPUT_FILE, content, "utf8");
    console.log(
      chalk.green(
        `✓ 成功写入文件: ${path.relative(process.cwd(), OUTPUT_FILE)}`,
      ),
    );
  } catch (error) {
    throw new Error(`写入文件失败: ${error.message}`);
  }
}

async function copyToTemplates(content) {
  console.log(chalk.blue("正在复制文档到模板目录..."));

  const templateDirs = [
    "stdio-template",
    "httpStream-template",
    "sse-template",
  ];

  for (const templateDir of templateDirs) {
    try {
      const templateDocsDir = path.join(
        __dirname,
        "..",
        "templates",
        templateDir,
        "docs",
      );
      const templateDocsFile = path.join(templateDocsDir, "fastmcp.md");

      // 确保模板的 docs 目录存在
      await fs.ensureDir(templateDocsDir);

      // 写入文件
      await fs.writeFile(templateDocsFile, content, "utf8");

      console.log(
        chalk.green(
          `✓ 成功复制到: ${path.relative(process.cwd(), templateDocsFile)}`,
        ),
      );
    } catch (error) {
      throw new Error(`复制文档到 ${templateDir} 失败: ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log(chalk.cyan("🚀 开始获取 FastMCP Core Concepts 文档\n"));

    // 获取 README 内容
    const readmeContent = await fetchReadmeContent();

    // 提取 Core Concepts 部分
    const coreConceptsContent = extractCoreConcepts(readmeContent);

    // 在内容顶部添加标题
    const finalContent = `# FastMCP 使用文档\n\n${coreConceptsContent}`;

    // 创建输出目录
    await createDocsDirectory();

    // 写入文件
    await writeToFile(finalContent);

    // 复制文档到模板目录
    await copyToTemplates(finalContent);

    console.log(chalk.cyan("\n🎉 文档获取完成!"));
    console.log(
      chalk.gray(`文件保存位置: ${path.relative(process.cwd(), OUTPUT_FILE)}`),
    );
    console.log(chalk.gray("已复制到所有模板目录的 docs/ 文件夹中"));
  } catch (error) {
    console.error(chalk.red("\n❌ 错误:"), error.message);
    process.exit(1);
  }
}

main();
