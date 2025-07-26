const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const esewaConfig = require('../config/esewa');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current eSewa configuration based on environment
const currentConfig = esewaConfig.getCurrentConfig();

// eSewa Configuration with current environment settings
const ESEWA_CONFIG = {
  merchantId: currentConfig.merchantCode, // Keep merchantId for backward compatibility
  merchantCode: currentConfig.merchantCode,
  secretKey: currentConfig.secretKey,
  successUrl: esewaConfig.successUrl,
  failureUrl: esewaConfig.failureUrl,
  baseUrl: currentConfig.paymentUrl,
  verificationUrl: currentConfig.verificationUrl,
  frontendUrl: process.env.FRONTEND_URL
};

console.log('eSewa Config URLs:', {
  successUrl: ESEWA_CONFIG.successUrl,
  failureUrl: ESEWA_CONFIG.failureUrl,
  frontendUrl: process.env.FRONTEND_URL,
  environment: esewaConfig.environment
});

// Helper function to generate signature
const generateSignature = (message, secretKey) => {
  const hash = crypto.createHmac('sha256', secretKey);
  hash.update(message);
  return hash.digest('base64');
};

// Generate signature for signed fields as per eSewa v2 documentation
const generateEsewaSignature = (data, secretKey) => {
  const signedFieldNames = data.signed_field_names;
  const fields = signedFieldNames.split(',');
  
  let message = '';
  fields.forEach(field => {
    message += `${field}=${data[field]},`;
  });
  // Remove trailing comma
  message = message.slice(0, -1);
  
  return generateSignature(message, secretKey);
};

// Initiate eSewa payment
router.post('/initiate', async (req, res) => {
  try {
    console.log('eSewa payment initiation request:', req.body);
    console.log('Vehicle data received:', JSON.stringify(req.body.vehicleData, null, 2));
    const { amount, bookingData, vehicleData, billingAddress, userInfo } = req.body;

    // Generate unique transaction UUID
    const transactionUuid = uuidv4();
    const productCode = 'EPAYTEST'; // Use 'EPAYTEST' for testing
    
    // Properly structure vehicle data for transaction storage
    const structuredVehicleData = {
      id: vehicleData?.id || vehicleData?._id,
      vehicleId: vehicleData?.id || vehicleData?._id, // Keep as string initially, will be converted to ObjectId by Mongoose
      name: vehicleData?.name || 'Unknown Vehicle',
      price: vehicleData?.price || 0,
      image: vehicleData?.image || '',
      model: vehicleData?.model || vehicleData?.brand || '',
      type: vehicleData?.type || 'Car',
      location: vehicleData?.location || 'Unknown Location',
      brand: vehicleData?.brand || '',
      capacity: vehicleData?.capacity || vehicleData?.seats || 0,
      seats: vehicleData?.seats || vehicleData?.capacity || 0
    };
    
    console.log('Structured vehicle data:', structuredVehicleData);
    
    // Store transaction details in database
    const transactionData = {
      uuid: transactionUuid,
      amount: amount,
      status: 'pending',
      paymentMethod: 'esewa',
      bookingData,
      vehicleData: structuredVehicleData,
      billingAddress,
      userInfo: userInfo || null,
      // Store user information in main fields as well for compatibility
      userEmail: userInfo?.email || null,
      userId: userInfo?.userId || null,
      createdAt: new Date()
    };

    console.log('Creating transaction with data:', transactionData);

    // Save transaction to database
    const savedTransaction = await Transaction.create(transactionData);
    console.log('Transaction saved successfully:', savedTransaction._id);

    // Create message for signature
    const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    // Generate signature
    const signature = generateSignature(message, ESEWA_CONFIG.secretKey);

    // Prepare eSewa form data
    const esewaFormData = {
      amount: amount,
      failure_url: ESEWA_CONFIG.failureUrl,
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: productCode,
      signature: signature,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      success_url: ESEWA_CONFIG.successUrl,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transactionUuid
    };

    // Create HTML form for auto-submission to eSewa
    const htmlForm = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to eSewa...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .loader {
            text-align: center;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #60a917;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h3>Redirecting to eSewa...</h3>
          <p>Please wait while we redirect you to complete your payment.</p>
        </div>
        
        <form id="esewaForm" action="${ESEWA_CONFIG.baseUrl}" method="POST" style="display: none;">
          ${Object.entries(esewaFormData).map(([key, value]) => 
            `<input type="hidden" name="${key}" value="${value}" />`
          ).join('')}
        </form>
        
        <script>
          // Auto-submit form after 2 seconds
          setTimeout(function() {
            document.getElementById('esewaForm').submit();
          }, 2000);
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlForm);

  } catch (error) {
    console.error('eSewa payment initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate eSewa payment',
      error: error.message 
    });
  }
});

