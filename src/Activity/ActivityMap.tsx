import { MapStyle, Map as MapTilerMap, Marker } from '@maptiler/sdk';
import { useEffect, useRef } from 'react';
import s from './ActivityMap.module.css';
import '@maptiler/sdk/style.css';

export function ActivityMap({
  mapOptions,
  marker,
  setCoordinate,
}: {
  mapOptions: { lng: number; lat: number; zoom?: number };
  marker?: { lng: number; lat: number };
  setCoordinate?: (coordinate: { lng: number; lat: number }) => void;
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

    if (marker) {
      new Marker({
        color: 'var(--accent-indicator)',
        draggable: !!setCoordinate,
      })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current)
        .on('dragend', (event: { type: 'dragend'; target: Marker }) => {
          if (!map.current) return;
          const { lng, lat } = event.target.getLngLat();
          if (setCoordinate) {
            setCoordinate({ lng, lat });
          }
        });
    }
  }, [mapOptions, marker, setCoordinate]);

  return (
    <div className={s.mapWrapper}>
      <div ref={mapContainer} className={s.map} />
    </div>
  );
}
