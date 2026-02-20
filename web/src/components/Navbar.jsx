import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <div className="navbar-brand-icon">🛍️</div>
                    <span>MicroMart</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={isActive('/')}>
                        Browse
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/favorites" className={`${isActive('/favorites')} nav-link-fav`}>
                                ❤️ Favorites
                            </Link>
                            <div className="nav-user">
                                <div className="nav-avatar" title={user?.username}>
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <button className="nav-logout" onClick={logout}>
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn nav-btn-outline">
                                Sign In
                            </Link>
                            <Link to="/register" className="nav-btn nav-btn-primary">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
