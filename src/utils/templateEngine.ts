import fs from 'fs-extra';
import path from 'path';
import { TemplateData } from '../types/index.js';

export interface TemplateContext extends TemplateData {
  // 扩展上下文，用于模板渲染
  [key: string]: any;
}

export interface TemplateOptions {
  templatesDir?: string;
  encoding?: BufferEncoding;
}

export class TemplateEngine {
  private templatesDir: string;
  private encoding: BufferEncoding;

  constructor(options: TemplateOptions = {}) {
    this.templatesDir =
      options.templatesDir || path.join(process.cwd(), 'templates');
    this.encoding = options.encoding || 'utf8';
  }

  /**
   * 渲染模板内容，支持变量替换和条件渲染
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
