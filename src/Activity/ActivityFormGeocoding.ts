import { type GeocodingOptions, geocoding } from '@maptiler/sdk';
import { REGIONS_MAP } from '../data/intl/regions';

export async function geocodingRequest(
  currentLocation: string,
  tripRegion: string,
) {
  // if coordinates are not set, use geocoding from location to get the coordinates
  let location = currentLocation;
  const geocodingOptions: GeocodingOptions = {
    language: 'en',
    limit: 5,
    country: [tripRegion.toLowerCase()],
    types: ['poi'],
    apiKey: process.env.MAPTILER_API_KEY,
  };

  if (!location) {
    // if location is not yet set, set location as the trip region
    const region = REGIONS_MAP[tripRegion] ?? 'Japan';
    location = region;
    geocodingOptions.types = ['country'];
  }

  let lat: number | undefined;
  let lng: number | undefined;
  console.log('geocoding: request', location, geocodingOptions);
  if (location) {
    const res = await geocoding.forward(location, geocodingOptions);
    console.log('geocoding: response', res);
    [lng, lat] = res?.features[0]?.center ?? [];
  }
  if (lng === undefined || lat === undefined) {
    // if location coordinate couldn't be found, set location as the trip region
    const region = REGIONS_MAP[tripRegion] ?? 'Japan';
    geocodingOptions.types = ['country'];
    const res = await geocoding.forward(region, geocodingOptions);
    console.log('geocoding: response 2', res);
    [lng, lat] = res?.features[0]?.center ?? [];
  }

  return [lng, lat] as [number, number];
}
