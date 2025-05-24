import { createDialogRoute } from '../Dialog/DialogRoute';
import { useDeepBoundStore } from '../data/store';
import type { TripSliceActivity } from '../Trip/store/types';
import { ActivityDialogContentDelete } from './ActivityDialogContentDelete';
import { ActivityDialogContentEdit } from './ActivityDialogContentEdit';
import { ActivityDialogContentView } from './ActivityDialogContentView';

export const ActivityDialog = createDialogRoute<TripSliceActivity>({
  DialogContentView: ActivityDialogContentView,
  DialogContentEdit: ActivityDialogContentEdit,
  DialogContentDelete: ActivityDialogContentDelete,
  // TODO: See AccommodationDialog.tsx on loading state issue
  getData: (id) => useDeepBoundStore((state) => state.getActivity(id)),
  getDataMeta: (id) => {
    const acitivty = useDeepBoundStore((state) => state.getActivity(id));
    return {
      loading: acitivty === undefined,
      error: undefined,
    };
  },
});
