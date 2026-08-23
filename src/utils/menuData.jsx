import { useState, useEffect } from 'react';

export const ProjectImages = {
    logo: 'assets/images/logo.png',
    menu: 'assets/images/menu.png',
    rice: 'assets/images/rice.png',
    dahi: 'assets/images/dahi.png',
    roti: 'assets/images/roti.png',
    soup: 'assets/images/soup.png',
    cake: 'assets/images/cake.png',
    eggs: 'assets/images/eggs.png',
    call: 'assets/images/call.png',
    corn: 'assets/images/corn.png',
    dish: 'assets/images/dish.png',
    threeD: 'assets/images/3d.png',
    pizza: 'assets/images/pizza.png',
    momos: 'assets/images/momos.png',
    pasta: 'assets/images/pasta.png',
    salad: 'assets/images/salad.png',
    tikka: 'assets/images/tikka.png',
    water: 'assets/images/water.png',
    thali: 'assets/images/thali.png',
    order: 'assets/images/order.png',
    wraps: 'assets/images/wraps.png',
    share: 'assets/images/share.png',
    table: 'assets/images/table.png',
    soup2: 'assets/images/soup2.png',
    sweets: 'assets/images/laddu.png',
    burger: 'assets/images/burger.png',
    cheese: 'assets/images/cheese.png',
    coffee: 'assets/images/coffee.png',
    hotDog: 'assets/images/hotdog.png',
    indian: 'assets/images/indian.png',
    google: 'assets/images/google.png',
    waffle: 'assets/images/waffle.png',
    shakes: 'assets/images/shakes.png',
    vacant: 'assets/images/vacant.png',
    salad2: 'assets/images/salad2.png',
    gallery: 'assets/images/gallery.png',
    chinese: 'assets/images/chinese.png',
    cookies: 'assets/images/cookies.png',
    noodles: 'assets/images/noodles.png',
    special: 'assets/images/special.png',
    namkeen: 'assets/images/namkeen.png',
    shakes2: 'assets/images/shakes2.png',
    coffee2: 'assets/images/coffee2.png',
    coffee3: 'assets/images/coffee3.png',
    harshtag: 'assets/images/harshtag.png',
    iceCream: 'assets/images/iceCream.png',
    mocktail: 'assets/images/mocktail.png',
    sandwich: 'assets/images/sandwich.png',
    whatsapp: 'assets/images/whatsapp.png',
    location: 'assets/images/location.png',
    occupied: 'assets/images/occupied.png',
    instagram: 'assets/images/instagram.png',
    beverages: 'assets/images/beverages.png',
    colddrinks: 'assets/images/colddrink.png',
    mainCourse: 'assets/images/mainCourse.png',
    frenchFries: 'assets/images/frenchFries.png',
    garlicBread: 'assets/images/garlicBread.png',
};

