const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxZ5Jip8qUnfNZMb4Md4VzWsv1vyxW2v5YQASXHE9MmTYfYkHKtTuXGp_rDxx8XDE1_NA/exec';

export const fetchMenuData = async (restaurantId) => {
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Failed to fetch menu from Google Sheets');

        const allData = await response.json();

        // Check if restaurant info exists
        const restoInfo = allData.info?.[restaurantId];
        if (!restoInfo) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }

        // Check Access flag (central control)
        if (restoInfo.Access === false || restoInfo.Access === 'FALSE') {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }

        // Get menu rows for this restaurant
        const rows = allData.menus?.[restaurantId];
        if (!rows || rows.length === 0) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }

        // Transform flat rows into nested structure
        const categoriesMap = {};

        rows.forEach(row => {
            const { Category, ItemName, IsVeg, IsSpecial, Size, Price } = row;

            if (!categoriesMap[Category]) {
                categoriesMap[Category] = {
                    categoryType: Category,
                    itemsMap: {}
                };
            }

            if (!categoriesMap[Category].itemsMap[ItemName]) {
                categoriesMap[Category].itemsMap[ItemName] = {
                    name: ItemName,
                    isVeg: (IsVeg === true || IsVeg === 'TRUE'),
                    isSpecial: (IsSpecial === true || IsSpecial === 'TRUE'),
                    prices: {}
                };
            }

            // Add price entry
            const sizeKey = Size.toLowerCase();
            categoriesMap[Category].itemsMap[ItemName].prices[sizeKey] = Number(Price);
        });

        // Convert category map and item maps back to arrays
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
                gallery: restoInfo.Gallery || ''
            },
            categories
        };

    } catch (error) {
        console.error('Sheet fetch error:', error);
        throw error;
    }
};
