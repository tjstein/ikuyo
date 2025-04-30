import { Box, Button, Flex, Text, TextArea } from '@radix-ui/themes';
import { useCallback, useId, useState } from 'react';
import { UserAvatar } from '../Auth/UserAvatar';
import { useBoundStore } from '../data/store';
import type { DbUser } from '../data/types';
import { dangerToken } from '../ui';
import { CommentMode } from './CommentMode';
import {
  type DbCommentGroupObjectType,
  dbAddComment,
  dbUpdateComment,
} from './db';

export function CommentForm({
  mode,
  user,
  commentGroupId,
  commentId,
  commentContent,
  setCommentMode,
  tripId,
  objectId,
  objectType,
}: {
  mode: CommentMode;
  user?: DbUser;
  commentGroupId?: string;
  commentId?: string;
  commentContent?: string;
  setCommentMode: (mode: CommentMode) => void;

  tripId: string;
  objectId: string;
  objectType: DbCommentGroupObjectType;
}) {
  const idForm = useId();
  const idContent = useId();
  const handleCancel = useCallback(() => {
    setCommentMode(CommentMode.View);
  }, [setCommentMode]);
  const [errorMessage, setErrorMessage] = useState('');
  const publishToast = useBoundStore((state) => state.publishToast);
  const handleSubmit = useCallback(() => {
    return async (elForm: HTMLFormElement) => {
      setErrorMessage('');
      if (!elForm.reportValidity()) {
        return;
      }
      const formData = new FormData(elForm);
      const content = (formData.get('content') as string | null) ?? '';
      console.log('CommentForm', {
        mode,
        content,
        tripId,
        objectId,
        objectType,
        commentGroupId,
      });
      if (!content) {
        return;
      }
      if (mode === CommentMode.Edit && commentId) {
        await dbUpdateComment({
          content,
          id: commentId,
        });
        setCommentMode(CommentMode.View);
        publishToast({
          root: {},
          title: { children: 'Comment updated' },
          close: {},
        });
      } else if (mode === CommentMode.Add && user) {
        const { id, result } = await dbAddComment(
          {
            content,
          },
          {
            tripId,
            objectId,
            objectType,
            groupId: commentGroupId,
            userId: user.id,
          },
        );
        console.log('CommentForm: dbAddComment', { id, result });
        publishToast({
          root: {},
          title: { children: 'Comment added' },
          close: {},
        });
      }

      elForm.reset();
    };
  }, [
    mode,
    publishToast,
    tripId,
    objectType,
    objectId,
    commentGroupId,
    commentId,
    user,
    setCommentMode,
  ]);
  return (
    <form
      id={idForm}
      onInput={() => {
        setErrorMessage('');
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const elForm = e.currentTarget;
        void handleSubmit()(elForm);
      }}
    >
      <Flex gap="3">
        {mode === CommentMode.Add ? <UserAvatar user={user} /> : null}
        <Box flexGrow="1">
          <TextArea
            id={idContent}
            name="content"
            placeholder="Write a comment…"
            defaultValue={commentContent}
            style={{ height: 80 }}
          />
          <Flex gap="3" mt="3" justify="between">
            <Flex align="center" gap="2" asChild>
              <Text color={dangerToken} size="2">
                {errorMessage}
              </Text>
            </Flex>

            <Flex gap="2" align="end">
              {mode === CommentMode.Edit ? (
                <>
                  <Button
                    size="1"
                    type="reset"
                    variant="soft"
                    color="gray"
                    form={idForm}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button size="1" type="submit" formTarget={idForm}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="1" type="submit" formTarget={idForm}>
                    Comment
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </form>
  );
}