export const MenuData = {
    items: [
        { image: ProjectImages.rice, name: "Rice" },
        { image: ProjectImages.roti, name: "Roti" },
        { image: ProjectImages.dahi, name: "Dahi" },
        { image: ProjectImages.soup, name: "Soup" },
        { image: ProjectImages.dish, name: "Dish" },
        { image: ProjectImages.pizza, name: "Pizza" },
        { image: ProjectImages.momos, name: "Momos" },
        { image: ProjectImages.pasta, name: "Pasta" },
        { image: ProjectImages.salad, name: "Salad" },
        { image: ProjectImages.tikka, name: "Tikka" },
        { image: ProjectImages.water, name: "Water" },
        { image: ProjectImages.wraps, name: "Wraps" },
        { image: ProjectImages.soup2, name: "Soup2" },
        { image: ProjectImages.cake, name: "Dessert" },
        { image: ProjectImages.coffee, name: "Coffee" },
        { image: ProjectImages.shakes, name: "Shakes" },
        { image: ProjectImages.hotDog, name: "Hotdog" },
        { image: ProjectImages.cheese, name: "Paneer" },
        { image: ProjectImages.indian, name: "Indian" },
        { image: ProjectImages.sweets, name: "Sweets" },
        { image: ProjectImages.salad2, name: "Salad2" },
        { image: ProjectImages.burger, name: "Burgers" },
        { image: ProjectImages.waffle, name: "Waffles" },
        { image: ProjectImages.coffee2, name: "Coffee2" },
        { image: ProjectImages.chinese, name: "Chinese" },
        { image: ProjectImages.noodles, name: "Noodles" },
        { image: ProjectImages.namkeen, name: "Namkeen" },
        { image: ProjectImages.corn, name: "Sweet Corn" },
        { image: ProjectImages.shakes2, name: "Shakes2" },
        { image: ProjectImages.coffee3, name: "Coffee3" },
        { image: ProjectImages.sandwich, name: "Sandwich" },
        { image: ProjectImages.frenchFries, name: "Fries" },
        { image: ProjectImages.iceCream, name: "Ice Cream" },
        { image: ProjectImages.frenchFries, name: "Snacks" },
        { image: ProjectImages.mocktail, name: "Mocktails" },
        { image: ProjectImages.eggs, name: "Eggs/Omelette" },
        { image: ProjectImages.rice, name: "Rice & Biryani" },
        { image: ProjectImages.coffee, name: "Tea & Coffee" },
        { image: ProjectImages.beverages, name: "Beverages" },
        { image: ProjectImages.roti, name: "Roti & Parantha" },
        { image: ProjectImages.mainCourse, name: "Main Course" },
        { image: ProjectImages.colddrinks, name: "Cold Drinks" },
        { image: ProjectImages.garlicBread, name: "Garlic Bread" },
    ]
};

function endOfLocalDay(year, month, day) {
    return new Date(year, month, day, 23, 59, 59, 999).getTime();
}

function endOfLocalMinute(year, month, day, hours, minutes) {
    return new Date(year, month, day, hours, minutes, 59, 999).getTime();
}

function parseTime12h(timeStr) {
    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3].toUpperCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
}

function parseNumericDateValue(value) {
    if (value > 1000 && value < 100000) {
        const fraction = value % 1;
        const date = new Date(Math.round((value - 25569) * 86400000));
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        if (fraction > 0.00001) {
            return endOfLocalMinute(year, month, day, date.getHours(), date.getMinutes());
        }
        return endOfLocalDay(year, month, day);
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return endOfLocalDay(date.getFullYear(), date.getMonth(), date.getDate());
    }

    return null;
}

function parseDatePartsWithOptionalTime(day, month, year, timeStr) {
    if (timeStr) {
        const time = parseTime12h(timeStr);
        if (!time) return null;
        return endOfLocalMinute(year, month, day, time.hours, time.minutes);
    }
    return endOfLocalDay(year, month, day);
}

