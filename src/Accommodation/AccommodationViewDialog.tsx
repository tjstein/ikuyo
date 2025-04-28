import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';

import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import { CommonDialogMaxWidth } from '../dialog';
import s from './Accommodation.module.css';
import type { DbAccommodationWithTrip } from './db';

export function AccommodationViewDialog({
  accommodation,
  dialogOpen,
  setDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
}: {
  accommodation: DbAccommodationWithTrip;
  dialogOpen: boolean;
  setDialogOpen: (newValue: boolean) => void;
  setEditDialogOpen: (newValue: boolean) => void;
  setDeleteDialogOpen: (newValue: boolean) => void;
}) {
  const accommodationCheckInStr = DateTime.fromMillis(
    accommodation.timestampCheckIn,
  )
    .setZone(accommodation.trip.timeZone)
    .toFormat('dd LLLL yyyy HH:mm');
  const accommodationCheckOutStr = DateTime.fromMillis(
    accommodation.timestampCheckOut,
  )
    .setZone(accommodation.trip.timeZone)
    .toFormat('dd LLLL yyyy HH:mm');

  const notes = useParseTextIntoNodes(accommodation.notes);

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Content maxWidth={CommonDialogMaxWidth}>
        <Dialog.Title>View Accommodation</Dialog.Title>
        <Dialog.Description>Accommodation details</Dialog.Description>
        <Flex direction="column" gap="3" mt="3">
          <Heading as="h2" size="4">
            Name
          </Heading>
          <Text>{accommodation.name}</Text>
          <Heading as="h2" size="4">
            Check In
          </Heading>
          <Text>{accommodationCheckInStr}</Text>
          <Heading as="h2" size="4">
            Check Out
          </Heading>
          <Text>{accommodationCheckOutStr}</Text>

          {accommodation.address ? (
            <>
              <Heading as="h2" size="4">
                Address
              </Heading>
              <Text>{accommodation.address}</Text>
            </>
          ) : (
            <></>
          )}
          {accommodation.phoneNumber ? (
            <>
              <Heading as="h2" size="4">
                Phone Number
              </Heading>
              <Text>{accommodation.phoneNumber}</Text>
            </>
          ) : (
            <></>
          )}
          {accommodation.notes ? (
            <>
              <Heading as="h2" size="4">
                Notes
              </Heading>
              <Text className={s.activityDescription}>{notes}</Text>
            </>
          ) : (
            <></>
          )}
        </Flex>
        <Flex gap="3" mt="5" justify="end">
          <Button
            mr="auto"
            type="button"
            size="2"
            variant="soft"
            color="gray"
            onClick={() => {
              setDialogOpen(false);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </Button>
          <Button
            type="button"
            size="2"
            variant="soft"
            color="gray"
            onClick={() => {
              setDialogOpen(false);
              setEditDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Dialog.Close>
            <Button type="button" size="2">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
