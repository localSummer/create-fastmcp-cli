import { FastMCP } from 'fastmcp';
import { registerGreetTool } from './greet';
import logger from '../logger';

/**
 * 注册所有 STDIO 模板的工具到 MCP 服务器
 * @param server - FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  try {
    // 按逻辑顺序注册每个工具
    registerGreetTool(server);
  } catch (error) {
    logger.error(
      `Error registering tools: ${
        error instanceof Error ? error.message : error
      }`
    );
    throw error;
  }
}

export default {
  registerTools,
};
