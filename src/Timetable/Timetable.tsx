import clsx from 'clsx';
import { Activity } from '../Activity/Activity';
import s from './Timetable.module.scss';
import { ContextMenu, Section, Text } from '@radix-ui/themes';

import { useMemo } from 'react';
import {
  dayEndMapping,
  dayStartMapping,
  timeColumnMapping,
} from './TimetableStyles';
import { DayGroups, groupActivitiesByDays } from '../Activity/eventGrouping';
import { TripViewMode } from '../Trip/TripViewMode';
import { pad2 } from './time';
import { ClockIcon, HomeIcon } from '@radix-ui/react-icons';
import {
  DbTripWithAccommodation,
  DbTripWithActivityAccommodation,
} from '../Trip/db';
import { Accommodation } from '../Accommodation/Accommodation';
import { DateTime } from 'luxon';
import { DbAccommodationWithTrip } from '../Accommodation/db';

const times = new Array(24).fill(0).map((_, i) => {
  return (
    <TimetableTime
      className={timeColumnMapping[i]}
      timeStart={`${pad2(i)}:00`}
      key={i}
    />
  );
});

export function Timetable({
  trip,
  setNewActivityDialogOpen,
}: {
  trip: DbTripWithActivityAccommodation;
  setNewActivityDialogOpen: (newValue: boolean) => void;
}) {
  const dayGroups = useMemo(() => groupActivitiesByDays(trip), [trip]);
  const acommodations = useMemo(() => getAccommodationIndexes(trip), [trip]);

  const timetableStyle = useMemo(() => {
    return {
      gridTemplateColumns: generateGridTemplateColumns(dayGroups),
    };
  }, [dayGroups]);

  return (
    <Section py="0">
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div className={s.timetable} style={timetableStyle}>
            <TimetableTimeHeader />

            {dayGroups.map((dayGroup, i) => {
              return (
                <TimetableDayHeader
                  className={clsx([
                    dayStartMapping[i + 1],
                    dayEndMapping[i + 1],
                  ])}
                  dateString={dayGroup.startDateTime.toFormat(
                    `ccc, dd LLL yyyy`
                  )}
                  key={dayGroup.startDateTime.toISODate()}
                />
              );
            })}

            <TimetableAccommodationHeader />

            {acommodations.map(({ accommodation, columnIndex }) => {
              return (
                <Accommodation
                  className={clsx([
                    dayStartMapping[columnIndex.start],
                    dayEndMapping[columnIndex.end],
                  ])}
                  key={accommodation.id}
                  accommodation={accommodation}
                  tripViewMode={TripViewMode.Timetable}
                />
              );
            })}

            {times}

            {dayGroups.map((dayGroup) => {
              return Object.values(dayGroup.activities).map((activity) => {
                const columnIndex = dayGroup.activityColumnIndexMap.get(
                  activity.id
                );
                return (
                  <Activity
                    key={activity.id}
                    className={s.timetableItem}
                    activity={activity}
                    columnIndex={columnIndex?.start ?? 1}
                    columnEndIndex={columnIndex?.end ?? 1}
                    tripViewMode={TripViewMode.Timetable}
                  />
                );
              });
            })}
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Label>{trip.title}</ContextMenu.Label>
          <ContextMenu.Item
            onClick={() => {
              setNewActivityDialogOpen(true);
            }}
          >
            New Activity
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </Section>
  );
}

function generateGridTemplateColumns(dayGroups: DayGroups): string {
  let str = `[time] 45px`;

  // Generate something like:
  // [d1 d1-c1]     360 / 1 fr
  // [de1 d2 d2-c1] 360 / 3 fr
  // [d2-c2]        360 / 3 fr
  // [d2-c3]        360 / 3 fr
  // [de2 d3 d3-c1] 360 / 1 fr
  // [de3 d4 d4-c1] 360 / 2 fr
  // [d4-c2]        360 / 2 fr
  // [de4]

  for (let dayIndex = 0; dayIndex < dayGroups.length; dayIndex++) {
    const dayGroup = dayGroups[dayIndex];
    const colWidth = `minmax(${String(120 / dayGroup.columns)}px,${String(
      360 / dayGroup.columns
    )}fr)`;
    for (let colIndex = 0; colIndex < dayGroup.columns; colIndex++) {
      const lineNames: string[] = [];
      if (dayIndex > 0) {
        lineNames.push(`de${String(dayIndex)}`);
      }
      if (colIndex === 0) {
        lineNames.push(`d${String(dayIndex + 1)}`);
      }
      lineNames.push(`d${String(dayIndex + 1)}-c${String(colIndex + 1)}`);

      str += ` [${lineNames.join(' ')}] ${colWidth}`;
    }
  }

  // Then add final "day end" line name
  str += ` [de${String(dayGroups.length)}]`;

  return str;
}

function TimetableDayHeader({
  className,
  dateString,
}: {
  className: string;
  dateString: string;
}) {
  return (
    <Text
      as="div"
      size={{ initial: '1', sm: '3' }}
      className={clsx(s.timetableColumn, className)}
    >
      {dateString}
    </Text>
  );
}

function TimetableAccommodationHeader() {
  return (
    <Text as="div" size="1" className={clsx(s.timetableAccommodationHeader)}>
      <HomeIcon />
    </Text>
  );
}
function TimetableTimeHeader() {
  return (
    <Text as="div" size="1" className={clsx(s.timetableTimeHeader)}>
      <ClockIcon />
    </Text>
  );
}
function TimetableTime({
  className,
  timeStart: time,
}: {
  className: string[];
  timeStart: string;
}) {
  return (
    <Text
      as="div"
      size={{ initial: '1', sm: '3' }}
      className={clsx(s.timetableTime, className)}
    >
      {time}
    </Text>
  );
}

function getAccommodationIndexes(trip: DbTripWithAccommodation) {
  const res: Array<{
    accommodation: DbAccommodationWithTrip;
    columnIndex: { start: number; end: number };
  }> = [];
  const tripStartDateTime = DateTime.fromMillis(trip.timestampStart).setZone(
    trip.timeZone
  );
  const tripEndDateTime = DateTime.fromMillis(trip.timestampEnd).setZone(
    trip.timeZone
  );
  const tripEndDay = tripEndDateTime.diff(tripStartDateTime, 'days').days;

  for (const accommodation of trip.accommodation) {
    const accommodationCheckInDateTime = DateTime.fromMillis(
      accommodation.timestampCheckIn
    ).setZone(trip.timeZone);
    const accommodationCheckInDay =
      accommodationCheckInDateTime
        .startOf('day')
        .diff(tripStartDateTime, 'days').days + 1;
    const accommodationCheckOutDateTime = DateTime.fromMillis(
      accommodation.timestampCheckOut
    ).setZone(trip.timeZone);
    const accommodationCheckOutDay =
      accommodationCheckOutDateTime
        .startOf('day')
        .diff(tripStartDateTime, 'days').days + 1;

    res.push({
      accommodation,
      columnIndex: {
        start: accommodationCheckInDay,
        end:
          // For accommodation that didn't end at the trip's final day, it is displayed until the day before check out. This is so that we won't display overlapping accommodation
          accommodationCheckOutDay === tripEndDay
            ? accommodationCheckOutDay
            : accommodationCheckOutDay - 1,
      },
    });
  }

  return res;
}
