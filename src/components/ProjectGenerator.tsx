import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { generateProject } from '../utils/projectGenerator.js';
import { TransportType } from '../types/index.js';

interface ProjectGeneratorProps {
  projectName: string;
  transport: TransportType;
  port: string;
  onComplete: () => void;
}

const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ 
  projectName, 
  transport, 
  port, 
  onComplete 
}) => {
  const [status, setStatus] = useState('准备中...');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        setStatus('创建项目目录...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus('生成项目文件...');
        await generateProject({
          projectName,
          transport,
          port,
          description: `基于 fastmcp 的 ${transport} MCP 服务器项目`
        });
        
        setStatus('安装依赖...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">
          ❌ 创建项目失败:
        </Text>
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        📦 正在创建项目: {projectName}
      </Text>
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
        <Text color={isComplete ? "green" : "yellow"}>
          {status}
        </Text>
      </Box>
      {isComplete && (
        <Box marginTop={1} flexDirection="column">
          <Text color="green">
            ✅ 项目已成功创建在 ./{projectName} 目录中
          </Text>
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