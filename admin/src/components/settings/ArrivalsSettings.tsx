import React from 'react';

interface ArrivalsSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImage: boolean;
}

export default function ArrivalsSettings({ settings, setSettings, handleImageUpload, uploadingImage }: ArrivalsSettingsProps) {
    const arrivals = settings.content.newArrivals;

    const updateArrivals = (updatedFields: any) => {
        setSettings({
            ...settings,
            content: {
                ...settings.content,
                newArrivals: { ...arrivals, ...updatedFields }
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">New Arrivals Section</h3>
                    <p className="text-sm text-gray-500">Showcase your latest products.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.layout.newArrivalsEnabled}
                        onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, newArrivalsEnabled: e.target.checked } })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        className="input"
                        value={arrivals.title || ''}
                        onChange={(e) => updateArrivals({ title: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Description</label>
                    <textarea
                        className="input min-h-[60px]"
                        value={arrivals.subtitle || ''}
                        onChange={(e) => updateArrivals({ subtitle: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promo Badge Text</label>
                    <input
                        type="text"
                        className="input"
                        value={arrivals.promoText || ''}
                        onChange={(e) => updateArrivals({ promoText: e.target.value })}
                        placeholder="e.g. SHOP NEW RELEASE"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Background Asset</label>
                <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
                    {arrivals.backgroundImage ? (
                        <div className="aspect-[21/9] w-full relative">
                            <img src={arrivals.backgroundImage} alt="Arrivals Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="btn btn-sm bg-white text-gray-900 border-none hover:bg-white/90">
                                    Replace
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateArrivals({ backgroundImage: '' })}
                                    className="btn btn-sm bg-red-500 text-white border-none"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center p-12 cursor-pointer text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-900">Upload Section Image</span>
                            <span className="text-xs text-gray-400 mt-1">Recommended: 1920x800px</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
