import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { settingsApi, uploadApi } from '../services/api';
import PreviewFrame from '../components/customizer/PreviewFrame';

export default function SiteManagementPage() {
    const [activeTab, setActiveTab] = useState<'branding' | 'settings' | 'layout' | 'content' | 'navigation' | 'header' | 'featuredCollection' | 'slideshow'>('settings');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [settings, setSettings] = useState({
        theme: {
            primaryColor: '#C88E75',
            secondaryColor: '#A0522D',
            backgroundColor: '#F9F5F0',
            textColor: '#000000',
            headerBackgroundColor: '#FFFFFF',
            typography: { fontFamily: 'Outfit, sans-serif', headingFontFamily: 'Playfair Display, serif' },
            shapes: { borderRadius: '8px' },
            spacing: { globalPadding: '2rem', globalMargin: '1rem' }
        },
        layout: {
            heroEnabled: true, customerLoveEnabled: true, trailFavoritesEnabled: true,
            newArrivalsEnabled: true, valuePropsEnabled: true, newsletterEnabled: true, slideshowEnabled: false
        },
        content: {
            hero: { title: '', subtitle: '', ctaText: '', ctaLink: '', textPosition: 'left', textAlign: 'left', titleColor: '#000000', subtitleColor: '#666666', titleSize: 'clamp(2.5rem, 5vw, 4rem)', customCSS: '' },
            newArrivals: { title: '', subtitle: '', promoText: '', backgroundImage: '../../images/arrivals.png', cardBackgroundColor: '#FFFFFF', cardBorderColor: '#E0F2F1', cardTextColor: '#000000' },
            newsletter: { title: '', subtitle: '' },
            valueProps: [],
            customerLove: []
        },
        navigation: {
            headerLinks: [],
            footerLinks: []
        },
        branding: { websiteTitle: '', headerImage: '' },
        media: { logo: '', favicon: '', heroBackground: '', heroPosition: 'center', heroSize: 'cover', heroHeight: '80vh' },
        contact: { email: '' },
        footer: { copyright: '' },
        header: {
            logo: { position: 'center' },
            menu: { position: 'left', row: 'top' },
            search: { enabled: true, position: 'left' },
            customerAccount: true,
            font: 'heading',
            fontSize: '16px',
            announcementPosition: 'left',
            announcementRow: 'top',
            appearance: { width: 'full', height: 'standard' },
            stickyHeader: 'always',
            borderThickness: 0,
            colorScheme: 'scheme-2',
            transparentHome: false,
            transparentProduct: false,
            transparentCollection: false,
        },
        featuredCollection: {
            collection: 'all', type: 'grid', carouselOnMobile: false,
            productCount: 8, columns: 4, mobileColumns: 2,
            horizontalGap: 20, verticalGap: 36,
            sectionWidth: 'page', alignment: 'left', gap: 28,
            colorScheme: 'scheme-1', paddingTop: 20, paddingBottom: 72, customCSS: '',
        },
        slideshow: {
            navigation: 'large-arrows', pagination: 'dots', colorScheme: 'scheme-1',
            autoRotate: false, autoRotateSpeed: 5, width: 'full', height: 'medium',
            paddingTop: 0, paddingBottom: 0, customCSS: '',
        },
    } as any);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsApi.get();
            if (response.data.success) {
                // Merge with default to ensure new fields act properly
                setSettings({ ...settings, ...response.data.settings });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setErrorMessage('Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            await settingsApi.update(settings);
            setSuccessMessage('Settings updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setErrorMessage('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploadingImage(true);
        try {
            const response = await uploadApi.uploadImage(file);
            if (response.data.success) {
                setSettings({
                    ...settings,
                    media: {
                        ...settings.media,
                        heroBackground: response.data.url,
                    }
                });
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            setErrorMessage('Failed to upload image.');
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleNewArrivalsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploadingImage(true);
        try {
            const response = await uploadApi.uploadImage(file);
            if (response.data.success) {
                setSettings({
                    ...settings,
                    content: {
                        ...settings.content,
                        newArrivals: {
                            ...settings.content.newArrivals,
                            backgroundImage: response.data.url,
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            setErrorMessage('Failed to upload image.');
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
            <div className="p-4 px-8 border-b border-gray-200 bg-white flex items-center justify-between z-10 shadow-sm relative">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
                    <p className="text-sm text-gray-500">Live preview your changes before saving</p>
                </div>
                <div className="flex items-center space-x-4">
                    {successMessage && <span className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded">{successMessage}</span>}
                    {errorMessage && <span className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded">{errorMessage}</span>}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-primary"
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar: Controls */}
                <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
                    {/* Tabs / Navigation */}
                    <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 pt-2 scrollbar-hide">
                        {['settings', 'header', 'branding', 'layout', 'content', 'navigation', 'featuredCollection', 'slideshow'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-2.5 px-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab
                                        ? 'border-terracotta text-terracotta bg-white rounded-t-lg'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Control Surface */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar pb-24">
                        <form onSubmit={handleSave} id="settings-form">
                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Theme Colors</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Primary Color
                                                </label>
                                                <div className="flex space-x-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.theme.primaryColor || '#000000'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                                                        className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.theme.primaryColor}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                                                        className="input font-mono text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Secondary Color
                                                </label>
                                                <div className="flex space-x-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.theme.secondaryColor || '#000000'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, secondaryColor: e.target.value } })}
                                                        className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.theme.secondaryColor}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, secondaryColor: e.target.value } })}
                                                        className="input font-mono text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Background Color
                                                </label>
                                                <div className="flex space-x-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.theme.backgroundColor || '#F9F5F0'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, backgroundColor: e.target.value } })}
                                                        className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.theme.backgroundColor || '#F9F5F0'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, backgroundColor: e.target.value } })}
                                                        className="input font-mono text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Text Color
                                                </label>
                                                <div className="flex space-x-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.theme.textColor || '#000000'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, textColor: e.target.value } })}
                                                        className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.theme.textColor || '#000000'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, textColor: e.target.value } })}
                                                        className="input font-mono text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Header Background
                                                </label>
                                                <div className="flex space-x-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={settings.theme.headerBackgroundColor || '#FFFFFF'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, headerBackgroundColor: e.target.value } })}
                                                        className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.theme.headerBackgroundColor || '#FFFFFF'}
                                                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, headerBackgroundColor: e.target.value } })}
                                                        className="input font-mono text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Typography & Style</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Family</label>
                                                <select className="input" value={settings.theme?.typography?.fontFamily || ''} onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, typography: { ...settings.theme.typography, fontFamily: e.target.value } } })}>
                                                    <option value="Outfit, sans-serif">Outfit, sans-serif</option>
                                                    <option value="Inter, sans-serif">Inter, sans-serif</option>
                                                    <option value="Roboto, sans-serif">Roboto, sans-serif</option>
                                                    <option value="Open Sans, sans-serif">Open Sans, sans-serif</option>
                                                    <option value="Lato, sans-serif">Lato, sans-serif</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font Family</label>
                                                <select className="input" value={settings.theme?.typography?.headingFontFamily || ''} onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, typography: { ...settings.theme.typography, headingFontFamily: e.target.value } } })}>
                                                    <option value="Playfair Display, serif">Playfair Display, serif</option>
                                                    <option value="Merriweather, serif">Merriweather, serif</option>
                                                    <option value="Lora, serif">Lora, serif</option>
                                                    <option value="Montserrat, sans-serif">Montserrat, sans-serif</option>
                                                    <option value="Oswald, sans-serif">Oswald, sans-serif</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                                                <select className="input" value={settings.theme?.shapes?.borderRadius || ''} onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, shapes: { ...settings.theme.shapes, borderRadius: e.target.value } } })}>
                                                    <option value="0px">0px (Square)</option>
                                                    <option value="4px">4px (Small)</option>
                                                    <option value="8px">8px (Medium)</option>
                                                    <option value="12px">12px (Large)</option>
                                                    <option value="16px">16px (Extra Large)</option>
                                                    <option value="24px">24px (Pill)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Global Padding</label>
                                                <select className="input" value={settings.theme?.spacing?.globalPadding || ''} onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, spacing: { ...settings.theme.spacing, globalPadding: e.target.value } } })}>
                                                    <option value="1rem">1rem (Compact)</option>
                                                    <option value="1.5rem">1.5rem (Normal)</option>
                                                    <option value="2rem">2rem (Spacious)</option>
                                                    <option value="2.5rem">2.5rem (Relaxed)</option>
                                                    <option value="3rem">3rem (Wide)</option>
                                                    <option value="4rem">4rem (Extra Wide)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Global Text Strings</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Website Title <span className="text-gray-400 text-xs">(Used for SEO)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={settings.branding.websiteTitle}
                                                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, websiteTitle: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contact Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="input"
                                                    value={settings.contact.email}
                                                    onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Footer Copyright Text
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={settings.footer.copyright}
                                                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'layout' && (
                                <div className="space-y-0">
                                    {/* Page title */}
                                    <h3 className="text-lg font-semibold text-gray-900 pb-4">Home page</h3>

                                    {/* ── Header Group ── */}
                                    <div className="border-t border-gray-200 pt-5 pb-4">
                                        <h4 className="text-base font-bold text-gray-900 mb-3">Header</h4>
                                        <div className="ml-2 space-y-1">
                                            <button type="button" onClick={() => setActiveTab('header')}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group text-left">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                                <span className="text-sm font-medium text-gray-800">Header</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Template Group ── */}
                                    <div className="border-t border-gray-200 pt-5 pb-4">
                                        <h4 className="text-base font-bold text-gray-900 mb-3">Template</h4>
                                        <div className="ml-2 space-y-1">
                                            {/* Hero */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <button type="button" onClick={() => setActiveTab('content')} className="flex items-center gap-3 text-left flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={1.5} /><path d="M3 9h18" strokeWidth={1.5} /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Hero</span>
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.heroEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.heroEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, heroEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* Featured collection: Grid */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <button type="button" onClick={() => setActiveTab('featuredCollection')} className="flex items-center gap-3 text-left flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Featured collection: Grid</span>
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.trailFavoritesEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.trailFavoritesEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, trailFavoritesEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* Customer Love */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Customer Love</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.customerLoveEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.customerLoveEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, customerLoveEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* New Arrivals */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <button type="button" onClick={() => setActiveTab('content')} className="flex items-center gap-3 text-left flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    <span className="text-sm font-medium text-gray-800">New Arrivals</span>
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.newArrivalsEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.newArrivalsEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, newArrivalsEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* Value Props */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Value Props</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.valuePropsEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.valuePropsEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, valuePropsEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* Newsletter */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Newsletter</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.newsletterEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.newsletterEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, newsletterEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>

                                            {/* Slideshow */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <button type="button" onClick={() => setActiveTab('slideshow')} className="flex items-center gap-3 text-left flex-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} /><path d="M6 10l4 3-4 3V10z" fill="currentColor" strokeWidth={0} /></svg>
                                                    <span className="text-sm font-medium text-gray-800">Slideshow</span>
                                                </button>
                                                <label className="relative inline-flex items-center cursor-pointer ml-2" title={settings.layout.slideshowEnabled ? 'Visible' : 'Hidden'}>
                                                    <input type="checkbox" className="sr-only peer" checked={settings.layout.slideshowEnabled} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, slideshowEnabled: e.target.checked } })} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Footer Group ── */}
                                    <div className="border-t border-gray-200 pt-5 pb-4">
                                        <h4 className="text-base font-bold text-gray-900 mb-3">Footer</h4>
                                        <div className="ml-2 space-y-1">
                                            <button type="button" onClick={() => setActiveTab('navigation')}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group text-left">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" /></svg>
                                                <span className="text-sm font-medium text-gray-800">Policies and links</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Hero Section Content</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input type="text" className="input" value={settings.content?.hero?.title || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, title: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                                <input type="text" className="input" value={settings.content?.hero?.subtitle || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, subtitle: e.target.value } } })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                                                    <input type="text" className="input" value={settings.content?.hero?.ctaText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, ctaText: e.target.value } } })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                                                    <input type="text" className="input" value={settings.content?.hero?.ctaLink || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, ctaLink: e.target.value } } })} />
                                                </div>
                                            </div>

                                            <h4 className="text-md font-medium text-gray-800 mt-4 mb-2 border-t pt-4">Text Styling</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Position</label>
                                                    <select className="input" value={settings.content?.hero?.textPosition || 'left'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, textPosition: e.target.value } } })}>
                                                        <option value="top-left">Top Left</option>
                                                        <option value="top-center">Top Center</option>
                                                        <option value="top-right">Top Right</option>
                                                        <option value="left">Center Left</option>
                                                        <option value="center">Center</option>
                                                        <option value="right">Center Right</option>
                                                        <option value="bottom-left">Bottom Left</option>
                                                        <option value="bottom-center">Bottom Center</option>
                                                        <option value="bottom-right">Bottom Right</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                                                    <select className="input" value={settings.content?.hero?.textAlign || 'left'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, textAlign: e.target.value } } })}>
                                                        <option value="left">Left</option>
                                                        <option value="center">Center</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Size</label>
                                                    <select className="input" value={settings.content?.hero?.titleSize || 'clamp(2.5rem, 5vw, 4rem)'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, titleSize: e.target.value } } })}>
                                                        <option value="clamp(1.5rem, 3vw, 2.5rem)">Small</option>
                                                        <option value="clamp(2rem, 4vw, 3rem)">Medium</option>
                                                        <option value="clamp(2.5rem, 5vw, 4rem)">Large (Default)</option>
                                                        <option value="clamp(3rem, 6vw, 5rem)">Extra Large</option>
                                                        <option value="clamp(3.5rem, 7vw, 6rem)">Huge</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Color</label>
                                                    <div className="flex space-x-2 items-center">
                                                        <input type="color" value={settings.content?.hero?.titleColor || '#000000'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, titleColor: e.target.value } } })} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                                                        <input type="text" value={settings.content?.hero?.titleColor || '#000000'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, titleColor: e.target.value } } })} className="input font-mono text-sm uppercase" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Color</label>
                                                    <div className="flex space-x-2 items-center">
                                                        <input type="color" value={settings.content?.hero?.subtitleColor || '#666666'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, subtitleColor: e.target.value } } })} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                                                        <input type="text" value={settings.content?.hero?.subtitleColor || '#666666'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, subtitleColor: e.target.value } } })} className="input font-mono text-sm uppercase" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom CSS - Collapsible */}
                                        <details className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                                            <summary className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                                <span className="text-base font-semibold text-gray-900">Custom CSS</span>
                                                <svg className="w-5 h-5 text-gray-500 transform transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </summary>
                                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Add custom styles to <strong>this section only</strong>.
                                                </p>
                                                <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                    <div className="flex">
                                                        <div className="py-3 px-3 bg-gray-100 text-gray-400 text-xs font-mono select-none border-r border-gray-200 text-right" style={{ minWidth: '2.5rem' }}>
                                                            {((settings.content?.hero as any)?.customCSS || '').split('\n').map((_: string, i: number) => (
                                                                <div key={i}>{i + 1}</div>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            className="flex-1 py-3 px-3 font-mono text-sm text-gray-800 resize-y min-h-[80px] outline-none border-0 bg-white"
                                                            style={{ minHeight: '80px' }}
                                                            placeholder="h2 {&#10;    font-size: 32px;&#10;}"
                                                            value={(settings.content?.hero as any)?.customCSS || ''}
                                                            onChange={(e) => setSettings({ ...settings, content: { ...settings.content, hero: { ...settings.content.hero, customCSS: e.target.value } } })}
                                                            spellCheck={false}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-3">
                                                    To add custom styles to your entire online store, go to{' '}
                                                    <button type="button" onClick={() => setActiveTab('settings')} className="text-terracotta underline hover:text-orange-700">theme settings</button>.
                                                </p>
                                            </div>
                                        </details>

                                        {/* Remove Section */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ ...settings, layout: { ...settings.layout, heroEnabled: !settings.layout.heroEnabled } })}
                                                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                {settings.layout.heroEnabled ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove section
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span className="text-green-600">Restore section</span>
                                                    </>
                                                )}
                                            </button>
                                            {!settings.layout.heroEnabled && (
                                                <p className="text-xs text-gray-500 mt-1 ml-7">This section is currently hidden from the storefront.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">New Arrivals Content</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input type="text" className="input" value={settings.content?.newArrivals?.title || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, title: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                                <input type="text" className="input" value={settings.content?.newArrivals?.subtitle || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, subtitle: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Text</label>
                                                <input type="text" className="input" value={settings.content?.newArrivals?.promoText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, promoText: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                                                {settings.content?.newArrivals?.backgroundImage ? (
                                                    <div className="relative border rounded-lg overflow-hidden group">
                                                        <img
                                                            src={settings.content.newArrivals.backgroundImage}
                                                            alt="New Arrivals Background"
                                                            className="w-full h-48 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <label className="btn btn-secondary cursor-pointer bg-white text-gray-900 font-medium hover:bg-gray-100 mr-2">
                                                                {uploadingImage ? 'Uploading...' : 'Replace Image'}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    disabled={uploadingImage}
                                                                    className="hidden"
                                                                    onChange={handleNewArrivalsImageUpload}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                className="btn bg-red-500 text-white font-medium hover:bg-red-600 px-3 py-1.5 rounded"
                                                                onClick={() => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, backgroundImage: '' } } })}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="mt-3 flex text-sm text-gray-600 justify-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-terracotta hover:text-orange-500">
                                                                <span>Upload Background Image</span>
                                                                <input
                                                                    type="file"
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                    disabled={uploadingImage}
                                                                    onChange={handleNewArrivalsImageUpload}
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {uploadingImage ? 'Uploading...' : 'PNG, JPG, GIF up to 5MB'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Background</label>
                                                    <div className="flex space-x-2 items-center">
                                                        <input type="color" value={settings.content?.newArrivals?.cardBackgroundColor || '#FFFFFF'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardBackgroundColor: e.target.value } } })} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                                                        <input type="text" value={settings.content?.newArrivals?.cardBackgroundColor || '#FFFFFF'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardBackgroundColor: e.target.value } } })} className="input font-mono text-sm uppercase" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Border</label>
                                                    <div className="flex space-x-2 items-center">
                                                        <input type="color" value={settings.content?.newArrivals?.cardBorderColor || '#E0F2F1'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardBorderColor: e.target.value } } })} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                                                        <input type="text" value={settings.content?.newArrivals?.cardBorderColor || '#E0F2F1'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardBorderColor: e.target.value } } })} className="input font-mono text-sm uppercase" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Text</label>
                                                    <div className="flex space-x-2 items-center">
                                                        <input type="color" value={settings.content?.newArrivals?.cardTextColor || '#000000'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardTextColor: e.target.value } } })} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                                                        <input type="text" value={settings.content?.newArrivals?.cardTextColor || '#000000'} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newArrivals: { ...settings.content.newArrivals, cardTextColor: e.target.value } } })} className="input font-mono text-sm uppercase" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Newsletter Content</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input type="text" className="input" value={settings.content?.newsletter?.title || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newsletter: { ...settings.content.newsletter, title: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                                <input type="text" className="input" value={settings.content?.newsletter?.subtitle || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, newsletter: { ...settings.content.newsletter, subtitle: e.target.value } } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Value Propositions</h3>
                                        <div className="space-y-4">
                                            {settings.content?.valueProps?.map((prop: any, index: number) => (
                                                <div key={index} className="p-4 border rounded relative bg-gray-50">
                                                    <button type="button" onClick={() => { const newProps = [...settings.content.valueProps]; newProps.splice(index, 1); setSettings({ ...settings, content: { ...settings.content, valueProps: newProps } as any }); }} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-medium">Remove</button>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                            <input type="text" className="input" value={prop.title || ''} onChange={(e) => { const newProps = [...settings.content.valueProps]; (newProps[index] as any).title = e.target.value; setSettings({ ...settings, content: { ...settings.content, valueProps: newProps } as any }); }} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                            <textarea className="input" value={prop.description || ''} onChange={(e) => { const newProps = [...settings.content.valueProps]; (newProps[index] as any).description = e.target.value; setSettings({ ...settings, content: { ...settings.content, valueProps: newProps } as any }); }} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">SVG Icon HTML</label>
                                                            <textarea className="input font-mono text-xs" rows={3} value={prop.icon || ''} onChange={(e) => { const newProps = [...settings.content.valueProps]; (newProps[index] as any).icon = e.target.value; setSettings({ ...settings, content: { ...settings.content, valueProps: newProps } as any }); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setSettings({ ...settings, content: { ...settings.content, valueProps: [...(settings.content?.valueProps || []), { title: 'New Value Prop', description: '', icon: '' }] } as any })} className="btn btn-secondary mt-2">+ Add Value Proposition</button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Customer Reviews</h3>
                                        <div className="space-y-4">
                                            {settings.content?.customerLove?.map((review: any, index: number) => (
                                                <div key={index} className="p-4 border rounded relative bg-gray-50">
                                                    <button type="button" onClick={() => { const newLove = [...settings.content.customerLove]; newLove.splice(index, 1); setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-medium">Remove</button>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                                                            <input type="text" className="input" value={review.reviewer || ''} onChange={(e) => { const newLove = [...settings.content.customerLove]; (newLove[index] as any).reviewer = e.target.value; setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                                            <input type="text" className="input" value={review.product || ''} onChange={(e) => { const newLove = [...settings.content.customerLove]; (newLove[index] as any).product = e.target.value; setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stars (1-5)</label>
                                                            <input type="number" min="1" max="5" className="input" value={review.stars || 5} onChange={(e) => { const newLove = [...settings.content.customerLove]; (newLove[index] as any).stars = parseInt(e.target.value, 10); setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                                                            <input type="text" className="input" value={review.title || ''} onChange={(e) => { const newLove = [...settings.content.customerLove]; (newLove[index] as any).title = e.target.value; setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                                                            <textarea className="input" rows={2} value={review.text || ''} onChange={(e) => { const newLove = [...settings.content.customerLove]; (newLove[index] as any).text = e.target.value; setSettings({ ...settings, content: { ...settings.content, customerLove: newLove } as any }); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setSettings({ ...settings, content: { ...settings.content, customerLove: [...(settings.content?.customerLove || []), { reviewer: 'New Reviewer', product: '', stars: 5, title: '', text: '' }] } as any })} className="btn btn-secondary mt-2">+ Add Review</button>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'navigation' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Header Links</h3>
                                        <div className="space-y-2">
                                            {settings.navigation?.headerLinks?.map((link: any, idx: number) => (
                                                <div key={idx} className="flex space-x-2">
                                                    <input type="text" placeholder="Label" className="input w-1/3" value={link.label} onChange={(e) => { const newLinks = [...settings.navigation.headerLinks]; (newLinks[idx] as any).label = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} />
                                                    <input type="text" placeholder="URL" className="input flex-1" value={link.url} onChange={(e) => { const newLinks = [...settings.navigation.headerLinks]; (newLinks[idx] as any).url = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} />
                                                    <button type="button" onClick={() => { const newLinks = settings.navigation.headerLinks.filter((_: any, i: number) => i !== idx); setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} className="btn btn-secondary text-red-600">Remove</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: [...(settings.navigation?.headerLinks || []), { label: '', url: '' }] as any } })} className="text-sm text-terracotta font-medium mt-2">+ Add Header Link</button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Footer Links</h3>
                                        <div className="space-y-2">
                                            {settings.navigation?.footerLinks?.map((link: any, idx: number) => (
                                                <div key={idx} className="flex space-x-2">
                                                    <input type="text" placeholder="Label" className="input w-1/3" value={link.label} onChange={(e) => { const newLinks = [...settings.navigation.footerLinks]; (newLinks[idx] as any).label = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} />
                                                    <input type="text" placeholder="URL" className="input flex-1" value={link.url} onChange={(e) => { const newLinks = [...settings.navigation.footerLinks]; (newLinks[idx] as any).url = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} />
                                                    <button type="button" onClick={() => { const newLinks = settings.navigation.footerLinks.filter((_: any, i: number) => i !== idx); setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} className="btn btn-secondary text-red-600">Remove</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: [...(settings.navigation?.footerLinks || []), { label: '', url: '' }] as any } })} className="text-sm text-terracotta font-medium mt-2">+ Add Footer Link</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'header' && (
                                <div className="space-y-6">
                                    {/* ---- Logo ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Position</span>
                                            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                {['left', 'center', 'right'].map((pos) => (
                                                    <button key={pos} type="button"
                                                        className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.logo?.position === pos
                                                            ? 'bg-gray-900 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, logo: { ...(settings as any).header?.logo, position: pos } } } as any)}
                                                    >{pos}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Menu ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Position</span>
                                                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                    {['left', 'center', 'right'].map((pos) => (
                                                        <button key={pos} type="button"
                                                            className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.menu?.position === pos
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, menu: { ...(settings as any).header?.menu, position: pos } } } as any)}
                                                        >{pos}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Row</span>
                                                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                    {['top', 'bottom'].map((row) => (
                                                        <button key={row} type="button"
                                                            className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.menu?.row === row
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, menu: { ...(settings as any).header?.menu, row } } } as any)}
                                                        >{row}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Customer Account ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer account</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">Show account icon in header</p>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer"
                                                    checked={(settings as any).header?.customerAccount !== false}
                                                    onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, customerAccount: e.target.checked } } as any)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Search ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Search icon</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"
                                                        checked={(settings as any).header?.search?.enabled !== false}
                                                        onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, search: { ...(settings as any).header?.search, enabled: e.target.checked } } } as any)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>
                                            {(settings as any).header?.search?.enabled !== false && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Position</span>
                                                    <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                        {['left', 'right'].map((pos) => (
                                                            <button key={pos} type="button"
                                                                className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.search?.position === pos
                                                                    ? 'bg-gray-900 text-white'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                                onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, search: { ...(settings as any).header?.search, position: pos } } } as any)}
                                                            >{pos}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Font & Size ---- */}
                                    <div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Font</span>
                                                <select className="input w-48"
                                                    value={(settings as any).header?.font || 'heading'}
                                                    onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, font: e.target.value } } as any)}
                                                >
                                                    <option value="heading">Heading</option>
                                                    <option value="body">Body</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Size</span>
                                                <select className="input w-48"
                                                    value={(settings as any).header?.fontSize || '16px'}
                                                    onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, fontSize: e.target.value } } as any)}
                                                >
                                                    <option value="12px">12px</option>
                                                    <option value="14px">14px</option>
                                                    <option value="16px">16px</option>
                                                    <option value="18px">18px</option>
                                                    <option value="20px">20px</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Appearance ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Width</span>
                                                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                    {['page', 'full'].map((w) => (
                                                        <button key={w} type="button"
                                                            className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.appearance?.width === w
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, appearance: { ...(settings as any).header?.appearance, width: w } } } as any)}
                                                        >{w}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Height</span>
                                                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                                    {['compact', 'standard'].map((h) => (
                                                        <button key={h} type="button"
                                                            className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).header?.appearance?.height === h
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => setSettings({ ...settings, header: { ...(settings as any).header, appearance: { ...(settings as any).header?.appearance, height: h } } } as any)}
                                                        >{h}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Sticky Header ---- */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Sticky header</span>
                                        <select className="input w-48"
                                            value={(settings as any).header?.stickyHeader || 'always'}
                                            onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, stickyHeader: e.target.value } } as any)}
                                        >
                                            <option value="always">Always</option>
                                            <option value="on-scroll-up">On scroll up</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Border thickness ---- */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Border thickness</span>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="range"
                                                    min="0" max="5" step="1"
                                                    value={(settings as any).header?.borderThickness ?? 0}
                                                    onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, borderThickness: parseInt(e.target.value) } } as any)}
                                                    className="w-32 accent-terracotta"
                                                />
                                                <div className="flex items-center space-x-1">
                                                    <input
                                                        type="number"
                                                        min="0" max="5"
                                                        value={(settings as any).header?.borderThickness ?? 0}
                                                        onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, borderThickness: parseInt(e.target.value) || 0 } } as any)}
                                                        className="input w-16 text-center"
                                                    />
                                                    <span className="text-sm text-gray-500">px</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Colors ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Default</span>
                                            <select className="input w-48"
                                                value={(settings as any).header?.colorScheme || 'scheme-2'}
                                                onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, colorScheme: e.target.value } } as any)}
                                            >
                                                <option value="scheme-1">Scheme 1</option>
                                                <option value="scheme-2">Scheme 2</option>
                                                <option value="scheme-3">Scheme 3</option>
                                                <option value="scheme-4">Scheme 4</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* ---- Transparent Background Pages ---- */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transparent Background</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Home page</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"
                                                        checked={(settings as any).header?.transparentHome === true}
                                                        onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, transparentHome: e.target.checked } } as any)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Product page</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"
                                                        checked={(settings as any).header?.transparentProduct === true}
                                                        onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, transparentProduct: e.target.checked } } as any)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Collection page</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"
                                                        checked={(settings as any).header?.transparentCollection === true}
                                                        onChange={(e) => setSettings({ ...settings, header: { ...(settings as any).header, transparentCollection: e.target.checked } } as any)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'slideshow' && (
                                <div className="space-y-6">
                                    {/* Back + title */}
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setActiveTab('layout')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            Back
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Slideshow</h3>

                                    <hr className="border-gray-200" />

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Navigation</span>
                                        <select className="input w-48" value={(settings as any).slideshow?.navigation || 'large-arrows'}
                                            onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, navigation: e.target.value } } as any)}>
                                            <option value="large-arrows">Large arrows</option>
                                            <option value="small-arrows">Small arrows</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Pagination</span>
                                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                            {['dots', 'counter'].map((p) => (
                                                <button key={p} type="button"
                                                    className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).slideshow?.pagination === p
                                                        ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, pagination: p } } as any)}
                                                >{p === 'dots' ? 'Dots' : 'Counter'}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color scheme */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Color scheme</span>
                                        <select className="input w-48" value={(settings as any).slideshow?.colorScheme || 'scheme-1'}
                                            onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, colorScheme: e.target.value } } as any)}>
                                            <option value="scheme-1">Scheme 1</option>
                                            <option value="scheme-2">Scheme 2</option>
                                            <option value="scheme-3">Scheme 3</option>
                                            <option value="scheme-4">Scheme 4</option>
                                        </select>
                                    </div>

                                    {/* Auto-rotate slides */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Auto-rotate slides</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer"
                                                checked={(settings as any).slideshow?.autoRotate === true}
                                                onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, autoRotate: e.target.checked } } as any)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                        </label>
                                    </div>

                                    {/* Auto-rotate speed (only when auto-rotate is on) */}
                                    {(settings as any).slideshow?.autoRotate && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Change slides every</span>
                                            <div className="flex items-center space-x-2">
                                                <input type="number" min="1" max="20" className="input w-16 text-center"
                                                    value={(settings as any).slideshow?.autoRotateSpeed ?? 5}
                                                    onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, autoRotateSpeed: parseInt(e.target.value) || 5 } } as any)} />
                                                <span className="text-sm text-gray-500">s</span>
                                            </div>
                                        </div>
                                    )}

                                    <hr className="border-gray-200" />

                                    {/* Size */}
                                    <h4 className="text-base font-semibold text-gray-900">Size</h4>

                                    {/* Width */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Width</span>
                                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                            {['page', 'full'].map((w) => (
                                                <button key={w} type="button"
                                                    className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).slideshow?.width === w
                                                        ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, width: w } } as any)}
                                                >{w === 'page' ? 'Page' : 'Full'}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Height */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Height</span>
                                        <select className="input w-48" value={(settings as any).slideshow?.height || 'medium'}
                                            onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, height: e.target.value } } as any)}>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="full">Full screen</option>
                                        </select>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Padding */}
                                    <h4 className="text-base font-semibold text-gray-900">Padding</h4>

                                    {/* Top */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Top</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="120" step="4" className="w-32 accent-gray-900"
                                                value={(settings as any).slideshow?.paddingTop ?? 0}
                                                onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, paddingTop: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="120" className="input w-16 text-center"
                                                    value={(settings as any).slideshow?.paddingTop ?? 0}
                                                    onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, paddingTop: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Bottom</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="120" step="4" className="w-32 accent-gray-900"
                                                value={(settings as any).slideshow?.paddingBottom ?? 0}
                                                onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, paddingBottom: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="120" className="input w-16 text-center"
                                                    value={(settings as any).slideshow?.paddingBottom ?? 0}
                                                    onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, paddingBottom: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Custom CSS */}
                                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                                        <summary className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="text-base font-semibold text-gray-900">Custom CSS</span>
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </summary>
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                                            <p className="text-sm text-gray-600 mb-1">Add custom styles to <strong>this section only</strong>.</p>
                                            <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                <div className="flex">
                                                    <div className="py-3 px-3 bg-gray-100 text-gray-400 text-xs font-mono select-none border-r border-gray-200 text-right" style={{ minWidth: '2.5rem' }}>
                                                        {((settings as any).slideshow?.customCSS || '').split('\n').map((_: string, i: number) => (
                                                            <div key={i}>{i + 1}</div>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        className="flex-1 py-3 px-3 font-mono text-sm text-gray-800 resize-y outline-none border-0 bg-white"
                                                        style={{ minHeight: '80px' }}
                                                        placeholder=".slideshow { border-radius: 12px; }"
                                                        value={(settings as any).slideshow?.customCSS || ''}
                                                        onChange={(e) => setSettings({ ...settings, slideshow: { ...(settings as any).slideshow, customCSS: e.target.value } } as any)}
                                                        spellCheck={false}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-3">To add custom styles to your entire online store, go to <button type="button" onClick={() => setActiveTab('settings')} className="text-terracotta underline hover:text-orange-700">theme settings</button>.</p>
                                        </div>
                                    </details>

                                    {/* Remove section */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <button type="button"
                                            onClick={() => setSettings({ ...settings, layout: { ...settings.layout, slideshowEnabled: !settings.layout.slideshowEnabled } })}
                                            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                                            {settings.layout.slideshowEnabled ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Remove section
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-green-600">Restore section</span>
                                                </>
                                            )}
                                        </button>
                                        {!settings.layout.slideshowEnabled && (
                                            <p className="text-xs text-gray-500 mt-1 ml-7">This section is currently hidden from the storefront.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'featuredCollection' && (
                                <div className="space-y-6">
                                    {/* Back button + title */}
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setActiveTab('layout')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            Back
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Featured collection: Grid</h3>

                                    <hr className="border-gray-200" />

                                    {/* Collection */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Collection</span>
                                        <select className="input w-48" value={(settings as any).featuredCollection?.collection || 'all'}
                                            onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, collection: e.target.value } } as any)}>
                                            <option value="all">All Products</option>
                                            <option value="undergarments">Undergarments</option>
                                            <option value="maternity">Maternity</option>
                                            <option value="accessories">Accessories</option>
                                        </select>
                                    </div>

                                    {/* Type */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Type</span>
                                        <select className="input w-48" value={(settings as any).featuredCollection?.type || 'grid'}
                                            onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, type: e.target.value } } as any)}>
                                            <option value="grid">Grid</option>
                                            <option value="list">List</option>
                                            <option value="carousel">Carousel</option>
                                        </select>
                                    </div>

                                    {/* Carousel on mobile */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Carousel on mobile</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer"
                                                checked={(settings as any).featuredCollection?.carouselOnMobile === true}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, carouselOnMobile: e.target.checked } } as any)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                        </label>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Product count */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Product count</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="1" max="24" step="1" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.productCount ?? 8}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, productCount: parseInt(e.target.value) } } as any)} />
                                            <input type="number" min="1" max="24" className="input w-16 text-center"
                                                value={(settings as any).featuredCollection?.productCount ?? 8}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, productCount: parseInt(e.target.value) || 8 } } as any)} />
                                        </div>
                                    </div>

                                    {/* Columns */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Columns</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="1" max="6" step="1" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.columns ?? 4}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, columns: parseInt(e.target.value) } } as any)} />
                                            <input type="number" min="1" max="6" className="input w-16 text-center"
                                                value={(settings as any).featuredCollection?.columns ?? 4}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, columns: parseInt(e.target.value) || 4 } } as any)} />
                                        </div>
                                    </div>

                                    {/* Mobile columns */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Mobile columns</span>
                                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                            {[1, 2].map((n) => (
                                                <button key={n} type="button"
                                                    className={`px-5 py-1.5 text-sm font-medium transition-colors ${(settings as any).featuredCollection?.mobileColumns === n
                                                        ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, mobileColumns: n } } as any)}
                                                >{n}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Horizontal gap */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Horizontal gap</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="60" step="2" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.horizontalGap ?? 20}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, horizontalGap: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="60" className="input w-16 text-center"
                                                    value={(settings as any).featuredCollection?.horizontalGap ?? 20}
                                                    onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, horizontalGap: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vertical gap */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Vertical gap</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="80" step="2" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.verticalGap ?? 36}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, verticalGap: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="80" className="input w-16 text-center"
                                                    value={(settings as any).featuredCollection?.verticalGap ?? 36}
                                                    onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, verticalGap: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Section layout */}
                                    <h4 className="text-base font-semibold text-gray-900">Section layout</h4>

                                    {/* Width */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Width</span>
                                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                            {['page', 'full'].map((w) => (
                                                <button key={w} type="button"
                                                    className={`px-5 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).featuredCollection?.sectionWidth === w
                                                        ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, sectionWidth: w } } as any)}
                                                >{w === 'page' ? 'Page' : 'Full'}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Alignment */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Alignment</span>
                                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                                            {['left', 'center', 'right'].map((a) => (
                                                <button key={a} type="button"
                                                    className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${(settings as any).featuredCollection?.alignment === a
                                                        ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, alignment: a } } as any)}
                                                >{a}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gap */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Gap</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="60" step="2" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.gap ?? 28}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, gap: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="60" className="input w-16 text-center"
                                                    value={(settings as any).featuredCollection?.gap ?? 28}
                                                    onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, gap: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color scheme */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Color scheme</span>
                                        <select className="input w-48" value={(settings as any).featuredCollection?.colorScheme || 'scheme-1'}
                                            onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, colorScheme: e.target.value } } as any)}>
                                            <option value="scheme-1">Scheme 1</option>
                                            <option value="scheme-2">Scheme 2</option>
                                            <option value="scheme-3">Scheme 3</option>
                                            <option value="scheme-4">Scheme 4</option>
                                        </select>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Padding */}
                                    <h4 className="text-base font-semibold text-gray-900">Padding</h4>

                                    {/* Top */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Top</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="120" step="4" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.paddingTop ?? 20}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, paddingTop: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="120" className="input w-16 text-center"
                                                    value={(settings as any).featuredCollection?.paddingTop ?? 20}
                                                    onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, paddingTop: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Bottom</span>
                                        <div className="flex items-center space-x-3">
                                            <input type="range" min="0" max="120" step="4" className="w-32 accent-gray-900"
                                                value={(settings as any).featuredCollection?.paddingBottom ?? 72}
                                                onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, paddingBottom: parseInt(e.target.value) } } as any)} />
                                            <div className="flex items-center space-x-1">
                                                <input type="number" min="0" max="120" className="input w-16 text-center"
                                                    value={(settings as any).featuredCollection?.paddingBottom ?? 72}
                                                    onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, paddingBottom: parseInt(e.target.value) || 0 } } as any)} />
                                                <span className="text-sm text-gray-500">px</span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Custom CSS - Collapsible */}
                                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                                        <summary className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="text-base font-semibold text-gray-900">Custom CSS</span>
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </summary>
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                                            <p className="text-sm text-gray-600 mb-1">Add custom styles to <strong>this section only</strong>.</p>
                                            <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                <div className="flex">
                                                    <div className="py-3 px-3 bg-gray-100 text-gray-400 text-xs font-mono select-none border-r border-gray-200 text-right" style={{ minWidth: '2.5rem' }}>
                                                        {((settings as any).featuredCollection?.customCSS || '').split('\n').map((_: string, i: number) => (
                                                            <div key={i}>{i + 1}</div>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        className="flex-1 py-3 px-3 font-mono text-sm text-gray-800 resize-y outline-none border-0 bg-white"
                                                        style={{ minHeight: '80px' }}
                                                        placeholder=".products { gap: 2rem; }"
                                                        value={(settings as any).featuredCollection?.customCSS || ''}
                                                        onChange={(e) => setSettings({ ...settings, featuredCollection: { ...(settings as any).featuredCollection, customCSS: e.target.value } } as any)}
                                                        spellCheck={false}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-3">To add custom styles to your entire online store, go to <button type="button" onClick={() => setActiveTab('settings')} className="text-terracotta underline hover:text-orange-700">theme settings</button>.</p>
                                        </div>
                                    </details>

                                    {/* Remove section */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <button type="button"
                                            onClick={() => setSettings({ ...settings, layout: { ...settings.layout, trailFavoritesEnabled: !settings.layout.trailFavoritesEnabled } })}
                                            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                                            {settings.layout.trailFavoritesEnabled ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Remove section
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-green-600">Restore section</span>
                                                </>
                                            )}
                                        </button>
                                        {!settings.layout.trailFavoritesEnabled && (
                                            <p className="text-xs text-gray-500 mt-1 ml-7">This section is currently hidden from the storefront.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'branding' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Media Library</h3>
                                        <div className="space-y-4">
                                            {settings.media?.heroBackground ? (
                                                <div className="relative border rounded-lg overflow-hidden group">
                                                    <img
                                                        src={settings.media.heroBackground}
                                                        alt="Header Hero"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <label className="btn btn-secondary cursor-pointer bg-white text-gray-900 font-medium hover:bg-gray-100">
                                                            {uploadingImage ? 'Uploading...' : 'Replace Image'}
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                disabled={uploadingImage}
                                                                className="hidden"
                                                                onChange={handleImageUpload}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-terracotta hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-terracotta"
                                                        >
                                                            <span>Upload Background</span>
                                                            <input
                                                                id="file-upload"
                                                                name="file-upload"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                disabled={uploadingImage}
                                                                onChange={handleImageUpload}
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {uploadingImage ? 'Uploading...' : 'PNG, JPG, GIF up to 5MB'}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500">
                                                This image will be displayed on the homepage hero section.
                                            </p>

                                            <div className="mt-4">
                                                <h4 className="text-md font-medium text-gray-800 mb-3">Hero Image Settings</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image Position</label>
                                                        <select className="input" value={settings.media?.heroPosition || 'center'} onChange={(e) => setSettings({ ...settings, media: { ...settings.media, heroPosition: e.target.value } })}>
                                                            <option value="left top">Top Left</option>
                                                            <option value="center top">Top Center</option>
                                                            <option value="right top">Top Right</option>
                                                            <option value="left center">Center Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right center">Center Right</option>
                                                            <option value="left bottom">Bottom Left</option>
                                                            <option value="center bottom">Bottom Center</option>
                                                            <option value="right bottom">Bottom Right</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image Size</label>
                                                        <select className="input" value={settings.media?.heroSize || 'cover'} onChange={(e) => setSettings({ ...settings, media: { ...settings.media, heroSize: e.target.value } })}>
                                                            <option value="cover">Cover (Fill Area)</option>
                                                            <option value="contain">Contain (Fit Inside)</option>
                                                            <option value="auto">Auto (Original Size)</option>
                                                            <option value="100% auto">Full Width</option>
                                                            <option value="auto 100%">Full Height</option>
                                                            <option value="50%">50% (Smaller)</option>
                                                            <option value="75%">75%</option>
                                                            <option value="125%">125% (Larger)</option>
                                                            <option value="150%">150% (Much Larger)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Height</label>
                                                        <select className="input" value={settings.media?.heroHeight || '80vh'} onChange={(e) => setSettings({ ...settings, media: { ...settings.media, heroHeight: e.target.value } })}>
                                                            <option value="50vh">Small (50vh)</option>
                                                            <option value="60vh">Medium (60vh)</option>
                                                            <option value="70vh">Tall (70vh)</option>
                                                            <option value="80vh">Extra Tall (80vh)</option>
                                                            <option value="90vh">Near Fullscreen (90vh)</option>
                                                            <option value="100vh">Fullscreen (100vh)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo URL</label>
                                                <input type="text" className="input" placeholder="e.g. /images/logo.png" value={settings.media?.logo || ''} onChange={(e) => setSettings({ ...settings, media: { ...settings.media, logo: e.target.value } })} />
                                                <p className="text-xs text-gray-500 mt-1">Leave blank to use text-based logo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || uploadingImage}
                                    className={`btn btn-primary ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Live Storefront Preview */}
                <div className="flex-1 bg-gray-100 relative h-full flex flex-col overflow-hidden">
                    <PreviewFrame settings={settings} />
                </div>
            </div>
        </div>
    );
}
