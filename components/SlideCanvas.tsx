
import React from 'react';
import { SlideData } from '../types';
import { IconRenderer } from './IconRenderer';

interface SlideCanvasProps {
  data: SlideData;
  onUpdate: (data: Partial<SlideData>) => void;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ data, onUpdate }) => {
  const safeId = data.id.replace(/[^a-zA-Z0-9]/g, '');
  const slideIdClass = `slide-${safeId}`;

  return (
    <div
      id={`slide-export-container-${data.id}`}
      className={`poster-root ${slideIdClass}`}
      dir="rtl"
      style={{ backgroundColor: data.backgroundColor }}
    >
      <style>
        {`
          .${slideIdClass} .poster-headline { color: ${data.primaryColor}; }
          .${slideIdClass} .poster-highlight { color: ${data.secondaryColor}; }
          .${slideIdClass} .poster-subheader { color: ${data.primaryColor}; }
          .${slideIdClass} .line-decorator { background-color: ${data.secondaryColor}; }
          .${slideIdClass} .poster-point-icon { color: ${data.primaryColor}; }
          .${slideIdClass} .poster-point-title { color: ${data.textColor}; }
          .${slideIdClass} .poster-logo-text { color: ${data.primaryColor}; }
          .${slideIdClass} .poster-logo-bg { background-color: ${data.primaryColor}1A; }
          .${slideIdClass} .poster-logo-icon { color: ${data.primaryColor}; }
          .${slideIdClass} .poster-top-brand-text { color: ${data.primaryColor}; }
          ${data.customCss ? `.${slideIdClass} ${data.customCss}` : ''}
        `}
      </style>

      {/* Custom Logo (Top Left) */}
      {data.logoUrl && (
        <div className="poster-custom-logo-wrapper">
          <img
            src={data.logoUrl}
            alt="Logo"
            crossOrigin="anonymous"
            className="poster-custom-logo-img"
          />
        </div>
      )}

      {/* Arabic Brand (Top Left) */}


      {/* English Brand (Top Right) */}


      {/* Top Decorative Lines */}
      <div className="decorative-bg">
        <svg viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 50C100 0 300 100 400 50V0H0V50Z" fill={data.primaryColor} />
          <path d="M0 70C100 20 300 120 400 70" stroke={data.primaryColor} strokeWidth="0.5" />
          <path d="M0 90C100 40 300 140 400 90" stroke={data.primaryColor} strokeWidth="0.5" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="poster-header-container">
        <h1 className="poster-headline">
          {data.header}
        </h1>
        <h2 className="poster-highlight">
          {data.highlightedHeader}
        </h2>

        <div className="poster-subheader-wrapper">
          <div className="line-decorator"></div>
          <p className="poster-subheader">
            {data.subHeader}
          </p>
          <div className="line-decorator"></div>
        </div>
      </div>

      {/* Grid of Points */}
      <div className="poster-points-grid">
        {data.points.map((point) => (
          <div key={point.id} className="poster-point">
            <div className="poster-point-icon">
              <IconRenderer name={point.icon} size={28} />
            </div>
            <p className="poster-point-title">
              {point.title}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Image & Logos */}
      <div className="poster-footer">
        <div className="poster-image-container">
          <img
            src={data.footerImage}
            alt="Context"
            crossOrigin="anonymous"
            className="poster-footer-image"
          />
        </div>

        <div className="poster-logo-bar">
          <div className="poster-brand-group">
            <div className="poster-logo-bg">
              <IconRenderer name="Zap" size={14} className="poster-logo-icon" />
            </div>
            <span className="poster-logo-text">منصة المستثمر الاقتصادية</span>
          </div>
          <div className="poster-social-icons">
            <IconRenderer name="Facebook" size={18} className="poster-logo-icon" />
            <IconRenderer name="Twitter" size={18} className="poster-logo-icon" />
            <IconRenderer name="Linkedin" size={18} className="poster-logo-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};