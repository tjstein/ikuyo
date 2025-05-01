import { type GeocodingOptions, geocoding } from '@maptiler/sdk';
import {
  Button,
  Flex,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useCallback, useId, useReducer, useState } from 'react';
import { useBoundStore } from '../data/store';
import { dangerToken } from '../ui';
import { ActivityFormMode } from './ActivityFormMode';
import { ActivityMap } from './ActivityMap';
import { setNewActivityTimestamp } from './activitiyStorage';
import { dbAddActivity, dbUpdateActivity } from './db';
import { getDateTimeFromDatetimeLocalInput } from './time';

interface LocationCoordinate {
  lat: number;
  lng: number;
}
interface LocationCoordinateState {
  enabled: boolean;
  lat: number | undefined;
  lng: number | undefined;
}

function coordinateStateReducer(
  state: LocationCoordinateState,
  action:
    | { type: 'setCoordinate'; lat: number; lng: number }
    | {
        type: 'setEnabled';
        lat: number | undefined;
        lng: number | undefined;
      }
    | {
        type: 'setDisabled';
      },
): LocationCoordinateState {
  switch (action.type) {
    case 'setEnabled':
      return {
        ...state,
        lat: action.lat,
        lng: action.lng,
        enabled: true,
      };
    case 'setDisabled':
      return {
        ...state,
        enabled: false,
      };
    case 'setCoordinate':
      return {
        ...state,
        lat: action.lat,
        lng: action.lng,
      };
    default:
      return state;
  }
}

