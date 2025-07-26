# Booking Model and Enhanced Payment System Documentation

## Overview
This documentation covers the new Booking model and the enhanced eSewa payment integration that now includes comprehensive booking management and user information tracking.

## New Booking Model

### Location
`Backend/models/Booking.js`

### Features
- **Comprehensive Booking Tracking**: Complete booking lifecycle management
- **User Information Storage**: Stores customer details even for non-registered users  
- **Vehicle Details**: Full vehicle information with pricing
- **Booking Period Management**: Start/end dates with time slots
- **Payment Integration**: Links with transaction and payment data
- **Status Tracking**: Multiple status levels for bookings and payments
- **Automatic ID Generation**: Unique booking IDs with "BK" prefix
- **Duration Calculation**: Automatic calculation of booking duration
- **Virtual Properties**: Computed fields for better data representation

### Schema Fields

#### Booking Identification
```javascript
bookingId: String (auto-generated: "BK" + timestamp + random)
```

#### User Information
```javascript
userId: ObjectId (optional - for registered users)
userName: String (required)
userEmail: String (required)
userPhone: String (optional)
```

#### Vehicle Information
```javascript
vehicleId: ObjectId (required - reference to Vehicle)
vehicleName: String (required)
vehicleModel: String (optional)
vehicleType: String (optional)
vehicleLocation: String (optional)
vehicleImage: String (optional)
pricePerDay: Number (required)
```

#### Booking Period
```javascript
startDate: Date (required)
endDate: Date (required)
startTime: String (required)
endTime: String (required)
duration: {
  days: Number (auto-calculated)
  hours: Number (default: 0)
}
```

#### Pricing Details
```javascript
pricing: {
  basePrice: Number (required)
  serviceFee: Number (default: 200)
  taxes: Number (required)
  totalAmount: Number (required)
}
```

#### Billing Information
```javascript
billingAddress: {
  address: String (required)
  city: String (required)
  state: String (optional)
  zipCode: String (required)
  country: String (default: "Nepal")
}
```

#### Payment Information
```javascript
paymentMethod: String (enum: ['esewa', 'card', 'paypal', 'apple', 'google', 'cash'])
paymentStatus: String (enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'])
transactionId: String (optional)
esewaTransactionCode: String (optional)
esewaRefId: String (optional)
paymentDate: Date (optional)
```

#### Booking Status
```javascript
bookingStatus: String (enum: ['confirmed', 'pending', 'cancelled', 'completed', 'in-progress'])
```

#### Additional Features
```javascript
specialRequirements: String (max 500 chars)
contactPreferences: {
  email: Boolean (default: true)
  sms: Boolean (default: false)
  whatsapp: Boolean (default: false)
}
metadata: {
  pickupLocation: String
  dropoffLocation: String
  driverRequired: Boolean (default: false)
  insuranceIncluded: Boolean (default: true)
}
```

### Virtual Properties
- `durationText`: Human-readable duration format
- `totalValue`: Total booking value (same as pricing.totalAmount)
- `isActive`: Boolean indicating if booking is currently active

### Instance Methods
- `confirmBooking()`: Mark booking as confirmed with completed payment
- `cancelBooking(reason)`: Cancel booking with reason tracking

### Static Methods
- `findByUser(userId)`: Get all bookings for a specific user
- `findByVehicle(vehicleId)`: Get all bookings for a specific vehicle
- `findActiveBookings()`: Get all currently active bookings

## Enhanced eSewa Payment Integration

### Updated Routes
Location: `Backend/routes/esewa-payment.js`

#### New Endpoints

1. **GET /api/payment/esewa/booking/:transactionId**
   - Retrieve booking details by transaction ID
   - Returns complete booking information with populated vehicle data

2. **GET /api/payment/esewa/bookings/user/:userId**
   - Get all bookings for a specific user
   - Returns array of bookings with pagination support

3. **GET /api/payment/esewa/bookings/vehicle/:vehicleId**
   - Get all bookings for a specific vehicle
   - Useful for availability checking and scheduling

4. **PATCH /api/payment/esewa/booking/:bookingId/status**
   - Update booking status
   - Supports status changes and cancellation with reasons

### Payment Flow Enhancement

#### 1. Payment Initiation
- Now accepts `userInfo` in request body
- Stores user information in transaction record
- Enhanced validation for user data