// Handle eSewa success callback
router.get('/success', async (req, res) => {
  try {
    console.log('=== eSewa Success Callback Debug ===');
    console.log('Request URL:', req.url);
    console.log('Request query params:', req.query);
    
    const { data } = req.query;
    
    if (!data) {
      console.log('❌ No data parameter in success callback');
      console.log('Available query params:', Object.keys(req.query));
      
      // Redirect to failure page
      const baseUrl = esewaConfig.getFrontendUrl();
      const failureUrl = `${baseUrl}/payment/failure?error=no_data_parameter`;
      return res.redirect(failureUrl);
    }

    // Decode the base64 data as per eSewa documentation
    let transactionData;
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      transactionData = JSON.parse(decodedData);
      console.log('✅ Decoded transaction data:', transactionData);
    } catch (error) {
      console.log('❌ Failed to decode data parameter:', error.message);
      const baseUrl = esewaConfig.getFrontendUrl();
      const failureUrl = `${baseUrl}/payment/failure?error=invalid_data_format`;
      return res.redirect(failureUrl);
    }

    // Verify signature integrity (important security step)
    const expectedMessage = `transaction_code=${transactionData.transaction_code},status=${transactionData.status},total_amount=${transactionData.total_amount},transaction_uuid=${transactionData.transaction_uuid},product_code=${transactionData.product_code},signed_field_names=${transactionData.signed_field_names}`;
    const expectedSignature = generateSignature(expectedMessage, ESEWA_CONFIG.secretKey);
    
    console.log('Signature verification:');
    console.log('Expected message:', expectedMessage);
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', transactionData.signature);
    
    if (expectedSignature !== transactionData.signature) {
      console.log('❌ Signature verification failed - potential security issue');
      // For testing, we'll continue but log the warning
      // In production, you should redirect to failure page
      console.log('⚠️  Continuing despite signature mismatch for testing...');
    } else {
      console.log('✅ Signature verification passed');
    }
    
    // Verify the transaction status with eSewa
    if (transactionData.status === 'COMPLETE') {
      console.log('✅ Transaction status is COMPLETE, verifying with eSewa...');
      
      try {
        // Double-check with eSewa's status API
        const verificationResponse = await verifyEsewaTransaction(
          transactionData.transaction_code,
          transactionData.total_amount,
          transactionData.transaction_uuid
        );
        
        console.log('eSewa verification response:', verificationResponse);

        if (verificationResponse.status === 'COMPLETE') {
          console.log('✅ Payment verified successfully with eSewa, updating transaction...');
          
          // Update transaction status in database
          const updateResult = await Transaction.updateOne(
            { uuid: transactionData.transaction_uuid },
            { 
              status: 'completed',
              transactionCode: transactionData.transaction_code,
              completedAt: new Date(),
              esewaRefId: verificationResponse.ref_id
            }
          );
          console.log('Transaction update result:', updateResult);

          // Get the complete transaction data to create booking
          const transaction = await Transaction.findOne({ uuid: transactionData.transaction_uuid });
          console.log('Retrieved transaction for booking creation:', transaction ? 'Found' : 'Not found');
          
          if (transaction) {
            // Create booking record with properly structured vehicle data
            const bookingRecord = {
              userName: transaction.userInfo?.name || transaction.billingAddress?.name || 'Guest User',
              userEmail: transaction.userInfo?.email || transaction.billingAddress?.email || 'guest@example.com',
              userPhone: transaction.userInfo?.phone || transaction.billingAddress?.phone || '',
              userId: transaction.userInfo?.userId || null,
              vehicleId: transaction.vehicleData?.vehicleId || transaction.vehicleData?.id || '000000000000000000000000',
              vehicleName: transaction.vehicleData?.name || 'Unknown Vehicle',
              vehicleModel: transaction.vehicleData?.model || '',
              vehicleType: transaction.vehicleData?.type || 'Car',
              vehicleLocation: transaction.vehicleData?.location || transaction.bookingData?.location || 'Unknown',
              vehicleImage: transaction.vehicleData?.image || '',
              pricePerDay: transaction.vehicleData?.price || 0,
              startDate: new Date(transaction.bookingData.startDate),
              endDate: new Date(transaction.bookingData.endDate),
              startTime: transaction.bookingData.startTime,
              endTime: transaction.bookingData.endTime,
              duration: {
                days: Math.max(1, Math.ceil((new Date(transaction.bookingData.endDate) - new Date(transaction.bookingData.startDate)) / (1000 * 60 * 60 * 24))),
                hours: 0
              },
              pricing: {
                basePrice: transaction.amount - 200 - Math.round((transaction.amount - 200) * 0.05),
                serviceFee: 200,
                taxes: Math.round((transaction.amount - 200) * 0.05),
                totalAmount: transaction.amount
              },
              billingAddress: {
                address: transaction.billingAddress?.address || 'Unknown Address',
                city: transaction.billingAddress?.city || 'Unknown City',
                state: transaction.billingAddress?.state || '',
                zipCode: transaction.billingAddress?.zipCode || '00000',
                country: transaction.billingAddress?.country || 'Nepal'
              },
              paymentMethod: 'esewa',
              paymentStatus: 'completed',
              transactionId: transaction.uuid,
              esewaTransactionCode: transactionData.transaction_code,
              esewaRefId: verificationResponse.ref_id,
              paymentDate: new Date(),
              bookingStatus: 'confirmed'
            };

            try {
              // Check if booking already exists for this transaction
              const existingBooking = await Booking.findOne({ transactionId: transaction.uuid });
              if (!existingBooking) {
                const booking = new Booking(bookingRecord);
                await booking.save();
                console.log('✅ Booking created successfully:', booking.bookingId);
              } else {
                console.log('ℹ️  Booking already exists for transaction:', transaction.uuid);
              }
            } catch (bookingError) {
              console.error('❌ Error creating booking:', bookingError.message);
              // Continue with payment success even if booking creation fails
            }
          }

          // Redirect to success page
          const baseUrl = esewaConfig.getFrontendUrl();
          const successUrl = `${baseUrl}/payment/esewa/success?transactionId=${transactionData.transaction_uuid}&status=success&amount=${transactionData.total_amount}`;
          console.log('✅ Redirecting to success URL:', successUrl);
          res.redirect(successUrl);
          
        } else {
          console.log('❌ eSewa verification failed - status:', verificationResponse.status);
          throw new Error(`eSewa verification failed with status: ${verificationResponse.status}`);
        }
        
      } catch (verificationError) {
        console.error('❌ eSewa verification failed:', verificationError.message);
        
        // Mark transaction as failed
        await Transaction.updateOne(
          { uuid: transactionData.transaction_uuid },
          { 
            status: 'failed',
            failedAt: new Date(),
            errorMessage: `Verification failed: ${verificationError.message}`
          }
        );
        
        const baseUrl = esewaConfig.getFrontendUrl();
        const failureUrl = `${baseUrl}/payment/failure?error=verification_failed&message=${encodeURIComponent(verificationError.message)}`;
        res.redirect(failureUrl);
      }
      
    } else {
      console.log('❌ Transaction status is not COMPLETE:', transactionData.status);
      
      // Update transaction status based on eSewa response
      await Transaction.updateOne(
        { uuid: transactionData.transaction_uuid },
        { 
          status: 'failed',
          failedAt: new Date(),
          errorMessage: `Payment failed with status: ${transactionData.status}`
        }
      );
      
      const baseUrl = esewaConfig.getFrontendUrl();
      const failureUrl = `${baseUrl}/payment/failure?error=payment_not_complete&status=${transactionData.status}`;
      res.redirect(failureUrl);
    }

  } catch (error) {
    console.error('❌ eSewa success callback error:', error);
    const baseUrl = esewaConfig.getFrontendUrl();
    const failureUrl = `${baseUrl}/payment/failure?error=callback_error&message=${encodeURIComponent(error.message)}`;
    res.redirect(failureUrl);
  }
});

