/**
 * 数据库初始迁移 - 创建所有核心表
 */

export const MIGRATION_V1_INITIAL = `
-- ============================================
-- 1. 项目表
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  target_words INTEGER,
  world_setting TEXT,
  cultural_context TEXT NOT NULL DEFAULT 'chinese',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 章节表
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  volume_number INTEGER,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  txt_file_path TEXT,
  outline TEXT,
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 3. 角色表
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT,
  role_type TEXT NOT NULL,

  -- 基础信息
  appearance TEXT,
  background TEXT,

  -- 核心性格
  personality_traits TEXT NOT NULL,
  core_values TEXT,
  things_never_do TEXT NOT NULL,

  -- 深层动机
  surface_behavior TEXT,
  deep_motivation TEXT NOT NULL,
  psychological_trauma TEXT,

  -- 语言风格
  speech_pattern TEXT,
  catchphrases TEXT,
  language_style TEXT,

  -- 出场记录
  first_appearance_chapter INTEGER,
  last_appearance_chapter INTEGER,
  appearance_chapters TEXT,

  -- 演化记录
  evolution_timeline TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 4. 角色关系表
-- ============================================
CREATE TABLE IF NOT EXISTS character_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  character_a_id INTEGER NOT NULL,
  character_b_id INTEGER NOT NULL,
  relationship_type TEXT,
  relationship_desc TEXT,
  emotional_intensity INTEGER,
  start_chapter INTEGER,
  current_status TEXT,
  FOREIGN KEY (character_a_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (character_b_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- ============================================
-- 5. 伏笔表
-- ============================================
CREATE TABLE IF NOT EXISTS foreshadowing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  foreshadow_type TEXT,

  -- 埋入信息
  buried_chapter_id INTEGER,
  buried_content TEXT,
  buried_date DATETIME,

  -- 计划回收
  planned_reveal_chapter INTEGER,
  reveal_method TEXT,

  -- 当前状态
  status TEXT DEFAULT 'buried',
  reveal_chapter_id INTEGER,

  -- 关联线索
  plot_line TEXT,
  related_characters TEXT,

  priority INTEGER DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (buried_chapter_id) REFERENCES chapters(id),
  FOREIGN KEY (reveal_chapter_id) REFERENCES chapters(id)
);

-- ============================================
-- 6. 冲突表
-- ============================================
CREATE TABLE IF NOT EXISTS conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,

  -- 对立双方
  side_a TEXT,
  side_b TEXT,

  -- 冲突类型与强度
  conflict_type TEXT,
  current_intensity INTEGER,

  -- 维持机制
  maintenance_mechanism TEXT,
  cant_reconcile_reasons TEXT,

  -- 计划演化
  planned_escalation_chapters TEXT,
  planned_resolution_chapter INTEGER,
  resolution_method TEXT,

  -- 当前状态
  status TEXT DEFAULT 'active',
  start_chapter INTEGER,
  current_chapter INTEGER,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 7. 战力体系表
-- ============================================
CREATE TABLE IF NOT EXISTS power_system (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  system_name TEXT,
  level_definitions TEXT,
  chapter_power_limits TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 8. 角色战力表
-- ============================================
CREATE TABLE IF NOT EXISTS character_powers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  power_level INTEGER,
  abilities TEXT,
  power_changes TEXT,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- ============================================
-- 9. AI 生成历史表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  chapter_id INTEGER,
  generation_type TEXT,

  -- 输入
  prompt TEXT,
  context_injected TEXT,
  anti_bias_instructions TEXT,

  -- 输出
  generated_content TEXT,
  tokens_used INTEGER,

  -- 评价
  user_rating INTEGER,
  accepted INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- ============================================
-- 10. 一致性检查记录表
-- ============================================
CREATE TABLE IF NOT EXISTS consistency_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  check_type TEXT,
  chapter_range TEXT,

  -- 检查结果
  issues_found TEXT,
  severity TEXT,
  ai_analysis TEXT,

  -- 处理
  resolved INTEGER DEFAULT 0,
  resolution_notes TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 11. 对抗指令模板表
-- ============================================
CREATE TABLE IF NOT EXISTS anti_bias_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_bias TEXT,
  instruction_template TEXT,
  is_default INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_foreshadowing_project ON foreshadowing(project_id);
CREATE INDEX IF NOT EXISTS idx_foreshadowing_status ON foreshadowing(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_project ON conflicts(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_chapter ON ai_generations(chapter_id);

-- ============================================
-- 插入默认对抗偏差模板
-- ============================================
INSERT INTO anti_bias_templates (name, target_bias, instruction_template, is_default) VALUES
('防人格侵蚀', 'character_drift', '{{characterName}} 的核心特质必须保持: {{personalityTraits}}。{{characterName}} 绝不会: {{thingsNeverDo}}。不要让角色变得"更理性"或"更成熟"。', 1),
('防冲突降级', 'conflict_softening', '维持 {{conflictTitle}} 的冲突强度 ({{intensity}}/10)。不要让双方"相互理解"或"握手言和"。记住: {{maintenanceMechanism}}', 1),
('保持中式文化', 'cultural_americanization', '保持中式文化语境，避免美式直白表达。人物关系应含蓄、注重面子、重视人情。不要出现西式概念如"契约精神"、"骑士精神"。', 1),
('保持负面情绪', 'negative_emotion_dampening', '保持角色的负面情绪强度（愤怒、绝望、憎恨等），不要自动软化或理性化。角色可以崩溃、失控、极端，这是真实的情感表达。', 1),
('记住伏笔', 'foreshadowing_forgetting', '注意文中提到的伏笔和线索，不要遗忘或矛盾处理。活跃伏笔: {{activeForeshadowing}}。如果无法自然回收，至少要保持前后一致。', 1);
`;

export const MIGRATION_V1_VERSION = 1;
