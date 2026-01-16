/**
 * 项目模型 - 小说项目的顶层容器
 */
export interface Project {
  id: number;
  name: string;
  description?: string;
  genre?: string;  // 题材: 玄幻/都市/科幻/武侠等
  targetWords?: number;  // 目标字数
  worldSetting?: string;  // 世界观设定
  writingStyle?: string;  // 写作风格
  culturalContext: 'chinese' | 'japanese' | 'western' | 'classical';  // 文化语境
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  genre?: string;
  targetWords?: number;
  worldSetting?: string;
  writingStyle?: string;
  culturalContext: 'chinese' | 'japanese' | 'western' | 'classical';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: number;
}
