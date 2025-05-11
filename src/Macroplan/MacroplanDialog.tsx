import { createDialogRoute } from '../Dialog/DialogRoute';
import { useBoundStore } from '../data/store';
import type { DbMacroplanWithTrip } from './db';
import { MacroplanDialogContentDelete } from './MacroplanDialogContentDelete';
import { MacroplanDialogContentEdit } from './MacroplanDialogContentEdit';
import { MacroplanDialogContentView } from './MacroplanDialogContentView';

export const MacroplanDialog = createDialogRoute<DbMacroplanWithTrip>({
  DialogContentView: MacroplanDialogContentView,
  DialogContentEdit: MacroplanDialogContentEdit,
  DialogContentDelete: MacroplanDialogContentDelete,
  getData: (id) => useBoundStore((state) => state.getMacroplan(id)),
});
