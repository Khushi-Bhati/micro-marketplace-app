import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addFavorite, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await getProduct(id);
            setProduct(res.data);
        } catch (err) {
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            if (product.is_favorited) {
                await removeFavorite(product.id);
            } else {
                await addFavorite(product.id);
            }
            setProduct((prev) => ({ ...prev, is_favorited: !prev.is_favorited }));
        } catch (err) {
            console.error('Favorite error:', err);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">Loading product...</span>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">😕</div>
                    <h3>{error || 'Product not found'}</h3>
                    <p>The product you're looking for doesn't exist</p>
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
                        Back to products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="product-detail">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="product-detail-grid">
                    <div className="product-detail-image-wrapper">
                        <img
                            className="product-detail-image"
                            src={product.image || 'https://via.placeholder.com/600x500?text=No+Image'}
                            alt={product.title}
                        />
                    </div>

                    <div className="product-detail-info">
                        <span className="product-detail-category">{product.category}</span>
                        <h1 className="product-detail-title">{product.title}</h1>
                        <div className="product-detail-price">${product.price?.toFixed(2)}</div>

                        <p className="product-detail-desc">{product.description}</p>

                        {product.seller_name && (
                            <div className="product-detail-seller">
                                <div className="product-detail-seller-avatar">
                                    {product.seller_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="product-detail-seller-info">
                                    <div className="product-detail-seller-name">{product.seller_name}</div>
                                    <div className="product-detail-seller-label">Seller</div>
                                </div>
                            </div>
                        )}

                        <div className="product-detail-actions">
                            <button
                                id="favorite-btn"
                                className={`btn-fav ${product.is_favorited ? 'favorited' : ''}`}
                                onClick={handleFavorite}
                            >
                                <span className="heart-icon">{product.is_favorited ? '❤️' : '🤍'}</span>
                                {product.is_favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            padding: '16px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Listed on</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(product.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Product ID</span>
                                <span style={{ color: 'var(--text-secondary)' }}>#{product.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
