import { Flex, Text } from '@radix-ui/themes';
import { useTripComments } from '../Trip/store/hooks';
import type { TripSliceCommentGroup } from '../Trip/store/types';
import { Comment } from './Comment';

export function CommentGroup({
  commentGroup,
  onFormFocus,
  showCommentObjectTarget,
  showControls,
}: {
  commentGroup: undefined | TripSliceCommentGroup;
  onFormFocus: () => void;
  showCommentObjectTarget: boolean;
  showControls: boolean;
}) {
  const comments = useTripComments(commentGroup?.commentIds ?? []);

  return comments.length === 0 ? (
    <Text size="1">No comments yet</Text>
  ) : (
    <Flex direction="column" gap="3">
      {comments.map((comment) => (
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
