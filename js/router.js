import { getImageForCategory } from './menu_data.js';
import { buildPriceTagsHTML } from './utils.js';

class Router {
    constructor(restaurantData) {
        this.restaurantData = restaurantData;
        this.appElement = document.getElementById('app');
        window.addEventListener('popstate', () => this.handleRoute());
    }

    handleInitialRoute() {
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('category/')) {
            const categoryName = decodeURIComponent(hash.split('/')[1]);
            this.renderCategory(categoryName);
        } else {
            this.renderHome();
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    renderHome() {
        const categories = [...new Set(this.restaurantData.categories.map(cat => cat.categoryType))];
        
        this.appElement.innerHTML = `
            <div class="page-transition">
                <div class="secondary-appbar">
                    <div class="appbar-content">
                        <div class="appbar-title">MENU</div>
                    </div>
                    <div class="appbar-border"></div>
                </div>
                <div class="menu-container">
                    <div class="categories-grid">
                        ${categories.map(cat => `
                            <div class="category-card" onclick="window.location.hash='category/${encodeURIComponent(cat)}'">
                                <div class="category-image-container">
                                    <img src="${getImageForCategory(cat)}" alt="${cat}" class="category-image" onerror="this.src='../assets/images/placeholder.png'">
                                </div>
                                <div class="category-name">${cat}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    renderCategory(categoryName) {
        const category = this.restaurantData.categories.find(c => c.categoryType === categoryName);
        
        const itemsHTML = category.items.map(item => `
            <div class="food-item">
                <div class="food-item-content">
                    <div class="food-item-details">
                        <div class="food-item-header">
                            <h3 class="food-item-name">${item.name}</h3>
                            <span class="veg-dot ${item.isVeg ? 'veg' : 'non-veg'}"></span>
                        </div>
                        <div class="price-tags">${buildPriceTagsHTML(item.prices)}</div>
                        <p class="food-item-description">${item.description || ''}</p>
                    </div>
                    <div class="food-item-image">
                        <img src="${getImageForCategory(categoryName)}" alt="${item.name}">
                    </div>
                </div>
            </div>
        `).join('');

        this.appElement.innerHTML = `
            <div class="page-transition">
                <div class="secondary-appbar">
                    <div class="appbar-content">
                        <button class="back-button" onclick="window.history.back()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div class="appbar-title">${categoryName}</div>
                    </div>
                    <div class="appbar-border"></div>
                </div>
                <div class="items-container">${itemsHTML}</div>
            </div>`;
    }
}

export default Router;