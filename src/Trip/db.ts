import { id, TransactionChunk, lookup } from '@instantdb/core';
import { DateTime } from 'luxon';
import { DbActivityWithTrip, DbActivity } from '../Activity/db';
import { db } from '../data/db';
import { TripUserRole } from '../data/TripUserRole';
import { DbUser } from '../data/types';
import { DbAccommodation, DbAccommodationWithTrip } from '../Accommodation/db';

export type DbTripWithActivityAccommodation = Omit<
  DbTrip,
  'activity' | 'accommodation'
> & {
  accommodation: DbAccommodationWithTrip[];
  activity: DbActivityWithTrip[];
};

export type DbTripWithAccommodation = Omit<DbTrip, 'accommodation'> & {
  accommodation: DbAccommodationWithTrip[];
};
export type DbTripWithActivity = Omit<DbTrip, 'activity'> & {
  activity: DbActivityWithTrip[];
};
export type DbTrip = {
  id: string;
  title: string;
  /** ms of day of the trip start */
  timestampStart: number;
  /** ms of day _after_ of trip end. This means the final full day of trip is one day before `timestampEnd` */
  timestampEnd: number;
  timeZone: string;

  activity: DbActivity[] | undefined;
  accommodation: DbAccommodation[] | undefined;

  viewer: DbUser[] | undefined;
  editor: DbUser[] | undefined;
  owner: DbUser[] | undefined;
};

export async function dbAddTrip(
  newTrip: Omit<
    DbTrip,
    | 'id'
    | 'createdAt'
    | 'lastUpdatedAt'
    | 'activity'
    | 'user'
    | 'owner'
    | 'editor'
    | 'viewer'
  >,
  {
    userId,
  }: {
    userId: string;
  }
) {
  const newTripId = id();
  return {
    id: newTripId,
    result: await db.transact([
      db.tx.trip[newTripId]
        .update({
          ...newTrip,
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
        })
        .link({
          owner: [userId],
        }),
    ]),
  };
}
export async function dbUpdateTrip(
  trip: Omit<
    DbTrip,
    | 'createdAt'
    | 'lastUpdatedAt'
    | 'activity'
    | 'user'
    | 'owner'
    | 'editor'
    | 'viewer'
  >,
  {
    previousTimeZone,
    activities,
  }: {
    previousTimeZone: string;
    activities?: DbActivity[];
  }
) {
  const tripId = trip.id;

  const transactionTimestamp = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions: TransactionChunk<any, any>[] = [
    db.tx.trip[tripId].merge({
      ...trip,
      lastUpdatedAt: transactionTimestamp,
    }),
  ];

  if (previousTimeZone !== trip.timeZone && activities) {
    // Time zone changed, so need to migrate all activities to new time zone to "preserve" time relative to each day
    for (const activity of activities) {
      transactions.push(
        db.tx.activity[activity.id].merge({
          timestampStart: DateTime.fromMillis(activity.timestampStart, {
            zone: previousTimeZone,
          })
            .setZone(trip.timeZone, {
              keepLocalTime: true,
            })
            .toMillis(),
          timestampEnd: DateTime.fromMillis(activity.timestampEnd, {
            zone: previousTimeZone,
          })
            .setZone(trip.timeZone, {
              keepLocalTime: true,
            })
            .toMillis(),
          lastUpdatedAt: transactionTimestamp,
        })
      );
    }
  }

  return db.transact(transactions);
}
export async function dbDeleteTrip(trip: DbTripWithActivityAccommodation) {
  return db.transact([
    ...trip.activity.map((activity) => db.tx.activity[activity.id].delete()),
    ...trip.accommodation.map((accommodation) =>
      db.tx.accommodation[accommodation.id].delete()
    ),
    db.tx.trip[trip.id].delete(),
  ]);
}

export async function dbAddUserToTrip({
  tripId,
  userEmail,
  userRole,
}: {
  tripId: string;
  userEmail: string;
  userRole: TripUserRole;
}) {
  const lastUpdatedAt = Date.now();
  const transactions = [];

  const { data: userData } = await db.queryOnce({
    user: {
      $: {
        where: {
          email: userEmail,
        },
        limit: 1,
      },
    },
  });
  const user = userData.user[0] as
    | undefined
    | Omit<DbUser, 'tripEditor' | 'tripViewer' | 'tripOwner'>;

  let userId = user?.id;
  if (!userId) {
    // New user
    userId = id();
    const defaultHandle = userEmail.toLowerCase().replace(/[@.]/g, '_');
    transactions.push(
      db.tx.user[userId].update({
        handle: defaultHandle,
        email: userEmail,
        activated: false,
        createdAt: lastUpdatedAt,
        lastUpdatedAt: lastUpdatedAt,
      })
    );
  }

  transactions.push(
    db.tx.trip[tripId].link({
      [userRole]: userId,
    })
  );
  for (const role of [
    TripUserRole.Owner,
    TripUserRole.Editor,
    TripUserRole.Viewer,
  ]) {
    if (userRole === role) {
      continue;
    }

    transactions.push(
      db.tx.trip[tripId].unlink({
        [role]: userId,
      })
    );
  }

  return db.transact(transactions);
}
export async function dbUpdateUserFromTrip({
  tripId,
  userEmail,
  previousUserRole,
  userRole,
}: {
  tripId: string;
  userEmail: undefined | string;
  previousUserRole: TripUserRole;
  userRole: TripUserRole;
}) {
  return db.transact([
    db.tx.trip[tripId].unlink({
      [previousUserRole]: lookup('email', userEmail),
    }),
    db.tx.trip[tripId].link({
      [userRole]: lookup('email', userEmail),
    }),
  ]);
}
export async function dbRemoveUserFromTrip({
  tripId,
  userEmail,
  userRole,
}: {
  tripId: string;
  userEmail: undefined | string;
  userRole: TripUserRole;
}) {
  return db.transact(
    db.tx.trip[tripId].unlink({
      [userRole]: lookup('email', userEmail),
    })
  );
}
