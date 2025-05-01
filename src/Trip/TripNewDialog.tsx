import { Box, Dialog } from '@radix-ui/themes';
import { useBoundStore } from '../data/store';
import type { DbUser } from '../data/types';
import { CommonDialogMaxWidth } from '../dialog';
import { TripForm } from './TripForm';
import { TripFormMode } from './TripFormMode';

export function TripNewDialog({
  user,
}: {
  user: DbUser;
}) {
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const popDialog = useBoundStore((state) => state.popDialog);

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          popDialog();
        }
      }}
    >
      <Dialog.Content maxWidth={CommonDialogMaxWidth}>
        <Dialog.Title>New Trip</Dialog.Title>
        <Dialog.Description>
          Fill in your new trip details...
        </Dialog.Description>
        <Box height="16px" />
        <TripForm
          mode={TripFormMode.New}
          tripStartStr={''}
          tripEndStr={''}
          tripTitle={''}
          tripTimeZone={currentTimeZone}
          tripCurrency=""
          tripOriginCurrency=""
          tripRegion=""
          userId={user.id}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
