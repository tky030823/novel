/**
 * 伏笔模型 - 对抗伏笔遗忘
 */
export interface Foreshadowing {
  id: number;
  projectId: number;
  title: string;
  description?: string;  // 伏笔内容描述
  foreshadowType: 'mystery' | 'prophecy' | 'item' | 'character' | 'event' | 'other';

  // 埋入信息
  buriedChapterId?: number;  // 埋入的章节
  buriedContent?: string;  // 埋入时的具体描述
  buriedDate?: Date;

  // 计划回收
  plannedRevealChapter?: number;  // 🔑 计划回收章节（防止遗忘）
  revealMethod?: string;  // 计划如何回收

  // 当前状态
  status: 'buried' | 'progressing' | 'revealed';  // 🔑 状态追踪
  revealChapterId?: number;  // 实际回收章节

  // 关联线索
  plotLine?: string;  // 所属情节线: 主线/支线A/支线B
  relatedCharacters?: number[];  // 相关角色ID列表

  priority: number;  // 重要性 1-5

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateForeshadowingInput {
  projectId: number;
  title: string;
  description?: string;
  foreshadowType: Foreshadowing['foreshadowType'];
  buriedChapterId?: number;
  buriedContent?: string;
  plannedRevealChapter?: number;
  revealMethod?: string;
  plotLine?: string;
  relatedCharacters?: number[];
  priority?: number;
}

export interface UpdateForeshadowingInput extends Partial<CreateForeshadowingInput> {
  id: number;
  status?: Foreshadowing['status'];
  revealChapterId?: number;
}

/**
 * 伏笔提醒
 */
export interface ForeshadowingAlert {
  foreshadowing: Foreshadowing;
  alertType: 'approaching' | 'overdue' | 'long_inactive';
  message: string;
  currentChapter: number;
}
