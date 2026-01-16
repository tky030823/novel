/**
 * 章节 Repository - 数据访问层
 */
import { databaseService } from '../databaseService';
import { Chapter, CreateChapterInput, UpdateChapterInput } from '@/types/models/Chapter';

class ChapterRepository {
  /**
   * 创建章节
   */
  async create(input: CreateChapterInput): Promise<number> {
    const db = databaseService.getDatabase();

    // 计算字数
    const wordCount = input.content ? this.countWords(input.content) : 0;

    const result = await db.executeSql(
      `INSERT INTO chapters (
        project_id, volume_number, chapter_number, title, content, outline, word_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.projectId,
        input.volumeNumber || null,
        input.chapterNumber,
        input.title,
        input.content || null,
        input.outline || null,
        wordCount,
      ]
    );

    return result[0].insertId!;
  }

  /**
   * 获取项目的所有章节
   */
  async findByProject(projectId: number): Promise<Chapter[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_number',
      [projectId]
    );

    return this.parseChapters(result[0]);
  }

  /**
   * 根据 ID 获取章节
   */
  async findById(id: number): Promise<Chapter | null> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM chapters WHERE id = ?',
      [id]
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return this.parseChapter(result[0].rows.item(0));
  }

  /**
   * 根据章节号范围获取章节
   */
  async findByRange(projectId: number, range: { from: number; to: number }): Promise<Chapter[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM chapters WHERE project_id = ? AND chapter_number BETWEEN ? AND ? ORDER BY chapter_number',
      [projectId, range.from, range.to]
    );

    return this.parseChapters(result[0]);
  }

  /**
   * 获取最近的 N 章
   */
  async findRecent(projectId: number, limit: number): Promise<Chapter[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_number DESC LIMIT ?',
      [projectId, limit]
    );

    const chapters = this.parseChapters(result[0]);
    return chapters.reverse(); // 按章节号正序返回
  }

  /**
   * 更新章节
   */
  async update(input: UpdateChapterInput): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.content !== undefined) {
      updates.push('content = ?');
      values.push(input.content);

      // 重新计算字数
      updates.push('word_count = ?');
      values.push(this.countWords(input.content));
    }
    if (input.outline !== undefined) {
      updates.push('outline = ?');
      values.push(input.outline);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.volumeNumber !== undefined) {
      updates.push('volume_number = ?');
      values.push(input.volumeNumber);
    }
    if (input.chapterNumber !== undefined) {
      updates.push('chapter_number = ?');
      values.push(input.chapterNumber);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(input.id);

    await db.executeSql(
      `UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除章节
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql('DELETE FROM chapters WHERE id = ?', [id]);
  }

  /**
   * 获取下一个章节号
   */
  async getNextChapterNumber(projectId: number): Promise<number> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT MAX(chapter_number) as max_num FROM chapters WHERE project_id = ?',
      [projectId]
    );

    const maxNum = result[0].rows.item(0).max_num;
    return maxNum ? maxNum + 1 : 1;
  }

  /**
   * 统计字数（简单实现）
   */
  private countWords(text: string): number {
    if (!text) {
      return 0;
    }

    // 移除空白字符后计算字符数（适用于中文）
    return text.replace(/\s/g, '').length;
  }

  /**
   * 解析章节列表
   */
  private parseChapters(resultSet: any): Chapter[] {
    const chapters: Chapter[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      chapters.push(this.parseChapter(resultSet.rows.item(i)));
    }

    return chapters;
  }

  /**
   * 解析单个章节
   */
  private parseChapter(row: any): Chapter {
    return {
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
    };
  }
}

export const chapterRepository = new ChapterRepository();
