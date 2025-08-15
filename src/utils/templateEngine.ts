import fs from 'fs-extra';
import path from 'path';
import { TemplateData } from '../types/index.js';

/**
 * 模板上下文接口
 * 扩展了 TemplateData 接口，用于模板渲染
 * @interface TemplateContext
 * @extends {TemplateData}
 */
export interface TemplateContext extends TemplateData {
  // 扩展上下文，用于模板渲染
  [key: string]: any;
}

/**
 * 模板引擎选项接口
 * 定义了模板引擎的配置选项
 * @interface TemplateOptions
 */
export interface TemplateOptions {
  /** 模板目录路径 */
  templatesDir?: string;
  /** 文件编码格式 */
  encoding?: BufferEncoding;
}

/**
 * 模板引擎类
 * 负责处理模板的渲染，包括变量替换和条件渲染
 */
export class TemplateEngine {
  /** 模板目录路径 */
  private templatesDir: string;
  /** 文件编码格式 */
  private encoding: BufferEncoding;

  /**
   * 构造函数
   * @param {TemplateOptions} options - 模板引擎选项
   */
  constructor(options: TemplateOptions = {}) {
    this.templatesDir =
      options.templatesDir || path.join(process.cwd(), 'templates');
    this.encoding = options.encoding || 'utf8';
  }

  /**
   * 渲染模板内容，支持变量替换和条件渲染
   * @param {string} content - 模板内容
   * @param {TemplateContext} context - 模板上下文
   * @returns {string} 渲染后的模板内容
   */
  public renderTemplate(content: string, context: TemplateContext): string {
    let rendered = content;

    // 处理条件渲染 {{#if condition}}...{{/if}}
    rendered = this.processConditionals(rendered, context);

    // 处理变量替换 {{variable}}
    rendered = this.processVariables(rendered, context);

    return rendered;
  }

  /**
   * 从文件加载并渲染模板
   * @param {string} templatePath - 模板文件路径（相对于模板目录）
   * @param {TemplateContext} context - 模板上下文
   * @returns {Promise<string>} 渲染后的模板内容
   * @throws {Error} 如果模板文件不存在
   */
  public async renderTemplateFile(
    templatePath: string,
    context: TemplateContext
  ): Promise<string> {
    const fullPath = path.join(this.templatesDir, templatePath);

    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`模板文件不存在: ${fullPath}`);
    }

    const content = await fs.readFile(fullPath, this.encoding);
    return this.renderTemplate(content, context);
  }

  /**
   * 获取完整的模板上下文
   * 在原始数据基础上添加了一些用于模板渲染的辅助变量
   * @param {TemplateData} data - 原始模板数据
   * @returns {TemplateContext} 完整的模板上下文
   */
  public buildContext(data: TemplateData): TemplateContext {
    const context: TemplateContext = {
      ...data,
      // 添加条件变量用于模板中的条件渲染
      isStdio: data.transport === 'stdio',
      isHttpStream: data.transport === 'httpStream',
      isSse: data.transport === 'sse',
      hasPort: data.transport !== 'stdio',
      // 添加格式化的变量
      transportDisplay: this.getTransportDisplay(data.transport),
      year: new Date().getFullYear(),
      timestamp: new Date().toISOString(),
    };

    return context;
  }

  /**
   * 处理模板中的条件渲染语法 {{#if condition}}...{{/if}}
   * @param {string} content - 模板内容
   * @param {TemplateContext} context - 模板上下文
   * @returns {string} 处理后的模板内容
   */
  private processConditionals(
    content: string,
    context: TemplateContext
  ): string {
    // 处理 {{#if condition}}...{{/if}} 语法
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return content.replace(ifRegex, (match, condition, block) => {
      const conditionValue = context[condition];
      return conditionValue ? block : '';
    });
  }

  /**
   * 处理模板中的变量替换语法 {{variable}}
   * @param {string} content - 模板内容
   * @param {TemplateContext} context - 模板上下文
   * @returns {string} 处理后的模板内容
   */
  private processVariables(content: string, context: TemplateContext): string {
    // 处理 {{variable}} 语法
    const variableRegex = /\{\{(\w+)\}\}/g;

    return content.replace(variableRegex, (match, variable) => {
      const value = context[variable];
      if (value === undefined || value === null) {
        console.warn(`模板变量未定义: ${variable}`);
        return match;
      }
      return String(value);
    });
  }

  /**
   * 获取传输类型的显示名称
   * @param {string} transport - 传输类型
   * @returns {string} 传输类型的显示名称
   */
  private getTransportDisplay(transport: string): string {
    const displays: Record<string, string> = {
      stdio: 'STDIO (标准输入输出)',
      httpStream: 'HTTP Stream',
      sse: 'Server-Sent Events',
    };
    return displays[transport] || transport;
  }
}

// 导出默认实例
export const templateEngine = new TemplateEngine();
