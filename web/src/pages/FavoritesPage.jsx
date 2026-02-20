import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function FavoritesPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getFavorites({ limit: 50 });
            setFavorites(res.data.favorites);
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteChange = async (productId, isFavorited) => {
        if (!isFavorited) {
            // Remove from list
            setFavorites((prev) => prev.filter((p) => p.id !== productId));
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">Loading favorites...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="favorites-header">
                <h1>❤️ My Favorites</h1>
                <p>{favorites.length} saved item{favorites.length !== 1 ? 's' : ''}</p>
            </div>

            {favorites.length === 0 ? (
                <div className="favorites-empty">
                    <div className="favorites-empty-icon">💫</div>
                    <h2>No favorites yet</h2>
                    <p>Start exploring and save products you love!</p>
                    <Link to="/" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex', marginTop: '0.5rem' }}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="products-grid">
                    {favorites.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
