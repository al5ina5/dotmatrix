import { ClockPlugin } from './clock';
import { WeatherPlugin } from './weather';
import { MoviesPlugin } from './movies';
import { CryptoPlugin } from './crypto';
import { LEDPlugin } from './types';

export const PLUGIN_REGISTRY: Record<string, LEDPlugin> = {
    [ClockPlugin.id]: ClockPlugin,
    [WeatherPlugin.id]: WeatherPlugin,
    [MoviesPlugin.id]: MoviesPlugin,
    [CryptoPlugin.id]: CryptoPlugin,
};

export type PluginId = keyof typeof PLUGIN_REGISTRY;
