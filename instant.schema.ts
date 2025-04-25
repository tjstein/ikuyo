// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.any(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    accommodation: i.entity({
      address: i.string(),
      createdAt: i.number(),
      lastUpdatedAt: i.number(),
      name: i.string(),
      notes: i.string(),
      phoneNumber: i.string(),
      timestampCheckIn: i.number(),
      timestampCheckOut: i.number(),
    }),
    macroplan: i.entity({
      name: i.string(),
      notes: i.string(),
      timestampStart: i.number(),
      timestampEnd: i.number(),
      createdAt: i.number(),
      lastUpdatedAt: i.number(),
    }),
    activity: i.entity({
      createdAt: i.number(),
      description: i.string(),
      lastUpdatedAt: i.number(),
      location: i.string(),
      timestampEnd: i.number(),
      timestampStart: i.number(),
      title: i.string(),
    }),
    expense: i.entity({
      amount: i.number(),
      amountInDefaultCurrency: i.number(),
      amountInOriginCurrency: i.number(),
      createdAt: i.number(),
      currency: i.string(),
      currencyConversionFactor: i.number(),
      description: i.string(),
      lastUpdatedAt: i.number(),
      timestampIncurred: i.number(),
      title: i.string(),
    }),
    trip: i.entity({
      createdAt: i.number(),
      currency: i.string(),
      lastUpdatedAt: i.number(),
      originCurrency: i.string(),
      timestampEnd: i.number().indexed(),
      timestampStart: i.number(),
      timeZone: i.string(),
      title: i.string(),
    }),
    tripUser: i.entity({
      createdAt: i.number(),
      lastUpdatedAt: i.number(),
      role: i.string(),
    }),
    user: i.entity({
      activated: i.boolean(),
      createdAt: i.number(),
      email: i.string().unique().indexed(),
      handle: i.string().unique().indexed(),
      lastUpdatedAt: i.number(),
    }),
  },
  links: {
    activityTrip: {
      forward: {
        on: 'activity',
        has: 'one',
        label: 'trip',
      },
      reverse: {
        on: 'trip',
        has: 'many',
        label: 'activity',
      },
    },
    tripAccommodation: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'accommodation',
      },
      reverse: {
        on: 'accommodation',
        has: 'one',
        label: 'trip',
      },
    },
    tripMacroplan: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'macroplan',
      },
      reverse: {
        on: 'macroplan',
        has: 'one',
        label: 'trip',
      },
    },
    tripExpense: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'expense',
      },
      reverse: {
        on: 'expense',
        has: 'one',
        label: 'trip',
      },
    },
    tripTripUser: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'tripUser',
      },
      reverse: {
        on: 'tripUser',
        has: 'many',
        label: 'trip',
      },
    },
    user$users: {
      forward: {
        on: 'user',
        has: 'one',
        label: '$users',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'user',
      },
    },
    userTripUser: {
      forward: {
        on: 'user',
        has: 'many',
        label: 'tripUser',
      },
      reverse: {
        on: 'tripUser',
        has: 'many',
        label: 'user',
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
