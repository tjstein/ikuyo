import { TripViewMode } from '../Trip/TripViewMode';
import { DbAccommodationWithTrip } from './db';
import clsx from 'clsx';
import { Text, Box, ContextMenu } from '@radix-ui/themes';
import style from './Accommodation.module.css';
import { useState } from 'react';
import { AccommodationViewDialog } from './AccommodationViewDialog';
import { AccommodationEditDialog } from './AccommodationEditDialog';
import { AccommodationDeleteDialog } from './AccommodationDeleteDialog';

export function Accommodation({
  className,
  accommodation,
}: {
  className?: string;
  accommodation: DbAccommodationWithTrip;
  tripViewMode: TripViewMode;
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
            role="button"
            tabIndex={0}
            className={clsx(style.accommodation, className)}
            onClick={() => {
              setViewDialogOpen(true);
            }}
          >
            <Text as="div" size={responsiveTextSize} weight="bold">
              {accommodation.name}
            </Text>
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>{accommodation.name}</ContextMenu.Label>
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
            color="red"
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      {viewDialogOpen ? (
        <AccommodationViewDialog
          accommodation={accommodation}
          dialogOpen={viewDialogOpen}
          setDialogOpen={setViewDialogOpen}
          setEditDialogOpen={setEditDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
        />
      ) : null}
      {editDialogOpen ? (
        <AccommodationEditDialog
          accommodation={accommodation}
          dialogOpen={editDialogOpen}
          setDialogOpen={setEditDialogOpen}
        />
      ) : null}
      {deleteDialogOpen ? (
        <AccommodationDeleteDialog
          accommodation={accommodation}
          dialogOpen={deleteDialogOpen}
          setDialogOpen={setDeleteDialogOpen}
        />
      ) : null}
    </>
  );
}
