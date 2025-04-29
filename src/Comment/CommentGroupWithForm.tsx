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
}: {
  user?: DbUser;
  commentGroup?: undefined | DbCommentGroup<DbCommentGroupObjectType>;

  tripId: string;
  objectId: string;
  objectType: DbCommentGroupObjectType;
}) {
  return (
    <>
      <CommentForm
        mode={CommentMode.Add}
        tripId={tripId}
        objectId={objectId}
        objectType={objectType}
        user={user}
        commentGroupId={commentGroup?.id}
      />
      <CommentGroup commentGroup={commentGroup} />
    </>
  );
}
