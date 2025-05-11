import { Box, Dialog, Spinner } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import type { DialogContentProps } from '../Dialog/DialogRoute';
import type { DbMacroplanWithTrip } from './db';
import { MacroplanDialogMode } from './MacroplanDialogMode';
import { MacroplanForm } from './MacroplanForm';
import { MacroplanFormMode } from './MacroplanFormMode';
import { formatToDateInput } from './time';

export function MacroplanDialogContentEdit({
  data: macroplan,
  setMode,
  dialogContentProps,
}: DialogContentProps<DbMacroplanWithTrip>) {
  const tripStartStr = macroplan
    ? formatToDateInput(
        DateTime.fromMillis(macroplan.trip.timestampStart).setZone(
          macroplan.trip.timeZone,
        ),
      )
    : '';
  const tripEndStr = macroplan
    ? formatToDateInput(
        DateTime.fromMillis(macroplan.trip.timestampEnd)
          .setZone(macroplan.trip.timeZone)
          .minus({ minute: 1 }),
      )
    : '';

  const macroplanDateStartStr = macroplan
    ? formatToDateInput(
        DateTime.fromMillis(macroplan.timestampStart).setZone(
          macroplan.trip.timeZone,
        ),
      )
    : '';
  const macroplanDateEndStr = macroplan
    ? formatToDateInput(
        DateTime.fromMillis(macroplan.timestampEnd)
          .setZone(macroplan.trip.timeZone)
          .minus({ minute: 1 }),
      )
    : '';
  const backToViewMode = useCallback(() => {
    setMode(MacroplanDialogMode.View);
  }, [setMode]);

  return (
    <Dialog.Content {...dialogContentProps}>
      <Dialog.Title>Edit Day Plan</Dialog.Title>
      <Dialog.Description>
        Fill in the edited day plan details for this trip...
      </Dialog.Description>
      <Box height="16px" />
      {macroplan ? (
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
      ) : (
        <Spinner />
      )}
    </Dialog.Content>
  );
}
