import { create } from 'zustand';
import { type UserSlice, createUserSlice } from '../Auth/hooks';
import { type DialogSlice, createDialogSlice } from '../Dialog/hooks';
import { type ToastSlice, createToastSlice } from '../Toast/hooks';
import { type TripSlice, createTripSlice } from '../Trip/store';

export type BoundStoreType = ToastSlice & UserSlice & DialogSlice & TripSlice;

export const useBoundStore = create<BoundStoreType>()((...args) => ({
  ...createToastSlice(...args),
  ...createUserSlice(...args),
  ...createDialogSlice(...args),
  ...createTripSlice(...args),
}));
