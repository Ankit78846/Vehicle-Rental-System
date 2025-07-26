// Test script to verify vehicle data is properly stored in transactions and bookings
const fetch = require('node-fetch');

const testVehiclePayment = async () => {
  try {
    console.log('=== Testing Vehicle Data Fix ===');
    
    // Mock vehicle data as it would come from the frontend
    const testVehicleData = {
      id: "687e8a778191bd6479ac0c17",
      _id: "687e8a778191bd6479ac0c17",
      name: "Hyundai Creta",
      brand: "Hyundai",
      price: 3500,
      image: "https://res.cloudinary.com/example/test-image.jpg",
      type: "Car",
      location: "Butwal",
      capacity: 5,
      seats: 5
    };
    
    const testBookingData = {
      startDate: "2025-07-26",
      startTime: "10:00",
      endDate: "2025-07-28",
      endTime: "18:00",
      location: "Butwal"
    };
    
    const testUserInfo = {
      name: "Test User",
      email: "test@example.com",
      phone: "9800000000"
    };
    
    const testBillingAddress = {
      address: "Test Address",
      city: "Butwal",
      state: "Lumbini",
      zipCode: "32400",
      country: "Nepal"
    };
    
    // Test payment initiation
    console.log('1. Initiating eSewa payment...');
    const response = await fetch('http://localhost:3001/api/payment/esewa/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 7500,
        bookingData: testBookingData,
        vehicleData: testVehicleData,
        billingAddress: testBillingAddress,
        userInfo: testUserInfo
      })
    });
    
    if (response.ok) {
      console.log('✅ Payment initiated successfully');
      console.log('Response Content-Type:', response.headers.get('Content-Type'));
      
      if (response.headers.get('Content-Type').includes('text/html')) {
        console.log('✅ Received HTML form (expected for eSewa redirect)');
        
        // Extract transaction UUID from the HTML response
        const htmlContent = await response.text();
        const uuidMatch = htmlContent.match(/transaction_uuid[^>]*value="([^"]+)"/);
        
        if (uuidMatch) {
          const transactionUuid = uuidMatch[1];
          console.log('✅ Transaction UUID found:', transactionUuid);
          
          // Check if transaction was saved with proper vehicle data
          console.log('2. Checking transaction data...');
          const statusResponse = await fetch(`http://localhost:3001/api/payment/esewa/status/${transactionUuid}`);
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('✅ Transaction retrieved successfully');
            console.log('Vehicle Data in Transaction:', JSON.stringify(statusData.transaction.vehicleData, null, 2));
            
            if (statusData.transaction.vehicleData.name && statusData.transaction.vehicleData.name !== 'Unknown Vehicle') {
              console.log('✅ SUCCESS: Vehicle data is properly stored!');
              console.log('   - Vehicle Name:', statusData.transaction.vehicleData.name);
              console.log('   - Vehicle Price:', statusData.transaction.vehicleData.price);
              console.log('   - Vehicle Type:', statusData.transaction.vehicleData.type);
              console.log('   - Vehicle Location:', statusData.transaction.vehicleData.location);
              
              // Now test booking creation by simulating payment completion
              console.log('3. Simulating payment completion...');
              const completeResponse = await fetch(`http://localhost:3001/api/payment/esewa/test-complete/${transactionUuid}`, {
                method: 'POST'
              });
              
              if (completeResponse.ok) {
                console.log('✅ Transaction marked as completed');
                
                // Check if booking was created
                setTimeout(async () => {
                  const bookingResponse = await fetch(`http://localhost:3001/api/payment/esewa/booking/${transactionUuid}`);
                  
                  if (bookingResponse.ok) {
                    const bookingData = await bookingResponse.json();
                    console.log('✅ Booking retrieved successfully');
                    console.log('Booking Vehicle Data:');
                    console.log('   - Vehicle Name:', bookingData.booking.vehicleName);
                    console.log('   - Vehicle Price Per Day:', bookingData.booking.pricePerDay);
                    console.log('   - Vehicle Type:', bookingData.booking.vehicleType);
                    console.log('   - Vehicle Location:', bookingData.booking.vehicleLocation);
                    
                    if (bookingData.booking.vehicleName !== 'Unknown Vehicle' && bookingData.booking.pricePerDay > 0) {
                      console.log('🎉 SUCCESS: Vehicle data fix is working correctly!');
                      console.log('🎉 Both transaction and booking have proper vehicle data!');
                    } else {
                      console.log('❌ ISSUE: Booking still has unknown vehicle data');
                    }
                  } else {
                    console.log('❌ Failed to retrieve booking');
                  }
                }, 1000);
                
              } else {
                console.log('❌ Failed to complete transaction');
              }
              
            } else {
              console.log('❌ ISSUE: Vehicle data is still not properly stored');
              console.log('❌ Vehicle name:', statusData.transaction.vehicleData.name);
            }
            
          } else {
            console.log('❌ Failed to retrieve transaction status');
          }
          
        } else {
          console.log('❌ Could not extract transaction UUID from HTML');
        }
        
      } else {
        console.log('❌ Unexpected response type');
      }
      
    } else {
      console.log('❌ Payment initiation failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testVehiclePayment();
