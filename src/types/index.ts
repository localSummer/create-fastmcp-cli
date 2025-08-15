/**
 * 支持的传输类型枚举
 * @typedef {('stdio' | 'httpStream' | 'sse')} TransportType
 */
export type TransportType = 'stdio' | 'httpStream' | 'sse';

/**
 * 项目配置接口
 * 定义了创建项目时所需的基本配置信息
 * @interface ProjectConfig
 */
export interface ProjectConfig {
  /** 项目名称 */
  projectName: string;
  /** 传输类型 */
  transport: TransportType;
  /** 端口号 (仅用于 httpStream 和 sse) */
  port?: string;
  /** 是否启用交互模式 */
  interactive: boolean;
}

/**
 * CreateApp 组件的属性接口
 * 定义了传递给 CreateApp React 组件的属性
 * @interface CreateAppProps
 */
export interface CreateAppProps {
  /** 项目名称 (可选) */
  projectName?: string;
  /** 传输类型 */
  transport: TransportType;
  /** 端口号 (可选, 仅用于 httpStream 和 sse) */
  port?: string;
  /** 是否启用交互模式 */
  interactive: boolean;
}

/**
 * 模板数据接口
 * 定义了模板渲染时所需的数据结构
 * @interface TemplateData
 */
export interface TemplateData {
  /** 项目名称 */
  projectName: string;
  /** 传输类型 */
  transport: TransportType;
  /** 端口号 */
  port: string;
  /** 项目描述 */
  description: string;
} 