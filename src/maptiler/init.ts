import { config } from '@maptiler/sdk';

if (!process.env.MAPTILER_API_KEY) {
  throw new Error('process.env.MAPTILER_API_KEY is not set');
}
config.apiKey = process.env.MAPTILER_API_KEY;