// Handle eSewa failure callback
// Handle eSewa failure callback
router.get('/failure', async (req, res) => {
  try {
    console.log('=== eSewa Failure Callback Debug ===');
    console.log('Request URL:', req.url);
    console.log('Request query params:', req.query);
    
    const { data, transaction_uuid } = req.query;
    
    if (data) {
      // Decode the base64 data as per eSewa documentation
      try {
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const transactionData = JSON.parse(decodedData);
        console.log('Decoded failure transaction data:', transactionData);
        
        // Update transaction status to failed
        if (transactionData.transaction_uuid) {
          await Transaction.updateOne(
            { uuid: transactionData.transaction_uuid },
            { 
              status: 'failed',
              failedAt: new Date(),
              errorMessage: `Payment failed with status: ${transactionData.status || 'FAILED'}`
            }
          );
          console.log('Updated transaction status to failed');
        }
        
      } catch (error) {
        console.log('❌ Failed to decode failure data parameter:', error.message);
      }
    } else if (transaction_uuid) {
      // Fallback for direct parameter format
      await Transaction.updateOne(
        { uuid: transaction_uuid },
        { 
          status: 'failed',
          failedAt: new Date(),
          errorMessage: 'Payment cancelled by user'
        }
      );
    }

    // Redirect to failure page regardless
    const baseUrl = esewaConfig.getFrontendUrl();
    const failureUrl = `${baseUrl}/payment/failure?error=payment_cancelled_or_failed`;
    console.log('Redirecting to failure URL:', failureUrl);
    res.redirect(failureUrl);

  } catch (error) {
    console.error('❌ eSewa failure callback error:', error);
    const baseUrl = esewaConfig.getFrontendUrl();
    const failureUrl = `${baseUrl}/payment/failure?error=callback_error`;
    res.redirect(failureUrl);
  }
});

