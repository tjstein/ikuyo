import type { StateCreator } from 'zustand';
import type { DbAccommodationWithTrip } from '../Accommodation/db';
import type { DbActivityWithTrip } from '../Activity/db';
import {
  COMMENT_GROUP_OBJECT_TYPE,
  type DbCommentGroup,
  type DbCommentGroupObjectType,
} from '../Comment/db';
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
  commentGroup: {
    accommodation: {
      [id: string]: DbCommentGroup<'accommodation'>;
    };
    activity: {
      [id: string]: DbCommentGroup<'activity'>;
    };
    macroplan: {
      [id: string]: DbCommentGroup<'macroplan'>;
    };
    trip: {
      [id: string]: DbCommentGroup<'trip'>;
    };
    expense: {
      [id: string]: DbCommentGroup<'expense'>;
    };
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
    commentGroup: {
      trip: {},
      accommodation: {},
      activity: {},
      macroplan: {},
      expense: {},
    },
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
        const newCommentGroup = {
          trip: { ...state.commentGroup.trip },
          accommodation: { ...state.commentGroup.accommodation },
          activity: { ...state.commentGroup.activity },
          macroplan: { ...state.commentGroup.macroplan },
          expense: { ...state.commentGroup.expense },
        };
        for (const commentGroup of trip.commentGroup) {
          if (commentGroup.object?.type === COMMENT_GROUP_OBJECT_TYPE.TRIP) {
            newCommentGroup.trip[commentGroup.id] =
              commentGroup as DbCommentGroup<'trip'>;
          } else if (
            commentGroup.object?.type ===
            COMMENT_GROUP_OBJECT_TYPE.ACCOMMODATION
          ) {
            newCommentGroup.accommodation[commentGroup.id] =
              commentGroup as DbCommentGroup<'accommodation'>;
          } else if (
            commentGroup.object?.type === COMMENT_GROUP_OBJECT_TYPE.ACTIVITY
          ) {
            newCommentGroup.activity[commentGroup.id] =
              commentGroup as DbCommentGroup<'activity'>;
          } else if (
            commentGroup.object?.type === COMMENT_GROUP_OBJECT_TYPE.MACROPLAN
          ) {
            newCommentGroup.macroplan[commentGroup.id] =
              commentGroup as DbCommentGroup<'macroplan'>;
          } else if (
            commentGroup.object?.type === COMMENT_GROUP_OBJECT_TYPE.EXPENSE
          ) {
            newCommentGroup.expense[commentGroup.id] =
              commentGroup as DbCommentGroup<'expense'>;
          }
        }

        return {
          trip: {
            ...state.trip,
            [trip.id]: trip,
          },
          accommodation: newAccommodationState,
          activity: newActivityState,
          macroplan: newMacroplanState,
          commentGroup: newCommentGroup,
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
    getCommentGroup: <ObjectType extends DbCommentGroupObjectType>(
      type: ObjectType,
      id: string,
    ): DbCommentGroup<ObjectType> | undefined => {
      const commentGroup = get().commentGroup;
      if (commentGroup[type][id]) {
        return commentGroup[type][id] as DbCommentGroup<ObjectType>;
      }
      return undefined;
    },
  };
};
