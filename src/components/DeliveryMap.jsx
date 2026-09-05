import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { ProjectImages } from '../utils/menuData';
import { requestUserLocation } from '../utils/delivery';

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
  onLocateError,
  className = '',
  focusKey = 0,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onLocateErrorRef = useRef(onLocateError);
  const [locating, setLocating] = useState(false);
  onChangeRef.current = onChange;
  onLocateErrorRef.current = onLocateError;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    const streets = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        maxNativeZoom: 17,
        attribution: 'Tiles &copy; Esri',
      }
    );
    streets.addTo(map);
    L.control
      .layers(
        {
          Streets: streets,
          Satellite: satellite,
        },
        null,
        { position: 'topright', collapsed: true }
      )
      .addTo(map);

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

  const locateUser = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    try {
      const user = await requestUserLocation({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
      if (user.accuracy != null && user.accuracy > 3000) {
        onLocateErrorRef.current?.(
          'Location accuracy is too low. Drop a pin on the map instead.'
        );
        return;
      }
      if (onChangeRef.current) {
        onChangeRef.current({ lat: user.lat, lng: user.lng });
      }
    } catch (err) {
      if (err.code === 'GEO_DENIED') {
        onLocateErrorRef.current?.(
          'Location denied. Drop a pin on the map instead.'
        );
      } else if (err.code === 'GEO_INSECURE') {
        onLocateErrorRef.current?.(
          'Location needs HTTPS or localhost. Drop a pin on the map instead.'
        );
      } else if (err.code === 'GEO_TIMEOUT') {
        onLocateErrorRef.current?.(
          'Location timed out. Try again or drop a pin on the map.'
        );
      } else {
        onLocateErrorRef.current?.(
          'Could not get your location. Drop a pin on the map instead.'
        );
      }
    } finally {
      setLocating(false);
    }
  }, [locating]);

  return (
    <div className={`delivery-map-wrap ${className}`.trim()}>
      <div ref={mapRef} className="delivery-map" />
      <button
        type="button"
        className="delivery-map-gps-btn"
        onClick={locateUser}
        disabled={locating}
        title="Use my current location"
        aria-label="Use my current location"
      >
        <LocateFixed size={20} strokeWidth={2.2} className={locating ? 'is-spinning' : undefined} />
      </button>
    </div>
  );
}
