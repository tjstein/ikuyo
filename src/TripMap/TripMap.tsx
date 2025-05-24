import { Map as MapTilerMap, Marker, Popup } from '@maptiler/sdk';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapStyle } from '../maptiler/style';
import s from './TripMap.module.css';

import '@maptiler/sdk/style.css';
import {
  ClockIcon,
  InfoCircledIcon,
  SewingPinIcon,
} from '@radix-ui/react-icons';
import { Container, Heading, Spinner, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { createPortal } from 'react-dom';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import {
  useCurrentTrip,
  useTrip,
  useTripAccommodation,
  useTripAccommodations,
  useTripActivities,
  useTripActivity,
} from '../Trip/store/hooks';
import { ThemeAppearance } from '../theme/constants';
import { useTheme } from '../theme/hooks';
export function TripMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapTilerMap>(null);
  const { trip, loading: currentTripLoading } = useCurrentTrip();
  const activities = useTripActivities(trip?.activityIds ?? []);
  const accommodations = useTripAccommodations(trip?.accommodationIds ?? []);

  const activitiesWithLocation = useMemo(
    () =>
      activities.filter(
        (activity) =>
          activity.locationLat != null && activity.locationLng != null,
      ),
    [activities],
  );
  const accommodationsWithLocation = useMemo(
    () =>
      accommodations.filter(
        (accommodation) =>
          accommodation.locationLat != null &&
          accommodation.locationLng != null,
      ),
    [accommodations],
  );
  const allLocations = useMemo(() => {
    const locations = [];
    for (const activity of activitiesWithLocation) {
      if (activity.locationLat && activity.locationLng) {
        locations.push({
          type: 'activity' as const,
          id: activity.id,
          lat: activity.locationLat,
          lng: activity.locationLng,
        });
      }
    }
    for (const accommodation of accommodationsWithLocation) {
      if (accommodation.locationLat && accommodation.locationLng) {
        locations.push({
          type: 'accommodation' as const,
          id: accommodation.id,
          lat: accommodation.locationLat,
          lng: accommodation.locationLng,
        });
      }
    }
    return locations;
  }, [activitiesWithLocation, accommodationsWithLocation]);

  const mapOptions = useMemo(() => {
    if (allLocations.length === 0) {
      return undefined;
    }

    const latMin = Math.min(...allLocations.map((point) => point.lat));
    const latMax = Math.max(...allLocations.map((point) => point.lat));
    const lngMin = Math.min(...allLocations.map((point) => point.lng));
    const lngMax = Math.max(...allLocations.map((point) => point.lng));
    const latDiff = latMax - latMin;
    const lngDiff = lngMax - lngMin;
    const latBuffer = latDiff * 0.1;
    const lngBuffer = lngDiff * 0.1;
    const latMinBuffer = latMin - latBuffer;
    const latMaxBuffer = latMax + latBuffer;
    const lngMinBuffer = lngMin - lngBuffer;
    const lngMaxBuffer = lngMax + lngBuffer;
    const latDiffBuffer = latMaxBuffer - latMinBuffer;
    const lngDiffBuffer = lngMaxBuffer - lngMinBuffer;
    const latCenter = latMinBuffer + latDiffBuffer / 2;
    const lngCenter = lngMinBuffer + lngDiffBuffer / 2;
    const zoom = Math.max(7, Math.min(15, Math.log2(360 / lngDiffBuffer) + 1));

    return {
      center: [lngCenter, latCenter] as [number, number],
      zoom,
    };
  }, [allLocations]);

  const [popupPortals, setPopupPortals] = useState<
    Array<
      | {
          type: 'activity';
          activityId: string;
          popup: HTMLDivElement;
        }
      | {
          type: 'accommodation';
          accommodationId: string;
          popup: HTMLDivElement;
        }
    >
  >([]);
  const theme = useTheme();

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (currentTripLoading) return;

    map.current = new MapTilerMap({
      container: mapContainer.current,
      style:
        theme === ThemeAppearance.Dark
          ? MapStyle.OPENSTREETMAP_DARK
          : MapStyle.OPENSTREETMAP,
      zoom: mapOptions?.zoom,
      center: mapOptions ? mapOptions.center : undefined,
      apiKey: process.env.MAPTILER_API_KEY,
    });

    const newPopupPortals: typeof popupPortals = [];
    for (const location of allLocations) {
      const popupContent = document.createElement('div');
      const popup = new Popup({
        closeButton: false,
        closeOnClick: true,
        offset: 25,
        className: s.popup,
      }).setDOMContent(popupContent);

      if (location.type === 'accommodation') {
        newPopupPortals.push({
          type: 'accommodation',
          accommodationId: location.id,
          popup: popupContent,
        });
      } else if (location.type === 'activity') {
        newPopupPortals.push({
          type: 'activity',
          activityId: location.id,
          popup: popupContent,
        });
      }

      // Create and add marker with popup
      new Marker({
        color: 'var(--accent-indicator)',
        draggable: false,
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup) // Attach the popup to the marker
        .addTo(map.current);
    }

    setPopupPortals(newPopupPortals);
  }, [allLocations, mapOptions, currentTripLoading, theme]);
  useEffect(() => {
    if (!map.current) return;
    if (theme === ThemeAppearance.Dark) {
      map.current.setStyle(MapStyle.OPENSTREETMAP_DARK);
    } else if (theme === ThemeAppearance.Light) {
      map.current.setStyle(MapStyle.OPENSTREETMAP);
    }
  }, [theme]);

  return (
    <div className={s.mapWrapper}>
      {currentTripLoading ? <Spinner size="3" m="3" /> : null}
      <div ref={mapContainer} className={s.map} />
      {popupPortals.map((popupPortal) => {
        switch (popupPortal.type) {
          case 'accommodation':
            return createPortal(
              <AccommodationPopup
                key={popupPortal.accommodationId}
                accommodationId={popupPortal.accommodationId}
              />,
              popupPortal.popup,
            );
          case 'activity':
            return createPortal(
              <ActivityPopup
                key={popupPortal.activityId}
                activityId={popupPortal.activityId}
              />,
              popupPortal.popup,
            );
        }
      })}
    </div>
  );
}

function AccommodationPopup({ accommodationId }: { accommodationId: string }) {
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
        <Text as="p" size="1" className={s.description}>
          <InfoCircledIcon style={{ verticalAlign: '-2px' }} /> {notes}
        </Text>
      ) : null}
    </Container>
  );
}
function ActivityPopup({ activityId }: { activityId: string }) {
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
      {activity?.location ? (
        <Text as="p" size="1">
          <SewingPinIcon style={{ verticalAlign: '-2px' }} />{' '}
          {activity.location}
        </Text>
      ) : null}
      {description.length > 0 ? (
        <Text as="p" size="1" className={s.description}>
          <InfoCircledIcon style={{ verticalAlign: '-2px' }} /> {description}
        </Text>
      ) : null}
    </Container>
  );
}
