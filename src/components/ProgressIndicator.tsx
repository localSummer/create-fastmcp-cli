import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

/**
 * 进度步骤接口
 */
export interface ProgressStep {
  /** 步骤标识 */
  id: string;
  /** 步骤描述 */
  label: string;
  /** 是否完成 */
  completed: boolean;
  /** 是否正在进行 */
  inProgress: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 进度指示器属性接口
 */
export interface ProgressIndicatorProps {
  /** 进度步骤列表 */
  steps: ProgressStep[];
  /** 当前步骤索引 */
  currentStep: number;
  /** 是否显示详细信息 */
  showDetails?: boolean;
}

/**
 * 加载动画字符
 */
const LOADING_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * 进度指示器组件
 * 显示项目生成过程的进度信息
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  showDetails = true,
}) => {
  const [loadingFrame, setLoadingFrame] = useState(0);

  // 更新加载动画
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  /**
   * 获取步骤状态图标
   * @param step - 步骤信息
   * @param index - 步骤索引
   * @returns 状态图标字符串
   */
  const getStepIcon = (step: ProgressStep, index: number): string => {
    if (step.error) {
      return '❌';
    }
    if (step.completed) {
      return '✅';
    }
    if (step.inProgress || index === currentStep) {
      return LOADING_FRAMES[loadingFrame];
    }
    return '⭕';
  };

  /**
   * 获取步骤状态颜色
   * @param step - 步骤信息
   * @param index - 步骤索引
   * @returns 颜色函数
   */
  const getStepColor = (step: ProgressStep, index: number) => {
    if (step.error) {
      return chalk.red;
    }
    if (step.completed) {
      return chalk.green;
    }
    if (step.inProgress || index === currentStep) {
      return chalk.blue;
    }
    return chalk.gray;
  };

  return (
    <Box flexDirection="column">
      {showDetails && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="blue" bold>
            📋 项目生成进度
          </Text>
          <Box marginTop={1} />
        </Box>
      )}

      {steps.map((step, index) => {
        const icon = getStepIcon(step, index);
        const colorFn = getStepColor(step, index);

        return (
          <Box key={step.id} flexDirection="column" marginBottom={0}>
            <Box>
              <Text>{icon} </Text>
              <Text
                color={colorFn.name.replace('chalk', '')}
                bold={step.inProgress || index === currentStep}
              >
                {step.label}
              </Text>
            </Box>

            {step.error && (
              <Box marginLeft={2}>
                <Text color="red">错误: {step.error}</Text>
              </Box>
            )}
          </Box>
        );
      })}

      {showDetails && (
        <Box marginTop={1}>
          <Text color="gray">
            进度: {steps.filter((s) => s.completed).length}/{steps.length}{' '}
            步骤完成
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ProgressIndicator;
