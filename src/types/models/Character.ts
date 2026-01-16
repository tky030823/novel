/**
 * 角色模型 - 对抗人格侵蚀的核心数据结构
 */

/**
 * 语言风格模式
 */
export interface SpeechPattern {
  rhythm?: string;  // 说话节奏描述，如："先停顿-再反问-最后讽刺"
  sentenceStructure?: string;  // 句式偏好，如："多用短句"、"喜欢排比"
  toneWords?: string[];  // 语气词，如：["呢"、"啊"、"嘛"]
  typicalPatterns?: string[];  // 典型句式，如：["难道...吗？"]
}

/**
 * 角色演化节点
 */
export interface EvolutionNode {
  chapterNumber: number;
  event: string;  // 触发演化的事件
  change: string;  // 性格变化描述
  reason: string;  // 变化原因
}

export interface Character {
  id: number;
  projectId: number;
  name: string;
  aliases?: string[];  // 别名/称号
  roleType: 'protagonist' | 'major' | 'supporting' | 'minor' | 'antagonist';

  // 基础信息
  age?: number;  // 年龄
  gender?: string;  // 性别
  appearance?: string;  // 外貌描述
  background?: string;  // 背景故事

  // 核心性格（对抗人格侵蚀的关键）
  personalityTraits: string[];  // 核心性格特质列表
  coreValues?: string;  // 核心价值观
  thingsNeverDo: string[];  // 🔑 绝不会做的事（关键对抗字段）

  // 深层动机（对抗动机简化）
  surfaceBehavior?: string;  // 表面行为模式
  deepMotivation: string;  // 🔑 深层动机（未明说的）
  psychologicalTrauma?: string;  // 心理创伤/阴影

  // 语言风格（对抗语气丢失）
  speechPattern?: SpeechPattern;  // 🔑 说话模式
  catchphrases?: string[];  // 口头禅
  languageStyle?: string;  // 语言风格总体描述

  // 出场记录
  firstAppearanceChapter?: number;
  lastAppearanceChapter?: number;
  appearanceChapters?: number[];  // 出场章节列表

  // 演化记录
  evolutionTimeline?: EvolutionNode[];  // 性格变化时间线

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterInput {
  projectId: number;
  name: string;
  roleType: Character['roleType'];
  personalityTraits: string[];
  thingsNeverDo: string[];
  deepMotivation: string;
  age?: number;
  gender?: string;
  appearance?: string;
  background?: string;
  coreValues?: string;
  surfaceBehavior?: string;
  psychologicalTrauma?: string;
  speechPattern?: SpeechPattern;
  catchphrases?: string[];
  languageStyle?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateCharacterInput extends Partial<CreateCharacterInput> {
  id: number;
}

/**
 * 角色关系
 */
export interface CharacterRelationship {
  id: number;
  projectId: number;
  characterAId: number;
  characterBId: number;
  relationshipType: string;  // 朋友/仇人/恋人/师徒/竞争者等
  relationshipDesc?: string;
  emotionalIntensity: number;  // 1-10
  startChapter?: number;
  currentStatus: string;
}
