import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { inputValidator } from '../utils/inputValidator.js';

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
 * 用于接收用户输入的项目名称，支持实时验证和格式建议
 * @param {ProjectNameInputProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const ProjectNameInput: React.FC<ProjectNameInputProps> = ({
  initialValue,
  onSubmit,
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
      const result = inputValidator.validateProjectName(newInput.trim());
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
   * 支持回车提交、退格删除和字符输入
   */
  useInput((inputChar, key) => {
    if (key.return) {
      const trimmedInput = input.trim();
      if (trimmedInput) {
        const result = inputValidator.validateProjectName(trimmedInput);
        if (result.isValid) {
          onSubmit(trimmedInput);
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

    // 允许更多字符（包括点号）
    if (inputChar && /^[a-zA-Z0-9\-_.\s]$/.test(inputChar)) {
      const newInput = input + inputChar;
      validateAndSetInput(newInput);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">📁 请输入项目名称:</Text>
      <Box marginTop={1}>
        <Text color="gray">项目名称: </Text>
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
          按 Enter 确认
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectNameInput;
