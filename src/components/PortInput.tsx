import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TransportType } from '../types/index.js';

interface PortInputProps {
  initialValue: string;
  onSubmit: (port: string) => void;
  transport: TransportType;
}

const PortInput: React.FC<PortInputProps> = ({
  initialValue,
  onSubmit,
  transport,
}) => {
  const [input, setInput] = useState(initialValue);

  useInput((inputChar, key) => {
    if (key.return) {
      const port = input.trim();
      if (
        port &&
        /^\d+$/.test(port) &&
        parseInt(port) > 0 &&
        parseInt(port) < 65536
      ) {
        onSubmit(port);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (inputChar && /^\d$/.test(inputChar)) {
      setInput((prev) => prev + inputChar);
    }
  });

  const isValidPort =
    input &&
    /^\d+$/.test(input) &&
    parseInt(input) > 0 &&
    parseInt(input) < 65536;

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        🌐 设置{transport === 'httpStream' ? 'HTTP服务' : 'SSE服务'}端口:
      </Text>
      <Box marginTop={1}>
        <Text color="gray">端口号: </Text>
        <Text color="white" backgroundColor={isValidPort ? 'green' : 'red'}>
          {input}
          <Text color="white">█</Text>
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          请输入有效端口号 (1-65535)，按 Enter 确认
        </Text>
      </Box>
      {!isValidPort && input && (
        <Box marginTop={1}>
          <Text color="red">❌ 请输入有效的端口号 (1-65535)</Text>
        </Box>
      )}
    </Box>
  );
};

export default PortInput;
