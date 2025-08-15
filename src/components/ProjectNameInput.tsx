import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

/**
 * ProjectNameInput 组件的属性接口
 * @interface ProjectNameInputProps
 */
interface ProjectNameInputProps {
  /** 初始项目名称值 */
  initialValue: string;
  /** 提交项目名称时的回调函数 */
  onSubmit: (name: string) => void;
}

/**
 * ProjectNameInput 组件
 * 用于接收用户输入的项目名称
 * 只允许输入字母、数字、连字符和下划线
 * @param {ProjectNameInputProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const ProjectNameInput: React.FC<ProjectNameInputProps> = ({
  initialValue,
  onSubmit,
}) => {
  /** 输入状态 */
  const [input, setInput] = useState(initialValue);

  /**
   * 处理键盘输入事件
   * 支持回车提交、退格删除和字符输入
   */
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
