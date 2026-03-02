import React, { useState, useEffect, useRef } from 'react';

interface PreviewFrameProps {
    settings: any;
    activeTab?: string;
}

export default function PreviewFrame({ settings, activeTab }: PreviewFrameProps) {
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Determine the preview URL based on the active tab
    const previewUrl = activeTab === 'selectPage' ? '/Select' : '/';

    // Send settings diffs securely to the store frontend
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            // Send the settings over postMessage
            iframeRef.current.contentWindow.postMessage(
                { type: 'STOREFRONT_PREVIEW_UPDATE', settings },
                '*'
            );
        }
    }, [settings, previewUrl]);

    return (
        <div className="flex flex-col h-full bg-gray-100 border-l border-gray-200">
            {/* Top Action Bar */}
            <div className="flex items-center justify-center p-2 bg-white border-b border-gray-200 gap-2">
                <button
                    onClick={() => setDevice('desktop')}
                    className={`p-2 rounded ${device === 'desktop' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Desktop View"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
                <button
                    onClick={() => setDevice('mobile')}
                    className={`p-2 rounded ${device === 'mobile' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Mobile View"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {/* Frame Container */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-gray-100">
                <div
                    className="bg-white shadow-xl rounded-b-md overflow-hidden transition-all duration-300 ease-in-out border border-gray-200"
                    style={{
                        width: device === 'desktop' ? '100%' : '375px',
                        height: '100%',
                        maxWidth: device === 'desktop' ? '1280px' : '375px'
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full h-full border-none"
                        title="Storefront Preview"
                    />
                </div>
            </div>
        </div>
    );
}
