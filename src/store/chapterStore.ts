/**
 * 章节状态管理
 */
import {create} from 'zustand';
import {Chapter, CreateChapterInput} from '@/types/models/Chapter';
import {chapterRepository} from '@/services/database/repositories/chapterRepository';

interface ChapterStore {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  loading: boolean;
  error: string | null;

  // 操作
  loadChapters: (projectId: number) => Promise<void>;
  selectChapter: (id: number) => Promise<void>;
  createChapter: (input: CreateChapterInput) => Promise<number>;
  updateChapter: (id: number, updates: Partial<CreateChapterInput>) => Promise<void>;
  deleteChapter: (id: number) => Promise<void>;
  clearCurrentChapter: () => void;

  // 工具
  getNextChapterNumber: (projectId: number) => Promise<number>;
  loadRecentChapters: (projectId: number, limit: number) => Promise<Chapter[]>;
}

export const useChapterStore = create<ChapterStore>((set, get) => ({
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,

  loadChapters: async (projectId: number) => {
    set({loading: true, error: null});
    try {
      const chapters = await chapterRepository.findByProject(projectId);
      set({chapters, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  selectChapter: async (id: number) => {
    set({loading: true, error: null});
    try {
      const chapter = await chapterRepository.findById(id);
      set({currentChapter: chapter, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  createChapter: async (input: CreateChapterInput) => {
    set({loading: true, error: null});
    try {
      const id = await chapterRepository.create(input);
      await get().loadChapters(input.projectId);
      set({loading: false});
      return id;
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  updateChapter: async (id: number, updates: Partial<CreateChapterInput>) => {
    set({loading: true, error: null});
    try {
      await chapterRepository.update({id, ...updates});

      const currentChapter = get().currentChapter;
      if (currentChapter && updates.projectId) {
        await get().loadChapters(updates.projectId);
      }

      if (currentChapter?.id === id) {
        await get().selectChapter(id);
      }

      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  deleteChapter: async (id: number) => {
    set({loading: true, error: null});
    try {
      const chapter = await chapterRepository.findById(id);
      await chapterRepository.delete(id);

      if (chapter) {
        await get().loadChapters(chapter.projectId);
      }

      if (get().currentChapter?.id === id) {
        set({currentChapter: null});
      }

      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  clearCurrentChapter: () => {
    set({currentChapter: null});
  },

  getNextChapterNumber: async (projectId: number) => {
    try {
      return await chapterRepository.getNextChapterNumber(projectId);
    } catch (error: any) {
      set({error: error.message});
      throw error;
    }
  },

  loadRecentChapters: async (projectId: number, limit: number) => {
    try {
      return await chapterRepository.findRecent(projectId, limit);
    } catch (error: any) {
      set({error: error.message});
      throw error;
    }
  },
}));
