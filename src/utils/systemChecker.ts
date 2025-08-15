import { spawn } from 'child_process';
import chalk from 'chalk';

/**
 * 系统检查结果接口
 */
export interface SystemCheckResult {
  /** 是否通过检查 */
  passed: boolean;
  /** 检查的依赖名称 */
  dependency: string;
  /** 版本信息（如果可获取） */
  version?: string;
  /** 错误信息（如果检查失败） */
  error?: string;
}

/**
 * 系统依赖检查器
 * 检查必要的系统依赖是否已安装
 */
export class SystemChecker {
  /**
   * 检查单个命令是否可用
   * @param command - 要检查的命令
   * @param versionFlag - 获取版本的标志，默认为 '--version'
   * @returns 检查结果
   */
  private async checkCommand(
    command: string,
    versionFlag: string = '--version'
  ): Promise<SystemCheckResult> {
    const isWindows = process.platform === 'win32';
    const commandName =
      isWindows && command === 'npm'
        ? 'npm.cmd'
        : isWindows && command === 'git'
        ? 'git.exe'
        : command;

    return new Promise((resolve) => {
      const process = spawn(commandName, [versionFlag], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows,
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const version = this.extractVersion(output || errorOutput);
          resolve({
            passed: true,
            dependency: command,
            version,
          });
        } else {
          resolve({
            passed: false,
            dependency: command,
            error: errorOutput || `命令 ${command} 不可用`,
          });
        }
      });

      process.on('error', (error) => {
        resolve({
          passed: false,
          dependency: command,
          error: `无法执行命令 ${command}: ${error.message}`,
        });
      });
    });
  }

  /**
   * 从输出中提取版本号
   * @param output - 命令输出
   * @returns 版本号字符串
   */
  private extractVersion(output: string): string {
    // 匹配常见的版本号格式
    const versionMatch = output.match(/(\d+\.\d+\.\d+[^\s]*)/);
    return versionMatch ? versionMatch[1] : '未知版本';
  }

  /**
   * 检查 Node.js 是否满足最低版本要求
   * @param minVersion - 最低版本要求
   * @returns 检查结果
   */
  async checkNodeVersion(
    minVersion: string = '16.0.0'
  ): Promise<SystemCheckResult> {
    const nodeVersion = process.version.slice(1); // 移除 'v' 前缀
    const [majorRequired, minorRequired, patchRequired] = minVersion
      .split('.')
      .map(Number);
    const [majorCurrent, minorCurrent, patchCurrent] = nodeVersion
      .split('.')
      .map(Number);

    const isVersionValid =
      majorCurrent > majorRequired ||
      (majorCurrent === majorRequired && minorCurrent > minorRequired) ||
      (majorCurrent === majorRequired &&
        minorCurrent === minorRequired &&
        patchCurrent >= patchRequired);

    return {
      passed: isVersionValid,
      dependency: 'Node.js',
      version: nodeVersion,
      error: isVersionValid
        ? undefined
        : `需要 Node.js ${minVersion} 或更高版本，当前版本: ${nodeVersion}`,
    };
  }

  /**
   * 执行完整的系统检查
   * @param includeGit - 是否检查 Git（可选）
   * @returns 所有检查结果
   */
  async performSystemCheck(
    includeGit: boolean = true
  ): Promise<SystemCheckResult[]> {
    console.log(chalk.blue('🔍 正在检查系统依赖...'));

    const checks: Promise<SystemCheckResult>[] = [
      this.checkNodeVersion(),
      this.checkCommand('npm'),
    ];

    if (includeGit) {
      checks.push(this.checkCommand('git'));
    }

    const results = await Promise.all(checks);

    this.displayResults(results);

    return results;
  }

  /**
   * 显示检查结果
   * @param results - 检查结果数组
   */
  private displayResults(results: SystemCheckResult[]): void {
    console.log();

    results.forEach((result) => {
      if (result.passed) {
        console.log(
          chalk.green(`✅ ${result.dependency}`) +
            (result.version ? chalk.gray(` (${result.version})`) : '')
        );
      } else {
        console.log(chalk.red(`❌ ${result.dependency}: ${result.error}`));
      }
    });

    console.log();

    const failedChecks = results.filter((r) => !r.passed);
    if (failedChecks.length > 0) {
      console.log(chalk.red('系统检查失败，请安装缺失的依赖后重试。'));
      console.log();
      console.log(chalk.gray('安装指南:'));

      failedChecks.forEach((result) => {
        switch (result.dependency) {
          case 'Node.js':
            console.log(chalk.gray('- Node.js: https://nodejs.org/'));
            break;
          case 'npm':
            console.log(chalk.gray('- npm: 通常随 Node.js 一起安装'));
            break;
          case 'git':
            console.log(chalk.gray('- Git: https://git-scm.com/'));
            break;
        }
      });
    } else {
      console.log(chalk.green('所有系统依赖检查通过！'));
    }
  }

  /**
   * 检查是否所有必需依赖都可用
   * @param results - 检查结果数组
   * @returns 是否所有检查都通过
   */
  hasAllRequiredDependencies(results: SystemCheckResult[]): boolean {
    return results.every((result) => result.passed);
  }
}

// 导出默认实例
export const systemChecker = new SystemChecker();
