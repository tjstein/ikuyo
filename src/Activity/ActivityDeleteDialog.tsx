import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useBoundStore } from '../data/store';
import { CommonDialogMaxWidth } from '../dialog';
import { dangerToken } from '../ui';
import { type DbActivity, dbDeleteActivity } from './db';

export function ActivityDeleteDialog({
  activity,
}: {
  activity: DbActivity;
}) {
  const publishToast = useBoundStore((state) => state.publishToast);
  const popDialog = useBoundStore((state) => state.popDialog);
  const clearDialogs = useBoundStore((state) => state.clearDialogs);
  const deleteActivity = useCallback(() => {
    const { id } = activity;
    console.log('ActivityDeleteDialog deleteActivity', id);
    void dbDeleteActivity(activity)
      .then(() => {
        console.log('ActivityDeleteDialog deleteActivity done', id);
        publishToast({
          root: {},
          title: { children: `Activity "${activity.title}" deleted` },
          close: {},
        });
        clearDialogs();
      })
      .catch((err: unknown) => {
        console.error(`Error deleting "${activity.title}"`, err);
        publishToast({
          root: {},
          title: { children: `Error deleting "${activity.title}"` },
          close: {},
        });
        popDialog();
      });
  }, [publishToast, activity, popDialog, clearDialogs]);
  console.log('ActivityDeleteDialog render', activity.id);

  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Content maxWidth={CommonDialogMaxWidth}>
        <AlertDialog.Title>Delete Activity</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure to delete activity "{activity.title}"?
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={popDialog}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={deleteActivity}>
            <Button variant="solid" color={dangerToken}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
