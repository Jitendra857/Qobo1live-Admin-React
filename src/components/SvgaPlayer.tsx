import React, { useEffect, useRef } from 'react';

interface SvgaPlayerProps {
    src: string;
    style?: React.CSSProperties;
    className?: string;
}

const SvgaPlayer: React.FC<SvgaPlayerProps> = ({ src, style, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const SVGA = (window as any).SVGA;
        if (!SVGA) {
            console.error('SVGA global variable not found. Is svgaplayerweb loaded?');
            return;
        }

        try {
            const player = new SVGA.Player(canvasRef.current);
            const parser = new SVGA.Parser(); // Parser does not require a selector/element

            parser.load(
                src,
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
        <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: '100%', display: 'block', ...style }} 
            className={className}
        />
    );
};

export default SvgaPlayer;
