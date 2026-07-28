import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
    getSlotsForTable,
    getBookableDates,
    formatDateLabel,
    formatDateChip,
    toDateKey,
    isToday,
    SLOT_MINUTES
} from '../utils/reservationData';
import '../styles/styles.css';
import '../styles/reserve.css';

const TableSlots = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const tableNumber = searchParams.get('table') || '1';
    const dateFromUrl = searchParams.get('date');
    const bookableDates = useMemo(() => getBookableDates(), []);

    const initialDate =
        dateFromUrl && bookableDates.includes(dateFromUrl)
            ? dateFromUrl
            : toDateKey();

    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const slots = useMemo(
        () => getSlotsForTable(tableNumber, selectedDate),
        [tableNumber, selectedDate]
    );

    useEffect(() => {
        if (dateFromUrl && bookableDates.includes(dateFromUrl) && dateFromUrl !== selectedDate) {
            setSelectedDate(dateFromUrl);
            setSelectedSlotId(null);
        }
    }, [dateFromUrl, bookableDates, selectedDate]);

    const vacantCount = slots.filter((s) => s.status === 'vacant' && !s.isPast).length;
    const reservedCount = slots.filter((s) => s.status === 'reserved').length;

    if (!restaurantData) return null;

    const handleDateSelect = (dateKey) => {
        setSelectedDate(dateKey);
        setSelectedSlotId(null);
        const next = new URLSearchParams(searchParams);
        next.set('date', dateKey);
        if (restaurantId) next.set('r', restaurantId);
        if (tableNumber) next.set('table', tableNumber);
        setSearchParams(next, { replace: true });
    };

    const handleSlotTap = (slot) => {
        if (slot.isPast || slot.status === 'reserved') return;
        setSelectedSlotId((prev) => (prev === slot.id ? null : slot.id));
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
                <div className="reserve-date-section" style={{ marginBottom: '14px' }}>
                    <div className="reserve-date-heading">Select date</div>
                    <div className="reserve-date-scroller">
                        {bookableDates.map((dateKey) => {
                            const chip = formatDateChip(dateKey);
                            const active = dateKey === selectedDate;
                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    className={`reserve-date-chip ${active ? 'active' : ''} ${isToday(dateKey) ? 'is-today' : ''}`}
                                    onClick={() => handleDateSelect(dateKey)}
                                >
                                    <span className="reserve-date-chip-top">{chip.top}</span>
                                    <span className="reserve-date-chip-bottom">{chip.bottom}</span>
                                </button>
                            );
                        })}
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

                <div className="slots-footer-note">
                    Booking &amp; advance payment coming next. UI preview only.
                </div>

                {selectedSlotId && (
                    <div className="slots-footer-note" style={{ color: '#00A9FE', fontWeight: 600 }}>
                        Slot selected — payment flow will be added later.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableSlots;
