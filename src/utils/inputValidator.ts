/**
 * 输入验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误信息（如果验证失败） */
  error?: string;
  /** 警告信息（可选） */
  warning?: string;
  /** 建议信息（可选） */
  suggestion?: string;
}

/**
 * 输入验证工具类
 * 提供各种用户输入的验证功能
 */
export class InputValidator {
  /**
   * 验证项目名称
   * @param projectName - 项目名称
   * @returns 验证结果
   */
  validateProjectName(projectName: string): ValidationResult {
    // 基本检查
    if (!projectName || projectName.trim().length === 0) {
      return {
        isValid: false,
        error: '项目名称不能为空',
      };
    }

    const trimmedName = projectName.trim();

    // 长度检查
    if (trimmedName.length < 2) {
      return {
        isValid: false,
        error: '项目名称至少需要2个字符',
      };
    }

    if (trimmedName.length > 214) {
      return {
        isValid: false,
        error: '项目名称不能超过214个字符',
      };
    }

    // npm 包名规则检查
    const npmNameRegex = /^[a-z0-9]([a-z0-9\-_.])*[a-z0-9]$|^[a-z0-9]$/i;
    if (!npmNameRegex.test(trimmedName)) {
      return {
        isValid: false,
        error: '项目名称只能包含字母、数字、连字符(-)、下划线(_)和点(.)',
        suggestion: '建议使用 kebab-case 格式，如: my-awesome-project',
      };
    }

    // 不能以点或连字符开头或结尾（单字符除外）
    if (trimmedName.length > 1 && (trimmedName.startsWith('.') || trimmedName.startsWith('-'))) {
      return {
        isValid: false,
        error: '项目名称不能以点(.)或连字符(-)开头',
      };
    }

    if (trimmedName.length > 1 && (trimmedName.endsWith('.') || trimmedName.endsWith('-'))) {
      return {
        isValid: false,
        error: '项目名称不能以点(.)或连字符(-)结尾',
      };
    }

    // 检查保留关键词
    const reservedNames = [
      'node_modules',
      'favicon.ico',
      'con', 'prn', 'aux', 'nul', // Windows 保留名
      'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
      'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
    ];

    if (reservedNames.includes(trimmedName.toLowerCase())) {
      return {
        isValid: false,
        error: `"${trimmedName}" 是系统保留名称，请使用其他名称`,
      };
    }

    // 检查是否包含空格
    if (trimmedName.includes(' ')) {
      return {
        isValid: false,
        error: '项目名称不能包含空格',
        suggestion: '建议使用连字符(-)代替空格',
      };
    }

    // 检查连续的特殊字符
    if (/[-_.]{2,}/.test(trimmedName)) {
      return {
        isValid: true,
        warning: '项目名称包含连续的特殊字符，建议避免使用',
      };
    }

    // 检查大写字母（警告）
    if (/[A-Z]/.test(trimmedName)) {
      return {
        isValid: true,
        warning: '建议使用小写字母，符合 npm 包命名规范',
        suggestion: `建议改为: ${trimmedName.toLowerCase()}`,
      };
    }

    return { isValid: true };
  }

  /**
   * 验证端口号
   * @param port - 端口号字符串
   * @returns 验证结果
   */
  validatePort(port: string): ValidationResult {
    if (!port || port.trim().length === 0) {
      return {
        isValid: false,
        error: '端口号不能为空',
      };
    }

    const trimmedPort = port.trim();
    const portNumber = parseInt(trimmedPort, 10);

    // 检查是否为数字
    if (isNaN(portNumber) || portNumber.toString() !== trimmedPort) {
      return {
        isValid: false,
        error: '端口号必须是一个有效的数字',
      };
    }

    // 检查端口号范围
    if (portNumber < 1 || portNumber > 65535) {
      return {
        isValid: false,
        error: '端口号必须在 1-65535 范围内',
      };
    }

    // 检查系统保留端口（警告）
    if (portNumber <= 1023) {
      return {
        isValid: true,
        warning: '端口号 1-1023 为系统保留端口，可能需要管理员权限',
        suggestion: '建议使用 3000-9999 范围内的端口',
      };
    }

    // 检查常用端口冲突（警告）
    const commonPorts: Record<number, string> = {
      80: 'HTTP',
      443: 'HTTPS',
      3000: 'React/Node.js 开发服务器',
      5000: 'Flask 默认端口',
      8000: 'Django 开发服务器',
      8080: 'HTTP 代理/Tomcat',
      9000: 'SonarQube',
    };

    if (commonPorts[portNumber]) {
      return {
        isValid: true,
        warning: `端口 ${portNumber} 通常被 ${commonPorts[portNumber]} 使用`,
        suggestion: '如果该端口已被占用，请选择其他端口',
      };
    }

    return { isValid: true };
  }

  /**
   * 验证传输类型
   * @param transport - 传输类型
   * @param validTransports - 有效的传输类型列表
   * @returns 验证结果
   */
  validateTransport(transport: string, validTransports: string[]): ValidationResult {
    if (!transport || transport.trim().length === 0) {
      return {
        isValid: false,
        error: '传输类型不能为空',
      };
    }

    if (!validTransports.includes(transport)) {
      return {
        isValid: false,
        error: `无效的传输类型: ${transport}`,
        suggestion: `有效的传输类型: ${validTransports.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * 格式化项目名称建议
   * @param projectName - 原始项目名称
   * @returns 格式化后的建议名称
   */
  formatProjectNameSuggestion(projectName: string): string {
    return projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/[^a-z0-9\-_.]/g, '') // 移除无效字符
      .replace(/[-_.]+/g, '-') // 连续特殊字符替换为单个连字符
      .replace(/^[-_.]+|[-_.]+$/g, ''); // 移除开头和结尾的特殊字符
  }
}

// 导出默认实例
export const inputValidator = new InputValidator();