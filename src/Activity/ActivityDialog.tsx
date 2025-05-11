import { createDialogRoute } from '../Dialog/DialogRoute';
import { useBoundStore } from '../data/store';
import { ActivityDialogContentDelete } from './ActivityDialogContentDelete';
import { ActivityDialogContentEdit } from './ActivityDialogContentEdit';
import { ActivityDialogContentView } from './ActivityDialogContentView';
import type { DbActivityWithTrip } from './db';

export const ActivityDialog = createDialogRoute<DbActivityWithTrip>({
  DialogContentView: ActivityDialogContentView,
  DialogContentEdit: ActivityDialogContentEdit,
  DialogContentDelete: ActivityDialogContentDelete,
  getData: (id) => useBoundStore((state) => state.getActivity(id)),
});
