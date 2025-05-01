import { Box, ContextMenu, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { dangerToken } from '../ui';
import s from './Macroplan.module.css';
import { MacroplanDeleteDialog } from './MacroplanDeleteDialog';
import { MacroplanEditDialog } from './MacroplanEditDialog';
import { MacroplanViewDialog } from './MacroplanViewDialog';
import type { DbMacroplanWithTrip } from './db';

import type * as React from 'react';
import { useCallback } from 'react';
import { useBoundStore } from '../data/store';
export function Macroplan({
  className,
  macroplan,
  style,
}: {
  className?: string;
  macroplan: DbMacroplanWithTrip;
  style?: React.CSSProperties;
}) {
  const responsiveTextSize = { initial: '1' as const };

  const pushDialog = useBoundStore((state) => state.pushDialog);
  const openMacroplanViewDialog = useCallback(() => {
    pushDialog(MacroplanViewDialog, { macroplan });
  }, [macroplan, pushDialog]);
  const openMacroplanEditDialog = useCallback(() => {
    pushDialog(MacroplanEditDialog, { macroplan });
  }, [macroplan, pushDialog]);
  const openMacroplanDeleteDialog = useCallback(() => {
    pushDialog(MacroplanDeleteDialog, { macroplan });
  }, [macroplan, pushDialog]);

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Box
            p={{ initial: '1' }}
            as="div"
            // biome-ignore lint/a11y/useSemanticElements: <Box> need to be a <div>
            role="button"
            tabIndex={0}
            className={clsx(s.macroplan, className)}
            style={style}
            onClick={openMacroplanViewDialog}
          >
            <Text as="div" size={responsiveTextSize} weight="bold">
              {macroplan.name}
            </Text>
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>{macroplan.name}</ContextMenu.Label>
          <ContextMenu.Item onClick={openMacroplanViewDialog}>
            View
          </ContextMenu.Item>
          <ContextMenu.Item onClick={openMacroplanEditDialog}>
            Edit
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item
            color={dangerToken}
            onClick={openMacroplanDeleteDialog}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </>
  );
}
