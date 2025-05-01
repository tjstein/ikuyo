import { Dialog, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import type { DbTrip } from '../Trip/db';
import { useBoundStore } from '../data/store';
import { MacroplanForm } from './MacroplanForm';
import { MacroplanFormMode } from './MacroplanFormMode';
import { formatToDateInput } from './time';

export function MacroplanNewDialog({
  trip,
}: {
  trip: DbTrip;
}) {
  const popDialog = useBoundStore((state) => state.popDialog);
  const tripStartStr = formatToDateInput(
    DateTime.fromMillis(trip.timestampStart).setZone(trip.timeZone),
  );
  const tripEndStr = formatToDateInput(
    DateTime.fromMillis(trip.timestampEnd)
      .setZone(trip.timeZone)
      .minus({ minute: 1 }),
  );

  const [macroplanCheckInStr, macroplanCheckOutStr] = useMemo(() => {
    return [
      formatToDateInput(
        DateTime.fromMillis(trip.timestampStart)
          .setZone(trip.timeZone)
          // Usually check-in is 3pm of the first day
          .plus({ hour: 15 }),
      ),
      formatToDateInput(
        DateTime.fromMillis(trip.timestampEnd)
          .setZone(trip.timeZone)
          .minus({
            day: 1,
          })
          // Usually check-out is 11am of the last day
          .plus({ hour: 11 }),
      ),
    ];
  }, [trip]);

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
        <Dialog.Title>New Day Plan</Dialog.Title>
        <Dialog.Description>
          <Text as="p">
            Day plan is a high-level plan to organize your trip into multiple
            segments.
          </Text>
          <Text size="1" as="p">
            For example, you can divide a trip by location:
            <ul>
              <li>Day 1-3: Tokyo</li>
              <li>Day 4-6: Kyoto</li>
              <li>Day 7-9: Osaka</li>
            </ul>
          </Text>
        </Dialog.Description>
        <MacroplanForm
          mode={MacroplanFormMode.New}
          tripId={trip.id}
          tripTimeZone={trip.timeZone}
          tripStartStr={tripStartStr}
          tripEndStr={tripEndStr}
          macroplanName=""
          macroplanDateStartStr={macroplanCheckInStr}
          macroplanDateEndStr={macroplanCheckOutStr}
          macroplanNotes=""
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
