import { Dialog, Spinner } from '@radix-ui/themes';

import { useState } from 'react';
import type { RouteComponentProps } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import { CommonDialogMaxWidth } from '../Dialog/ui';
import { useBoundStore } from '../data/store';
import { AccommodationDialogContentDelete } from './AccommodationDialogContentDelete';
import { AccommodationDialogContentEdit } from './AccommodationDialogContentEdit';
import { AccommodationDialogContentView } from './AccommodationDialogContentView';
import {
  AccommodationDialogMode,
  type AccommodationDialogModeType,
} from './AccommodationDialogMode';

function AccommodationDialogContent({
  params,
}: RouteComponentProps<{ id: string }>) {
  const [mode, setMode] = useState<AccommodationDialogModeType>(
    history.state?.mode ?? AccommodationDialogMode.View,
  );
  const { id: accommodationId } = params;
  const accommodation = useBoundStore(
    useShallow((state) => state.getAccommodation(accommodationId)),
  );
  return (
    <>
      {!accommodation ? (
        <Dialog.Content maxWidth={CommonDialogMaxWidth}>
          <Dialog.Title>Accommodation</Dialog.Title>
          <Dialog.Description>
            <Spinner />
          </Dialog.Description>
        </Dialog.Content>
      ) : mode === AccommodationDialogMode.View ? (
        <AccommodationDialogContentView
          accommodation={accommodation}
          setMode={setMode}
        />
      ) : mode === AccommodationDialogMode.Edit ? (
        <AccommodationDialogContentEdit
          accommodation={accommodation}
          setMode={setMode}
        />
      ) : mode === AccommodationDialogMode.Delete ? (
        <AccommodationDialogContentDelete
          accommodation={accommodation}
          setMode={setMode}
        />
      ) : null}
    </>
  );
}
export function AccommodationDialog({
  params,
}: RouteComponentProps<{ id: string }>) {
  return (
    <Dialog.Root open>
      <AccommodationDialogContent params={params} />
    </Dialog.Root>
  );
}
