import { Box, Dialog } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { ActivityForm } from './ActivityForm';
import { ActivityFormMode } from './ActivityFormMode';
import type { DbActivityWithTrip } from './db';
import { formatToDatetimeLocalInput } from './time';

export function ActivityEditDialog({
  activity,
}: {
  activity: DbActivityWithTrip;
}) {
  const tripStartStr = formatToDatetimeLocalInput(
    DateTime.fromMillis(activity.trip.timestampStart).setZone(
      activity.trip.timeZone,
    ),
  );
  const tripEndStr = formatToDatetimeLocalInput(
    DateTime.fromMillis(activity.trip.timestampEnd)
      .setZone(activity.trip.timeZone)
      .minus({ minute: 1 }),
  );
  const activityStartStr = formatToDatetimeLocalInput(
    DateTime.fromMillis(activity.timestampStart).setZone(
      activity.trip.timeZone,
    ),
  );
  const activityEndStr = formatToDatetimeLocalInput(
    DateTime.fromMillis(activity.timestampEnd).setZone(activity.trip.timeZone),
  );
  const popDialog = useBoundStore((state) => state.popDialog);
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
        <Dialog.Title>Edit Activity</Dialog.Title>
        <Dialog.Description>
          Fill in your edited activity details...
        </Dialog.Description>
        <Box height="16px" />
        <ActivityForm
          activityId={activity.id}
          mode={ActivityFormMode.Edit}
          tripStartStr={tripStartStr}
          tripEndStr={tripEndStr}
          tripTimeZone={activity.trip.timeZone}
          tripRegion={activity.trip.region}
          activityTitle={activity.title}
          activityStartStr={activityStartStr}
          activityEndStr={activityEndStr}
          activityLocationLat={activity.locationLat}
          activityLocationLng={activity.locationLng}
          activityLocationZoom={activity.locationZoom}
          activityLocation={activity.location}
          activityDescription={activity.description}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
