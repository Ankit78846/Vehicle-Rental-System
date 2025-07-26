import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaTimesCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get error details from URL params
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Process error details
    const processErrorDetails = () => {
      let errorMessage = 'Payment failed';
      let errorDescription = 'An unexpected error occurred during payment processing.';
      let suggestions = ['Try again with a different payment method', 'Check your internet connection', 'Contact our support team'];

      switch (error) {
        case 'payment_cancelled':
          errorMessage = 'Payment Cancelled';
          errorDescription = 'You cancelled the payment process.';
          suggestions = ['Try again to complete your booking', 'Choose a different payment method', 'Contact support if you need help'];
          break;
        case 'verification_failed':
          errorMessage = 'Payment Verification Failed';
          errorDescription = 'We couldn\'t verify your payment with eSewa.';
          suggestions = ['Check your eSewa account for any deducted amount', 'Try the payment again', 'Contact eSewa support if amount was deducted'];
          break;
        case 'callback_error':
          errorMessage = 'Payment Processing Error';
          errorDescription = 'There was an error processing your payment callback.';
          suggestions = ['Try the payment again', 'Clear your browser cache', 'Contact our support team'];
          break;
        case 'insufficient_funds':
          errorMessage = 'Insufficient Funds';
          errorDescription = 'Your eSewa account doesn\'t have sufficient balance.';
          suggestions = ['Add money to your eSewa account', 'Try a different payment method', 'Check your account balance'];
          break;
        default:
          break;
      }

      setErrorDetails({
        message: errorMessage,
        description: errorDescription,
        suggestions: suggestions,
        transactionId: transactionId,
        timestamp: new Date().toLocaleString()
      });
      
      setLoading(false);
    };

    processErrorDetails();
  }, [error, transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Processing error details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton to="/" text="Back to Home" />
        </div>

        {/* Payment Failure Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorDetails?.message || 'Payment Failed'}
          </h1>
          <p className="text-gray-600 mb-6">
            {errorDetails?.description || 'We couldn\'t process your payment. Please try again.'}
          </p>

          {/* Error Details */}
          {errorDetails && (
            <div className="bg-red-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4 text-red-800">Error Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-red-600">Error Type</p>
                  <p className="font-medium text-red-800">{errorDetails.message}</p>
                </div>
                
                {errorDetails.transactionId && (
                  <div>
                    <p className="text-sm text-red-600">Transaction ID</p>
                    <p className="font-medium text-red-800">{errorDetails.transactionId}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-red-600">Time</p>
                  <p className="font-medium text-red-800">{errorDetails.timestamp}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {errorDetails?.suggestions && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center mb-3">
                <FaExclamationTriangle className="text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">What you can do:</h3>
              </div>
              <ul className="text-sm text-yellow-800 space-y-2">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Try Payment Again
            </button>
            
            <Link
              to="/vehicles"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Browse Other Vehicles
            </Link>
            
            <Link
              to="/contact"
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Why did my payment fail?</h3>
              <p className="text-sm text-gray-600">
                Payment failures can occur due to insufficient funds, network issues, or technical problems. 
                Check the specific error message above for more details.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Was money deducted from my account?</h3>
              <p className="text-sm text-gray-600">
                If payment verification failed, please check your eSewa account. 
                Any deducted amount will be automatically refunded within 3-5 business days.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I try a different payment method?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can go back and try with a different payment method like credit card, 
                PayPal, or other available options.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How do I get help?</h3>
              <p className="text-sm text-gray-600">
                Contact our support team at support@easywheels.com or call +977-9876543210. 
                Include your transaction ID for faster assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Immediate Help?</h3>
            <p className="text-blue-800 mb-4">Our support team is available 24/7 to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@easywheels.com" 
                className="text-blue-600 hover:underline font-medium"
              >
                📧 support@easywheels.com
              </a>
              <a 
                href="tel:+977-9876543210" 
                className="text-blue-600 hover:underline font-medium"
              >
                📞 +977-9876543210
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
