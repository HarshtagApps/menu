import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, X, Check } from 'lucide-react';
import Lottie from 'lottie-react';
import { getImageForCategory, getCategoryDisplayName, getEffectivePrice, PriceTags } from '../utils/menuData';
import Ads from '../components/Ads';
import orderLottie from '../assets/orderLottie.json';
import '../styles/food-items.css';
import '../styles/styles.css';

const DOUBLE_TAP_MS = 400;

const FoodItems = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isNonVegEnabled, setIsNonVegEnabled] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const [orderPromptItem, setOrderPromptItem] = useState(null);
    const lastTapRef = useRef({ id: null, time: 0 });
    const restaurantId = searchParams.get('r');
    const categoryType = searchParams.get('category');

    useEffect(() => {
        if (restaurantData && restaurantData.restoDetails) {
            const restoName = (restaurantData.restoDetails.restoName || '').toUpperCase();
            document.getElementById('pageTitle').textContent = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
        }
    }, [restaurantData]);

    if (!restaurantData || !categoryType) return null;

    const category = restaurantData.categories.find(cat => cat.categoryType === categoryType);
    const categoryDisplayName = getCategoryDisplayName(categoryType);
    const restoName = restaurantData.restoDetails?.restoName?.toUpperCase() || '';
    const categoryItems = category?.items || [];
    const hasVegItems = categoryItems.some(item => item.isVeg);
    const hasNonVegItems = categoryItems.some(item => !item.isVeg);
    const showTypeToggle = hasVegItems && hasNonVegItems;

    const filteredItems = showTypeToggle
        ? categoryItems.filter(item => isNonVegEnabled ? !item.isVeg : item.isVeg)
        : categoryItems;

    const handleSpecialClick = () => {
        const snackbar = document.getElementById("food-items-snackbar");
        if (!snackbar) return;
        snackbar.innerHTML = `<strong>${restoName} Special 👑</strong><br>This is one of the special items of our restaurant.`;
        snackbar.className = "show";
        setTimeout(() => {
            snackbar.className = "";
        }, 5000);
    };

    const getShortSize = (size) => {
        const mapping = {
            'full': 'F',
            'half': 'H',
            'small': 'S',
            'medium': 'M',
            'large': 'L'
        };
        return mapping[size.toLowerCase()] || size;
    };

    const getItemId = (item) => item.id || item.name;

    const toggleDescription = (itemId) => {
        const newExpanded = new Set(expandedDescriptions);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedDescriptions(newExpanded);
    };

    const handleItemCardClick = (item) => {
        const itemId = getItemId(item);
        const now = Date.now();
        const last = lastTapRef.current;
        if (last.id === itemId && now - last.time <= DOUBLE_TAP_MS) {
            lastTapRef.current = { id: null, time: 0 };
            setOrderPromptItem(item);
            return;
        }
        lastTapRef.current = { id: itemId, time: now };

        if (item.isSpecial) {
            handleSpecialClick();
        } else if (item.description) {
            toggleDescription(itemId);
        }
    };

    return (
        <div className="food-items-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">{categoryDisplayName}</div>
                    {showTypeToggle && (
                        <div className="food-type-toggle">
                            <button
                                className={!isNonVegEnabled ? 'active' : ''}
                                onClick={() => setIsNonVegEnabled(false)}
                            >
                                Veg
                            </button>
                            <button
                                className={isNonVegEnabled ? 'active' : ''}
                                onClick={() => setIsNonVegEnabled(true)}
                            >
                                Nonveg
                            </button>
                        </div>
                    )}
                </div>
                <div className="appbar-border"></div>
            </div>

            <Ads
                bannerAdsUrls={restaurantData?.restoDetails?.bannerAdsUrls}
                showBannerAds={restaurantData?.restoDetails?.showBannerAds}
                bannerAdsMap={restaurantData?.restoDetails?.bannerAdsMap}
                screenKey="FoodItemsAds"
            />

            <div className="food-items-container">
                {!category || !category.items || category.items.length === 0 ? (
                    <div className="food-items-empty-state">
                        <div className="food-items-empty-icon">🍽️</div>
                        <div className="food-items-empty-title">No items in this category</div>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const itemId = getItemId(item);
                        const categoryImage = getImageForCategory(categoryType);
                        const isExpanded = expandedDescriptions.has(itemId);
                        const hasDescription = !!item.description;

                        return (
                            <div key={itemId} className="food-item-wrapper">
                                <div
                                    className={`food-item-card ${hasDescription && isExpanded ? 'description-open' : ''}`}
                                    onClick={() => handleItemCardClick(item)}
                                >
                                    <div className="food-item-image-box">
                                        {categoryImage ? (
                                            <img src={categoryImage} alt={item.name} className="food-item-image" />
                                        ) : (
                                            <div className="food-item-icon">🍽️</div>
                                        )}
                                    </div>

                                    <div className="food-item-details">
                                        <div className="food-item-name">{item.name}</div>
                                        <div className="food-item-price-tags">
                                            {Object.entries(item.prices).map(([size, price]) => (
                                                <PriceTags
                                                    key={size}
                                                    sizeLabel={getShortSize(size)}
                                                    originalPrice={price}
                                                    item={item}
                                                    size={size}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        className={`food-item-indicators${hasDescription ? ' food-item-indicators--with-chevron' : ''}`}
                                    >
                                        {item.isSpecial && (
                                            <img
                                                src="assets/images/special.png"
                                                alt="Special"
                                                className="food-item-special-badge"
                                            />
                                        )}
                                        <div className={`food-item-veg-dot ${item.foodType === 'egg' ? 'egg' : item.isVeg ? 'veg' : 'non-veg'}`} />
                                        {hasDescription && (
                                            <ChevronDown
                                                size={20}
                                                strokeWidth={2}
                                                className={`food-item-description-arrow ${isExpanded ? 'expanded' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDescription(itemId);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {hasDescription && (
                                    <div className={`food-item-description-container ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="food-item-description-text">
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <div id="food-items-snackbar"></div>

            {orderPromptItem && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                    onClick={() => setOrderPromptItem(null)}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '16px',
                            borderRadius: '25px',
                            width: '95%',
                            maxWidth: '340px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontFamily: 'Afacad, sans-serif',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                            textAlign: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                width: 250,
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <Lottie animationData={orderLottie} loop />
                        </div>
                        <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#3d2c29',
                            lineHeight: 1.25,
                        }}>
                            Order {orderPromptItem.name}?
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#6b6b6b',
                            lineHeight: 1.45,
                        }}>
                            Do you want to order this item? You can pick sizes and quantity on the next screen.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                width: '100%',
                                marginTop: '25px',
                                height: '40px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setOrderPromptItem(null)}
                                style={{
                                    flex: 1,
                                    height: '35px',
                                    minHeight: '35px',
                                    maxHeight: '35px',
                                    padding: '0 12px',
                                    margin: 0,
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#ececec',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxSizing: 'border-box',
                                }}
                            >
                                Cancel
                                <X size={16} strokeWidth={2.5} />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setOrderPromptItem(null);
                                    navigate(`/order?r=${restaurantId}`);
                                }}
                                style={{
                                    flex: 1,
                                    height: '35px',
                                    minHeight: '35px',
                                    maxHeight: '35px',
                                    padding: '0 12px',
                                    margin: 0,
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--primary-color)',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxSizing: 'border-box',
                                }}
                            >
                                Order Now
                                <Check size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        #food-items-snackbar {
            visibility: hidden;
            min-width: 95%;
            background-color: #00A9FE;
            color: #FFFFFF;
            text-align: left;
            border-radius: 12px;
            padding: 14px 18px;
            position: fixed;
            z-index: 9999;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Afacad', sans-serif;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        #food-items-snackbar.show {
            visibility: visible;
            animation: slideDown 0.35s ease-out, fadeOut 0.35s ease-in 4.65s;
        }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}} />
        </div>
    );
};

export default FoodItems;
