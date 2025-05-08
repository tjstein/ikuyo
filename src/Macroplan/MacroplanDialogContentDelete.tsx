import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { dangerToken } from '../ui';
import {
  MacroplanDialogMode,
  type MacroplanDialogModeType,
} from './MacroplanDialogMode';
import { type DbMacroplanWithTrip, dbDeleteMacroplan } from './db';

export function MacroplanDialogContentDelete({
  macroplan,
  setMode,
}: {
  macroplan: DbMacroplanWithTrip;
  setMode: (mode: MacroplanDialogModeType) => void;
}) {
  const [, setLocation] = useLocation();
  const publishToast = useBoundStore((state) => state.publishToast);
  const deleteMacroplan = useCallback(() => {
    void dbDeleteMacroplan(macroplan)
      .then(() => {
        publishToast({
          root: {},
          title: { children: `Macroplan "${macroplan.name}" deleted` },
          close: {},
        });

        setLocation('');
      })
      .catch((err: unknown) => {
        console.error(`Error deleting "${macroplan.name}"`, err);
        publishToast({
          root: {},
          title: { children: `Error deleting "${macroplan.name}"` },
          close: {},
        });
      });
  }, [publishToast, macroplan, setLocation]);

  return (
    <Dialog.Content maxWidth={CommonDialogMaxWidth}>
      <Dialog.Title>Delete Day Plan</Dialog.Title>
      <Dialog.Description size="2">
        Are you sure to delete day plan "{macroplan.name}"?
      </Dialog.Description>

      <Flex gap="3" mt="4" justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={() => {
            setMode(MacroplanDialogMode.View);
          }}
        >
          Cancel
        </Button>
        <Button variant="solid" color={dangerToken} onClick={deleteMacroplan}>
          Delete
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
