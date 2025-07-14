import axios from 'axios';
import { exec } from 'child_process';

// 替换为实际的 API 主机地址
const host = 'https://api.example.com';

// 定义接口类型
interface GetPromptParams {
  promptId: string;
  context?: Record<string, any>;
}

interface PromptResponse {
  [key: string]: any;
}

/**
 * 根据提示 ID 获取对应提示词
 * @param {Object} params - 参数
 * @param {string} params.promptId - 提示 ID
 * @param {Object} params.context - 上下文
 * @returns {Promise<Object>} - 任务提示
 */
export const getPromptByIdAjax = async ({
  promptId,
  context = {},
}: GetPromptParams): Promise<PromptResponse> => {
  const response = await axios.post(`${host}/api/prompt/getFeaipubPrompt`, {
    promptId,
    context,
  });
  return response.data;
};

// 定义批量提示词类型
type PromptId = string | { promptId: string; context: Record<string, any> };

interface BatchPromptResponse {
  promptId: string;
  prompt: string;
}

/**
 * 批量获取提示词
 * @param {Array} promptIds - 提示词 ID 数组
 * @returns {Promise<Object>} - 批量获取的提示词
 * @example 参数示例：
 * {
 *   "promptIds": ["promptId1", "promptId2", {"promptId": "promptId3", "context": {"key": "value"}}]
 * }
 * @description 该接口用于批量获取提示词，支持传入多个提示词ID，支持传入上下文
 * @returns {Promise<{promptId: string, prompt: string}[]>} - 批量获取的提示词，每个提示词包含 promptId 和 prompt 字段
 */
export const getBatchPromptByIdAjax = async (
  promptIds: PromptId[]
): Promise<BatchPromptResponse[]> => {
  const response = await axios.post(
    `${host}/api/prompt/getBatchFeaipubPrompt`,
    { promptIds }
  );
  return response.data;
};

/**
 * 使用 curl 下载图片到指定路径
 * @param {string} imageUrl - 图片的 URL
 * @param {string} destinationPath - 下载目标路径
 * @returns {Promise<void>} - 下载成功时 resolve，失败时 reject
 */
export const downloadImageWithCurl = async (
  imageUrl: string,
  destinationPath: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const command = `curl -s -L "${imageUrl}" -o "${destinationPath}"`;
    exec(command, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`下载图片失败: ${error.message}`));
        return;
      }
      if (stderr) {
        reject(new Error(`下载图片时发生错误: ${stderr}`));
        return;
      }
      resolve();
    });
  });
};
