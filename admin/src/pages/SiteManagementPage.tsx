import React, { useState, useEffect } from 'react';
import { settingsApi, uploadApi } from '../services/api';
import PreviewFrame from '../components/customizer/PreviewFrame';

// Subcomponents
import BrandingSettings from '../components/settings/BrandingSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import HomepageSettings from '../components/settings/HomepageSettings';
import HeroSettings from '../components/settings/HeroSettings';
import ArrivalsSettings from '../components/settings/ArrivalsSettings';
import FeaturedCollectionSettings from '../components/settings/FeaturedCollectionSettings';
import NavigationSettings from '../components/settings/NavigationSettings';
import HeaderSettings from '../components/settings/HeaderSettings';
import ProductPageSettings from '../components/settings/ProductPageSettings';

type TabType = 'general' | 'appearance' | 'navigation' | 'homepage';

export default function SiteManagementPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsApi.get();
            if (response.data.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setErrorMessage('Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
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
                const newSettings = { ...settings };
                newSettings.media.heroBackground = response.data.url;
                setSettings(newSettings);
            }
        } catch (error) {
            setErrorMessage('Failed to upload image.');
        } finally {
            setUploadingImage(false);
        }
    };

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const navTabs = [
        { id: 'general', label: 'General' },
        { id: 'appearance', label: 'Appearance' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'homepage', label: 'Home Page' },
    ];

    const getPreviewTab = () => {
        switch (activeTab) {
            case 'general': return 'branding';
            case 'appearance': return 'theme';
            case 'navigation': return 'navigation';
            case 'homepage': return 'content';
            default: return 'theme';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab Header */}
            <div className="border-b border-gray-100 px-6 pt-4 flex flex-col justify-between h-28 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Site Management</h1>
                        <p className="text-sm text-gray-500">Configure your store's appearance and behavior</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {successMessage && <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">{successMessage}</span>}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${isSaving
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-terracotta text-white hover:bg-orange-700 active:scale-95'
                                }`}
                        >
                            {isSaving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>

                <div className="flex space-x-8">
                    {navTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 -mb-px px-1 ${activeTab === tab.id
                                    ? 'text-terracotta border-terracotta'
                                    : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden bg-white">
                {/* Scrollable Config Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border-r border-gray-50 bg-white">
                    <div className="max-w-3xl p-8 pb-20 space-y-12 bg-white">
                        {activeTab === 'general' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Identity & Branding</h3>
                                    <BrandingSettings settings={settings} setSettings={setSettings} />
                                </section>
                                <section className="pt-10 border-t border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Product Layout Defaults</h3>
                                    <ProductPageSettings settings={settings} setSettings={setSettings} />
                                </section>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Theme Aesthetics</h3>
                                    <ThemeSettings settings={settings} setSettings={setSettings} />
                                </section>
                                <section className="pt-10 border-t border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Global Section Controls</h3>
                                    <HomepageSettings settings={settings} setSettings={setSettings} setActiveTab={() => { }} />
                                </section>
                            </div>
                        )}

                        {activeTab === 'navigation' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Header Controls</h3>
                                    <HeaderSettings settings={settings} setSettings={setSettings} />
                                </section>
                                <section className="pt-10 border-t border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Navigation Menus</h3>
                                    <NavigationSettings settings={settings} setSettings={setSettings} />
                                </section>
                            </div>
                        )}

                        {activeTab === 'homepage' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Hero Banner</h3>
                                    <HeroSettings settings={settings} setSettings={setSettings} handleImageUpload={handleImageUpload} uploadingImage={uploadingImage} />
                                </section>
                                <section className="pt-10 border-t border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">New Arrivals</h3>
                                    <ArrivalsSettings settings={settings} setSettings={setSettings} handleImageUpload={handleImageUpload} uploadingImage={uploadingImage} />
                                </section>
                                <section className="pt-10 border-t border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Featured Collections</h3>
                                    <FeaturedCollectionSettings settings={settings} setSettings={setSettings} />
                                </section>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview Pane */}
                <div className="w-[450px] xl:w-[600px] bg-gray-50 flex flex-col items-center justify-center border-l border-gray-100 overflow-hidden relative group">
                    <div className="absolute top-4 left-4 z-20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm border border-gray-100">Live Preview</span>
                    </div>
                    <div className="w-full h-full transform scale-[0.98] transition-all origin-center">
                        <PreviewFrame settings={settings} activeTab={getPreviewTab()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