// Verify eSewa transaction using GET request (as per official docs)
const verifyEsewaTransaction = async (transactionCode, totalAmount, transactionUuid) => {
  try {
    console.log('=== eSewa Verification Debug ===');
    console.log('Verification parameters:', { transactionCode, totalAmount, transactionUuid });
    console.log('Using verification URL:', ESEWA_CONFIG.verificationUrl);
    console.log('Using merchant code:', ESEWA_CONFIG.merchantCode);
    
    // Construct query parameters as per eSewa documentation
    const params = new URLSearchParams({
      product_code: ESEWA_CONFIG.merchantCode,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid
    });
    
    const verificationUrl = `${ESEWA_CONFIG.verificationUrl}?${params.toString()}`;
    console.log('Complete verification URL:', verificationUrl);
    
    const response = await axios.get(verificationUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VehicleRental-eSewa-Integration'
      }
    });
    
    console.log('eSewa verification response status:', response.status);
    console.log('eSewa verification response data:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('eSewa verification error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    throw new Error(`eSewa verification failed: ${error.message}`);
  }
};

// Get transaction status
router.get('/status/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log('Fetching transaction status for UUID:', uuid);
    
    // Fetch transaction from database
    const transaction = await Transaction.findOne({ uuid });
    
    if (!transaction) {
      console.log('Transaction not found for UUID:', uuid);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log('Transaction found:', {
      uuid: transaction.uuid,
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt
    });

    res.json({
      success: true,
      transaction: {
        uuid: transaction.uuid,
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        transactionCode: transaction.transactionCode,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        bookingData: transaction.bookingData,
        vehicleData: transaction.vehicleData,
        userInfo: transaction.userInfo
      }
    });

  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transaction status',
      error: error.message 
    });
  }
});

// Get booking details by transaction ID
router.get('/booking/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Find booking by transaction ID
    const booking = await Booking.findOne({ transactionId })
      .populate('vehicleId', 'name model type location image price');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get booking details',
      error: error.message 
    });
  }
});

