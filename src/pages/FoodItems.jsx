import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { getImageForCategory, getCategoryDisplayName, getEffectivePrice, PriceTags } from '../utils/menuData';
import Ads from '../components/Ads';
import '../styles/food-items.css';
import '../styles/styles.css';

const FoodItems = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [isNonVegEnabled, setIsNonVegEnabled] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

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

    const handleSpecialClick = (name) => {
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
                                type="button"
                            >
                                Veg
                            </button>
                            <button
                                className={isNonVegEnabled ? 'active' : ''}
                                onClick={() => setIsNonVegEnabled(true)}
                                type="button"
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
                                    onClick={() => {
                                        if (item.isSpecial) {
                                            handleSpecialClick(item.name);
                                        } else if (hasDescription) {
                                            toggleDescription(itemId);
                                        }
                                    }}
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
                                        <div className={`food-item-veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`} />
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

            <style dangerouslySetInnerHTML={{
                __html: `
        #food-items-snackbar {
            visibility: hidden;
            min-width: 90%;
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