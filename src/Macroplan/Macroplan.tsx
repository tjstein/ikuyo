import { Box, ContextMenu, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { dangerToken } from '../ui';
import s from './Macroplan.module.css';
import type { DbMacroplanWithTrip } from './db';

import type * as React from 'react';
import type { TripViewModeType } from '../Trip/TripViewMode';
import { useMacroplanDialogHooks } from './macroplanDialogHooks';
const responsiveTextSize = { initial: '1' as const };

export function Macroplan({
  className,
  macroplan,
  style,
  tripViewMode,
}: {
  className?: string;
  macroplan: DbMacroplanWithTrip;
  style?: React.CSSProperties;
  tripViewMode: TripViewModeType;
}) {
  const {
    openMacroplanDeleteDialog,
    openMacroplanEditDialog,
    openMacroplanViewDialog,
  } = useMacroplanDialogHooks(tripViewMode, macroplan.id);

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
