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
    if (url.startsWith('http')) return url;
    
    // If it's the default profile pic string, we can either point to a real default or just return null to show the letter
    if (url === 'default_dp.png' || url === 'default.png') return null;

    // Ensure it starts with /uploads
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    // If the path doesn't include /uploads, but it's a relative path, prepend it
    // Some older records might just have "profiles/img.jpg"
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads${cleanUrl}`;
    }

    return `${BACKEND_URL}${cleanUrl}`;
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
        // If image fails to load, show fallback
        (e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLElement).parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.className = className || '';
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
