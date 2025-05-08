export const MacroplanFormMode = {
  New: 'new',
  Edit: 'edit',
} as const;
export type MacroplanFormModeType =
  (typeof MacroplanFormMode)[keyof typeof MacroplanFormMode];
