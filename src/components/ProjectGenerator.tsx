import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { generateProject } from '../utils/projectGenerator.js';
import { TransportType } from '../types/index.js';

/**
 * ProjectGenerator 组件的属性接口
 * @interface ProjectGeneratorProps
 */
interface ProjectGeneratorProps {
  /** 项目名称 */
  projectName: string;
  /** 传输类型 */
  transport: TransportType;
  /** 端口号 */
  port: string;
  /** 项目生成完成时的回调函数 */
  onComplete: () => void;
}

/**
 * ProjectGenerator 组件
 * 负责执行项目生成的核心逻辑
 * 包括创建目录、生成文件、安装依赖等步骤
 * @param {ProjectGeneratorProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({
  projectName,
  transport,
  port,
  onComplete,
}) => {
  /** 当前状态文本 */
  const [status, setStatus] = useState('准备中...');
  /** 项目是否生成完成 */
  const [isComplete, setIsComplete] = useState(false);
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect 钩子
   * 在组件挂载时执行项目生成逻辑
   */
  useEffect(() => {
    const generate = async () => {
      try {
        setStatus('创建项目目录...');
        await new Promise((resolve) => setTimeout(resolve, 500));

        setStatus('生成项目文件...');
        await generateProject({
          projectName,
          transport,
          port,
          description: `基于 fastmcp 的 ${transport} MCP 服务器项目`,
        });

        setStatus('安装依赖...');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStatus('项目创建完成! 🎉');
        setIsComplete(true);

        setTimeout(() => {
          onComplete();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : '创建项目时发生未知错误');
      }
    };

    generate();
  }, [projectName, transport, port, onComplete]);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ 创建项目失败:</Text>
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">📦 正在创建项目: {projectName}</Text>
      <Box marginTop={1}>
        <Text color="gray">传输类型: </Text>
        <Text color="green">{transport}</Text>
      </Box>
      {transport !== 'stdio' && (
        <Box>
          <Text color="gray">端口: </Text>
          <Text color="green">{port}</Text>
        </Box>
      )}
      <Box marginTop={2} alignItems="center">
        {!isComplete && <Text color="cyan">⏳ </Text>}
        <Text color={isComplete ? 'green' : 'yellow'}>{status}</Text>
      </Box>
      {isComplete && (
        <Box marginTop={1} flexDirection="column">
          <Text color="green">✅ 项目已成功创建在 ./{projectName} 目录中</Text>
          <Box marginTop={1}>
            <Text color="gray">运行以下命令开始开发:</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="white" backgroundColor="gray">
              cd {projectName} && npm run dev
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectGenerator;
