import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useBoundStore } from '../data/store';
import { CommonDialogMaxWidth } from '../dialog';
import { dangerToken } from '../ui';
import { type DbAccommodationWithTrip, dbDeleteAccommodation } from './db';

export function AccommodationDeleteDialog({
  accommodation,
}: {
  accommodation: DbAccommodationWithTrip;
}) {
  const publishToast = useBoundStore((state) => state.publishToast);
  const popDialog = useBoundStore((state) => state.popDialog);
  const clearDialogs = useBoundStore((state) => state.clearDialogs);
  const deleteAccommodation = useCallback(() => {
    void dbDeleteAccommodation(accommodation)
      .then(() => {
        publishToast({
          root: {},
          title: { children: `Accommodation "${accommodation.name}" deleted` },
          close: {},
        });

        clearDialogs();
      })
      .catch((err: unknown) => {
        console.error(`Error deleting "${accommodation.name}"`, err);
        publishToast({
          root: {},
          title: { children: `Error deleting "${accommodation.name}"` },
          close: {},
        });
        popDialog();
      });
  }, [publishToast, accommodation, popDialog, clearDialogs]);

  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Content maxWidth={CommonDialogMaxWidth}>
        <AlertDialog.Title>Delete Accommodation</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure to delete accommodation "{accommodation.name}"?
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={popDialog}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={deleteAccommodation}>
            <Button variant="solid" color={dangerToken}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
