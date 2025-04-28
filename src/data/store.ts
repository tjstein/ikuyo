import { create } from 'zustand';
import { type UserSlice, createUserSlice } from '../Auth/hooks';
import { type ToastSlice, createToastSlice } from '../Toast/hooks';

export type BoundStoreType = ToastSlice & UserSlice;

export const useBoundStore = create<BoundStoreType>()((...a) => ({
  ...createToastSlice(...a),
  ...createUserSlice(...a),
}));
