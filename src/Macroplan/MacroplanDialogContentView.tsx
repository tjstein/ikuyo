import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import s from './Macroplan.module.css';
import {
  MacroplanDialogMode,
  type MacroplanDialogModeType,
} from './MacroplanDialogMode';
import type { DbMacroplanWithTrip } from './db';

export function MacroplanDialogContentView({
  macroplan,
  setMode,
}: {
  macroplan: DbMacroplanWithTrip;
  setMode: (mode: MacroplanDialogModeType) => void;
}) {
  const [, setLocation] = useLocation();
  const macroplanDateStartStr = DateTime.fromMillis(macroplan.timestampStart)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');
  const macroplanDateEndStr = DateTime.fromMillis(macroplan.timestampEnd)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');

  const notes = useParseTextIntoNodes(macroplan.notes || '');
  const closeDialog = useCallback(() => {
    setLocation('');
  }, [setLocation]);
  const goToEditMode = useCallback(() => {
    setMode(MacroplanDialogMode.Edit);
  }, [setMode]);
  const goToDeleteMode = useCallback(() => {
    setMode(MacroplanDialogMode.Delete);
  }, [setMode]);

  return (
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
          onClick={goToDeleteMode}
        >
          Delete
        </Button>
        <Button
          type="button"
          size="2"
          variant="soft"
          color="gray"
          onClick={goToEditMode}
        >
          Edit
        </Button>
        <Button type="button" size="2" onClick={closeDialog}>
          Close
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
