import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { TemplateData } from '../types/index.js';
import { templateEngine, TemplateContext } from './templateEngine.js';
import chalk from 'chalk';

// 获取当前模块的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 项目生成步骤枚举
 */
export enum GenerationStep {
  VALIDATION = 'validation',
  COPY_TEMPLATE = 'copy_template', 
  PROCESS_FILES = 'process_files',
  INSTALL_DEPENDENCIES = 'install_dependencies',
  INIT_GIT = 'init_git',
  CLEANUP = 'cleanup'
}

/**
 * 项目生成状态回调接口
 */
export interface GenerationProgress {
  step: GenerationStep;
  message: string;
  completed: boolean;
  error?: string;
}

/**
 * 项目生成选项接口
 */
export interface GenerationOptions {
  /** 模板数据 */
  data: TemplateData;
  /** 进度回调函数 */
  onProgress?: (progress: GenerationProgress) => void;
  /** 是否在失败时自动清理 */
  autoCleanup?: boolean;
}

/**
 * 生成项目的核心函数（改进版）
 * 负责创建项目目录、拷贝模板文件、处理变量替换和安装依赖
 * @param {GenerationOptions} options - 生成选项
 * @returns {Promise<void>} 无返回值的 Promise
 * @throws {Error} 如果项目目录已存在或生成过程中发生错误
 */
export async function generateProjectWithProgress(options: GenerationOptions): Promise<void> {
  const { data, onProgress, autoCleanup = true } = options;
  const projectPath = path.join(process.cwd(), data.projectName);
  let currentStep: GenerationStep = GenerationStep.VALIDATION;

  const reportProgress = (step: GenerationStep, message: string, completed: boolean = false, error?: string) => {
    currentStep = step;
    onProgress?.({ step, message, completed, error });
  };

  try {
    // 步骤1: 验证
    reportProgress(GenerationStep.VALIDATION, '验证项目配置...');
    
    if (await fs.pathExists(projectPath)) {
      throw new Error(`目录 ${data.projectName} 已存在`);
    }
    
    reportProgress(GenerationStep.VALIDATION, '项目配置验证完成', true);

    // 构建模板上下文
    const context = templateEngine.buildContext(data);

    // 步骤2: 拷贝模板
    reportProgress(GenerationStep.COPY_TEMPLATE, '正在拷贝模板文件...');
    await copyTemplateDirectory(data.transport, projectPath);
    reportProgress(GenerationStep.COPY_TEMPLATE, '模板文件拷贝完成', true);

    // 步骤3: 处理文件
    reportProgress(GenerationStep.PROCESS_FILES, '正在处理模板变量...');
    await postProcessFiles(projectPath, context);
    reportProgress(GenerationStep.PROCESS_FILES, '模板变量处理完成', true);

    // 步骤4: 安装依赖
    reportProgress(GenerationStep.INSTALL_DEPENDENCIES, '正在安装项目依赖...');
    await installDependencies(projectPath);
    reportProgress(GenerationStep.INSTALL_DEPENDENCIES, '项目依赖安装完成', true);

    // 步骤5: 初始化 Git（可选）
    if (data.initGit) {
      reportProgress(GenerationStep.INIT_GIT, '正在初始化 Git 仓库...');
      try {
        await initializeGitRepository(projectPath);
        reportProgress(GenerationStep.INIT_GIT, 'Git 仓库初始化完成', true);
      } catch (gitError) {
        const errorMsg = gitError instanceof Error ? gitError.message : '未知错误';
        reportProgress(GenerationStep.INIT_GIT, 'Git 初始化失败，但项目创建成功', true, errorMsg);
        console.warn(chalk.yellow('⚠️ Git 初始化失败，但项目创建成功：'), errorMsg);
      }
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    reportProgress(currentStep, `生成失败: ${errorMsg}`, false, errorMsg);
    
    if (autoCleanup) {
      reportProgress(GenerationStep.CLEANUP, '正在清理失败的项目文件...');
      await safeCleanup(projectPath);
      reportProgress(GenerationStep.CLEANUP, '清理完成', true);
    }
    
    throw error;
  }
}

/**
 * 生成项目的核心函数（保持向后兼容）
 * @param {TemplateData} data - 模板数据
 * @returns {Promise<void>} 无返回值的 Promise
 */
export async function generateProject(data: TemplateData): Promise<void> {
  return generateProjectWithProgress({ data });
}

/**
 * 安全清理项目目录
 * @param {string} projectPath - 项目路径
 */
async function safeCleanup(projectPath: string): Promise<void> {
  try {
    if (await fs.pathExists(projectPath)) {
      console.log(chalk.yellow('🧹 正在清理失败的项目文件...'));
      await fs.remove(projectPath);
      console.log(chalk.green('✅ 清理完成'));
    }
  } catch (cleanupError) {
    console.warn(chalk.yellow('⚠️ 清理失败，请手动删除目录:'), projectPath);
    console.warn('错误详情:', cleanupError);
  }
}

/**
 * 自定义递归拷贝目录函数，确保所有文件（包括 dotfiles）都被正确拷贝
 * 特别处理 .gitignore.template 文件，在拷贝时自动重命名为 .gitignore
 * @param {string} srcDir - 源目录路径
 * @param {string} destDir - 目标目录路径
 * @returns {Promise<void>} 无返回值的 Promise
 */
async function copyDirectoryRecursively(
  srcDir: string,
  destDir: string
): Promise<void> {
  // 确保目标目录存在
  await fs.ensureDir(destDir);

  // 读取源目录中的所有文件和子目录（包括隐藏文件）
  const items = await fs.readdir(srcDir, { withFileTypes: true });

  for (const item of items) {
    const srcPath = path.join(srcDir, item.name);
    let destPath = path.join(destDir, item.name);
    
    // 处理 .gitignore.template 文件，拷贝时重命名为 .gitignore
    if (item.isFile() && item.name.endsWith('.gitignore.template')) {
      destPath = path.join(destDir, '.gitignore');
    }

    if (item.isDirectory()) {
      // 递归拷贝子目录
      await copyDirectoryRecursively(srcPath, destPath);
    } else if (item.isFile()) {
      // 拷贝文件，确保父目录存在
      await fs.ensureDir(path.dirname(destPath));
      await fs.copyFile(srcPath, destPath);
      
      // 保持文件权限
      const stats = await fs.stat(srcPath);
      await fs.chmod(destPath, stats.mode);
    }
  }
}

/**
 * 根据传输类型拷贝对应的模板目录
 * @param {string} transport - 传输类型 ('stdio', 'httpStream', 'sse')
 * @param {string} projectPath - 项目路径
 * @returns {Promise<void>} 无返回值的 Promise
 * @throws {Error} 如果模板目录不存在
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

  // 使用自定义拷贝函数确保所有文件（包括 dotfiles）都被拷贝
  await copyDirectoryRecursively(templatePath, projectPath);
}

/**
 * 对拷贝后的所有文件进行变量替换
 * @param {string} projectPath - 项目路径
 * @param {TemplateContext} context - 模板上下文
 * @returns {Promise<void>} 无返回值的 Promise
 */
async function postProcessFiles(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  await processDirectoryRecursively(projectPath, context);
}

/**
 * 递归处理目录中的所有文件
 * @param {string} dirPath - 要处理的目录路径
 * @param {TemplateContext} context - 模板上下文
 * @returns {Promise<void>} 无返回值的 Promise
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
 * @param {string} dirName - 目录名称
 * @returns {boolean} 如果应该跳过则返回 true，否则返回 false
 */
function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = ['node_modules', '.git', 'dist', '.vscode'];
  return skipDirs.includes(dirName);
}

