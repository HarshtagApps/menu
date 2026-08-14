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
  const images = parseGalleryUrls(restaurantData?.restoDetails?.gallery || '');
  const [activeIndex, setActiveIndex] = useState(null);

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
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
          >
            <X size={28} strokeWidth={2} />
          </button>
          <img
            src={images[activeIndex]}
            alt=""
            className="gallery-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Gallery;
