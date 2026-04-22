// Cart page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    displayCart();
});

// Display cart items
function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCart.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        emptyCart.style.display = 'none';
        checkoutBtn.disabled = false;
        
        let cartHTML = '';
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const unit = item.unit || 'kg';
            const unitLabel = unit === 'piece' ? (item.quantity > 1 ? 'pieces' : 'piece') : unit;
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-img">${item.icon}</div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Price: ₹${item.price}/${unit}</p>
                        <p>Quantity: ${item.quantity} ${unitLabel}</p>
                    </div>
                    <div class="cart-item-actions">
                        <p class="cart-item-price">₹${itemTotal.toFixed(2)}</p>
                        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
    }
    
    updateOrderSummary();
}

// Remove item from cart
function removeFromCart(index) {
    const cart = getCart();
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
    showNotification(`${itemName} removed from cart`);
}

// Update order summary
function updateOrderSummary() {
    const cart = getCart();
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate delivery charges
    const deliveryCharges = subtotal >= 500 ? 0 : 50;
    
    // Calculate total
    const total = subtotal + deliveryCharges;
    
    // Update display
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('delivery-charges').textContent = deliveryCharges === 0 
        ? 'FREE' 
        : `₹${deliveryCharges.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Hide cart, show checkout form
    document.querySelector('.cart-container').style.display = 'none';
    document.getElementById('checkout-section').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hide checkout and return to cart
function hideCheckout() {
    document.querySelector('.cart-container').style.display = 'grid';
    document.getElementById('checkout-section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Place order
// Place order - CONNECTED TO BACKEND
async function placeOrder(event) {
    event.preventDefault();
    
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryCharges;
    
    // 1. Prepare data (Field names must match app.py Line 151 exactly)
    const orderData = {
        customer_name: document.getElementById('customer-name').value,
        customer_phone: document.getElementById('customer-phone').value,
        customer_email: document.getElementById('customer-email').value,
        delivery_address: document.getElementById('delivery-address').value,
        city: document.getElementById('city').value,
        pincode: document.getElementById('pincode').value,
        delivery_instructions: document.getElementById('delivery-instructions').value,
        payment_method: document.getElementById('payment-method').value,
        items: cart, // This list of products
        subtotal: subtotal,
        delivery_charges: deliveryCharges,
        total: total
    };
    
    try {
        // 2. SEND data to the Flask server
        const response = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // 3. Show confirmation only if database saved it
            document.getElementById('checkout-section').style.display = 'none';
            document.getElementById('order-confirmation').style.display = 'block';
            
            // Update confirmation details on screen
            document.getElementById('order-id').textContent = result.data.order_id;
            document.getElementById('order-total').textContent = `₹${total.toFixed(2)}`;
            document.getElementById('order-address').textContent = result.data.delivery_address;
            
            // Clear cart from storage
            localStorage.removeItem('cart');
            if (typeof updateCartCount === 'function') updateCartCount();
            
            console.log('✅ Order saved to database:', result.data.order_id);
        } else {
            alert('❌ Order Failed: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Connection Error:', error);
        alert('Could not connect to the server. Is app.py running?');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}