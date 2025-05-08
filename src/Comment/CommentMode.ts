export const CommentMode = {
  View: 'view',
  Edit: 'edit',
  Add: 'add',
} as const;
export type CommentModeType = (typeof CommentMode)[keyof typeof CommentMode];
