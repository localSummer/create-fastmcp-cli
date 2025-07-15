import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface ProjectNameInputProps {
  initialValue: string;
  onSubmit: (name: string) => void;
}

const ProjectNameInput: React.FC<ProjectNameInputProps> = ({
  initialValue,
  onSubmit,
}) => {
  const [input, setInput] = useState(initialValue);

  useInput((inputChar, key) => {
    if (key.return) {
      if (input.trim()) {
        onSubmit(input.trim());
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (inputChar && /^[a-zA-Z0-9-_]$/.test(inputChar)) {
      setInput((prev) => prev + inputChar);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">📁 请输入项目名称:</Text>
      <Box marginTop={1}>
        <Text color="gray">项目名称: </Text>
        <Text color="white" backgroundColor="blue">
          {input}
          <Text color="white">█</Text>
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          按 Enter 确认 (只允许字母、数字、连字符和下划线)
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectNameInput;
