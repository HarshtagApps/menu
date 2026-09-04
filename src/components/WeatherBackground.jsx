import React from 'react';
import '../styles/weather-background.css';

/**
 * Full-screen weather-app style backdrop.
 * Weather status drives sky + FX; night stacks (stars/moon) without replacing weather.
 */
export default function WeatherBackground({
  status = null,
  isNight = false,
  ready = false,
}) {
  const weatherClass = status ? `is-${status}` : 'is-clear';

  return (
    <div
      className={[
        'weather-bg',
        weatherClass,
        isNight ? 'is-night' : 'is-day',
        ready ? 'is-ready' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <div className="weather-bg-sky" />
      <div className="weather-bg-glow" />
      <div className="weather-bg-stars" />
      <div className="weather-bg-moon" />
      <div className="weather-bg-sun" />
      <div className="weather-bg-clouds weather-bg-clouds--back" />
      <div className="weather-bg-clouds weather-bg-clouds--front" />
      <div className="weather-bg-fog" />
      <div className="weather-bg-rain">
        <div className="weather-bg-rain-sheet weather-bg-rain-sheet--fast" />
        <div className="weather-bg-rain-sheet weather-bg-rain-sheet--slow" />
      </div>
      <div className="weather-bg-snow" />
      <div className="weather-bg-lightning" />
      <div className="weather-bg-vignette" />
    </div>
  );
}
