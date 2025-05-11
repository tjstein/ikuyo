import { Box, Dialog, Spinner } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import type { DialogContentProps } from '../Dialog/DialogRoute';
import { AccommodationDialogMode } from './AccommodationDialogMode';
import { AccommodationForm } from './AccommodationForm';
import { AccommodationFormMode } from './AccommodationFormMode';
import type { DbAccommodationWithTrip } from './db';
import { formatToDatetimeLocalInput } from './time';

export function AccommodationDialogContentEdit({
  data: accommodation,
  setMode,
  dialogContentProps,
}: DialogContentProps<DbAccommodationWithTrip>) {
  const tripStartStr = accommodation
    ? formatToDatetimeLocalInput(
        DateTime.fromMillis(accommodation.trip.timestampStart).setZone(
          accommodation.trip.timeZone,
        ),
      )
    : '';
  const tripEndStr = accommodation
    ? formatToDatetimeLocalInput(
        DateTime.fromMillis(accommodation.trip.timestampEnd)
          .setZone(accommodation.trip.timeZone)
          .minus({ minute: 1 }),
      )
    : '';

  const accommodationCheckInStr = accommodation
    ? formatToDatetimeLocalInput(
        DateTime.fromMillis(accommodation.timestampCheckIn).setZone(
          accommodation.trip.timeZone,
        ),
      )
    : '';
  const accommodationCheckOutStr = accommodation
    ? formatToDatetimeLocalInput(
        DateTime.fromMillis(accommodation.timestampCheckOut).setZone(
          accommodation.trip.timeZone,
        ),
      )
    : '';
  const backToViewMode = useCallback(() => {
    setMode(AccommodationDialogMode.View);
  }, [setMode]);

  return (
    <Dialog.Content {...dialogContentProps}>
      <Dialog.Title>Edit Accommodation</Dialog.Title>
      <Dialog.Description>
        Fill in the edited accommodation details for this trip...
      </Dialog.Description>
      <Box height="16px" />
      {accommodation ? (
        <AccommodationForm
          mode={AccommodationFormMode.Edit}
          tripId={accommodation.trip.id}
          accommodationId={accommodation.id}
          tripTimeZone={accommodation.trip.timeZone}
          tripStartStr={tripStartStr}
          tripEndStr={tripEndStr}
          accommodationName={accommodation.name}
          accommodationAddress={accommodation.address}
          accommodationCheckInStr={accommodationCheckInStr}
          accommodationCheckOutStr={accommodationCheckOutStr}
          accommodationPhoneNumber={accommodation.phoneNumber}
          accommodationNotes={accommodation.notes}
          onFormCancel={backToViewMode}
          onFormSuccess={backToViewMode}
        />
      ) : (
        <Spinner />
      )}
    </Dialog.Content>
  );
}
