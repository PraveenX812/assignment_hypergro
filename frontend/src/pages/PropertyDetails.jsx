import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/properties/${propertyId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch property details');
        return res.json();
      })
      .then(data => {
        setProperty(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [propertyId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red', margin: '2rem' }}>{error}</div>;
  if (!property) return <div style={{ margin: '2rem' }}>Property not found.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>{property.title}</h2>
      <div style={{ marginBottom: 8 }}><b>Location:</b> {property.city}, {property.state}</div>
      <div style={{ marginBottom: 8 }}><b>Price:</b> ₹{property.price}</div>
      <div style={{ marginBottom: 8 }}><b>Type:</b> {property.type}</div>
      <div style={{ marginBottom: 8 }}><b>Listing Type:</b> {property.listingType}</div>
      <div style={{ marginBottom: 8 }}><b>Furnished:</b> {property.furnished ? 'Yes' : 'No'}</div>
      <div style={{ marginBottom: 8 }}><b>Listed By:</b> {property.listedBy}</div>
      <div style={{ marginBottom: 8 }}><b>Area:</b> {property.areaSqFt} sqft</div>
      <div style={{ marginBottom: 8 }}><b>Bedrooms:</b> {property.bedrooms}</div>
      <div style={{ marginBottom: 8 }}><b>Bathrooms:</b> {property.bathrooms}</div>
      <div style={{ marginBottom: 8 }}><b>Verified:</b> {property.isVerified ? 'Yes' : 'No'}</div>
      <div style={{ marginBottom: 8 }}><b>Amenities:</b> {property.amenities && property.amenities.length ? property.amenities.join(', ') : 'None'}</div>
      <div style={{ marginBottom: 8 }}><b>Tags:</b> {property.tags && property.tags.length ? property.tags.join(', ') : 'None'}</div>
      <div style={{ marginBottom: 8 }}><b>Description:</b> {property.description || 'No description provided.'}</div>
      <div style={{ marginBottom: 8 }}><b>Owner:</b> {property.owner ? (property.owner.name || property.owner) : 'N/A'}</div>
      <div style={{ marginBottom: 8 }}><b>Color:</b> <span style={{ display: 'inline-block', width: 24, height: 24, background: property.colorTheme, border: '1px solid #ccc', borderRadius: 4, verticalAlign: 'middle', marginRight: 8 }}></span>{property.colorTheme || 'N/A'}</div>
    </div>
  );
};

export default PropertyDetails; 