import { FastMCP } from 'fastmcp';
import { registerReadFileResource } from './read-file';
import logger from '../logger';

/**
 * 注册所有 STDIO 模板的资源到 MCP 服务器
 * @param server - FastMCP server instance
 */
export function registerResources(server: FastMCP): void {
  try {
    // 注册所有资源
    registerReadFileResource(server);
  } catch (error) {
    logger.error(
      `Error registering resources: ${
        error instanceof Error ? error.message : error
      }`
    );
    throw error;
  }
}

export default {
  registerResources,
};
