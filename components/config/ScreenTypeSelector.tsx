/**
 * Screen Type Selector Component
 * 
 * Dropdown to select screen type when adding a new screen
 * Modular design - easy to add new screen types
 */

import { Select } from '../ui/Select';

export type ScreenTypeOption = {
    value: 'multiline' | 'fullscreen' | 'singleline';
    label: string;
    description?: string;
};

const SCREEN_TYPE_OPTIONS: ScreenTypeOption[] = [
    {
        value: 'multiline',
        label: 'Multi-Line Display',
        description: 'Multiple scrolling text rows'
    },
    {
        value: 'fullscreen',
        label: 'Fullscreen Effect',
        description: 'Background effects (Matrix Rain, Particles, etc.)'
    },
    {
        value: 'singleline',
        label: 'Single Line',
        description: 'Single scrolling text row'
    }
];

interface ScreenTypeSelectorProps {
    value?: string;
    onChange: (screenType: 'multiline' | 'fullscreen' | 'singleline') => void;
    className?: string;
}

export function ScreenTypeSelector({ value, onChange, className }: ScreenTypeSelectorProps) {
    const options = [
        { value: '', label: 'Select screen type...' },
        ...SCREEN_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))
    ];

    return (
        <div className={className}>
            <Select
                value={value || ''}
                onChange={(e) => onChange(e.target.value as 'multiline' | 'fullscreen' | 'singleline')}
                options={options}
                label="Screen Type"
            />
            {value && (
                <p className="text-xs text-white/50 mt-1">
                    {SCREEN_TYPE_OPTIONS.find(o => o.value === value)?.description}
                </p>
            )}
        </div>
    );
}

/**
 * Get screen type options (for use in other components)
 */
export function getScreenTypeOptions(): ScreenTypeOption[] {
    return SCREEN_TYPE_OPTIONS;
}

