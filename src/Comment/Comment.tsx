import { Button, Card, Flex, Popover, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { UserAvatar } from '../Auth/UserAvatar';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import { useBoundStore } from '../data/store';
import { dangerToken } from '../ui';
import s from './Comment.module.css';
import { CommentForm } from './CommentForm';
import { CommentMode, type CommentModeType } from './CommentMode';
import {
  type DbComment,
  type DbCommentGroupObjectType,
  dbDeleteComment,
} from './db';

export function Comment<ObjectType extends DbCommentGroupObjectType>({
  comment,
  onFormFocus,
}: {
  comment: DbComment<ObjectType>;
  onFormFocus: () => void;
}) {
  const { user } = comment;
  const formattedDateTimeStringCreated = useMemo(() => {
    return formatTimestampToDateTimeString(comment.createdAt);
  }, [comment.createdAt]);
  const formattedDateTimeStringUpdated = useMemo(() => {
    return formatTimestampToDateTimeString(comment.lastUpdatedAt);
  }, [comment.lastUpdatedAt]);
  const nodes = useParseTextIntoNodes(comment.content || '');
  const publishToast = useBoundStore((state) => state.publishToast);
  const [commentMode, setCommentMode] = useState<CommentModeType>(
    CommentMode.View,
  );
  return (
    <Flex gap="3" align="start">
      <UserAvatar user={user} />
      <Flex direction="column" gap="1" flexGrow="1">
        <Flex gap="1" align="baseline">
          <Text size="2" weight="bold">
            {user?.handle}
          </Text>
          <Text
            size="1"
            title={`Created ${formattedDateTimeStringCreated}${
              formattedDateTimeStringCreated !== formattedDateTimeStringUpdated
                ? ` (edited ${formattedDateTimeStringUpdated})`
                : ''
            }`}
          >
            {formattedDateTimeStringCreated}
            {formattedDateTimeStringCreated !== formattedDateTimeStringUpdated
              ? ' (edited)'
              : ''}
          </Text>
        </Flex>

        {commentMode === CommentMode.Edit &&
        comment.group &&
        comment.group.trip &&
        comment.group.object ? (
          <CommentForm
            mode={CommentMode.Edit}
            user={user}
            commentId={comment.id}
            commentGroupId={comment.group.id}
            commentContent={comment.content}
            tripId={comment.group.trip.id}
            objectId={comment.group.object.id}
            objectType={comment.group.object.type}
            setCommentMode={setCommentMode}
            onFormFocus={onFormFocus}
          />
        ) : (
          <>
            <Card>
              <Text as="div" size="2" className={s.content}>
                {nodes}
              </Text>
            </Card>

            <Flex align="baseline" gap="2">
              <Button
                size="1"
                variant="ghost"
                color="gray"
                onClick={() => {
                  setCommentMode(CommentMode.Edit);
                }}
              >
                Edit
              </Button>
              <Text size="1">•</Text>

              <Popover.Root>
                <Popover.Trigger>
                  <Button size="1" variant="ghost" color="gray">
                    Delete
                  </Button>
                </Popover.Trigger>
                <Popover.Content size="2">
                  <Text as="p" size="2">
                    Delete comment?
                  </Text>
                  <Text as="p" size="2" color={dangerToken}>
                    This action is irreversible!
                  </Text>
                  <Flex gap="2" mt="4" justify="end">
                    <Popover.Close>
                      <Button size="2" variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Popover.Close>
                    <Button
                      size="2"
                      variant="solid"
                      color={dangerToken}
                      onClick={() => {
                        dbDeleteComment(comment)
                          .then(() => {
                            publishToast({
                              root: {},
                              title: {
                                children: 'Comment deleted',
                              },
                              close: {},
                            });
                          })
                          .catch((error: unknown) => {
                            console.error(
                              `Error deleting comment "${comment.id}"`,
                              error,
                            );
                            publishToast({
                              root: {},
                              title: {
                                children: 'Error deleting comment',
                              },
                              close: {},
                            });
                          });
                      }}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}

function formatTimestampToDateTimeString(timestamp: number): string {
  const dateTime = DateTime.fromMillis(timestamp);
  return dateTime.toFormat('d LLLL yyyy, HH:mm ZZ');
}
