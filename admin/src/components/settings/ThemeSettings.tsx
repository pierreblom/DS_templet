import React from 'react';

interface ThemeSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function ThemeSettings({ settings, setSettings }: ThemeSettingsProps) {
    const handleColorChange = (path: string[], value: string) => {
        const newSettings = { ...settings };
        let current = newSettings;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setSettings(newSettings);
    };

    const handleSchemeChange = (schemeId: string, prop: string, value: string) => {
        const updatedSchemes = { ...settings.theme.schemes };
        updatedSchemes[schemeId] = { ...updatedSchemes[schemeId], [prop]: value };
        setSettings({ ...settings, theme: { ...settings.theme, schemes: updatedSchemes } });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Theme Colors</h3>
                <p className="text-sm text-gray-500 mb-6">These colors are used globally across your store.</p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                        { label: 'Primary Brand Color', key: 'primaryColor' },
                        { label: 'Secondary Accent', key: 'secondaryColor' },
                        { label: 'Global Background', key: 'backgroundColor' },
                        { label: 'Main Text Color', key: 'textColor' },
                        { label: 'Header Background', key: 'headerBackgroundColor' },
                    ].map((item) => (
                        <div key={item.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {item.label}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <input
                                        type="color"
                                        value={settings.theme[item.key] || '#000000'}
                                        onChange={(e) => handleColorChange(['theme', item.key], e.target.value)}
                                        className="h-10 w-10 border border-gray-200 p-0.5 rounded-lg cursor-pointer bg-white"
                                    />
                                    <div className="absolute inset-0 rounded-lg ring-1 ring-black ring-opacity-5 pointer-events-none"></div>
                                </div>
                                <input
                                    type="text"
                                    value={settings.theme[item.key]}
                                    onChange={(e) => handleColorChange(['theme', item.key], e.target.value)}
                                    className="input font-mono text-xs uppercase w-32"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Color Schemes</h3>
                <p className="text-sm text-gray-500 mb-6">Schemes allow you to quickly change the look of sections.</p>

                <div className="space-y-4">
                    {['scheme-1', 'scheme-2', 'scheme-3', 'scheme-4'].map((schemeId, index) => (
                        <details key={schemeId} className="group border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300">
                            <summary className="flex items-center justify-between px-5 py-4 bg-gray-50 cursor-pointer list-none select-none">
                                <span className="text-sm font-bold text-gray-700 capitalize flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                                    Scheme {index + 1}
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-1">
                                        {['background', 'text', 'primary'].map(prop => (
                                            <div
                                                key={prop}
                                                className="w-5 h-5 rounded-full border border-white ring-1 ring-black ring-opacity-5"
                                                style={{ backgroundColor: settings.theme.schemes?.[schemeId]?.[prop] || '#ffffff' }}
                                            ></div>
                                        ))}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </summary>
                            <div className="p-6 bg-white grid grid-cols-2 gap-6">
                                {['background', 'text', 'primary', 'secondary'].map(prop => (
                                    <div key={prop} className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {prop}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={settings.theme.schemes?.[schemeId]?.[prop] || '#000000'}
                                                    onChange={(e) => handleSchemeChange(schemeId, prop, e.target.value)}
                                                    className="h-8 w-8 border border-gray-200 p-0.5 rounded-md cursor-pointer bg-white"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={settings.theme.schemes?.[schemeId]?.[prop] || '#000000'}
                                                onChange={(e) => handleSchemeChange(schemeId, prop, e.target.value)}
                                                className="input font-mono text-[10px] uppercase w-24 h-8"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Typography</h3>
                <p className="text-sm text-gray-500 mb-6">Control the fonts used throughout your site.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Body Font Family</label>
                        <select
                            className="input"
                            value={settings.theme.typography?.fontFamily || ''}
                            onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, typography: { ...settings.theme.typography, fontFamily: e.target.value } } })}
                        >
                            <option value="Outfit, sans-serif">Outfit (Clean, Modern)</option>
                            <option value="Inter, sans-serif">Inter (Highly Readable)</option>
                            <option value="Roboto, sans-serif">Roboto (System Style)</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Heading Font Family</label>
                        <select
                            className="input text-lg font-serif"
                            value={settings.theme.typography?.headingFontFamily || ''}
                            onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, typography: { ...settings.theme.typography, headingFontFamily: e.target.value } } })}
                        >
                            <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                            <option value="Merriweather, serif">Merriweather (Classic)</option>
                            <option value="Lora, serif">Lora (Sophisticated)</option>
                            <option value="Montserrat, sans-serif">Montserrat (Geometric)</option>
                            <option value="Oswald, sans-serif">Oswald (Bold)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Buttons & Cards Corners</label>
                        <select
                            className="input"
                            value={settings.theme.shapes?.borderRadius || ''}
                            onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, shapes: { ...settings.theme.shapes, borderRadius: e.target.value } } })}
                        >
                            <option value="0px">Sharp Square (0px)</option>
                            <option value="4px">Subtle Round (4px)</option>
                            <option value="8px">Modern Round (8px)</option>
                            <option value="12px">Friendly Round (12px)</option>
                            <option value="16px">Bold Round (16px)</option>
                            <option value="24px">Pill Style (24px)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Global Space (Padding)</label>
                        <select
                            className="input"
                            value={settings.theme.spacing?.globalPadding || ''}
                            onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, spacing: { ...settings.theme.spacing, globalPadding: e.target.value } } })}
                        >
                            <option value="1rem">Compact</option>
                            <option value="1.5rem">Clean (Default)</option>
                            <option value="2rem">Spacious</option>
                            <option value="3rem">Very Wide</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
