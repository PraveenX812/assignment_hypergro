import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'];
const FURNISHED_OPTIONS = ['Furnished', 'Unfurnished', 'Semi'];
const LISTED_BY_OPTIONS = ['Owner', 'Agent', 'Builder'];

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your properties.');
      setLoading(false);
      return;
    }
    fetch('http://localhost:5000/api/properties/my-properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch your properties');
        return res.json();
      })
      .then(data => {
        setProperties(Array.isArray(data) ? data : (data.properties || []));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete property');
      }
      setProperties(prev => prev.filter(p => p._id !== propertyId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (property) => {
    setEditingId(property._id);
    setEditForm({ ...property, availableFrom: property.availableFrom ? property.availableFrom.slice(0, 10) : '' });
    setEditError('');
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'isVerified') {
      setEditForm(f => ({ ...f, isVerified: checked }));
    } else if (type === 'checkbox') {
      // For amenities and tags
      const arr = editForm[name];
      setEditForm(f => ({
        ...f,
        [name]: checked ? [...arr, value] : arr.filter(v => v !== value)
      }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    const token = localStorage.getItem('token');
    try {
      const allowed = [
        'title', 'type', 'price', 'state', 'city', 'areaSqFt',
        'bedrooms', 'bathrooms', 'amenities', 'furnished', 'availableFrom',
        'listedBy', 'tags', 'colorTheme', 'rating', 'isVerified', 'listingType'
      ];
      const filteredEditForm = Object.fromEntries(
        Object.entries(editForm).filter(([key]) => allowed.includes(key))
      );
      const response = await fetch(`http://localhost:5000/api/properties/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredEditForm)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update property');
      }
      const updated = await response.json();
      setProperties(prev => prev.map(p => p._id === editingId ? updated : p));
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red', margin: '2rem' }}>{error}</div>;
  if (!properties.length) return <div style={{ margin: '2rem' }}>You have not created any properties yet.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>My Created Properties</h2>
      {properties.map(property => (
        <div key={property._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 20, marginBottom: 20, position: 'relative', background: '#fff' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            <button
              style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
              onClick={() => handleEdit(property)}
            >Edit</button>
            <button
              style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
              onClick={() => handleDelete(property._id)}
            >Delete</button>
          </div>
          {editingId === property._id ? (
            <form onSubmit={handleEditSubmit} style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label>Title</label>
                <input className="form-input" name="title" value={editForm.title} onChange={handleEditChange} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea className="form-input" name="description" value={editForm.description} onChange={handleEditChange} rows={2} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input className="form-input" name="price" type="number" value={editForm.price} onChange={handleEditChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Area (sqft)</label>
                  <input className="form-input" name="areaSqFt" type="number" value={editForm.areaSqFt} onChange={handleEditChange} required style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Bedrooms</label>
                  <input className="form-input" name="bedrooms" type="number" value={editForm.bedrooms} onChange={handleEditChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Bathrooms</label>
                  <input className="form-input" name="bathrooms" type="number" value={editForm.bathrooms} onChange={handleEditChange} required style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>State</label>
                  <input className="form-input" name="state" value={editForm.state} onChange={handleEditChange} required style={{ width: '100%' }} placeholder="Enter State" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>City</label>
                  <input className="form-input" name="city" value={editForm.city} onChange={handleEditChange} required style={{ width: '100%' }} placeholder="Enter City" />
                </div>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <select className="form-input" name="type" value={editForm.type} onChange={handleEditChange} required style={{ width: '100%' }}>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Listing Type</label>
                  <select className="form-input" name="listingType" value={editForm.listingType} onChange={handleEditChange} required style={{ width: '100%' }}>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Furnished</label>
                  <select className="form-input" name="furnished" value={editForm.furnished} onChange={handleEditChange} required style={{ width: '100%' }}>
                    {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Listed By</label>
                  <select className="form-input" name="listedBy" value={editForm.listedBy} onChange={handleEditChange} required style={{ width: '100%' }}>
                    {LISTED_BY_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Available From</label>
                <input className="form-input" name="availableFrom" type="date" value={editForm.availableFrom} onChange={handleEditChange} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Amenities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['lift', 'clubhouse', 'security', 'gym', 'garden', 'pool', 'power-backup', 'wifi', 'parking'].map(a => (
                    <label key={a} style={{ marginRight: 12 }}>
                      <input type="checkbox" name="amenities" value={a} checked={editForm.amenities.includes(a)} onChange={handleEditChange} /> {a}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['gated-community', 'corner-plot', 'luxury', 'lake-view', 'affordable', 'family-friendly', 'near-metro', 'sea-view', 'pet-friendly'].map(t => (
                    <label key={t} style={{ marginRight: 12 }}>
                      <input type="checkbox" name="tags" value={t} checked={editForm.tags.includes(t)} onChange={handleEditChange} /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" name="isVerified" checked={editForm.isVerified} onChange={handleEditChange} style={{ accentColor: '#28a745', width: 18, height: 18 }} />
                  <span style={{
                    display: 'inline-block',
                    background: editForm.isVerified ? '#28a745' : '#eee',
                    color: editForm.isVerified ? 'white' : '#333',
                    borderRadius: 12,
                    padding: '2px 12px',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'background 0.2s, color 0.2s'
                  }}>{editForm.isVerified ? 'Verified' : 'Not Verified'}</span>
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Color Theme</label>
                <input
                  className="form-input"
                  name="colorTheme"
                  type="color"
                  value={editForm.colorTheme || '#ffffff'}
                  onChange={handleEditChange}
                  style={{ width: 50, height: 32, padding: 0, border: 'none', background: 'none' }}
                />
              </div>
              {editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
              <button className="btn btn-primary" type="submit" disabled={editLoading} style={{ width: '100%', padding: 10, fontSize: 16 }}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} style={{ width: '100%', marginTop: 8, padding: 10, fontSize: 16, background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            </form>
          ) : (
            <>
              <h3 style={{ margin: 0 }}>{property.title}</h3>
              <p style={{ margin: '0.5rem 0' }}>{property.city}, {property.state}</p>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: 8 }}>
                <span>{property.bedrooms} Beds</span>
                <span>{property.bathrooms} Baths</span>
                <span>{property.areaSqFt} sqft</span>
              </div>
              <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: 8 }}>₹{property.price}</div>
              <Link to={`/properties/${property._id}`} style={{ color: '#007bff', textDecoration: 'underline' }}>View Details</Link>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyProperties; 