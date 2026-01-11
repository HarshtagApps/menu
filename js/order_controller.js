// Order Controller - Manages order state and logic
class OrderController {
    constructor() {
        this.customerName = '';
        this.customerAddress = '';
        this.menuItems = [];
        this.orderItems = [];
        this.restaurantData = null;
        this.notesControllers = {};
        this.listeners = [];
    }

    // Initialize controller with restaurant data
    async init(restaurantData) {
        this.restaurantData = restaurantData;
        this.loadMenu();
    }

    // Load menu items from restaurant data
    loadMenu() {
        if (!this.restaurantData || !this.restaurantData.categories) {
            this.menuItems = [];
            return;
        }

        this.menuItems = [];
        this.restaurantData.categories.forEach(category => {
            if (category.items && Array.isArray(category.items)) {
                category.items.forEach(item => {
                    this.menuItems.push({
                        id: item.name,
                        name: item.name,
                        categoryType: category.categoryType,
                        prices: item.prices || {},
                        isVeg: item.isVeg !== undefined ? item.isVeg : true,
                        isSpecial: item.isSpecial || false
                    });
                });
            }
        });
        this.notifyListeners();
    }

    // Get or create order item
    getOrderItem(itemId) {
        let orderItem = this.orderItems.find(item => item.itemId === itemId);
        if (!orderItem) {
            orderItem = {
                itemId: itemId,
                quantities: {},
                notes: {}
            };
            this.orderItems.push(orderItem);
        }
        return orderItem;
    }

    // Update quantity for an item
    updateQuantity(itemId, size, change) {
        const orderItem = this.getOrderItem(itemId);
        const currentQty = orderItem.quantities[size] || 0;
        const newQty = currentQty + change;

        if (newQty <= 0) {
            delete orderItem.quantities[size];
            delete orderItem.notes[size];
        } else {
            orderItem.quantities[size] = newQty;
        }

        // Remove order item if no quantities left
        if (Object.keys(orderItem.quantities).length === 0) {
            this.orderItems = this.orderItems.filter(item => item.itemId !== itemId);
        }

        this.notifyListeners();
    }

    // Get quantity for an item
    getQuantity(itemId, size) {
        const orderItem = this.orderItems.find(item => item.itemId === itemId);
        if (!orderItem) return 0;
        return orderItem.quantities[size] || 0;
    }

    // Update notes for an item
    updateNotes(itemId, size, notes) {
        const orderItem = this.getOrderItem(itemId);
        if (notes.trim().length === 0) {
            delete orderItem.notes[size];
        } else {
            orderItem.notes[size] = notes.trim();
        }
        this.notifyListeners();
    }

    // Get notes for an item
    getNotes(itemId, size) {
        const orderItem = this.orderItems.find(item => item.itemId === itemId);
        if (!orderItem) return '';
        return orderItem.notes[size] || '';
    }

    // Calculate item price
    calculateItemPrice(itemId, size, quantity) {
        const menuItem = this.menuItems.find(item => item.id === itemId);
        if (!menuItem) return 0;
        const price = menuItem.prices[size] || 0;
        return price * quantity;
    }

    // Calculate total amount
    calculateTotalAmount() {
        let total = 0;
        this.orderItems.forEach(orderItem => {
            Object.entries(orderItem.quantities).forEach(([size, quantity]) => {
                total += this.calculateItemPrice(orderItem.itemId, size, quantity);
            });
        });
        return total;
    }

    // Get total items count
    getTotalItemsCount() {
        let count = 0;
        this.orderItems.forEach(orderItem => {
            Object.values(orderItem.quantities).forEach(quantity => {
                count += quantity;
            });
        });
        return count;
    }

    // Calculate category subtotal
    calculateCategorySubtotal(items) {
        let subtotal = 0;
        items.forEach(item => {
            const itemId = item.id || item.name;
            const orderItem = this.orderItems.find(oi => oi.itemId === itemId);
            if (orderItem) {
                Object.entries(orderItem.quantities).forEach(([size, qty]) => {
                    const price = item.prices[size] || 0;
                    subtotal += price * qty;
                });
            }
        });
        return subtotal;
    }

