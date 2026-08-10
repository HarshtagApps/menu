import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import {
    getSlotsForTable,
    getBookableDates,
    formatDateLabel,
    toDateKey
} from '../utils/reservationData';
import '../styles/styles.css';
import '../styles/reserve.css';

const TableSlots = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const tableNumber = searchParams.get('table') || '1';
    const dateFromUrl = searchParams.get('date');
    const bookableDates = useMemo(() => getBookableDates(), []);
    const snackbarTimerRef = useRef(null);

    const selectedDate =
        dateFromUrl && bookableDates.includes(dateFromUrl)
            ? dateFromUrl
            : toDateKey();

    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [partySize, setPartySize] = useState(2);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const slots = useMemo(
        () => getSlotsForTable(tableNumber, selectedDate),
        [tableNumber, selectedDate]
    );

    const selectedSlot = useMemo(
        () => slots.find((s) => s.id === selectedSlotId) || null,
        [slots, selectedSlotId]
    );

    const seatOptions = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('reserveGuest');
            if (!raw) return;
            const guest = JSON.parse(raw);
            if (guest?.customerName) setCustomerName(guest.customerName);
            if (guest?.customerPhone) {
                setCustomerPhone(String(guest.customerPhone).replace(/\D/g, '').slice(0, 10));
            }
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        setSelectedSlotId(null);
    }, [selectedDate, tableNumber]);

    useEffect(() => {
        return () => {
            if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        };
    }, []);

    if (!restaurantData) return null;

    const showValidationSnackbar = (message) => {
        const snackbar = document.getElementById('slots-validation-snackbar');
        if (!snackbar) return;
        snackbar.textContent = message;
        snackbar.className = 'reserve-validation-snackbar show';
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        snackbarTimerRef.current = setTimeout(() => {
            snackbar.className = 'reserve-validation-snackbar';
        }, 5000);
    };

    const handleSlotTap = (slot) => {
        if (slot.isPast || slot.status === 'reserved') return;
        setSelectedSlotId((prev) => (prev === slot.id ? null : slot.id));
    };

    const handleContinue = () => {
        if (!customerName || customerName.trim().length === 0) {
            showValidationSnackbar('Please enter your Name on the previous screen');
            return;
        }
        const phone = String(customerPhone || '').replace(/\D/g, '');
        if (phone.length !== 10) {
            showValidationSnackbar('Please enter a valid 10-digit Customer Number on the previous screen');
            return;
        }
        if (!selectedSlot) {
            showValidationSnackbar('Please select a time slot');
            return;
        }

        const draft = {
            restaurantId,
            customerName: customerName.trim(),
            customerPhone: phone,
            tableNumber: String(tableNumber),
            date: selectedDate,
            slotId: selectedSlot.id,
            slotLabel: selectedSlot.rangeLabel,
            partySize
        };

        try {
            sessionStorage.setItem('pendingReservation', JSON.stringify(draft));
            sessionStorage.setItem(
                'reserveGuest',
                JSON.stringify({
                    customerName: draft.customerName,
                    customerPhone: draft.customerPhone
                })
            );
        } catch {
            /* ignore */
        }

        navigate(`/reserve/review?r=${restaurantId || ''}`);
    };

    return (
        <div className="slots-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Table {tableNumber}</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="slots-container">
                <div className="reserve-details-card">
                    <div className="reserve-details-title">
                        <User size={18} strokeWidth={2} />
                        <span>Customer Details</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Customer Name</span>
                        <span className="reserve-details-value">{customerName || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Customer Number</span>
                        <span className="reserve-details-value">{customerPhone || '-'}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Date</span>
                        <span className="reserve-details-value">{formatDateLabel(selectedDate)}</span>
                    </div>
                    <div className="reserve-details-row">
                        <span className="reserve-details-label">Table</span>
                        <span className="reserve-details-value">{tableNumber}</span>
                    </div>
                </div>

                <div className="slots-section-title">Select time</div>

                <div className="slots-chip-grid">
                    {slots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        const isReserved = slot.status === 'reserved';
                        const isPast = slot.isPast;

                        let chipClass = 'slot-chip';
                        if (isPast) chipClass += ' past';
                        else if (isReserved) chipClass += ' reserved';
                        else if (isSelected) chipClass += ' selected';
                        else chipClass += ' vacant';

                        let statusText = 'Vacant';
                        if (isPast && isReserved) statusText = 'Ended';
                        else if (isPast) statusText = 'Past';
                        else if (isReserved) statusText = 'Reserved';
                        else if (isSelected) statusText = 'Selected';

                        return (
                            <button
                                key={slot.id}
                                type="button"
                                className={chipClass}
                                onClick={() => handleSlotTap(slot)}
                                disabled={isPast || isReserved}
                            >
                                <span className="slot-chip-time">{slot.rangeLabel}</span>
                                <span className="slot-chip-status">{statusText}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="slots-section-title seats-section-title">How many seats?</div>
                <div className="seats-chip-grid" role="group" aria-label="Number of seats">
                    {seatOptions.map((n) => (
                        <button
                            key={n}
                            type="button"
                            className={`seats-chip${partySize === n ? ' selected' : ''}`}
                            onClick={() => setPartySize(n)}
                            aria-pressed={partySize === n}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <div className="slots-continue-bar">
                <div className="slots-continue-summary">
                    <div className="slots-continue-label">
                        {selectedSlot ? selectedSlot.rangeLabel : 'Select a time slot'}
                    </div>
                    <div className="slots-continue-meta">
                        {partySize} {partySize === 1 ? 'seat' : 'seats'}
                    </div>
                </div>
                <button type="button" className="slots-continue-btn" onClick={handleContinue}>
                    <span>Continue</span>
                    <ChevronRight size={16} strokeWidth={2} />
                </button>
            </div>

            <div id="slots-validation-snackbar" className="reserve-validation-snackbar" />
        </div>
    );
};

export default TableSlots;
