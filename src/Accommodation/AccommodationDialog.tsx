import { createDialogRoute } from '../Dialog/DialogRoute';
import { useDeepBoundStore } from '../data/store';
import type { TripSliceAccommodation } from '../Trip/store/types';
import { AccommodationDialogContentDelete } from './AccommodationDialogContentDelete';
import { AccommodationDialogContentEdit } from './AccommodationDialogContentEdit';
import { AccommodationDialogContentView } from './AccommodationDialogContentView';

export const AccommodationDialog = createDialogRoute<TripSliceAccommodation>({
  DialogContentView: AccommodationDialogContentView,
  DialogContentEdit: AccommodationDialogContentEdit,
  DialogContentDelete: AccommodationDialogContentDelete,
  // TODO: How to determine if accommodation is loading, when the data is fetched together with the trip?
  // in this case, I cannot determine if the accommodation is loading at trip level
  // because I don't know the id of the accommodation.
  // Here I cannot know the id of the trip either...
  // Maybe we should split the fetching part...
  // but that would make the data fetching quite annoying due to waterfall
  getData: (id) => useDeepBoundStore((state) => state.getAccommodation(id)),
  getDataMeta: (id) => {
    const accommodation = useDeepBoundStore((state) =>
      state.getAccommodation(id),
    );
    return {
      loading: accommodation === undefined,
      error: undefined,
    };
  },
});
