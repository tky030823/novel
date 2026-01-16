/**
 * 项目状态管理
 */
import {create} from 'zustand';
import {Project, CreateProjectInput} from '@/types/models/Project';
import {projectRepository} from '@/services/database/repositories/projectRepository';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;

  // 操作
  loadProjects: () => Promise<void>;
  selectProject: (id: number) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<number>;
  updateProject: (id: number, updates: Partial<CreateProjectInput>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  clearCurrentProject: () => void;

  // 统计
  loadStats: (projectId: number) => Promise<any>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  loadProjects: async () => {
    set({loading: true, error: null});
    try {
      const projects = await projectRepository.findAll();
      set({projects, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  selectProject: async (id: number) => {
    set({loading: true, error: null});
    try {
      const project = await projectRepository.findById(id);
      set({currentProject: project, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  createProject: async (input: CreateProjectInput) => {
    set({loading: true, error: null});
    try {
      const id = await projectRepository.create(input);
      await get().loadProjects();
      set({loading: false});
      return id;
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  updateProject: async (id: number, updates: Partial<CreateProjectInput>) => {
    set({loading: true, error: null});
    try {
      await projectRepository.update({id, ...updates});
      await get().loadProjects();
      if (get().currentProject?.id === id) {
        await get().selectProject(id);
      }
      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  deleteProject: async (id: number) => {
    set({loading: true, error: null});
    try {
      await projectRepository.delete(id);
      await get().loadProjects();
      if (get().currentProject?.id === id) {
        set({currentProject: null});
      }
      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  clearCurrentProject: () => {
    set({currentProject: null});
  },

  loadStats: async (projectId: number) => {
    try {
      return await projectRepository.getStats(projectId);
    } catch (error: any) {
      set({error: error.message});
      throw error;
    }
  },
}));