export function ActivityForm({
  mode,
  activityId,
  tripId,
  tripStartStr,
  tripEndStr,
  tripTimeZone,
  tripRegion,
  activityTitle,
  activityStartStr,
  activityEndStr,
  activityLocation,
  activityLocationLng,
  activityLocationLat,
  activityDescription,
}: {
  mode: ActivityFormMode;
  activityId?: string;
  tripId?: string;
  tripStartStr: string;
  tripEndStr: string;
  tripTimeZone: string;
  tripRegion: string;
  activityTitle: string;
  activityStartStr: string;
  activityEndStr: string;
  activityLocation: string;
  activityLocationLat: number | undefined;
  activityLocationLng: number | undefined;
  activityDescription: string;
}) {
  const idForm = useId();
  const idTitle = useId();
  const idTimeStart = useId();
  const idTimeEnd = useId();
  const idLocation = useId();
  const idDescription = useId();
  const idCoordinates = useId();
  const publishToast = useBoundStore((state) => state.publishToast);
  const popDialog = useBoundStore((state) => state.popDialog);
  const [errorMessage, setErrorMessage] = useState('');

  const [coordinateState, dispatchCoordinateState] = useReducer(
    coordinateStateReducer,
    {
      enabled:
        activityLocationLat !== undefined && activityLocationLng !== undefined,
      lat: activityLocationLat,
      lng: activityLocationLng,
    },
  );
  const setCoordinateEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        if (coordinateState.lat && coordinateState.lng) {
          dispatchCoordinateState({
            type: 'setEnabled',
            lat: coordinateState.lat,
            lng: coordinateState.lng,
          });
        } else {
          const elLocation = document.getElementById(
            idLocation,
          ) as HTMLInputElement;
          const location = elLocation.value;
          let lat: number | undefined;
          let lng: number | undefined;
          const geocodingOptions: GeocodingOptions = {
            language: 'en',
            limit: 5,
            country: [tripRegion.toLowerCase()],
            types: ['poi'],
          };
          console.log('geocoding: request', location, geocodingOptions);
          if (location) {
            const res = await geocoding.forward(location, geocodingOptions);
            console.log('geocoding: response', res);
            [lng, lat] = res?.features[0]?.center ?? [];
          }
          dispatchCoordinateState({
            type: 'setEnabled',
            lat: lat,
            lng: lng,
          });
        }
      } else {
        dispatchCoordinateState({
          type: 'setDisabled',
        });
      }
    },
    [idLocation, tripRegion, coordinateState.lat, coordinateState.lng],
  );
  const setCoordinateState = useCallback(
    async (coordinate: LocationCoordinate) => {
      dispatchCoordinateState({
        type: 'setCoordinate',
        lat: coordinate.lat,
        lng: coordinate.lng,
      });
    },
    [],
  );
  console.log('coordinateState', coordinateState);

  const handleSubmit = useCallback(() => {
    return async (elForm: HTMLFormElement) => {
      setErrorMessage('');
      // TIL: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity
      // HTMLInputElement.setCustomValidity()
      // seems quite hard to use... need to call setCustomValidity again after invalid, before "submit" event
      if (!elForm.reportValidity()) {
        return;
      }
      const formData = new FormData(elForm);
      const title = (formData.get('title') as string | null) ?? '';
      const description = (formData.get('description') as string | null) ?? '';
      const location = (formData.get('location') as string | null) ?? '';
      const timeStartString =
        (formData.get('startTime') as string | null) ?? '';
      const timeEndString = (formData.get('endTime') as string | null) ?? '';
      const timeStartDate = getDateTimeFromDatetimeLocalInput(
        timeStartString,
        tripTimeZone,
      );
      const timeEndDate = getDateTimeFromDatetimeLocalInput(
        timeEndString,
        tripTimeZone,
      );
      console.log('ActivityForm', {
        mode,
        activityId,
        description,
        location,
        tripId,
        title,
        tripTimeZone,
        timeStartString,
        timeEndString,
        startTime: timeStartDate,
        endTime: timeEndDate,
      });
      if (!title || !timeStartString || !timeEndString) {
        return;
      }
      if (timeEndDate.diff(timeStartDate).as('minute') < 0) {
        setErrorMessage('End time must be after start time');
        return;
      }
      if (!timeEndDate.hasSame(timeStartDate, 'day')) {
        setErrorMessage('Activity must occur on same day');
        return;
      }
      if (mode === ActivityFormMode.Edit && activityId) {
        await dbUpdateActivity({
          id: activityId,
          title,
          description,
          location,
          locationLat: coordinateState.enabled
            ? coordinateState.lat
            : undefined,
          locationLng: coordinateState.enabled
            ? coordinateState.lng
            : undefined,
          timestampStart: timeStartDate.toMillis(),
          timestampEnd: timeEndDate.toMillis(),
        });
        publishToast({
          root: {},
          title: { children: `Activity ${title} edited` },
          close: {},
        });
      } else if (mode === ActivityFormMode.New && tripId) {
        setNewActivityTimestamp({
          timestamp: timeEndDate.toMillis(),
          tripId: tripId,
        });
        await dbAddActivity(
          {
            title,
            description,
            location,
            locationLat: coordinateState.enabled
              ? coordinateState.lat
              : undefined,
            locationLng: coordinateState.enabled
              ? coordinateState.lng
              : undefined,
            timestampStart: timeStartDate.toMillis(),
            timestampEnd: timeEndDate.toMillis(),
          },
          {
            tripId: tripId,
          },
        );
        publishToast({
          root: {},
          title: { children: `Activity ${title} added` },
          close: {},
        });
      }

      elForm.reset();
      popDialog();
    };
  }, [
    activityId,
    mode,
    publishToast,
    popDialog,
    tripId,
    tripTimeZone,
    coordinateState,
  ]);

  return (
    <form
      id={idForm}
      onInput={() => {
        setErrorMessage('');
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const elForm = e.currentTarget;
        void handleSubmit()(elForm);
      }}
    >
      <Flex direction="column" gap="2">
        <Text color={dangerToken} size="2">
          {errorMessage}&nbsp;
        </Text>
        <Text as="label" htmlFor={idTitle}>
          Activity name{' '}
          <Text weight="light" size="1">
            (required)
          </Text>
        </Text>
        <TextField.Root
          defaultValue={activityTitle}
          placeholder="Enter activity name"
          name="title"
          type="text"
          id={idTitle}
          required
        />
        <Text as="label" htmlFor={idLocation}>
          Location
        </Text>
        <TextArea
          defaultValue={activityLocation}
          placeholder="Enter location name"
          name="location"
          id={idLocation}
          style={{ minHeight: 80 }}
        />
        <Text as="label" htmlFor={idCoordinates}>
          Set location coordinates
        </Text>
        <Switch
          name="coordinatesEnabled"
          id={idCoordinates}
          checked={coordinateState.enabled}
          onCheckedChange={setCoordinateEnabled}
        />
        {coordinateState.enabled ? (
          <ActivityMap
            mapOptions={{
              lng: coordinateState.lng ?? 0,
              lat: coordinateState.lat ?? 0,
              zoom: 9,
            }}
            marker={
              coordinateState.lng && coordinateState.lat
                ? {
                    lng: coordinateState.lng,
                    lat: coordinateState.lat,
                  }
                : undefined
            }
            setCoordinate={setCoordinateState}
          />
        ) : null}

        <Text as="label" htmlFor={idTimeStart}>
          Start time{' '}
          <Text weight="light" size="1">
            (required)
          </Text>
        </Text>
        <TextField.Root
          id={idTimeStart}
          name="startTime"
          type="datetime-local"
          min={tripStartStr}
          max={tripEndStr}
          defaultValue={activityStartStr}
          required
        />
        <Text as="label" htmlFor={idTimeEnd}>
          End time{' '}
          <Text weight="light" size="1">
            (required)
          </Text>
        </Text>
        <TextField.Root
          id={idTimeEnd}
          name="endTime"
          type="datetime-local"
          min={tripStartStr}
          max={tripEndStr}
          defaultValue={activityEndStr}
          required
        />
        <Text as="label" htmlFor={idDescription}>
          Description
        </Text>
        <TextArea
          defaultValue={activityDescription}
          placeholder="Enter description"
          name="description"
          id={idDescription}
          style={{ minHeight: 240 }}
        />
      </Flex>
      <Flex gap="3" mt="5" justify="end">
        <Button
          type="button"
          size="2"
          variant="soft"
          color="gray"
          onClick={popDialog}
        >
          Cancel
        </Button>
        <Button type="submit" size="2" variant="solid">
          Save
        </Button>
      </Flex>
    </form>
  );
}
