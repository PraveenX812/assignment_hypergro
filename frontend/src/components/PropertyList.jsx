import { Link } from 'react-router-dom';

const PropertyList = ({ properties, pagination, onPageChange }) => {
  return (
    <div className="space-y-6">
      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((property) => (
          <div key={property._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>
                <p className="text-gray-600">{property.type} • {property.city}, {property.state}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{property.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium">{property.areaSqFt} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-medium">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-medium">{property.bathrooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Furnished</p>
                <p className="font-medium">{property.furnished}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Amenities</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {property.amenities.map((amenity, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{property.rating}</span>
                {property.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <Link
                to={`/properties/${property._id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyList; 