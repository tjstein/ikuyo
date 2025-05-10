import { Container, Heading, Skeleton, Spinner } from '@radix-ui/themes';
import React, { useEffect, useMemo, useRef } from 'react';
import { Redirect, Route, type RouteComponentProps, Switch } from 'wouter';
import { db } from '../data/db';
import { withLoading } from '../Loading/withLoading';
import { DocTitle } from '../Nav/DocTitle';
import { Navbar } from '../Nav/Navbar';
import s from './PageTrip.module.css';
import { TripMenu } from './TripMenu';

const Timetable = withLoading()(
  React.lazy(() =>
    import('../Timetable/Timetable').then((module) => {
      return { default: module.Timetable };
    }),
  ),
);
const ActivityList = withLoading()(
  React.lazy(() =>
    import('../ActivityList/ActivityList').then((module) => {
      return { default: module.ActivityList };
    }),
  ),
);
const ExpenseList = withLoading()(
  React.lazy(() =>
    import('../Expense/ExpenseList').then((module) => {
      return { default: module.ExpenseList };
    }),
  ),
);
const TripMap = withLoading()(
  React.lazy(() =>
    import('../TripMap/TripMap').then((module) => {
      return { default: module.TripMap };
    }),
  ),
);
const TripHome = withLoading()(
  React.lazy(() =>
    import('./TripHome').then((module) => {
      return { default: module.TripHome };
    }),
  ),
);

import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { shallow, useShallow } from 'zustand/shallow';
import type { DbAccommodationWithTrip } from '../Accommodation/db';
import type { DbActivityWithTrip } from '../Activity/db';
import { useBoundStore } from '../data/store';
import { TripUserRole } from '../data/TripUserRole';
import type { DbMacroplanWithTrip } from '../Macroplan/db';
import {
  RouteTripExpenses,
  RouteTripHome,
  RouteTripListView,
  RouteTripMap,
  RouteTripTimetableView,
} from '../Routes/routes';
import { TripContext } from './context';
import type { DbTrip, DbTripFull } from './db';
import { TripMenuFloating } from './TripMenuFloating';

export default PageTrip;
export function PageTrip({ params }: RouteComponentProps<{ id: string }>) {
  const { id: tripId } = params;
  const { trip, isLoading, error } = useStableRefTrip(tripId);

  return <PageTripInner trip={trip} isLoading={isLoading} error={error} />;
}

