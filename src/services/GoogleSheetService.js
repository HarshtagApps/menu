const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxZ5Jip8qUnfNZMb4Md4VzWsv1vyxW2v5YQASXHE9MmTYfYkHKtTuXGp_rDxx8XDE1_NA/exec';

export const fetchMenuData = async (restaurantId) => {    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Failed to fetch menu from Google Sheets');
        const allData = await response.json();
        const restoInfo = allData.info?.[restaurantId];
        if (!restoInfo) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }
        if (restoInfo.Access === false || restoInfo.Access === 'FALSE') {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }
        const rows = allData.menus?.[restaurantId];
        if (!rows || rows.length === 0) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
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
        throw error;
    }
};
