class OrderManager {
    constructor() {
        this.orderItems = [];
        this.customerAddress = '';
        this.customerName = '';
        this.customerPhone = '';
        this.categories = [];
        this.menuItems = [];
        this.restaurantData = null;
        this.currentCategory = null;
    }

    // Initialize the order manager
    async init(restaurantId) {
        try {
            // Load restaurant data
            this.restaurantData = await this.loadRestaurantData(restaurantId);
            
            // Load menu data
            await this.loadMenuData();
            
            // Initialize UI
            this.initializeUI();
            
            // Load any existing order from localStorage
            this.loadOrderFromStorage();
            
        } catch (error) {
            console.error('Error initializing order manager:', error);
            this.showError('Failed to load menu. Please try again.');
        }
    }

    // Load restaurant data
    async loadRestaurantData(restaurantId) {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        try {
            const response = await fetch(`../data/${restaurantId}.json`);

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

    // Load menu data from the restaurant data
    async loadMenuData() {
        try {
            if (!this.restaurantData) {
                throw new Error('Restaurant data not loaded');
            }

            // Extract categories and items from the restaurant data
            this.categories = this.restaurantData.categories || [];
            this.menuItems = this.restaurantData.items || [];
            
            // Set first category as default if none selected
            if (this.categories.length > 0 && !this.currentCategory) {
                this.currentCategory = this.categories[0].id;
            }
            
        } catch (error) {
            console.error('Error loading menu data:', error);
            throw error;
        }
    }

    // Initialize UI elements
    initializeUI() {
        this.renderCategories();
        this.renderOrderSummary();
        this.setupEventListeners();
    }

    // Render categories in the sidebar
    renderCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = this.categories.map(category => {
            const itemCount = this.getCategoryItemCount(category.id);
            const hasItems = itemCount > 0;
            
            return `
                <div class="category-item ${this.currentCategory === category.id ? 'active' : ''} ${hasItems ? 'has-items' : ''}" 
                     data-category-id="${category.id}">
                    <span class="category-name">${category.name}</span>
                    ${hasItems ? `<span class="item-count">${itemCount}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    // Get count of items in a category that are in the order
    getCategoryItemCount(categoryId) {
        return this.orderItems.filter(item => {
            const menuItem = this.menuItems.find(mi => mi.id === item.id);
            return menuItem && menuItem.categoryId === categoryId;
        }).reduce((sum, item) => sum + item.quantity, 0);
    }

    // Render order summary
    renderOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        const orderTotal = document.getElementById('orderTotal');
        
        if (!orderSummary || !orderTotal) return;

        if (this.orderItems.length === 0) {
            orderSummary.innerHTML = '<div class="empty-order">No items added yet</div>';
            orderTotal.textContent = '₹0';
            return;
        }

        // Group items by ID and size
        const groupedItems = this.orderItems.reduce((acc, item) => {
            const key = `${item.id}-${item.size}`;
            if (!acc[key]) {
                acc[key] = { ...item };
            } else {
                acc[key].quantity += item.quantity;
            }
            return acc;
        }, {});

        // Render grouped items
        orderSummary.innerHTML = Object.values(groupedItems).map(item => {
            const menuItem = this.menuItems.find(mi => mi.id === item.id);
            const price = menuItem?.prices?.[item.size] || 0;
            const total = price * item.quantity;
            
            return `
                <div class="order-item">
                    <div class="item-details">
                        <span class="item-name">${menuItem?.name || 'Unknown Item'}</span>
                        <span class="item-size">${this.formatSize(item.size)}</span>
                        <span class="item-notes">${item.notes ? `(${item.notes})` : ''}</span>
                    </div>
                    <div class="item-quantity">
                        <button class="quantity-btn" data-action="decrease" data-id="${item.id}" data-size="${item.size}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <div class="item-price">₹${total.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        // Calculate and update total
        const total = this.calculateOrderTotal();
        orderTotal.textContent = `₹${total.toFixed(2)}`;
    }

    // Calculate total order amount
    calculateOrderTotal() {
        return this.orderItems.reduce((total, item) => {
            const menuItem = this.menuItems.find(mi => mi.id === item.id);
            const price = menuItem?.prices?.[item.size] || 0;
            return total + (price * item.quantity);
        }, 0);
    }

    // Format size for display
    formatSize(size) {
        const sizeMap = {
            'regular': 'R',
            'medium': 'M',
            'large': 'L',
            'full': 'F',
            'half': 'H'
        };
        return sizeMap[size.toLowerCase()] || size;
    }

    // Add item to order
    addItemToOrder(itemId, size = 'regular', notes = '') {
        const existingItem = this.orderItems.find(item => 
            item.id === itemId && item.size === size && item.notes === notes
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.orderItems.push({
                id: itemId,
                size,
                quantity: 1,
                notes
            });
        }

        this.saveOrderToStorage();
        this.renderOrderSummary();
        this.renderCategories();
    }

    // Update item quantity
    updateItemQuantity(itemId, size, change) {
        const item = this.orderItems.find(item => 
            item.id === itemId && item.size === size
        );

        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeItem(itemId, size);
        } else {
            this.saveOrderToStorage();
            this.renderOrderSummary();
            this.renderCategories();
        }
    }

    // Remove item from order
    removeItem(itemId, size) {
        this.orderItems = this.orderItems.filter(item => 
            !(item.id === itemId && item.size === size)
        );
        
        this.saveOrderToStorage();
        this.renderOrderSummary();
        this.renderCategories();
    }

    // Save order to localStorage
    saveOrderToStorage() {
        localStorage.setItem('currentOrder', JSON.stringify({
            items: this.orderItems,
            customerAddress: this.customerAddress,
            customerName: this.customerName,
            customerPhone: this.customerPhone
        }));
    }

    // Load order from localStorage
    loadOrderFromStorage() {
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                this.orderItems = order.items || [];
                this.customerAddress = order.customerAddress || '';
                this.customerName = order.customerName || '';
                this.customerPhone = order.customerPhone || '';
                
                // Update UI
                document.getElementById('customerName').value = this.customerName;
                document.getElementById('customerPhone').value = this.customerPhone;
                document.getElementById('customerAddress').value = this.customerAddress;
                
                this.renderOrderSummary();
                this.renderCategories();
            } catch (e) {
                console.error('Error loading order from storage:', e);
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Category selection
        document.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const categoryId = categoryItem.dataset.categoryId;
                this.currentCategory = categoryId;
                this.renderCategories();
                this.renderItemsForCategory(categoryId);
            }

            // Quantity buttons
            const quantityBtn = e.target.closest('.quantity-btn');
            if (quantityBtn) {
                const { action, id, size } = quantityBtn.dataset;
                if (action === 'increase') {
                    this.updateItemQuantity(id, size, 1);
                } else if (action === 'decrease') {
                    this.updateItemQuantity(id, size, -1);
                }
            }

            // Place order button
            if (e.target.closest('#placeOrderBtn')) {
                this.handlePlaceOrder();
            }
        });

        // Customer details input
        const customerInputs = ['customerName', 'customerPhone', 'customerAddress'];
        customerInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this[`${id}`] = e.target.value;
                    this.saveOrderToStorage();
                });
            }
        });
    }

    // Handle place order
    handlePlaceOrder() {
        // Validate customer details
        if (!this.customerName || !this.customerPhone || !this.customerAddress) {
            this.showError('Please fill in all customer details');
            return;
        }

        if (this.orderItems.length === 0) {
            this.showError('Please add items to your order');
            return;
        }

        // Navigate to order review page
        window.location.href = `order_review.html?r=${this.restaurantData.id}`;
    }

    // Show error message
    showError(message) {
        // Implement error display logic
        console.error(message);
        alert(message); // Replace with a better UI for errors
    }

    // Show success message
    showSuccess(message) {
        // Implement success display logic
        console.log(message);
        alert(message); // Replace with a better UI for success messages
    }

    // Render items for the selected category
    renderItemsForCategory(categoryId) {
        const itemsContainer = document.getElementById('menuItemsContainer');
        if (!itemsContainer) return;

        const categoryItems = this.menuItems.filter(item => item.categoryId === categoryId);
        
        if (categoryItems.length === 0) {
            itemsContainer.innerHTML = '<div class="no-items">No items available in this category</div>';
            return;
        }

        itemsContainer.innerHTML = categoryItems.map(item => {
            const hasVariants = item.prices && Object.keys(item.prices).length > 1;
            const defaultSize = item.prices ? Object.keys(item.prices)[0] : 'regular';
            
            return `
                <div class="menu-item">
                    <div class="item-image" style="background-image: url('${item.image || 'default-food.jpg'}')"></div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description || ''}</div>
                        
                        ${hasVariants ? this.renderSizeOptions(item.id, item.prices) : ''}
                        
                        <div class="item-actions">
                            <div class="item-price">
                                ₹${item.prices ? item.prices[defaultSize].toFixed(2) : '0.00'}
                            </div>
                            <button class="add-to-order" data-item-id="${item.id}" data-size="${defaultSize}">
                                ADD
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render size options for items with multiple sizes
    renderSizeOptions(itemId, prices) {
        const sizes = Object.keys(prices);
        if (sizes.length <= 1) return '';

        return `
            <div class="size-options">
                ${sizes.map(size => `
                    <button class="size-option" data-item-id="${itemId}" data-size="${size}">
                        ${this.formatSize(size)} - ₹${prices[size].toFixed(2)}
                    </button>
                `).join('')}
            </div>
        `;
    }
}

// Initialize order manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('r');
    
    if (restaurantId) {
        const orderManager = new OrderManager();
        orderManager.init(restaurantId);
        
        // Make orderManager available globally for debugging
        window.orderManager = orderManager;
    } else {
        console.error('No restaurant ID provided');
    }
});
