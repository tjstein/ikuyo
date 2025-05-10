import type { StateCreator } from 'zustand';
import type { DbAccommodationWithTrip } from '../Accommodation/db';
import type { DbActivityWithTrip } from '../Activity/db';
import type { BoundStoreType } from '../data/store';
import type { DbMacroplanWithTrip } from '../Macroplan/db';
import type { DbTrip, DbTripFull } from './db';

export interface TripSlice {
  trip: {
    [id: string]: DbTrip;
  };
  activity: {
    [id: string]: DbActivityWithTrip;
  };
  accommodation: {
    [id: string]: DbAccommodationWithTrip;
  };
  macroplan: {
    [id: string]: DbMacroplanWithTrip;
  };
  setTrip: (trip: DbTripFull) => void;

  getAccommodation: (id: string) => DbAccommodationWithTrip | undefined;
  getActivity: (id: string) => DbActivityWithTrip | undefined;
  getMacroplan: (id: string) => DbMacroplanWithTrip | undefined;
}

export const createTripSlice: StateCreator<
  BoundStoreType,
  [],
  [],
  TripSlice
> = (set, get) => {
  return {
    trip: {},
    accommodation: {},
    activity: {},
    macroplan: {},
    setTrip: (trip: DbTripFull) => {
      set((state) => {
        // NOTE: setTrip is kind of expensive, because it needs to set all the
        // accommodation, activity and macroplan in the state
        // so try to minimize calls to it

        console.log('setTrip', trip);
        const newAccommodationState = {
          ...state.accommodation,
        };
        const newActivityState = {
          ...state.activity,
        };
        const newMacroplanState = {
          ...state.macroplan,
        };
        for (const accommodation of trip.accommodation) {
          newAccommodationState[accommodation.id] = accommodation;
        }
        for (const activity of trip.activity) {
          newActivityState[activity.id] = activity;
        }
        for (const macroplan of trip.macroplan) {
          newMacroplanState[macroplan.id] = macroplan;
        }

        return {
          trip: {
            ...state.trip,
            [trip.id]: trip,
          },
          accommodation: newAccommodationState,
          activity: newActivityState,
          macroplan: newMacroplanState,
        };
      });
    },

    getAccommodation: (id: string): DbAccommodationWithTrip | undefined => {
      return get().accommodation[id];
    },
    getActivity: (id: string): DbActivityWithTrip | undefined => {
      return get().activity[id];
    },
    getMacroplan: (id: string): DbMacroplanWithTrip | undefined => {
      return get().macroplan[id];
    },
  };
};
