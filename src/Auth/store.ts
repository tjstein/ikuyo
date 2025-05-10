import type { StateCreator } from 'zustand';
import type { BoundStoreType } from '../data/store';
import type { DbUser } from '../data/types';

export interface UserSlice {
  currentUser: DbUser | undefined;
  setCurrentUser: (user: DbUser | undefined) => void;
}

export const createUserSlice: StateCreator<
  BoundStoreType,
  [],
  [],
  UserSlice
> = (set) => {
  return {
    currentUser: undefined,
    setCurrentUser: (user) => {
      set(() => ({
        currentUser: user,
      }));
    },
  };
};
