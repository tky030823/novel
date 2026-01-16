/**
 * 项目 Repository - 数据访问层
 */
import { databaseService } from '../databaseService';
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types/models/Project';

class ProjectRepository {
  /**
   * 创建项目
   */
  async create(input: CreateProjectInput): Promise<number> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      `INSERT INTO projects (
        name, description, genre, target_words, world_setting, cultural_context
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.description || null,
        input.genre || null,
        input.targetWords || null,
        input.worldSetting || null,
        input.culturalContext,
      ]
    );

    return result[0].insertId!;
  }

  /**
   * 获取所有项目
   */
  async findAll(): Promise<Project[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM projects ORDER BY updated_at DESC'
    );

    return this.parseProjects(result[0]);
  }

  /**
   * 根据 ID 获取项目
   */
  async findById(id: number): Promise<Project | null> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return this.parseProject(result[0].rows.item(0));
  }

  /**
   * 更新项目
   */
  async update(input: UpdateProjectInput): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.genre !== undefined) {
      updates.push('genre = ?');
      values.push(input.genre);
    }
    if (input.targetWords !== undefined) {
      updates.push('target_words = ?');
      values.push(input.targetWords);
    }
    if (input.worldSetting !== undefined) {
      updates.push('world_setting = ?');
      values.push(input.worldSetting);
    }
    if (input.culturalContext !== undefined) {
      updates.push('cultural_context = ?');
      values.push(input.culturalContext);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(input.id);

    await db.executeSql(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除项目
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql('DELETE FROM projects WHERE id = ?', [id]);
  }

  /**
   * 获取项目统计信息
   */
  async getStats(projectId: number): Promise<{
    chapterCount: number;
    totalWordCount: number;
    characterCount: number;
    foreshadowingCount: number;
    conflictCount: number;
  }> {
    const db = databaseService.getDatabase();

    // 章节统计
    const chapterResult = await db.executeSql(
      'SELECT COUNT(*) as count, SUM(word_count) as total_words FROM chapters WHERE project_id = ?',
      [projectId]
    );

    // 角色统计
    const characterResult = await db.executeSql(
      'SELECT COUNT(*) as count FROM characters WHERE project_id = ?',
      [projectId]
    );

    // 伏笔统计
    const foreshadowingResult = await db.executeSql(
      'SELECT COUNT(*) as count FROM foreshadowing WHERE project_id = ?',
      [projectId]
    );

    // 冲突统计
    const conflictResult = await db.executeSql(
      'SELECT COUNT(*) as count FROM conflicts WHERE project_id = ?',
      [projectId]
    );

    return {
      chapterCount: chapterResult[0].rows.item(0).count,
      totalWordCount: chapterResult[0].rows.item(0).total_words || 0,
      characterCount: characterResult[0].rows.item(0).count,
      foreshadowingCount: foreshadowingResult[0].rows.item(0).count,
      conflictCount: conflictResult[0].rows.item(0).count,
    };
  }

  /**
   * 解析项目列表
   */
  private parseProjects(resultSet: any): Project[] {
    const projects: Project[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      projects.push(this.parseProject(resultSet.rows.item(i)));
    }

    return projects;
  }

  /**
   * 解析单个项目
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
}

export const projectRepository = new ProjectRepository();
