import Router from './router.js';
import { loadRestaurantData } from './api.js';

async function initApp() {
    const app = document.getElementById('app');
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('r') || 'montagna';

    app.innerHTML = `
        <div class="splash-screen">
            <img src="assets/images/logo.png" alt="Logo" class="splash-logo">
            <div class="splash-footer">
                <div class="splash-developed">Developed by</div>
                <div class="splash-brand">HARSHTAG</div>
            </div>
        </div>`;

    try {
        const restaurantData = await loadRestaurantData(restaurantId);
        const router = new Router(restaurantData, restaurantId);
        setTimeout(() => {
            router.handleInitialRoute();
        }, 2500);

    } catch (error) {
        app.innerHTML = `<div class="error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-title">Failed to load menu</div>
            <div class="error-subtitle">${error.message}</div>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', initApp);