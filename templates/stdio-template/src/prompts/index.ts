import { FastMCP } from 'fastmcp';
import { registerGitCommitPrompt } from './git-commit.js';
import logger from '../logger.js';

/**
 * 注册所有 STDIO 模板的提示到 MCP 服务器
 * @param server - FastMCP server instance
 */
export function registerPrompts(server: FastMCP): void {
  try {
    // 注册所有提示
    registerGitCommitPrompt(server);
  } catch (error) {
    logger.error(`Error registering prompts: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

export default {
  registerPrompts,
}; 