import {
  ClockIcon,
  InfoCircledIcon,
  SewingPinIcon,
} from '@radix-ui/react-icons';
import { Container, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useParseTextIntoNodes } from '../../common/text/parseTextIntoNodes';
import { useTrip, useTripAccommodation } from '../../Trip/store/hooks';

export function AccommodationPopup({
  accommodationId,
  className,
}: {
  accommodationId: string;
  className: string;
}) {
  const accommodation = useTripAccommodation(accommodationId);
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

  return (
    <Container>
      <Heading as="h3" size="2">
        {accommodation?.name}
      </Heading>
      <Text as="p" size="1">
        <ClockIcon style={{ verticalAlign: '-2px' }} />{' '}
        {accommodationCheckInStr} to {accommodationCheckOutStr}
      </Text>
      {accommodation?.address ? (
        <Text as="p" size="1">
          <SewingPinIcon style={{ verticalAlign: '-2px' }} />{' '}
          {accommodation.address}
        </Text>
      ) : null}
      {notes.length > 0 ? (
        <Text as="p" size="1" className={className}>
          <InfoCircledIcon style={{ verticalAlign: '-2px' }} /> {notes}
        </Text>
      ) : null}
    </Container>
  );
}
