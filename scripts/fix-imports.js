#!/usr/bin/env node

/**
 * 修复 TypeScript 导入扩展名的工具脚本
 * 将无扩展名的相对导入自动添加 .js 扩展名
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 匹配相对导入：import ... from './xxx' 或 '../xxx'（不包含扩展名）
  const importRegex = /import\s+.*?\s+from\s+['"](\.\.*\/[^'"]*?)(?<!\.js|\.ts|\.tsx)['"];?/g;
  
  const fixedContent = content.replace(importRegex, (match, importPath) => {
    // 确定正确的扩展名
    const fullPath = path.resolve(path.dirname(filePath), importPath);
    
    // 检查是否存在 .ts, .tsx 文件
    if (fs.existsSync(fullPath + '.tsx')) {
      return match.replace(importPath, importPath + '.js');
    } else if (fs.existsSync(fullPath + '.ts')) {
      return match.replace(importPath, importPath + '.js');
    } else if (fs.existsSync(fullPath + '/index.ts')) {
      return match.replace(importPath, importPath + '.js');
    }
    
    return match;
  });
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ 已修复: ${path.relative(srcDir, filePath)}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedFiles = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedFiles += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixImportsInFile(fullPath)) {
        fixedFiles++;
      }
    }
  }
  
  return fixedFiles;
}

console.log('🔧 开始修复 TypeScript 导入扩展名...\n');

const fixedCount = processDirectory(srcDir);

if (fixedCount > 0) {
  console.log(`\n✨ 完成！共修复了 ${fixedCount} 个文件的导入语句。`);
} else {
  console.log('\n✅ 所有文件的导入语句都已正确！');
}

console.log('\n💡 提示：');
console.log('- 在 ESM 模式下，相对导入必须包含 .js 扩展名');
console.log('- TypeScript 会自动将 .js 扩展名解析到对应的 .ts/.tsx 文件');
console.log('- VS Code 已配置为自动添加 .js 扩展名到新的导入语句'); 