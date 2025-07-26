// Test user profile fetching and display
const testUserProfile = async () => {
  try {
    console.log('🧪 Testing User Profile Data...');
    
    // Check localStorage for user data
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userStr = localStorage.getItem('user');
    const profileImg = localStorage.getItem('profileImg');
    
    console.log('📱 localStorage Data:');
    console.log('- Token exists:', !!token);
    console.log('- User ID:', userId);
    console.log('- Profile Image:', profileImg);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 User Data:', {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          isHost: user.isHost
        });
      } catch (err) {
        console.error('❌ Error parsing user data:', err);
      }
    } else {
      console.log('⚠️ No user data in localStorage');
    }
    
    // Test API endpoint
    if (token) {
      console.log('\n🌐 Testing API endpoint...');
      const apiUrl = 'https://vehicle-rental-system-rjvj.onrender.com/api/fetch/users/me';
      
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 API Response Status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Response Data Structure:', {
            hasSuccess: 'success' in data,
            hasData: 'data' in data,
            topLevelKeys: Object.keys(data)
          });
          
          const userData = data.data || data;
          console.log('👤 User Profile from API:', {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            isHost: userData.isHost,
            imgUrl: userData.imgUrl
          });
        } else {
          console.error('❌ API request failed:', response.statusText);
        }
      } catch (err) {
        console.error('❌ Network error:', err.message);
      }
    }
    
    console.log('\n✅ User profile test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Instructions for running this test
console.log(`
🧪 USER PROFILE TEST INSTRUCTIONS:
1. Open browser developer console (F12)
2. Navigate to your app and login
3. Copy and paste this entire script into the console
4. Run: testUserProfile()
5. Check the output to see user data structure

Alternatively, you can run this test by:
1. Opening ProfileSidebar 
2. The corrected useEffect should now properly fetch and display user data
`);

// Export for potential use in React components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testUserProfile };
}
