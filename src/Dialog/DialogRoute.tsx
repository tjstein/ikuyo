import { Dialog } from '@radix-ui/themes';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { type RouteComponentProps, useLocation } from 'wouter';
import { CommonDialogMaxWidth } from './ui';

export const DialogMode = {
  View: 'view',
  Edit: 'edit',
  Delete: 'delete',
} as const;
export type DialogModeType = (typeof DialogMode)[keyof typeof DialogMode];

type DialogStateType = {
  mode: DialogModeType;
  open: boolean;
  closable: boolean;
};
type DialogActionType =
  | {
      type: 'setMode';
      mode: DialogModeType;
    }
  | {
      type: 'setClosable';
      closable: boolean;
    }
  | { type: 'requestDismissDialog' };

export type DialogContentProps<DataType> = {
  data: DataType | undefined;
  setMode: (mode: DialogModeType) => void;
  dialogContentProps: Dialog.ContentProps;
  setDialogClosable: (closable: boolean) => void;
};
export function createDialogRoute<DataType>({
  DialogContentView,
  DialogContentEdit,
  DialogContentDelete,
  getData,
}: {
  getData: (id: string) => DataType | undefined;
  DialogContentView: React.ComponentType<DialogContentProps<DataType>>;
  DialogContentEdit: React.ComponentType<DialogContentProps<DataType>>;
  DialogContentDelete: React.ComponentType<DialogContentProps<DataType>>;
}) {
  function DialogRoute({ params }: RouteComponentProps<{ id: string }>) {
    const [, setLocation] = useLocation();
    const [state, dispatch] = useReducer(
      (state: DialogStateType, action: DialogActionType) => {
        switch (action.type) {
          case 'setMode':
            return {
              ...state,
              closable: action.mode === DialogMode.View,
              mode: action.mode,
            };
          case 'setClosable':
            return {
              ...state,
              closable: action.closable,
            };
          case 'requestDismissDialog': {
            if (state.open && state.closable) {
              return {
                ...state,
                open: false,
              };
            }
            return state;
          }
          default:
            return state;
        }
      },
      {
        mode: history.state?.mode ?? DialogMode.View,
        open: true,
        closable: (history.state?.mode ?? DialogMode.View) === DialogMode.View,
      },
    );
    const setMode = useCallback((mode: DialogModeType) => {
      dispatch({ type: 'setMode', mode });
    }, []);
    const setDialogClosable = useCallback((closable: boolean) => {
      dispatch({ type: 'setClosable', closable });
    }, []);
    const mode = state.mode;
    useEffect(() => {
      if (!state.open) {
        setLocation('');
      }
    }, [state.open, setLocation]);

    const data = getData(params.id);

    const dialogContentProps = useMemo(() => {
      return {
        onEscapeKeyDown: (e) => {
          dispatch({ type: 'requestDismissDialog' });
          e.preventDefault();
        },
        onInteractOutside: (e) => {
          dispatch({ type: 'requestDismissDialog' });
          e.preventDefault();
        },
        maxWidth: CommonDialogMaxWidth,
      } satisfies Dialog.ContentProps;
    }, []);

    return (
      <Dialog.Root open={state.open}>
        {mode === DialogMode.View ? (
          <DialogContentView
            data={data}
            setMode={setMode}
            dialogContentProps={dialogContentProps}
            setDialogClosable={setDialogClosable}
          />
        ) : mode === DialogMode.Edit ? (
          <DialogContentEdit
            data={data}
            setMode={setMode}
            dialogContentProps={dialogContentProps}
            setDialogClosable={setDialogClosable}
          />
        ) : mode === DialogMode.Delete ? (
          <DialogContentDelete
            data={data}
            setMode={setMode}
            dialogContentProps={dialogContentProps}
            setDialogClosable={setDialogClosable}
          />
        ) : null}
      </Dialog.Root>
    );
  }
  return DialogRoute;
}
