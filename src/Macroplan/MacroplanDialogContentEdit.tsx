import { Box, Dialog } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import {
  MacroplanDialogMode,
  type MacroplanDialogModeType,
} from './MacroplanDialogMode';
import { MacroplanForm } from './MacroplanForm';
import { MacroplanFormMode } from './MacroplanFormMode';
import type { DbMacroplanWithTrip } from './db';
import { formatToDateInput } from './time';

export function MacroplanDialogContentEdit({
  macroplan,
  setMode,
}: {
  macroplan: DbMacroplanWithTrip;
  setMode: (mode: MacroplanDialogModeType) => void;
}) {
  const popDialog = useBoundStore((state) => state.popDialog);
  const tripStartStr = formatToDateInput(
    DateTime.fromMillis(macroplan.trip.timestampStart).setZone(
      macroplan.trip.timeZone,
    ),
  );
  const tripEndStr = formatToDateInput(
    DateTime.fromMillis(macroplan.trip.timestampEnd)
      .setZone(macroplan.trip.timeZone)
      .minus({ minute: 1 }),
  );

  const macroplanDateStartStr = formatToDateInput(
    DateTime.fromMillis(macroplan.timestampStart).setZone(
      macroplan.trip.timeZone,
    ),
  );
  const macroplanDateEndStr = formatToDateInput(
    DateTime.fromMillis(macroplan.timestampEnd)
      .setZone(macroplan.trip.timeZone)
      .minus({ minute: 1 }),
  );
  const backToViewMode = useCallback(() => {
    setMode(MacroplanDialogMode.View);
  }, [setMode]);

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          popDialog();
        }
      }}
    >
      <Dialog.Content maxWidth={CommonDialogMaxWidth}>
        <Dialog.Title>Edit Day Plan</Dialog.Title>
        <Dialog.Description>
          Fill in the edited day plan details for this trip...
        </Dialog.Description>
        <Box height="16px" />
        <MacroplanForm
          mode={MacroplanFormMode.Edit}
          tripId={macroplan.trip.id}
          macroplanId={macroplan.id}
          tripTimeZone={macroplan.trip.timeZone}
          tripStartStr={tripStartStr}
          tripEndStr={tripEndStr}
          macroplanName={macroplan.name}
          macroplanDateStartStr={macroplanDateStartStr}
          macroplanDateEndStr={macroplanDateEndStr}
          macroplanNotes={macroplan.notes}
          onFormCancel={backToViewMode}
          onFormSuccess={backToViewMode}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
