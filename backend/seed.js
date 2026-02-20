const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function seed() {
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    db.exec('DELETE FROM favorites');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM users');
    db.exec('DELETE FROM sqlite_sequence');

    // Create users
    const salt = await bcrypt.genSalt(12);

    const users = [
        { username: 'john_doe', email: 'john@example.com', password: 'password123' },
        { username: 'jane_smith', email: 'jane@example.com', password: 'password123' },
    ];

    const insertUser = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        insertUser.run(user.username, user.email, hashedPassword);
        console.log(`✅ Created user: ${user.username} (${user.email})`);
    }

    // Create products
    const products = [
        {
            title: 'Wireless Noise-Cancelling Headphones',
            description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals who want immersive audio.',
            price: 299.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            category: 'electronics',
            seller_id: 1,
        },
        {
            title: 'Vintage Leather Messenger Bag',
            description: 'Handcrafted genuine leather messenger bag with antique brass hardware. Features multiple compartments, padded laptop sleeve, and adjustable shoulder strap. Ages beautifully over time.',
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
            category: 'fashion',
            seller_id: 1,
        },
        {
            title: 'Smart Home Security Camera',
            description: '4K HDR security camera with night vision, two-way audio, and AI-powered motion detection. Weather-resistant for indoor/outdoor use. Includes cloud and local storage options.',
            price: 79.99,
            image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
            category: 'electronics',
            seller_id: 1,
        },
        {
            title: 'Organic Matcha Tea Set',
            description: 'Premium Japanese ceremonial grade matcha powder with traditional bamboo whisk, scoop, and ceramic bowl. Sourced from Uji, Kyoto. A perfect gift for tea enthusiasts.',
            price: 44.99,
            image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600',
            category: 'food',
            seller_id: 2,
        },
        {
            title: 'Minimalist Mechanical Keyboard',
            description: 'Compact 75% layout mechanical keyboard with hot-swappable switches, RGB backlighting, and PBT double-shot keycaps. USB-C and Bluetooth 5.0 connectivity for versatile use.',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',
            category: 'electronics',
            seller_id: 2,
        },
        {
            title: 'Handmade Ceramic Plant Pot Set',
            description: 'Set of 3 artisan ceramic plant pots in earth-tone glazes. Each pot features drainage holes and matching saucers. Perfect for succulents, herbs, or small houseplants.',
            price: 34.99,
            image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
            category: 'home',
            seller_id: 2,
        },
        {
            title: 'Professional Yoga Mat',
            description: 'Extra-thick 6mm eco-friendly TPE yoga mat with alignment markings. Non-slip surface, moisture-resistant, and comes with a carrying strap. Available in multiple colors.',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
            category: 'fitness',
            seller_id: 1,
        },
        {
            title: 'Artisan Coffee Bean Sampler',
            description: 'Collection of 5 single-origin specialty coffee beans from around the world. Each 100g bag is freshly roasted. Includes tasting notes and brewing recommendations for each origin.',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
            category: 'food',
            seller_id: 2,
        },
        {
            title: 'Portable Bluetooth Speaker',
            description: 'Waterproof IPX7 portable speaker with 360-degree sound, 20-hour battery life, and built-in microphone. Compact design with carabiner clip for outdoor adventures.',
            price: 69.99,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
            category: 'electronics',
            seller_id: 1,
        },
        {
            title: 'Illustrated World Atlas',
            description: 'Stunning large-format illustrated atlas featuring detailed maps, cultural insights, and breathtaking photography. Over 400 pages covering every country with fascinating facts and statistics.',
            price: 54.99,
            image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600',
            category: 'books',
            seller_id: 2,
        },
    ];

    const insertProduct = db.prepare(
        'INSERT INTO products (title, description, price, image, category, seller_id) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const product of products) {
        insertProduct.run(
            product.title,
            product.description,
            product.price,
            product.image,
            product.category,
            product.seller_id
        );
        console.log(`✅ Created product: ${product.title}`);
    }

    // Add some favorites
    const insertFavorite = db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)');
    insertFavorite.run(1, 4); // john likes matcha
    insertFavorite.run(1, 5); // john likes keyboard
    insertFavorite.run(2, 1); // jane likes headphones
    insertFavorite.run(2, 7); // jane likes yoga mat
    console.log('\n✅ Added sample favorites');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   User 1: john@example.com / password123');
    console.log('   User 2: jane@example.com / password123');
}

// Run directly: node seed.js
if (require.main === module) {
    seed().catch(console.error);
}

module.exports = seed;
