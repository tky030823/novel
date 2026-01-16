/**
 * 角色 Repository - 数据访问层
 */
import { databaseService } from '../databaseService';
import { Character, CreateCharacterInput, UpdateCharacterInput } from '@/types/models/Character';

class CharacterRepository {
  /**
   * 创建角色
   */
  async create(input: CreateCharacterInput): Promise<number> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      `INSERT INTO characters (
        project_id, name, role_type, personality_traits, things_never_do, deep_motivation,
        appearance, background, core_values, surface_behavior, psychological_trauma,
        speech_pattern, catchphrases, language_style
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.projectId,
        input.name,
        input.roleType,
        JSON.stringify(input.personalityTraits),
        JSON.stringify(input.thingsNeverDo),
        input.deepMotivation,
        input.appearance || null,
        input.background || null,
        input.coreValues || null,
        input.surfaceBehavior || null,
        input.psychologicalTrauma || null,
        input.speechPattern ? JSON.stringify(input.speechPattern) : null,
        input.catchphrases ? JSON.stringify(input.catchphrases) : null,
        input.languageStyle || null,
      ]
    );

    return result[0].insertId!;
  }

  /**
   * 获取项目的所有角色
   */
  async findByProject(projectId: number): Promise<Character[]> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM characters WHERE project_id = ? ORDER BY role_type, name',
      [projectId]
    );

    return this.parseCharacters(result[0]);
  }

  /**
   * 根据 ID 获取角色
   */
  async findById(id: number): Promise<Character | null> {
    const db = databaseService.getDatabase();

    const result = await db.executeSql(
      'SELECT * FROM characters WHERE id = ?',
      [id]
    );

    if (result[0].rows.length === 0) {
      return null;
    }

    return this.parseCharacter(result[0].rows.item(0));
  }

  /**
   * 更新角色
   */
  async update(input: UpdateCharacterInput): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.roleType !== undefined) {
      updates.push('role_type = ?');
      values.push(input.roleType);
    }
    if (input.personalityTraits !== undefined) {
      updates.push('personality_traits = ?');
      values.push(JSON.stringify(input.personalityTraits));
    }
    if (input.thingsNeverDo !== undefined) {
      updates.push('things_never_do = ?');
      values.push(JSON.stringify(input.thingsNeverDo));
    }
    if (input.deepMotivation !== undefined) {
      updates.push('deep_motivation = ?');
      values.push(input.deepMotivation);
    }
    if (input.appearance !== undefined) {
      updates.push('appearance = ?');
      values.push(input.appearance);
    }
    if (input.background !== undefined) {
      updates.push('background = ?');
      values.push(input.background);
    }
    if (input.coreValues !== undefined) {
      updates.push('core_values = ?');
      values.push(input.coreValues);
    }
    if (input.surfaceBehavior !== undefined) {
      updates.push('surface_behavior = ?');
      values.push(input.surfaceBehavior);
    }
    if (input.psychologicalTrauma !== undefined) {
      updates.push('psychological_trauma = ?');
      values.push(input.psychologicalTrauma);
    }
    if (input.speechPattern !== undefined) {
      updates.push('speech_pattern = ?');
      values.push(JSON.stringify(input.speechPattern));
    }
    if (input.catchphrases !== undefined) {
      updates.push('catchphrases = ?');
      values.push(JSON.stringify(input.catchphrases));
    }
    if (input.languageStyle !== undefined) {
      updates.push('language_style = ?');
      values.push(input.languageStyle);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(input.id);

    await db.executeSql(
      `UPDATE characters SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除角色
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.executeSql('DELETE FROM characters WHERE id = ?', [id]);
  }

  /**
   * 记录角色出场
   */
  async recordAppearance(characterId: number, chapterNumber: number): Promise<void> {
    const db = databaseService.getDatabase();

    const character = await this.findById(characterId);
    if (!character) {
      return;
    }

    const appearanceChapters = character.appearanceChapters || [];
    if (!appearanceChapters.includes(chapterNumber)) {
      appearanceChapters.push(chapterNumber);
      appearanceChapters.sort((a, b) => a - b);
    }

    const updates: string[] = [];
    const values: any[] = [];

    // 更新首次出场
    if (!character.firstAppearanceChapter) {
      updates.push('first_appearance_chapter = ?');
      values.push(chapterNumber);
    }

    // 更新最近出场
    updates.push('last_appearance_chapter = ?');
    values.push(chapterNumber);

    // 更新出场列表
    updates.push('appearance_chapters = ?');
    values.push(JSON.stringify(appearanceChapters));

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(characterId);

    await db.executeSql(
      `UPDATE characters SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 解析角色列表
   */
  private parseCharacters(resultSet: any): Character[] {
    const characters: Character[] = [];

    for (let i = 0; i < resultSet.rows.length; i++) {
      characters.push(this.parseCharacter(resultSet.rows.item(i)));
    }

    return characters;
  }

  /**
   * 解析单个角色
   */
  private parseCharacter(row: any): Character {
    return {
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
    };
  }
}

export const characterRepository = new CharacterRepository();
