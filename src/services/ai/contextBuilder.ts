/**
 * 上下文构建器 - 为 AI 生成构建完整的上下文
 */
import { databaseService } from '../database/databaseService';
import { Character } from '@/types/models/Character';
import { Foreshadowing } from '@/types/models/Foreshadowing';
import { Conflict } from '@/types/models/Conflict';
import { Project } from '@/types/models/Project';
import { Chapter } from '@/types/models/Chapter';

export interface ContextBuilderParams {
  projectId: number;
  includeChapters?: number[];  // 包含的章节ID列表
  includeCharacters?: boolean;  // 是否包含所有角色
  specificCharacters?: number[];  // 特定角色ID列表
  includeForeshadowing?: boolean;  // 是否包含活跃伏笔
  includeConflicts?: boolean;  // 是否包含活跃冲突
}

export interface GenerationContext {
  project: Project;
  worldSetting?: string;
  culturalContext: string;
  characters: Character[];
  activeForeshadowing: Foreshadowing[];
  activeConflicts: Conflict[];
  recentChapters?: Chapter[];
}

class ContextBuilder {
  /**
   * 构建完整上下文
   */
  async build(params: ContextBuilderParams): Promise<GenerationContext> {
    const db = databaseService.getDatabase();

    // 1. 获取项目信息
    const projectResult = await db.executeSql(
      'SELECT * FROM projects WHERE id = ?',
      [params.projectId]
    );

    if (projectResult[0].rows.length === 0) {
      throw new Error(`Project ${params.projectId} not found`);
    }

    const project = this.parseProject(projectResult[0].rows.item(0));

    // 2. 获取角色
    let characters: Character[] = [];
    if (params.includeCharacters) {
      const charResult = await db.executeSql(
        'SELECT * FROM characters WHERE project_id = ? ORDER BY role_type, name',
        [params.projectId]
      );
      characters = this.parseCharacters(charResult[0]);
    } else if (params.specificCharacters && params.specificCharacters.length > 0) {
      const placeholders = params.specificCharacters.map(() => '?').join(',');
      const charResult = await db.executeSql(
        `SELECT * FROM characters WHERE id IN (${placeholders})`,
        params.specificCharacters
      );
      characters = this.parseCharacters(charResult[0]);
    }

    // 3. 获取活跃伏笔
    let activeForeshadowing: Foreshadowing[] = [];
    if (params.includeForeshadowing) {
      const foreshadowResult = await db.executeSql(
        'SELECT * FROM foreshadowing WHERE project_id = ? AND status IN (?, ?) ORDER BY priority DESC, created_at',
        [params.projectId, 'buried', 'progressing']
      );
      activeForeshadowing = this.parseForeshadowing(foreshadowResult[0]);
    }

    // 4. 获取活跃冲突
    let activeConflicts: Conflict[] = [];
    if (params.includeConflicts) {
      const conflictResult = await db.executeSql(
        'SELECT * FROM conflicts WHERE project_id = ? AND status = ? ORDER BY current_intensity DESC',
        [params.projectId, 'active']
      );
      activeConflicts = this.parseConflicts(conflictResult[0]);
    }

    // 5. 获取相关章节
    let recentChapters: Chapter[] | undefined;
    if (params.includeChapters && params.includeChapters.length > 0) {
      const placeholders = params.includeChapters.map(() => '?').join(',');
      const chapterResult = await db.executeSql(
        `SELECT * FROM chapters WHERE id IN (${placeholders}) ORDER BY chapter_number`,
        params.includeChapters
      );
      recentChapters = this.parseChapters(chapterResult[0]);
    }

    return {
      project,
      worldSetting: project.worldSetting,
      culturalContext: this.getCulturalContextDescription(project.culturalContext),
      characters,
      activeForeshadowing,
      activeConflicts,
      recentChapters,
    };
  }

  /**
   * 获取文化语境描述
   */
  private getCulturalContextDescription(context: Project['culturalContext']): string {
    const map: Record<Project['culturalContext'], string> = {
      chinese: '中式',
      japanese: '日式',
      western: '西式',
      classical: '古典',
    };
    return map[context];
  }

  /**
   * 解析项目
   */
  private parseProject(row: any): Project {
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

  /**
   * 解析角色列表
   */
  private parseCharacters(resultSet: any): Character[] {
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
   * 解析伏笔列表
   */
  private parseForeshadowing(resultSet: any): Foreshadowing[] {
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
   * 解析冲突列表
   */
  private parseConflicts(resultSet: any): Conflict[] {
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
   * 解析章节列表
   */
  private parseChapters(resultSet: any): Chapter[] {
    const chapters: Chapter[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      const row = resultSet.rows.item(i);
      chapters.push({
        id: row.id,
        projectId: row.project_id,
        volumeNumber: row.volume_number,
        chapterNumber: row.chapter_number,
        title: row.title,
        content: row.content,
        txtFilePath: row.txt_file_path,
        outline: row.outline,
        wordCount: row.word_count,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return chapters;
  }
}

// 导出单例
export const contextBuilder = new ContextBuilder();
