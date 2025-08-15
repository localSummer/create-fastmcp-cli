#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import CreateApp from './components/CreateApp.js';
import chalk from 'chalk';
import { generateProject } from './utils/projectGenerator.js';
import { TransportType } from './types/index.js';
import packageJson from '../package.json' with { type: 'json' };

/**
 * 主程序入口点
 * 使用 Commander.js 解析命令行参数并执行相应操作
 */
const program = new Command();

/**
 * 配置 Commander.js 程序
 * 设置程序名称、描述、版本以及命令行参数和选项
 */
program
  .name('create-fastmcp-cli')
  .description('快速创建基于fastmcp TypeScript的MCP服务器项目')
  .version(packageJson.version)
  .argument('[project-name]', '项目名称')
  .option('-t, --transport <type>', '传输类型 (stdio|httpStream|sse)', 'stdio')
  .option('-p, --port <port>', 'HTTP服务端口 (仅用于httpStream和sse)', '3000')
  .option('--no-interactive', '非交互模式')
  .action(async (projectName, options) => {
    // 验证传输类型
    const validTransports: TransportType[] = ['stdio', 'httpStream', 'sse'];
    if (!validTransports.includes(options.transport)) {
      console.error(chalk.red(`无效的传输类型: ${options.transport}`));
      console.error(
        chalk.gray(`有效的传输类型: ${validTransports.join(', ')}`)
      );
      process.exit(1);
    }

    // 验证端口
    if (options.transport !== 'stdio' && options.port) {
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(chalk.red(`无效的端口号: ${options.port}`));
        console.error(chalk.gray('端口号必须是 1-65535 之间的整数'));
        process.exit(1);
      }
    }

    // 如果是非交互模式且提供了项目名称，直接生成项目而不使用交互式界面
    if (options.interactive === false && projectName) {
      console.log(chalk.blue('🚀 FastMCP CLI 项目生成器'));
      console.log(chalk.gray('正在创建项目...\n'));

      try {
        await generateProject({
          projectName,
          transport: options.transport,
          port: options.transport === 'stdio' ? '3000' : options.port,
          description: `基于 fastmcp 的 ${options.transport} MCP 服务器项目`,
        });
        console.log(chalk.green('✅ 项目创建完成！'));
        console.log(chalk.gray(`项目已创建在 ./${projectName} 目录中`));
        console.log(chalk.gray('运行以下命令开始开发:'));
        console.log(chalk.white.bgGray(`  cd ${projectName} && npm run dev`));
      } catch (error) {
        console.error(chalk.red('创建项目时发生错误:'), error);
        process.exit(1);
      }
    } else {
      // 否则使用交互式界面
      console.log(chalk.blue('🚀 FastMCP CLI 项目生成器'));
      console.log(chalk.gray('正在启动交互式界面...\n'));

      const { waitUntilExit } = render(
        React.createElement(CreateApp, {
          projectName,
          transport: options.transport,
          port: options.port,
          interactive: options.interactive,
        })
      );

      try {
        await waitUntilExit();
      } catch (error) {
        console.error(chalk.red('创建项目时发生错误:'), error);
        process.exit(1);
      }
    }
  });

/**
 * 解析命令行参数并执行程序
 */
program.parse();
