# ============================================
# FARMER WEBSITE BACKEND - PYTHON/FLASK
# BCA Project by Shiva Shankar G R
# ============================================

# Line 1-10: Import all required libraries
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime
import os

# Line 11-15: Create Flask app
app = Flask(__name__)

# Line 16-20: Configure app
app.config['SECRET_KEY'] = 'farmer-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///farmer_website.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Line 21-25: Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app)  # Allow requests from frontend

# ============================================
# DATABASE MODELS (Tables)
# ============================================

# Line 26-50: Product Model (Table)
class Product(db.Model):
    """Product table - stores all farm products"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='kg')
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    stock_quantity = db.Column(db.Integer, default=0)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert product to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'unit': self.unit,
            'description': self.description,
            'icon': self.icon,
            'stock_quantity': self.stock_quantity,
            'in_stock': self.stock_quantity > 0
        }

# Line 51-75: Order Model (Table)
class Order(db.Model):
    """Order table - stores customer orders"""
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(15), nullable=False)
    customer_email = db.Column(db.String(100))
    delivery_address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    delivery_instructions = db.Column(db.Text)
    payment_method = db.Column(db.String(50), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    delivery_charges = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    order_status = db.Column(db.String(50), default='pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with order items
    items = db.relationship('OrderItem', backref='order', lazy=True)

# Line 76-95: OrderItem Model (Table)
class OrderItem(db.Model):
    """Order items table - individual items in each order"""
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), db.ForeignKey('orders.order_id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)

# Line 96-110: ContactMessage Model (Table)
class ContactMessage(db.Model):
    """Contact messages table - stores customer inquiries"""
    __tablename__ = 'contact_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    inquiry_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='unread')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Line 111-125: AdminUser Model (Table)
class AdminUser(db.Model):
    """Admin users table - stores admin login credentials"""
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_database():
    """Initialize database with tables and sample data"""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if products already exist
        if Product.query.count() == 0:
            # Add sample products
            products = [
                Product(name='Organic Wheat', category='grains', price=70.00, unit='kg', 
                       description='Premium pesticide-free wheat', icon='🌾', stock_quantity=10),
                Product(name='Fresh Tomatoes', category='vegetables', price=40.00, unit='kg',
                       description='Juicy organic tomatoes', icon='🍅', stock_quantity=200),
                Product(name='Chickpeas', category='grains', price=80.00, unit='kg',
                       description='Premium desi chickpeas', icon='🫘', stock_quantity=150),
                Product(name='Cauliflower', category='vegetables', price=50.00, unit='kg',
                       description='Fresh white cauliflower', icon='🥦', stock_quantity=100),
                Product(name='Spinach', category='vegetables', price=25.00, unit='kg',
                       description='Tender organic spinach', icon='🥬', stock_quantity=80),
                Product(name='Okra', category='vegetables', price=45.00, unit='kg',
                       description='Fresh tender okra', icon='🫛', stock_quantity=120),
                Product(name='Watermelon', category='fruits', price=20.00, unit='kg',
                       description='Sweet juicy watermelon', icon='🍉', stock_quantity=300),
                Product(name='Cucumber', category='vegetables', price=30.00, unit='kg',
                       description='Crisp fresh cucumbers', icon='🥒', stock_quantity=150),
                Product(name='Coriander', category='vegetables', price=40.00, unit='kg',
                       description='Aromatic fresh coriander', icon='🌿', stock_quantity=50),
                Product(name='Mango', category='fruits', price=60.00, unit='kg',
                       description='Sweet organic mangoes', icon='🥭', stock_quantity=200),
                Product(name='Coconut', category='fruits', price=35.00, unit='piece',
                       description='Fresh mature coconuts', icon='🥥', stock_quantity=180),
                Product(name='Cow Milk', category='dairy', price=55.00, unit='liter',
                       description='Pure fresh cow milk', icon='🥛', stock_quantity=100),
                Product(name='Coconut Oil', category='dairy', price=180.00, unit='liter',
                       description='Cold-pressed coconut oil', icon='🛢️', stock_quantity=80)
            ]
            
            for product in products:
                db.session.add(product)
            
            print("✅ Added 13 sample products")
        
        # Check if admin user exists
        if AdminUser.query.count() == 0:
            # Create admin user
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = AdminUser(
                username='admin',
                password=hashed_password,
                email='admin@farm.com',
                full_name='Shiva Shankar G R'
            )
            db.session.add(admin)
            print("✅ Created admin user (admin/admin123)")
        
        # Commit all changes
        db.session.commit()
        print("✅ Database initialized successfully!")

# ============================================
# API ROUTES
# ============================================

# Line 126-130: Home route
@app.route('/')
def home():
    """Home page - API info"""
    return jsonify({
        'message': '🌾 Farmer Website Backend API',
        'status': 'Running',
        'version': '1.0.0',
        'endpoints': {
            'products': '/api/products',
            'orders': '/api/orders',
            'contact': '/api/contact',
            'admin_login': '/api/admin/login',
            'admin_dashboard': '/api/admin/dashboard'
        }
    })

# Line 131-150: Get all products
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products or filter by category"""
    # Get category from query parameter
    category = request.args.get('category', 'all')
    
    # Build query
    if category == 'all':
        products = Product.query.filter_by(is_available=True).all()
    else:
        products = Product.query.filter_by(category=category, is_available=True).all()
    
    # Convert to list of dictionaries
    products_list = [product.to_dict() for product in products]
    return jsonify({
        'success': True,
        'message': 'Products fetched successfully',
        'data': products_list
    })

