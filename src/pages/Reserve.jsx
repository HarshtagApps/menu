import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ProjectImages } from '../utils/menuData';
import {
    getTables,
    getBookableDates,
    formatDateChip,
    toDateKey,
    isToday
} from '../utils/reservationData';
import '../styles/styles.css';
import '../styles/reserve.css';

const Reserve = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const dateFromUrl = searchParams.get('date');
    const bookableDates = useMemo(() => getBookableDates(), []);

    const initialDate =
        dateFromUrl && bookableDates.includes(dateFromUrl)
            ? dateFromUrl
            : toDateKey();

    const [selectedDate, setSelectedDate] = useState(initialDate);
    const tables = useMemo(() => getTables(selectedDate), [selectedDate]);

    useEffect(() => {
        if (dateFromUrl && bookableDates.includes(dateFromUrl) && dateFromUrl !== selectedDate) {
            setSelectedDate(dateFromUrl);
        }
    }, [dateFromUrl, bookableDates, selectedDate]);

    if (!restaurantData) return null;

    const handleDateSelect = (dateKey) => {
        setSelectedDate(dateKey);
        const next = new URLSearchParams(searchParams);
        next.set('date', dateKey);
        setSearchParams(next, { replace: true });
    };

    const handleTableTap = (tableNumber) => {
        navigate(
            `/reserve/table?r=${restaurantId}&table=${tableNumber}&date=${selectedDate}`
        );
    };

    return (
        <div className="reserve-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Reserve a Table</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="reserve-container">
                <div className="reserve-date-section">
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

                <div className="reserve-legend">
                    <div className="reserve-legend-item">
                        <span className="reserve-legend-dot vacant"></span>
                        Vacant
                    </div>
                    <div className="reserve-legend-item">
                        <span className="reserve-legend-dot reserved"></span>
                        Reserved
                    </div>
                </div>

                <div className="reserve-table-grid">
                    {tables.map((table) => {
                        const isReserved = table.status === 'reserved';
                        return (
                            <div
                                key={table.number}
                                className={`reserve-table-card ${table.status}`}
                                onClick={() => handleTableTap(table.number)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleTableTap(table.number);
                                    }
                                }}
                            >
                                <div className="reserve-table-top">
                                    <span className="reserve-table-label">Table</span>
                                    <span className="reserve-table-badge">{table.number}</span>
                                </div>

                                <div className="reserve-table-visual">
                                    <img
                                        src={isReserved ? ProjectImages.occupied : ProjectImages.vacant}
                                        alt={isReserved ? 'Reserved' : 'Vacant'}
                                    />
                                </div>

                                <div className="reserve-table-status">
                                    {isReserved ? 'Reserved' : 'Vacant'}
                                </div>
                                {isReserved && table.nextUntil && (
                                    <div className="reserve-table-until">
                                        {table.isCurrentlyReserved
                                            ? `Until ${table.nextUntil}`
                                            : `Next until ${table.nextUntil}`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Reserve;
