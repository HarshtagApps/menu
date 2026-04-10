import '../styles/styles.css';
import '../styles/food-items.css';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImageForCategory } from '../utils/menuData';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FoodItems = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const categoryType = searchParams.get('category');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [isNonVegEnabled, setIsNonVegEnabled] = useState(false);

    useEffect(() => {
        if (restaurantData && restaurantData.restoDetails) {
            const restoName = (restaurantData.restoDetails.restoName || '').toUpperCase();
            document.getElementById('pageTitle').textContent = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
        }
    }, [restaurantData]);
    if (!restaurantData || !categoryType) return null;
    const categoryItems = category?.items || [];
    const showTypeToggle = hasVegItems && hasNonVegItems;
    const hasVegItems = categoryItems.some(item => item.isVeg);
    const hasNonVegItems = categoryItems.some(item => !item.isVeg);
    const restoName = restaurantData.restoDetails?.restoName?.toUpperCase() || '';
    const category = restaurantData.categories.find(cat => cat.categoryType === categoryType);
    const sortedItems = categoryItems
        .slice()
        .sort((a, b) => {
            if (a.isVeg === b.isVeg) return 0;
            if (isNonVegEnabled) return a.isVeg ? 1 : -1;
            return a.isVeg ? -1 : 1;
        });
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
    const buildPriceTagsHTML = (prices) => {
        return Object.entries(prices).map(([size, price]) => (
            <div key={size} className="price-tag">
                {getShortSize(size)}: ₹{price}
            </div>
        ));
    };

    return (
        <div className="food-items-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">{categoryType}</div>
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

            <div className="food-items-container">
                {!category || !category.items || category.items.length === 0 ? (
                    <div className="food-items-empty-state">
                        <div className="food-items-empty-icon">🍽️</div>
                        <div className="food-items-empty-title">No items in this category</div>
                    </div>
                ) : (
                    sortedItems.map((item, index) => {
                        const categoryImage = getImageForCategory(categoryType);
                        return (
                            <div
                                key={index}
                                className="food-item-card"
                                onClick={item.isSpecial ? () => handleSpecialClick(item.name) : undefined}
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
                                            <div key={size} className="food-item-price-tag">
                                                {getShortSize(size)}: ₹{price}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="food-item-indicators">
                                    {item.isSpecial && <img src="assets/images/special.png" alt="Special" className="food-item-special-badge" />}
                                    <div className={`food-item-veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></div>
                                </div>
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