import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';

import createUrlRegExp from 'url-regex-safe';

import { useMemo } from 'react';
import { CommonDialogMaxWidth } from '../dialog';
import s from './Macroplan.module.css';
import type { DbMacroplanWithTrip } from './db';

export function MacroplanViewDialog({
  macroplan,
  dialogOpen,
  setDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
}: {
  macroplan: DbMacroplanWithTrip;
  dialogOpen: boolean;
  setDialogOpen: (newValue: boolean) => void;
  setEditDialogOpen: (newValue: boolean) => void;
  setDeleteDialogOpen: (newValue: boolean) => void;
}) {
  const macroplanDateStartStr = DateTime.fromMillis(macroplan.timestampStart)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');
  const macroplanDateEndStr = DateTime.fromMillis(macroplan.timestampEnd)
    .setZone(macroplan.trip.timeZone)
    .toFormat('dd LLLL yyyy');

  const notes = useMemo(() => {
    const urlRegex = createUrlRegExp({
      localhost: false,
      ipv4: false,
      ipv6: false,
    });

    const notes = macroplan.notes || '';
    const matchArray = notes.matchAll(urlRegex);

    const parts: Array<React.ReactNode> = [];
    let i = 0;
    for (const match of matchArray) {
      const url = match[0];
      if (url) {
        const partBeforeUrl = notes.slice(i, match.index);
        parts.push(partBeforeUrl);
        if (!url.startsWith('http')) {
          parts.push(url);
        } else {
          parts.push(
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>,
          );
        }
        i = match.index + url.length;
      }
    }
    parts.push(notes.slice(i, notes.length));
    return parts;
  }, [macroplan.notes]);
  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
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
              setDialogOpen(false);
              setDeleteDialogOpen(true);
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
              setDialogOpen(false);
              setEditDialogOpen(true);
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
