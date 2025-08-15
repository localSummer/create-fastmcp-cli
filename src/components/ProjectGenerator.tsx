import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { generateProjectWithProgress, GenerationStep, GenerationProgress } from '../utils/projectGenerator.js';
import { systemChecker } from '../utils/systemChecker.js';
import { TransportType } from '../types/index.js';
import ProgressIndicator, { ProgressStep } from './ProgressIndicator.js';

/**
 * ProjectGenerator 组件的属性接口
 * @interface ProjectGeneratorProps
 */
interface ProjectGeneratorProps {
  /** 项目名称 */
  projectName: string;
  /** 传输类型 */
  transport: TransportType;
  /** 端口号 */
  port: string;
  /** 是否初始化 git 仓库 */
  initGit: boolean;
  /** 项目生成完成时的回调函数 */
  onComplete: () => void;
}

/**
 * ProjectGenerator 组件（改进版）
 * 负责执行项目生成的核心逻辑，包括系统检查、进度显示和错误处理
 * @param {ProjectGeneratorProps} props - 组件属性
 * @returns {ReactElement} React 元素
 */
const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({
  projectName,
  transport,
  port,
  initGit,
  onComplete,
}) => {
  /** 当前状态文本 */
  const [status, setStatus] = useState('准备中...');
  /** 项目是否生成完成 */
  const [isComplete, setIsComplete] = useState(false);
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null);
  /** 系统检查是否完成 */
  const [systemCheckComplete, setSystemCheckComplete] = useState(false);
  /** 进度步骤 */
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  /** 当前步骤索引 */
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  /**
   * 初始化进度步骤
   */
  const initializeProgressSteps = () => {
    const steps: ProgressStep[] = [
      { id: 'system-check', label: '检查系统依赖', completed: false, inProgress: false },
      { id: 'validation', label: '验证项目配置', completed: false, inProgress: false },
      { id: 'copy-template', label: '拷贝模板文件', completed: false, inProgress: false },
      { id: 'process-files', label: '处理模板变量', completed: false, inProgress: false },
      { id: 'install-deps', label: '安装项目依赖', completed: false, inProgress: false },
    ];
    
    if (initGit) {
      steps.push({ id: 'init-git', label: '初始化 Git 仓库', completed: false, inProgress: false });
    }
    
    setProgressSteps(steps);
  };

  /**
   * 更新进度步骤状态
   */
  const updateProgressStep = (stepId: string, updates: Partial<ProgressStep>) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  /**
   * 处理生成进度回调
   */
  const handleGenerationProgress = (progress: GenerationProgress) => {
    setStatus(progress.message);
    
    const stepMapping: Record<GenerationStep, string> = {
      [GenerationStep.VALIDATION]: 'validation',
      [GenerationStep.COPY_TEMPLATE]: 'copy-template',
      [GenerationStep.PROCESS_FILES]: 'process-files',
      [GenerationStep.INSTALL_DEPENDENCIES]: 'install-deps',
      [GenerationStep.INIT_GIT]: 'init-git',
      [GenerationStep.CLEANUP]: 'cleanup',
    };
    
    const stepId = stepMapping[progress.step];
    if (stepId) {
      updateProgressStep(stepId, {
        completed: progress.completed,
        inProgress: !progress.completed && !progress.error,
        error: progress.error,
      });
      
      if (progress.completed) {
        const stepIndex = progressSteps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex + 1);
        }
      }
    }
  };

  /**
   * useEffect 钩子
   * 在组件挂载时执行系统检查和项目生成
   */
  useEffect(() => {
    initializeProgressSteps();
    
    const performSystemCheckAndGenerate = async () => {
      try {
        // 步骤 1: 系统检查
        updateProgressStep('system-check', { inProgress: true });
        setStatus('正在检查系统依赖...');
        
        const systemCheckResults = await systemChecker.performSystemCheck(initGit);
        
        if (!systemChecker.hasAllRequiredDependencies(systemCheckResults)) {
          throw new Error('系统检查失败，请安装缺失的依赖后重试。');
        }
        
        updateProgressStep('system-check', { completed: true, inProgress: false });
        setSystemCheckComplete(true);
        setCurrentStepIndex(1);
        
        // 稍微延迟再开始生成，让用户看到检查结果
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // 步骤 2-N: 项目生成
        setStatus('开始生成项目...');
        
        await generateProjectWithProgress({
          data: {
            projectName,
            transport,
            port,
            description: `基于 fastmcp 的 ${transport} MCP 服务器项目`,
            initGit,
          },
          onProgress: handleGenerationProgress,
        });

        setStatus('项目创建完成! 🎉');
        setIsComplete(true);

        setTimeout(() => {
          onComplete();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : '创建项目时发生未知错误');
      }
    };

    performSystemCheckAndGenerate();
  }, [projectName, transport, port, initGit, onComplete]);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ 创建项目失败:</Text>
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">📦 正在创建项目: {projectName}</Text>
      <Box marginTop={1}>
        <Text color="gray">传输类型: </Text>
        <Text color="green">{transport}</Text>
      </Box>
      {transport !== 'stdio' && (
        <Box>
          <Text color="gray">端口: </Text>
          <Text color="green">{port}</Text>
        </Box>
      )}
      
      <Box marginTop={2}>
        {progressSteps.length > 0 && (
          <ProgressIndicator
            steps={progressSteps}
            currentStep={currentStepIndex}
            showDetails={true}
          />
        )}
      </Box>
      
      <Box marginTop={1} alignItems="center">
        {!isComplete && <Text color="cyan">⏳ </Text>}
        <Text color={isComplete ? 'green' : 'yellow'}>{status}</Text>
      </Box>
      
      {isComplete && (
        <Box marginTop={2} flexDirection="column">
          <Text color="green">✅ 项目已成功创建在 ./{projectName} 目录中</Text>
          <Box marginTop={1}>
            <Text color="gray">运行以下命令开始开发:</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="white" backgroundColor="gray">
              cd {projectName} && npm run dev
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectGenerator;
