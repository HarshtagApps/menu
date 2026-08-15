import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import '../styles/styles.css';
import '../styles/gallery.css';

function parseGalleryUrls(raw) {
  return String(raw || '')
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

const Gallery = ({ restaurantData }) => {
  const navigate = useNavigate();
  const restoName =
    restaurantData?.restoDetails?.restoName?.trim() || 'Restaurant';
  const images = parseGalleryUrls(restaurantData?.restoDetails?.gallery || '');
  const [activeIndex, setActiveIndex] = useState(null);

  const closePreview = () => setActiveIndex(null);

  return (
    <div className="gallery-page">
      <div className="secondary-appbar">
        <div className="appbar-content">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ChevronLeft size={30} strokeWidth={2} />
          </button>
          <div className="appbar-title">Gallery</div>
        </div>
        <div className="appbar-border"></div>
      </div>

      <div className="gallery-container">
        {images.length === 0 ? (
          <div className="gallery-empty">No photos yet</div>
        ) : (
          <div className="gallery-grid">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className="gallery-cell"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open photo ${index + 1}`}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && images[activeIndex] ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <div
            className="gallery-preview-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-preview-header">
              <span className="gallery-preview-name">{restoName}</span>
              <button
                type="button"
                className="gallery-preview-close"
                aria-label="Close"
                onClick={closePreview}
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <img
              src={images[activeIndex]}
              alt=""
              className="gallery-preview-image"
            />
          </div>
          <div className="gallery-preview-powered">
            <div className="gallery-preview-powered-label">Powered by</div>
            <div className="gallery-preview-powered-brand">HARSHTAG</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Gallery;
