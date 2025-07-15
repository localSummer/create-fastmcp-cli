import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { TemplateData } from '../types/index.js';
import { templateEngine, TemplateContext } from './templateEngine.js';

// 获取当前模块的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateProject(data: TemplateData): Promise<void> {
  const projectPath = path.join(process.cwd(), data.projectName);

  // 确保项目目录不存在
  if (await fs.pathExists(projectPath)) {
    throw new Error(`目录 ${data.projectName} 已存在`);
  }

  // 构建模板上下文
  const context = templateEngine.buildContext(data);

  try {
    // 根据传输类型选择模板目录并拷贝
    await copyTemplateDirectory(data.transport, projectPath);

    // 对拷贝后的文件进行变量替换
    await postProcessFiles(projectPath, context);

    // 自动安装依赖
    await installDependencies(projectPath);
  } catch (error) {
    // 如果生成失败，清理已创建的目录
    await fs.remove(projectPath);
    throw error;
  }
}

/**
 * 根据传输类型拷贝对应的模板目录
 */
async function copyTemplateDirectory(
  transport: string,
  projectPath: string
): Promise<void> {
  const templateName = `${transport}-template`;
  // 使用相对于源代码位置的模板路径
  const templatePath = path.join(__dirname, '../../templates', templateName);

  // 检查模板目录是否存在
  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`模板目录不存在: ${templatePath}`);
  }

  // 拷贝整个模板目录到项目路径
  await fs.copy(templatePath, projectPath);
}

/**
 * 对拷贝后的所有文件进行变量替换
 */
async function postProcessFiles(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  await processDirectoryRecursively(projectPath, context);
}

/**
 * 递归处理目录中的所有文件
 */
async function processDirectoryRecursively(
  dirPath: string,
  context: TemplateContext
): Promise<void> {
  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = await fs.stat(itemPath);

    if (stats.isDirectory()) {
      // 跳过某些目录
      if (shouldSkipDirectory(item)) {
        continue;
      }
      // 递归处理子目录
      await processDirectoryRecursively(itemPath, context);
    } else if (stats.isFile()) {
      // 处理文件
      if (shouldProcessFile(item)) {
        await processFile(itemPath, context);
      }
    }
  }
}

/**
 * 判断是否应该跳过某个目录
 */
function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = ['node_modules', '.git', 'dist', '.vscode'];
  return skipDirs.includes(dirName);
}

/**
 * 判断是否应该处理某个文件（进行变量替换）
 */
function shouldProcessFile(fileName: string): boolean {
  const textFileExtensions = [
    '.ts',
    '.js',
    '.json',
    '.md',
    '.txt',
    '.yml',
    '.yaml',
  ];
  const ext = path.extname(fileName).toLowerCase();
  return textFileExtensions.includes(ext);
}

/**
 * 处理单个文件，进行变量替换
 */
async function processFile(
  filePath: string,
  context: TemplateContext
): Promise<void> {
  try {
    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf8');

    // 使用模板引擎进行变量替换
    const processedContent = templateEngine.renderTemplate(content, context);

    // 写回文件
    await fs.writeFile(filePath, processedContent, 'utf8');
  } catch (error) {
    console.warn(`处理文件 ${filePath} 时出错:`, error);
    // 不抛出错误，继续处理其他文件
  }
}

/**
 * 在项目目录中自动安装 npm 依赖
 */
async function installDependencies(projectPath: string): Promise<void> {
  console.log('正在安装项目依赖...');

  // 检测操作系统，Windows 下使用 npm.cmd
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';

  return new Promise((resolve, reject) => {
    const installProcess = spawn(npmCommand, ['install'], {
      cwd: projectPath,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: isWindows,
    });

    let output = '';
    let errorOutput = '';

    // 监听标准输出
    installProcess.stdout?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      // 显示关键的安装信息
      if (
        chunk.includes('added') ||
        chunk.includes('found') ||
        chunk.includes('audited')
      ) {
        process.stdout.write(chunk);
      }
    });

    // 监听错误输出
    installProcess.stderr?.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      // 显示警告和错误
      if (chunk.includes('WARN') || chunk.includes('ERR')) {
        process.stderr.write(chunk);
      }
    });

    // 监听进程结束
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 依赖安装完成！');
        resolve();
      } else {
        const error = new Error(
          `npm install 执行失败 (退出代码: ${code})\n` +
            `错误详情: ${errorOutput || '未知错误'}\n` +
            `建议: 请检查网络连接，或手动在项目目录中运行 'npm install'`
        );
        reject(error);
      }
    });

    // 监听进程错误
    installProcess.on('error', (error) => {
      const enhancedError = new Error(
        `无法执行 npm install: ${error.message}\n` +
          `建议: 请确保已安装 Node.js 和 npm，或手动在项目目录中运行 'npm install'`
      );
      reject(enhancedError);
    });
  });
}
