import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { loadRestaurantData } from './api';
import Splash from './components/Splash';
import Loading from './components/Loading';
import './index.css';

const Categories = React.lazy(() => import('./pages/Categories'));
const FoodItems = React.lazy(() => import('./pages/FoodItems'));
const Order = React.lazy(() => import('./pages/Order'));
const OrderItems = React.lazy(() => import('./pages/OrderItems'));
const Review = React.lazy(() => import('./pages/Review'));
const More = React.lazy(() => import('./pages/More'));

function shouldShowSplashOnLoad() {
  try {
    if (sessionStorage.getItem('menuGhPagesSkipSplash') === '1') {
      sessionStorage.removeItem('menuGhPagesSkipSplash');
      return false;
    }
  } catch {
    /* ignore */
  }
  if (typeof performance === 'undefined') return true;
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return nav?.type !== 'reload';
}

const AppContent = () => {
  const [searchParams] = useSearchParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(() => shouldShowSplashOnLoad());

  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    customerAddress: '',
    tableNumber: '',
    type: 'online',
    items: {}
  });

  const restaurantId = searchParams.get('r');

  useEffect(() => {
    if (!restaurantId) {
      setError('No restaurant specified.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await loadRestaurantData(restaurantId);
        setRestaurantData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    const notFoundMatch = error.match(/The restaurant "(.*?)" was not found\./);

    return (
      <div className="error-state" style={{
        textAlign: 'center',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <img
          src="assets/images/harshtag.png"
          alt="Harshtag Logo"
          style={{ maxWidth: '200px', marginBottom: '20px' }}
        />
        <div className="error-icon" style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
        <div className="error-title" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
          Restaurant Not Found
        </div>
        <div className="error-subtitle" style={{ color: '#666' }}>
          {notFoundMatch ? (
            <>
              The restaurant "<strong>{notFoundMatch[1]}</strong>" was not found.
            </>
          ) : (
            error
          )}
        </div>
        <div style={{ color: '#666', marginTop: '5px' }}>
          Please check the URL and try again.
        </div>
      </div>
    );
  }

  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Categories restaurantData={restaurantData} />} />
        <Route path="/items" element={<FoodItems restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
        <Route path="/order" element={<Order restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
        <Route path="/order-items" element={<OrderItems restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
        <Route path="/review" element={<Review restaurantData={restaurantData} orderDetails={orderDetails} setOrderDetails={setOrderDetails} />} />
        <Route path="/more" element={<More restaurantData={restaurantData} />} />
      </Routes>
    </React.Suspense>
  );
};

const App = () => (
  <Router basename="/menu/">
    <AppContent />
  </Router>
);

export default App;