#### 2. Payment Success Processing
```javascript
// On successful eSewa payment:
1. Update transaction status to 'completed'
2. Extract booking and user information from transaction
3. Create comprehensive booking record
4. Link booking with transaction via transactionId
5. Set booking status to 'confirmed'
6. Store eSewa transaction codes for reference
```

#### 3. Automatic Booking Creation
When payment is successful, the system automatically:
- Creates a booking record with all details
- Calculates pricing breakdown
- Sets appropriate booking and payment status
- Links user, vehicle, and transaction data
- Generates unique booking ID

## Frontend Integration

### Enhanced PaymentPage

#### New Features
1. **User Information Form**: Collects customer details for eSewa payments
2. **Enhanced Validation**: Validates user info for eSewa transactions
3. **Improved Error Handling**: Better error messages and debugging
4. **User Data Submission**: Sends user info along with payment request

#### User Information Fields
```javascript
userInfo: {
  name: String (required for eSewa)
  email: String (required for eSewa, validated)
  phone: String (required for eSewa)
  userId: String (optional - for logged-in users)
}
```

### Updated PaymentSuccess Page

#### Enhanced Features
1. **Real-time Data Fetching**: Fetches actual transaction and booking data
2. **Comprehensive Display**: Shows complete booking and transaction details
3. **Better Error Handling**: Handles missing data gracefully
4. **Action Buttons**: Links to booking management and receipt download

#### Data Sources
- **Transaction Details**: Fetched from `/api/payment/esewa/status/:transactionId`
- **Booking Details**: Fetched from `/api/payment/esewa/booking/:transactionId`

## Database Indexes

For optimal performance, the following indexes are created:
- `userId`: For user-based queries
- `vehicleId`: For vehicle-based queries  
- `bookingStatus`: For status filtering
- `paymentStatus`: For payment status queries
- `startDate, endDate`: For date range queries
- `createdAt`: For chronological sorting
- `bookingId`: Unique index for booking identification

## Usage Examples

### Creating a Booking (Automatic via Payment)
```javascript
// Booking is automatically created when eSewa payment succeeds
// No manual booking creation needed
```

### Fetching User Bookings
```javascript
const response = await fetch('/api/payment/esewa/bookings/user/USER_ID');
const data = await response.json();
console.log(data.bookings); // Array of user bookings
```

### Getting Booking by Transaction
```javascript
const response = await fetch('/api/payment/esewa/booking/TRANSACTION_ID');
const data = await response.json();
console.log(data.booking); // Complete booking details
```

### Updating Booking Status
```javascript
const response = await fetch('/api/payment/esewa/booking/BOOKING_ID/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    status: 'cancelled', 
    reason: 'Customer request' 
  })
});
```

## Error Handling

### Common Error Scenarios
1. **Missing Transaction ID**: Returns 404 with appropriate message
2. **Database Connection Issues**: Returns 500 with error details
3. **Booking Creation Failure**: Logs error but doesn't fail payment
4. **Invalid Status Updates**: Validates status transitions

### Logging
- All booking operations are logged for debugging
- Payment-booking linking is tracked
- Error states are comprehensively logged

## Security Considerations

1. **Data Validation**: All user inputs are validated
2. **Sanitization**: Email and phone formats are checked
3. **Transaction Integrity**: Booking creation only after payment confirmation
4. **Error Information**: Limited error details in production responses

## Future Enhancements

1. **Email Notifications**: Send booking confirmations via email
2. **SMS Alerts**: Booking reminders and updates
3. **Calendar Integration**: Add bookings to user calendars
4. **Cancellation Policy**: Implement refund calculations
5. **Booking Modifications**: Allow date/time changes
6. **Admin Dashboard**: Booking management interface
7. **Reporting**: Analytics and booking reports

## Testing

### Test Scenarios
1. **Complete Payment Flow**: End-to-end eSewa payment with booking creation
2. **Booking Retrieval**: Test all booking query endpoints
3. **Status Updates**: Test booking status transitions
4. **Error Conditions**: Test failure scenarios and error handling
5. **Data Integrity**: Verify booking-transaction-payment linkage

### Test Data
- Use eSewa test environment credentials
- Create test users and vehicles for comprehensive testing
- Test with various booking durations and amounts

This enhanced booking system provides a complete solution for vehicle rental booking management with integrated payment processing and comprehensive data tracking.
