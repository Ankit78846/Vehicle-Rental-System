// Test script to verify cancel request functionality
const fetch = require('node-fetch');

const testCancelRequest = async () => {
  try {
    // Test token from the frontend code
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzYmQxN2ZjN2EzN2EzMWI4OTY5NTQiLCJpYXQiOjE3NTM0NjQwODcsImV4cCI6MTc1NDA2ODg4N30.jr1KHY2-LGkIodcq_kp8IvnTOrDWBKjHnLsPf1a85H0";
    
    // Test booking ID (you can get this from your bookings)
    const bookingId = "BK1753464154649ABCDE"; // Replace with actual booking ID
    
    const response = await fetch(`http://localhost:3001/api/payment/esewa/booking/${bookingId}/cancel-request`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        reason: 'Testing cancel request functionality',
        requestedAt: new Date().toISOString()
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Cancel request test successful!');
    } else {
      console.log('❌ Cancel request test failed');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Test authentication endpoint first
const testAuth = async () => {
  try {
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzYmQxN2ZjN2EzN2EzMWI4OTY5NTQiLCJpYXQiOjE3NTM0NjQwODcsImV4cCI6MTc1NDA2ODg4N30.jr1KHY2-LGkIodcq_kp8IvnTOrDWBKjHnLsPf1a85H0";
    
    const response = await fetch('http://localhost:3001/api/payment/esewa/bookings/my-bookings', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('Auth test - Response status:', response.status);
    const responseText = await response.text();
    console.log('Auth test - Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.bookings && data.bookings.length > 0) {
        console.log('✅ Found bookings, using first one for cancel test');
        const firstBooking = data.bookings[0];
        console.log('Test booking ID:', firstBooking.bookingId);
        
        // Now test cancel request with actual booking ID
        await testCancelRequestWithBooking(firstBooking.bookingId);
      } else {
        console.log('No bookings found for testing');
      }
    }
    
  } catch (error) {
    console.error('Auth test error:', error);
  }
};

const testCancelRequestWithBooking = async (bookingId) => {
  try {
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzYmQxN2ZjN2EzN2EzMWI4OTY5NTQiLCJpYXQiOjE3NTM0NjQwODcsImV4cCI6MTc1NDA2ODg4N30.jr1KHY2-LGkIodcq_kp8IvnTOrDWBKjHnLsPf1a85H0";
    
    const response = await fetch(`http://localhost:3001/api/payment/esewa/booking/${bookingId}/cancel-request`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        reason: 'Testing cancel request functionality',
        requestedAt: new Date().toISOString()
      })
    });
    
    console.log('\n--- Cancel Request Test ---');
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Cancel request test successful!');
    } else {
      console.log('❌ Cancel request test failed');
    }
    
  } catch (error) {
    console.error('Cancel request test error:', error);
  }
};

console.log('Starting tests...');
testAuth();
