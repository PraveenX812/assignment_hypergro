import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATES = [
  'Tamil Nadu', 'Karnataka', 'West Bengal', 'Gujarat', 'Delhi', 'Maharashtra'
];
const CITIES = [
  'Coimbatore', 'Mysore', 'Kolkata', 'Ahmedabad', 'Bangalore', 'New Delhi',
  'Chennai', 'Siliguri', 'Mumbai', 'Nagpur', 'Vadodara', 'Mangalore', 'Pune', 'Surat', 'Madurai'
];
const AMENITIES = ['lift', 'clubhouse', 'security', 'gym', 'garden', 'pool', 'power-backup', 'wifi', 'parking'];
const TAGS = ['gated-community', 'corner-plot', 'luxury', 'lake-view', 'affordable', 'family-friendly', 'near-metro', 'sea-view', 'pet-friendly'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'];
const FURNISHED_OPTIONS = ['Furnished', 'Unfurnished', 'Semi'];
const LISTED_BY_OPTIONS = ['Owner', 'Agent', 'Builder'];

const AddProperty = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'Apartment',
    listingType: 'sale',
    furnished: 'Furnished',
    listedBy: 'Owner',
    areaSqFt: '',
    bedrooms: '',
    bathrooms: '',
    state: '',
    city: '',
    amenities: [],
    tags: [],
    isVerified: false,
    availableFrom: '',
    colorTheme: '#ffffff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'isVerified') {
      setForm(f => ({ ...f, isVerified: checked }));
    } else if (type === 'checkbox') {
      // For amenities and tags
      const arr = form[name];
      setForm(f => ({
        ...f,
        [name]: checked ? [...arr, value] : arr.filter(v => v !== value)
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to add a property.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add property');
      }
      setSuccess('Property added successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 24 }}>Add New Property</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Title</label>
          <input className="form-input" name="title" value={form.title} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Description</label>
          <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Price (₹)</label>
            <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Area (sqft)</label>
            <input className="form-input" name="areaSqFt" type="number" value={form.areaSqFt} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Bedrooms</label>
            <input className="form-input" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Bathrooms</label>
            <input className="form-input" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>State</label>
            <input className="form-input" name="state" value={form.state} onChange={handleChange} required style={{ width: '100%' }} placeholder="Enter State" />
          </div>
          <div style={{ flex: 1 }}>
            <label>City</label>
            <input className="form-input" name="city" value={form.city} onChange={handleChange} required style={{ width: '100%' }} placeholder="Enter City" />
          </div>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Type</label>
            <select className="form-input" name="type" value={form.type} onChange={handleChange} required style={{ width: '100%' }}>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Listing Type</label>
            <select className="form-input" name="listingType" value={form.listingType} onChange={handleChange} required style={{ width: '100%' }}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Furnished</label>
            <select className="form-input" name="furnished" value={form.furnished} onChange={handleChange} required style={{ width: '100%' }}>
              {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Listed By</label>
            <select className="form-input" name="listedBy" value={form.listedBy} onChange={handleChange} required style={{ width: '100%' }}>
              {LISTED_BY_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Available From</label>
          <input className="form-input" name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AMENITIES.map(a => (
              <label key={a} style={{ marginRight: 12 }}>
                <input type="checkbox" name="amenities" value={a} checked={form.amenities.includes(a)} onChange={handleChange} /> {a}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS.map(t => (
              <label key={t} style={{ marginRight: 12 }}>
                <input type="checkbox" name="tags" value={t} checked={form.tags.includes(t)} onChange={handleChange} /> {t}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input type="checkbox" name="isVerified" checked={form.isVerified} onChange={handleChange} /> Verified
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Color Theme</label>
          <input
            className="form-input"
            name="colorTheme"
            type="color"
            value={form.colorTheme || '#ffffff'}
            onChange={handleChange}
            style={{ width: 50, height: 32, padding: 0, border: 'none', background: 'none' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 18 }}>
          {loading ? 'Adding...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
};

export default AddProperty; 