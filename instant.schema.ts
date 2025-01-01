// Ikuyo
// https://instantdb.com/dash?s=main&t=home&app=6962735b-d61f-4c3c-a78f-03ca3fa6ba9a

import { i } from '@instantdb/react';

const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
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
    trip: i.entity({
      createdAt: i.number(),
      lastUpdatedAt: i.number(),
      timestampEnd: i.number(),
      timestampStart: i.number(),
      timeZone: i.string(),
      title: i.string(),
    }),
    user: i.entity({
      activated: i.boolean(),
      createdAt: i.number(),
      email: i.string().unique().indexed(),
      handle: i.string().unique().indexed(),
      lastUpdatedAt: i.number(),
    }),
    accomodation: i.entity({
      name: i.string(),
      createdAt: i.number(),
      address: i.string(),
      timestampCheckIn: i.number(),
      timestampCheckOut: i.number(),
      lastUpdatedAt: i.number(),
      phoneNumber: i.string(),
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
    tripEditor: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'editor',
      },
      reverse: {
        on: 'user',
        has: 'many',
        label: 'tripEditor',
      },
    },
    tripOwner: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'owner',
      },
      reverse: {
        on: 'user',
        has: 'many',
        label: 'tripOwner',
      },
    },
    tripUser: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'user',
      },
      reverse: {
        on: 'user',
        has: 'many',
        label: 'trip',
      },
    },
    tripViewer: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'viewer',
      },
      reverse: {
        on: 'user',
        has: 'many',
        label: 'tripViewer',
      },
    },
    tripAccomodation: {
      forward: {
        on: 'trip',
        has: 'many',
        label: 'accomodation',
      },
      reverse: {
        on: 'accomodation',
        has: 'one',
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
  },
});

export default schema;
