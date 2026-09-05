import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';
import Lottie from 'lottie-react';
import { motion, useReducedMotion } from 'motion/react';
import orderLottie from '../assets/orderLottie.json';
import WeatherBackground from '../components/WeatherBackground';
import { fetchRestoWeather, formatWeatherStatus, resolveWeatherSurcharge } from '../utils/weather';
import '../styles/styles.css';
import '../styles/delivery-charges.css';

const PAUSE_MS = 300;
const ROAD_DURATION_S = 0.75;
const STEP_DURATION_S = 0.5;
const stepEase = [0.21, 0.47, 0.32, 0.98];
const WX_TEST_STATUSES = new Set([
  'clear',
  'cloudy',
  'fog',
  'drizzle',
  'rain',
  'heavyrain',
  'storm',
  'snow',
]);

function SurchargeWeatherIcon({ status, isNight }) {
  const props = { size: 20, strokeWidth: 2 };
  if (status === 'storm') return <CloudLightning {...props} />;
  if (status === 'snow') return <CloudSnow {...props} />;
  if (status === 'heavyrain' || status === 'rain') return <CloudRain {...props} />;
  if (status === 'drizzle') return <CloudDrizzle {...props} />;
  if (status === 'fog') return <CloudFog {...props} />;
  if (status === 'cloudy') {
    return isNight ? <CloudMoon {...props} /> : <CloudSun {...props} />;
  }
  // clear / unknown
  if (isNight) return <Moon {...props} />;
  return <Sun {...props} />;
}

