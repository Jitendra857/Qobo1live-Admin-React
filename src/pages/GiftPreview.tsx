import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../services/api';
import { Volume2, VolumeX, RotateCcw, Sparkles, Crown, Play, CheckCircle2, Music } from 'lucide-react';

const GiftPreview: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const soundUrl = searchParams.get('soundUrl') || searchParams.get('sound') || '';
    const name = searchParams.get('name') || 'Asset Preview';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const videoItemRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [hasAudioSource, setHasAudioSource] = useState(false);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    const [audioDetails, setAudioDetails] = useState<string | null>(null);

    const isEntryType = type === 'entry' || category.toLowerCase().includes('vip') || category.toLowerCase().includes('entry');

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
               (low.includes('/gifts/animations/') && !low.endsWith('.json') && !low.endsWith('.gif')) ||
               (low.includes('/raw/upload/') && (low.includes('/frames/') || low.includes('/gifts/')));
    };

    const unlockBrowserAudio = () => {
        try {
            const Howler = (window as any).Howler;
            if (Howler) {
                Howler.mute(false);
                if (Howler.ctx && Howler.ctx.state === 'suspended') {
                    Howler.ctx.resume().catch((err: any) => console.warn('AudioContext resume warning:', err));
                }
            }
            setIsAudioUnlocked(true);
        } catch (e) {
            console.warn('Audio unlock error:', e);
        }
    };

    const playAttachedSound = () => {
        unlockBrowserAudio();
        const effectiveSoundUrl = soundUrl || (isEntryType ? '/uploads/sounds/vip_entrance.mp3' : '');
        if (!effectiveSoundUrl) return;

        try {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            const fullSound = getFullUrl(effectiveSoundUrl);
            const audio = new Audio(fullSound);
            audio.volume = 0.9;
            audioRef.current = audio;
            
            setIsPlayingSound(true);
            audio.onended = () => setIsPlayingSound(false);
            audio.onerror = () => setIsPlayingSound(false);

            audio.play().catch(e => {
                console.warn("Autoplay blocked by browser policy. Click 'Replay Animation & Sound' to listen.", e);
                setIsPlayingSound(false);
            });
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    };

    const replayAnimationAndSound = () => {
        unlockBrowserAudio();

        if (playerRef.current) {
            try {
                playerRef.current.stopAnimation();
                playerRef.current.clear();
                if (videoItemRef.current) {
                    playerRef.current.setVideoItem(videoItemRef.current);
                }
                playerRef.current.startAnimation();
            } catch (e) {
                console.warn("Replay animation error:", e);
            }
        }

        if (soundUrl || (!hasAudioSource && isEntryType)) {
            playAttachedSound();
        }
    };

    const playSoundTrackDirectly = () => {
        unlockBrowserAudio();

        // 1. Check if SVGA has embedded sound in Howler bitmap cache
        try {
            const drawer = playerRef.current?._drawer;
            if (drawer && drawer._bitmapCache) {
                const keys = Object.keys(drawer._bitmapCache);
                let playedAny = false;
                keys.forEach(k => {
                    const item = drawer._bitmapCache[k];
                    if (item && typeof item.play === 'function') {
                        item.play();
                        playedAny = true;
                    }
                });
                if (playedAny) {
                    setIsPlayingSound(true);
                    setTimeout(() => setIsPlayingSound(false), 3000);
                    return;
                }
            }
        } catch (e) {
            console.warn("Direct embedded audio playback check:", e);
        }

        // 2. Play attached sound
        playAttachedSound();
    };

    useEffect(() => {
        // Unlock audio on any click/touch inside this preview tab
        const handleUserGesture = () => {
            unlockBrowserAudio();
        };

        window.addEventListener('click', handleUserGesture);
        window.addEventListener('touchstart', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);

        // Pre-unmute Howler
        const Howler = (window as any).Howler;
        if (Howler) {
            Howler.mute(false);
        }

        if (soundUrl) {
            setHasAudioSource(true);
            setAudioDetails('External Audio Track Attached');
            playAttachedSound();
        }

        if (!containerRef.current || !url) {
            return () => {
                window.removeEventListener('click', handleUserGesture);
                window.removeEventListener('touchstart', handleUserGesture);
                window.removeEventListener('keydown', handleUserGesture);
            };
        }

        const SVGA = (window as any).SVGA;
        if (!SVGA) {
            console.error('SVGA web player library not loaded in window');
            return () => {
                window.removeEventListener('click', handleUserGesture);
                window.removeEventListener('touchstart', handleUserGesture);
                window.removeEventListener('keydown', handleUserGesture);
            };
        }

        // Clear existing canvas
        containerRef.current.innerHTML = '';

        try {
            const player = new SVGA.Player(containerRef.current);
            playerRef.current = player;
            const parser = new SVGA.Parser();

            const fullUrl = getFullUrl(url);

            parser.load(
                fullUrl,
                (videoItem: any) => {
                    videoItemRef.current = videoItem;

                    const audios = videoItem?.audios || videoItem?.audioList || [];
                    if (audios.length > 0) {
                        setHasAudioSource(true);
                        const track = audios[0];
                        const durationSec = track.totalTime ? (track.totalTime / 1000).toFixed(1) : null;
                        setAudioDetails(`Embedded SVGA Audio: ${audios.length} track(s)${durationSec ? ` (${durationSec}s)` : ''}`);
                    } else if (isEntryType) {
                        setAudioDetails('Entry Frame (Using Room Entrance Sound Fallback)');
                    }

                    player.setVideoItem(videoItem);
                    player.startAnimation();
                    console.log("SVGA animation started with sound active!");
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
                window.removeEventListener('click', handleUserGesture);
                window.removeEventListener('touchstart', handleUserGesture);
                window.removeEventListener('keydown', handleUserGesture);
            };
        } catch (err) {
            console.error('SVGA player initialization failed:', err);
            return () => {
                window.removeEventListener('click', handleUserGesture);
                window.removeEventListener('touchstart', handleUserGesture);
                window.removeEventListener('keydown', handleUserGesture);
            };
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
            <div style={{ marginBottom: '16px', maxWidth: '600px' }}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: isEntryType ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: isEntryType ? '#fbbf24' : '#818cf8',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    border: isEntryType ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)'
                }}>
                    {isEntryType ? <Crown size={15} /> : <Sparkles size={14} />} 
                    {isEntryType ? '👑 VIP Entry Frame Preview' : '✨ Gift Asset Preview'}
                </span>
                
                <h1 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: 900, margin: '8px 0 6px 0' }}>{name}</h1>
                
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
                    Sound playback is fully active in this verification tab.
                </p>

                {/* Autoplay Security Banner */}
                {!isAudioUnlocked && (
                    <div 
                        onClick={unlockBrowserAudio}
                        style={{
                            marginTop: '12px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px dashed #f59e0b',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            fontSize: '0.85rem',
                            color: '#fbbf24',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        <Volume2 size={16} />
                        <span>Click anywhere on this page to unmute sound (Browser Security Requirement)</span>
                    </div>
                )}
            </div>

            {/* Animation Viewer Canvas */}
            {url ? (
                isSvgaUrl(url) ? (
                    <div 
                        ref={containerRef}
                        id="animation-container"
                        onClick={replayAnimationAndSound}
                        title="Click to replay animation and sound"
                        style={{
                            width: '460px',
                            height: '460px',
                            maxWidth: '90vw',
                            maxHeight: '90vw',
                            margin: '12px auto',
                            backgroundColor: '#111827',
                            border: isEntryType ? '2px solid rgba(245, 158, 11, 0.4)' : '2px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: isEntryType ? '0 20px 45px -10px rgba(245, 158, 11, 0.25)' : '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                            cursor: 'pointer'
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
                            margin: '12px auto',
                            backgroundColor: '#111827',
                            border: '2px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '24px',
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

            {/* Playback Controls */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={replayAnimationAndSound}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '13px 24px',
                        borderRadius: '14px',
                        border: 'none',
                        background: isEntryType ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: isEntryType ? '0 4px 18px rgba(245, 158, 11, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.35)',
                        transition: 'transform 0.1s ease'
                    }}
                >
                    <RotateCcw size={18} />
                    <span>Replay Animation & Sound</span>
                </button>

                <button
                    onClick={playSoundTrackDirectly}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '13px 22px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        background: isPlayingSound ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    <Volume2 size={18} />
                    <span>{isPlayingSound ? 'Playing Audio...' : 'Play Sound Track'}</span>
                </button>
            </div>

            {/* Status indicator & Track details */}
            <div style={{ marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                {hasAudioSource ? (
                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> {audioDetails || 'Audio track detected & active'}
                    </span>
                ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Music size={15} /> Visual-only animation (Playing with room entrance audio fallback)
                    </span>
                )}
                
                {isAudioUnlocked ? (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Audio output is unmuted and synchronized with SVGA frames.
                    </span>
                ) : (
                    <span style={{ fontSize: '0.78rem', color: '#d97706' }}>
                        Click anywhere or press Replay to verify sound.
                    </span>
                )}
            </div>
        </div>
    );
};

export default GiftPreview;
