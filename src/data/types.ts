import { DbActivity } from '../Activity/db';
import { DbTrip } from '../Trip/db';

export type DbUser = {
  id: string;
  handle: string;
  email: string;
  createdAt: number;
  lastUpdatedAt: number;
  activated: boolean;

  tripEditor: DbTrip[] | undefined;
  tripOwner: DbTrip[] | undefined;
  tripViewer: DbTrip[] | undefined;
};
export type DbSchema = {
  activity: DbActivity;
  trip: DbTrip;
  user: DbUser;
};
