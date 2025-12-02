import { withPluginErrorHandling } from '@/lib/pluginHelpers';
import { LEDPlugin } from './types';

interface HolidayParams {
    countryCode: string; // e.g. 'US'
}

export const HolidaysPlugin: LEDPlugin<HolidayParams> = {
    id: 'holidays',
    name: 'Public Holidays',
    description: 'Upcoming public holidays',
    defaultInterval: 86400000,

    fetch: async ({ countryCode = 'US' }) => withPluginErrorHandling(
        'holidays',
        async () => {
            const year = new Date().getFullYear();
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
            if (!res.ok) throw new Error('Failed to fetch holidays');
            const holidays = await res.json();

            // Find next upcoming holiday
            const now = new Date();
            const upcoming = holidays.filter((h: any) => new Date(h.date) >= now);

            if (upcoming.length === 0) return 'No more holidays this year!';

            const next = upcoming[0];
            const nextDate = new Date(next.date);
            const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const dayText = daysUntil === 1 ? 'day' : 'days';

            return `${daysUntil} ${dayText} until ${next.name}`;
        },
        'Holiday Error'
    )
};
