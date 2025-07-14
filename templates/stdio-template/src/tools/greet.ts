import { z } from 'zod';
import { FastMCP } from 'fastmcp';

/**
 * 简单的问候工具 - 演示基本的参数处理和响应
 */
const greetTool = {
  name: 'greet',
  description: '生成个性化问候语',
  parameters: z.object({
    name: z.string().describe('要问候的人的姓名'),
  }),
  execute: async ({ name }: { name: string }, context?: any) => {
    if (context?.log) {
      context.log.info('生成问候语', { name });
    }

    return `你好，${name}！欢迎使用 FastMCP 服务器！`;
  },
};

/**
 * 注册问候工具
 */
export function registerGreetTool(server: FastMCP): void {
  server.addTool(greetTool);
}
