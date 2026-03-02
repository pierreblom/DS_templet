import React from 'react';

interface HomepageSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    setActiveTab: (tab: any) => void;
}

export default function HomepageSettings({ settings, setSettings, setActiveTab }: HomepageSettingsProps) {
    const sections = [
        { id: 'hero', name: 'Hero / Banner', icon: 'M4 6h16M4 12h16M4 18h16', enabledKey: 'heroEnabled', tab: 'content' },
        { id: 'featured', name: 'Featured Collection', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', enabledKey: 'trailFavoritesEnabled', tab: 'featuredCollection' },
        { id: 'slideshow', name: 'Slideshow', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4', enabledKey: 'slideshowEnabled', tab: 'slideshow' },
        { id: 'arrivals', name: 'New Arrivals', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', enabledKey: 'newArrivalsEnabled', tab: 'content' },
        { id: 'customer', name: 'Customer Feedbacks', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', enabledKey: 'customerLoveEnabled', tab: 'content' },
        { id: 'value', name: 'Value Propositions', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', enabledKey: 'valuePropsEnabled', tab: 'content' },
        { id: 'newsletter', name: 'Newsletter Signup', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', enabledKey: 'newsletterEnabled', tab: 'content' },
    ];

    const toggleSection = (key: string) => {
        setSettings({
            ...settings,
            layout: {
                ...settings.layout,
                [key]: !settings.layout[key]
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Homepage Layout</h3>
                <p className="text-sm text-gray-500 mb-6">Enable or disable sections and click to edit their content.</p>

                <div className="space-y-2">
                    {sections.map((section) => (
                        <div key={section.id} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-terracotta hover:shadow-md transition-all">
                            <button
                                type="button"
                                onClick={() => setActiveTab(section.tab)}
                                className="flex items-center gap-4 flex-1 text-left"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-terracotta group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">{section.name}</span>
                                    <span className="text-xs text-gray-400 font-medium">Click to edit details</span>
                                </div>
                            </button>

                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${settings.layout[section.enabledKey] ? 'text-green-500' : 'text-gray-300'}`}>
                                    {settings.layout[section.enabledKey] ? 'Visible' : 'Hidden'}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.layout[section.enabledKey]}
                                        onChange={() => toggleSection(section.enabledKey)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Pro Tip</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Use the toggles to hide sections you don't need. Keep your homepage clean for better conversion!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
