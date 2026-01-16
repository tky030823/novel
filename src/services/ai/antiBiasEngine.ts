/**
 * 对抗偏差引擎 - 核心价值所在
 *
 * 对抗 AI 的默认偏差：
 * - 人格侵蚀（角色变通用）
 * - 冲突降级（仇人变朋友）
 * - 文化美国化（西化）
 * - 负面情绪钝化（理性化）
 * - 伏笔遗忘
 */

import { databaseService } from '../database/databaseService';
import { Character } from '@/types/models/Character';
import { Conflict } from '@/types/models/Conflict';
import { Foreshadowing } from '@/types/models/Foreshadowing';
import { Project } from '@/types/models/Project';

export type BlindspotType =
  // 长篇小说 5 大盲区
  | 'personality_erosion'         // 人格侵蚀
  | 'foreshadowing_forgotten'     // 伏笔遗忘
  | 'conflict_reduction'          // 冲突降级
  | 'background_character_quantum' // 背景角色量子化
  | 'power_inflation'             // 战力膨胀
  // 续写 5 大盲区
  | 'micro_rhythm_loss'           // 微节奏语气丢失
  | 'negative_emotion_dampening'  // 负面情绪钝化
  | 'timeline_distortion'         // 时间线记忆扭曲
  | 'motivation_substitution'     // 潜在动机替换
  | 'cultural_context';           // 文化美国化

export interface AntiBiasInstructionsParams {
  projectId: number;
  targetBlindspots: BlindspotType[];
  contextData?: {
    characters?: Character[];
    conflicts?: Conflict[];
    foreshadowing?: Foreshadowing[];
    project?: Project;
  };
}

class AntiBiasEngine {
  /**
   * 生成对抗偏差指令
   *
   * 这是核心方法：根据项目数据和目标盲区，动态生成对抗指令
   */
  async generateInstructions(params: AntiBiasInstructionsParams): Promise<string[]> {
    const instructions: string[] = [];

    for (const blindspot of params.targetBlindspots) {
      const instruction = await this.generateInstructionForBlindspot(
        blindspot,
        params.projectId,
        params.contextData
      );

      if (instruction) {
        instructions.push(instruction);
      }
    }

    return instructions;
  }

  /**
   * 为特定盲区生成指令
   */
  private async generateInstructionForBlindspot(
    blindspot: BlindspotType,
    projectId: number,
    contextData?: AntiBiasInstructionsParams['contextData']
  ): Promise<string | null> {
    switch (blindspot) {
      case 'personality_erosion':
        return this.generateCharacterDriftInstructions(projectId, contextData?.characters);

      case 'conflict_reduction':
        return this.generateConflictSofteningInstructions(projectId, contextData?.conflicts);

      case 'cultural_context':
        return this.generateCulturalProtectionInstruction(projectId, contextData?.project);

      case 'negative_emotion_dampening':
        return this.generateNegativeEmotionInstruction();

      case 'foreshadowing_forgotten':
        return this.generateForeshadowingInstruction(projectId, contextData?.foreshadowing);

      case 'background_character_quantum':
        return '背景角色不是"量子态存在"，他们有连续的日常生活。提及时需符合时间线。';

      case 'power_inflation':
        return '严格遵守已建立的战力体系。新角色/新招式的威力不能超过当前章节设定的上限。';

      case 'micro_rhythm_loss':
        return '保持原作语言风格：句式长短、停顿节奏、口头禅、说话习惯。不要让所有角色都说标准书面语。';

      case 'timeline_distortion':
        return '严格遵守时间线。已发生事件的顺序、间隔、因果关系不可改变。';

      case 'motivation_substitution':
        return '角色行为必须基于其深层动机，不要用"理性选择"替换角色真实的情感驱动。';

      default:
        return null;
    }
  }

  /**
   * 生成防人格侵蚀指令
   *
   * 基于角色的"绝不会做"字段
   */
  private async generateCharacterDriftInstructions(
    projectId: number,
    characters?: Character[]
  ): Promise<string> {
    if (!characters || characters.length === 0) {
      // 如果没有提供角色，从数据库读取
      characters = await this.getProjectCharacters(projectId);
    }

    if (characters.length === 0) {
      return '严格遵守角色设定，不要让角色变得"更理性"或"更成熟"。';
    }

    const characterInstructions = characters
      .map(char => {
        const traits = char.personalityTraits.join('、');
        const neverDo = char.thingsNeverDo.join('；');

        return (
          `【${char.name}】核心特质：${traits}。` +
          `绝不会：${neverDo}。` +
          `深层动机：${char.deepMotivation}。`
        );
      })
      .join('\n');

    return (
      `🔑 角色一致性要求（严格遵守）：\n` +
      `${characterInstructions}\n` +
      `不要让任何角色"成长"成通用好人、理性人、成熟人。保持他们的独特性和缺陷。`
    );
  }

