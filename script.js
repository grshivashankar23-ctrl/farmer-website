// Main JavaScript file for common functionality

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in navigation
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Add item to cart
function addToCart(name, price, qtyInputId, icon, unit = 'kg') {
    const qtyInput = document.getElementById(qtyInputId);
    const quantity = parseFloat(qtyInput.value);
    
    if (quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const cart = getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            name: name,
            price: price,
            quantity: quantity,
            icon: icon,
            unit: unit
        });
    }
    
    saveCart(cart);
    
    // Show confirmation
    showNotification(`${name} added to cart!`);
    
    // Reset quantity to 1
    qtyInput.value = qtyInputId.includes('coriander') ? 0.5 : 1;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Quantity control functions
function increaseQty(inputId, step = 1) {
    const input = document.getElementById(inputId);
    const currentValue = parseFloat(input.value);
    const max = parseFloat(input.max);
    const newValue = currentValue + step;
    
    if (max && newValue <= max) {
        input.value = newValue;
    } else if (!max) {
        input.value = newValue;
    }
}

function decreaseQty(inputId, step = 1) {
    const input = document.getElementById(inputId);
    const currentValue = parseFloat(input.value);
    const min = parseFloat(input.min);
    const newValue = currentValue - step;
    
    if (newValue >= min) {
        input.value = newValue;
    }
}