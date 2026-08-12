import { fetchMenuData, trackMenuView } from './services/GoogleSheetService';
import { ERROR_CODES, createMenuError } from './utils/errorCodes';

export async function loadRestaurantData(restaurantId) {
    if (!restaurantId) {
        throw createMenuError(ERROR_CODES.NO_RESTAURANT);
    }

    return await fetchMenuData(restaurantId);
}

export { trackMenuView };
