/**
 * AI 生成服务 - 整合对抗偏差引擎、上下文构建和 Claude API
 */
import { claudeAPI } from '../api/claudeAPI';
import { contextBuilder, ContextBuilderParams } from './contextBuilder';
import { antiBiasEngine, BlindspotType } from './antiBiasEngine';
import { databaseService } from '../database/databaseService';

export interface GenerateNewChapterParams {
  projectId: number;
  chapterNumber?: number;
  title?: string;
  outline: string;
  previousChapters?: number[];  // 前几章的ID，用于注入上下文
  targetBlindspots?: BlindspotType[];  // 要对抗的盲区
}

export interface ContinueWritingParams {
  projectId: number;
  chapterId: number;
  currentContent: string;
  continuationHint?: string;
}

export interface GenerationResult {
  content: string;
  tokensUsed: number;
  antiBiasInstructions: string[];
}

class AIGenerationService {
  /**
   * 生成新章节
   *
   * 核心流程：
   * 1. 构建上下文（角色、伏笔、冲突）
   * 2. 生成对抗偏差指令
   * 3. 构建完整 Prompt
   * 4. 调用 Claude API
   * 5. 保存生成记录
   */
  async generateNewChapter(params: GenerateNewChapterParams): Promise<GenerationResult> {
    console.log(`[Generation] Generating chapter ${params.chapterNumber}...`);

    // 1. 构建上下文
    const context = await contextBuilder.build({
      projectId: params.projectId,
      includeChapters: params.previousChapters,
      includeCharacters: true,
      includeForeshadowing: true,
      includeConflicts: true,
    });

    // 2. 生成对抗偏差指令
    const targetBlindspots = params.targetBlindspots || [
      'personality_erosion',
      'conflict_reduction',
      'cultural_context',
    ];
    const antiBiasInstructions = await antiBiasEngine.generateInstructions({
      projectId: params.projectId,
      targetBlindspots,
      contextData: {
        characters: context.characters,
        conflicts: context.activeConflicts,
        foreshadowing: context.activeForeshadowing,
        project: context.project,
      },
    });

    // 3. 构建完整 Prompt
    const prompt = this.buildChapterPrompt({
      chapterNumber: params.chapterNumber,
      title: params.title,
      outline: params.outline,
      context,
      antiBiasInstructions,
    });

    // 4. 调用 Claude API
    const response = await claudeAPI.generate({
      prompt,
      maxTokens: 8000,
      temperature: 0.7,
      systemPrompt: '你是一个专业的小说作家。你的任务是根据设定和大纲生成高质量的小说章节内容。',
    });

    // 5. 保存生成记录
    await this.saveGenerationHistory({
      projectId: params.projectId,
      chapterId: null,
      generationType: 'new_chapter',
      prompt,
      contextInjected: JSON.stringify({
        characters: context.characters.map(c => c.name),
        foreshadowing: context.activeForeshadowing.map(f => f.title),
        conflicts: context.activeConflicts.map(c => c.title),
      }),
      antiBiasInstructions: JSON.stringify(antiBiasInstructions),
      generatedContent: response.content,
      tokensUsed: response.tokensUsed,
    });

    console.log(`[Generation] Chapter ${params.chapterNumber} generated successfully`);

    return {
      content: response.content,
      tokensUsed: response.tokensUsed,
      antiBiasInstructions,
    };
  }

  /**
   * 续写现有内容
   */
  async continueWriting(params: ContinueWritingParams): Promise<GenerationResult> {
    console.log(`[Generation] Continuing chapter ${params.chapterId}...`);

    // 获取章节信息
    const db = databaseService.getDatabase();
    const chapterResult = await db.executeSql(
      'SELECT * FROM chapters WHERE id = ?',
      [params.chapterId]
    );

    if (chapterResult[0].rows.length === 0) {
      throw new Error(`Chapter ${params.chapterId} not found`);
    }

    const chapter = chapterResult[0].rows.item(0);

    // 构建上下文
    const context = await contextBuilder.build({
      projectId: params.projectId,
      includeCharacters: true,
      includeForeshadowing: true,
      includeConflicts: true,
    });

    // 生成对抗偏差指令（续写特别关注语气保持）
    const antiBiasInstructions = await antiBiasEngine.generateInstructions({
      projectId: params.projectId,
      targetBlindspots: [
        'personality_erosion',
        'micro_rhythm_loss',
        'negative_emotion_dampening',
        'cultural_context',
      ],
      contextData: {
        characters: context.characters,
        conflicts: context.activeConflicts,
        project: context.project,
      },
    });

    // 构建续写 Prompt
    const prompt = this.buildContinuationPrompt({
      currentContent: params.currentContent,
      hint: params.continuationHint,
      context,
      antiBiasInstructions,
    });

    // 调用 API（续写时降低温度以保持一致性）
    const response = await claudeAPI.generate({
      prompt,
      maxTokens: 6000,
      temperature: 0.6,
      systemPrompt: '你是一个专业的小说作家。你的任务是续写小说内容，保持与前文完全一致的风格和角色设定。',
    });

    // 保存生成记录
    await this.saveGenerationHistory({
      projectId: params.projectId,
      chapterId: params.chapterId,
      generationType: 'continue_writing',
      prompt,
      contextInjected: JSON.stringify({
        characters: context.characters.map(c => c.name),
      }),
      antiBiasInstructions: JSON.stringify(antiBiasInstructions),
      generatedContent: response.content,
      tokensUsed: response.tokensUsed,
    });

    return {
      content: response.content,
      tokensUsed: response.tokensUsed,
      antiBiasInstructions,
    };
  }

