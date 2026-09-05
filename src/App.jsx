import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { loadRestaurantData, trackMenuView } from './api';
import Splash from './components/Splash';
import Loading from './components/Loading';
import './index.css';
import './styles/splash.css';
import { hexToCssFilter } from './utils/menuData';
import { applyThemeColor } from './utils/theme';
import {
  ERROR_CODES,
  createMenuError,
  getErrorCopy,
  ACCESS_STATUS_CODES,
} from './utils/errorCodes';
import AccessStatusScreen from './pages/AccessStatusScreen';

const Categories = React.lazy(() => import('./pages/Categories'));
const FoodItems = React.lazy(() => import('./pages/FoodItems'));
const Order = React.lazy(() => import('./pages/Order'));
const OrderItems = React.lazy(() => import('./pages/OrderItems'));
const Review = React.lazy(() => import('./pages/Review'));
const More = React.lazy(() => import('./pages/More'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Terms = React.lazy(() => import('./pages/Terms'));
const DeliveryCharges = React.lazy(() => import('./pages/DeliveryCharges'));
const Reserve = React.lazy(() => import('./pages/Reserve'));
const TableSlots = React.lazy(() => import('./pages/TableSlots'));
const ReserveReview = React.lazy(() => import('./pages/ReserveReview'));
const FloorPlan = React.lazy(() => import('./pages/FloorPlan'));
const BackgroundMusic = React.lazy(() => import('./components/BackgroundMusic'));

function shouldShowSplashOnLoad() {
  try {
    if (sessionStorage.getItem('menuGhPagesSkipSplash') === '1') {
      sessionStorage.removeItem('menuGhPagesSkipSplash');
      return false;
    }
  } catch {
  }
  if (typeof performance === 'undefined') return true;
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return nav?.type !== 'reload';
}

const AppContent = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const hideMusicBar = location.pathname === '/review';
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(() => shouldShowSplashOnLoad());

  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    tableNumber: '',
    type: 'online',
    items: {},
    delivery: {
      status: 'idle',
      distanceKm: null,
      baseCharge: null,
      surcharge: 0,
      surchargeReason: '',
      outOfRange: false,
      coords: null,
      accuracy: null,
    },
  });

  const restaurantId = searchParams.get('r');

  useEffect(() => {
    if (showSplash && restaurantId) {
      trackMenuView(restaurantId);
    }
  }, [showSplash, restaurantId]);

  useEffect(() => {
    if (!restaurantId) {
      // N82503R — no ?r= restaurant id in URL
      const err = createMenuError(ERROR_CODES.NO_RESTAURANT);
      setError({
        title: err.title,
        message: err.message,
        hint: err.hint,
        code: err.code,
      });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadRestaurantData(restaurantId);
        applyThemeColor(data?.restoDetails?.theme);
        setRestaurantData(data);
      } catch (err) {
        const code = err.code || ERROR_CODES.UNKNOWN;
        const copy = getErrorCopy(code);
        setError({
          title: err.title || copy.title,
          message: err.message || copy.message,
          hint: err.hint ?? copy.hint,
          code,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const backgroundMusicUrls = restaurantData?.restoDetails?.backgroundMusicUrls || [];

  let content;
  if (showSplash) {
    content = <Splash onFinish={() => setShowSplash(false)} />;
  } else if (loading) {
    content = <Loading />;
  } else if (error) {
    content = ACCESS_STATUS_CODES.has(error.code) ? (
      <AccessStatusScreen code={error.code} />
    ) : (
      <div className="error-state" style={{
        textAlign: 'center',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div className="error-title" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
          {error.title}
        </div>
        <div className="error-subtitle" style={{ color: '#666' }}>
          {error.message}
        </div>
        {error.hint ? (
          <div style={{ color: '#666', marginTop: '5px' }}>
            {error.hint}
          </div>
        ) : null}
        {error.code && (
          <div style={{ color: '#999', marginTop: '5px', fontSize: '0.85rem', letterSpacing: '0.04em' }}>
            Code: {error.code}
          </div>
        )}
        <div className="splash-footer">
          <div className="splash-developed">Powered by</div>
          <img
            src="assets/images/harshtag.png"
            alt="Harshtag"
            className="error-powered-logo"
            style={{ filter: hexToCssFilter('#00A9FE') }}
          />
        </div>
      </div>
    );
  } else {
    content = (
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Categories restaurantData={restaurantData} />} />
          <Route path="/items" element={<FoodItems restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
          <Route path="/order" element={<Order restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
          <Route path="/order-items" element={<OrderItems restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
          <Route path="/review" element={<Review restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
          <Route path="/more" element={<More restaurantData={restaurantData} />} />
          <Route path="/gallery" element={<Gallery restaurantData={restaurantData} />} />
          <Route path="/terms" element={<Terms restaurantData={restaurantData} />} />
          <Route path="/delivery-charges" element={<DeliveryCharges restaurantData={restaurantData} />} />
          <Route path="/reserve" element={<Reserve restaurantData={restaurantData} />} />
          <Route path="/reserve/table" element={<TableSlots restaurantData={restaurantData} />} />
          <Route path="/reserve/review" element={<ReserveReview restaurantData={restaurantData} />} />
          <Route path="/floor-plan" element={<FloorPlan restaurantData={restaurantData} />} />
        </Routes>
      </React.Suspense>
    );
  }

  return (
    <>
      {backgroundMusicUrls.length > 0 && (
        <React.Suspense fallback={null}>
          <BackgroundMusic
            urls={backgroundMusicUrls}
            visible={!showSplash && !loading && !error && !hideMusicBar}
            restoName={restaurantData?.restoDetails?.restoName || ""}
          />
        </React.Suspense>
      )}
      {content}
    </>
  );
};

const App = () => (
  <Router basename="/menu/">
    <AppContent />
  </Router>
);

export default App;
