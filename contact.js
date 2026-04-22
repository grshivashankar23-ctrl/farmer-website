// ============================================
// CONTACT.JS - COMPLETE WITH BACKEND CONNECTION
// Just replace your old contact.js with this file!
// ============================================

// Submit contact form
function submitContactForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('inquiry-name').value,
        email: document.getElementById('inquiry-email').value,
        phone: document.getElementById('inquiry-phone').value,
        inquiry_type: document.getElementById('inquiry-type').value,
        message: document.getElementById('inquiry-message').value
    };
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
        alert('❌ Please enter a valid 10-digit phone number');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Change this URL when deploying online
    fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ ' + data.message);
            document.getElementById('contact-form').reset();
        } else {
            alert('❌ Error: ' + data.message);
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('❌ Error sending message.\n\nMake sure backend is running:\npython app.py');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Initialize contact page
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
    
    // Update cart count if function exists
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});