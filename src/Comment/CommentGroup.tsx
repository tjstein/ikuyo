import { Flex } from '@radix-ui/themes';
import { Comment } from './Comment';
import type { DbCommentGroup, DbCommentGroupObjectType } from './db';

export function CommentGroup<ObjectType extends DbCommentGroupObjectType>({
  commentGroup,
}: {
  commentGroup: undefined | DbCommentGroup<ObjectType>;
}) {
  return (
    <Flex direction="column" gap="3">
      {commentGroup?.comment.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </Flex>
  );
}
