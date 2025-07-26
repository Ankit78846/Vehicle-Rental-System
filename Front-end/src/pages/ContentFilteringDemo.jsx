import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilter, FaChartBar, FaHeart, FaEye, FaSearch, FaBrain } from 'react-icons/fa';

const ContentFilteringDemo = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚗 Content-Based Filtering System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience intelligent vehicle recommendations and advanced filtering powered by machine learning and user behavior analysis.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Advanced Filtering */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaFilter className="text-3xl text-blue-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Advanced Filtering</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Filter vehicles by type, brand, fuel type, transmission, price range, capacity, location, and specific features.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Multi-criteria search</li>
              <li>• Real-time filtering</li>
              <li>• Dynamic price ranges</li>
              <li>• Feature-based search</li>
            </ul>
            <Link 
              to="/vehicles" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Advanced Search
            </Link>
          </div>

          {/* Smart Recommendations */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaBrain className="text-3xl text-green-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Smart Recommendations</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get personalized vehicle suggestions based on content similarity and user behavior patterns.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Content-based filtering</li>
              <li>• Similarity scoring</li>
              <li>• Popularity weighting</li>
              <li>• Feature matching</li>
            </ul>
            <Link 
              to="/vehicles/car" 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              View Recommendations
            </Link>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaChartBar className="text-3xl text-purple-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Analytics Dashboard</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor user behavior, popular vehicles, and content filtering performance with detailed analytics.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Click tracking</li>
              <li>• Popular vehicles</li>
              <li>• Category distribution</li>
              <li>• Real-time insights</li>
            </ul>
            <div className="inline-block bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed">
              Admin Access Required
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How Content-Based Filtering Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-2xl text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">1. User Search</h4>
              <p className="text-sm text-gray-600">User searches or views a vehicle</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBrain className="text-2xl text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">2. Content Analysis</h4>
              <p className="text-sm text-gray-600">System analyzes vehicle features, type, brand, etc.</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEye className="text-2xl text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Similarity Scoring</h4>
              <p className="text-sm text-gray-600">Calculates similarity scores with other vehicles</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-2xl text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">4. Smart Recommendations</h4>
              <p className="text-sm text-gray-600">Displays personalized recommendations</p>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Filtering Features</h2>
          
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Feature</th>
                  <th className="px-4 py-3 text-center">Basic Search</th>
                  <th className="px-4 py-3 text-center">Content-Based Filtering</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium">Vehicle Type Filtering</td>
                  <td className="px-4 py-3 text-center">✅</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-3 font-medium">Multi-Criteria Filtering</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium">Feature-Based Search</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-3 font-medium">Similarity Recommendations</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium">Popularity-Based Sorting</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-3 font-medium">User Behavior Tracking</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium">Dynamic Price Ranges</td>
                  <td className="px-4 py-3 text-center">❌</td>
                  <td className="px-4 py-3 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience Smart Vehicle Search?</h2>
          <p className="text-blue-100 mb-6">
            Try our advanced content-based filtering system and discover vehicles that match your exact preferences.
          </p>
          <div className="space-x-4">
            <Link 
              to="/vehicles" 
              className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Smart Search
            </Link>
            <Link 
              to="/" 
              className="inline-block border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentFilteringDemo;
