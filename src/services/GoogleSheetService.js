import { resolveThemeColor } from '../utils/theme';
import { ERROR_CODES, createMenuError } from '../utils/errorCodes';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxZ5Jip8qUnfNZMb4Md4VzWsv1vyxW2v5YQASXHE9MmTYfYkHKtTuXGp_rDxx8XDE1_NA/exec';

export const trackMenuView = (restaurantId) => {
    if (!restaurantId) return;
    const url = `${SHEET_URL}?action=trackView&r=${encodeURIComponent(restaurantId)}`;
    try {
        fetch(url, { method: 'GET', keepalive: true }).catch(() => { });
    } catch {
    }
};

export const fetchMenuData = async (restaurantId) => {
    try {
        let response;
        try {
            response = await fetch(`${SHEET_URL}?r=${encodeURIComponent(restaurantId)}`);
        } catch {
            // G48291S — network / blocked request to sheet endpoint
            throw createMenuError(ERROR_CODES.GOOGLE_SHEETS_FETCH);
        }
        if (!response.ok) {
            // G48291S — sheet endpoint returned non-OK HTTP status
            throw createMenuError(ERROR_CODES.GOOGLE_SHEETS_FETCH);
        }
        let allData;
        try {
            allData = await response.json();
        } catch {
            // G57304S — sheet response was not valid JSON
            throw createMenuError(ERROR_CODES.GOOGLE_SHEETS_PARSE);
        }
        const restoInfo = allData.info?.[restaurantId];
        if (!restoInfo) {
            // N61802F — restaurant ID missing from sheet info
            throw createMenuError(ERROR_CODES.NOT_FOUND);
        }
        if (restoInfo.Access === false || restoInfo.Access === 'FALSE') {
            // A19374F — Access is FALSE in the sheet
            throw createMenuError(ERROR_CODES.ACCESS_FALSE);
        }
        const rows = allData.menus?.[restaurantId];
        if (!rows || rows.length === 0) {
            // E70415M — no menu rows for this restaurant
            throw createMenuError(ERROR_CODES.EMPTY_MENU);
        }
        const categoriesMap = {};
        rows.forEach(row => {
            const { Category, ItemName, IsVeg, IsSpecial, Size, Price, Description, Discounted, DiscountEnds } = row;
            if (!categoriesMap[Category]) {
                categoriesMap[Category] = {
                    categoryType: Category,
                    itemsMap: {}
                };
            }
            const isVegRaw = typeof IsVeg === 'string' ? IsVeg.trim().toUpperCase() : IsVeg;
            let foodType = 'nonveg';
            if (isVegRaw === true || isVegRaw === 'TRUE' || isVegRaw === 'VEG') {
                foodType = 'veg';
            } else if (isVegRaw === 'EGG') {
                foodType = 'egg';
            }
            const isVeg = foodType === 'veg';
            const itemKey = `${ItemName}__${foodType}`;
            if (!categoriesMap[Category].itemsMap[itemKey]) {
                categoriesMap[Category].itemsMap[itemKey] = {
                    id: itemKey,
                    name: ItemName,
                    isVeg,
                    foodType,
                    isSpecial: (IsSpecial === true || IsSpecial === 'TRUE'),
                    description: Description || '',
                    prices: {},
                    discountedPrices: {},
                    discountEnds: {}
                };
            }
            const sizeKey = Size.toLowerCase();
            categoriesMap[Category].itemsMap[itemKey].prices[sizeKey] = Number(Price);
            if (Discounted != null && Discounted !== '' && !Number.isNaN(Number(Discounted))) {
                categoriesMap[Category].itemsMap[itemKey].discountedPrices[sizeKey] = Number(Discounted);
            }
            if (DiscountEnds != null && DiscountEnds !== '') {
                categoriesMap[Category].itemsMap[itemKey].discountEnds[sizeKey] = DiscountEnds;
            }
        });
        const categories = Object.values(categoriesMap).map(cat => ({
            categoryType: cat.categoryType,
            items: Object.values(cat.itemsMap)
        }));
        return {
            id: restaurantId,
            restoDetails: {
                restoName: restoInfo.RestoName || restaurantId.toUpperCase(),
                address: restoInfo.Address || '',
                contact: restoInfo.Contact || '',
                plan: restoInfo.Plan || 'basic',
                theme: resolveThemeColor(restoInfo.Theme || restoInfo.THEME),
                upiId: restoInfo.UpiID || restoInfo.upiId || '',
                instagram: restoInfo.Instagram || '',
                location: restoInfo.Location || '',
                reviewUrl: restoInfo.GoogleReview || restoInfo.ReviewURL || restoInfo.ReviewUrl || '',
                gallery: restoInfo.Gallery || '',
                tableReserve: restoInfo.TableReserve || '',
                showBannerAds: (restoInfo.ShowBannerAds === true || restoInfo.ShowBannerAds === 'TRUE'),
                backgroundMusicUrls: restoInfo.BackgroundMusic
                    ? restoInfo.BackgroundMusic
                        .replace(/\n\s*/g, '')
                        .split(',')
                        .map(url => url.trim())
                        .filter(url => url)
                    : [],
                bannerAdsUrls: restoInfo.BannerAdsURL ? restoInfo.BannerAdsURL.split(',').map(url => url.trim()).filter(url => url) : [],
                bannerAdsMap: restoInfo.BannerAdsURL ?
                    (function () {
                        const map = {};
                        const cleanedData = restoInfo.BannerAdsURL.replace(/\n\s*/g, '').replace(/\s+/g, ' ');
                        const parts = cleanedData.split('],');
                        parts.forEach(part => {
                            const cleanPart = part.replace(/\]$/, '');
                            const match = cleanPart.match(/^(\w+)\[(.*)$/);
                            if (match) {
                                const key = match[1].trim();
                                const urls = match[2].split(',').map(url => url.trim()).filter(url => url);
                                map[key] = urls;
                            }
                        });
                        return map;
                    })() : {}
            },
            categories
        };
    } catch (error) {
        console.error('Sheet fetch error:', error);
        if (error?.name === 'MenuError' && error.code) throw error;
        // U39160E — unexpected error while loading menu
        throw createMenuError(ERROR_CODES.UNKNOWN);
    }
};
