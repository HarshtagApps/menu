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

                <div className="slots-summary-card">
                    <div className="slots-summary-title">Table {tableNumber}</div>
                    <div className="slots-summary-sub">
                        {formatDateLabel(selectedDate)} · Open 10:00 AM – 10:00 PM · {SLOT_MINUTES / 60} hr slots
                    </div>
                    <div className="slots-summary-sub" style={{ marginTop: '6px' }}>
                        {vacantCount} vacant · {reservedCount} reserved
                    </div>
                </div>

                <div className="slots-section-title">Timeline</div>

                <div className="slots-list">
                    {slots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        const isReserved = slot.status === 'reserved';
                        const isPast = slot.isPast;

                        let rowClass = 'slot-row';
                        if (isPast) rowClass += ' past';
                        else if (isReserved) rowClass += ' reserved';
                        else if (isSelected) rowClass += ' selected vacant';
                        else rowClass += ' vacant';

                        let pillClass = 'slot-pill';
                        let pillText = 'Vacant';
                        if (isPast && isReserved) {
                            pillClass += ' past';
                            pillText = 'Ended';
                        } else if (isPast) {
                            pillClass += ' past';
                            pillText = 'Past';
                        } else if (isReserved) {
                            pillClass += ' reserved';
                            pillText = 'Reserved';
                        } else if (isSelected) {
                            pillClass += ' selected';
                            pillText = 'Selected';
                        } else {
                            pillClass += ' vacant';
                        }

                        let meta = `${SLOT_MINUTES} min`;
                        if (isReserved) {
                            meta = slot.customerName
                                ? `Reserved · ${slot.customerName} · until ${slot.endLabel}`
                                : `Reserved until ${slot.endLabel}`;
                        } else if (!isPast) {
                            meta = `Vacant · ${slot.startLabel} to ${slot.endLabel}`;
                        }

                        return (
                            <div
                                key={slot.id}
                                className={rowClass}
                                onClick={() => handleSlotTap(slot)}
                                role="button"
                                tabIndex={isPast || isReserved ? -1 : 0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleSlotTap(slot);
                                    }
                                }}
                            >
                                <div className="slot-row-left">
                                    <div className="slot-time">{slot.rangeLabel}</div>
                                    <div className="slot-meta">{meta}</div>
                                </div>
                                <span className={pillClass}>{pillText}</span>
                            </div>
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
