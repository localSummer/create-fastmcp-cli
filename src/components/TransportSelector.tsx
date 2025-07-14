import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TransportType } from '../types/index.js';

interface TransportSelectorProps {
  onSelect: (transport: TransportType) => void;
  defaultValue: TransportType;
}

const transports: { key: TransportType; label: string; description: string }[] = [
  {
    key: 'stdio',
    label: 'STDIO',
    description: '标准输入输出 - 适用于命令行工具和本地集成'
  },
  {
    key: 'httpStream',
    label: 'HTTP Stream',
    description: 'HTTP流传输 - 适用于Web服务和API集成'
  },
  {
    key: 'sse',
    label: 'Server-Sent Events',
    description: 'SSE传输 - 适用于实时通信和事件流'
  }
];

const TransportSelector: React.FC<TransportSelectorProps> = ({ onSelect, defaultValue }) => {
  const [selectedIndex, setSelectedIndex] = useState(
    transports.findIndex(t => t.key === defaultValue) || 0
  );

  useInput((inputChar, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(transports.length - 1, prev + 1));
      return;
    }

    if (key.return) {
      onSelect(transports[selectedIndex].key);
      return;
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        🚀 请选择MCP传输类型:
      </Text>
      <Box marginTop={1} flexDirection="column">
        {transports.map((transport, index) => (
          <Box key={transport.key} marginY={0}>
            <Text color={index === selectedIndex ? "black" : "white"} 
                 backgroundColor={index === selectedIndex ? "cyan" : undefined}>
              {index === selectedIndex ? '> ' : '  '}
              {transport.label}
            </Text>
            <Box marginLeft={2}>
              <Text color="gray">- {transport.description}</Text>
            </Box>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          使用 ↑↓ 键选择，Enter 确认
        </Text>
      </Box>
    </Box>
  );
};

export default TransportSelector;
