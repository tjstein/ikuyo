import {
  ClockIcon,
  InfoCircledIcon,
  SewingPinIcon,
} from '@radix-ui/react-icons';
import { Container, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useParseTextIntoNodes } from '../../common/text/parseTextIntoNodes';
import { useTrip, useTripActivity } from '../../Trip/store/hooks';
import { LocationType } from '../constants';

export function ActivityPopup({
  activityId,
  type,
  className,
}: {
  activityId: string;
  type: typeof LocationType.Activity | typeof LocationType.ActivityDestination;
  className: string;
}) {
  const activity = useTripActivity(activityId);
  const { trip } = useTrip(activity?.tripId);
  const activityStartStr = activity
    ? DateTime.fromMillis(activity.timestampStart)
        .setZone(trip?.timeZone)
        .toFormat('dd LLLL yyyy HH:mm')
    : '';
  const activityEndStr = activity
    ? DateTime.fromMillis(activity.timestampEnd)
        .setZone(trip?.timeZone)
        // since 1 activity must be in same day, so might as well just show the time for end
        .toFormat('HH:mm')
    : '';
  const description = useParseTextIntoNodes(activity?.description);

  return (
    <Container>
      <Heading as="h3" size="2">
        {activity?.title}
      </Heading>
      <Text as="p" size="1">
        <ClockIcon style={{ verticalAlign: '-2px' }} /> {activityStartStr} to{' '}
        {activityEndStr}
      </Text>
      {type === LocationType.Activity ? (
        activity?.location ? (
          <Text as="p" size="1">
            <SewingPinIcon style={{ verticalAlign: '-2px' }} />{' '}
            <Text weight="bold">{activity.location}</Text>
            {activity.locationDestination ? (
              <>
                {' → '}
                {<Text color="gray">{activity.locationDestination}</Text>}
              </>
            ) : (
              ''
            )}
          </Text>
        ) : null
      ) : activity?.locationDestination ? (
        <Text as="p" size="1">
          <SewingPinIcon style={{ verticalAlign: '-2px' }} />{' '}
          {activity.location ? (
            <>
              {<Text color="gray">{activity.location}</Text>}
              {' → '}
            </>
          ) : (
            ''
          )}
          <Text weight="bold">{activity.locationDestination}</Text>
        </Text>
      ) : null}
      {description.length > 0 ? (
        <Text as="p" size="1" className={className}>
          <InfoCircledIcon style={{ verticalAlign: '-2px' }} /> {description}
        </Text>
      ) : null}
    </Container>
  );
}
