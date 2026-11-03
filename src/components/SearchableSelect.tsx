import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  prefixIcon?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  prefixIcon,
  width,
  height = 42,
  disabled = false,
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase().trim();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(q)) ||
      opt.value.toLowerCase().includes(q)
    );
  }, [options, searchTerm]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: width || 'auto',
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: 'var(--input-bg, #131b2e)',
          border: isOpen
            ? '1px solid var(--accent-primary, #8b5cf6)'
            : '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
          borderRadius: '12px',
          padding: '0 12px',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(139, 92, 246, 0.25)' : 'none',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {prefixIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{prefixIcon}</span>}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: selectedOption ? 'var(--text-primary, #f8fafc)' : 'var(--text-secondary, #94a3b8)',
              fontWeight: 700
            }}
            title={selectedOption?.label || placeholder}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--text-secondary, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: 'max(100%, 250px)',
            maxHeight: '320px',
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '14px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            zIndex: 1050,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'dropdownFadeIn 0.15s ease'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              marginBottom: '6px'
            }}
          >
            <Search size={14} style={{ color: 'var(--text-secondary, #94a3b8)', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '2px'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                No matching options
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      color: isSelected ? '#c4b5fd' : 'var(--text-primary, #f8fafc)',
                      fontSize: '0.83rem',
                      fontWeight: isSelected ? 800 : 600,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={option.label}
                      >
                        {option.label}
                      </div>
                      {option.subLabel && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: isSelected ? '#a78bfa' : 'var(--text-secondary, #94a3b8)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '1px'
                          }}
                        >
                          {option.subLabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
