import React from 'react';

interface HeaderSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export default function HeaderSettings({ settings, setSettings }: HeaderSettingsProps) {
    const header = settings.header;

    const updateHeader = (updatedFields: any) => {
        setSettings({
            ...settings,
            header: { ...header, ...updatedFields }
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Header Configuration</h3>
                <p className="text-sm text-gray-500 mb-6">Manage how your logo and menu are arranged.</p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Position</label>
                        <select className="input" value={header.logo.position} onChange={(e) => updateHeader({ logo: { position: e.target.value } })}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Menu Position</label>
                        <select className="input" value={header.menu.position} onChange={(e) => updateHeader({ menu: { ...header.menu, position: e.target.value } })}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Menu Row Appearance</label>
                        <select className="input" value={header.menu.row} onChange={(e) => updateHeader({ menu: { ...header.menu, row: e.target.value } })}>
                            <option value="top">Same row as Logo</option>
                            <option value="bottom">Below Logo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sticky Behavior</label>
                        <select className="input" value={header.stickyHeader} onChange={(e) => updateHeader({ stickyHeader: e.target.value })}>
                            <option value="always">Always Sticky</option>
                            <option value="scroll-up">Sticky on Scroll Up</option>
                            <option value="none">Not Sticky</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-bold text-gray-700">Enable Search</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={header.search.enabled}
                            onChange={(e) => updateHeader({ search: { ...header.search, enabled: e.target.checked } })}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-bold text-gray-700">Customer Accounts</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={header.customerAccount}
                            onChange={(e) => updateHeader({ customerAccount: e.target.checked })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
