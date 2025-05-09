import { Dialog, Spinner } from '@radix-ui/themes';

import { useState } from 'react';
import type { RouteComponentProps } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { ActivityDialogContentDelete } from './ActivityDialogContentDelete';
import { ActivityDialogContentEdit } from './ActivityDialogContentEdit';
import { ActivityDialogContentView } from './ActivityDialogContentView';
import {
  ActivityDialogMode,
  type ActivityDialogModeType,
} from './ActivityDialogMode';

function ActivityDialogContent({
  params,
}: RouteComponentProps<{ id: string }>) {
  const [mode, setMode] = useState<ActivityDialogModeType>(
    history.state?.mode ?? ActivityDialogMode.View,
  );
  const { id: activityId } = params;
  const activity = useBoundStore(
    useShallow((state) => state.getActivity(activityId)),
  );

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
