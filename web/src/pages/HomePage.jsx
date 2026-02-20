import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['all', 'electronics', 'fashion', 'food', 'home', 'fitness', 'books'];

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 9 };
            if (search) params.search = search;
            if (category !== 'all') params.category = category;

            const res = await getProducts(params);
            setProducts(res.data.products);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        if (searchTimeout) clearTimeout(searchTimeout);

        setSearchTimeout(
            setTimeout(() => {
                setSearch(value);
                setPage(1);
            }, 400)
        );
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setPage(1);
    };

    const handleFavoriteChange = (productId, isFavorited) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, is_favorited: isFavorited } : p))
        );
    };

    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-btn"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                >
                    ←
                </button>
                {pages.map((p) => (
                    <button
                        key={p}
                        className={`pagination-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="pagination-btn"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                >
                    →
                </button>
                <span className="pagination-info">
                    {pagination.total} product{pagination.total !== 1 ? 's' : ''}
                </span>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="hero">
                <h1>Discover Amazing Products</h1>
                <p>Explore our curated marketplace of unique and high-quality items from trusted sellers</p>
            </div>

            <div className="search-section">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        id="search-input"
                        type="text"
                        className="search-input"
                        placeholder="Search products..."
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="category-chips">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`category-chip ${category === cat ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">Loading products...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filters</p>
                </div>
            ) : (
                <>
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onFavoriteChange={handleFavoriteChange}
                            />
                        ))}
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}
