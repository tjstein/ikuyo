import { create } from 'zustand';
import { createUserSlice, type UserSlice } from '../Auth/store';
import { createDialogSlice, type DialogSlice } from '../Dialog/hooks';
import { createToastSlice, type ToastSlice } from '../Toast/hooks';
import { createTripSlice } from '../Trip/store/store';
import type { TripSlice } from '../Trip/store/types';
import { createTripsSlice, type TripsSlice } from '../Trips/store';
import { createThemeSlice, type ThemeSlice } from '../theme/store';
import { useDeepEqual } from './useDeepEqual';

export type BoundStoreType = ToastSlice &
  UserSlice &
  DialogSlice &
  TripSlice &
  TripsSlice &
  ThemeSlice;

export const useBoundStore = create<BoundStoreType>()((...args) => ({
  ...createToastSlice(...args),
  ...createUserSlice(...args),
  ...createDialogSlice(...args),
  ...createTripSlice(...args),
  ...createTripsSlice(...args),
  ...createThemeSlice(...args),
}));

export function useDeepBoundStore<U>(
  selector: (state: BoundStoreType) => U,
): U {
  return useBoundStore(useDeepEqual<BoundStoreType, U>(selector));
}
