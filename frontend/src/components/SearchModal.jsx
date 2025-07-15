import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark, faUser, faCalendar, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    lastName: '',
    joinedAfter: '',
    joinedBefore: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);


  // Get current user ID on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user._id);
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if server is reachable
      console.log('API base URL:', api.defaults.baseURL);
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          params.append(key, searchParams[key]);
        }
      });

      console.log('Searching with params:', params.toString());
      console.log('Search URL:', `/users/search?${params.toString()}`);
      
      const response = await api.get(`/users/search?${params.toString()}`);
      console.log('Search response:', response.data);
      
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error response:', err.response);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the server is running.');
      } else if (err.response?.status === 404) {
        setError('Search endpoint not found. Please check server configuration.');
      } else {
        setError('Error searching users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-search for firstName field only
    if (field === 'firstName') {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for auto-search
      const timeout = setTimeout(() => {
        if (value.trim()) {
          handleSearch();
        } else {
          setUsers([]);
        }
      }, 300); // 300ms delay

      setSearchTimeout(timeout);
    }
  };

  const handleAutoSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for auto-search
      const params = new URLSearchParams();
      
      // For the main search input, search in both firstName and lastName fields
      if (searchParams.firstName && searchParams.firstName.trim() !== '') {
        // This is a general search - search in both fields
        params.append('firstName', searchParams.firstName);
        params.append('lastName', searchParams.firstName);
      }

      // Add date filters
      if (searchParams.joinedAfter && searchParams.joinedAfter.trim() !== '') {
        params.append('joinedAfter', searchParams.joinedAfter);
      }
      if (searchParams.joinedBefore && searchParams.joinedBefore.trim() !== '') {
        params.append('joinedBefore', searchParams.joinedBefore);
      }

      // Only search if we have at least one search term
      if (params.toString()) {
        const response = await api.get(`/users/search?${params.toString()}`);
        const foundUsers = response.data.users || [];
        setUsers(foundUsers);
        
        // If no users found, show appropriate message
        if (foundUsers.length === 0) {
          setError('No users found');
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError('Error searching users');
      console.error('Auto-search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      firstName: '',
      lastName: '',
      joinedAfter: '',
      joinedBefore: ''
    });
    setUsers([]);
    
    // Clear any pending search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Clear timeout and search immediately
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      handleSearch();
    }
  };

  const handleViewProfile = (userId) => {
    // Close the modal first
    onClose();
    // Navigate to the user's profile
    navigate(`/profile/${userId}`);
  };

  const handleAddFriend = async (userId, userName) => {
    try {
      console.log('Sending friend request to:', userName);
      console.log('User ID:', userId);
      console.log('Current user ID:', currentUserId);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - user not logged in');
        alert('You must be logged in to send friend requests');
        return;
      }
      
      const response = await api.post(`/users/${userId}/friend-request`);
      console.log('Friend request response:', response);
      console.log('Friend request sent successfully!');
      alert(`Friend request sent to ${userName}!`);
    } catch (err) {
      console.error('Error sending friend request:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        alert('You must be logged in to send friend requests');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data?.errors?.message;
        alert(errorMessage || 'Error sending friend request');
      } else {
        alert('Error sending friend request. Please try again.');
      }
    }
  };











  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Search Users</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6">
          {/* Basic Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search by name (first or last)..."
                  value={searchParams.firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchParams(prev => ({
                      ...prev,
                      firstName: value
                    }));

                    // Auto-search
                    if (searchTimeout) {
                      clearTimeout(searchTimeout);
                    }

                    const timeout = setTimeout(() => {
                      if (value.trim()) {
                        handleSearch();
                      } else {
                        setUsers([]);
                      }
                    }, 300);

                    setSearchTimeout(timeout);
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Joined After */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Joined After
                  </label>
                  <input
                    type="date"
                    value={searchParams.joinedAfter}
                    onChange={(e) => handleInputChange('joinedAfter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Joined Before */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Joined Before
                  </label>
                  <input
                    type="date"
                    value={searchParams.joinedBefore}
                    onChange={(e) => handleInputChange('joinedBefore', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}



          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {users.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Found {users.length} user(s)
                </h3>
                {users.map((user) => (
                  <div key={user._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mr-4">
                      {user.profile.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt={user.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{user.displayName}</h4>
                      {user.profile.address && (
                        <p className="text-sm text-gray-600">
                          <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                          {user.profile.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      <button 
                        onClick={() => handleViewProfile(user._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Profile
                      </button>
                      {user._id !== currentUserId && (
                        <button 
                          onClick={() => handleAddFriend(user._id, user.displayName)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  <FontAwesomeIcon icon={faSearch} size="2x" className="mb-4 text-gray-300" />
                  <p>No users found. Try adjusting your search criteria.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;