import { FastMCP } from 'fastmcp';
import path from 'path';
import fs from 'fs';
import { registerTools } from './tools';
import { registerResources } from './resources';
import { registerPrompts } from './prompts';
import logger from './logger';

/**
 * MCP 服务器类，用于 HTTP Stream 传输
 */
class MCPServer {
  private server: FastMCP;
  private initialized: boolean = false;
  
  constructor() {
    // 获取 package.json 中的版本信息
    const packagePath = path.join(__dirname, '../package.json');
    let packageJson: any = { name: '{{projectName}}', version: '1.0.0' };
    
    try {
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch (error) {
      logger.error('无法读取 package.json，使用默认配置');
    }

    this.server = new FastMCP({
      name: packageJson.name || '{{projectName}}',
      version: packageJson.version || '1.0.0',
    });

    // 绑定方法
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * 初始化 MCP 服务器，注册所有工具、资源和提示
   */
  async init(): Promise<MCPServer> {
    if (this.initialized) return this;

    try {
      // 注册所有功能模块
      registerTools(this.server);
      registerResources(this.server);
      registerPrompts(this.server);

      this.initialized = true;
      
    } catch (error) {
      logger.error(`服务器初始化失败: ${error instanceof Error ? error.message : error}`);
      throw error;
    }

    return this;
  }

  /**
   * 启动 MCP 服务器
   */
  async start(): Promise<MCPServer> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      // 获取端口配置
      const port = parseInt(process.env.PORT || '{{port}}') || 3001;
      
      // 启动 FastMCP 服务器，使用 HTTP Stream 传输
      await this.server.start({
        transportType: 'httpStream',
        httpStream: { port },
        timeout: 120000, // 2分钟超时
      });

      logger.info(
        `{{projectName}} MCP 服务器已启动在端口 ${port} (HTTP Stream)`
      );
    } catch (error) {
      logger.error(`服务器启动失败: ${error instanceof Error ? error.message : error}`);
      throw error;
    }

    return this;
  }

  /**
   * 停止 MCP 服务器
   */
  async stop(): Promise<void> {
    if (this.server) {
      try {
        await this.server.stop();
        logger.error('{{projectName}} MCP 服务器已停止');
      } catch (error) {
        logger.error(`服务器停止时出错: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
}

export default MCPServer; 