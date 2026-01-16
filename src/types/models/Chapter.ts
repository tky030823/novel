/**
 * 章节模型
 */
export interface Chapter {
  id: number;
  projectId: number;
  volumeNumber?: number;  // 卷号（可选）
  chapterNumber: number;
  title: string;
  content?: string;  // 章节内容（也可只存txt路径）
  txtFilePath?: string;  // txt文件路径
  outline?: string;  // 本章大纲
  wordCount: number;
  status: 'draft' | 'ai_generated' | 'reviewed' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChapterInput {
  projectId: number;
  volumeNumber?: number;
  chapterNumber: number;
  title: string;
  content?: string;
  outline?: string;
}

export interface UpdateChapterInput extends Partial<CreateChapterInput> {
  id: number;
  status?: Chapter['status'];
}
