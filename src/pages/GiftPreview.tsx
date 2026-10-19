import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../services/api';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

const GiftPreview: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const soundUrl = searchParams.get('soundUrl') || searchParams.get('sound') || '';
    const name = searchParams.get('name') || 'Asset Preview';
    
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [hasAudioSource, setHasAudioSource] = useState(false);

    const getFullUrl = (urlStr?: string) => {
        if (!urlStr) return '';
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) return urlStr;
        const uploadsIndex = urlStr.indexOf('uploads');
        if (uploadsIndex !== -1) {
            let path = urlStr.substring(uploadsIndex);
            return `${BACKEND_URL}/${path}`;
        }
        let cleanUrl = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
        if (!cleanUrl.startsWith('/uploads')) cleanUrl = `/uploads${cleanUrl}`;
        return `${BACKEND_URL}${cleanUrl}`;
    };

    const isSvgaUrl = (src: string | null | undefined): boolean => {
        if (!src) return false;
        const low = src.toLowerCase();
        return low.includes('.svga') || 
               (low.includes('/gifts/animations/') && !low.endsWith('.json') && !low.endsWith('.gif'));
    };

    const playAttachedSound = () => {
        if (!soundUrl) return;
        try {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            const fullSound = getFullUrl(soundUrl);
            const audio = new Audio(fullSound);
            audio.volume = 0.8;
            audioRef.current = audio;
            
            setIsPlayingSound(true);
            audio.onended = () => setIsPlayingSound(false);
            audio.onerror = () => setIsPlayingSound(false);

            audio.play().catch(e => {
                console.warn("Autoplay blocked by browser policy. Click 'Replay Sound' to listen.", e);
                setIsPlayingSound(false);
            });
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    };

    const replayAnimation = () => {
        if (playerRef.current) {
            try {
                playerRef.current.startAnimation();
            } catch (e) {
                console.warn("Replay animation error:", e);
            }
        }
        if (soundUrl) {
            playAttachedSound();
        }
    };

    useEffect(() => {
        // Unmute Howler explicitly for this preview tab
        const Howler = (window as any).Howler;
        if (Howler) {
            Howler.mute(false);
        }

        if (soundUrl) {
            setHasAudioSource(true);
            playAttachedSound();
        }

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
            playerRef.current = player;
            const parser = new SVGA.Parser();

            const fullUrl = getFullUrl(url);

            parser.load(
                fullUrl,
                (videoItem: any) => {
                    // In this dedicated preview tab, do NOT mute: allow embedded sound tracks to play
                    if (videoItem && (videoItem.audios?.length > 0 || videoItem.audioList?.length > 0)) {
                        setHasAudioSource(true);
                    }
                    player.setVideoItem(videoItem);
                    player.startAnimation();
                    console.log("SVGA animation started with sound enabled!");
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
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            };
        } catch (err) {
            console.error('SVGA player initialization failed:', err);
        }
    }, [url, soundUrl]);

    return (
        <div style={{
            backgroundColor: '#0a0d14',
            color: '#ffffff',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            {/* Header info */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                }}>
                    <Sparkles size={14} /> Gift Asset Preview
                </span>
                <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, margin: '8px 0 4px 0' }}>{name}</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    Audio playback is active in this tab only. Catalog listing remains silent.
                </p>
            </div>

            {/* Animation Viewer Canvas */}
            {url ? (
                isSvgaUrl(url) ? (
                    <div 
                        ref={containerRef}
                        id="animation-container"
                        style={{
                            width: '460px',
                            height: '460px',
                            maxWidth: '90vw',
                            maxHeight: '90vw',
                            margin: '16px auto',
                            backgroundColor: '#111827',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
                        }}
                    />
                ) : (
                    <div 
                        id="animation-container"
                        style={{
                            width: '460px',
                            height: '460px',
                            maxWidth: '90vw',
                            maxHeight: '90vw',
                            margin: '16px auto',
                            backgroundColor: '#111827',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <img 
                            src={getFullUrl(url)} 
                            alt="Preview" 
                            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                        />
                    </div>
                )
            ) : (
                <div style={{ color: '#64748b', margin: '40px 0' }}>No animation URL provided</div>
            )}

            {/* Playback Controls & Status */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={replayAnimation}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                    }}
                >
                    <RotateCcw size={16} />
                    <span>Replay Animation</span>
                </button>

                {soundUrl && (
                    <button
                        onClick={playAttachedSound}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: isPlayingSound ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isPlayingSound ? <Volume2 size={16} /> : <Volume2 size={16} />}
                        <span>{isPlayingSound ? 'Playing Sound...' : 'Replay Sound Effect'}</span>
                    </button>
                )}
            </div>

            {/* Status indicator */}
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                {hasAudioSource ? (
                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Volume2 size={14} /> Audio track detected & ready
                    </span>
                ) : (
                    <span>Silent animation (No audio track attached)</span>
                )}
            </div>
        </div>
    );
};

export default GiftPreview;
