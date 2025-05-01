import { ClockIcon, HomeIcon } from '@radix-ui/react-icons';
import { Box, ContextMenu, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { useCallback } from 'react';
import { TripViewMode } from '../Trip/TripViewMode';
import { dangerToken } from '../ui';
import s from './Accommodation.module.css';
import { AccommodationDeleteDialog } from './AccommodationDeleteDialog';
import { AccommodationDisplayTimeMode } from './AccommodationDisplayTimeMode';
import { AccommodationEditDialog } from './AccommodationEditDialog';
import { AccommodationViewDialog } from './AccommodationViewDialog';
import type { DbAccommodationWithTrip } from './db';
import { formatTime } from './time';

import type * as React from 'react';
import { useBoundStore } from '../data/store';
export function Accommodation({
  className,
  accommodation,
  tripViewMode,
  displayTimeMode,
  style,
}: {
  className?: string;
  accommodation: DbAccommodationWithTrip;
  tripViewMode: TripViewMode;
  displayTimeMode?: AccommodationDisplayTimeMode;
  style?: React.CSSProperties;
}) {
  const responsiveTextSize = { initial: '1' as const };
  const pushDialog = useBoundStore((state) => state.pushDialog);
  const openAccommodationViewDialog = useCallback(() => {
    pushDialog(AccommodationViewDialog, { accommodation });
  }, [accommodation, pushDialog]);
  const openAccommodationEditDialog = useCallback(() => {
    pushDialog(AccommodationEditDialog, { accommodation });
  }, [accommodation, pushDialog]);
  const openAccommodationDeleteDialog = useCallback(() => {
    pushDialog(AccommodationDeleteDialog, { accommodation });
  }, [accommodation, pushDialog]);

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Box
            p={{ initial: '1' }}
            as="div"
            // biome-ignore lint/a11y/useSemanticElements: <Box> need to be a <div>
            role="button"
            tabIndex={0}
            className={clsx(s.accommodation, className)}
            style={style}
            onClick={openAccommodationViewDialog}
          >
            <Text as="div" size={responsiveTextSize} weight="bold">
              <HomeIcon style={{ verticalAlign: '-3px' }} />{' '}
              {accommodation.name}
            </Text>
            {tripViewMode === TripViewMode.List &&
            (displayTimeMode === AccommodationDisplayTimeMode.CheckIn ||
              displayTimeMode === AccommodationDisplayTimeMode.CheckOut) ? (
              <>
                <Text as="div" size={responsiveTextSize} color="gray">
                  <ClockIcon style={{ verticalAlign: '-2px' }} />{' '}
                  {displayTimeMode}:{' '}
                  {formatTime(
                    displayTimeMode === AccommodationDisplayTimeMode.CheckIn
                      ? accommodation.timestampCheckIn
                      : accommodation.timestampCheckOut,
                    accommodation.trip.timeZone,
                  )}
                </Text>
              </>
            ) : null}
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>{accommodation.name}</ContextMenu.Label>
          <ContextMenu.Item onClick={openAccommodationViewDialog}>
            View
          </ContextMenu.Item>
          <ContextMenu.Item onClick={openAccommodationEditDialog}>
            Edit
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item
            color={dangerToken}
            onClick={openAccommodationDeleteDialog}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </>
  );
}