const stepMotion = {
  hidden: { opacity: 0, y: 18, scale: 0.88 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

const DeliveryCharges = ({ restaurantData }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('r');
  const wxTestRaw = (searchParams.get('wxTest') || '').toLowerCase();
  const wxTestStatus = WX_TEST_STATUSES.has(wxTestRaw) ? wxTestRaw : null;
  const wxTestNightParam = searchParams.get('night');
  const wxTestActive = wxTestStatus != null;
  const wxTestIsNight =
    wxTestNightParam === '1' || wxTestNightParam === 'true';
  const delivery = restaurantData?.restoDetails?.delivery;
  const mode = delivery?.mode || 'distance';
  const slabs = delivery?.slabs || [];
  const orderRates = delivery?.orderRates || [];
  const pricingRows =
    mode === 'order'
      ? orderRates.map((r) => ({
        key: `${r.minAmount}-${r.maxAmount}-${r.notAllowed ? 'NA' : r.ratePerKm}`,
        title:
          r.maxAmount === Infinity
            ? `Order of ₹${r.minAmount}+`
            : `Order of ₹${r.minAmount}–${r.maxAmount}`,
        price: r.notAllowed ? 'Not Available' : `₹${r.ratePerKm}/km`,
        isFree: false,
      }))
      : slabs.map((slab) => ({
        key: `${slab.minKm}-${slab.maxKm}-${slab.charge}`,
        title:
          slab.minKm === 0
            ? `Up to ${slab.maxKm} km`
            : `${slab.minKm}–${slab.maxKm} km`,
        price: slab.charge === 0 ? 'Free' : `₹${slab.charge}`,
        isFree: slab.charge === 0,
      }));
  const reduced = useReducedMotion();

  const wrapRef = useRef(null);
  const firstMarkerRef = useRef(null);
  const lastMarkerRef = useRef(null);
  const hasPlayedRef = useRef(false);

  const [revealedCount, setRevealedCount] = useState(0);
  const [roadProgress, setRoadProgress] = useState(0);
  const [spine, setSpine] = useState({ top: 0, height: 0 });
  const [liveSurcharge, setLiveSurcharge] = useState({
    amount: 0,
    reason: '',
    lines: [],
  });
  const [weatherReady, setWeatherReady] = useState(false);
  const [sceneWeather, setSceneWeather] = useState({
    status: null,
    isNight: false,
  });

  const stepCount = pricingRows.length;
  const segments = Math.max(stepCount - 1, 1);

  const updateSpine = useCallback(() => {
    const wrap = wrapRef.current;
    const first = firstMarkerRef.current;
    const last = lastMarkerRef.current;
    if (!wrap || !first || !last) return;

    const wrapTop = wrap.getBoundingClientRect().top;
    const firstCenter =
      first.getBoundingClientRect().top + first.offsetHeight / 2 - wrapTop;
    const lastCenter =
      last.getBoundingClientRect().top + last.offsetHeight / 2 - wrapTop;

    setSpine({
      top: firstCenter,
      height: Math.max(0, lastCenter - firstCenter),
    });
  }, []);

  useEffect(() => {
    if (!stepCount) return undefined;
    updateSpine();
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const ro = new ResizeObserver(updateSpine);
    ro.observe(wrap);
    window.addEventListener('resize', updateSpine);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSpine);
    };
  }, [updateSpine, stepCount, revealedCount]);

  useEffect(() => {
    if (reduced) {
      setRevealedCount(stepCount);
      setRoadProgress(1);
    }
  }, [reduced, stepCount]);

  useEffect(() => {
    if (wxTestActive) {
      const weather = {
        ok: true,
        status: wxTestStatus,
        isNight: wxTestIsNight,
      };
      setSceneWeather({
        status: wxTestStatus,
        isNight: wxTestIsNight,
      });
      setLiveSurcharge(resolveWeatherSurcharge(delivery, weather));
      setWeatherReady(true);
      return undefined;
    }

    const coords = delivery?.coords;
    if (!coords) {
      setLiveSurcharge({ amount: 0, reason: '', lines: [] });
      setSceneWeather({ status: null, isNight: false });
      setWeatherReady(true);
      return undefined;
    }
    let cancelled = false;
    setWeatherReady(false);
    fetchRestoWeather(coords.lat, coords.lng).then((weather) => {
      if (cancelled) return;
      setSceneWeather({
        status: weather?.ok ? weather.status : null,
        isNight: Boolean(weather?.isNight),
      });
      setLiveSurcharge(resolveWeatherSurcharge(delivery, weather));
      setWeatherReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [
    delivery,
    delivery?.coords?.lat,
    delivery?.coords?.lng,
    delivery?.weatherFees,
    wxTestActive,
    wxTestStatus,
    wxTestIsNight,
  ]);

  useEffect(() => {
    hasPlayedRef.current = false;
    setRevealedCount(0);
    setRoadProgress(0);
  }, [stepCount]);

  useEffect(() => {
    if (reduced || hasPlayedRef.current || stepCount === 0) return undefined;
    hasPlayedRef.current = true;

    const ac = new AbortController();

    (async () => {
      try {
        setRevealedCount(1);
        await wait(STEP_DURATION_S * 1000, ac.signal);

        for (let i = 1; i < stepCount; i += 1) {
          setRoadProgress(i / segments);
          await wait(ROAD_DURATION_S * 1000, ac.signal);

          setRevealedCount(i + 1);
          await wait(STEP_DURATION_S * 1000, ac.signal);

          if (i < segments) {
            await wait(PAUSE_MS, ac.signal);
          }
        }
      } catch {
        /* unmount / abort */
      }
    })();

    return () => ac.abort();
  }, [reduced, stepCount, segments]);

  if (!delivery || pricingRows.length === 0) {
    return (
      <div className="delivery-charges-page">
        <div className="secondary-appbar">
          <div className="appbar-content">
            <button
              className="back-button"
              type="button"
              onClick={() => navigate(`/more?r=${restaurantId}`)}
            >
              <ChevronLeft size={30} strokeWidth={2} />
            </button>
            <div className="appbar-title">Delivery Charges</div>
          </div>
          <div className="appbar-border"></div>
        </div>
        <div className="delivery-charges-empty">
          Delivery charges are not configured for this restaurant.
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        'delivery-charges-page',
        sceneWeather.isNight ? 'is-night-theme' : 'is-day-theme',
        weatherReady ? 'is-weather-ready' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <WeatherBackground
        status={sceneWeather.status}
        isNight={sceneWeather.isNight}
        ready={weatherReady}
      />

      <div className="secondary-appbar">
        <div className="appbar-content">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={30} strokeWidth={2} />
          </button>
          <div className="appbar-title">Delivery Charges</div>
        </div>
        <div className="appbar-border"></div>
      </div>

      <div className="delivery-charges-container">
        <div className="delivery-lottie-hero" aria-hidden="true">
          <Lottie animationData={orderLottie} loop={!reduced} />
        </div>

        <p className="delivery-charges-intro">
          {mode === 'order'
            ? `Charges by order value × distance from ${restaurantData?.restoDetails?.restoName || 'Restaurant'}`
            : `Charges by distance from the ${restaurantData?.restoDetails?.restoName || 'Restaurant'}`}
          {delivery.minOrder != null
            ? ` · Order more than ₹${delivery.minOrder}`
            : ''}
          {mode === 'order' && delivery.maxKm != null
            ? ` · Up to ${delivery.maxKm} km`
            : ''}
        </p>

        <div className="delivery-road-wrap" ref={wrapRef}>
          {spine.height > 0 && (
            <div
              className="delivery-road-track"
              style={{ top: spine.top, height: spine.height, bottom: 'auto' }}
              aria-hidden="true"
            >
              <motion.div
                className="delivery-road"
                initial={false}
                animate={{ height: `${roadProgress * 100}%` }}
                transition={{ duration: ROAD_DURATION_S, ease: stepEase }}
              />
            </div>
          )}

          <ul className="delivery-road-stops">
            {pricingRows.map((row, index) => {
              const isRevealed = index < revealedCount;
              const isFirst = index === 0;
              const isLast = index === stepCount - 1;

              return (
                <li
                  key={row.key}
                  className="delivery-road-stop"
                  aria-hidden={!isRevealed}
                >
                  <div className="delivery-road-marker">
                    <motion.span
                      ref={
                        isFirst
                          ? firstMarkerRef
                          : isLast
                            ? lastMarkerRef
                            : undefined
                      }
                      className="delivery-road-marker-inner"
                      initial={false}
                      animate={isRevealed ? 'visible' : 'hidden'}
                      variants={stepMotion}
                      transition={{
                        duration: STEP_DURATION_S,
                        ease: stepEase,
                      }}
                    >
                      <img
                        src="assets/images/order.png"
                        alt=""
                        className="delivery-road-marker-img"
                      />
                    </motion.span>
                  </div>
                  <motion.div
                    className="delivery-road-card"
                    initial={false}
                    animate={isRevealed ? 'visible' : 'hidden'}
                    variants={stepMotion}
                    transition={{
                      duration: STEP_DURATION_S,
                      delay: 0.1,
                      ease: stepEase,
                    }}
                  >
                    <div className="delivery-road-card-title">{row.title}</div>
                    <div
                      className={`delivery-road-card-price ${row.isFree ? 'is-free' : ''
                        }`}
                    >
                      {row.price}
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="delivery-surcharge-row">
          <div className="delivery-surcharge-icon">
            <SurchargeWeatherIcon
              status={sceneWeather.status}
              isNight={sceneWeather.isNight}
            />
          </div>
          <div className="delivery-surcharge-text">
            <div className="delivery-surcharge-label">Delivery Surcharge</div>
            <div className="delivery-surcharge-value">
              {!weatherReady
                ? 'Checking weather…'
                : liveSurcharge.amount > 0
                  ? liveSurcharge.reason
                  : `No extra surcharge right now — only ${mode === 'order' ? 'order' : 'distance'} charges apply`}
            </div>
            {weatherReady &&
              liveSurcharge.amount > 0 &&
              sceneWeather.status &&
              !(liveSurcharge.lines || []).some(
                (line) => line.key === sceneWeather.status
              ) && (
                <div className="delivery-surcharge-note">
                  Weather is {formatWeatherStatus(sceneWeather.status, false)} —
                  no weather fee
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCharges;
