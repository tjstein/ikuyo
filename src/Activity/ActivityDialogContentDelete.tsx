import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { dangerToken } from '../ui';
import {
  ActivityDialogMode,
  type ActivityDialogModeType,
} from './ActivityDialogMode';
import { type DbActivity, dbDeleteActivity } from './db';

export function ActivityDialogContentDelete({
  activity,
  setMode,
}: {
  activity: DbActivity;
  setMode: (mode: ActivityDialogModeType) => void;
}) {
  const [, setLocation] = useLocation();
  const publishToast = useBoundStore((state) => state.publishToast);
  const deleteActivity = useCallback(() => {
    void dbDeleteActivity(activity)
      .then(() => {
        publishToast({
          root: {},
          title: { children: `Activity "${activity.title}" deleted` },
          close: {},
        });
        setLocation('');
      })
      .catch((err: unknown) => {
        console.error(`Error deleting "${activity.title}"`, err);
        publishToast({
          root: {},
          title: { children: `Error deleting "${activity.title}"` },
          close: {},
        });
      });
  }, [publishToast, activity, setLocation]);

  return (
    <Dialog.Content maxWidth={CommonDialogMaxWidth}>
      <Dialog.Title>Delete Activity</Dialog.Title>
      <Dialog.Description size="2">
        Are you sure to delete activity "{activity.title}"?
      </Dialog.Description>

      <Flex gap="3" mt="4" justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={() => {
            setMode(ActivityDialogMode.View);
          }}
        >
          Cancel
        </Button>
        <Button variant="solid" color={dangerToken} onClick={deleteActivity}>
          Delete
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
