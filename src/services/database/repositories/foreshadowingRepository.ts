/**
 * 伏笔 Repository - 数据访问层
 */
import { databaseService } from '../databaseService';
import {
  Foreshadowing,
  CreateForeshadowingInput,
  UpdateForeshadowingInput,
  ForeshadowingAlert,
} from '@/types/models/Foreshadowing';

class ForeshadowingRepository {
  /**
   * 创建伏笔
   */
  async create(input: CreateForeshadowingInput): Promise<number> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      `INSERT INTO foreshadowing (
        project_id, title, description, foreshadow_type,
        buried_chapter_id, buried_content, planned_reveal_chapter,
        reveal_method, plot_line, related_characters, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.projectId,
        input.title,
        input.description || null,
        input.foreshadowType,
        input.buriedChapterId || null,
        input.buriedContent || null,
        input.plannedRevealChapter || null,
        input.revealMethod || null,
        input.plotLine || null,
        input.relatedCharacters ? JSON.stringify(input.relatedCharacters) : null,
        input.priority || 1,
      ]
    );

    return result[0].insertId!;
  }

  /**
   * 获取项目的所有伏笔
   */
  async findByProject(projectId: number): Promise<Foreshadowing[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM foreshadowing WHERE project_id = ? ORDER BY priority DESC, created_at',
      [projectId]
    );

    return this.parseForeshadowing(result[0]);
  }

  /**
   * 获取活跃伏笔（未解决和推进中）
   */
  async findActive(projectId: number): Promise<Foreshadowing[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM foreshadowing WHERE project_id = ? AND status IN (?, ?) ORDER BY priority DESC',
      [projectId, 'buried', 'progressing']
    );

    return this.parseForeshadowing(result[0]);
  }

  /**
   * 根据 ID 获取伏笔
   */
  async findById(id: number): Promise<Foreshadowing | null> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM foreshadowing WHERE id = ?',
      [id]
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return this.parseForeshadowingItem(result[0].rows.item(0));
  }

  /**
   * 更新伏笔
   */
  async update(input: UpdateForeshadowingInput): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.foreshadowType !== undefined) {
      updates.push('foreshadow_type = ?');
      values.push(input.foreshadowType);
    }
    if (input.buriedChapterId !== undefined) {
      updates.push('buried_chapter_id = ?');
      values.push(input.buriedChapterId);
    }
    if (input.buriedContent !== undefined) {
      updates.push('buried_content = ?');
      values.push(input.buriedContent);
    }
    if (input.plannedRevealChapter !== undefined) {
      updates.push('planned_reveal_chapter = ?');
      values.push(input.plannedRevealChapter);
    }
    if (input.revealMethod !== undefined) {
      updates.push('reveal_method = ?');
      values.push(input.revealMethod);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.revealChapterId !== undefined) {
      updates.push('reveal_chapter_id = ?');
      values.push(input.revealChapterId);
    }
    if (input.plotLine !== undefined) {
      updates.push('plot_line = ?');
      values.push(input.plotLine);
    }
    if (input.relatedCharacters !== undefined) {
      updates.push('related_characters = ?');
      values.push(JSON.stringify(input.relatedCharacters));
    }
    if (input.priority !== undefined) {
      updates.push('priority = ?');
      values.push(input.priority);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(input.id);

    await db.executeSql(
      `UPDATE foreshadowing SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除伏笔
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql('DELETE FROM foreshadowing WHERE id = ?', [id]);
  }

  /**
   * 获取需要提醒的伏笔
   */
  async getAlerts(projectId: number, currentChapter: number): Promise<ForeshadowingAlert[]> {
    const foreshadowing = await this.findActive(projectId);
    const alerts: ForeshadowingAlert[] = [];

    for (const f of foreshadowing) {
      // 即将到期（2章内）
      if (f.plannedRevealChapter && f.plannedRevealChapter - currentChapter <= 2 && f.plannedRevealChapter > currentChapter) {
        alerts.push({
          foreshadowing: f,
          alertType: 'approaching',
          message: `伏笔"${f.title}"计划在第 ${f.plannedRevealChapter} 章回收（还有 ${f.plannedRevealChapter - currentChapter} 章）`,
          currentChapter,
        });
      }

      // 已过期
      if (f.plannedRevealChapter && f.plannedRevealChapter < currentChapter) {
        alerts.push({
          foreshadowing: f,
          alertType: 'overdue',
          message: `伏笔"${f.title}"原计划第 ${f.plannedRevealChapter} 章回收，但已过期`,
          currentChapter,
        });
      }

      // 长期未推进（超过10章没动）
      if (f.buriedChapterId && currentChapter - f.buriedChapterId > 10 && f.status === 'buried') {
        alerts.push({
          foreshadowing: f,
          alertType: 'long_inactive',
          message: `伏笔"${f.title}"已埋入 ${currentChapter - f.buriedChapterId} 章，长期未推进`,
          currentChapter,
        });
      }
    }

    return alerts;
  }

  /**
   * 解析伏笔列表
   */
  private parseForeshadowing(resultSet: any): Foreshadowing[] {
    const foreshadowing: Foreshadowing[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      foreshadowing.push(this.parseForeshadowingItem(resultSet.rows.item(i)));
    }

    return foreshadowing;
  }

  /**
   * 解析单个伏笔
   */
  private parseForeshadowingItem(row: any): Foreshadowing {
    return {
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
    };
  }
}

export const foreshadowingRepository = new ForeshadowingRepository();
