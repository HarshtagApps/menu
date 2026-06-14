import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlignJustify } from 'lucide-react';
import { getImageForCategory, getCategoryDisplayName } from '../utils/menuData';
import { parseRestaurantName, getRestaurantNameClass } from '../utils/restaurantNameParser';
import Ads from '../components/Ads';
import Coachmark from '../components/Coachmark';
import '../styles/menu.css';
import '../styles/styles.css';

const ORDER_COACHMARK_KEY = 'menuOrderButtonCoachmarkSeen';

const Categories = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const orderButtonRef = useRef(null);
    const headerRef = useRef(null);
    const [showOrderCoachmark, setShowOrderCoachmark] = useState(false);
    const showOrderCoachmarkRef = useRef(false);
    const isPremiumPlan = restaurantData?.restoDetails?.plan === 'premium';

    const markCoachmarkSeen = () => {
        try {
            sessionStorage.setItem(ORDER_COACHMARK_KEY, '1');
        } catch {
        }
    };

    const dismissOrderCoachmark = () => {
        markCoachmarkSeen();
        setShowOrderCoachmark(false);
    };

    useEffect(() => {
        showOrderCoachmarkRef.current = showOrderCoachmark;
    }, [showOrderCoachmark]);

    useEffect(() => {
        return () => {
            if (showOrderCoachmarkRef.current) {
                markCoachmarkSeen();
            }
        };
    }, []);

    useEffect(() => {
        if (!isPremiumPlan) return;

        try {
            if (sessionStorage.getItem(ORDER_COACHMARK_KEY) !== '1') {
                setShowOrderCoachmark(true);
            }
        } catch {
            setShowOrderCoachmark(true);
        }
    }, [isPremiumPlan]);

    if (!restaurantData) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
                    There is some issue in your Internet Connection
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#FA057B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }
    const { restoDetails, categories } = restaurantData;
    const restoName = (restoDetails?.restoName || '').toUpperCase();
    const restoAddress = restoDetails?.address || '';
    const restoContact = restoDetails?.contact || '';
    const uniqueCategories = [...new Set((categories || []).map(cat => cat.categoryType))];

    const handleCategoryClick = (categoryType) => {
        navigate(`/items?r=${restaurantId}&category=${encodeURIComponent(categoryType)}`);
    };
    const handleOrderClick = () => {
        dismissOrderCoachmark();
        navigate(`/order?r=${restaurantId}`);
    };


    return (
        <div id="mainContent">
            <div className="restaurant-header" ref={headerRef}>
                <div className="restaurant-header-content">
                    <div className="restaurant-name">
                        {parseRestaurantName(restoName).map((segment, index) => (
                            <span key={index} className={getRestaurantNameClass(segment.type)}>
                                {segment.text}
                            </span>
                        ))}
                    </div>
                    <div className="restaurant-info-row">
                        <button
                            className="menu-button"
                            onClick={() => navigate(`/more?r=${restaurantId}`)}
                            style={{
                                position: 'absolute',
                                left: '0',
                                background: 'none',
                                border: 'none',
                                color: '#333333',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                        >
                            <AlignJustify size={30} strokeWidth={1.25} />
                        </button>
                        <div className="restaurant-info-column">
                            <div className="restaurant-address">{restoAddress}</div>
                            <div className="restaurant-contact">
                                {restoContact ? `Ph: +91 ${restoContact}` : ''}
                            </div>
                        </div>
                        {isPremiumPlan && (
                            <div
                                ref={orderButtonRef}
                                className={`order-button-wrapper${showOrderCoachmark ? ' order-button-wrapper--coachmark' : ''}`}
                            >
                                <button className="order-button" onClick={handleOrderClick}>
                                    <img src="assets/images/order.png" alt="Order" />
                                </button>
                                <div className="order-button-text">
                                    Home Delivery
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="restaurant-divider"></div>
            </div>

            <Ads
                bannerAdsUrls={restoDetails?.bannerAdsUrls}
                showBannerAds={restoDetails?.showBannerAds}
                bannerAdsMap={restoDetails?.bannerAdsMap}
                screenKey="HomeAds"
            />

            <div className="menu-container">
                {uniqueCategories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <div className="empty-title">No menu items yet</div>
                        <div className="empty-subtitle">Tap the edit icon to add items</div>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {uniqueCategories.map((categoryType, index) => {
                            const image = getImageForCategory(categoryType);
                            const displayName = getCategoryDisplayName(categoryType);
                            return (
                                <div
                                    key={index}
                                    className="category-card"
                                    onClick={() => handleCategoryClick(categoryType)}
                                >
                                    <div className="category-image-container">
                                        {image ? (
                                            <img src={image} alt={displayName} className="category-image" />
                                        ) : (
                                            <div className="category-icon">🍽️</div>
                                        )}
                                    </div>
                                    <div className="category-name">{displayName}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isPremiumPlan && (
                <Coachmark
                    targetRef={orderButtonRef}
                    headerRef={headerRef}
                    visible={showOrderCoachmark}
                    onDismiss={dismissOrderCoachmark}
                    message="Tap here for Home Delivery"
                />
            )}
        </div>
    );
};

export default Categories;
