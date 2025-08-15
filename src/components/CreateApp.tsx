import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import ProjectNameInput from './ProjectNameInput.js';
import TransportSelector from './TransportSelector.js';
import PortInput from './PortInput.js';
import ProjectGenerator from './ProjectGenerator.js';
import { CreateAppProps, TransportType } from '../types/index.js';

/**
 * CreateApp 组件
 * 这是应用程序的主要入口点，负责管理整个项目创建流程
 * @param {CreateAppProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const CreateApp: React.FC<CreateAppProps> = ({
  projectName: initialProjectName,
  transport: initialTransport = 'stdio',
  port: initialPort = '3000',
}) => {
  /**
   * 当前步骤状态
   * 0: 输入项目名称
   * 1: 选择传输类型
   * 2: 输入端口号 (仅用于 httpStream 和 sse)
   * 3: 生成项目
   */
  const [step, setStep] = useState(initialProjectName ? 1 : 0); // 如果已有项目名，从传输类型选择开始
  /** 项目名称状态 */
  const [projectName, setProjectName] = useState(initialProjectName || '');
  /** 传输类型状态 */
  const [transport, setTransport] = useState<TransportType>(initialTransport);
  /** 端口号状态 */
  const [port, setPort] = useState(initialPort);
  /** 获取 exit 函数用于退出应用 */
  const { exit } = useApp();

  /**
   * 处理项目名称提交事件
   * @param {string} name - 用户输入的项目名称
   */
  const handleProjectNameSubmit = (name: string) => {
    setProjectName(name);
    setStep(1);
  };

  /**
   * 处理传输类型选择事件
   * @param {TransportType} selectedTransport - 用户选择的传输类型
   */
  const handleTransportSelect = (selectedTransport: TransportType) => {
    setTransport(selectedTransport);
    if (selectedTransport === 'stdio') {
      setStep(3); // 跳过端口设置，直接到生成步骤
    } else {
      setStep(2);
    }
  };

  /**
   * 处理端口号提交事件
   * @param {string} selectedPort - 用户输入的端口号
   */
  const handlePortSubmit = (selectedPort: string) => {
    setPort(selectedPort);
    setStep(3);
  };

  /**
   * 处理项目生成完成事件
   * 在项目生成完成后延时退出应用
   */
  const handleGenerationComplete = () => {
    setTimeout(() => {
      exit();
    }, 2000);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="blue" bold>
        🚀 FastMCP 项目生成器
      </Text>
      <Text color="gray">创建基于 FastMCP TypeScript 的 MCP 服务器项目</Text>
      <Box marginTop={1} />

      {step === 0 && (
        <ProjectNameInput
          initialValue={projectName}
          onSubmit={handleProjectNameSubmit}
        />
      )}

      {step === 1 && (
        <TransportSelector
          onSelect={handleTransportSelect}
          defaultValue={transport}
        />
      )}

      {step === 2 && (
        <PortInput
          initialValue={port}
          onSubmit={handlePortSubmit}
          transport={transport}
        />
      )}

      {step === 3 && (
        <ProjectGenerator
          projectName={projectName}
          transport={transport}
          port={port}
          onComplete={handleGenerationComplete}
        />
      )}
    </Box>
  );
};

export default CreateApp;
