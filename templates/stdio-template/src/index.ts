#!/usr/bin/env node
import dotenv from 'dotenv';
import MCPServer from './server';
import logger from './logger';

// 加载环境变量
dotenv.config();

/**
 * 启动 MCP 服务器
 */
async function startServer() {
  const server = new MCPServer();

  // 处理优雅关闭
  process.on('SIGINT', async () => {
    logger.error('收到 SIGINT 信号，正在关闭服务器...');
    await server.stop();
    process.exit(0);
  });

  // 处理 SIGTERM
  process.on('SIGTERM', async () => {
    logger.error('收到 SIGTERM 信号，正在关闭服务器...');
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    logger.error(`启动 MCP 服务器失败: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

// 启动服务器
startServer();