# Line 151-200: place new order
@app.route('/api/orders', methods=['GET', 'POST'])
def order():
    if request.method == 'GET':
        return jsonify({
            "message": "The orders API working. Use POST method to place an order"
        })

    data = request.get_json()
    print("new order received:", data)
    required_fields = [
        'customer_name', 'customer_phone', 'delivery_address',
        'city', 'pincode', 'payment_method', 'items', 'total'
    ]

    if not data:
        return jsonify({
            'success': False,
            'message': 'No data received'
        }), 400

    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400

    import time, random
    order_id = f"ORD{int(time.time())}{random.randint(1000,9999)}"

    try:
        order = Order(
            order_id=order_id,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            customer_email=data.get('customer_email', ''),
            delivery_address=data['delivery_address'],
            city=data['city'],
            pincode=data['pincode'],
            delivery_instructions=data.get('delivery_instructions', ''),
            payment_method=data['payment_method'],
            subtotal=data.get('subtotal', 0),
            delivery_charges=data.get('delivery_charges', 0),
            total_amount=data['total']
        )

        db.session.add(order)

        for item in data['items']:
            order_item = OrderItem(
                order_id=order_id,
                product_id=item.get('id', 0),
                product_name=item['name'],
                quantity=item['quantity'],
                unit=item.get('unit', 'kg'),
                price=item['price'],
                total=item['price'] * item['quantity']
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Order placed successfully',
            'data': {
                'order_id': order_id,
                'total_amount': data['total'],
                'delivery_address': f"{data['delivery_address']}, {data['city']} - {data['pincode']}"
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error placing order: {str(e)}'
        }), 500

# Line 201-230: Submit contact form
@app.route('/api/contact', methods=['GET','POST'])
def submit_contact():
    if request.method == 'GET':
        return jsonify({"message":"The contact API is up and running!"})            
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'inquiry_type', 'message']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    try:
        # Create contact message
        message = ContactMessage(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            inquiry_type=data['inquiry_type'],
            message=data['message']
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thank you! Your message has been sent successfully.'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Line 231-260: Admin login
@app.route('/api/admin/login', methods=['GET', 'POST'])
def admin_login():
    # For browser testing
    if request.method == 'GET':
        return jsonify({
            "message": "Login API is working. Use POST method to login."
        })

    # POST logic
    data = request.get_json()

    if 'username' not in data or 'password' not in data:
        return jsonify({
            'success': False,
            'message': 'Please enter both username and password'
        }), 400

    admin = AdminUser.query.filter_by(username=data['username']).first()

    if not admin:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401

    if bcrypt.check_password_hash(admin.password, data['password']):
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'username': admin.username,
                'full_name': admin.full_name,
                'email': admin.email
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401
# Line 261-290: Admin dashboard
@app.route('/api/admin/dashboard', methods=['GET','POST'])
def admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        # Calculate statistics
        total_orders = Order.query.count()
        pending_orders = Order.query.filter_by(order_status='pending').count()
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
        total_products = Product.query.count()
        unread_messages = ContactMessage.query.filter_by(status='unread').count()
        
        # Get recent orders
        recent_orders = Order.query.order_by(Order.order_date.desc()).limit(10).all()
        
        orders_list = [{
            'order_id': order.order_id,
            'customer_name': order.customer_name,
            'customer_phone': order.customer_phone,
            'total_amount': order.total_amount,
            'order_status': order.order_status,
            'order_date': order.order_date.strftime('%Y-%m-%d %H:%M:%S')
        } for order in recent_orders]
        
        return jsonify({
            'success': True,
            'data': {
                'stats': {
                    'total_orders': total_orders,
                    'pending_orders': pending_orders,
                    'total_revenue': float(total_revenue),
                    'total_products': total_products,
                    'unread_messages': unread_messages
                },
                'recent_orders': orders_list
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# ============================================
# START SERVER
# ============================================

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Print startup message
    print('\n' + '='*50)
    print('🌾 FARMER WEBSITE BACKEND')
    print('='*50)
    print('✅ Server running on: http://localhost:5000')
    print('✅ API endpoints:')
    print('   - Products: http://localhost:5000/api/products')
    print('   - Orders: http://localhost:5000/api/orders')
    print('   - Contact: http://localhost:5000/api/contact')
    print('   - Admin Login: http://localhost:5000/api/admin/login')
    print('='*50)
    print('\n')
    
    # Run the app
    app.run(debug=True, port=5000)