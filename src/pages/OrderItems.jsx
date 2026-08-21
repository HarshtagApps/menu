import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { getImageForCategory, getCategoryDisplayName, getEffectivePrice, PriceTags } from '../utils/menuData';
import AuroraBorder from '../components/AuroraBorder';
import { FOCUS_DIM_FILL, FOCUS_DIM_MS, FOCUS_DIM_SPEED } from '../utils/focusDim';
import '../styles/order_items.css';
import '../styles/focus-dim.css';
import '../styles/styles.css';

const OrderItems = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const categoryType = searchParams.get('category');
    const focusItem = searchParams.get('focus');
    const dietParam = searchParams.get('diet');
    const [isNonVegEnabled, setIsNonVegEnabled] = useState(() => dietParam === 'nonveg');
    const [showFocusHint, setShowFocusHint] = useState(() => !!focusItem);

    useEffect(() => {
        if (restaurantData && restaurantData.restoDetails) {
            const restoName = (restaurantData.restoDetails.restoName || '').toUpperCase();
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
            }
        }
    }, [restaurantData]);

    useEffect(() => {
        if (dietParam === 'nonveg') setIsNonVegEnabled(true);
        else if (dietParam === 'veg') setIsNonVegEnabled(false);
    }, [dietParam]);

    useEffect(() => {
        if (!focusItem) {
            setShowFocusHint(false);
            return;
        }
        setShowFocusHint(true);
        const timer = window.setTimeout(() => setShowFocusHint(false), FOCUS_DIM_MS);
        return () => window.clearTimeout(timer);
    }, [focusItem, categoryType]);

    useEffect(() => {
        if (!focusItem) return;
        const timer = window.setTimeout(() => {
            const el = document.getElementById('order-item-focus');
            const scroller = el?.closest('.order-items-container');
            if (!el || !(scroller instanceof HTMLElement)) return;
            const elRect = el.getBoundingClientRect();
            const scrollerRect = scroller.getBoundingClientRect();
            const top =
                scroller.scrollTop +
                (elRect.top - scrollerRect.top) -
                scroller.clientHeight / 2 +
                elRect.height / 2;
            scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            window.scrollTo(0, 0);
        }, 80);
        return () => window.clearTimeout(timer);
    }, [focusItem, isNonVegEnabled, categoryType]);

    if (!restaurantData || !categoryType) return null;

    const category = restaurantData.categories.find(cat => cat.categoryType === categoryType);
    const categoryDisplayName = getCategoryDisplayName(categoryType);
    const categoryItems = category?.items || [];
    const hasVegItems = categoryItems.some(item => item.isVeg);
    const hasNonVegItems = categoryItems.some(item => !item.isVeg);
    const showTypeToggle = hasVegItems && hasNonVegItems;

    const filteredItems = showTypeToggle
        ? categoryItems.filter(item => isNonVegEnabled ? !item.isVeg : item.isVeg)
        : categoryItems;


    const updateQuantity = (itemId, size, price, change) => {
        setOrderDetails(prev => {
            const newItems = { ...prev.items };

            if (newItems[itemId]) {
                newItems[itemId] = { ...newItems[itemId] };
            } else {
                newItems[itemId] = {};
            }
            if (newItems[itemId][size]) {
                newItems[itemId][size] = { ...newItems[itemId][size] };
            } else {
                newItems[itemId][size] = { quantity: 0, price: price, notes: '' };
            }
            const newQty = newItems[itemId][size].quantity + change;
            if (newQty <= 0) {
                delete newItems[itemId][size];
                if (Object.keys(newItems[itemId]).length === 0) {
                    delete newItems[itemId];
                }
            } else {
                newItems[itemId][size].quantity = newQty;
                newItems[itemId][size].price = price;
            }
            return { ...prev, items: newItems };
        });
    };

    const updateNotes = (itemId, size, notes) => {
        setOrderDetails(prev => {
            const newItems = { ...prev.items };
            if (newItems[itemId] && newItems[itemId][size]) {
                newItems[itemId] = { ...newItems[itemId] };
                newItems[itemId][size] = {
                    ...newItems[itemId][size],
                    notes: notes.trim()
                };
            }
            return { ...prev, items: newItems };
        });
    };

    const getQuantity = (itemId, size) => {
        if (!orderDetails.items[itemId] || !orderDetails.items[itemId][size]) return 0;
        return orderDetails.items[itemId][size].quantity || 0;
    };

    const getItemId = (item) => item.id || item.name;

    const calculateCategorySubtotal = () => {
        let subtotal = 0;
        categoryItems.forEach(item => {
            const itemId = getItemId(item);
            if (orderDetails.items[itemId]) {
                Object.values(orderDetails.items[itemId]).forEach(sizeData => {
                    subtotal += (sizeData.quantity || 0) * (sizeData.price || 0);
                });
            }
        });
        return subtotal;
    };

    const getCategoryItemCount = () => {
        let count = 0;
        categoryItems.forEach(item => {
            const itemId = getItemId(item);
            if (orderDetails.items[itemId]) {
                Object.values(orderDetails.items[itemId]).forEach(sizeData => {
                    count += sizeData.quantity || 0;
                });
            }
        });
        return count;
    };

    const getSizeLabel = (size) => {
        const labels = {
            'full': 'Full',
            'half': 'Half',
            'quarter': 'Quarter',
            'small': 'Small',
            'medium': 'Medium',
            'large': 'Large'
        };
        return labels[size.toLowerCase()] || size;
    };

    const handleSpecialClick = () => {
        const restoName = restaurantData?.restoDetails?.restoName || 'Our Restaurant';
        const snackbar = document.getElementById("order-items-snackbar");
        if (!snackbar) return;
        snackbar.innerHTML = `<strong>${restoName} Special 👑</strong><br>This is one of the special items of our restaurant.`;
        snackbar.className = "show";
        setTimeout(() => {
            snackbar.className = "";
        }, 5000);
    };

    const categoryItemCount = getCategoryItemCount();
    const categorySubtotal = calculateCategorySubtotal();
    const categoryImage = getImageForCategory(categoryType);

    return (
        <div className={`order-items-page${showFocusHint ? ' focus-dim' : ''}`}>
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

            <div className="order-items-container">
                {categoryItems.length === 0 ? (
                    <div className="order-items-empty-state">
                        <div className="order-items-empty-icon">🍽️</div>
                        <div className="order-items-empty-text">No items in this category</div>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const itemId = getItemId(item);
                        const isFocused = focusItem === item.name;
                        const card = (
                            <div
                                className="order-items-card order-premium-item"
                                onClick={item.isSpecial ? handleSpecialClick : undefined}
                            >
                                <div className="order-items-header">
                                    <div className="order-items-image-box">
                                        {categoryImage ? (
                                            <img src={categoryImage} alt={item.name} className="order-items-image" />
                                        ) : (
                                            <div className="order-items-icon">🍽️</div>
                                        )}
                                    </div>
                                    <div className="order-items-name">{item.name}</div>
                                    <div className="order-items-indicators">
                                        {item.isSpecial && <img src="assets/images/special.png" alt="Special" className="order-items-special-badge" />}
                                        <div className={`order-items-veg-dot ${item.foodType === 'egg' ? 'egg' : item.isVeg ? 'veg' : 'non-veg'}`}></div>
                                    </div>
                                </div>

                                <div className="order-items-price-variants">
                                    {Object.entries(item.prices).map(([size, price]) => {
                                        const qty = getQuantity(itemId, size);
                                        const effectivePrice = getEffectivePrice(item, size);
                                        return (
                                            <div key={size} className={`order-items-variant-container ${qty > 0 ? 'has-quantity' : ''}`}>
                                                <div className="order-items-variant-row">
                                                    <div className="variant-info">
                                                        <div className="order-items-variant-size">{getSizeLabel(size)}</div>
                                                        <div className="order-items-variant-price">
                                                            <PriceTags
                                                                originalPrice={price}
                                                                item={item}
                                                                size={size}
                                                                prefix="₹ "
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="order-items-qty-controls">
                                                        <button className="order-items-qty-btn minus" onClick={(e) => { e.stopPropagation(); updateQuantity(itemId, size, effectivePrice, -1); }}>
                                                            <Minus size={18} strokeWidth={2} />
                                                        </button>
                                                        <div className="order-items-qty-display">{qty}</div>
                                                        <button className="order-items-qty-btn plus" onClick={(e) => { e.stopPropagation(); updateQuantity(itemId, size, effectivePrice, 1); }}>
                                                            <Plus size={18} strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {qty > 0 && (
                                                    <div className="order-items-notes-container">
                                                        <input
                                                            type="text"
                                                            className="order-items-notes-input"
                                                            placeholder="Add notes (extra spicy, no onions...)"
                                                            value={orderDetails.items[itemId]?.[size]?.notes || ''}
                                                            onChange={(e) => updateNotes(itemId, size, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                        return (
                            <AuroraBorder
                                key={itemId}
                                id={isFocused ? 'order-item-focus' : undefined}
                                active={isFocused}
                                radius={8}
                                fill={showFocusHint ? FOCUS_DIM_FILL : '#ffffff'}
                                borderWidth={1.25}
                                speed={FOCUS_DIM_SPEED}
                                loop={false}
                                className={`order-items-aurora${
                                    isFocused && showFocusHint ? ' focus-dim-target' : ''
                                }`}
                            >
                                {card}
                            </AuroraBorder>
                        );
                    })
                )}
            </div>

            <div id="order-items-snackbar"></div>

            <div className="category-summary-bar">
                {categoryItemCount > 0 && (
                    <div className="order-items-summary-info">
                        <span>{categoryItemCount} Item{categoryItemCount > 1 ? 's' : ''} from {categoryDisplayName}</span>
                        <span>₹{categorySubtotal.toFixed(2)}</span>
                    </div>
                )}
                <button className="order-items-done-btn" onClick={() => navigate(-1)}>
                    <span>Done</span>
                    {categoryItemCount > 0 && <span className="order-items-badge">{categoryItemCount}</span>}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        #order-items-snackbar {
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
        #order-items-snackbar.show {
            visibility: visible;
            animation: slideDown 0.35s ease-out, fadeOut 0.35s ease-in 4.65s;
        }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}} />
        </div>
    );
};

export default OrderItems;