function PageTripInner({
  trip,
  isLoading,
  error,
}: {
  trip: DbTripFull | undefined;
  isLoading: boolean;
  error: { message: string } | undefined;
}) {
  const user = useBoundStore(useShallow((state) => state.currentUser));

  const currentUserIsOwner = useMemo(() => {
    for (const tripUser of trip?.tripUser ?? []) {
      if (
        user?.id === tripUser.user?.[0]?.id &&
        tripUser.role === TripUserRole.Owner
      ) {
        return true;
      }
    }
    return false;
  }, [trip, user]);
  return (
    <TripContext.Provider value={trip}>
      <DocTitle title={trip?.title ?? 'Trip'} />
      <Navbar
        leftItems={[
          <Heading
            as="h1"
            size={{ initial: '3', xs: '5' }}
            className={s.tripTitle}
            key="title"
          >
            {trip?.title ?? <Skeleton>Trip title</Skeleton>}
            {
              <Switch>
                <Route path={RouteTripTimetableView.routePath}>
                  {' '}
                  <DoubleArrowRightIcon /> Timetable
                </Route>
                <Route path={RouteTripListView.routePath}>
                  {' '}
                  <DoubleArrowRightIcon />
                  List
                </Route>
                <Route path={RouteTripMap.routePath}>
                  {' '}
                  <DoubleArrowRightIcon />
                  Map
                </Route>
                <Route path={RouteTripExpenses.routePath}>
                  {' '}
                  <DoubleArrowRightIcon /> Expenses
                </Route>
              </Switch>
            }
          </Heading>,
        ]}
        rightItems={[
          <TripMenu
            key="menu"
            user={user}
            trip={trip}
            showTripSharing={currentUserIsOwner}
          />,
        ]}
      />
      <Container>
        {trip ? (
          <Switch>
            <Route
              path={RouteTripTimetableView.routePath}
              component={Timetable}
              nest
            />
            <Route
              path={RouteTripListView.routePath}
              component={ActivityList}
              nest
            />
            <Route path={RouteTripMap.routePath} component={TripMap} />
            <Route path={RouteTripExpenses.routePath} component={ExpenseList} />
            <Route path={RouteTripHome.routePath} component={TripHome} />
            <Redirect replace to={RouteTripHome.routePath} />
          </Switch>
        ) : isLoading ? (
          <Spinner m="3" />
        ) : error ? (
          `Error: ${error.message}`
        ) : (
          ''
        )}
      </Container>
      <TripMenuFloating />
    </TripContext.Provider>
  );
}
function useStableRefTrip(tripId: string): {
  trip: DbTripFull | undefined;
  isLoading: boolean;
  error: { message: string } | undefined;
} {
  const { isLoading, error, data } = db.useQuery({
    trip: {
      $: {
        where: {
          id: tripId,
        },
      },
      activity: {},
      accommodation: {},
      macroplan: {},
      tripUser: {
        user: {},
      },
    },
  });
  const rawTrip = data?.trip[0] as DbTrip | undefined;
  // Avoid re-render of trip object
  // Only re-render if trip, trip.activity, trip.accommodation, trip.macroplan is different
  const tripRef = useRef<DbTripFull | undefined>(undefined);
  const trip = useMemo(() => {
    if (rawTrip) {
      let isShallowEqual = false;

      // Reference to the trip in the activities, accommodations and macroplans
      const tripWithBackReference = {
        ...rawTrip,
        activity:
          rawTrip.activity?.map((activity) => {
            activity.trip = rawTrip;
            return activity;
          }) ?? [],
        accommodation:
          rawTrip.accommodation?.map((accommodation) => {
            accommodation.trip = rawTrip;
            return accommodation;
          }) ?? [],
        macroplan:
          rawTrip.macroplan?.map((macroplan) => {
            macroplan.trip = rawTrip;
            return macroplan;
          }) ?? [],
      } as DbTripFull;

      isShallowEqual = shallow(
        tripRef.current
          ? omitKeysFromObject(tripRef.current, [
              'accommodation',
              'activity',
              'macroplan',
              'tripUser',
            ])
          : undefined,
        omitKeysFromObject(tripWithBackReference, [
          'accommodation',
          'activity',
          'macroplan',
          'tripUser',
        ]),
      );

      if (tripRef.current?.accommodation) {
        if (
          tripRef.current.accommodation.length !==
          tripWithBackReference.accommodation.length
        ) {
          isShallowEqual = false;
        }
        const accommodationMap: { [id: string]: DbAccommodationWithTrip } = {};
        for (const accommodation of tripRef.current.accommodation) {
          accommodationMap[accommodation.id] = accommodation;
        }
        for (const accommodation of tripWithBackReference.accommodation) {
          const isEqual = shallow(
            omitKeysFromObject(accommodation, ['trip']),
            omitKeysFromObject(accommodationMap[accommodation.id], ['trip']),
          );
          if (!isEqual) {
            isShallowEqual = false;
            break;
          }
        }
      }

      if (tripRef.current?.activity) {
        if (
          tripRef.current.activity.length !==
          tripWithBackReference.activity.length
        ) {
          isShallowEqual = false;
        }
        const activityMap: { [id: string]: DbActivityWithTrip } = {};
        for (const activity of tripRef.current.activity) {
          activityMap[activity.id] = activity;
        }
        for (const activity of tripWithBackReference.activity) {
          const isEqual = shallow(
            omitKeysFromObject(activity, ['trip']),
            omitKeysFromObject(activityMap[activity.id], ['trip']),
          );
          if (!isEqual) {
            isShallowEqual = false;
            break;
          }
        }
      }

      if (tripRef.current?.macroplan) {
        if (
          tripRef.current.macroplan.length !==
          tripWithBackReference.macroplan.length
        ) {
          isShallowEqual = false;
        }
        const macroplanMap: { [id: string]: DbMacroplanWithTrip } = {};
        for (const macroplan of tripRef.current.macroplan) {
          macroplanMap[macroplan.id] = macroplan;
        }
        for (const macroplan of tripWithBackReference.macroplan) {
          const isEqual = shallow(
            omitKeysFromObject(macroplan, ['trip']),
            omitKeysFromObject(macroplanMap[macroplan.id], ['trip']),
          );
          if (!isEqual) {
            isShallowEqual = false;
            break;
          }
        }
      }

      if (isShallowEqual) {
        return tripRef.current;
      }

      tripRef.current = tripWithBackReference;
      return tripWithBackReference;
    }
    return undefined;
  }, [rawTrip]);

  const setTrip = useBoundStore((state) => state.setTrip);
  useEffect(() => {
    if (trip) {
      setTrip(trip);
    }
  }, [trip, setTrip]);

  return { trip, isLoading, error };
}
function omitKeysFromObject<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const newObj = { ...obj };
  for (const key of keys) {
    delete newObj[key];
  }
  return newObj;
}
