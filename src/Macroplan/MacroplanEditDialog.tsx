import { Box, Dialog } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useBoundStore } from '../data/store';
import { CommonDialogMaxWidth } from '../dialog';
import { MacroplanForm } from './MacroplanForm';
import { MacroplanFormMode } from './MacroplanFormMode';
import type { DbMacroplanWithTrip } from './db';
import { formatToDateInput } from './time';

export function MacroplanEditDialog({
  macroplan,
}: {
  macroplan: DbMacroplanWithTrip;
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
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
