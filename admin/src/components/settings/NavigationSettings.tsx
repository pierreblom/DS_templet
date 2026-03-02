import React from 'react';

interface NavSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function NavigationSettings({ settings, setSettings }: NavSettingsProps) {
    const headerLinks = settings.navigation.headerLinks || [];
    const footerLinks = settings.navigation.footerLinks || [];

    const updateLinks = (type: 'header' | 'footer', links: any[]) => {
        setSettings({
            ...settings,
            navigation: {
                ...settings.navigation,
                [`${type}Links`]: links
            }
        });
    };

    const addLink = (type: 'header' | 'footer') => {
        const links = type === 'header' ? [...headerLinks] : [...footerLinks];
        links.push({ label: 'New Link', url: '#' });
        updateLinks(type, links);
    };

    const removeLink = (type: 'header' | 'footer', index: number) => {
        const links = type === 'header' ? [...headerLinks] : [...footerLinks];
        links.splice(index, 1);
        updateLinks(type, links);
    };

    const editLink = (type: 'header' | 'footer', index: number, field: string, value: string) => {
        const links = type === 'header' ? [...headerLinks] : [...footerLinks];
        links[index] = { ...links[index], [field]: value };
        updateLinks(type, links);
    };

    return (
        <div className="space-y-10">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Main Menu Navigation</h3>
                        <p className="text-sm text-gray-500">Links shown in your website header.</p>
                    </div>
                    <button type="button" onClick={() => addLink('header')} className="btn btn-sm btn-secondary bg-white text-terracotta border-terracotta hover:bg-orange-50">
                        + Add Link
                    </button>
                </div>

                <div className="space-y-3">
                    {headerLinks.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                            No header links yet.
                        </div>
                    ) : (
                        headerLinks.map((link: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                                <div className="cursor-move text-gray-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <input type="text" className="input text-xs" value={link.label} onChange={(e) => editLink('header', index, 'label', e.target.value)} placeholder="Link Text" />
                                    <input type="text" className="input text-xs" value={link.url} onChange={(e) => editLink('header', index, 'url', e.target.value)} placeholder="URL (# for placeholder)" />
                                </div>
                                <button type="button" onClick={() => removeLink('header', index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Footer Navigation</h3>
                        <p className="text-sm text-gray-500">Links shown at the bottom of every page.</p>
                    </div>
                    <button type="button" onClick={() => addLink('footer')} className="btn btn-sm btn-secondary bg-white text-terracotta border-terracotta hover:bg-orange-50">
                        + Add Link
                    </button>
                </div>

                <div className="space-y-3">
                    {footerLinks.map((link: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                <input type="text" className="input text-xs font-medium" value={link.label} onChange={(e) => editLink('footer', index, 'label', e.target.value)} />
                                <input type="text" className="input text-xs" value={link.url} onChange={(e) => editLink('footer', index, 'url', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeLink('footer', index)} className="p-2 text-gray-400 hover:text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
