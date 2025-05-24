import { createDialogRoute } from '../Dialog/DialogRoute';
import { useDeepBoundStore } from '../data/store';
import type { TripSliceMacroplan } from '../Trip/store/types';
import { MacroplanDialogContentDelete } from './MacroplanDialogContentDelete';
import { MacroplanDialogContentEdit } from './MacroplanDialogContentEdit';
import { MacroplanDialogContentView } from './MacroplanDialogContentView';

export const MacroplanDialog = createDialogRoute<TripSliceMacroplan>({
  DialogContentView: MacroplanDialogContentView,
  DialogContentEdit: MacroplanDialogContentEdit,
  DialogContentDelete: MacroplanDialogContentDelete,
  // TODO: See AccommodationDialog.tsx on loading state issue
  getData: (id) => useDeepBoundStore((state) => state.getMacroplan(id)),
  getDataMeta: (id) => {
    const macroplan = useDeepBoundStore((state) => state.getMacroplan(id));
    return {
      loading: macroplan === undefined,
      error: undefined,
    };
  },
});
