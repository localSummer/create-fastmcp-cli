import { FastMCP } from 'fastmcp';

/**
 * 注册Git提交提示
 * @param server - FastMCP server instance
 */
export function registerGitCommitPrompt(server: FastMCP): void {
  server.addPrompt({
    name: 'git-commit',
    description: 'Generate a Git commit message',
    arguments: [
      {
        name: 'changes',
        description: 'Git diff or description of changes',
        required: true,
      },
    ],
    load: async (args: any) => {
      return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
    },
  });
}
