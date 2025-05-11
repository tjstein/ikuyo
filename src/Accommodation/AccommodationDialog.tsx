import { createDialogRoute } from '../Dialog/DialogRoute';
import { useBoundStore } from '../data/store';
import { AccommodationDialogContentDelete } from './AccommodationDialogContentDelete';
import { AccommodationDialogContentEdit } from './AccommodationDialogContentEdit';
import { AccommodationDialogContentView } from './AccommodationDialogContentView';
import type { DbAccommodationWithTrip } from './db';

export const AccommodationDialog = createDialogRoute<DbAccommodationWithTrip>({
  DialogContentView: AccommodationDialogContentView,
  DialogContentEdit: AccommodationDialogContentEdit,
  DialogContentDelete: AccommodationDialogContentDelete,
  getData: (id) => useBoundStore((state) => state.getAccommodation(id)),
});
