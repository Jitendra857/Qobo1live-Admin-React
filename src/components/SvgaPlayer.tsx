import React, { useEffect, useRef } from 'react';
import { BACKEND_URL } from '../services/api';

interface SvgaPlayerProps {
    src: string;
    style?: React.CSSProperties;
    className?: string;
    mute?: boolean;
}

// Global in-memory cache for parsed SVGA video items to prevent duplicate network downloads
const svgaCache = new Map<string, any>();

const SvgaPlayer: React.FC<SvgaPlayerProps> = ({ src, style, className, mute = true }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const getFullUrl = (url?: string) => {
        if (!url) return '';
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

        let targetUrl = url;
        if (isHttps && targetUrl.startsWith('http://')) {
            targetUrl = targetUrl.replace('http://', 'https://');
        }

        let resolvedBackend = BACKEND_URL;
        if (isHttps && resolvedBackend.startsWith('http://')) {
            resolvedBackend = resolvedBackend.replace('http://', 'https://');
        }

        if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) return targetUrl;
        const uploadsIndex = targetUrl.indexOf('uploads');
        if (uploadsIndex !== -1) {
            let path = targetUrl.substring(uploadsIndex);
            return `${resolvedBackend}/${path}`;
        }
        let cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
        if (!cleanUrl.startsWith('/uploads')) cleanUrl = `/uploads${cleanUrl}`;
        return `${resolvedBackend}${cleanUrl}`;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear existing canvas elements inside container
        containerRef.current.innerHTML = '';
        
        const SVGA = (window as any).SVGA;
        if (!SVGA) {
            console.error('SVGA global variable not found. Is svgaplayerweb loaded?');
            return;
        }

        try {
            const player = new SVGA.Player(containerRef.current);
            const parser = new SVGA.Parser();
            
            const fullUrl = getFullUrl(src);
            if (!fullUrl) return;

            // Use cached parsed SVGA item if available for instant playback
            if (svgaCache.has(fullUrl)) {
                const cachedVideoItem = svgaCache.get(fullUrl);
                player.setVideoItem(cachedVideoItem);
                player.startAnimation();
                return () => {
                    try {
                        player.stopAnimation();
                        player.clear();
                    } catch (e) {}
                };
            }

            parser.load(
                fullUrl,
                (videoItem: any) => {
                    if (mute && videoItem) {
                        // strip audio completely so no sound plays in catalog/listing
                        if (videoItem.audios) videoItem.audios = [];
                        if (videoItem.audioList) videoItem.audioList = [];
                        if (videoItem.audio) videoItem.audio = null;
                    }
                    svgaCache.set(fullUrl, videoItem);
                    if (containerRef.current) {
                        player.setVideoItem(videoItem);
                        player.startAnimation();
                    }
                },
                (error: any) => {
                    console.error('SVGA load error:', error, 'for source:', src);
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
    }, [src]);

    return (
        <div 
            ref={containerRef} 
            style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }} 
            className={className}
        />
    );
};

export default SvgaPlayer;
