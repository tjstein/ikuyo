import { MapStyle, Map as MapTilerMap, Marker } from '@maptiler/sdk';
import { useEffect, useRef } from 'react';
import s from './ActivityDialogMap.module.css';
import '@maptiler/sdk/style.css';

export function ActivityMap({
  mapOptions,
  marker,
  setMarkerCoordinate,
  setMapZoom,
}: {
  mapOptions: { lng: number; lat: number; zoom?: number };
  marker?: { lng: number; lat: number };
  setMarkerCoordinate?: (coordinate: {
    lng: number;
    lat: number;
  }) => void;
  setMapZoom?: (zoom: number) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapTilerMap>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new MapTilerMap({
      container: mapContainer.current,
      style: MapStyle.OPENSTREETMAP,
      center: [mapOptions.lng, mapOptions.lat],
      zoom: mapOptions.zoom,
    });

    map.current.on('zoomend', () => {
      if (!map.current) return;
      const zoom = map.current.getZoom();
      if (setMapZoom) {
        setMapZoom(zoom);
      }
    });

    if (marker) {
      new Marker({
        color: 'var(--accent-indicator)',
        draggable: !!setMarkerCoordinate,
      })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current)
        .on('dragend', (event: { type: 'dragend'; target: Marker }) => {
          if (!map.current) return;
          const { lng, lat } = event.target.getLngLat();
          if (setMarkerCoordinate) {
            setMarkerCoordinate({ lng, lat });
          }
        });
    }
  }, [mapOptions, marker, setMarkerCoordinate, setMapZoom]);

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