export function parseDiscountEndTimestamp(value) {
    if (value == null || value === '') return null;

    if (typeof value === 'number' && !Number.isNaN(value)) {
        return parseNumericDateValue(value);
    }

    const str = String(value).trim();
    const optionalTimePattern = '(?:\\(\\s*(\\d{1,2}:\\d{2}\\s*(?:AM|PM))\\s*\\))?';

    const dmyMatch = str.match(new RegExp(`^(\\d{1,2})[\\/-](\\d{1,2})[\\/-](\\d{4})\\s*${optionalTimePattern}$`, 'i'));
    if (dmyMatch) {
        return parseDatePartsWithOptionalTime(
            Number(dmyMatch[1]),
            Number(dmyMatch[2]) - 1,
            Number(dmyMatch[3]),
            dmyMatch[4]
        );
    }

    const isoMatch = str.match(new RegExp(`^(\\d{4})-(\\d{2})-(\\d{2})\\s*${optionalTimePattern}$`, 'i'));
    if (isoMatch) {
        return parseDatePartsWithOptionalTime(
            Number(isoMatch[3]),
            Number(isoMatch[2]) - 1,
            Number(isoMatch[1]),
            isoMatch[4]
        );
    }

    if (str.includes('T')) {
        const parsed = new Date(str);
        if (!Number.isNaN(parsed.getTime())) {
            return endOfLocalMinute(
                parsed.getFullYear(),
                parsed.getMonth(),
                parsed.getDate(),
                parsed.getHours(),
                parsed.getMinutes()
            );
        }
    }

    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
        return endOfLocalDay(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    return null;
}

export function getDiscountEndTimestamp(item, size) {
    const raw = item.discountEnds?.[size.toLowerCase()];
    if (raw == null || raw === '') return null;
    return parseDiscountEndTimestamp(raw);
}

export function getDiscountedPrice(item, size) {
    return item.discountedPrices?.[size.toLowerCase()];
}

export function isDiscountActive(item, size, now = Date.now()) {
    const discounted = getDiscountedPrice(item, size);
    if (discounted == null || discounted === '' || Number.isNaN(Number(discounted))) {
        return false;
    }
    const endTimestamp = getDiscountEndTimestamp(item, size);
    if (endTimestamp == null) return true;
    return now <= endTimestamp;
}

export function getActiveDiscountedPrice(item, size, now = Date.now()) {
    if (!isDiscountActive(item, size, now)) return undefined;
    return Number(getDiscountedPrice(item, size));
}

export function getEffectivePrice(item, size, now = Date.now()) {
    const activeDiscount = getActiveDiscountedPrice(item, size, now);
    if (activeDiscount != null) return activeDiscount;
    return item.prices[size.toLowerCase()];
}

function formatCountdown(remainingMs) {
    if (remainingMs <= 0) return '0s';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export function PriceTags({ originalPrice, item, size, className = '', prefix = '₹', sizeLabel = '' }) {
    const endTimestamp = getDiscountEndTimestamp(item, size);
    const [now, setNow] = useState(() => Date.now());

    const activeDiscount = getActiveDiscountedPrice(item, size, now);
    const hasDiscount = activeDiscount != null;
    const showCountdown = hasDiscount && endTimestamp != null;
    const label = sizeLabel ? `${sizeLabel}: ` : '';

    useEffect(() => {
        if (!showCountdown) return undefined;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [showCountdown, endTimestamp]);

    const remainingMs = showCountdown ? endTimestamp - now : 0;

    return (
        <span className={`price-tag-wrapper ${className}`.trim()}>
            <span className="price-tag-group">
                <span className="price-tag price-tag--original">
                    {label}
                    <span className={`price-tag-price${hasDiscount ? ' price-tag-price--struck' : ''}`}>
                        {prefix}{originalPrice}
                    </span>
                </span>
                {hasDiscount && (
                    <span className="price-tag price-tag--discounted">
                        {label}
                        <span className="price-tag-price price-tag-price--bold">
                            {prefix}{activeDiscount}
                        </span>
                    </span>
                )}
            </span>
            {showCountdown && remainingMs > 0 && (
                <span className="discount-countdown">
                    <span className="discount-countdown-label">Discount ends in </span>
                    <span className="discount-countdown-timer">{formatCountdown(remainingMs)}</span>
                </span>
            )}
        </span>
    );
}

// Sheet format: "ImageKey (Display Name)" e.g. "Namkeen (Kurkure)"
export function getCategoryImageKey(categoryType) {
    if (!categoryType) return '';
    const match = String(categoryType).trim().match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (match) return match[1].trim();
    return String(categoryType).trim();
}

export function getCategoryDisplayName(categoryType) {
    if (!categoryType) return '';
    const match = String(categoryType).trim().match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (match) return match[2].trim();
    return String(categoryType).trim();
}

export function getImageForCategory(categoryType) {
    const imageKey = getCategoryImageKey(categoryType);
    const menuItem = MenuData.items.find(
        item => item.name.toLowerCase() === imageKey.toLowerCase()
    );
    if (!menuItem) return '';
    return menuItem.image;
}

export function hexToCssFilter(hex) {
    const filters = {
        '#00A9FE':
            'brightness(0) saturate(100%) invert(57%) sepia(98%) saturate(3014%) hue-rotate(177deg) brightness(101%) contrast(102%)',
        '#FFFFFF':
            'brightness(0) saturate(100%) invert(100%)',
        '#000000':
            'brightness(0) saturate(100%)',
        '#333333':
            'brightness(0) saturate(100%) invert(20%)',
    };

    return filters[hex.toUpperCase()] || 'none';
}
