import React from 'react';

interface HeroSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImage: boolean;
}

export default function HeroSettings({ settings, setSettings, handleImageUpload, uploadingImage }: HeroSettingsProps) {
    const hero = settings.content.hero;

    const updateHero = (updatedFields: any) => {
        setSettings({
            ...settings,
            content: {
                ...settings.content,
                hero: { ...hero, ...updatedFields }
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
                    <p className="text-sm text-gray-500">The first thing visitors see on your site.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.layout.heroEnabled}
                        onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, heroEnabled: e.target.checked } })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading (Title)</label>
                    <input
                        type="text"
                        className="input text-lg font-bold"
                        value={hero.title || ''}
                        onChange={(e) => updateHero({ title: e.target.value })}
                        placeholder="e.g. Elevate Your Everyday"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-heading</label>
                    <textarea
                        className="input min-h-[80px]"
                        value={hero.subtitle || ''}
                        onChange={(e) => updateHero({ subtitle: e.target.value })}
                        placeholder="e.g. Discover our new collection of premium essentials."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                        <input
                            type="text"
                            className="input"
                            value={hero.ctaText || ''}
                            onChange={(e) => updateHero({ ctaText: e.target.value })}
                            placeholder="Shop Now"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                        <input
                            type="text"
                            className="input"
                            value={hero.ctaLink || ''}
                            onChange={(e) => updateHero({ ctaLink: e.target.value })}
                            placeholder="/collections/all"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Visual Styling</h4>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Background Image</label>
                        <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-terracotta transition-colors">
                            {settings.media.heroBackground ? (
                                <div className="aspect-video w-full overflow-hidden">
                                    <img src={settings.media.heroBackground} alt="Hero Background" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="btn btn-sm bg-white text-gray-900 border-none hover:bg-white/90">
                                            Change
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, media: { ...settings.media, heroBackground: '' } })}
                                            className="btn btn-sm bg-red-500 text-white border-none hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-8 cursor-pointer text-center">
                                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-500">Upload Banner</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Alignment</label>
                            <div className="flex bg-gray-50 p-1 rounded-lg">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        type="button"
                                        onClick={() => updateHero({ textAlign: align })}
                                        className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${hero.textAlign === align ? 'bg-white text-terracotta shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Title Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={hero.titleColor || '#000000'}
                                    onChange={(e) => updateHero({ titleColor: e.target.value })}
                                    className="h-8 w-8 rounded-md border border-gray-200 p-0.5"
                                />
                                <input
                                    type="text"
                                    value={hero.titleColor || '#000000'}
                                    onChange={(e) => updateHero({ titleColor: e.target.value })}
                                    className="input text-[10px] font-mono w-24 h-8 uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <details className="mt-6 group">
                <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer list-none select-none">
                    <span className="text-sm font-bold text-gray-700">Advanced: Custom CSS</span>
                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="p-4 border border-t-0 border-gray-50 rounded-b-xl">
                    <p className="text-xs text-gray-400 mb-3 font-medium">Add CSS code to style only this section.</p>
                    <textarea
                        className="input font-mono text-sm min-h-[120px] bg-gray-900 text-green-400 p-4"
                        value={hero.customCSS || ''}
                        onChange={(e) => updateHero({ customCSS: e.target.value })}
                        spellCheck={false}
                        placeholder="h2 { color: red; }"
                    />
                </div>
            </details>
        </div>
    );
}
