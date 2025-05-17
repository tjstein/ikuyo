import { Flex } from '@radix-ui/themes';
import { useMemo } from 'react';
import { Comment } from './Comment';
import type { DbCommentGroup, DbCommentGroupObjectType } from './db';

export function CommentGroup<ObjectType extends DbCommentGroupObjectType>({
  commentGroup,
  onFormFocus,
  showCommentObjectTarget,
  showControls,
}: {
  commentGroup: undefined | DbCommentGroup<ObjectType>;
  onFormFocus: () => void;
  showCommentObjectTarget: boolean;
  showControls: boolean;
}) {
  const sortedComments = useMemo(() => {
    return (
      commentGroup?.comment.sort((a, b) => {
        // sort by createdAt descending
        return b.createdAt - a.createdAt;
      }) ?? []
    );
  }, [commentGroup]);
  return (
    <Flex direction="column" gap="3">
      {sortedComments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          onFormFocus={onFormFocus}
          showCommentObjectTarget={showCommentObjectTarget}
          showControls={showControls}
        />
      ))}
    </Flex>
  );
}