  /**
   * 生成防冲突降级指令
   *
   * 基于冲突的"维持机制"和"无法和解原因"
   */
  private async generateConflictSofteningInstructions(
    projectId: number,
    conflicts?: Conflict[]
  ): Promise<string> {
    if (!conflicts || conflicts.length === 0) {
      conflicts = await this.getActiveConflicts(projectId);
    }

    if (conflicts.length === 0) {
      return '';
    }

    const conflictInstructions = conflicts
      .map(conflict => {
        const reasons = conflict.cantReconcileReasons.join('；');

        return (
          `【${conflict.title}】强度：${conflict.currentIntensity}/10。` +
          `无法和解：${reasons}。` +
          `维持机制：${conflict.maintenanceMechanism}。`
        );
      })
      .join('\n');

    return (
      `🔑 冲突维持要求（严格遵守）：\n` +
      `${conflictInstructions}\n` +
      `不要让对立双方"相互理解"、"握手言和"、"发现对方也不容易"。冲突必须维持设定的强度。`
    );
  }

  /**
   * 生成文化语境保护指令
   */
  private async generateCulturalProtectionInstruction(
    projectId: number,
    project?: Project
  ): Promise<string> {
    if (!project) {
      project = await this.getProject(projectId);
    }

    const culturalMap: Record<Project['culturalContext'], string> = {
      chinese: (
        '保持中式文化语境：\n' +
        '- 人物关系：含蓄、注重面子、重视人情世故\n' +
        '- 表达方式：委婉、隐晦，避免美式直白\n' +
        '- 价值观：集体、等级、关系网络\n' +
        '- 禁止出现：契约精神、骑士精神、个人主义、直接对抗权威等西式概念'
      ),
      japanese: (
        '保持日式文化语境：\n' +
        '- 上下级关系严格，集体主义\n' +
        '- 表达极度含蓄，注重氛围（空気を読む）\n' +
        '- 避免直接冲突，重视和谐\n' +
        '- 禁止美式直白和西式个人主义'
      ),
      classical: (
        '保持古典文学语境：\n' +
        '- 语言：文言、半文言，避免现代白话\n' +
        '- 概念：传统伦理、等级制度\n' +
        '- 禁止：现代化概念、西式思维、白话俚语'
      ),
      western: (
        '保持西式文化语境：\n' +
        '- 表达直白、强调个人\n' +
        '- 契约精神、法律意识\n' +
        '- 但避免刻板印象和过度理想化'
      ),
    };

    return `🔑 ${culturalMap[project.culturalContext]}`;
  }

  /**
   * 生成负面情绪保护指令
   */
  private generateNegativeEmotionInstruction(): string {
    return (
      `🔑 情绪真实性要求：\n` +
      `- 保持负面情绪的原始强度：愤怒、绝望、憎恨、恐惧、崩溃\n` +
      `- 不要自动软化、理性化、成熟化这些情绪\n` +
      `- 角色可以失控、极端、非理性——这是真实的人性\n` +
      `- 避免"冷静下来思考"、"理性分析"、"成长后理解"等模式化处理`
    );
  }

  /**
   * 生成伏笔记忆指令
   */
  private async generateForeshadowingInstruction(
    projectId: number,
    foreshadowing?: Foreshadowing[]
  ): Promise<string> {
    if (!foreshadowing || foreshadowing.length === 0) {
      foreshadowing = await this.getActiveForeshadowing(projectId);
    }

    if (foreshadowing.length === 0) {
      return '';
    }

    const foreshadowingList = foreshadowing
      .map(f => `- ${f.title}（计划第${f.plannedRevealChapter}章回收）：${f.description}`)
      .join('\n');

    return (
      `🔑 伏笔追踪（不要遗忘）：\n` +
      `${foreshadowingList}\n` +
      `如果本章涉及这些伏笔，要推进或回收。如果不涉及，至少保持前后一致，不要矛盾。`
    );
  }

