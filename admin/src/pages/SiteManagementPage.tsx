import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { settingsApi, uploadApi } from '../services/api';

export default function SiteManagementPage() {
    const [activeTab, setActiveTab] = useState<'branding' | 'settings' | 'layout' | 'content' | 'navigation'>('settings');
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
            newArrivalsEnabled: true, valuePropsEnabled: true, newsletterEnabled: true
        },
        content: {
            hero: { title: '', subtitle: '', ctaText: '', ctaLink: '' },
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
        media: { logo: '', favicon: '', heroBackground: '' },
        contact: { email: '' },
        footer: { copyright: '' },
    });

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
        <div>
            <Header
                title="Site Management"
                subtitle="Manage global layout, content, and aesthetics"
            />

            {successMessage && (
                <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="mb-6 flex space-x-4 border-b border-gray-200 overflow-x-auto">
                {['settings', 'branding', 'layout', 'content', 'navigation'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab
                            ? 'border-terracotta text-terracotta'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="card max-w-4xl">
                <form onSubmit={handleSave}>
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
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Toggle Sections</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(settings.layout).map((key) => (
                                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                                        <span className="font-medium capitalize">{key.replace('Enabled', '')} Section</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={(settings.layout as any)[key]} onChange={(e) => setSettings({ ...settings, layout: { ...settings.layout, [key]: e.target.checked } })} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                        </label>
                                    </div>
                                ))}
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
                                    {settings.navigation?.headerLinks?.map((link: any, idx) => (
                                        <div key={idx} className="flex space-x-2">
                                            <input type="text" placeholder="Label" className="input w-1/3" value={link.label} onChange={(e) => { const newLinks = [...settings.navigation.headerLinks]; (newLinks[idx] as any).label = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} />
                                            <input type="text" placeholder="URL" className="input flex-1" value={link.url} onChange={(e) => { const newLinks = [...settings.navigation.headerLinks]; (newLinks[idx] as any).url = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} />
                                            <button type="button" onClick={() => { const newLinks = settings.navigation.headerLinks.filter((_, i) => i !== idx); setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: newLinks } }) }} className="btn btn-secondary text-red-600">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setSettings({ ...settings, navigation: { ...settings.navigation, headerLinks: [...(settings.navigation?.headerLinks || []), { label: '', url: '' }] as any } })} className="text-sm text-terracotta font-medium mt-2">+ Add Header Link</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Footer Links</h3>
                                <div className="space-y-2">
                                    {settings.navigation?.footerLinks?.map((link: any, idx) => (
                                        <div key={idx} className="flex space-x-2">
                                            <input type="text" placeholder="Label" className="input w-1/3" value={link.label} onChange={(e) => { const newLinks = [...settings.navigation.footerLinks]; (newLinks[idx] as any).label = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} />
                                            <input type="text" placeholder="URL" className="input flex-1" value={link.url} onChange={(e) => { const newLinks = [...settings.navigation.footerLinks]; (newLinks[idx] as any).url = e.target.value; setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} />
                                            <button type="button" onClick={() => { const newLinks = settings.navigation.footerLinks.filter((_, i) => i !== idx); setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: newLinks } }) }} className="btn btn-secondary text-red-600">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setSettings({ ...settings, navigation: { ...settings.navigation, footerLinks: [...(settings.navigation?.footerLinks || []), { label: '', url: '' }] as any } })} className="text-sm text-terracotta font-medium mt-2">+ Add Footer Link</button>
                                </div>
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
    );
}
