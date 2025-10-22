import React from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Page Heading */}
      <h2 className="text-2xl font-bold mb-4">
        {searchTerm ? (
          <>
            Search Results for:{' '}
            <span className="text-green-600">"{searchTerm}"</span>
          </>
        ) : (
          'Search Results'
        )}
      </h2>

      {/* Results or Empty State */}
      {searchTerm ? (
        <div>
          {/* Placeholder for product grid */}
          <p className="text-gray-600 mb-6">
            Displaying results for "{searchTerm}"...
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Example product card */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
              >
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                <h3 className="text-lg font-semibold">Product {item}</h3>
                <p className="text-gray-500 text-sm">Product description...</p>
                <p className="mt-2 font-bold text-green-600">$19.99</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No search term provided. Try searching for something!
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
