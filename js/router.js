import { getImageForCategory } from './menu_data.js';

class Router {
    constructor(restaurantData, restaurantId) {
        this.restaurantData = restaurantData;
        this.restaurantId = restaurantId;
        this.appElement = document.getElementById('app');
    }

    handleInitialRoute() {
        this.renderHome();
    }

    renderHome() {
        const categories = [...new Set(this.restaurantData.categories.map(cat => cat.categoryType))];
        const restoDetails = this.restaurantData.restoDetails || {};
        const restoName = (restoDetails.restoName || '').toUpperCase();
        const restoAddress = restoDetails.address || '';
        const restoContact = restoDetails.contact || '';
        
        // Update page title
        document.title = restoName ? `${restoName} | Harshtag Apps` : 'Harshtag Apps';
        
        this.appElement.innerHTML = `
            <div class="page-transition">
                <div class="restaurant-header">
                    <div class="restaurant-header-content">
                        <div class="restaurant-name">${restoName}</div>
                        <div class="restaurant-address">${restoAddress}</div>
                        <div class="restaurant-contact">${restoContact ? `Ph: +91 ${restoContact}` : ''}</div>
                    </div>
                    <div class="restaurant-divider"></div>
                </div>
                <div class="menu-container">
                    <div class="categories-grid">
                        ${categories.map(cat => `
                            <div class="category-card" onclick="window.location.href='pages/food_items.html?r=${encodeURIComponent(this.restaurantId)}&category=${encodeURIComponent(cat)}'">
                                <div class="category-image-container">
                                    <img src="${getImageForCategory(cat)}" alt="${cat}" class="category-image" onerror="this.src='assets/images/placeholder.png'">
                                </div>
                                <div class="category-name">${cat}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
}

export default Router;