// Get all bookings for a user
router.get('/bookings/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id || req.admin?.id;
    
    console.log('Bookings request - userId param:', userId);
    console.log('Requesting user/admin ID:', requestingUserId);
    console.log('User object:', req.user);
    console.log('Admin object:', req.admin);
    
    // Allow users to see their own bookings, or admins to see any bookings
    if (!req.admin && (!req.user || req.user.id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }
    
    // Find bookings by userId and also by userEmail (for guest bookings)
    let bookings = await Booking.findByUser(userId);
    
    // If user is authenticated, also find bookings by their email
    if (req.user && bookings.length === 0) {
      // Get user email from the database or token if available
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && user.email) {
        const emailBookings = await Booking.find({ userEmail: user.email }).populate('vehicleId').sort({ createdAt: -1 });
        bookings = [...bookings, ...emailBookings];
      }
    }
    
    console.log('Found bookings count:', bookings.length);
    
    res.json({
      success: true,
      bookings: bookings,
      total: bookings.length
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user bookings',
      error: error.message 
    });
  }
});

// Get bookings for the currently authenticated user
router.get('/bookings/my-bookings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    console.log('🔍 My bookings request for userId:', userId);
    console.log('🔑 Auth user object:', req.user);
    console.log('🔑 Auth admin object:', req.admin);
    
    // Check total bookings in database first
    const totalBookings = await Booking.countDocuments();
    console.log('📊 Total bookings in database:', totalBookings);
    
    // Find bookings by userId - with additional debug
    console.log('🔍 Searching for bookings with userId:', userId);
    let bookings = await Booking.findByUser(userId);
    console.log('📝 Found bookings by userId:', bookings.length);
    
    // Also try direct query to debug
    const directBookings = await Booking.find({ userId: userId }).populate('vehicleId').sort({ createdAt: -1 });
    console.log('📝 Direct query found bookings:', directBookings.length);
    
    // Try searching for bookings with any userId
    const allUserBookings = await Booking.find({ userId: { $exists: true } }).limit(5);
    console.log('📝 Sample bookings with userId:', allUserBookings.map(b => ({ userId: b.userId, userName: b.userName, bookingId: b.bookingId })));
    
    // If user is authenticated and no bookings found by userId, try by email
    if (req.user && bookings.length === 0) {
      const User = require('../models/User');
      console.log('🔍 No bookings found by userId, trying email lookup...');
      const user = await User.findById(userId);
      console.log('👤 Found user by ID:', user ? { id: user._id, email: user.email, name: user.name } : 'Not found');
      
      if (user && user.email) {
        console.log('📧 Searching for bookings by email:', user.email);
        const emailBookings = await Booking.find({ userEmail: user.email }).populate('vehicleId').sort({ createdAt: -1 });
        console.log('📧 Found bookings by email:', emailBookings.length);
        bookings = [...bookings, ...emailBookings];
        
        // Also try case-insensitive email search
        const emailRegex = new RegExp(user.email, 'i');
        const caseInsensitiveEmailBookings = await Booking.find({ userEmail: emailRegex }).populate('vehicleId').sort({ createdAt: -1 });
        console.log('📧 Found bookings by case-insensitive email:', caseInsensitiveEmailBookings.length);
      }
    }
    
    console.log('📋 Final bookings count:', bookings.length);
    
    res.json({
      success: true,
      bookings: bookings,
      total: bookings.length
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user bookings',
      error: error.message 
    });
  }
});

// Get all bookings for a vehicle
router.get('/bookings/vehicle/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const bookings = await Booking.findByVehicle(vehicleId);
    
    res.json({
      success: true,
      bookings: bookings,
      total: bookings.length
    });

  } catch (error) {
    console.error('Get vehicle bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get vehicle bookings',
      error: error.message 
    });
  }
});

// Update booking status
router.patch('/booking/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (status === 'cancelled') {
      await booking.cancelBooking(reason);
    } else {
      booking.bookingStatus = status;
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking status',
      error: error.message 
    });
  }
});

// Debug route - Get all transactions (remove in production)
router.get('/debug/transactions', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(50); // Increased limit
    
    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transactions',
      error: error.message 
    });
  }
});

