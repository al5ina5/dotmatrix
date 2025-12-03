import { useConfig } from "@/context/ConfigContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function FilterSettings() {
    const { filters, updateDisplaySetting } = useConfig();

    const handleToggle = (key: keyof typeof filters) => {
        const newFilters = { ...filters, [key]: !filters[key] };
        updateDisplaySetting('filters', newFilters);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Visual Effects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between space-x-2 bg-white/5 p-4 rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="vcr-curve" className="text-base font-medium text-white">VCR Curve</Label>
                        <p className="text-xs text-white/50">Simulates a curved CRT monitor</p>
                    </div>
                    <Switch
                        id="vcr-curve"
                        checked={filters.vcrCurve}
                        onCheckedChange={() => handleToggle('vcrCurve')}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 bg-white/5 p-4 rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="scanlines" className="text-base font-medium text-white">Scanlines</Label>
                        <p className="text-xs text-white/50">Adds horizontal scanlines</p>
                    </div>
                    <Switch
                        id="scanlines"
                        checked={filters.scanlines}
                        onCheckedChange={() => handleToggle('scanlines')}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 bg-white/5 p-4 rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="glitch" className="text-base font-medium text-white">Glitch</Label>
                        <p className="text-xs text-white/50">Random digital noise and artifacts</p>
                    </div>
                    <Switch
                        id="glitch"
                        checked={filters.glitch}
                        onCheckedChange={() => handleToggle('glitch')}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 bg-white/5 p-4 rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="rgb-shift" className="text-base font-medium text-white">RGB Shift</Label>
                        <p className="text-xs text-white/50">Chromatic aberration effect</p>
                    </div>
                    <Switch
                        id="rgb-shift"
                        checked={filters.rgbShift}
                        onCheckedChange={() => handleToggle('rgbShift')}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 bg-white/5 p-4 rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="vignette" className="text-base font-medium text-white">Vignette</Label>
                        <p className="text-xs text-white/50">Darkens the corners of the screen</p>
                    </div>
                    <Switch
                        id="vignette"
                        checked={filters.vignette}
                        onCheckedChange={() => handleToggle('vignette')}
                    />
                </div>
            </div>
        </div>
    );
}
