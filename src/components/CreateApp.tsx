import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import ProjectNameInput from './ProjectNameInput.js';
import TransportSelector from './TransportSelector.js';
import PortInput from './PortInput.js';
import ProjectGenerator from './ProjectGenerator.js';
import { CreateAppProps, TransportType } from '../types/index.js';

const CreateApp: React.FC<CreateAppProps> = ({ 
  projectName: initialProjectName, 
  transport: initialTransport = 'stdio', 
  port: initialPort = '3000',
  interactive = true 
}) => {
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState(initialProjectName || '');
  const [transport, setTransport] = useState<TransportType>(initialTransport);
  const [port, setPort] = useState(initialPort);
  const { exit } = useApp();

  useEffect(() => {
    // 如果是非交互模式且有项目名称，直接跳到生成步骤
    if (!interactive && initialProjectName) {
      setStep(3);
    }
  }, [interactive, initialProjectName]);

  const handleProjectNameSubmit = (name: string) => {
    setProjectName(name);
    setStep(1);
  };

  const handleTransportSelect = (selectedTransport: TransportType) => {
    setTransport(selectedTransport);
    if (selectedTransport === 'stdio') {
      setStep(3); // 跳过端口设置
    } else {
      setStep(2);
    }
  };

  const handlePortSubmit = (selectedPort: string) => {
    setPort(selectedPort);
    setStep(3);
  };

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
      <Text color="gray">
        创建基于 fastmcp TypeScript 的 MCP 服务器项目
      </Text>
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
