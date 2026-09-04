import React, { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/order_review.css';
import '../styles/styles.css';
import {
    ChevronLeft,
    UserRound,
    FileText,
    Pencil,
    CheckCircle,
    CreditCard,
    X,
    Truck
} from 'lucide-react';
import { FEATURE_FLAGS } from '../utils/featureFlags';
import { emptyDeliveryState } from '../utils/delivery';
import { formatSurchargeLabel } from '../utils/weather';

function countOrderItems(items) {
    return Object.values(items || {}).reduce((acc, sizes) => {
        return (
            acc +
            Object.values(sizes || {}).reduce(
                (sum, entry) => sum + (Number(entry?.quantity) || 0),
                0
            )
        );
    }, 0);
}

const Review = ({ restaurantData, orderDetails, setOrderDetails }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const restaurantId = searchParams.get('r');
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    useEffect(() => {
        if (restaurantData && restaurantData.restoDetails) {
            const restoName = (restaurantData.restoDetails.restoName || '').toUpperCase();
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
            }
        }
        const savedOrder = sessionStorage.getItem('pendingOrder');
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                sessionStorage.removeItem('pendingOrder');
                setOrderDetails(parsedOrder);
                return;
            } catch (error) {
                console.error('Error restoring order:', error);
                sessionStorage.removeItem('pendingOrder');
            }
        }
        if (countOrderItems(orderDetails.items) === 0) {
            navigate(`/order?r=${restaurantId || ''}`, { replace: true });
        }
    }, [restaurantData, setOrderDetails, orderDetails.items, navigate, restaurantId]);

    const flatItems = useMemo(() => {
        if (!restaurantData) return [];
        const findMenuItem = (itemId) => {
            for (const cat of restaurantData.categories || []) {
                const found = cat.items?.find(i => i.id === itemId || i.name === itemId);
                if (found) return found;
            }
            return null;
        };

        const items = [];
        Object.entries(orderDetails.items || {}).forEach(([itemId, sizes]) => {
            const menuItem = findMenuItem(itemId);
            const displayName = menuItem?.name
                || itemId.replace(/__(veg|egg|nonveg)$/, '');
            const foodType = menuItem?.foodType
                || (itemId.endsWith('__egg') ? 'egg' : itemId.endsWith('__veg') ? 'veg' : 'nonveg');
            const isVeg = menuItem ? menuItem.isVeg : foodType === 'veg';
            Object.entries(sizes).forEach(([size, data]) => {
                items.push({
                    id: itemId,
                    name: displayName,
                    size,
                    quantity: data.quantity,
                    price: data.price,
                    notes: data.notes,
                    total: data.quantity * data.price,
                    isVeg,
                    foodType
                });
            });
        });
        return items;
    }, [orderDetails.items, restaurantData]);

    if (!restaurantData) return null;
    if (flatItems.length === 0) return null;

    const { restoDetails } = restaurantData;
    const phoneNumber = restoDetails?.contact || '';
    const upiId = restoDetails?.upiId;
    const subtotalAmount = flatItems.reduce((acc, item) => acc + item.total, 0);
    const deliveryState = orderDetails.delivery || emptyDeliveryState();
    const deliveryEnabled =
        FEATURE_FLAGS.deliveryCharges &&
        orderDetails.type === 'online' &&
        restaurantData.restoDetails?.delivery;
    const deliveryBase =
        deliveryEnabled && deliveryState.status === 'ready'
            ? Number(deliveryState.baseCharge) || 0
            : null;
    const deliverySurcharge =
        deliveryEnabled && deliveryState.status === 'ready'
            ? Number(deliveryState.surcharge) || 0
            : 0;
    const deliveryFeeTotal =
        deliveryBase != null ? deliveryBase + deliverySurcharge : null;
    const surchargeLabel =
        deliveryState.surchargeLabel ||
        formatSurchargeLabel(
            deliveryState.surchargeLines,
            deliveryState.surchargeReason
        );
    const totalAmount =
        subtotalAmount + (deliveryFeeTotal != null ? deliveryFeeTotal : 0);
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
        message += `Hi ${restoName},\n`;
        message += `I would like to place an order:\n\n`;

        message += `*Name:* ${orderDetails.customerName.trim()}\n`;
        message += `*Number:* ${String(orderDetails.customerPhone || '').trim()}\n`;
        if (orderDetails.type === 'dinein') {
            message += `*Type:* Dine-in\n`;
            message += `*Table Number:* ${orderDetails.tableNumber.trim()}\n\n`;
        } else {
            message += `*Type:* Online (Delivery)\n`;
            message += `*Address:* ${orderDetails.customerAddress.trim()}\n`;
            if (deliveryState.status === 'ready' && deliveryState.distanceKm != null) {
                message += `*Distance:* ≈ ${deliveryState.distanceKm} km\n`;
            }
            message += `\n`;
        }
        message += `🍴 *Ordered Items:*\n`;
        flatItems.forEach((item, index) => {
            const vegSymbol = item.foodType === 'egg' ? '🟨' : item.isVeg ? '🟩' : '🟥';
            const sizeInfo = item.size ? `${formatSize(item.size)} × ${item.quantity}` : `${item.quantity}`;
            message += `*${index + 1})* ${vegSymbol} ${item.name}\n`;
            message += `${sizeInfo} = ₹${item.total}\n`;
            if (item.notes) {
                message += `Note: ${item.notes}\n`;
            }
            message += `\n`;
        });
        message += `*Subtotal:* ₹${subtotalAmount.toFixed(2)}\n`;
        if (deliveryFeeTotal != null) {
            if (deliveryBase === 0) {
                message += `*Delivery Charges:* Free\n`;
            } else {
                message += `*Delivery Charges:* ₹${deliveryBase.toFixed(2)}\n`;
            }
            if (deliverySurcharge > 0) {
                message += `*Delivery Surcharge${surchargeLabel ? ` (${surchargeLabel})` : ''}:* ₹${deliverySurcharge.toFixed(2)}\n`;
            }
        } else if (deliveryEnabled) {
            message += `*Delivery Charges:* Delivery charge will be confirmed by ${restoDetails?.restoName || 'Restaurant'} on WhatsApp\n`;
        }
        message += `\n💸 *Total Amount:* ₹${totalAmount.toFixed(2)}\n\n`;
        message += `Please confirm. Thanks!\n`;
        message += `Powered by *HARSHTAG APPS*`;
        return message;
    };

    const handleSendOrder = () => {
        if (flatItems.length === 0) {
            navigate(`/order?r=${restaurantId || ''}`, { replace: true });
            return;
        }
        const message = encodeURIComponent(generateWhatsAppMessage());
        const whatsappURL = `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${message}`;
        window.open(whatsappURL, '_blank');
        setOrderDetails({
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            tableNumber: '',
            type: 'online',
            items: {},
            delivery: emptyDeliveryState(),
        });
        setTimeout(() => {
            navigate(`/?r=${restaurantId}`);
        }, 100);
    };
    const handlePayNow = () => {
        if (!upiId) return;
        const payeeName = restoDetails.restoName || 'Merchant';
        const note = `Order for ${orderDetails.customerName}`;
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderDetails));
        const paymentUrl = isIOS ?
            `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}` ||
            `phonepe://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}` ||
            `paytmmp://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}` :
            `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
        window.location.href = paymentUrl;
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
                <div className="review-customer-section">
                    <div className="review-section-header">
                        <UserRound size={18} strokeWidth={2} />
                        <span>Customer Details</span>
                    </div>
                    <div className="review-customer-card">
                        <div className="review-detail-row">
                            <span className="review-detail-label">Customer Name</span>
                            <span className="review-detail-value">{orderDetails.customerName || '-'}</span>
                        </div>
                        <div className="review-detail-row">
                            <span className="review-detail-label">Customer Number</span>
                            <span className="review-detail-value">{orderDetails.customerPhone || '-'}</span>
                        </div>
                        {orderDetails.type === 'dinein' ? (
                            <div className="review-detail-row">
                                <span className="review-detail-label">Table Number</span>
                                <span className="review-detail-value">{orderDetails.tableNumber || '-'}</span>
                            </div>
                        ) : (
                            <>
                                <div className="review-detail-row">
                                    <span className="review-detail-label">Customer Address</span>
                                    <span className="review-detail-value">{orderDetails.customerAddress || '-'}</span>
                                </div>
                                {deliveryEnabled && deliveryState.status === 'ready' && (
                                    <div className="review-detail-row">
                                        <span className="review-detail-label">Distance</span>
                                        <span className="review-detail-value">≈ {deliveryState.distanceKm} km</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="review-detail-row">
                            <span className="review-detail-label">Type</span>
                            <span className="review-detail-value">{orderDetails.type === 'dinein' ? 'Dine-in' : 'Delivery'}</span>
                        </div>
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
                            flatItems.map((item) => {
                                const markerColor = item.foodType === 'egg'
                                    ? '#F5C518'
                                    : item.isVeg ? '#00C851' : '#FF4444';
                                const vegIcon = (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={markerColor}>
                                        <rect x="2" y="2" width="20" height="20" rx="2" />
                                    </svg>
                                );

                                return (
                                    <div key={`${item.id}-${item.size}`} className="review-item-card">
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
                    flexDirection: 'column',
                    gap: '6px',
                    width: '100%'
                }}>
                    {deliveryEnabled && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div className="review-total-label" style={{ fontWeight: 500, fontSize: '14px' }}>Subtotal</div>
                                <div style={{ fontSize: '14px' }}>₹{subtotalAmount.toFixed(2)}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                                <div className="review-total-label" style={{ fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <Truck size={14} />
                                    Delivery Charges
                                </div>
                                <div style={{ fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {deliveryFeeTotal == null
                                        ? '—'
                                        : deliveryBase === 0
                                          ? 'Free'
                                          : `₹${deliveryBase.toFixed(2)}`}
                                </div>
                            </div>
                            {deliveryFeeTotal == null && (
                                <div
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: '#888',
                                        lineHeight: 1.0,
                                        marginTop: '-5px',
                                    }}
                                >
                                    {`Delivery charge will be confirmed by ${restoDetails?.restoName || 'Restaurant'} on WhatsApp`}
                                </div>
                            )}
                            {deliverySurcharge > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div className="review-total-label" style={{ fontWeight: 500, fontSize: '14px' }}>
                                            Delivery Surcharge
                                            {surchargeLabel ? ` (${surchargeLabel})` : ''}
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            ₹{deliverySurcharge.toFixed(2)}
                                        </div>
                                    </div>
                                    {deliveryState.surchargeReason ? (
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                color: '#888',
                                                lineHeight: 1.4,
                                                marginTop: '-2px',
                                            }}
                                        >
                                            {deliveryState.surchargeReason}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div className="review-total-label">Total Amount</div>
                        <div className="review-total-amount">₹{totalAmount.toFixed(2)}</div>
                    </div>
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
                                    backgroundColor: 'var(--primary-color)',
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
                                color: 'var(--primary-color)',
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
