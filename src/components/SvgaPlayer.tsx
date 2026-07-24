import React, { useEffect, useRef } from 'react';
import { BACKEND_URL } from '../services/api';

interface SvgaPlayerProps {
    src: string;
    style?: React.CSSProperties;
    className?: string;
}

const SvgaPlayer: React.FC<SvgaPlayerProps> = ({ src, style, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const getFullUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const uploadsIndex = url.indexOf('uploads');
        if (uploadsIndex !== -1) {
            let path = url.substring(uploadsIndex);
            return `${BACKEND_URL}/${path}`;
        }
        let cleanUrl = url.startsWith('/') ? url : `/${url}`;
        if (!cleanUrl.startsWith('/uploads')) cleanUrl = `/uploads${cleanUrl}`;
        return `${BACKEND_URL}${cleanUrl}`;
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
            const parser = new SVGA.Parser(); // Parser does not require a selector/element
            
            const fullUrl = getFullUrl(src);

            parser.load(
                fullUrl,
                (videoItem: any) => {
                    player.setVideoItem(videoItem);
                    player.startAnimation();
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
