import { Dialog, Spinner } from '@radix-ui/themes';

import { useState } from 'react';
import type { RouteComponentProps } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { MacroplanDialogContentDelete } from './MacroplanDialogContentDelete';
import { MacroplanDialogContentEdit } from './MacroplanDialogContentEdit';
import { MacroplanDialogContentView } from './MacroplanDialogContentView';
import {
  MacroplanDialogMode,
  type MacroplanDialogModeType,
} from './MacroplanDialogMode';

function MacroplanDialogContent({
  params,
}: RouteComponentProps<{ id: string }>) {
  const [mode, setMode] = useState<MacroplanDialogModeType>(
    history.state?.mode ?? MacroplanDialogMode.View,
  );
  const { id: macroplanId } = params;
  const macroplan = useBoundStore(
    useShallow((state) => state.getMacroplan(macroplanId)),
  );

  return (
    <>
      {!macroplan ? (
        <Dialog.Content maxWidth={CommonDialogMaxWidth}>
          <Dialog.Title>Day Plan</Dialog.Title>
          <Dialog.Description>
            <Spinner />
          </Dialog.Description>
        </Dialog.Content>
      ) : mode === MacroplanDialogMode.View ? (
        <MacroplanDialogContentView macroplan={macroplan} setMode={setMode} />
      ) : mode === MacroplanDialogMode.Edit ? (
        <MacroplanDialogContentEdit macroplan={macroplan} setMode={setMode} />
      ) : mode === MacroplanDialogMode.Delete ? (
        <MacroplanDialogContentDelete macroplan={macroplan} setMode={setMode} />
      ) : null}
    </>
  );
}
export function MacroplanDialog({
  params,
}: RouteComponentProps<{ id: string }>) {
  return (
    <Dialog.Root open>
      <MacroplanDialogContent params={params} />
    </Dialog.Root>
  );
}
