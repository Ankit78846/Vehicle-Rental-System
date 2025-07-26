import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [responseData, setResponseData] = useState(null);
  
  useEffect(() => {
    const processEsewaResponse = () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        
        console.log('=== eSewa Payment Response Debug ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params string:', location.search);
        
        // Log all URL parameters
        const allParams = Object.fromEntries(searchParams.entries());
        console.log('All URL parameters:', allParams);
        
        // Check for different parameter formats
        const transactionId = searchParams.get('transactionId') || 
                             searchParams.get('transaction_uuid') || 
                             searchParams.get('oid');
        const status = searchParams.get('status');
        const amount = searchParams.get('amount') || searchParams.get('amt');
        const refId = searchParams.get('refId');
        
        console.log('Extracted parameters:');
        console.log('- Transaction ID:', transactionId);
        console.log('- Status:', status);
        console.log('- Amount:', amount);
        console.log('- Reference ID:', refId);
        
        // Check for base64 encoded data parameter
        const dataParam = searchParams.get('data');
        let decodedData = null;
        if (dataParam) {
          try {
            console.log('Base64 data parameter found:', dataParam);
            const decoded = atob(dataParam);
            console.log('Decoded data string:', decoded);
            decodedData = JSON.parse(decoded);
            console.log('Parsed eSewa data:', decodedData);
          } catch (decodeError) {
            console.error('Failed to decode data parameter:', decodeError.message);
          }
        }
        
        // Determine payment status
        const finalStatus = status || decodedData?.status || 'unknown';
        const isSuccess = finalStatus === 'success' || finalStatus === 'COMPLETE';
        
        console.log('Final payment status:', finalStatus);
        console.log('Is payment successful?', isSuccess);
        
        // Set response data for display
        const responseInfo = {
          urlParams: allParams,
          decodedData: decodedData,
          transactionId: transactionId || decodedData?.transaction_uuid,
          status: finalStatus,
          amount: amount || decodedData?.total_amount,
          refId: refId || decodedData?.transaction_code,
          isSuccess: isSuccess
        };
        
        console.log('Complete response info:', responseInfo);
        
        setResponseData(responseInfo);
        setPaymentStatus(isSuccess ? 'success' : 'failed');
        
      } catch (error) {
        console.error('Error processing eSewa response:', error);
        setPaymentStatus('error');
        setResponseData({ error: error.message });
      }
    };

    processEsewaResponse();
  }, [location.search]);

  // Auto redirect countdown
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const renderStatus = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-gray-600">Analyzing eSewa response...</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your transaction has been completed successfully.</p>
            <p className="text-sm text-blue-600">Redirecting to home in 5 seconds...</p>
          </div>
        );
      
      case 'failed':
        return (
          <div className="text-center">
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">There was an issue processing your payment.</p>
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <FaTimesCircle className="text-6xl text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Status Unknown</h1>
            <p className="text-gray-600 mb-4">Unable to determine payment status.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {renderStatus()}
        </div>

        {/* Response Data Display */}
        {responseData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">eSewa Response Data</h2>
            
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Transaction Info</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Transaction ID:</span> {responseData.transactionId || 'N/A'}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      responseData.isSuccess 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {responseData.status || 'Unknown'}
                    </span>
                  </div>
                  <div><span className="font-medium">Amount:</span> रु{responseData.amount || 'N/A'}</div>
                  <div><span className="font-medium">Reference ID:</span> {responseData.refId || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">URL Parameters</h3>
                <div className="text-sm">
                  {Object.keys(responseData.urlParams).length > 0 ? (
                    Object.entries(responseData.urlParams).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No URL parameters found</span>
                  )}
                </div>
              </div>
            </div>

            {/* Decoded Data (if exists) */}
            {responseData.decodedData && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Decoded eSewa Data</h3>
                <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto hide-scrollbar">
                  {JSON.stringify(responseData.decodedData, null, 2)}
                </pre>
              </div>
            )}

            {/* Raw Response (for debugging) */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Complete Response Object</h3>
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto hide-scrollbar">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
