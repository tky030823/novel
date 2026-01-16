/**
 * 角色状态管理
 */
import {create} from 'zustand';
import {Character, CreateCharacterInput} from '@/types/models/Character';
import {characterRepository} from '@/services/database/repositories/characterRepository';

interface CharacterStore {
  characters: Character[];
  currentCharacter: Character | null;
  loading: boolean;
  error: string | null;

  // 操作
  loadCharacters: (projectId: number) => Promise<void>;
  selectCharacter: (id: number) => Promise<void>;
  createCharacter: (input: CreateCharacterInput) => Promise<number>;
  updateCharacter: (id: number, updates: Partial<CreateCharacterInput>) => Promise<void>;
  deleteCharacter: (id: number) => Promise<void>;
  clearCurrentCharacter: () => void;

  // 工具
  recordAppearance: (characterId: number, chapterNumber: number) => Promise<void>;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,

  loadCharacters: async (projectId: number) => {
    set({loading: true, error: null});
    try {
      const characters = await characterRepository.findByProject(projectId);
      set({characters, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  selectCharacter: async (id: number) => {
    set({loading: true, error: null});
    try {
      const character = await characterRepository.findById(id);
      set({currentCharacter: character, loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
    }
  },

  createCharacter: async (input: CreateCharacterInput) => {
    set({loading: true, error: null});
    try {
      const id = await characterRepository.create(input);
      await get().loadCharacters(input.projectId);
      set({loading: false});
      return id;
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  updateCharacter: async (id: number, updates: Partial<CreateCharacterInput>) => {
    set({loading: true, error: null});
    try {
      await characterRepository.update({id, ...updates});

      // 重新加载角色列表
      const currentChar = get().currentCharacter;
      if (currentChar && updates.projectId) {
        await get().loadCharacters(updates.projectId);
      }

      // 如果是当前角色，重新选择
      if (currentChar?.id === id) {
        await get().selectCharacter(id);
      }

      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  deleteCharacter: async (id: number) => {
    set({loading: true, error: null});
    try {
      const character = await characterRepository.findById(id);
      await characterRepository.delete(id);

      if (character) {
        await get().loadCharacters(character.projectId);
      }

      if (get().currentCharacter?.id === id) {
        set({currentCharacter: null});
      }

      set({loading: false});
    } catch (error: any) {
      set({error: error.message, loading: false});
      throw error;
    }
  },

  clearCurrentCharacter: () => {
    set({currentCharacter: null});
  },

  recordAppearance: async (characterId: number, chapterNumber: number) => {
    try {
      await characterRepository.recordAppearance(characterId, chapterNumber);
    } catch (error: any) {
      set({error: error.message});
      throw error;
    }
  },
}));
