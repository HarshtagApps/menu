import React, { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/order_review.css';
import '../styles/styles.css';
import {
    ChevronLeft,
    User,
    FileText,
    Pencil,
    CheckCircle,
    CreditCard,
    X,
    Truck
} from 'lucide-react';

const Review = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
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
    const upiId = restoDetails?.upiId;
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
        window.open(whatsappURL, '_blank');
        setOrderDetails({
            customerName: '',
            customerAddress: '',
            tableNumber: '',
            type: 'online',
            items: {}
        });
        setTimeout(() => {
            navigate(`/?r=${restaurantId}`);
        }, 100);
    };
    const handlePayNow = () => {
        if (!upiId) return;
        const payeeName = restoDetails.restoName || 'Merchant';
        const note = `Order for ${orderDetails.customerName}`;
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
        window.location.href = upiUrl;
        setShowPaymentModal(false);
    };
    const handleSendOrderClick = () => {
        if (upiId) {
            setShowPaymentModal(true);
        } else {
            handleSendOrder();
        }
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
                gap: '12px',
                alignItems: 'stretch',
                paddingTop: '16px'
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

                <button
                    className="review-send-btn"
                    onClick={handleSendOrderClick}
                >
                    <CheckCircle size={20} strokeWidth={2} />
                    <span>Send Order</span>
                </button>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Choose Payment Mode</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#666" />
                            </button>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#333333',
                            backgroundColor: '#FFFAEB',
                            border: '1px solid #E0E0E0',
                            padding: '10px',
                            borderRadius: '8px',
                            lineHeight: '1.4'
                        }}>
                            If you choose <strong>Pay Now</strong>, please take a screenshot of the payment and attach it after sending the order.
                        </p>


                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handlePayNow}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    backgroundColor: '#FA057B',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                <CreditCard size={18} />
                                Pay Now
                            </button>

                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    handleSendOrder();
                                }}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    backgroundColor: '#00A9FE',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                <Truck
                                    size={18} />
                                Pay on Delivery
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowPaymentModal(false);
                                handleSendOrder();
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '13px',
                                color: '#FA057B',
                                cursor: 'pointer',
                                alignSelf: 'center'
                            }}
                        >
                            Already paid?
                        </button>

                    </div>
                </div>
            )}
            {/* End Payment Modal */}
            <style>
                {`
@keyframes popupBounce {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    60% {
        transform: scale(1.1);
        opacity: 1;
    }
    100% {
        transform: scale(1);
    }
}

.modal-content {
    animation: popupBounce 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, opacity;
}
`}
            </style>

        </div>
    );
};

export default Review;
