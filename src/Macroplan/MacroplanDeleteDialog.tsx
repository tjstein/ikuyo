import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useBoundStore } from '../data/store';
import { CommonDialogMaxWidth } from '../dialog';
import { dangerToken } from '../ui';
import { type DbMacroplanWithTrip, dbDeleteMacroplan } from './db';

export function MacroplanDeleteDialog({
  macroplan,
}: {
  macroplan: DbMacroplanWithTrip;
}) {
  const popDialog = useBoundStore((state) => state.popDialog);
  const publishToast = useBoundStore((state) => state.publishToast);
  const clearDialogs = useBoundStore((state) => state.clearDialogs);
  const deleteMacroplan = useCallback(() => {
    void dbDeleteMacroplan(macroplan)
      .then(() => {
        publishToast({
          root: {},
          title: { children: `Macroplan "${macroplan.name}" deleted` },
          close: {},
        });

        clearDialogs();
      })
      .catch((err: unknown) => {
        console.error(`Error deleting "${macroplan.name}"`, err);
        publishToast({
          root: {},
          title: { children: `Error deleting "${macroplan.name}"` },
          close: {},
        });
        popDialog();
      });
  }, [publishToast, macroplan, popDialog, clearDialogs]);

  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Content maxWidth={CommonDialogMaxWidth}>
        <AlertDialog.Title>Delete Day Plan</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure to delete day plan "{macroplan.name}"?
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={popDialog}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={deleteMacroplan}>
            <Button variant="solid" color={dangerToken}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
