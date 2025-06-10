import { Box } from '@radix-ui/themes';
import { TripMap } from './TripMap';
import s from './TripMap.module.css';

export function PageTripMap() {
  return (
    <Box className={s.pageMapWrapper}>
      <TripMap useCase="map" />
    </Box>
  );
}
