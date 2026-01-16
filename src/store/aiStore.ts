/**
 * AI 服务状态管理
 */
import {create} from 'zustand';
import {claudeAPI} from '@/services/api/claudeAPI';
import {aiGenerationService, GenerateNewChapterParams} from '@/services/ai/generationService';

interface AIStore {
  apiConfigured: boolean;
  generating: boolean;
  error: string | null;
  lastGeneration: {
    content: string;
    tokensUsed: number;
    timestamp: Date;
  } | null;

  // 配置
  configureAPI: (apiKey: string) => void;

  // 生成
  generateChapter: (params: GenerateNewChapterParams) => Promise<string>;
  continueWriting: (params: any) => Promise<string>;

  // 状态
  clearError: () => void;
  clearLastGeneration: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  apiConfigured: false,
  generating: false,
  error: null,
  lastGeneration: null,

  configureAPI: (apiKey: string) => {
    try {
      claudeAPI.configure({apiKey});
      set({apiConfigured: true, error: null});
    } catch (error: any) {
      set({error: error.message, apiConfigured: false});
    }
  },

  generateChapter: async (params: GenerateNewChapterParams) => {
    if (!get().apiConfigured) {
      throw new Error('Claude API 未配置，请先在设置中配置 API Key');
    }

    set({generating: true, error: null});
    try {
      const result = await aiGenerationService.generateNewChapter(params);

      set({
        generating: false,
        lastGeneration: {
          content: result.content,
          tokensUsed: result.tokensUsed,
          timestamp: new Date(),
        },
      });

      return result.content;
    } catch (error: any) {
      set({error: error.message, generating: false});
      throw error;
    }
  },

  continueWriting: async (params: any) => {
    if (!get().apiConfigured) {
      throw new Error('Claude API 未配置，请先在设置中配置 API Key');
    }

    set({generating: true, error: null});
    try {
      const result = await aiGenerationService.continueWriting(params);

      set({
        generating: false,
        lastGeneration: {
          content: result.content,
          tokensUsed: result.tokensUsed,
          timestamp: new Date(),
        },
      });

      return result.content;
    } catch (error: any) {
      set({error: error.message, generating: false});
      throw error;
    }
  },

  clearError: () => {
    set({error: null});
  },

  clearLastGeneration: () => {
    set({lastGeneration: null});
  },
}));
