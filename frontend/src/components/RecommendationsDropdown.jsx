import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecommendationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/recommendations/received', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendations(response.data);
        
        // Count unread recommendations
        const unread = response.data.filter(rec => !rec.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/recommendations/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec._id === id ? { ...rec, read: true } : rec
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="dropdown">
      <button 
        className="btn btn-link nav-link position-relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu show" style={{ width: '300px', right: 0, left: 'auto' }}>
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Recommendations</h6>
            <button 
              className="btn btn-sm btn-link p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="dropdown-divider"></div>
          
          {loading ? (
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center p-3 text-muted">
              No recommendations yet
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recommendations.map(rec => (
                <div 
                  key={rec._id} 
                  className={`dropdown-item ${!rec.read ? 'bg-light' : ''}`}
                  onClick={() => markAsRead(rec._id)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">New Recommendation</h6>
                    <small className="text-muted">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="mb-1">
                    <Link 
                      to={`/property/${rec.property._id}`}
                      className="text-decoration-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {rec.property.title}
                    </Link>
                    {' '}from {rec.fromUser.name}
                  </p>
                  {rec.message && (
                    <div className="small text-muted">
                      "{rec.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {recommendations.length > 0 && (
            <div className="dropdown-divider"></div>
          )}
          <div className="text-center p-2">
            <Link 
              to="/recommendations" 
              className="btn btn-sm btn-outline-primary w-100"
              onClick={() => setIsOpen(false)}
            >
              View All Recommendations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsDropdown;
