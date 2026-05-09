import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X, Minus, Plus } from 'lucide-react';
import { getImageForCategory } from '../utils/menuData';
import '../styles/order.css';
import '../styles/order_items.css';
import '../styles/styles.css';

const SearchItem = React.memo(({ item, orderDetails, updateQuantity, updateNotes, getQuantity, getSizeLabel }) => {
    const itemId = item.name;
    return (
        <div className="order-items-card order-premium-item" style={{ marginBottom: '15px', padding: '10px' }}>
            <div className="order-items-header" style={{ marginBottom: '10px' }}>
                <div className="order-items-name" style={{ flex: 1, padding: '0', fontSize: '16px', fontWeight: '500' }}>{item.name}</div>
                <div className="order-items-indicators" style={{ gap: '0' }}>
                    <div className={`order-items-veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`} style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                </div>
            </div>

            <div className="order-items-price-variants">
                {Object.entries(item.prices).map(([size, price]) => {
                    const qty = getQuantity(itemId, size);
                    return (
                        <div key={size} className={`order-items-variant-container ${qty > 0 ? 'has-quantity' : ''}`}>
                            <div className="order-items-variant-row">
                                <div className="variant-info">
                                    <div className="order-items-variant-size" style={{ fontSize: '14px', fontWeight: '500' }}>{getSizeLabel(size)}</div>
                                    <div className="order-items-variant-price" style={{ fontSize: '14px' }}>₹ {price}</div>
                                </div>

                                <div className="order-items-qty-controls">
                                    <button className="order-items-qty-btn minus" onClick={() => updateQuantity(itemId, size, price, -1)}>
                                        <Minus size={18} strokeWidth={2} />
                                    </button>
                                    <div className="order-items-qty-display">{qty}</div>
                                    <button className="order-items-qty-btn plus" onClick={() => updateQuantity(itemId, size, price, 1)}>
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
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

const Order = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchTerm);
        }, 100);
        return () => clearTimeout(handler);
    }, [searchTerm]);
    if (!restaurantData) return null;
    const { categories } = restaurantData;
    const uniqueCategories = [...new Set((categories || []).map(cat => cat.categoryType))];
    const allItems = useMemo(() => {
        const items = [];
        (categories || []).forEach(cat => {
            if (cat.items) {
                cat.items.forEach(item => {
                    items.push({
                        ...item,
                        categoryType: cat.categoryType
                    });
                });
            }
        });
        return items;
    }, [categories]);
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return allItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
    }, [allItems, searchQuery]);
    const handleToggleMode = (type) => {
        setOrderDetails(prev => ({ ...prev, type }));
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderDetails(prev => ({ ...prev, [name]: value }));
    };
    const handleCategoryClick = (categoryType) => {
        navigate(`/order-items?r=${restaurantId}&category=${encodeURIComponent(categoryType)}`);
    };
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
                    notes: notes
                };
            }
            return { ...prev, items: newItems };
        });
    };
    const getQuantity = (itemId, size) => {
        if (!orderDetails.items[itemId] || !orderDetails.items[itemId][size]) return 0;
        return orderDetails.items[itemId][size].quantity || 0;
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
    const showStatusSnackbar = (message) => {
        const snackbar = document.getElementById("order-validation-snackbar");
        if (!snackbar) return;
        snackbar.innerHTML = message;
        snackbar.className = "show";
        setTimeout(() => {
            snackbar.className = "";
        }, 5000);
    };

    const handleReviewClick = () => {
        if (!orderDetails.customerName || orderDetails.customerName.trim().length === 0) {
            showStatusSnackbar('Please enter your Name');
            return;
        }
        if (orderDetails.type === 'online' && (!orderDetails.customerAddress || orderDetails.customerAddress.trim().length === 0)) {
            showStatusSnackbar('Please enter your Delivery Address');
            return;
        }
        if (orderDetails.type === 'dinein' && (!orderDetails.tableNumber || orderDetails.tableNumber.trim().length === 0)) {
            showStatusSnackbar('Please enter table number');
            return;
        }
        const itemsCount = Object.values(orderDetails.items).reduce((acc, sizes) => {
            return acc + Object.values(sizes).reduce((sAcc, s) => sAcc + s.quantity, 0);
        }, 0);
        if (itemsCount === 0) {
            showStatusSnackbar('Please add items to the order');
            return;
        }
        navigate(`/review?r=${restaurantId}`);
    };
    const totalItems = Object.values(orderDetails.items).reduce((acc, sizes) => {
        return acc + Object.values(sizes).reduce((sAcc, s) => sAcc + s.quantity, 0);
    }, 0);
    const totalAmount = Object.values(orderDetails.items).reduce((acc, sizes) => {
        return acc + Object.values(sizes).reduce((sAcc, s) => sAcc + (s.quantity * s.price), 0);
    }, 0);
    const categoryHasItems = (categoryType) => {
        const categoryData = categories.find(cat => cat.categoryType === categoryType);
        if (!categoryData || !categoryData.items) return false;

        return categoryData.items.some(item => {
            const itemId = item.name;
            return orderDetails.items[itemId] && Object.keys(orderDetails.items[itemId]).length > 0;
        });
    };
    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        if (isSearchActive) {
            setSearchTerm('');
            setSearchQuery('');
        }
    };
    return (
        <div className="order-page">
            <div className={`secondary-appbar ${isSearchActive ? 'search-active' : ''}`}>
                <div className="appbar-content">
                    {!isSearchActive ? (
                        <>
                            <button className="back-button" onClick={() => navigate(-1)}>
                                <ChevronLeft size={30} strokeWidth={2} />
                            </button>
                            <div className="appbar-title">Your Order</div>
                            <div className="appbar-actions">
                                <button className="appbar-icon-button" onClick={toggleSearch}>
                                    <Search size={24} />
                                </button>
                                {/* <div className="toggle-switch">
                                    <button
                                        className={orderDetails.type === 'online' ? 'active' : ''}
                                        onClick={() => handleToggleMode('online')}
                                    >Online</button>
                                    <button
                                        className={orderDetails.type === 'dinein' ? 'active' : ''}
                                        onClick={() => handleToggleMode('dinein')}
                                    >Dine-in</button>
                                </div> */}
                            </div>
                        </>
                    ) : (
                        <div className="search-bar-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search food items..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="search-close-button" onClick={toggleSearch}>
                                <X size={24} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="order-container">
                {isSearchActive && searchTerm.trim().length > 0 ? (
                    <div className="search-results-section" style={{ padding: '0' }}>
                        {filteredItems.length === 0 ? (
                            <div className="order-empty-state">
                                <div className="order-empty-icon">🔍</div>
                                <div className="order-empty-text">No items found for "{searchQuery}"</div>
                            </div>
                        ) : (
                            <div className="search-results-list">
                                {filteredItems.map((item, index) => (
                                    <SearchItem
                                        key={index}
                                        item={item}
                                        orderDetails={orderDetails}
                                        updateQuantity={updateQuantity}
                                        updateNotes={updateNotes}
                                        getQuantity={getQuantity}
                                        getSizeLabel={getSizeLabel}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="order-customer-section">
                            <div className="order-input-group">
                                <label className="order-input-label">Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={orderDetails.customerName}
                                    onChange={handleInputChange}
                                    className="order-input-field"
                                    placeholder="Enter customer name"
                                    autoCapitalize="words"
                                />
                            </div>

                            {orderDetails.type === 'online' ? (
                                <div className="order-input-group">
                                    <label className="order-input-label">Delivery Address</label>
                                    <textarea
                                        name="customerAddress"
                                        value={orderDetails.customerAddress}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                e.target.blur();
                                            }
                                        }}
                                        className="order-input-field order-textarea-field"
                                        placeholder="Enter delivery address"
                                        autoCapitalize="sentences"
                                        enterKeyHint="done"
                                    />
                                </div>
                            ) : (
                                <div className="order-input-group">
                                    <label className="order-input-label">Table Number</label>
                                    <input
                                        type="text"
                                        name="tableNumber"
                                        value={orderDetails.tableNumber}
                                        onChange={(e) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, '');
                                            setOrderDetails(prev => ({ ...prev, tableNumber: digitsOnly }));
                                        }}
                                        className="order-input-field"
                                        placeholder="Enter Table Number written on your QR"
                                        inputMode="numeric"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="order-menu-section">
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'var(--primary-color)',
                                borderBottom: '1px solid #e0e0e0',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Menu</span>
                            </div>

                            <div className="order-categories-grid">
                                {uniqueCategories.length === 0 ? (
                                    <div className="order-empty-state">
                                        <div className="order-empty-icon">🍽️</div>
                                        <div className="order-empty-text">No menu items available</div>
                                    </div>
                                ) : (
                                    uniqueCategories.map((categoryType, index) => {
                                        const image = getImageForCategory(categoryType);
                                        const hasItems = categoryHasItems(categoryType);
                                        return (
                                            <div
                                                key={index}
                                                className="order-category-card"
                                                onClick={() => handleCategoryClick(categoryType)}
                                            >
                                                <div className="order-category-image-container">
                                                    {image ? (
                                                        <img src={image} alt={categoryType} className="order-category-image" />
                                                    ) : (
                                                        <div className="order-category-icon">🍽️</div>
                                                    )}
                                                </div>
                                                <div className="order-category-name">{categoryType}</div>
                                                {hasItems && <div className="order-category-indicator"></div>}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* {!isSearchActive && (
                <button className="search-fab" onClick={toggleSearch}>
                    <Search size={28} />
                </button>
            )} */}

            {totalItems > 0 && (
                <div className="order-page-summary-bar">
                    <div className="order-summary-left">
                        <div className="order-summary-items">{totalItems} Item{totalItems > 1 ? 's' : ''} Added</div>
                        <div className="order-summary-total">₹{totalAmount.toFixed(2)}</div>
                    </div>
                    <button className="order-review-btn" onClick={handleReviewClick}>
                        <span>Review Order</span>
                        <ChevronRight size={16} strokeWidth={2} />
                    </button>
                </div>
            )}

            <div id="order-validation-snackbar"></div>

            <style dangerouslySetInnerHTML={{
                __html: `
        #order-validation-snackbar {
            visibility: hidden;
            min-width: 95%;
            background-color: #FF8800;
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
            font-weight: 500;
        }
        #order-validation-snackbar.show {
            visibility: visible;
            animation: slideDownOrder 0.35s ease-out, fadeOutOrder 0.35s ease-in 4.65s;
        }
        @keyframes slideDownOrder { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes fadeOutOrder { from { opacity: 1; } to { opacity: 0; } }

        .toggle-switch {
          display: flex;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .toggle-switch button {
          background: none;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 18px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-switch button.active {
          background: white;
          color: var(--primary-color);
        }
      `}} />
        </div>
    );
};

export default Order;
