import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';

import { useMemo } from 'react';

import { Cross1Icon } from '@radix-ui/react-icons';
import { CommentGroupWithForm } from '../Comment/CommentGroupWithForm';
import {
  COMMENT_GROUP_OBJECT_TYPE,
  type DbComment,
  type DbCommentGroup,
} from '../Comment/db';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import { db } from '../data/db';
import { useBoundStore } from '../data/store';
import { CommonCommentDialogMaxWidth } from '../dialog';
import s from './Activity.module.css';
import type { DbActivityWithTrip } from './db';

export function ActivityViewDialog({
  activity,
  dialogOpen,
  setDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
}: {
  activity: DbActivityWithTrip;
  dialogOpen: boolean;
  setDialogOpen: (newValue: boolean) => void;
  setEditDialogOpen: (newValue: boolean) => void;
  setDeleteDialogOpen: (newValue: boolean) => void;
}) {
  const activityStartStr = DateTime.fromMillis(activity.timestampStart)
    .setZone(activity.trip.timeZone)
    .toFormat('dd LLLL yyyy HH:mm');
  const activityEndStr = DateTime.fromMillis(activity.timestampEnd)
    .setZone(activity.trip.timeZone)
    // since 1 activity must be in same day, so might as well just show the time for end
    .toFormat('HH:mm');
  const currentUser = useBoundStore((state) => state.currentUser);

  const descriptions = useParseTextIntoNodes(activity.description || '');
  const commentGroupQuery = db.useQuery({
    commentGroup: {
      comment: {
        user: {},
      },
      trip: {},
      object: {},
      $: {
        where: {
          'trip.id': activity.trip.id,
          'object.type': 'activity',
          'object.activity.id': activity.id,
        },
        limit: 1,
      },
    },
  });
  const rawCommentGroup = commentGroupQuery?.data?.commentGroup[0];
  const commentGroup: undefined | DbCommentGroup<'activity'> = useMemo(() => {
    if (rawCommentGroup) {
      const cg = {
        ...rawCommentGroup,
      } as DbCommentGroup<'activity'>;
      cg.comment = rawCommentGroup.comment.map(
        (comment) =>
          ({
            ...comment,
            group: cg,
            user: comment.user,
          }) as DbComment<'activity'>,
      );
      // sort by createdAt desc
      cg.comment.sort((a, b) => b.createdAt - a.createdAt);
      return cg;
    }
    return undefined;
  }, [rawCommentGroup]);

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Content maxWidth={CommonCommentDialogMaxWidth}>
        <Dialog.Close>
          <Button
            type="button"
            size="2"
            variant="soft"
            color="gray"
            style={{
              position: 'absolute',
              top: 'var(--space-5)',
              right: 'var(--space-5)',
            }}
          >
            <Cross1Icon />
          </Button>
        </Dialog.Close>

        <Flex
          gap="5"
          justify="between"
          direction={{ initial: 'column', md: 'row' }}
        >
          <Flex
            direction="column"
            gap="3"
            mt="3"
            flexGrow="1"
            maxWidth={{ initial: '100%', md: '50%' }}
          >
            <Dialog.Title mb="0">View Activity</Dialog.Title>
            <Flex gap="3" justify="end">
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
            </Flex>
            <Dialog.Description>Activity details</Dialog.Description>
            <Heading as="h2" size="4">
              Title
            </Heading>
            <Text>{activity.title}</Text>
            <Heading as="h2" size="4">
              Time
            </Heading>
            <Text>
              {activityStartStr} to {activityEndStr}
            </Text>

            {activity.location ? (
              <>
                <Heading as="h2" size="4">
                  Location
                </Heading>
                <Text>{activity.location}</Text>
              </>
            ) : (
              <></>
            )}
            {activity.description ? (
              <>
                <Heading as="h2" size="4">
                  Description
                </Heading>
                <Text className={s.activityDescription}>{descriptions}</Text>
              </>
            ) : (
              <></>
            )}
          </Flex>
          <Flex
            direction="column"
            mt="6"
            gap="3"
            flexGrow="1"
            maxWidth={{ initial: '100%', md: '50%' }}
          >
            <Heading as="h2" size="4" mt="2">
              Comments
            </Heading>
            <CommentGroupWithForm
              tripId={activity.trip.id}
              objectId={activity.id}
              objectType={COMMENT_GROUP_OBJECT_TYPE.ACTIVITY}
              user={currentUser}
              commentGroup={commentGroup}
            />
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
