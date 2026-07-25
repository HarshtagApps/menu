export const OPEN_HOUR = 10;
export const CLOSE_HOUR = 22;
export const SLOT_MINUTES = 90;
export const TABLE_COUNT = 10;
export const BOOKABLE_DAYS = 14;

/** YYYY-MM-DD in local time */
export const toDateKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const parseDateKey = (dateKey) => {
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return startOfDay(new Date());
    }
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const isToday = (dateKey) => toDateKey(new Date()) === dateKey;

export const formatDateLabel = (dateKey) => {
    return parseDateKey(dateKey).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

export const formatDateChip = (dateKey) => {
    const date = parseDateKey(dateKey);
    if (isToday(dateKey)) {
        return {
            top: 'Today',
            bottom: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        };
    }
    return {
        top: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        bottom: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
};

/** Next N bookable days including today */
export const getBookableDates = (days = BOOKABLE_DAYS) => {
    const list = [];
    const base = startOfDay(new Date());
    for (let i = 0; i < days; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        list.push(toDateKey(d));
    }
    return list;
};

/** Build 1.5h slots from 10:00–22:00 */
export const buildDaySlots = () => {
    const slots = [];
    let minutes = OPEN_HOUR * 60;
    const endMinutes = CLOSE_HOUR * 60;

    while (minutes + SLOT_MINUTES <= endMinutes) {
        const startH = Math.floor(minutes / 60);
        const startM = minutes % 60;
        const endTotal = minutes + SLOT_MINUTES;
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;

        slots.push({
            id: `${pad(startH)}${pad(startM)}-${pad(endH)}${pad(endM)}`,
            startMinutes: minutes,
            endMinutes: endTotal,
            startLabel: formatTime(startH, startM),
            endLabel: formatTime(endH, endM),
            rangeLabel: `${formatTime(startH, startM)} – ${formatTime(endH, endM)}`
        });
        minutes += SLOT_MINUTES;
    }
    return slots;
};

const pad = (n) => String(n).padStart(2, '0');

export const formatTime = (hours, minutes = 0) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    if (minutes === 0) return `${h12}:00 ${period}`;
    return `${h12}:${pad(minutes)} ${period}`;
};

/**
 * Mock bookings vary by date so switching days shows different availability.
 * dateKey is used as a simple seed.
 */
export const getMockBookings = (dateKey = toDateKey()) => {
    const slots = buildDaySlots();
    if (slots.length < 8) return {};

    const dayIndex = parseDateKey(dateKey).getDate() % 3;

    const patterns = [
        {
            2: [{ slotId: slots[6].id, customerName: 'Rahul S.' }],
            3: [
                { slotId: slots[2].id, customerName: 'Priya M.' },
                { slotId: slots[5].id, customerName: 'Amit K.' }
            ],
            5: [
                { slotId: slots[4].id, customerName: 'Neha P.' },
                { slotId: slots[6].id, customerName: 'Vikram D.' }
            ],
            7: [{ slotId: slots[0].id, customerName: 'Sneha R.' }],
            9: [
                { slotId: slots[3].id, customerName: 'Arjun T.' },
                { slotId: slots[7].id, customerName: 'Meera L.' }
            ]
        },
        {
            1: [{ slotId: slots[5].id, customerName: 'Karan J.' }],
            4: [
                { slotId: slots[1].id, customerName: 'Ananya B.' },
                { slotId: slots[6].id, customerName: 'Rohan G.' }
            ],
            6: [{ slotId: slots[3].id, customerName: 'Isha V.' }],
            8: [
                { slotId: slots[0].id, customerName: 'Dev P.' },
                { slotId: slots[4].id, customerName: 'Nisha C.' }
            ],
            10: [{ slotId: slots[7].id, customerName: 'Kabir S.' }]
        },
        {
            2: [
                { slotId: slots[2].id, customerName: 'Tara M.' },
                { slotId: slots[7].id, customerName: 'Yash R.' }
            ],
            5: [{ slotId: slots[1].id, customerName: 'Diya K.' }],
            6: [
                { slotId: slots[5].id, customerName: 'Harsh N.' },
                { slotId: slots[6].id, customerName: 'Pooja L.' }
            ],
            8: [{ slotId: slots[3].id, customerName: 'Veer A.' }],
            9: [{ slotId: slots[4].id, customerName: 'Simran D.' }]
        }
    ];

    return patterns[dayIndex];
};

const getReferenceMinutes = (dateKey) => {
    if (isToday(dateKey)) {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }
    // Future days: nothing is "past" yet
    return -1;
};

export const getTables = (dateKey = toDateKey()) => {
    const bookings = getMockBookings(dateKey);
    const nowMinutes = getReferenceMinutes(dateKey);
    const slots = buildDaySlots();
    const treatAsFuture = nowMinutes < 0;

    return Array.from({ length: TABLE_COUNT }, (_, i) => {
        const number = i + 1;
        const tableBookings = bookings[number] || [];
        const reservedSlotIds = new Set(tableBookings.map((b) => b.slotId));

        const currentSlot = !treatAsFuture
            ? slots.find((s) => nowMinutes >= s.startMinutes && nowMinutes < s.endMinutes)
            : null;
        const isCurrentlyReserved = currentSlot
            ? reservedSlotIds.has(currentSlot.id)
            : false;

        const upcoming = tableBookings
            .map((b) => ({
                ...b,
                slot: slots.find((s) => s.id === b.slotId)
            }))
            .filter((b) => b.slot && (treatAsFuture || b.slot.endMinutes > nowMinutes))
            .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes);

        const nextBooking = upcoming[0];
        const isReserved = isCurrentlyReserved || upcoming.length > 0;

        return {
            number,
            name: `Table ${number}`,
            status: isReserved ? 'reserved' : 'vacant',
            isCurrentlyReserved,
            bookings: tableBookings,
            nextUntil: nextBooking?.slot?.endLabel || null
        };
    });
};

export const getSlotsForTable = (tableNumber, dateKey = toDateKey()) => {
    const slots = buildDaySlots();
    const bookings = getMockBookings(dateKey)[Number(tableNumber)] || [];
    const bookingBySlot = Object.fromEntries(
        bookings.map((b) => [b.slotId, b])
    );
    const nowMinutes = getReferenceMinutes(dateKey);
    const treatAsFuture = nowMinutes < 0;

    return slots.map((slot) => {
        const booking = bookingBySlot[slot.id];
        const isPast = !treatAsFuture && slot.endMinutes <= nowMinutes;
        return {
            ...slot,
            status: booking ? 'reserved' : 'vacant',
            customerName: booking?.customerName || null,
            isPast
        };
    });
};

/** @deprecated use formatDateLabel */
export const getTodayLabel = () => formatDateLabel(toDateKey());