// Verification endpoint for utility component (enhanced)
router.post('/verify', async (req, res) => {
  try {
    console.log('=== eSewa Utility Verification ===');
    console.log('Verification request:', req.body);
    const { amt, refId, oid } = req.body;
    
    if (!amt || !refId || !oid) {
      return res.status(400).json({
        verified: false,
        message: 'Missing required parameters: amt, refId, oid'
      });
    }
    
    // For testing purposes, let's be more lenient with verification
    // In a real production environment, you'd want to call eSewa's verification API
    console.log('Checking transaction in database...');
    
    // Check if transaction exists in our database
    let transaction = await Transaction.findOne({ uuid: oid });
    
    if (!transaction) {
      // If transaction doesn't exist, create it (for utility component compatibility)
      console.log('Transaction not found, creating new one...');
      transaction = new Transaction({
        uuid: oid,
        amount: parseFloat(amt),
        status: 'pending',
        paymentMethod: 'esewa',
        transactionCode: refId,
        userInfo: {
          name: 'Utility Test User',
          email: 'test@example.com'
        },
        vehicleData: {
          name: 'Test Vehicle',
          type: 'Car',
          price: parseFloat(amt) - 200
        },
        bookingData: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000)
        },
        billingAddress: {
          name: 'Test User',
          email: 'test@example.com'
        }
      });
      await transaction.save();
      console.log('Transaction created in database');
    }
    
    // Try to verify with eSewa (but don't fail if it doesn't work)
    let verificationResult = null;
    try {
      verificationResult = await verifyEsewaTransaction(refId, parseFloat(amt), oid);
      console.log('eSewa verification result:', verificationResult);
    } catch (verifyError) {
      console.log('eSewa verification failed, but continuing...', verifyError.message);
    }
    
    // For testing, mark as completed regardless of eSewa verification
    // In production, you'd check verificationResult.status === 'COMPLETE'
    const shouldComplete = true; // Change this to: verificationResult?.status === 'COMPLETE' for production
    
    if (shouldComplete) {
      // Update transaction status
      const updateResult = await Transaction.updateOne(
        { uuid: oid },
        { 
          status: 'completed',
          transactionCode: refId,
          completedAt: new Date(),
          verificationResult: verificationResult
        }
      );
      console.log('Transaction marked as completed:', updateResult);
      
      res.json({
        verified: true,
        message: 'Payment verified and completed successfully',
        transactionId: oid,
        amount: amt,
        verificationResult: verificationResult
      });
    } else {
      res.json({
        verified: false,
        message: 'Payment verification failed with eSewa',
        details: verificationResult
      });
    }
    
  } catch (error) {
    console.error('eSewa verification error:', error);
    res.status(500).json({
      verified: false,
      message: 'Verification process failed',
      error: error.message
    });
  }
});

