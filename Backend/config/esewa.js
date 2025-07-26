// eSewa Payment Gateway Configuration
// v2.0 API Configuration as per official documentation

module.exports = {
  // eSewa Environment Configuration
  environment: process.env.ESEWA_ENVIRONMENT || 'test', // 'test' or 'production'
  
  // Test Environment URLs (for development)
  test: {
    paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    verificationUrl: 'https://rc-epay.esewa.com.np/api/epay/transaction/status/',
    merchantCode: process.env.ESEWA_TEST_MERCHANT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_TEST_SECRET_KEY || '8gBm/:&EnhH.1/q'
  },
  
  // Production Environment URLs
  production: {
    paymentUrl: 'https://epay.esewa.com.np/api/epay/main/v2/form',
    verificationUrl: 'https://epay.esewa.com.np/api/epay/transaction/status/',
    merchantCode: process.env.ESEWA_MERCHANT_CODE,
    secretKey: process.env.ESEWA_SECRET_KEY
  },
  
  // Get current environment configuration
  getCurrentConfig() {
    const env = this.environment;
    return this[env];
  },
  
  // Success and failure URLs - dynamically set based on environment
  getSuccessUrl() {
    const backendUrl = process.env.BACKEND_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? 'https://vehicle-rental-system-rjvj.onrender.com' 
                        : 'http://localhost:3001');
    return `${backendUrl}/api/payment/esewa/success`;
  },
  
  getFailureUrl() {
    const backendUrl = process.env.BACKEND_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? 'https://vehicle-rental-system-rjvj.onrender.com' 
                        : 'http://localhost:3001');
    return `${backendUrl}/api/payment/esewa/failure`;
  },
  
  // Frontend URL helper - for redirecting to frontend after payment
  getFrontendUrl() {
    return process.env.FRONTEND_URL || 
           (process.env.NODE_ENV === 'production' 
             ? 'https://vehicle-rental-system-lwna.vercel.app' // Your actual Vercel domain (no trailing slash)
             : 'http://localhost:5173');
  },
  
  // Legacy properties for backward compatibility
  get successUrl() {
    return this.getSuccessUrl();
  },
  
  get failureUrl() {
    return this.getFailureUrl();
  },
  
  get frontendUrl() {
    return this.getFrontendUrl();
  },
  
  // Payment configuration
  currency: 'NPR',
  paymentTimeout: 30, // minutes
  
  // API Configuration
  apiVersion: 'v2',
  
  // Debugging (only for development)
  debug: process.env.NODE_ENV !== 'production'
};
