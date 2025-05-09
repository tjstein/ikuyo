import { Dialog, Spinner } from '@radix-ui/themes';

import { useState } from 'react';
import type { RouteComponentProps } from 'wouter';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { db } from '../data/db';
import { ActivityDialogContentDelete } from './ActivityDialogContentDelete';
import { ActivityDialogContentEdit } from './ActivityDialogContentEdit';
import { ActivityDialogContentView } from './ActivityDialogContentView';
import {
  ActivityDialogMode,
  type ActivityDialogModeType,
} from './ActivityDialogMode';
import type { DbActivityWithTrip } from './db';

function ActivityDialogContent({
  params,
}: RouteComponentProps<{ id: string }>) {
  const [mode, setMode] = useState<ActivityDialogModeType>(
    history.state?.mode ?? ActivityDialogMode.View,
  );
  const { id: ActivityId } = params;
  const { data } = db.useQuery({
    activity: {
      trip: {},
      $: {
        where: {
          id: ActivityId,
        },
      },
    },
  });
  const activity = data?.activity[0] as DbActivityWithTrip | undefined;
  return (
    <>
      {!activity ? (
        <Dialog.Content maxWidth={CommonDialogMaxWidth}>
          <Dialog.Title>Activity</Dialog.Title>
          <Dialog.Description>
            <Spinner />
          </Dialog.Description>
        </Dialog.Content>
      ) : mode === ActivityDialogMode.View ? (
        <ActivityDialogContentView activity={activity} setMode={setMode} />
      ) : mode === ActivityDialogMode.Edit ? (
        <ActivityDialogContentEdit activity={activity} setMode={setMode} />
      ) : mode === ActivityDialogMode.Delete ? (
        <ActivityDialogContentDelete activity={activity} setMode={setMode} />
      ) : null}
    </>
  );
}
export function ActivityDialog({
  params,
}: RouteComponentProps<{ id: string }>) {
  return (
    <Dialog.Root open>
      <ActivityDialogContent params={params} />
    </Dialog.Root>
  );
}
