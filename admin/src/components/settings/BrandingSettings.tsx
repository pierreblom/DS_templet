import React from 'react';

interface BrandingSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function BrandingSettings({ settings, setSettings }: BrandingSettingsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Logo & Title</h3>
                <p className="text-sm text-gray-500 mb-4">Manage how your brand is identified across the site.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store Name
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="My Store Name"
                            value={settings.branding.websiteTitle}
                            onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, websiteTitle: e.target.value } })}
                        />
                        <p className="mt-1 text-xs text-gray-400 font-mono">Used for browser title and SEO.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            placeholder="hello@example.com"
                            value={settings.contact.email}
                            onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Footer Info</h3>
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Copyright Text
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="© 2024 Your Store"
                            value={settings.footer.copyright}
                            onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
