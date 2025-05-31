import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '../utils/api';
import '../styles/recommendations.css';

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to view recommendations');
      navigate('/login');
      return () => {}; // Return empty cleanup function
    }

    let isMounted = true; // Track if component is still mounted

    const fetchRecommendations = async () => {
      // console.log('Fetching recommendations...');
      try {
        const token = localStorage.getItem('token');
        // console.log('Auth token:', token ? 'Token exists' : 'No token found');
        
        const response = await api.get('/recommendations/received', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // console.log('Recommendations API response:', response);
        
        if (response.data) {
          setRecommendations(response.data);
          // console.log('Recommendations data:', response.data);
          setError(null);
        } else {
          console.error('No data in response:', response);
          setError('No recommendations data received');
          toast.error('No recommendations found');
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Failed to load recommendations. Please try again later.');
        toast.error('Failed to load recommendations');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]); // Add navigate to dependency array

  // Extract unique properties from recommendations
  const recommendedProperties = Array.from(
    new Map(
      recommendations
        .filter(rec => rec.property) // Filter out any null/undefined properties
        .map(rec => [rec.property._id, {
          ...rec.property,
          recommendedBy: rec.fromUser,
          recommendationMessage: rec.message,
          recommendationDate: rec.createdAt
        }])
    ).values()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Settings for the image carousel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Function to render property images or placeholder
  const renderPropertyImages = (property) => {
    if (property.images && property.images.length > 0) {
      return (
        <Slider {...carouselSettings} className="rounded-t-lg overflow-hidden">
          {property.images.map((image, index) => (
            <div key={index} className="h-48 md:h-64 w-full">
              <img 
                src={image} 
                alt={`${property.title} - ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </Slider>
      );
    }
    return (
      <div className="h-48 md:h-64 w-full bg-gray-100 flex items-center justify-center">
        
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recommended Properties</h1>
          
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-red-800 hover:text-red-700 focus:outline-none"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : recommendedProperties.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-50">
              <Home className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No recommended properties yet</h3>
            <p className="mt-1 text-gray-500">Properties recommended to you will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map((property) => (
              <div key={property._id} className="property-card">
                {/* Property Image */}
                <div className="relative">
                  {renderPropertyImages(property)}
                  <div className="absolute top-3 left-3">
                    <span className={`listing-tag ${property.listingType === 'sale' ? 'sale' : 'rent'}`}>
                      {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="action-icon" aria-label="Add to favorites">
                      <span className="icon-heart">♥</span>
                    </button>
                    <button className="action-icon" aria-label="Share">
                      <span className="icon-share">↗</span>
                    </button>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="property-header">
                    <h3 className="property-title">{property.title}</h3>
                    <div className="property-price">
                      ₹{property.price?.toLocaleString() || 'Price not available'}
                    </div>
                    {property.pricePerUnit && (
                      <div className="text-sm text-gray-500">
                        ₹{property.pricePerUnit}/sq.ft
                      </div>
                    )}
                  </div>

                  <div className="property-location">
                    <span className="location-icon">📍</span>
                    <span>{property.locality || 'N/A'}, {property.city}, {property.state}</span>
                  </div>

                  <div className="property-details">
                    <div className="detail-item" data-label="Beds">{property.bedrooms || 'N/A'}</div>
                    <div className="detail-item" data-label="Baths">{property.bathrooms || 'N/A'}</div>
                    <div className="detail-item" data-label="Area">{property.areaSqFt ? `${property.areaSqFt} sq.ft` : 'N/A'}</div>
                  </div>

                  {property.recommendationMessage && (
                    <div className="recommendation-note">
                      <p>
                        <strong>Note from {property.recommendedBy?.name || 'user'}:</strong> {property.recommendationMessage}
                      </p>
                    </div>
                  )}

                  <div className="recommender-info">
                    <div className="recommender-avatar">
                      <img 
                        src={property.recommendedBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.recommendedBy?.name || 'User')}&background=random`}
                        alt={property.recommendedBy?.name || 'User'}
                      />
                      
                    </div>
                    {property.rating && (
                      <div className="rating">
                        <span className="star">★</span>
                        <span>{property.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <Link
                      to={`/properties/${property._id}`}
                      className="view-details-btn"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
