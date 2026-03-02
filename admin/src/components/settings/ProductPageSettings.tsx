import React from 'react';

interface ProductPageSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function ProductPageSettings({ settings, setSettings }: ProductPageSettingsProps) {
    const selectPage = settings.selectPage || {};

    const updateSelect = (updatedFields: any) => {
        setSettings({
            ...settings,
            selectPage: { ...selectPage, ...updatedFields }
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Product Details Page</h3>
                <p className="text-sm text-gray-500 mb-6">Customize how individual products look when selected.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Page Background</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={selectPage.backgroundColor || '#FFFFFF'}
                                onChange={(e) => updateSelect({ backgroundColor: e.target.value })}
                                className="h-10 w-10 rounded-lg border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={selectPage.backgroundColor || '#FFFFFF'}
                                onChange={(e) => updateSelect({ backgroundColor: e.target.value })}
                                className="input font-mono text-xs uppercase w-32"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Header Override Background</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={selectPage.headerBackgroundColor || '#FFFFFF'}
                                onChange={(e) => updateSelect({ headerBackgroundColor: e.target.value })}
                                className="h-10 w-10 rounded-lg border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={selectPage.headerBackgroundColor || '#FFFFFF'}
                                onChange={(e) => updateSelect({ headerBackgroundColor: e.target.value })}
                                className="input font-mono text-xs uppercase w-32"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={selectPage.textColor || '#000000'}
                                onChange={(e) => updateSelect({ textColor: e.target.value })}
                                className="h-10 w-10 rounded-lg border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={selectPage.textColor || '#000000'}
                                onChange={(e) => updateSelect({ textColor: e.target.value })}
                                className="input font-mono text-xs uppercase w-32"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900">Live Preview Tip</h4>
                    <p className="text-xs text-gray-500 mt-0.5">The preview on the right will automatically switch to a product page view when you select this tab.</p>
                </div>
            </div>
        </div>
    );
}
