import React from 'react';

interface FeaturedSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function FeaturedCollectionSettings({ settings, setSettings }: FeaturedSettingsProps) {
    const feat = settings.featuredCollection;

    const updateFeat = (updatedFields: any) => {
        setSettings({
            ...settings,
            featuredCollection: { ...feat, ...updatedFields }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Featured Collection</h3>
                    <p className="text-sm text-gray-500">Pick which products to show on the main grid.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.layout.trailFavoritesEnabled}
                        onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, trailFavoritesEnabled: e.target.checked } })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Collection</label>
                    <select className="input" value={feat.collection} onChange={(e) => updateFeat({ collection: e.target.value })}>
                        <option value="all">All Products</option>
                        <option value="new">Newest First</option>
                        <option value="trending">Trending</option>
                        <option value="sale">On Sale</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Show</label>
                    <input
                        type="number"
                        className="input"
                        value={feat.productCount}
                        onChange={(e) => updateFeat({ productCount: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Grid Layout</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Columns</label>
                        <select className="input" value={feat.columns} onChange={(e) => updateFeat({ columns: parseInt(e.target.value) })}>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns (Default)</option>
                            <option value={5}>5 Columns</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Style</label>
                        <select className="input" value={feat.mobileColumns} onChange={(e) => updateFeat({ mobileColumns: parseInt(e.target.value) })}>
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns (Grid)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
                    <input
                        type="checkbox"
                        id="carousel-mobile"
                        checked={feat.carouselOnMobile}
                        onChange={(e) => updateFeat({ carouselOnMobile: e.target.checked })}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="carousel-mobile" className="text-sm font-medium cursor-pointer">
                        Enable Swiper/Carousel on Mobile
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Spacing & Gaps</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase text-right">Horizontal Gap: {feat.horizontalGap}px</label>
                        <input
                            type="range"
                            min="0" max="64" step="4"
                            className="w-full accent-terracotta"
                            value={feat.horizontalGap}
                            onChange={(e) => updateFeat({ horizontalGap: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase text-right">Vertical Gap: {feat.verticalGap}px</label>
                        <input
                            type="range"
                            min="0" max="100" step="4"
                            className="w-full accent-terracotta"
                            value={feat.verticalGap}
                            onChange={(e) => updateFeat({ verticalGap: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
