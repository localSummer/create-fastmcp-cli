import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TransportType } from '../types/index.js';

/**
 * PortInput 组件的属性接口
 * @interface PortInputProps
 */
interface PortInputProps {
  /** 初始端口号值 */
  initialValue: string;
  /** 提交端口号时的回调函数 */
  onSubmit: (port: string) => void;
  /** 传输类型，用于显示不同的服务名称 */
  transport: TransportType;
}

/**
 * PortInput 组件
 * 用于接收用户输入的端口号
 * 只允许输入 1-65535 之间的数字
 * @param {PortInputProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const PortInput: React.FC<PortInputProps> = ({
  initialValue,
  onSubmit,
  transport,
}) => {
  /** 输入状态 */
  const [input, setInput] = useState(initialValue);

  /**
   * 处理键盘输入事件
   * 支持回车提交、退格删除和数字输入
   */
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

  /** 检查输入的端口号是否有效 */
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
