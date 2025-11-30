import { ClockPlugin } from './clock';
import { WeatherPlugin } from './weather';
import { MoviesPlugin } from './movies';
import { CryptoPlugin } from './crypto';
import { WorldClockPlugin } from './worldclock';
import { ISSPlugin } from './iss';
import { SunPlugin } from './sun';
import { JokesPlugin } from './jokes';
import { FactsPlugin } from './facts';
import { HackerNewsPlugin } from './hackernews';
import { HolidaysPlugin } from './holidays';
import { CatFactsPlugin } from './catfacts';
import { SystemPlugin } from './system';
import { LEDPlugin } from './types';

export const PLUGIN_REGISTRY: Record<string, LEDPlugin> = {
    [ClockPlugin.id]: ClockPlugin,
    [WeatherPlugin.id]: WeatherPlugin,
    [MoviesPlugin.id]: MoviesPlugin,
    [CryptoPlugin.id]: CryptoPlugin,
    [WorldClockPlugin.id]: WorldClockPlugin,
    [ISSPlugin.id]: ISSPlugin,
    [SunPlugin.id]: SunPlugin,
    [JokesPlugin.id]: JokesPlugin,
    [FactsPlugin.id]: FactsPlugin,
    [HackerNewsPlugin.id]: HackerNewsPlugin,
    [HolidaysPlugin.id]: HolidaysPlugin,
    [CatFactsPlugin.id]: CatFactsPlugin,
    [SystemPlugin.id]: SystemPlugin,
};

export type PluginId = keyof typeof PLUGIN_REGISTRY;
