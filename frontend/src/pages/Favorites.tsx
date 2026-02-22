import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

interface Favorite {
    id: string;
    itemId: string;
    item: {
        id: string;
        title: string;
        description: string | null;
        createdAt: string;
    };
    createdAt: string;
}

export default function Favorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch('http://localhost:1085/api/items/favorites', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setFavorites(data);
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [token]);

    const removeFavorite = async (itemId: string) => {
        // Optimistic UI update
        const previousFavs = [...favorites];
        setFavorites(prev => prev.filter(f => f.itemId !== itemId));

        try {
            const url = `http://localhost:1085/api/items/${itemId}/favorite`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to remove favorite');
        } catch (err) {
            console.error(err);
            // Revert optimistic update
            setFavorites(previousFavs);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader" /></div>;

    return (
        <div>
            <h2>Your Favorites</h2>
            {favorites.length === 0 ? (
                <p>You haven't added any favorites yet.</p>
            ) : (
                <div className="items-grid">
                    {favorites.map(fav => (
                        <div key={fav.id} className="item-card">
                            <div className="item-header">
                                <h3 className="item-title">{fav.item.title}</h3>
                                <button
                                    className="fav-btn active"
                                    onClick={() => removeFavorite(fav.itemId)}
                                    title="Remove from favorites"
                                >
                                    <Heart fill="currentColor" />
                                </button>
                            </div>
                            <p className="item-desc">{fav.item.description || 'No description provided.'}</p>
                            <div className="item-footer">
                                <span className="item-date">Favorited on {new Date(fav.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
