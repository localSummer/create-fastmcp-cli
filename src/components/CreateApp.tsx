import React, { useState } from 'react';
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
}) => {
  const [step, setStep] = useState(initialProjectName ? 1 : 0); // 如果已有项目名，从传输类型选择开始
  const [projectName, setProjectName] = useState(initialProjectName || '');
  const [transport, setTransport] = useState<TransportType>(initialTransport);
  const [port, setPort] = useState(initialPort);
  const { exit } = useApp();

  const handleProjectNameSubmit = (name: string) => {
    setProjectName(name);
    setStep(1);
  };

  const handleTransportSelect = (selectedTransport: TransportType) => {
    setTransport(selectedTransport);
    if (selectedTransport === 'stdio') {
      setStep(3); // 跳过端口设置，直接到生成步骤
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
