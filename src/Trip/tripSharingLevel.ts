export const TripSharingLevel = {
  Private: 0,
  Group: 1,
  Public: 2,
} as const;
export type TripSharingLevelType =
  (typeof TripSharingLevel)[keyof typeof TripSharingLevel];
