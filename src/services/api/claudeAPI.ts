/**
 * Claude API 封装
 */
import axios, { AxiosInstance } from 'axios';

export interface ClaudeGenerateParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ClaudeGenerateResponse {
  content: string;
  tokensUsed: number;
  stopReason: string;
}

export interface ClaudeAPIConfig {
  apiKey: string;
  baseURL?: string;
}

class ClaudeAPIService {
  private axios: AxiosInstance | null = null;
  private apiKey: string | null = null;

  /**
   * 配置 API
   */
  configure(config: ClaudeAPIConfig): void {
    this.apiKey = config.apiKey;
    this.axios = axios.create({
      baseURL: config.baseURL || 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 120000, // 2 minutes
    });

    console.log('[ClaudeAPI] Configured');
  }

  /**
   * 生成内容
   */
  async generate(params: ClaudeGenerateParams): Promise<ClaudeGenerateResponse> {
    if (!this.axios || !this.apiKey) {
      throw new Error('Claude API not configured. Call configure() first with your API key.');
    }

    try {
      console.log('[ClaudeAPI] Generating content...');

      const response = await this.axios.post('/messages', {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: params.maxTokens || 8000,
        temperature: params.temperature !== undefined ? params.temperature : 0.7,
        system: params.systemPrompt,
        messages: [
          {
            role: 'user',
            content: params.prompt,
          },
        ],
      });

      const content = response.data.content[0].text;
      const tokensUsed = response.data.usage.input_tokens + response.data.usage.output_tokens;

      console.log(`[ClaudeAPI] Generated ${tokensUsed} tokens`);

      return {
        content,
        tokensUsed,
        stopReason: response.data.stop_reason,
      };
    } catch (error: any) {
      console.error('[ClaudeAPI] Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('无效的 API Key，请检查配置');
      } else if (error.response?.status === 429) {
        throw new Error('API 调用频率超限，请稍后再试');
      } else if (error.response?.status === 529) {
        throw new Error('API 服务暂时过载，请稍后再试');
      }

      throw new Error(`API 调用失败: ${error.message}`);
    }
  }

  /**
   * 分析内容（用于一致性检查）
   */
  async analyze(params: ClaudeGenerateParams): Promise<ClaudeGenerateResponse> {
    // 分析时使用较低温度以获得更稳定的结果
    return this.generate({
      ...params,
      temperature: 0.3,
    });
  }

  /**
   * 检查 API 是否已配置
   */
  isConfigured(): boolean {
    return this.axios !== null && this.apiKey !== null;
  }
}

// 导出单例
export const claudeAPI = new ClaudeAPIService();
