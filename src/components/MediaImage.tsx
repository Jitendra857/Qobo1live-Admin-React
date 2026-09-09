import React from 'react';
import { BACKEND_URL } from '../services/api';

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
}

const MediaImage: React.FC<MediaImageProps> = ({ 
  src, 
  fallbackText, 
  fallbackIcon, 
  className, 
  ...props 
}) => {
  const getFullUrl = (url?: string) => {
    if (!url) return null;
    
    // If it's the default profile pic string, return null to show fallback
    if (url === 'default_dp.png' || url === 'default.png') return null;

    let targetUrl = url;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // Upgrade http:// to https:// if window is running on https protocol
    if (isHttps && targetUrl.startsWith('http://')) {
      targetUrl = targetUrl.replace('http://', 'https://');
    }

    let resolvedBackend = BACKEND_URL;
    if (isHttps && resolvedBackend.startsWith('http://')) {
      resolvedBackend = resolvedBackend.replace('http://', 'https://');
    }

    // If it's an uploaded asset, extract the clean path from '/uploads' or 'uploads' onwards
    const uploadsIndex = targetUrl.indexOf('uploads');
    if (uploadsIndex !== -1) {
      let path = targetUrl.substring(uploadsIndex);
      let cleanUrl = path.startsWith('/') ? path : `/${path}`;
      return `${resolvedBackend}${cleanUrl}`;
    }

    // Keep external absolute URLs and Data URIs
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('data:')) {
      return targetUrl;
    }

    // Ensure it starts with /uploads
    let cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads${cleanUrl}`;
    }

    return `${resolvedBackend}${cleanUrl}`;
  };

  const fullUrl = getFullUrl(src);

  if (!fullUrl) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
        {fallbackIcon || <span>{fallbackText || 'N/A'}</span>}
      </div>
    );
  }

  return (
    <img 
      src={fullUrl} 
      className={className} 
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        // If image failed with http, try upgrading to https
        if (img.src && img.src.startsWith('http://')) {
          img.src = img.src.replace('http://', 'https://');
          return;
        }
        // If image still fails to load, show fallback
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.media-image-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = `${className || ''} media-image-fallback`;
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          fallback.style.background = 'rgba(255,255,255,0.05)';
          fallback.innerHTML = fallbackText || 'N/A';
          parent.appendChild(fallback);
        }
      }}
      {...props} 
    />
  );
};

export default MediaImage;
