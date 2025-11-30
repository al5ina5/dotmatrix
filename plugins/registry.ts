import { TextPlugin } from './text';
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
import { StocksPlugin } from './stocks';
import { SportsPlugin } from './sports';
import { CountdownPlugin } from './countdown';
import { WordOfDayPlugin } from './wordofday';
import { RedditPlugin } from './reddit';
import { CustomAPIPlugin } from './customapi';
import { LEDPlugin } from './types';

export const PLUGIN_REGISTRY: Record<string, LEDPlugin> = {
    [TextPlugin.id]: TextPlugin,
    [ClockPlugin.id]: ClockPlugin,
    [WeatherPlugin.id]: WeatherPlugin,
    [MoviesPlugin.id]: MoviesPlugin,
    [CryptoPlugin.id]: CryptoPlugin,
    [StocksPlugin.id]: StocksPlugin,
    [SportsPlugin.id]: SportsPlugin,
    [CountdownPlugin.id]: CountdownPlugin,
    [WorldClockPlugin.id]: WorldClockPlugin,
    [ISSPlugin.id]: ISSPlugin,
    [SunPlugin.id]: SunPlugin,
    [JokesPlugin.id]: JokesPlugin,
    [FactsPlugin.id]: FactsPlugin,
    [HackerNewsPlugin.id]: HackerNewsPlugin,
    [HolidaysPlugin.id]: HolidaysPlugin,
    [CatFactsPlugin.id]: CatFactsPlugin,
    [WordOfDayPlugin.id]: WordOfDayPlugin,
    [RedditPlugin.id]: RedditPlugin,
    [SystemPlugin.id]: SystemPlugin,
    [CustomAPIPlugin.id]: CustomAPIPlugin,
};

export type PluginId = keyof typeof PLUGIN_REGISTRY;
