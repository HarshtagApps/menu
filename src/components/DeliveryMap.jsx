import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProjectImages } from '../utils/menuData';

function makeRestoIcon(label, imageUrl) {
  const safeLabel = String(label || 'Restaurant').replace(/</g, '');
  const html = imageUrl
    ? `<div class="delivery-map-resto-pin" title="${safeLabel}">
        <img class="delivery-map-resto-pin-img" src="${imageUrl}" alt="" />
      </div>`
    : `<div class="delivery-map-resto-pin" title="${safeLabel}">
        <span class="delivery-map-resto-pin-dot"></span>
      </div>`;
  return L.divIcon({
    className: 'delivery-map-resto-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

function makeUserIcon(imageUrl = ProjectImages.homeMarker) {
  return L.divIcon({
    className: 'delivery-map-user-marker',
    html: `<div class="delivery-map-user-pin">
      <img class="delivery-map-user-pin-img" src="${imageUrl}" alt="" />
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

export default function DeliveryMap({
  restoLat,
  restoLng,
  restoName,
  restoLogoUrl,
  customerCoords,
  onChange,
  className = '',
  focusKey = 0,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const restoIcon = makeRestoIcon(restoName, restoLogoUrl);
    L.marker([restoLat, restoLng], { icon: restoIcon, keyboard: false })
      .addTo(map)
      .bindPopup(
        `<strong>${String(restoName || 'Restaurant').replace(/</g, '')}</strong>`
      );

    const placeUserPin = (latlng) => {
      const lat = latlng.lat;
      const lng = latlng.lng;
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([lat, lng], {
          icon: makeUserIcon(),
          keyboard: false,
          draggable: true,
        }).addTo(map);
        userMarkerRef.current.__dragBound = false;
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
      }
      if (!userMarkerRef.current.__dragBound) {
        userMarkerRef.current.__dragBound = true;
        userMarkerRef.current.on('dragend', (e) => {
          if (!onChangeRef.current) return;
          const { lat: dLat, lng: dLng } = e.target.getLatLng();
          onChangeRef.current({ lat: dLat, lng: dLng });
        });
      }
      if (onChangeRef.current) {
        onChangeRef.current({ lat, lng });
      }
    };

    // Place pin on click/drag so dialog can close after selection
    map.on('click', (e) => {
      placeUserPin(e.latlng);
    });

    map.setView([restoLat, restoLng], 14);

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 120);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoLat, restoLng]);

  // Focus map when GPS / external pin updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !customerCoords || !focusKey) return;
    map.setView([customerCoords.lat, customerCoords.lng], 15, { animate: true });
  }, [customerCoords, focusKey]);

  // Sync user marker when customerCoords change (e.g. GPS button)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !customerCoords) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(
        [customerCoords.lat, customerCoords.lng],
        { icon: makeUserIcon(), keyboard: false, draggable: true }
      ).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([customerCoords.lat, customerCoords.lng]);
    }
    // Attach drag once — use a flag so we don't re-bind every GPS update
    if (!userMarkerRef.current.__dragBound) {
      userMarkerRef.current.__dragBound = true;
      userMarkerRef.current.on('dragend', (e) => {
        if (!onChangeRef.current) return;
        const { lat: dLat, lng: dLng } = e.target.getLatLng();
        onChangeRef.current({ lat: dLat, lng: dLng });
      });
    }
  }, [customerCoords]);

  return (
    <div className={`delivery-map-wrap ${className}`.trim()}>
      <div ref={mapRef} className="delivery-map" />
    </div>
  );
}
