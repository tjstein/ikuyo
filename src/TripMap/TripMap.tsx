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

const LocationType = {
  Activity: 'activity',
  ActivityDestination: 'activityDestination',
  Accommodation: 'accommodation',
} as const;

const routeLineLayerId = 'Route Line' as const;
const routeArrowLayerId = 'Route Line Arrow' as const;
const routeSourceId = 'route' as const;

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
    const locations: (
      | {
          type: typeof LocationType.Activity;
          id: string;
          lat: number;
          lng: number;
        }
      | {
          type: typeof LocationType.ActivityDestination;
          id: string;
          lat: number;
          lng: number;
        }
      | {
          type: typeof LocationType.Accommodation;
          id: string;
          lat: number;
          lng: number;
        }
    )[] = [];
    for (const activity of activitiesWithLocation) {
      if (activity.locationLat != null && activity.locationLng != null) {
        locations.push({
          type: LocationType.Activity,
          id: activity.id,
          lat: activity.locationLat,
          lng: activity.locationLng,
        });
      }
      if (
        activity.locationDestinationLat != null &&
        activity.locationDestinationLng != null
      ) {
        locations.push({
          type: LocationType.ActivityDestination,
          id: activity.id,
          lat: activity.locationDestinationLat,
          lng: activity.locationDestinationLng,
        });
      }
    }
    for (const accommodation of accommodationsWithLocation) {
      if (
        accommodation.locationLat != null &&
        accommodation.locationLng != null
      ) {
        locations.push({
          type: LocationType.Accommodation,
          id: accommodation.id,
          lat: accommodation.locationLat,
          lng: accommodation.locationLng,
        });
      }
    }
    return locations;
  }, [activitiesWithLocation, accommodationsWithLocation]);
  const allLines = useMemo(() => {
    const lines: {
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
    }[] = [];
    for (const activity of activitiesWithLocation) {
      if (
        activity.locationLat != null &&
        activity.locationLng != null &&
        activity.locationDestinationLat != null &&
        activity.locationDestinationLng != null
      ) {
        lines.push({
          from: {
            lat: activity.locationLat,
            lng: activity.locationLng,
          },
          to: {
            lat: activity.locationDestinationLat,
            lng: activity.locationDestinationLng,
          },
        });
      }
    }
    return lines;
  }, [activitiesWithLocation]);

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

    return {
      center: [lngCenter, latCenter] as [number, number],
      bounds: [
        [lngMinBuffer, latMinBuffer],
        [lngMaxBuffer, latMaxBuffer],
      ] as [[number, number], [number, number]],
    };
  }, [allLocations]);

  const [popupPortals, setPopupPortals] = useState<
    Array<
      | {
          type:
            | typeof LocationType.Activity
            | typeof LocationType.ActivityDestination;
          activityId: string;
          popup: HTMLDivElement;
        }
      | {
          type: typeof LocationType.Accommodation;
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
    console.log('TripMap init', { mapOptions });

    map.current = new MapTilerMap({
      container: mapContainer.current,
      style:
        theme === ThemeAppearance.Dark
          ? MapStyle.OPENSTREETMAP_DARK
          : MapStyle.OPENSTREETMAP,
      bounds: mapOptions ? mapOptions.bounds : undefined,
      center: mapOptions ? mapOptions.center : undefined,
      fitBoundsOptions: {
        padding: 20,
      },
      apiKey: process.env.MAPTILER_API_KEY,
      logoPosition: 'bottom-right',
    });

    // Add line layer to connect origin and destination
    const addLineLayer = () => {
      if (!map.current || !allLines.length) return;

      // Remove existing line soruce & layer if it exists
      if (map.current.getLayer(routeLineLayerId)) {
        map.current.removeLayer(routeLineLayerId);
      }
      if (map.current.getSource(routeSourceId)) {
        map.current.removeSource(routeSourceId);
      }
      // Add source and layer

      map.current.addSource(routeSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: allLines.map((line) =>
            createLineGeoJSON(
              { lng: line.from.lng, lat: line.from.lat },
              { lng: line.to.lng, lat: line.to.lat },
            ),
          ),
        },
      });

      map.current.addLayer({
        id: routeLineLayerId,
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'hsla(0, 100%, 60%, 0.9)',
          'line-width': 2,
          'line-dasharray': [2, 4],
        },
      });

      // Add arrow head at the destination
      map.current.addLayer({
        id: routeArrowLayerId,
        type: 'symbol',
        source: routeSourceId,
        layout: {
          'symbol-placement': 'line-center',
          'text-field': '▶',
          'text-size': 16,
          'text-rotate': 0,
          'text-rotation-alignment': 'map',
          'text-pitch-alignment': 'map',
        },
        paint: {
          'text-color': 'hsla(0, 100%, 60%, 0.9)',
        },
      });
    };
    map.current.on('load', addLineLayer);
    // If map is already loaded, add immediately
    if (map.current.isStyleLoaded()) {
      addLineLayer();
    }

    const newPopupPortals: typeof popupPortals = [];
    for (const location of allLocations) {
      const popupContent = document.createElement('div');
      const popup = new Popup({
        closeButton: false,
        closeOnClick: true,
        offset: 25,
        className: s.popup,
      }).setDOMContent(popupContent);

      if (location.type === LocationType.Accommodation) {
        newPopupPortals.push({
          type: LocationType.Accommodation,
          accommodationId: location.id,
          popup: popupContent,
        });
      } else if (
        location.type === LocationType.Activity ||
        location.type === LocationType.ActivityDestination
      ) {
        newPopupPortals.push({
          type: location.type,
          activityId: location.id,
          popup: popupContent,
        });
      }

      // Create custom marker element with different icons
      const markerElement = document.createElement('div');
      markerElement.style.width = '24px';
      markerElement.style.height = '24px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.display = 'flex';
      markerElement.style.alignItems = 'center';
      markerElement.style.justifyContent = 'center';
      markerElement.style.fontSize = '12px';
      markerElement.style.color = 'white';
      markerElement.style.cursor = 'pointer';
      markerElement.style.border = `1px solid var(--grey-9)`;
      markerElement.style.boxShadow = 'var(--shadow-2)';

      if (location.type === LocationType.Accommodation) {
        markerElement.style.backgroundColor = 'var(--accent-surface)';
        markerElement.innerHTML = '🏨';
      } else if (location.type === LocationType.Activity) {
        markerElement.style.backgroundColor = 'var(--accent-surface)';
        markerElement.innerHTML = '📍';
      } else if (location.type === LocationType.ActivityDestination) {
        markerElement.style.backgroundColor = 'var(--accent-surface)';
        markerElement.innerHTML = '🎯';
      }

      new Marker({
        element: markerElement,
        draggable: false,
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup) // Attach the popup to the marker
        .addTo(map.current);
    }

    setPopupPortals(newPopupPortals);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [allLocations, allLines, mapOptions, currentTripLoading, theme]);
  useEffect(() => {
    if (!map.current) return;
    if (theme === ThemeAppearance.Dark) {
      map.current.setStyle(MapStyle.OPENSTREETMAP_DARK);
    } else if (theme === ThemeAppearance.Light) {
      map.current.setStyle(MapStyle.OPENSTREETMAP);
    }
  }, [theme]);

  // TODO: Handle if locations are updated after map is initialized

  return (
    <div className={s.mapWrapper}>
      {currentTripLoading ? <Spinner size="3" m="3" /> : null}
      <div ref={mapContainer} className={s.map} />
      {popupPortals.map((popupPortal) => {
        switch (popupPortal.type) {
          case LocationType.Accommodation:
            return createPortal(
              <AccommodationPopup
                key={popupPortal.accommodationId}
                accommodationId={popupPortal.accommodationId}
              />,
              popupPortal.popup,
            );
          case LocationType.Activity:
          case LocationType.ActivityDestination:
            return createPortal(
              <ActivityPopup
                key={popupPortal.activityId}
                activityId={popupPortal.activityId}
                type={popupPortal.type}
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
function ActivityPopup({
  activityId,
  type,
}: {
  activityId: string;
  type: typeof LocationType.Activity | typeof LocationType.ActivityDestination;
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
        <Text as="p" size="1" className={s.description}>
          <InfoCircledIcon style={{ verticalAlign: '-2px' }} /> {description}
        </Text>
      ) : null}
    </Container>
  );
}

function createLineGeoJSON(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number },
) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ] as [number, number][],
    },
  };
}
