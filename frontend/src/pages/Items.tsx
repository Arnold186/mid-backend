import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

interface Item {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
}

export default function Items() {
    const [items, setItems] = useState<Item[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const { token, user } = useAuth();

    const fetchItems = async (cursor?: string) => {
        try {
            const url = new URL('http://localhost:1085/api/items');
            url.searchParams.append('limit', '6');
            if (cursor) url.searchParams.append('cursor', cursor);

            const res = await fetch(url.toString());
            const data = await res.json();

            if (cursor) {
                setItems(prev => [...prev, ...data.data]);
            } else {
                setItems(data.data);
            }
            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error('Failed to fetch items', err);
        }
    };

    const fetchFavorites = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:1085/api/items/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFavorites(new Set(data.map((f: any) => f.itemId)));
            }
        } catch (err) {
            console.error('Failed to fetch favorites', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchItems(), fetchFavorites()]);
            setLoading(false);
        };
        init();
    }, [token]);

    const loadMore = async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        await fetchItems(nextCursor);
        setLoadingMore(false);
    };

    const toggleFavorite = async (itemId: string) => {
        if (!token) {
            alert("Please login to favorite items.");
            return;
        }

        const isFav = favorites.has(itemId);

        // Optimistic UI update
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.delete(itemId);
            else next.add(itemId);
            return next;
        });

        try {
            const url = `http://localhost:1085/api/items/${itemId}/favorite`;
            const res = await fetch(url, {
                method: isFav ? 'DELETE' : 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to toggle favorite');
        } catch (err) {
            console.error(err);
            // Revert optimistic update
            setFavorites(prev => {
                const next = new Set(prev);
                if (isFav) next.add(itemId);
                else next.delete(itemId);
                return next;
            });
        }
    };

    if (loading) return <div className="loader-container"><div className="loader" /></div>;

    return (
        <div>
            <h2>Discover Items</h2>
            {items.length === 0 ? (
                <p>No items found.</p>
            ) : (
                <div className="items-grid">
                    {items.map(item => (
                        <div key={item.id} className="item-card">
                            <div className="item-header">
                                <h3 className="item-title">{item.title}</h3>
                                <button
                                    className={`fav-btn ${favorites.has(item.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(item.id)}
                                    title={favorites.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Heart fill={favorites.has(item.id) ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <p className="item-desc">{item.description || 'No description provided.'}</p>
                            <div className="item-footer">
                                <span className="item-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {nextCursor && (
                <div className="load-more-container">
                    <button
                        className="btn btn-secondary"
                        onClick={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
