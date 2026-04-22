// ============================================
// PRODUCTS.JS - STOCK SHOWN PROMINENTLY NEAR PRODUCTS
// Replace your products.js with this file!
// ============================================

// Load products from backend
function loadProducts(category = 'all') {
    // Change this URL when deploying online
    const apiUrl = 'http://localhost:5000/api/products';
    
    fetch(apiUrl + (category !== 'all' ? `?category=${category}` : ''))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.data);
            } else {
                console.error('Error loading products:', data.message);
                document.getElementById('products-container').innerHTML = 
                    '<p class="no-products">Error loading products. Please check backend.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('products-container').innerHTML = 
                '<p class="no-products">Backend not running. Start with: python app.py</p>';
        });
}

// Display products with PROMINENT stock display
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products found in this category.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        const stockLeft = product.stock_quantity;
        
        return `
        <div class="product-detail-card">
            <div class="product-image">${product.icon}</div>
            // Add this line inside your displayProducts template:
<div class="product-info">
    <h3>${product.name}</h3>
    
    <div class="stock-display">
        <strong>Available Stock:</strong> ${product.stock_quantity} ${product.unit}
    </div>
    
    <p class="product-price">₹${product.price} per ${product.unit}</p>
    ...
</div>
                <p style="color: #2e7d32; font-weight: bold;">
                    Stock Limit: ${stockLeft} ${product.unit}
                </p>

                <p class="product-description">${product.description}</p>
                
                <div class="quantity-selector">
                    <label>Qty:</label>
                    <input type="number" 
                           id="qty-${product.id}" 
                           value="1" 
                           min="1" 
                           max="${stockLeft}" 
                           style="width: 50px;">
                </div>

                <button class="add-to-cart-btn" 
                        onclick="addToCart('${product.name}', ${product.price}, 'qty-${product.id}')"
                        ${stockLeft === 0 ? 'disabled' : ''}>
                    ${stockLeft > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>

                <p class="product-price">₹${product.price} <span>per ${product.unit}</span></p>

                <div class="quantity-selector">
                    <label>Quantity (${product.unit}):</label>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="this.parentNode.querySelector('input').stepDown()" ${isOutOfStock ? 'disabled' : ''}>-</button>
                        <input type="number" value="1" min="1" max="${product.stock_quantity}" id="qty-${product.id}">
                        <button class="qty-btn" onclick="this.parentNode.querySelector('input').stepUp()" ${isOutOfStock ? 'disabled' : ''}>+</button>
                    </div>
                </div>

                <button 
                    class="add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}" 
                    onclick="addToCart('${escapeName(product.name)}', ${product.price}, 'qty-${product.id}', '${product.icon}')"
                    ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? '❌ Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Get stock badge class (small badge next to name)
function getStockBadgeClass(quantity) {
    if (quantity === 0) return 'badge-out';
    if (quantity < 50) return 'badge-low';
    if (quantity < 100) return 'badge-medium';
    return 'badge-high';
}

// Get stock badge text (shows in small badge)
function getStockBadgeText(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 50) return `${quantity} left`;
    return 'In Stock';
}

// Get stock class for detailed display
function getStockClass(quantity) {
    if (quantity === 0) return 'stock-out';
    if (quantity < 50) return 'stock-low';
    if (quantity < 100) return 'stock-medium';
    return 'stock-high';
}

// Get stock icon
function getStockIcon(quantity) {
    if (quantity === 0) return '❌';
    if (quantity < 50) return '⚠️';
    if (quantity < 100) return '📦';
    return '✅';
}

// Get stock label
function getStockLabel(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 50) return 'Low Stock Warning!';
    if (quantity < 100) return 'Available';
    return 'In Stock';
}

// Get detailed stock message
function getStockMessage(quantity, unit) {
    if (quantity === 0) {
        return 'This item is currently unavailable';
    } else if (quantity < 50) {
        return `Only ${quantity} ${unit} remaining - Order soon!`;
    } else if (quantity < 100) {
        return `${quantity} ${unit} available`;
    } else {
        return `${quantity} ${unit} in stock - Ready to ship`;
    }
}

// Format category name with icons
function formatCategory(category) {
    const categoryMap = {
        'grains': '🌾 Grains',
        'vegetables': '🥬 Vegetables',
        'fruits': '🍎 Fruits',
        'dairy': '🥛 Dairy'
    };
    return categoryMap[category] || category;
}

// Escape product name for onclick
function escapeName(name) {
    return name.replace(/'/g, "\\'");
}

// Filter products by category
function filterProducts(category) {
    loadProducts(category);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading products with stock display...');
    loadProducts('all');
    
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});