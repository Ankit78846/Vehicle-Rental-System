// Test localStorage user data and ProfileSidebar display
console.log('🧪 Testing User Data Storage and Display...');

// Check current localStorage values
console.log('\n📱 Current localStorage values:');
console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
console.log('UserId:', localStorage.getItem('userId'));
console.log('Name:', localStorage.getItem('name'));
console.log('Email:', localStorage.getItem('email'));
console.log('ProfileImg:', localStorage.getItem('profileImg'));
console.log('User Object:', localStorage.getItem('user'));

// Parse and display user object if it exists
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('\n👤 Parsed User Object:');
    console.log('ID:', user.id || user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('IsHost:', user.isHost);
  } catch (error) {
    console.error('❌ Error parsing user object:', error);
  }
} else {
  console.log('\n⚠️ No user object found in localStorage');
}

// Test API call for user profile
const testApiCall = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('\n❌ No token found - cannot test API');
    return;
  }
  
  try {
    console.log('\n🌐 Testing API call...');
    const response = await fetch('https://vehicle-rental-system-rjvj.onrender.com/api/fetch/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      const userData = data.data || data;
      console.log('\n👤 User Data from API:');
      console.log('ID:', userData._id);
      console.log('Name:', userData.name);
      console.log('Email:', userData.email);
      console.log('IsHost:', userData.isHost);
      console.log('Image URL:', userData.imgUrl);
    } else {
      console.log('❌ API call failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
  }
};

// Instructions
console.log(`
📋 INSTRUCTIONS:
1. Make sure you're logged in to the app
2. Open the ProfileSidebar to trigger data fetch
3. Run: testApiCall() to test the API directly
4. Check if the user name displays correctly in the ProfileSidebar

🔧 If the name still shows "User":
- Check if the API response contains the name field
- Verify the ProfileSidebar useEffect is running when opened
- Check browser console for any errors
`);

// Auto-run API test if token exists
if (localStorage.getItem('token')) {
  console.log('\n🚀 Auto-running API test...');
  testApiCall();
} else {
  console.log('\n⚠️ Please login first, then run this test');
}

// Export function for manual testing
window.testUserProfile = testApiCall;
