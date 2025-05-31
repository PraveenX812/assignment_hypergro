import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Favorites from './pages/Favorites';
import Recommendations from './pages/Recommendations';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import MyProperties from './pages/MyProperties';
import RecommendationsDropdown from './components/RecommendationsDropdown';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];
const CITIES = [
  "Coimbatore",
  "Mysore",
  "Kolkata",
  "Ahmedabad",
  "Bangalore",
  "New Delhi",
  "Chennai",
  "Siliguri",
  "Mumbai",
  "Nagpur",
  "Vadodara",
  "Mangalore",
  "Pune",
  "Surat",
  "Madurai"
];
// Unique amenities and tags from data.csv
const AMENITIES = ["lift", "clubhouse", "security", "gym", "garden", "pool", "power-backup", "wifi", "parking"];
const TAGS = ["gated-community", "corner-plot", "luxury", "lake-view", "affordable", "family-friendly", "near-metro", "sea-view", "pet-friendly"];

function PropertyListingPage({
  filters, setFilters, appliedFilters, setAppliedFilters, properties, setProperties, loading, setLoading, page, setPage, pagination, setPagination, handleAmenityToggle, handleTagToggle, handleApplyFilters,
  favoriteIds, handleToggleFavorite
}) {
  // Use the props to avoid lint warnings
  console.log({appliedFilters, setAppliedFilters, setProperties, setLoading, setPagination});
  return (
    <div className="main-layout">
      {/* Filters Sidebar */}
      <aside className="filters-sidebar">
        {/* State Input */}
        <div className="filter-section">
          <h3 className="filter-title">State</h3>
          <input
            className="form-input"
            placeholder="Enter State"
            value={filters.state}
            onChange={e => setFilters({...filters, state: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>
        {/* City Input */}
        <div className="filter-section">
          <h3 className="filter-title">City</h3>
          <input
            className="form-input"
            placeholder="Enter City"
            value={filters.city}
            onChange={e => setFilters({...filters, city: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>
        {/* Area Slider */}
        <div className="filter-section">
          <h3 className="filter-title">Area (sqft)</h3>
          <div className="price-range">
            <input
              type="number"
              className="form-input price-input"
              placeholder="Min"
              value={filters.areaRange[0]}
              onChange={e => setFilters({...filters, areaRange: [e.target.value, filters.areaRange[1]]})}
            />
            <span>-</span>
            <input
              type="number"
              className="form-input price-input"
              placeholder="Max"
              value={filters.areaRange[1]}
              onChange={e => setFilters({...filters, areaRange: [filters.areaRange[0], e.target.value]})}
            />
          </div>
        </div>
        {/* Amenities */}
        <div className="filter-section">
          <h3 className="filter-title">Amenities</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {AMENITIES.map(amenity => (
              <button
                key={amenity}
                type="button"
                className={filters.amenities.includes(amenity) ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => handleAmenityToggle(amenity)}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
        {/* Tags */}
        <div className="filter-section">
          <h3 className="filter-title">Tags</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={filters.tags.includes(tag) ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        {/* Is Verified */}
        <div className="filter-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.isVerified}
              onChange={e => setFilters({...filters, isVerified: e.target.checked})}
              style={{marginRight: '0.5rem'}}
            />
            Verified Only
          </label>
        </div>
        {/* Existing filters (price, type, etc.) go here... */}
        <div className="filter-section">
          <h3 className="filter-title">Price Range</h3>
          <div className="price-range">
            <input
              type="number"
              className="form-input price-input"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => setFilters({...filters, priceRange: [e.target.value, filters.priceRange[1]]})}
            />
            <span>-</span>
            <input
              type="number"
              className="form-input price-input"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], e.target.value]})}
            />
          </div>
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Property Type</h3>
          <div className="checkbox-group">
            <input type="radio" id="all" name="propertyType" value="all" checked={filters.propertyType === 'all'} onChange={(e) => setFilters({...filters, propertyType: e.target.value})} />
            <label htmlFor="all" className="checkbox-label">All</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="apartment" name="propertyType" value="apartment" checked={filters.propertyType === 'apartment'} onChange={(e) => setFilters({...filters, propertyType: e.target.value})} />
            <label htmlFor="apartment" className="checkbox-label">Apartment</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="house" name="propertyType" value="house" checked={filters.propertyType === 'house'} onChange={(e) => setFilters({...filters, propertyType: e.target.value})} />
            <label htmlFor="house" className="checkbox-label">House</label>
          </div>
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Furnished</h3>
          <div className="checkbox-group">
            <input type="radio" id="furnished-all" name="furnished" value="all" checked={filters.furnished === 'all'} onChange={(e) => setFilters({...filters, furnished: e.target.value})} />
            <label htmlFor="furnished-all" className="checkbox-label">All</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="furnished-yes" name="furnished" value="yes" checked={filters.furnished === 'yes'} onChange={(e) => setFilters({...filters, furnished: e.target.value})} />
            <label htmlFor="furnished-yes" className="checkbox-label">Furnished</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="furnished-no" name="furnished" value="no" checked={filters.furnished === 'no'} onChange={(e) => setFilters({...filters, furnished: e.target.value})} />
            <label htmlFor="furnished-no" className="checkbox-label">Unfurnished</label>
          </div>
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Listed By</h3>
          <div className="checkbox-group">
            <input type="radio" id="listedBy-all" name="listedBy" value="all" checked={filters.listedBy === 'all'} onChange={(e) => setFilters({...filters, listedBy: e.target.value})} />
            <label htmlFor="listedBy-all" className="checkbox-label">All</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="listedBy-owner" name="listedBy" value="owner" checked={filters.listedBy === 'owner'} onChange={(e) => setFilters({...filters, listedBy: e.target.value})} />
            <label htmlFor="listedBy-owner" className="checkbox-label">Owner</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="listedBy-agent" name="listedBy" value="agent" checked={filters.listedBy === 'agent'} onChange={(e) => setFilters({...filters, listedBy: e.target.value})} />
            <label htmlFor="listedBy-agent" className="checkbox-label">Agent</label>
          </div>
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Listing Type</h3>
          <div className="checkbox-group">
            <input type="radio" id="listingType-all" name="listingType" value="all" checked={filters.listingType === 'all'} onChange={(e) => setFilters({...filters, listingType: e.target.value})} />
            <label htmlFor="listingType-all" className="checkbox-label">All</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="listingType-rent" name="listingType" value="rent" checked={filters.listingType === 'rent'} onChange={(e) => setFilters({...filters, listingType: e.target.value})} />
            <label htmlFor="listingType-rent" className="checkbox-label">Rent</label>
          </div>
          <div className="checkbox-group">
            <input type="radio" id="listingType-sale" name="listingType" value="sale" checked={filters.listingType === 'sale'} onChange={(e) => setFilters({...filters, listingType: e.target.value})} />
            <label htmlFor="listingType-sale" className="checkbox-label">Sale</label>
          </div>
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Beds</h3>
          <input type="number" className="form-input" min="0" placeholder="Any" value={filters.beds || ''} onChange={e => setFilters({...filters, beds: e.target.value})} />
        </div>
        <div className="filter-section">
          <h3 className="filter-title">Baths</h3>
          <input type="number" className="form-input" min="0" placeholder="Any" value={filters.baths || ''} onChange={e => setFilters({...filters, baths: e.target.value})} />
        </div>
        <button className="btn btn-primary mt-2 w-full" onClick={handleApplyFilters}>Apply Filters</button>
      </aside>
      {/* Property List */}
      <div className="property-list">
        {loading ? (
          <div>Loading...</div>
        ) : properties.length === 0 ? (
          <div>No properties found.</div>
        ) : (
          <>
            {properties.map(property => (
              <div key={property._id || property.id} className="property-item" style={{ position: 'relative' }}>
                <span
                  onClick={() => handleToggleFavorite(property)}
                  style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.5rem', color: '#FFD700', cursor: 'pointer', userSelect: 'none' }}
                  title={favoriteIds.includes(property._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  {favoriteIds.includes(property._id) ? '★' : '☆'}
                </span>
                <div className="property-info">
                  <h2 className="property-title">{property.title}</h2>
                  <p className="property-location">{property.city}, {property.state}</p>
                  <div className="property-details">
                    <span className="property-detail">{property.bedrooms} Beds</span>
                    <span className="property-detail">{property.bathrooms} Baths</span>
                    <span className="property-detail">{property.areaSqFt} sqft</span>
                  </div>
                </div>
                <div className="property-price">
                  ₹{property.price}
                </div>
                <Link to={`/properties/${property._id}`} style={{ color: '#007bff', textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>View Details</Link>
      </div>
            ))}
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button
                className="btn btn-outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
              >
                Next
        </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const [filters, setFilters] = useState({
    priceRange: ['', ''],
    propertyType: 'all',
    furnished: 'all',
    listedBy: 'all',
    listingType: 'all',
    beds: '',
    baths: '',
    areaRange: ['', ''],
    state: '',
    city: '',
    amenities: [],
    tags: [],
    isVerified: false
  })
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and set username
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Fetch user profile to get username
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUsername(data.name);
        })
        .catch(err => {
          console.error('Error fetching user profile:', err);
        });
      // Fetch user's favorite property IDs
      fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setFavoriteIds(data.favorites ? data.favorites.map(fav => fav.property._id) : []);
        })
        .catch(error => {
          console.error('Error fetching favorites:', error);
          setFavoriteIds([]);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
      };
    });
  };
  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1); // Reset to first page on filter apply
  };

  const handleToggleFavorite = async (property) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add favorites');
      return;
    }
    const isFav = favoriteIds.includes(property._id);
    try {
      const response = await fetch(`/api/favorites/${property._id}`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        ...(isFav ? {} : { body: JSON.stringify({ propertyId: property._id }) })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update favorites');
      }
      setFavoriteIds(prev =>
        isFav ? prev.filter(id => id !== property._id) : [...prev, property._id]
      );
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Build query params
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 20);
    if (appliedFilters.propertyType !== 'all') params.append('type', appliedFilters.propertyType);
    if (appliedFilters.state) params.append('state', appliedFilters.state);
    if (appliedFilters.city) params.append('city', appliedFilters.city);
    if (appliedFilters.listingType !== 'all') params.append('listingType', appliedFilters.listingType);
    if (appliedFilters.furnished !== 'all') params.append('furnished', appliedFilters.furnished);
    if (appliedFilters.listedBy !== 'all') params.append('listedBy', appliedFilters.listedBy);
    if (appliedFilters.isVerified) params.append('isVerified', 'true');
    if (appliedFilters.priceRange[0]) params.append('minPrice', appliedFilters.priceRange[0]);
    if (appliedFilters.priceRange[1]) params.append('maxPrice', appliedFilters.priceRange[1]);
    if (appliedFilters.areaRange[0]) params.append('minArea', appliedFilters.areaRange[0]);
    if (appliedFilters.areaRange[1]) params.append('maxArea', appliedFilters.areaRange[1]);
    if (appliedFilters.beds) params.append('bedrooms', appliedFilters.beds);
    if (appliedFilters.baths) params.append('bathrooms', appliedFilters.baths);
    if (appliedFilters.amenities.length > 0) params.append('amenities', appliedFilters.amenities.join(','));
    if (appliedFilters.tags.length > 0) params.append('tags', appliedFilters.tags.join(','));

    fetch(`/api/properties?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
        setLoading(false);
      });
  }, [appliedFilters, page]);

  return (
    <div>
      <header className="header">
        <nav className="nav container">
          <Link to="/" className="nav-brand">PropertyListings</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            {/* <Link to="/properties" className="nav-link">Properties</Link> */}
            {isLoggedIn ? (
                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                  <RecommendationsDropdown />
                  <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                    <button 
                      className="dropbtn" 
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const dropdown = e.currentTarget.nextElementSibling;
                        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                      }}
                    >
                      {username}
                    </button>
                    <div 
                      className="dropdown-content" 
                      style={{ 
                        display: 'none', 
                        position: 'absolute', 
                        right: 0,
                        backgroundColor: '#f9f9f9', 
                        minWidth: '200px', 
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)', 
                        zIndex: 1,
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link 
                        to="/add-property" 
                        className="dropdown-item" 
                        style={{ 
                          color: 'black', 
                          padding: '10px 16px', 
                          textDecoration: 'none', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <i className="bi bi-plus-circle"></i> Add Property
                      </Link>
                      <Link 
                        to="/my-properties" 
                        className="dropdown-item"
                        style={{ 
                          color: 'black', 
                          padding: '10px 16px', 
                          textDecoration: 'none', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <i className="bi bi-house"></i> My Properties
                      </Link>
                      <Link 
                        to="/favorites" 
                        className="dropdown-item"
                        style={{ 
                          color: 'black', 
                          padding: '10px 16px', 
                          textDecoration: 'none', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <i className="bi bi-heart"></i> Favorites
                      </Link>
                      <Link 
                        to="/recommendations" 
                        className="dropdown-item"
                        style={{ 
                          color: 'black', 
                          padding: '10px 16px', 
                          textDecoration: 'none', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <i className="bi bi-envelope"></i> Recommendations
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        style={{ 
                          color: 'black', 
                          padding: '10px 16px', 
                          textDecoration: 'none', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%', 
                          textAlign: 'left', 
                          border: 'none', 
                          background: 'none', 
                          cursor: 'pointer',
                          borderTop: '1px solid #eee',
                          paddingTop: '10px',
                          paddingBottom: '10px'
                        }}
                      >
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </div>
                  </div>
                </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/properties/:propertyId" element={<PropertyDetails />} />
          <Route path="/" element={
            <PropertyListingPage
              filters={filters}
              setFilters={setFilters}
              appliedFilters={appliedFilters}
              setAppliedFilters={setAppliedFilters}
              properties={properties}
              setProperties={setProperties}
              loading={loading}
              setLoading={setLoading}
              page={page}
              setPage={setPage}
              pagination={pagination}
              setPagination={setPagination}
              handleAmenityToggle={handleAmenityToggle}
              handleTagToggle={handleTagToggle}
              handleApplyFilters={handleApplyFilters}
              favoriteIds={favoriteIds}
              handleToggleFavorite={handleToggleFavorite}
            />
          } />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Router>
        <AppContent />
      </Router>
    </>
  )
}

export default App
