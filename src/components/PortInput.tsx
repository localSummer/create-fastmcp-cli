import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TransportType } from '../types/index.js';
import { inputValidator } from '../utils/inputValidator.js';

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
 * 用于接收用户输入的端口号，支持实时验证和冲突检测
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
  /** 验证错误状态 */
  const [validationError, setValidationError] = useState('');
  /** 验证警告状态 */
  const [validationWarning, setValidationWarning] = useState('');
  /** 建议状态 */
  const [suggestion, setSuggestion] = useState('');

  /**
   * 验证并更新输入状态
   * @param newInput - 新的输入值
   */
  const validateAndSetInput = (newInput: string) => {
    setInput(newInput);
    
    if (newInput.trim()) {
      const result = inputValidator.validatePort(newInput.trim());
      setValidationError(result.isValid ? '' : result.error || '');
      setValidationWarning(result.warning || '');
      setSuggestion(result.suggestion || '');
    } else {
      setValidationError('');
      setValidationWarning('');
      setSuggestion('');
    }
  };

  /**
   * 处理键盘输入事件
   * 支持回车提交、退格删除和数字输入
   */
  useInput((inputChar, key) => {
    if (key.return) {
      const port = input.trim();
      if (port) {
        const result = inputValidator.validatePort(port);
        if (result.isValid) {
          onSubmit(port);
        } else {
          // 显示错误，不提交
          setValidationError(result.error || '输入无效');
        }
      }
      return;
    }

    if (key.backspace || key.delete) {
      const newInput = input.slice(0, -1);
      validateAndSetInput(newInput);
      return;
    }

    if (inputChar && /^\d$/.test(inputChar)) {
      const newInput = input + inputChar;
      if (newInput.length <= 5) { // 限制最大长度
        validateAndSetInput(newInput);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        🌐 设置{transport === 'httpStream' ? 'HTTP服务' : 'SSE服务'}端口:
      </Text>
      <Box marginTop={1}>
        <Text color="gray">端口号: </Text>
        <Text color={validationError ? "red" : "white"} backgroundColor={validationError ? "red" : "blue"}>
          {input}
          <Text color="white">█</Text>
        </Text>
      </Box>
      
      {validationError && (
        <Box marginTop={1}>
          <Text color="red">❌ {validationError}</Text>
        </Box>
      )}
      
      {validationWarning && !validationError && (
        <Box marginTop={1}>
          <Text color="yellow">⚠️  {validationWarning}</Text>
        </Box>
      )}
      
      {suggestion && (
        <Box marginTop={1}>
          <Text color="cyan">💡 {suggestion}</Text>
        </Box>
      )}
      
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          请输入有效端口号 (1-65535)，按 Enter 确认
        </Text>
      </Box>
    </Box>
  );
};

export default PortInput;
