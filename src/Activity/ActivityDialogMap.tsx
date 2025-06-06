import { Map as MapTilerMap, Marker } from '@maptiler/sdk';
import { useEffect, useRef, useState } from 'react';
import { MapStyle } from '../maptiler/style';
import s from './ActivityDialogMap.module.css';
import '@maptiler/sdk/style.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';
import { ThemeAppearance } from '../theme/constants';
import { useTheme } from '../theme/hooks';

const routeLineLayerId = 'Route Line' as const;
const routeArrowLayerId = 'Route Line Arrow' as const;
const routeSourceId = 'route' as const;

export function ActivityMap({
  mapOptions,
  marker,
  markerDestination,
  setMarkerCoordinate,
  setMapZoom,
}: {
  mapOptions: { lng: number; lat: number; zoom?: number; region?: string };
  marker?: { lng: number; lat: number };
  markerDestination?: { lng: number; lat: number };
  setMarkerCoordinate?: (coordinate: { lng: number; lat: number }) => void;
  setMapZoom?: (zoom: number) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapTilerMap>(null);
  const theme = useTheme();
  const mapMarker = useRef<Marker | null>(null);
  const mapMarkerDestination = useRef<Marker | null>(null);
  const [initialValues] = useState({
    mapOptions,
    marker,
    markerDestination,
  });

  useEffect(() => {
    // This hook should only run once during the component mount and unmount!
    if (map.current) return;
    if (!mapContainer.current) return;

    const bounds =
      initialValues.marker && initialValues.markerDestination
        ? ([
            Math.min(
              initialValues.marker.lng,
              initialValues.markerDestination.lng,
            ), // west
            Math.min(
              initialValues.marker.lat,
              initialValues.markerDestination.lat,
            ), // south
            Math.max(
              initialValues.marker.lng,
              initialValues.markerDestination.lng,
            ), // east
            Math.max(
              initialValues.marker.lat,
              initialValues.markerDestination.lat,
            ), // north
          ] as [number, number, number, number])
        : undefined;

    map.current = new MapTilerMap({
      container: mapContainer.current,
      style:
        theme === ThemeAppearance.Dark
          ? MapStyle.OPENSTREETMAP_DARK
          : MapStyle.OPENSTREETMAP,
      center: [initialValues.mapOptions.lng, initialValues.mapOptions.lat],
      zoom: initialValues.mapOptions.zoom,
      bounds,
      fitBoundsOptions: {
        padding: 50,
      },
      apiKey: process.env.MAPTILER_API_KEY,
      logoPosition: 'bottom-right',
    });

    map.current.on('zoomend', () => {
      if (!map.current) return;
      const zoom = map.current.getZoom();
      console.log('ActivityDialogMap zoomend', zoom);
      if (setMapZoom) {
        setMapZoom(zoom);
      }
    });

    // Add line layer to connect origin and destination
    const addLineLayer = () => {
      if (
        !map.current ||
        !initialValues.marker ||
        !initialValues.markerDestination
      )
        return;

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
          type: 'Feature' as const,
          properties: {
            class: 'primary',
            layer: 100,
          },
          // TODO: possible to add arrow head?
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [initialValues.marker.lng, initialValues.marker.lat],
              [
                initialValues.markerDestination.lng,
                initialValues.markerDestination.lat,
              ],
            ],
          },
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

    // Add the line layer after map is loaded
    if (initialValues.marker && initialValues.markerDestination) {
      map.current.on('load', addLineLayer);
      // If map is already loaded, add immediately
      if (map.current.isStyleLoaded()) {
        addLineLayer();
      }
    }

    return () => {
      if (map.current) {
        if (map.current.getLayer(routeArrowLayerId)) {
          map.current.removeLayer(routeArrowLayerId);
        }
        if (map.current.getLayer(routeLineLayerId)) {
          map.current.removeLayer(routeLineLayerId);
        }
        if (map.current.getSource(routeSourceId)) {
          map.current.removeSource(routeSourceId);
        }
        map.current.remove();
        map.current = null;
      }
      if (mapMarker.current) {
        mapMarker.current.remove();
      }
      if (mapMarkerDestination.current) {
        mapMarkerDestination.current.remove();
      }
    };
  }, [setMapZoom, theme, initialValues]);

  useEffect(() => {
    if (!map.current || !marker) return;
    mapMarker.current = new Marker({
      color: 'var(--accent-indicator)',
      draggable: !!setMarkerCoordinate,
    });
    mapMarker.current
      .setLngLat([marker.lng, marker.lat])
      .addTo(map.current)
      .on('dragend', (event: { type: 'dragend'; target: Marker }) => {
        if (!map.current) return;
        const { lng, lat } = event.target.getLngLat();
        console.log('ActivityDialogMap dragend', { lng, lat });
        if (setMarkerCoordinate) {
          setMarkerCoordinate({ lng, lat });
        }
      });
  });

  useEffect(() => {
    if (!map.current || !markerDestination) return;
    mapMarkerDestination.current = new Marker({
      color: 'var(--accent-indicator)',
    });
    mapMarkerDestination.current
      .setLngLat([markerDestination.lng, markerDestination.lat])
      .addTo(map.current);
  }, [markerDestination]);

  useEffect(() => {
    if (!map.current || !setMarkerCoordinate) return;

    const gc = new GeocodingControl({
      limit: 5,
      country: mapOptions?.region?.toLowerCase(),
      proximity: [{ type: 'map-center' }],
      types: ['poi'],
      marker: false,
    });
    gc.on('pick', ({ feature }) => {
      if (!map.current) return;
      console.log('ActivityDialogMap geocoding pick', feature);
      if (feature?.center) {
        const [lng, lat] = feature.center;
        mapMarker.current?.setLngLat([lng, lat]);
        setMarkerCoordinate({ lng, lat });
      }
    });
    map.current.addControl(gc);
  }, [setMarkerCoordinate, mapOptions?.region]);

  useEffect(() => {
    if (!map.current) return;
    if (theme === ThemeAppearance.Dark) {
      map.current.setStyle(MapStyle.OPENSTREETMAP_DARK);
    } else if (theme === ThemeAppearance.Light) {
      map.current.setStyle(MapStyle.OPENSTREETMAP);
    }
  }, [theme]);

  useEffect(() => {
    if (!map.current) return;
    if (mapOptions.zoom == null) return;
    map.current.setZoom(mapOptions.zoom);
  }, [mapOptions.zoom]);

  return (
    <div className={s.mapWrapper}>
      <div ref={mapContainer} className={s.map} />
    </div>
  );
}
