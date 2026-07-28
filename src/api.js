import { fetchMenuData, trackMenuView } from './services/GoogleSheetService';

export async function loadRestaurantData(restaurantId) {
    if (!restaurantId) {
        throw new Error('Restaurant ID is required');
    }

    return await fetchMenuData(restaurantId);
}

export { trackMenuView };
