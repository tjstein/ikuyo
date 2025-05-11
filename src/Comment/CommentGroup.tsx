import { Flex } from '@radix-ui/themes';
import { Comment } from './Comment';
import type { DbCommentGroup, DbCommentGroupObjectType } from './db';

export function CommentGroup<ObjectType extends DbCommentGroupObjectType>({
  commentGroup,
  onFormFocus,
}: {
  commentGroup: undefined | DbCommentGroup<ObjectType>;
  onFormFocus: () => void;
}) {
  return (
    <Flex direction="column" gap="3">
      {commentGroup?.comment.map((comment) => (
        <Comment key={comment.id} comment={comment} onFormFocus={onFormFocus} />
      ))}
    </Flex>
  );
}
