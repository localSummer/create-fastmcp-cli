import { FastMCP } from 'fastmcp';

/**
 * 注册读取文件资源
 * @param server - FastMCP server instance
 */
export function registerReadFileResource(server: FastMCP): void {
  server.addResource({
    uri: 'file:///logs/app.log',
    name: 'Application Logs',
    mimeType: 'text/plain',
    async load() {
      return {
        text: 'First file content',
      };
    },
  });
}