/**
 * 判断是否应该处理某个文件（进行变量替换）
 * @param {string} fileName - 文件名
 * @returns {boolean} 如果应该处理则返回 true，否则返回 false
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
 * @param {string} filePath - 文件路径
 * @param {TemplateContext} context - 模板上下文
 * @returns {Promise<void>} 无返回值的 Promise
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
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.warn(chalk.yellow(`⚠️ 处理文件 ${filePath} 时出错:`), errorMsg);
    // 不抛出错误，继续处理其他文件
  }
}

/**
 * 在项目目录中初始化 git 仓库
 * @param {string} projectPath - 项目路径
 * @returns {Promise<void>} 无返回值的 Promise
 * @throws {Error} 如果 git init 执行失败
 */
async function initializeGitRepository(projectPath: string): Promise<void> {
  console.log('正在初始化 Git 仓库...');

  // 检测操作系统，Windows 下使用 git.exe
  const isWindows = process.platform === 'win32';
  const gitCommand = isWindows ? 'git.exe' : 'git';

  return new Promise((resolve, reject) => {
    const gitProcess = spawn(gitCommand, ['init'], {
      cwd: projectPath,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: isWindows,
    });

    let output = '';
    let errorOutput = '';

    // 监听标准输出
    gitProcess.stdout?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      // 显示 git init 输出
      process.stdout.write(chunk);
    });

    // 监听错误输出
    gitProcess.stderr?.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      // git init 的成功信息可能输出到 stderr，只显示实际错误
      if (chunk.includes('error') || chunk.includes('fatal')) {
        process.stderr.write(chunk);
      } else {
        // git init 的正常信息也显示出来
        process.stdout.write(chunk);
      }
    });

    // 监听进程结束
    gitProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Git 仓库初始化完成！');
        resolve();
      } else {
        const error = new Error(
          `git init 执行失败 (退出代码: ${code})
` +
            `错误详情: ${errorOutput || '未知错误'}
` +
            `建议: 请检查是否已安装 Git，或手动在项目目录中运行 'git init'`
        );
        reject(error);
      }
    });

    // 监听进程错误
    gitProcess.on('error', (error) => {
      const enhancedError = new Error(
        `无法执行 git init: ${error.message}
` + `建议: 请确保已安装 Git，或手动在项目目录中运行 'git init'`
      );
      reject(enhancedError);
    });
  });
}

/**
 * 在项目目录中自动安装 npm 依赖
 * @param {string} projectPath - 项目路径
 * @returns {Promise<void>} 无返回值的 Promise
 * @throws {Error} 如果 npm install 执行失败
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
          `npm install 执行失败 (退出代码: ${code})
` +
            `错误详情: ${errorOutput || '未知错误'}
` +
            `建议: 请检查网络连接，或手动在项目目录中运行 'npm install'`
        );
        reject(error);
      }
    });

    // 监听进程错误
    installProcess.on('error', (error) => {
      const enhancedError = new Error(
        `无法执行 npm install: ${error.message}
` + `建议: 请确保已安装 Node.js 和 npm，或手动在项目目录中运行 'npm install'`
      );
      reject(enhancedError);
    });
  });
}
