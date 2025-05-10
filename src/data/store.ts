import { create } from 'zustand';
import { createUserSlice, type UserSlice } from '../Auth/hooks';
import { createDialogSlice, type DialogSlice } from '../Dialog/hooks';
import { createToastSlice, type ToastSlice } from '../Toast/hooks';
import { createTripSlice, type TripSlice } from '../Trip/store';

export type BoundStoreType = ToastSlice & UserSlice & DialogSlice & TripSlice;

export const useBoundStore = create<BoundStoreType>()((...args) => ({
  ...createToastSlice(...args),
  ...createUserSlice(...args),
  ...createDialogSlice(...args),
  ...createTripSlice(...args),
}));
