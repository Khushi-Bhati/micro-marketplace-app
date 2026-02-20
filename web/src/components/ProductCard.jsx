import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite } from '../services/api';

export default function ProductCard({ product, onFavoriteChange }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleFavorite = async (e) => {
        e.stopPropagation();
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
            if (onFavoriteChange) onFavoriteChange(product.id, !product.is_favorited);
        } catch (err) {
            console.error('Favorite error:', err);
        }
    };

    return (
        <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
            <div className="product-card-image-wrapper">
                <img
                    className="product-card-image"
                    src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.title}
                    loading="lazy"
                />
                <span className="product-card-category">{product.category}</span>
                <button
                    className={`product-card-fav ${product.is_favorited ? 'favorited' : ''}`}
                    onClick={handleFavorite}
                    title={product.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {product.is_favorited ? '❤️' : '🤍'}
                </button>
            </div>
            <div className="product-card-body">
                <h3 className="product-card-title">{product.title}</h3>
                <p className="product-card-desc">{product.description}</p>
                <div className="product-card-footer">
                    <span className="product-card-price">${product.price?.toFixed(2)}</span>
                    {product.seller_name && (
                        <span className="product-card-seller">by {product.seller_name}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
