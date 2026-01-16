/**
 * 冲突 Repository - 数据访问层
 */
import { databaseService } from '../databaseService';
import { Conflict, CreateConflictInput, UpdateConflictInput } from '@/types/models/Conflict';

class ConflictRepository {
  /**
   * 创建冲突
   */
  async create(input: CreateConflictInput): Promise<number> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      `INSERT INTO conflicts (
        project_id, title, side_a, side_b, conflict_type, current_intensity,
        maintenance_mechanism, cant_reconcile_reasons, planned_escalation_chapters,
        planned_resolution_chapter, resolution_method, start_chapter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.projectId,
        input.title,
        input.sideA,
        input.sideB,
        input.conflictType,
        input.currentIntensity,
        input.maintenanceMechanism,
        JSON.stringify(input.cantReconcileReasons),
        input.plannedEscalationChapters ? JSON.stringify(input.plannedEscalationChapters) : null,
        input.plannedResolutionChapter || null,
        input.resolutionMethod || null,
        input.startChapter || null,
      ]
    );

    return result[0].insertId!;
  }

  /**
   * 获取项目的所有冲突
   */
  async findByProject(projectId: number): Promise<Conflict[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM conflicts WHERE project_id = ? ORDER BY current_intensity DESC, created_at',
      [projectId]
    );

    return this.parseConflicts(result[0]);
  }

  /**
   * 获取活跃冲突
   */
  async findActive(projectId: number): Promise<Conflict[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM conflicts WHERE project_id = ? AND status = ? ORDER BY current_intensity DESC',
      [projectId, 'active']
    );

    return this.parseConflicts(result[0]);
  }

  /**
   * 根据 ID 获取冲突
   */
  async findById(id: number): Promise<Conflict | null> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM conflicts WHERE id = ?',
      [id]
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return this.parseConflict(result[0].rows.item(0));
  }

  /**
   * 更新冲突
   */
  async update(input: UpdateConflictInput): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.sideA !== undefined) {
      updates.push('side_a = ?');
      values.push(input.sideA);
    }
    if (input.sideB !== undefined) {
      updates.push('side_b = ?');
      values.push(input.sideB);
    }
    if (input.conflictType !== undefined) {
      updates.push('conflict_type = ?');
      values.push(input.conflictType);
    }
    if (input.currentIntensity !== undefined) {
      updates.push('current_intensity = ?');
      values.push(input.currentIntensity);
    }
    if (input.maintenanceMechanism !== undefined) {
      updates.push('maintenance_mechanism = ?');
      values.push(input.maintenanceMechanism);
    }
    if (input.cantReconcileReasons !== undefined) {
      updates.push('cant_reconcile_reasons = ?');
      values.push(JSON.stringify(input.cantReconcileReasons));
    }
    if (input.plannedEscalationChapters !== undefined) {
      updates.push('planned_escalation_chapters = ?');
      values.push(JSON.stringify(input.plannedEscalationChapters));
    }
    if (input.plannedResolutionChapter !== undefined) {
      updates.push('planned_resolution_chapter = ?');
      values.push(input.plannedResolutionChapter);
    }
    if (input.resolutionMethod !== undefined) {
      updates.push('resolution_method = ?');
      values.push(input.resolutionMethod);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.currentChapter !== undefined) {
      updates.push('current_chapter = ?');
      values.push(input.currentChapter);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(input.id);

    await db.executeSql(
      `UPDATE conflicts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除冲突
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql('DELETE FROM conflicts WHERE id = ?', [id]);
  }

  /**
   * 解析冲突列表
   */
  private parseConflicts(resultSet: any): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      conflicts.push(this.parseConflict(resultSet.rows.item(i)));
    }

    return conflicts;
  }

  /**
   * 解析单个冲突
   */
  private parseConflict(row: any): Conflict {
    return {
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
    };
  }
}

export const conflictRepository = new ConflictRepository();
