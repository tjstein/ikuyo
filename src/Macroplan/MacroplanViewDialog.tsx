import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import { useBoundStore } from '../data/store';
import s from './Macroplan.module.css';
import { MacroplanDeleteDialog } from './MacroplanDeleteDialog';
import { MacroplanEditDialog } from './MacroplanEditDialog';
import type { DbMacroplanWithTrip } from './db';

export function MacroplanViewDialog({
  macroplan,
}: {
  macroplan: DbMacroplanWithTrip;
}) {
  const macroplanDateStartStr = DateTime.fromMillis(macroplan.timestampStart)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');
  const macroplanDateEndStr = DateTime.fromMillis(macroplan.timestampEnd)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');
  const popDialog = useBoundStore((state) => state.popDialog);
  const pushDialog = useBoundStore((state) => state.pushDialog);

  const notes = useParseTextIntoNodes(macroplan.notes || '');

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
        <Dialog.Title>View Day Plan</Dialog.Title>
        <Dialog.Description>Details of day plan</Dialog.Description>
        <Flex direction="column" gap="3" mt="3">
          <Heading as="h2" size="4">
            Plan
          </Heading>
          <Text>{macroplan.name}</Text>
          <Heading as="h2" size="4">
            Start
          </Heading>
          <Text>{macroplanDateStartStr}</Text>
          <Heading as="h2" size="4">
            End
          </Heading>
          <Text>{macroplanDateEndStr}</Text>
          {macroplan.notes ? (
            <>
              <Heading as="h2" size="4">
                Notes
              </Heading>
              <Text className={s.activityDescription}>{notes}</Text>
            </>
          ) : (
            <></>
          )}
        </Flex>
        <Flex gap="3" mt="5" justify="end">
          <Button
            mr="auto"
            type="button"
            size="2"
            variant="soft"
            color="gray"
            onClick={() => {
              pushDialog(MacroplanDeleteDialog, {
                macroplan,
              });
            }}
          >
            Delete
          </Button>
          <Button
            type="button"
            size="2"
            variant="soft"
            color="gray"
            onClick={() => {
              pushDialog(MacroplanEditDialog, {
                macroplan,
              });
            }}
          >
            Edit
          </Button>
          <Dialog.Close>
            <Button type="button" size="2">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
