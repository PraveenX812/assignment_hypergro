import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const RecommendPropertyDialog = ({ propertyId, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // console.log('Searching for users with query:', searchQuery);
        const response = await api.get(
          `/recommendations/search-users?query=${encodeURIComponent(searchQuery)}`,
          {
            validateStatus: (status) => status < 500 // Don't throw for 4xx errors
          }
        );
        
        // console.log('Search response:', response);
        
        if (response.status === 200) {
          setSearchResults(response.data);
        } else {
          console.error('Search API error:', response.data);
          toast.error(response.data?.error || 'Failed to search users');
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        toast.error(error.response?.data?.error || 'Failed to search users. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.email);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!selectedUser || !selectedUser.email) {
      toast.error('Please select a valid user');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      await api.post(
        '/recommendations',
        {
          propertyId,
          toEmail: selectedUser.email,
          message: message || undefined
        },
        {
          validateStatus: (status) => status >= 200 && status < 300
        }
      );
      
      toast.success('Property recommended successfully!');
      // Reset form
      setSearchQuery('');
      setMessage('');
      setSelectedUser(null);
      setSearchResults([]);
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error recommending property:', error);
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to recommend property. Please try again.';
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        opacity: 0,
        animation: 'fadeIn 0.2s ease-in-out forwards'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '500px',
          width: '100%',
          margin: 'auto',
          pointerEvents: 'none',
          transform: 'translateY(-20px)',
          animation: 'slideIn 0.2s ease-out forwards'
        }}
      >
        <div 
          className="modal-content" 
          style={{ 
            pointerEvents: 'auto',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div className="modal-header" style={{ 
            borderBottom: '1px solid #e9ecef',
            padding: '1rem 1.5rem',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h5 className="modal-title" style={{ 
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '500',
              color: '#212529'
            }}>
              Recommend Property
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              style={{
                margin: 0,
                padding: '0.5rem',
                backgroundSize: '0.75rem',
                opacity: isSubmitting ? '0.5' : '1'
              }}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div className="mb-3">
                <label 
                  htmlFor="email" 
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#495057'
                  }}
                >
                  User's Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedUser && e.target.value !== selectedUser.email) {
                        setSelectedUser(null);
                      }
                    }}
                    placeholder="Search by email or name"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      color: '#495057',
                      backgroundColor: '#fff',
                      border: '1px solid #ced4da',
                      borderRadius: '0.25rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                  />
                </div>
                {isSearching && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <div 
                      className="spinner-border spinner-border-sm" 
                      role="status"
                      style={{
                        width: '1rem',
                        height: '1rem',
                        borderWidth: '0.15em'
                      }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {searchResults.length > 0 && searchQuery && !selectedUser && (
                  <div 
                    className="list-group mt-1" 
                    style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem',
                      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {searchResults.map(user => (
                      <button
                        key={user._id}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleUserSelect(user)}
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease-in-out'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <div style={{ fontWeight: '500' }}>{user.name}</div>
                        <small style={{ color: '#6c757d' }}>{user.email}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-3" style={{ marginTop: '1.5rem' }}>
                <label 
                  htmlFor="message" 
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#495057'
                  }}
                >
                  Message (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    color: '#495057',
                    backgroundColor: '#fff',
                    border: '1px solid #ced4da',
                    borderRadius: '0.25rem',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                ></textarea>
              </div>
            </div>
            <div 
              className="modal-footer" 
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '1rem 1.5rem',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                gap: '0.75rem'
              }}
            >
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  color: '#212529',
                  backgroundColor: '#e9ecef',
                  border: '1px solid #ced4da',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                  opacity: isSubmitting ? '0.65' : '1'
                }}
                onMouseOver={e => !isSubmitting && (e.currentTarget.style.backgroundColor = '#dde0e3')}
                onMouseOut={e => !isSubmitting && (e.currentTarget.style.backgroundColor = '#e9ecef')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!selectedUser || isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  color: '#fff',
                  backgroundColor: !selectedUser || isSubmitting ? '#86b7fe' : '#0d6efd',
                  border: '1px solid #0d6efd',
                  borderRadius: '0.25rem',
                  cursor: selectedUser && !isSubmitting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease-in-out',
                  opacity: !selectedUser || isSubmitting ? '0.65' : '1'
                }}
                onMouseOver={e => selectedUser && !isSubmitting && (e.currentTarget.style.backgroundColor = '#0b5ed7')}
                onMouseOut={e => selectedUser && !isSubmitting && (e.currentTarget.style.backgroundColor = '#0d6efd')}
              >
                {isSubmitting ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-1" 
                      role="status" 
                      aria-hidden="true"
                      style={{
                        width: '1rem',
                        height: '1rem',
                        borderWidth: '0.15em'
                      }}
                    ></span>
                    Sending...
                  </>
                ) : 'Send Recommendation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecommendPropertyDialog;
