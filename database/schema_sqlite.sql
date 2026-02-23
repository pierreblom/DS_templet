PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS guest_customers;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    name TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    address TEXT,
    apartment TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE guest_customers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    shipping_address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 5,
    category TEXT,
    is_trail_favorite INTEGER DEFAULT 0,
    image_url TEXT,
    hover_image_url TEXT,
    supplier_url TEXT,
    images TEXT DEFAULT '[]',
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    colors TEXT DEFAULT '[]',
    description TEXT
);
CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'gallery',
    display_order INTEGER DEFAULT 0,
    alt_text TEXT,
    color_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE carts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    options TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    size TEXT,
    color TEXT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    guest_id TEXT,
    cart_id TEXT,
    email TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    payment_intent_id TEXT,
    tracking_number TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE
    SET NULL,
        FOREIGN KEY (guest_id) REFERENCES guest_customers(id) ON DELETE
    SET NULL,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE
    SET NULL
);
CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    options TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE
    SET NULL
);
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    trace_id TEXT,
    source_ip TEXT,
    user_id INTEGER,
    user_email TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    params TEXT,
    previous_state TEXT,
    new_state TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE
    SET NULL ON UPDATE CASCADE
);
CREATE TABLE contact_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES profiles(email) ON DELETE
    SET NULL ON UPDATE CASCADE
);
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES profiles(email) ON DELETE CASCADE ON UPDATE CASCADE
);