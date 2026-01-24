import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageForCategory } from '../utils/menuData';
import '../styles/order.css';
import '../styles/styles.css';

const Order = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');

    if (!restaurantData) return null;

    const { categories } = restaurantData;
    const uniqueCategories = [...new Set((categories || []).map(cat => cat.categoryType))];

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

    const handleReviewClick = () => {
        if (!orderDetails.customerName || orderDetails.customerName.trim().length === 0) {
            alert('Please enter customer name');
            return;
        }
        if (orderDetails.type === 'online' && (!orderDetails.customerAddress || orderDetails.customerAddress.trim().length === 0)) {
            alert('Please enter delivery address');
            return;
        }
        if (orderDetails.type === 'dinein' && (!orderDetails.tableNumber || orderDetails.tableNumber.trim().length === 0)) {
            alert('Please enter table number');
            return;
        }

        // Check if items added
        const totalItems = Object.values(orderDetails.items).reduce((acc, sizes) => {
            return acc + Object.values(sizes).reduce((sAcc, s) => sAcc + s.quantity, 0);
        }, 0);

        if (totalItems === 0) {
            alert('Please add items to the order');
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

    return (
        <div className="order-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Your Order</div>
                    <div className="toggle-switch">
                        <button
                            className={orderDetails.type === 'online' ? 'active' : ''}
                            onClick={() => handleToggleMode('online')}
                        >Online</button>
                        <button
                            className={orderDetails.type === 'dinein' ? 'active' : ''}
                            onClick={() => handleToggleMode('dinein')}
                        >Dine-in</button>
                    </div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="order-container">
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
                                className="order-input-field order-textarea-field"
                                placeholder="Enter delivery address"
                                rows="3"
                                autoCapitalize="sentences"
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
                    }}>
                        Menu
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
            </div>

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

            <style dangerouslySetInnerHTML={{
                __html: `
        .toggle-switch {
          position: absolute;
          right: 5px;
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
