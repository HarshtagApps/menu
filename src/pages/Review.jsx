import React, { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/order_review.css';
import '../styles/styles.css';
import {
    ChevronLeft,
    User,
    FileText,
    Pencil,
    CheckCircle
} from 'lucide-react';

const Review = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');

    useEffect(() => {
        if (restaurantData && restaurantData.restoDetails) {
            const restoName = (restaurantData.restoDetails.restoName || '').toUpperCase();
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
            }
        }
    }, [restaurantData]);

    if (!restaurantData) return null;

    const { restoDetails } = restaurantData;
    const phoneNumber = restoDetails?.contact || '';

    const flatItems = useMemo(() => {
        const items = [];
        Object.entries(orderDetails.items).forEach(([itemName, sizes]) => {
            Object.entries(sizes).forEach(([size, data]) => {
                items.push({
                    name: itemName,
                    size,
                    quantity: data.quantity,
                    price: data.price,
                    notes: data.notes,
                    total: data.quantity * data.price,
                    isVeg: true
                });
            });
        });
        return items;
    }, [orderDetails.items]);

    const totalAmount = flatItems.reduce((acc, item) => acc + item.total, 0);

    const formatSize = (size) => {
        switch (size.toLowerCase()) {
            case 'small': return 'Small';
            case 'medium': return 'Medium';
            case 'large': return 'Large';
            case 'half': return 'Half';
            case 'full': return 'Full';
            default: return size;
        }
    };

    const generateWhatsAppMessage = () => {
        const restoName = restoDetails?.restoName || 'Restaurant';
        let message = `*🍽️ New Order*\n\n`;
        message += `_Hi ${restoName},_\n`;
        message += `_I would like to place an order:_\n\n`;

        message += `👤*_Customer Details :_*\n`;
        message += `_*Name:* ${orderDetails.customerName.trim()}_\n`;
        if (orderDetails.type === 'dinein') {
            message += `_*Type:* Dine-in_\n`;
            message += `_*Table Number:* ${orderDetails.tableNumber.trim()}_\n\n`;
        } else {
            message += `_*Type:* Online (Takeaway)_\n`;
            message += `_*Address:* ${orderDetails.customerAddress.trim()}_\n\n`;
        }

        message += `🍴*_Ordered Items:_*\n`;
        flatItems.forEach((item, index) => {
            const vegSymbol = item.isVeg ? '🟩' : '🟥';
            const sizeInfo = item.size ? `${formatSize(item.size)} × ${item.quantity}` : `${item.quantity}`;
            message += `_*${index + 1})* ${vegSymbol} ${item.name}_\n`;
            message += `_${sizeInfo} = ₹${item.total}_\n`;
            if (item.notes) {
                message += `_Note: ${item.notes}_\n`;
            }
            message += `\n`;
        });

        message += `💸_*Total Amount:* ₹${totalAmount.toFixed(2)}_\n\n`;
        message += `_Please confirm. Thanks!_\n`;
        message += `_Powered by *HARSHTAG APPS*_`;

        return message;
    };

    const handleSendOrder = () => {
        const message = encodeURIComponent(generateWhatsAppMessage());
        const whatsappURL = `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${message}`;

        // Open WhatsApp
        window.open(whatsappURL, '_blank');

        // Reset Order State
        setOrderDetails({
            customerName: '',
            customerAddress: '',
            tableNumber: '',
            type: 'online',
            items: {}
        });

        // Navigate back to Home/Menu
        setTimeout(() => {
            navigate(`/?r=${restaurantId}`);
        }, 100);
    };

    return (
        <div className="review-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Review Order</div>
                    <button className="review-edit-button" onClick={() => navigate(-1)}>
                        <Pencil size={20} strokeWidth={2} />
                    </button>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="review-page-container">
                <div className="review-customer-card">
                    <div className="review-card-title">
                        <User size={18} strokeWidth={2} />
                        <span>Customer Details</span>
                    </div>
                    <div className="review-detail-row">
                        <span className="review-detail-label">Name</span>
                        <span className="review-detail-value">{orderDetails.customerName || '-'}</span>
                    </div>
                    {orderDetails.type === 'dinein' ? (
                        <div className="review-detail-row">
                            <span className="review-detail-label">Table Number</span>
                            <span className="review-detail-value">{orderDetails.tableNumber || '-'}</span>
                        </div>
                    ) : (
                        <div className="review-detail-row">
                            <span className="review-detail-label">Address</span>
                            <span className="review-detail-value">{orderDetails.customerAddress || '-'}</span>
                        </div>
                    )}
                    <div className="review-detail-row">
                        <span className="review-detail-label">Type</span>
                        <span className="review-detail-value">{orderDetails.type === 'dinein' ? 'Dine-in' : 'Delivery'}</span>
                    </div>
                </div>

                <div className="review-items-section">
                    <div className="review-section-header">
                        <FileText size={20} strokeWidth={2} />
                        <span>Order Items ({flatItems.length})</span>
                    </div>
                    <div className="review-items-list">
                        {flatItems.length === 0 ? (
                            <div className="review-empty-state">
                                <div className="review-empty-icon">🍽️</div>
                                <div className="review-empty-text">No items in order</div>
                            </div>
                        ) : (
                            flatItems.map((item, idx) => {
                                const vegIcon = item.isVeg
                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C851"><rect x="2" y="2" width="20" height="20" rx="2" /></svg>
                                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF4444"><rect x="2" y="2" width="20" height="20" rx="2" /></svg>;

                                return (
                                    <div key={idx} className="review-item-card">
                                        <div className="review-item-header">
                                            <div className="review-item-name-row">
                                                {vegIcon}
                                                <span className="review-item-name">{item.name}</span>
                                            </div>
                                            <span className="review-item-total">₹{item.total.toFixed(0)}</span>
                                        </div>
                                        <div className="review-item-details">
                                            <span className="review-item-size-qty">{formatSize(item.size)} • Qty: {item.quantity}</span>
                                            <span className="review-item-calculation">{item.quantity} × ₹{item.price.toFixed(0)}</span>
                                        </div>
                                        {item.notes && (
                                            <div className="review-item-notes">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <path d="M14 2v6h6"></path>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <line x1="10" y1="9" x2="8" y2="9"></line>
                                                </svg>
                                                <span>{item.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="review-page-summary-bar" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'stretch',
            }}>
                <div className="review-total-section" style={{
                    marginBottom: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    <div className="review-total-label">Total Amount</div>
                    <div className="review-total-amount">₹{totalAmount.toFixed(2)}</div>
                </div>
                <button className="review-send-btn" onClick={handleSendOrder}>
                    <CheckCircle size={20} strokeWidth={2} />
                    <span>Send Confirmation</span>
                </button>
            </div>
        </div>
    );
};

export default Review;