  /**
   * 从数据库获取项目角色
   */
  private async getProjectCharacters(projectId: number): Promise<Character[]> {
    const db = databaseService.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM characters WHERE project_id = ?',
      [projectId]
    );

    return this.parseCharactersFromDb(result[0]);
  }

  /**
   * 从数据库获取活跃冲突
   */
  private async getActiveConflicts(projectId: number): Promise<Conflict[]> {
    const db = databaseService.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM conflicts WHERE project_id = ? AND status = ?',
      [projectId, 'active']
    );

    return this.parseConflictsFromDb(result[0]);
  }

  /**
   * 从数据库获取活跃伏笔
   */
  private async getActiveForeshadowing(projectId: number): Promise<Foreshadowing[]> {
    const db = databaseService.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM foreshadowing WHERE project_id = ? AND status IN (?, ?)',
      [projectId, 'buried', 'progressing']
    );

    return this.parseForeshadowingFromDb(result[0]);
  }

  /**
   * 从数据库获取项目
   */
  private async getProject(projectId: number): Promise<Project> {
    const db = databaseService.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    if (result[0].rows.length === 0) {
      throw new Error(`Project ${projectId} not found`);
    }

    return this.parseProjectFromDb(result[0].rows.item(0));
  }

  /**
   * 解析数据库行为角色对象
   */
  private parseCharactersFromDb(resultSet: any): Character[] {
    const characters: Character[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      const row = resultSet.rows.item(i);
      characters.push({
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        aliases: row.aliases ? JSON.parse(row.aliases) : undefined,
        roleType: row.role_type,
        appearance: row.appearance,
        background: row.background,
        personalityTraits: JSON.parse(row.personality_traits),
        coreValues: row.core_values,
        thingsNeverDo: JSON.parse(row.things_never_do),
        surfaceBehavior: row.surface_behavior,
        deepMotivation: row.deep_motivation,
        psychologicalTrauma: row.psychological_trauma,
        speechPattern: row.speech_pattern ? JSON.parse(row.speech_pattern) : undefined,
        catchphrases: row.catchphrases ? JSON.parse(row.catchphrases) : undefined,
        languageStyle: row.language_style,
        firstAppearanceChapter: row.first_appearance_chapter,
        lastAppearanceChapter: row.last_appearance_chapter,
        appearanceChapters: row.appearance_chapters ? JSON.parse(row.appearance_chapters) : undefined,
        evolutionTimeline: row.evolution_timeline ? JSON.parse(row.evolution_timeline) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return characters;
  }

  /**
   * 解析冲突
   */
  private parseConflictsFromDb(resultSet: any): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      const row = resultSet.rows.item(i);
      conflicts.push({
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        sideA: row.side_a,
        sideB: row.side_b,
        conflictType: row.conflict_type,
        currentIntensity: row.current_intensity,
        maintenanceMechanism: row.maintenance_mechanism,
        cantReconcileReasons: JSON.parse(row.cant_reconcile_reasons),
        plannedEscalationChapters: row.planned_escalation_chapters
          ? JSON.parse(row.planned_escalation_chapters)
          : undefined,
        plannedResolutionChapter: row.planned_resolution_chapter,
        resolutionMethod: row.resolution_method,
        status: row.status,
        startChapter: row.start_chapter,
        currentChapter: row.current_chapter,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return conflicts;
  }

  /**
   * 解析伏笔
   */
  private parseForeshadowingFromDb(resultSet: any): Foreshadowing[] {
    const foreshadowing: Foreshadowing[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      const row = resultSet.rows.item(i);
      foreshadowing.push({
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        description: row.description,
        foreshadowType: row.foreshadow_type,
        buriedChapterId: row.buried_chapter_id,
        buriedContent: row.buried_content,
        buriedDate: row.buried_date ? new Date(row.buried_date) : undefined,
        plannedRevealChapter: row.planned_reveal_chapter,
        revealMethod: row.reveal_method,
        status: row.status,
        revealChapterId: row.reveal_chapter_id,
        plotLine: row.plot_line,
        relatedCharacters: row.related_characters ? JSON.parse(row.related_characters) : undefined,
        priority: row.priority,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return foreshadowing;
  }

  /**
   * 解析项目
   */
  private parseProjectFromDb(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      genre: row.genre,
      targetWords: row.target_words,
      worldSetting: row.world_setting,
      culturalContext: row.cultural_context,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

// 导出单例
export const antiBiasEngine = new AntiBiasEngine();
