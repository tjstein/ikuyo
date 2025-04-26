import { Box, ContextMenu, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { useState } from 'react';
import { dangerToken } from '../ui';
import s from './Macroplan.module.css';
import { MacroplanDeleteDialog } from './MacroplanDeleteDialog';
import { MacroplanEditDialog } from './MacroplanEditDialog';
import { MacroplanViewDialog } from './MacroplanViewDialog';
import type { DbMacroplanWithTrip } from './db';

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

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
            onClick={() => {
              setViewDialogOpen(true);
            }}
          >
            <Text as="div" size={responsiveTextSize} weight="bold">
              {macroplan.name}
            </Text>
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>{macroplan.name}</ContextMenu.Label>
          <ContextMenu.Item
            onClick={() => {
              setViewDialogOpen(true);
            }}
          >
            View
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              setEditDialogOpen(true);
            }}
          >
            Edit
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item
            color={dangerToken}
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      {viewDialogOpen ? (
        <MacroplanViewDialog
          macroplan={macroplan}
          dialogOpen={viewDialogOpen}
          setDialogOpen={setViewDialogOpen}
          setEditDialogOpen={setEditDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
        />
      ) : null}
      {editDialogOpen ? (
        <MacroplanEditDialog
          macroplan={macroplan}
          dialogOpen={editDialogOpen}
          setDialogOpen={setEditDialogOpen}
        />
      ) : null}
      {deleteDialogOpen ? (
        <MacroplanDeleteDialog
          macroplan={macroplan}
          dialogOpen={deleteDialogOpen}
          setDialogOpen={setDeleteDialogOpen}
        />
      ) : null}
    </>
  );
}
