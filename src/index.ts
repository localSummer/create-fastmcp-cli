#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import CreateApp from './components/CreateApp.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('cnpm-create-fastmcp-cli')
  .description('快速创建基于fastmcp TypeScript的MCP服务器项目')
  .version('1.0.0')
  .argument('[project-name]', '项目名称')
  .option('-t, --transport <type>', '传输类型 (stdio|httpStream|sse)', 'stdio')
  .option('-p, --port <port>', 'HTTP服务端口 (仅用于httpStream和sse)', '3000')
  .option('--no-interactive', '非交互模式')
  .action(async (projectName, options) => {
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
  });

program.parse();
