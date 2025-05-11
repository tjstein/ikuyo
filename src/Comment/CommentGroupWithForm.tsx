import { Spinner, Text } from '@radix-ui/themes';
import type { DbUser } from '../data/types';
import { CommentForm } from './CommentForm';
import { CommentGroup } from './CommentGroup';
import { CommentMode } from './CommentMode';
import type { DbCommentGroup, DbCommentGroupObjectType } from './db';

export function CommentGroupWithForm({
  user,
  commentGroup,
  tripId,
  objectId,
  objectType,
  isLoading,
  error,
  onFormFocus,
}: {
  user?: DbUser;
  commentGroup?: undefined | DbCommentGroup<DbCommentGroupObjectType>;

  tripId: string | undefined;
  objectId: string | undefined;
  objectType: DbCommentGroupObjectType;
  isLoading?: boolean;
  error?: { message: string };
  onFormFocus: () => void;
}) {
  return (
    <>
      {tripId && objectId ? (
        <CommentForm
          mode={CommentMode.Add}
          tripId={tripId}
          objectId={objectId}
          objectType={objectType}
          user={user}
          commentGroupId={commentGroup?.id}
          setCommentMode={() => {}}
          onFormFocus={onFormFocus}
        />
      ) : null}

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Text>Error loading comments: {error.message}</Text>
      ) : (
        <CommentGroup commentGroup={commentGroup} />
      )}
    </>
  );
}
