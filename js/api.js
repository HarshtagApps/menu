export async function loadRestaurantData(restaurantId) {
    if (!restaurantId) {
        throw new Error('Restaurant ID is required');
    }

    try {
        const response = await fetch(`./data/${restaurantId}.json`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Restaurant "${restaurantId}" not found. Please check the URL and try again.`);
            }
            throw new Error(`Failed to load restaurant data: HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading restaurant data:', error);
        throw error;
    }
}

export default { loadRestaurantData };
