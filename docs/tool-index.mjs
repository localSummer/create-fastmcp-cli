import { registerInitializeProjectTool } from './initialize-project.mjs';
import { registerGetAgentFlowTool } from './get-agent-flow.mjs';
import { registerNextTaskTool } from './next-task.mjs';
import { registerSetTaskStatusTool } from './set-task-status.mjs';
// import { registerGetTenoDocsTool } from './get-teno-docs.mjs';
import { registerManualGitCommitTool } from './manual-git-commit.mjs';
import { registerImageCompressionTool } from './image-compression.mjs';
import {
  registerRollbackTaskTool,
  registerGetTaskGitHistoryTool,
  registerFindCommitByStatusTool,
  registerRollbackTaskToPendingTool,
} from './rollback-task.mjs';

/**
 * 注册所有LP Figma2Code工具到MCP服务器
 * @param {Object} server - FastMCP server instance
 */
export function registerFigma2CodeTools(server) {
  try {
    // 按逻辑顺序注册每个工具
    registerInitializeProjectTool(server);
    registerGetAgentFlowTool(server);
    registerNextTaskTool(server);
    registerSetTaskStatusTool(server);
    // registerGetTenoDocsTool(server);

    // 注册图片压缩工具
    registerImageCompressionTool(server);

    // 注册Git集成工具
    registerManualGitCommitTool(server);
    registerRollbackTaskTool(server);
    registerGetTaskGitHistoryTool(server);
    registerFindCommitByStatusTool(server);
    registerRollbackTaskToPendingTool(server);
  } catch (error) {
    console.error(`Error registering LP Figma2Code tools: ${error.message}`);
    throw error;
  }
}

export default {
  registerFigma2CodeTools,
};
