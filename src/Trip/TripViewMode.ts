import { useCallback, useState } from 'react';

export enum TripViewMode {
  Timetable = 'Timetable',
  List = 'List',
}

const TripViewModeStorageKey = 'ikuyo:trip-view-mode';

function getTripViewModeFromStorage(): TripViewMode {
  try {
    const fromStorage = globalThis.localStorage.getItem(TripViewModeStorageKey);
    if (
      fromStorage === TripViewMode.List ||
      fromStorage === TripViewMode.Timetable
    ) {
      return fromStorage;
    }
    return TripViewMode.Timetable;
  } catch {
    return TripViewMode.Timetable;
  }
}

function setTripViewModeToStorage(value: TripViewMode) {
  try {
    globalThis.localStorage.setItem(TripViewModeStorageKey, value);
  } catch {
    // no-op
  }
}

export function useTripViewMode(): [
  TripViewMode,
  (newValue: TripViewMode) => void
] {
  const [tripViewMode, setTripViewModeState] = useState(
    getTripViewModeFromStorage
  );
  const setTripViewMode = useCallback(
    (newValue: TripViewMode) => {
      setTripViewModeState(newValue);
      setTripViewModeToStorage(newValue);
    },
    [setTripViewModeState]
  );

  return [tripViewMode, setTripViewMode];
}
