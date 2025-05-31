import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, []);

  const fetchFavorites = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your favorites.');
      setLoading(false);
      return;
    }
    fetch('/api/favorites', {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
      })
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleRemoveFavorite = async (propertyId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to remove favorites.');
      return;
    }
    try {
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove from favorites');
      }
      setFavorites(prev => prev.filter(p => p._id !== propertyId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red', margin: '2rem' }}>{error}</div>;
  if (!favorites.length) return <div style={{ margin: '2rem' }}>No favorite properties found.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>My Favorite Properties</h2>
      {favorites.map(property => (
        <div key={property._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 20, marginBottom: 20, position: 'relative', background: '#fff' }}>
          <span
            style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.5rem', color: '#FFD700', cursor: 'pointer' }}
            title="Remove from Favorites"
            onClick={() => handleRemoveFavorite(property._id)}
          >★</span>
          <h3 style={{ margin: 0 }}>{property.title}</h3>
          <p style={{ margin: '0.5rem 0' }}>{property.city}, {property.state}</p>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: 8 }}>
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.areaSqFt} sqft</span>
          </div>
          <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: 8 }}>₹{property.price}</div>
          <Link to={`/properties/${property._id}`} style={{ color: '#007bff', textDecoration: 'underline' }}>View Details</Link>
        </div>
      ))}
    </div>
  );
};

export default Favorites; 