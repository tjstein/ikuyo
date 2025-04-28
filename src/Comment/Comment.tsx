import { Box, Card, Flex, Text } from '@radix-ui/themes';
import { UserAvatar } from '../Auth/UserAvatar';
import type { DbComment, DbCommentGroupObjectType } from './db';

export function Comment<ObjectType extends DbCommentGroupObjectType>({
  comment,
}: { comment: DbComment<ObjectType> }) {
  const { user } = comment;
  return (
    <Card>
      <Flex gap="3" align="center">
        <UserAvatar user={user} />
        <Box>
          <Text as="div" size="2" weight="bold">
            {user?.handle}
          </Text>
          <Text as="div" size="2" color="gray">
            {comment.content}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}