  /**
   * 构建章节生成 Prompt
   */
  private buildChapterPrompt(params: {
    chapterNumber?: number;
    title?: string;
    outline: string;
    context: any;
    antiBiasInstructions: string[];
  }): string {
    const { chapterNumber, title, outline, context, antiBiasInstructions } = params;

    const chapterTitle = title || '新章节';
    const chapterNum = chapterNumber || 0;

    return `
# ${chapterNum > 0 ? `第 ${chapterNum} 章：` : ''}${chapterTitle}

## 本章大纲
${outline}

## 世界观设定
${context.worldSetting || '（无特别设定）'}

## 核心角色设定
${context.characters.map((char: any) => `
### ${char.name}（${this.getRoleTypeLabel(char.roleType)}）
- **核心性格**：${char.personalityTraits.join('、')}
- **深层动机**：${char.deepMotivation}
- **绝不会做**：${char.thingsNeverDo.join('；')}
${char.speechPattern ? `- **说话风格**：${this.describeSpeechPattern(char.speechPattern)}` : ''}
${char.languageStyle ? `- **语言特点**：${char.languageStyle}` : ''}
`).join('\n')}

${context.activeForeshadowing.length > 0 ? `
## 活跃伏笔（注意推进或回收）
${context.activeForeshadowing.map((f: any) => `
- **${f.title}**（计划第 ${f.plannedRevealChapter} 章回收）
  ${f.description || ''}
`).join('\n')}
` : ''}

${context.activeConflicts.length > 0 ? `
## 当前冲突（严格维持强度）
${context.activeConflicts.map((c: any) => `
- **${c.title}**（强度：${c.currentIntensity}/10）
  - 对立：${c.sideA} vs ${c.sideB}
  - 维持机制：${c.maintenanceMechanism}
  - 无法和解原因：${c.cantReconcileReasons.join('；')}
`).join('\n')}
` : ''}

---

## 🔑 对抗偏差指令（务必严格遵守）

${antiBiasInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n\n')}

---

## 生成要求

1. **字数**：3000-5000 字
2. **风格**：${context.culturalContext}文化语境，符合项目题材（${context.project.genre || '通用'}）
3. **一致性**：严格遵守角色设定，不要让角色"成长"或"理性化"
4. **冲突**：保持设定的冲突强度，不要软化
5. **伏笔**：如果本章涉及伏笔，要适当推进
6. **情感**：保持真实的情感强度，包括负面情绪

请开始生成第 ${chapterNumber} 章的正文内容：
`;
  }

  /**
   * 构建续写 Prompt
   */
  private buildContinuationPrompt(params: {
    currentContent: string;
    hint?: string;
    context: any;
    antiBiasInstructions: string[];
  }): string {
    return `
# 续写任务

## 已有内容
${params.currentContent}

${params.hint ? `\n## 续写方向提示\n${params.hint}\n` : ''}

## 核心角色设定
${params.context.characters.map((char: any) => `
### ${char.name}
- 核心性格：${char.personalityTraits.join('、')}
- 深层动机：${char.deepMotivation}
- 绝不会做：${char.thingsNeverDo.join('；')}
${char.speechPattern ? `- 说话风格：${this.describeSpeechPattern(char.speechPattern)}` : ''}
`).join('\n')}

---

## 🔑 对抗偏差指令（务必严格遵守）

${params.antiBiasInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n\n')}

---

## 续写要求

1. **风格一致**：保持与前文完全一致的叙事风格、语言风格
2. **角色一致**：角色的说话方式、行为逻辑必须与设定完全吻合
3. **情感一致**：保持前文的情绪氛围和强度
4. **自然衔接**：续写部分要与前文自然衔接，不要出现断层
5. **字数**：约 2000-3000 字

请开始续写：
`;
  }

  /**
   * 获取角色类型标签
   */
  private getRoleTypeLabel(roleType: string): string {
    const map: Record<string, string> = {
      protagonist: '主角',
      major: '主要角色',
      supporting: '配角',
      minor: '次要角色',
      antagonist: '反派',
    };
    return map[roleType] || roleType;
  }

  /**
   * 描述语言风格
   */
  private describeSpeechPattern(pattern: any): string {
    const parts: string[] = [];

    if (pattern.rhythm) {
      parts.push(`节奏：${pattern.rhythm}`);
    }
    if (pattern.sentenceStructure) {
      parts.push(`句式：${pattern.sentenceStructure}`);
    }
    if (pattern.toneWords && pattern.toneWords.length > 0) {
      parts.push(`语气词：${pattern.toneWords.join('、')}`);
    }

    return parts.join('；');
  }

  /**
   * 保存生成历史
   */
  private async saveGenerationHistory(data: {
    projectId: number;
    chapterId: number | null;
    generationType: string;
    prompt: string;
    contextInjected: string;
    antiBiasInstructions: string;
    generatedContent: string;
    tokensUsed: number;
  }): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql(
      `INSERT INTO ai_generations (
        project_id, chapter_id, generation_type, prompt, context_injected,
        anti_bias_instructions, generated_content, tokens_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.projectId,
        data.chapterId,
        data.generationType,
        data.prompt,
        data.contextInjected,
        data.antiBiasInstructions,
        data.generatedContent,
        data.tokensUsed,
      ]
    );
  }
}

// 导出单例
export const aiGenerationService = new AIGenerationService();