    // Get category item count
    getCategoryItemCount(items) {
        let count = 0;
        items.forEach(item => {
            const itemId = item.id || item.name;
            const orderItem = this.orderItems.find(oi => oi.itemId === itemId);
            if (orderItem) {
                Object.values(orderItem.quantities).forEach(qty => {
                    count += qty;
                });
            }
        });
        return count;
    }

    // Check if category has items
    categoryHasItems(categoryType) {
        const categoryItems = this.menuItems.filter(item => item.categoryType === categoryType);
        return categoryItems.some(item => {
            const itemId = item.id || item.name;
            const orderItem = this.orderItems.find(oi => oi.itemId === itemId);
            return orderItem && Object.keys(orderItem.quantities).length > 0;
        });
    }

    // Prepare final order data
    prepareFinalOrderData() {
        const finalItems = [];
        this.orderItems.forEach(orderItem => {
            const menuItem = this.menuItems.find(item => item.id === orderItem.itemId);
            if (menuItem) {
                Object.entries(orderItem.quantities).forEach(([size, quantity]) => {
                    const price = menuItem.prices[size] || 0;
                    const itemTotal = price * quantity;
                    finalItems.push({
                        itemId: orderItem.itemId,
                        name: menuItem.name,
                        categoryType: menuItem.categoryType,
                        size: size,
                        quantity: quantity,
                        price: price,
                        itemTotal: itemTotal,
                        notes: orderItem.notes[size] || '',
                        isVeg: menuItem.isVeg
                    });
                });
            }
        });
        return finalItems;
    }

    // Get size label
    getSizeLabel(size) {
        switch (size.toLowerCase()) {
            case 'small': return 'Small';
            case 'medium': return 'Medium';
            case 'large': return 'Large';
            case 'half': return 'Half';
            case 'full': return 'Full';
            default: return size;
        }
    }

    // Format size for display
    formatSize(size) {
        return this.getSizeLabel(size);
    }

    // Validate order
    validateOrder() {
        if (!this.customerName || this.customerName.trim().length === 0) {
            return { valid: false, message: 'Please enter customer name' };
        }
        if (!this.customerAddress || this.customerAddress.trim().length === 0) {
            return { valid: false, message: 'Please enter customer address' };
        }
        if (this.orderItems.length === 0) {
            return { valid: false, message: 'Please add items to the order' };
        }
        return { valid: true };
    }

    // Generate WhatsApp message
    generateWhatsAppMessage() {
        const restoName = this.restaurantData?.restoDetails?.restoName || 'Restaurant';
        const finalItems = this.prepareFinalOrderData();
        const totalAmount = this.calculateTotalAmount();
        
        let message = `*New Order from ${restoName}*\n\n`;
        message += `*Customer Details:*\n`;
        message += `Name: ${this.customerName}\n`;
        message += `Address: ${this.customerAddress}\n\n`;
        message += `*Order Items:*\n`;
        
        finalItems.forEach((item, index) => {
            const vegSymbol = item.isVeg ? '🟢' : '🔴';
            message += `${index + 1}. ${vegSymbol} ${item.name}\n`;
            message += `   ${this.formatSize(item.size)} × ${item.quantity} = ₹${item.itemTotal}\n`;
            if (item.notes) {
                message += `   Note: ${item.notes}\n`;
            }
        });
        
        message += `\n*Total Amount: ₹${totalAmount.toFixed(2)}*`;
        
        return encodeURIComponent(message);
    }

    // Get WhatsApp URL
    getWhatsAppURL() {
        const phoneNumber = this.restaurantData?.restoDetails?.contact || '';
        const message = this.generateWhatsAppMessage();
        return `https://wa.me/91${phoneNumber}?text=${message}`;
    }

    // Reset order
    resetOrder() {
        this.customerName = '';
        this.customerAddress = '';
        this.orderItems = [];
        this.notesControllers = {};
        this.notifyListeners();
    }

    // Subscribe to changes
    subscribe(listener) {
        this.listeners.push(listener);
    }

    // Unsubscribe from changes
    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    // Group items by category
    getGroupedItems() {
        const grouped = {};
        this.menuItems.forEach(item => {
            const category = item.categoryType || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    }

    // Get items for category
    getItemsForCategory(categoryType) {
        return this.menuItems.filter(item => item.categoryType === categoryType);
    }
}

// Create global instance
window.orderController = new OrderController();