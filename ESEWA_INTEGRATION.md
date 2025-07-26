# eSewa Payment Integration Documentation

## Overview
This document explains the eSewa payment integration implemented for the Vehicle Rental System.

## Features Implemented

### 1. Frontend Changes
- **PaymentPage.jsx**: Added eSewa as a payment method option
- **PaymentSuccess.jsx**: Success page for completed payments
- **PaymentFailure.jsx**: Failure page with error handling
- **App.jsx**: Added routes for success/failure pages

### 2. Backend Implementation
- **esewa-payment.js**: Complete eSewa API integration
- **payment.js**: Main payment router
- **Transaction.js**: Database model for storing transactions
- **index.js**: Added payment routes

### 3. Key Components

#### Payment Flow
1. User selects eSewa payment method
2. Frontend sends payment request to `/api/payment/esewa/initiate`
3. Backend generates UUID and signature
4. User redirected to eSewa payment page
5. After payment, eSewa redirects to success/failure URLs
6. Backend verifies payment and updates transaction status

#### Security Features
- HMAC-SHA256 signature generation
- Transaction UUID for uniqueness
- Payment verification with eSewa
- Secure callback handling

## Configuration

### Environment Variables
Add to Backend/.env:
```
FRONTEND_URL=http://localhost:5173
```

### eSewa Configuration
```javascript
const ESEWA_CONFIG = {
  merchantId: 'EPAYTEST', // Testing merchant ID
  secretKey: '8gBm/:&EnhH.1/q', // Testing secret key
  successUrl: process.env.FRONTEND_URL + '/payment/esewa/success',
  failureUrl: process.env.FRONTEND_URL + '/payment/esewa/failure',
  baseUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
};
```

## Testing

### Prerequisites
1. Install required dependencies:
   ```bash
   cd Backend
   npm install uuid
   ```

2. Start backend server:
   ```bash
   cd Backend
   node index.js
   ```

3. Start frontend:
   ```bash
   cd Front-end
   npm run dev
   ```

### Test Payment Flow
1. Navigate to a vehicle details page
2. Fill in trip details and proceed to payment
3. Select "eSewa" as payment method
4. Click "Pay with eSewa"
5. You'll be redirected to eSewa's test environment
6. Use test credentials or cancel to test different flows

### Test Credentials (eSewa Test Environment)
- Test eSewa ID: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005
- Test MPIN: 1234

## API Endpoints

### POST /api/payment/esewa/initiate
Initiates eSewa payment
- **Body**: `{ amount, bookingData, vehicleData, billingAddress }`
- **Response**: HTML form that auto-submits to eSewa

### GET /api/payment/esewa/success
Handles successful payment callback from eSewa
- **Query**: `data` (base64 encoded transaction data)
- **Response**: Redirect to frontend success page

### GET /api/payment/esewa/failure
Handles failed payment callback from eSewa
- **Query**: `transaction_uuid`
- **Response**: Redirect to frontend failure page

### GET /api/payment/esewa/status/:uuid
Gets transaction status
- **Params**: `uuid` (transaction UUID)
- **Response**: Transaction details

## Database Schema

### Transaction Model
```javascript
{
  uuid: String (unique),
  amount: Number,
  status: String (pending/completed/failed/cancelled),
  paymentMethod: String,
  transactionCode: String,
  bookingData: Object,
  vehicleData: Object,
  billingAddress: Object,
  createdAt: Date,
  completedAt: Date,
  failedAt: Date,
  errorMessage: String
}
```

## Production Deployment

### For Production Use:
1. Replace test credentials with production credentials:
   - Change `merchantId` from 'EPAYTEST' to your actual merchant ID
   - Update `secretKey` with your production secret key
   - Change `baseUrl` to production URL: `https://epay.esewa.com.np/api/epay/main/v2/form`

2. Update environment variables:
   ```
   FRONTEND_URL=https://your-production-domain.com
   ```

3. SSL/HTTPS is required for production eSewa integration

## Error Handling

### Common Error Types
- `payment_cancelled`: User cancelled payment
- `verification_failed`: Payment verification failed
- `callback_error`: Error in processing callback
- `insufficient_funds`: Insufficient eSewa balance

### Troubleshooting
1. **Payment not redirecting**: Check FRONTEND_URL in .env
2. **Signature mismatch**: Verify secret key and message format
3. **Callback errors**: Ensure routes are accessible from eSewa servers
4. **CORS issues**: Update CORS settings for production domains

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify payments** on the backend
3. **Use HTTPS** in production
4. **Validate all inputs** before processing
5. **Store sensitive data securely** in environment variables

## Support

For eSewa integration support:
- eSewa Developer Documentation: https://developer.esewa.com.np/
- eSewa Support: support@esewa.com.np

For application issues:
- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Test with eSewa test environment first
