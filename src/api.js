export async function loadRestaurantData(restaurantId) {
    if (!restaurantId) {
        throw new Error('Restaurant ID is required');
    }

    try {
        const response = await fetch(`data/${restaurantId}.json`);
        const contentType = response.headers.get("content-type");

        // Check if response is not JSON (likely HTML fallback for 404 in SPA)
        if (contentType && contentType.includes("text/html")) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`The restaurant "${restaurantId}" was not found.`);
            }
            throw new Error(`Failed to load data: HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Catch JSON parse errors which might happen if content-type check fails but body is malformed
        if (error.message.includes("Unexpected token") || error.message.includes("JSON")) {
            throw new Error(`The restaurant "${restaurantId}" was not found.`);
        }
        console.error('Error loading restaurant data:', error);
        throw error;
    }
}
