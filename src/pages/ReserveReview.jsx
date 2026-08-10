import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { formatDateLabel } from '../utils/reservationData';
import '../styles/styles.css';
import '../styles/reserve.css';

const ReserveReview = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');

    const reservation = useMemo(() => {
        try {
            const raw = sessionStorage.getItem('pendingReservation');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    if (!restaurantData) return null;

    if (!reservation) {
        return (
            <div className="slots-page">
                <div className="secondary-appbar">
                    <div className="appbar-content">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <ChevronLeft size={30} strokeWidth={2} />
                        </button>
                        <div className="appbar-title">Review Reservation</div>
                    </div>
                    <div className="appbar-border"></div>
                </div>
                <div className="slots-container">
                    <p className="slots-footer-note">
                        No reservation details found. Please go back and select a table again.
                    </p>
                    <button
                        type="button"
                        className="slots-continue-btn"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                        onClick={() => navigate(`/reserve?r=${restaurantId || ''}`)}
                    >
                        Back to Reserve
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="slots-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Review Reservation</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="slots-container">
                <div className="reserve-details-card">
                    <div className="reserve-details-title">
                        <User size={18} strokeWidth={2} />
                        <span>Reservation Details</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Customer Name</span>
                        <span className="reserve-details-value">{reservation.customerName || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Customer Number</span>
                        <span className="reserve-details-value">{reservation.customerPhone || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Date</span>
                        <span className="reserve-details-value">
                            {reservation.date ? formatDateLabel(reservation.date) : '-'}
                        </span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Table</span>
                        <span className="reserve-details-value">{reservation.tableNumber || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Time</span>
                        <span className="reserve-details-value">{reservation.slotLabel || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Seats</span>
                        <span className="reserve-details-value">{reservation.partySize || '-'}</span>
                    </div>
                </div>

                <div className="slots-footer-note">
                    Advance payment &amp; WhatsApp send coming next.
                </div>
            </div>
        </div>
    );
};

export default ReserveReview;
