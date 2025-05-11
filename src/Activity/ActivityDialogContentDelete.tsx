import { Button, Dialog, Flex, Skeleton } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { type DialogContentProps, DialogMode } from '../Dialog/DialogRoute';
import { useBoundStore } from '../data/store';
import { dangerToken } from '../ui';
import { type DbActivityWithTrip, dbDeleteActivity } from './db';

export function ActivityDialogContentDelete({
  data: activity,
  setMode,
  dialogContentProps,
}: DialogContentProps<DbActivityWithTrip>) {
  const [, setLocation] = useLocation();
  const publishToast = useBoundStore((state) => state.publishToast);
  const deleteActivity = useCallback(() => {
    if (!activity) {
      console.error('Activity is undefined');
      return;
    }
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
    <Dialog.Content {...dialogContentProps}>
      <Dialog.Title>Delete Activity</Dialog.Title>
      <Dialog.Description size="2">
        Are you sure to delete activity "
        {activity?.title ?? <Skeleton>Activity name</Skeleton>}"?
      </Dialog.Description>

      <Flex gap="3" mt="4" justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={() => {
            setMode(DialogMode.View);
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
