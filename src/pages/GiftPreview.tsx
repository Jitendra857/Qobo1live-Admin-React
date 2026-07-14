import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const GiftPreview: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const name = searchParams.get('name') || 'Asset Preview';
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !url) return;

        const SVGA = (window as any).SVGA;
        if (!SVGA) {
            console.error('SVGA web player library not loaded');
            return;
        }

        // Clear any existing content
        containerRef.current.innerHTML = '';

        try {
            const player = new SVGA.Player(containerRef.current);
            const parser = new SVGA.Parser();

            parser.load(
                url,
                (videoItem: any) => {
                    player.setVideoItem(videoItem);
                    player.startAnimation();
                    console.log("SVGA animation started successfully!");
                },
                (error: any) => {
                    console.error("Failed to load SVGA:", error);
                }
            );

            return () => {
                try {
                    player.stopAnimation();
                    player.clear();
                } catch (e) {
                    // Ignore cleanup error
                }
            };
        } catch (err) {
            console.error('SVGA player initialization failed:', err);
        }
    }, [url]);

    const isSvgaUrl = (src: string | null | undefined): boolean => {
        if (!src) return false;
        const low = src.toLowerCase();
        return low.includes('.svga') || 
               (low.includes('/gifts/animations/') && !low.endsWith('.json') && !low.endsWith('.gif'));
    };

    return (
        <div style={{
            backgroundColor: '#121212',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <h2 style={{ color: '#ffffff', fontFamily: 'sans-serif', textAlign: 'center' }}>SVGA Player - {name}</h2>
            <p style={{ color: '#ffffff', fontFamily: 'sans-serif', textAlign: 'center', opacity: 0.8 }}>Testing Cloud Animation File</p>

            {url ? (
                isSvgaUrl(url) ? (
                    <div 
                        ref={containerRef}
                        id="animation-container"
                        style={{
                            width: '500px',
                            height: '500px',
                            margin: '30px auto',
                            backgroundColor: '#1a1a1a',
                            border: '2px dashed #333',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}
                    />
                ) : (
                    <div 
                        id="animation-container"
                        style={{
                            width: '500px',
                            height: '500px',
                            margin: '30px auto',
                            backgroundColor: '#1a1a1a',
                            border: '2px dashed #333',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img 
                            src={url} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                )
            ) : (
                <div style={{ color: '#666' }}>No animation URL provided</div>
            )}
        </div>
    );
};

export default GiftPreview;
