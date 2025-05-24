import {
  Button,
  Dialog,
  Flex,
  Heading,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { CommentGroupWithForm } from '../Comment/CommentGroupWithForm';
import { COMMENT_GROUP_OBJECT_TYPE } from '../Comment/db';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import type { DialogContentProps } from '../Dialog/DialogRoute';
import { useDeepBoundStore } from '../data/store';
import { useTrip } from '../Trip/store/hooks';
import type { TripSliceAccommodation } from '../Trip/store/types';
import { AccommodationMap } from './AccommodationDialogMap';
import { AccommodationDialogMode } from './AccommodationDialogMode';

export function AccommodationDialogContentView({
  data: accommodation,
  setMode,
  dialogContentProps,
  setDialogClosable,
  DialogTitleSection,
  loading,
}: DialogContentProps<TripSliceAccommodation>) {
  const { trip } = useTrip(accommodation?.tripId);
  const accommodationCheckInStr =
    accommodation && trip
      ? DateTime.fromMillis(accommodation.timestampCheckIn)
          .setZone(trip.timeZone)
          .toFormat('dd LLLL yyyy HH:mm')
      : '';
  const accommodationCheckOutStr =
    accommodation && trip
      ? DateTime.fromMillis(accommodation.timestampCheckOut)
          .setZone(trip.timeZone)
          .toFormat('dd LLLL yyyy HH:mm')
      : '';
  const notes = useParseTextIntoNodes(accommodation?.notes);
  const currentUser = useDeepBoundStore((state) => state.currentUser);

  const goToEditMode = useCallback(() => {
    setMode(AccommodationDialogMode.Edit);
  }, [setMode]);
  const goToDeleteMode = useCallback(() => {
    setMode(AccommodationDialogMode.Delete);
  }, [setMode]);
  const setDialogUnclosable = useCallback(() => {
    setDialogClosable(false);
  }, [setDialogClosable]);
  return (
    <Dialog.Content {...dialogContentProps}>
      <DialogTitleSection
        title={
          <>
            Accommodation:{' '}
            {accommodation?.name ?? <Skeleton>Hotel ABC</Skeleton>}
          </>
        }
      />
      <Flex
        gap="5"
        justify="between"
        direction={{ initial: 'column', md: 'row' }}
      >
        <Flex
          direction="column"
          gap="3"
          flexGrow="1"
          maxWidth={{ initial: '100%', md: '50%' }}
        >
          <Flex gap="3" mb="3" justify="start">
            <Button
              type="button"
              size="2"
              variant="soft"
              color="gray"
              onClick={goToEditMode}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="2"
              variant="soft"
              color="gray"
              onClick={goToDeleteMode}
            >
              Delete
            </Button>
          </Flex>
          <Dialog.Description size="2">
            Accommodation details
          </Dialog.Description>
          <Heading as="h2" size="4">
            Name
          </Heading>
          <Text>{accommodation?.name ?? <Skeleton>Hotel ABC</Skeleton>}</Text>
          <Heading as="h2" size="4">
            Check In
          </Heading>
          <Text>{accommodationCheckInStr}</Text>
          <Heading as="h2" size="4">
            Check Out
          </Heading>
          <Text>{accommodationCheckOutStr}</Text>

          {accommodation?.address ? (
            <>
              <Heading as="h2" size="4">
                Address
              </Heading>
              <Text>{accommodation.address}</Text>
            </>
          ) : (
            <></>
          )}
          {accommodation?.phoneNumber ? (
            <>
              <Heading as="h2" size="4">
                Phone Number
              </Heading>
              <Text>{accommodation.phoneNumber}</Text>
            </>
          ) : (
            <></>
          )}
          {accommodation?.notes ? (
            <>
              <Heading as="h2" size="4">
                Notes
              </Heading>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{notes}</Text>
            </>
          ) : (
            <></>
          )}

          {accommodation?.locationLat && accommodation?.locationLng ? (
            <AccommodationMap
              mapOptions={{
                lng: accommodation.locationLng,
                lat: accommodation.locationLat,
                zoom: accommodation.locationZoom ?? 9,
              }}
              marker={{
                lng: accommodation.locationLng,
                lat: accommodation.locationLat,
              }}
            />
          ) : null}
        </Flex>
        <Flex
          direction="column"
          gap="3"
          flexGrow="1"
          maxWidth={{ initial: '100%', md: '50%' }}
        >
          <Heading as="h2" size="4">
            Comments
          </Heading>
          <CommentGroupWithForm
            tripId={accommodation?.tripId}
            objectId={accommodation?.id}
            objectType={COMMENT_GROUP_OBJECT_TYPE.ACCOMMODATION}
            user={currentUser}
            onFormFocus={setDialogUnclosable}
            commentGroupId={accommodation?.commentGroupId}
            isLoading={loading}
          />
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
