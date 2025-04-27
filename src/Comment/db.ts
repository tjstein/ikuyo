import { id } from '@instantdb/core';
import type { DbAccommodation } from '../Accommodation/db';
import type { DbActivity } from '../Activity/db';
import type { DbExpense } from '../Expense/db';
import type { DbMacroplan } from '../Macroplan/db';
import type { DbTrip } from '../Trip/db';
import { db } from '../data/db';
import type { DbUser } from '../data/types';

export const COMMENT_GROUP_STATUS = {
  UNRESOLVED: 0,
  RESOLVED: 1,
} as const;
export type CommentGroupStatus =
  (typeof COMMENT_GROUP_STATUS)[keyof typeof COMMENT_GROUP_STATUS];

export type DbCommentGroupObjectType =
  | 'trip'
  | 'macroplan'
  | 'activity'
  | 'accommodation'
  | 'expense';
/**
 * Comment group is a group of comments that belong to a trip
 * It can 'target' a trip, macroplan, activity, accommodation, or expense
 */
export type DbCommentGroup<ObjectType extends DbCommentGroupObjectType> = {
  id: string;
  createdAt: number;
  lastUpdatedAt: number;
  /** 0: unresolved; 1: resolved; */
  status: CommentGroupStatus;

  comments: DbComment<ObjectType>[];
  /** all comment group must belong to a trip */
  trip: DbTrip | undefined;
  /** this is the actual link to determine the 'object' */
  object: DbCommentGroupObject<ObjectType> | undefined;
};
export type DbComment<ObjectType extends DbCommentGroupObjectType> = {
  id: string;
  content: string;
  createdAt: number;
  lastUpdatedAt: number;

  group: DbCommentGroup<ObjectType> | undefined;
  user: DbUser | undefined;
};
export type DbCommentGroupObject<ObjectType extends DbCommentGroupObjectType> =
  {
    /** same id as DbCommentGroup */
    id: string;
    type: ObjectType;
    createdAt: number;
    lastUpdatedAt: number;

    commentGroup: DbCommentGroup<ObjectType> | undefined;

    trip: ObjectType extends 'trip' ? DbTrip : undefined;
    macroplan: ObjectType extends 'macroplan' ? DbMacroplan : undefined;
    activity: ObjectType extends 'activity' ? DbActivity : undefined;
    accommodation: ObjectType extends 'accommodation'
      ? DbAccommodation
      : undefined;
    expense: ObjectType extends 'expense' ? DbExpense : undefined;
  };

export async function addComment<ObjectType extends DbCommentGroupObjectType>(
  newComment: Omit<
    DbComment<ObjectType>,
    'id' | 'createdAt' | 'lastUpdatedAt' | 'group' | 'user'
  >,
  {
    tripId,
    objectId,
    objectType,
    groupId: commentGroupId,
  }: {
    tripId: string;
    objectId: string;
    objectType: ObjectType;
    groupId?: string;
  },
) {
  const transactions = [];
  const now = Date.now();
  if (!commentGroupId) {
    commentGroupId = id();
    transactions.push(
      db.tx.commentGroup[commentGroupId].update({
        createdAt: now,
        lastUpdatedAt: now,
      }),
      db.tx.commentGroupObject[commentGroupId]
        .update({
          type: objectType,
          createdAt: now,
          lastUpdatedAt: now,
        })
        .link({
          commentGroup: commentGroupId,
          [objectType]: objectId,
        }),
    );
  }
  const newCommentId = id();
  transactions.push(
    db.tx.comment[newCommentId]
      .update({
        ...newComment,
        createdAt: now,
        lastUpdatedAt: now,
      })
      .link({
        group: commentGroupId,
        user: tripId,
      }),
  );

  const result = await db.transact(transactions);

  return {
    id: newCommentId,
    result: result,
  };
}

export async function updateCommentGroupStatus(
  commentGroupId: string,
  status: CommentGroupStatus,
) {
  const now = Date.now();
  return db.transact(
    db.tx.commentGroup[commentGroupId].merge({
      status,
      lastUpdatedAt: now,
    }),
  );
}

export async function updateComment<
  ObjectType extends DbCommentGroupObjectType,
>(
  comment: Omit<
    DbComment<ObjectType>,
    'createdAt' | 'lastUpdatedAt' | 'group' | 'user'
  >,
) {
  const now = Date.now();
  const transactions = [
    db.tx.comment[comment.id].merge({
      ...comment,
      lastUpdatedAt: now,
    }),
  ];

  return db.transact(transactions);
}

export async function deleteComment<
  ObjectType extends DbCommentGroupObjectType,
>(
  comment: Omit<DbComment<ObjectType>, 'createdAt' | 'lastUpdatedAt' | 'user'>,
) {
  const commentGroupId = comment.group?.id;
  if (!commentGroupId) {
    throw new Error('Comment group id is required to delete comment');
  }
  const transactions = [
    db.tx.commentGroup[commentGroupId].unlink({
      comment: [comment.id],
    }),
    db.tx.comment[comment.id].delete(),
  ];
  await db.transact(transactions);

  //  if the group is empty, delete the group too
  const res = await db.queryOnce({
    commentGroup: {
      comment: {},
      $: {
        where: {
          id: commentGroupId,
        },
      },
    },
  });

  const secondTransactions = [];
  if (res.data.commentGroup.length > 0) {
    const cg = res.data.commentGroup[0];
    if (cg.comment.length === 0) {
      secondTransactions.push(
        db.tx.commentGroup[commentGroupId].delete(),
        db.tx.commentGroupObject[commentGroupId].delete(),
      );
    }
  }

  return db.transact(secondTransactions);
}
