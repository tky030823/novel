/**
 * 冲突模型 - 对抗冲突降级
 */
export interface Conflict {
  id: number;
  projectId: number;
  title: string;

  // 对立双方
  sideA: string;  // 可以是角色ID或组织名
  sideB: string;

  // 冲突类型与强度
  conflictType: 'mortal_hatred' | 'interest_conflict' | 'ideological_conflict' | 'emotional_conflict' | 'other';
  currentIntensity: number;  // 🔑 当前强度 1-10

  // 维持机制（🔑 关键对抗冲突降级）
  maintenanceMechanism: string;  // 为什么不能和解
  cantReconcileReasons: string[];  // 无法和解的具体原因

  // 计划演化
  plannedEscalationChapters?: Record<number, string>;  // {章节号: 升级事件}
  plannedResolutionChapter?: number;  // 计划解决的章节
  resolutionMethod?: string;  // 计划如何解决

  // 当前状态
  status: 'active' | 'escalated' | 'resolved';
  startChapter?: number;
  currentChapter?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConflictInput {
  projectId: number;
  title: string;
  sideA: string;
  sideB: string;
  conflictType: Conflict['conflictType'];
  currentIntensity: number;
  maintenanceMechanism: string;
  cantReconcileReasons: string[];
  plannedEscalationChapters?: Record<number, string>;
  plannedResolutionChapter?: number;
  resolutionMethod?: string;
  startChapter?: number;
}

export interface UpdateConflictInput extends Partial<CreateConflictInput> {
  id: number;
  status?: Conflict['status'];
  currentChapter?: number;
}

/**
 * 战力体系
 */
export interface PowerSystem {
  id: number;
  projectId: number;
  systemName: string;  // 修为/等级/境界等
  levelDefinitions: PowerLevel[];  // 等级定义
  chapterPowerLimits: ChapterPowerLimit[];  // 每章战力上限
  createdAt: Date;
}

export interface PowerLevel {
  level: number;
  name: string;
  description?: string;
  typicalAbilities?: string[];
}

export interface ChapterPowerLimit {
  chapterNumber: number;
  maxLevel: number;
  note?: string;
}

/**
 * 角色战力记录
 */
export interface CharacterPower {
  id: number;
  characterId: number;
  chapterId: number;
  powerLevel: number;
  abilities?: string[];
  powerChanges?: string;  // 本章战力变化描述
}
