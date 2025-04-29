import { Card, Flex, Text } from '@radix-ui/themes';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { UserAvatar } from '../Auth/UserAvatar';
import { useParseTextIntoNodes } from '../common/text/parseTextIntoNodes';
import type { DbComment, DbCommentGroupObjectType } from './db';

export function Comment<ObjectType extends DbCommentGroupObjectType>({
  comment,
}: { comment: DbComment<ObjectType> }) {
  const { user } = comment;
  const formattedDateTimeString = useMemo(() => {
    return formatTimestampToDateTimeString(comment.createdAt);
  }, [comment.createdAt]);
  const nodes = useParseTextIntoNodes(comment.content || '');
  return (
    <Flex gap="3" align="start">
      <UserAvatar user={user} />
      <Flex direction="column" gap="1">
        <Flex gap="1">
          <Text size="2" weight="bold">
            {user?.handle}
          </Text>
          <Text size="2">{formattedDateTimeString}</Text>
        </Flex>

        <Card>
          <Text as="div" size="2">
            {nodes}
          </Text>
        </Card>
      </Flex>
    </Flex>
  );
}

function formatTimestampToDateTimeString(timestamp: number): string {
  const dateTime = DateTime.fromMillis(timestamp);
  return dateTime.toFormat('d LLLL yyyy');
}