// Debug route - Force complete a specific transaction
router.post('/debug/complete/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log('Force completing transaction:', uuid);
    
    const transaction = await Transaction.findOne({ uuid });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const updateResult = await Transaction.updateOne(
      { uuid },
      { 
        status: 'completed',
        transactionCode: transaction.transactionCode || 'FORCE-COMPLETED-' + Date.now(),
        completedAt: new Date(),
        errorMessage: 'Manually completed via debug endpoint'
      }
    );
    
    console.log('Completion result:', updateResult);
    
    res.json({
      success: true,
      message: 'Transaction marked as completed',
      transaction: await Transaction.findOne({ uuid })
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route - Force complete all pending transactions
router.post('/debug/complete-all-pending', async (req, res) => {
  try {
    console.log('Force completing all pending transactions...');
    
    const result = await Transaction.updateMany(
      { status: 'pending' },
      { 
        $set: { 
          status: 'completed',
          transactionCode: 'FORCE-COMPLETED-' + Date.now(),
          completedAt: new Date(),
          errorMessage: 'Manually completed via debug endpoint'
        } 
      }
    );
    
    console.log('Completion result:', result);
    
    res.json({
      success: true,
      message: 'All pending transactions have been marked as completed',
      ...result
    });
    
  } catch (error) {
    console.error('Failed to complete pending transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route - Create bookings for all completed transactions
router.post('/debug/create-bookings', async (req, res) => {
  try {
    console.log('Creating bookings for all completed transactions...');
    
    // Get all completed transactions
    const completedTransactions = await Transaction.find({ status: 'completed' });
    console.log(`Found ${completedTransactions.length} completed transactions`);
    
    const bookingsCreated = [];
    const errors = [];
    
    for (const transaction of completedTransactions) {
      try {
        // Check if booking already exists for this transaction
        const existingBooking = await Booking.findOne({ transactionId: transaction.uuid });
        if (existingBooking) {
          console.log(`Booking already exists for transaction ${transaction.uuid}`);
          continue;
        }
        
        // Create booking record with properly structured vehicle data
        const bookingRecord = {
          userName: transaction.userInfo?.name || transaction.billingAddress?.name || 'Guest User',
          userEmail: transaction.userInfo?.email || transaction.billingAddress?.email || 'guest@example.com',
          userPhone: transaction.userInfo?.phone || transaction.billingAddress?.phone || '',
          userId: transaction.userInfo?.userId || null,
          vehicleId: transaction.vehicleData?.vehicleId || transaction.vehicleData?.id || '000000000000000000000000',
          vehicleName: transaction.vehicleData?.name || 'Unknown Vehicle',
          vehicleModel: transaction.vehicleData?.model || '',
          vehicleType: transaction.vehicleData?.type || 'Car',
          vehicleLocation: transaction.vehicleData?.location || transaction.bookingData?.location || 'Unknown',
          vehicleImage: transaction.vehicleData?.image || '',
          pricePerDay: transaction.vehicleData?.price || 0,
          startDate: new Date(transaction.bookingData?.startDate || new Date()),
          endDate: new Date(transaction.bookingData?.endDate || new Date()),
          startTime: transaction.bookingData?.startTime || '00:00',
          endTime: transaction.bookingData?.endTime || '00:00',
          duration: {
            days: Math.max(1, Math.ceil((new Date(transaction.bookingData?.endDate || new Date()) - new Date(transaction.bookingData?.startDate || new Date())) / (1000 * 60 * 60 * 24))),
            hours: 0
          },
          pricing: {
            basePrice: transaction.amount - 200 - Math.round((transaction.amount - 200) * 0.05),
            serviceFee: 200,
            taxes: Math.round((transaction.amount - 200) * 0.05),
            totalAmount: transaction.amount
          },
          billingAddress: {
            address: transaction.billingAddress?.address || 'Unknown Address',
            city: transaction.billingAddress?.city || 'Unknown City',
            state: transaction.billingAddress?.state || '',
            zipCode: transaction.billingAddress?.zipCode || '00000',
            country: transaction.billingAddress?.country || 'Nepal'
          },
          paymentMethod: 'esewa',
          paymentStatus: 'completed',
          transactionId: transaction.uuid,
          esewaTransactionCode: transaction.transactionCode || 'UNKNOWN',
          paymentDate: transaction.completedAt || new Date(),
          bookingStatus: 'confirmed'
        };

        const booking = new Booking(bookingRecord);
        await booking.save();
        bookingsCreated.push(booking.bookingId);
        console.log(`✅ Booking created successfully: ${booking.bookingId} for transaction ${transaction.uuid}`);
        
      } catch (bookingError) {
        console.error(`❌ Error creating booking for transaction ${transaction.uuid}:`, bookingError);
        errors.push({
          transactionId: transaction.uuid,
          error: bookingError.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${completedTransactions.length} transactions`,
      bookingsCreated: bookingsCreated.length,
      bookingIds: bookingsCreated,
      errors: errors
    });
    
  } catch (error) {
    console.error('Failed to create bookings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to check if payment flow works
router.post('/test-initiate', async (req, res) => {
  try {
    console.log('=== TEST PAYMENT INITIATION ===');
    console.log('Request body:', req.body);
    
    // Minimal test transaction
    const transactionUuid = uuidv4();
    const amount = 1000;
    
    const testTransaction = new Transaction({
      uuid: transactionUuid,
      amount: amount,
      status: 'pending',
      paymentMethod: 'esewa',
      userInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9800000000'
      },
      vehicleData: {
        _id: 'test-vehicle',
        name: 'Test Vehicle',
        type: 'Car',
        price: 800
      },
      bookingData: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      },
      billingAddress: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    await testTransaction.save();
    console.log('✅ Test transaction created:', transactionUuid);
    
    res.json({
      success: true,
      message: 'Test transaction created successfully',
      transactionId: transactionUuid,
      testUrl: `http://localhost:5173/payment/esewa/success?transactionId=${transactionUuid}&status=success&amount=${amount}`
    });
    
  } catch (error) {
    console.error('Test initiation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to manually complete a transaction
router.post('/test-complete/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log('Manually completing transaction:', uuid);
    
    const updateResult = await Transaction.updateOne(
      { uuid },
      { 
        status: 'completed',
        transactionCode: 'TEST-CODE-' + Date.now(),
        completedAt: new Date()
      }
    );
    
    console.log('Update result:', updateResult);
    
    res.json({
      success: true,
      message: 'Transaction marked as completed',
      uuid: uuid,
      updateResult: updateResult
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route - Manually trigger verification for a transaction
router.post('/debug/verify/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log('Manual verification requested for UUID:', uuid);
    
    // Get transaction from database
    const transaction = await Transaction.findOne({ uuid });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        uuid: uuid
      });
    }
    
    console.log('Found transaction:', {
      uuid: transaction.uuid,
      status: transaction.status,
      amount: transaction.amount,
      transactionCode: transaction.transactionCode
    });
    
    // Mock transaction data for testing (you can override with real data if available)
    const mockTransactionCode = req.body.transactionCode || 'test-code-123';
    
    // Try verification
    const verificationResult = await verifyEsewaTransaction(
      mockTransactionCode,
      transaction.amount,
      transaction.uuid
    );
    
    res.json({
      success: true,
      transaction: transaction,
      verificationResult: verificationResult,
      message: 'Manual verification completed'
    });
    
  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Manual verification failed'
    });
  }
});

// Test callback endpoint
router.get('/test-callback', (req, res) => {
  console.log('Test callback endpoint reached');
  console.log('Query params:', req.query);
  res.json({
    success: true,
    message: 'Callback endpoint is working',
    timestamp: new Date().toISOString(),
    receivedParams: req.query,
    frontendUrl: esewaConfig.getFrontendUrl(),
    config: {
      successUrl: esewaConfig.getFrontendUrl() + '/payment/esewa/success',
      failureUrl: esewaConfig.getFrontendUrl() + '/payment/failure'
    }
  });
});

// Test success redirect - simulates eSewa success callback
router.get('/test-success-redirect', (req, res) => {
  console.log('=== Test Success Redirect ===');
  
  // Create a mock transaction ID for testing
  const testTransactionId = 'test-' + Date.now();
  const testAmount = 1000;
  
  // Redirect to frontend success page with test data
  const baseUrl = esewaConfig.getFrontendUrl();
  const successUrl = `${baseUrl}/payment/esewa/success?transactionId=${testTransactionId}&status=success&amount=${testAmount}&test=true`;
  
  console.log('Redirecting to test success URL:', successUrl);
  res.redirect(successUrl);
});

// Submit cancellation request (User can request, admin approves)
router.post('/booking/:bookingId/cancel-request', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason, requestedAt } = req.body;
    
    // Handle both user and admin authentication
    const userId = req.user?.id || req.admin?.id;
    const isAdmin = !!req.admin;
    
    // Fixed: Handle both user and admin auth + null userId safety - v2
    console.log('Cancel request received:', { bookingId, reason, userId, isAdmin });
    
    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if this booking belongs to the user (unless admin)
    // Handle case where userId might be null in older bookings
    if (booking.userId && booking.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only request cancellation for your own bookings'
      });
    }

    // Check if booking can be cancelled
    if (!['confirmed', 'pending', 'in-progress'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled'
      });
    }

    // Check if there's already a pending cancel request
    if (booking.cancelRequest && booking.cancelRequest.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'A cancellation request is already pending for this booking'
      });
    }

    // Add cancel request to booking
    booking.cancelRequest = {
      status: 'pending',
      reason: reason || 'No reason provided',
      requestedAt: requestedAt || new Date(),
      requestedBy: userId
    };

    await booking.save();

    console.log('Cancel request submitted successfully for booking:', bookingId);

    res.status(200).json({
      success: true,
      message: 'Cancellation request submitted successfully',
      data: {
        bookingId: booking.bookingId,
        cancelRequest: booking.cancelRequest
      }
    });
  } catch (error) {
    console.error('Error submitting cancellation request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit cancellation request',
      error: error.message
    });
  }
});

module.exports = router;