const supabase = require('./config/database');

// Test database connection
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

// Test JWT configuration
function testJWT() {
  try {
    const jwt = require('./config/jwt');
    const testPayload = { id: 'test', username: 'testuser', role: 'user' };
    const token = jwt.generateToken(testPayload);
    const decoded = jwt.verifyToken(token);
    
    console.log('✅ JWT configuration successful');
    return true;
  } catch (error) {
    console.error('❌ JWT configuration failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running backend tests...\n');
  
  const dbTest = await testDatabaseConnection();
  const jwtTest = testJWT();
  
  console.log('\n📊 Test Results:');
  console.log(`Database Connection: ${dbTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`JWT Configuration: ${jwtTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (dbTest && jwtTest) {
    console.log('\n🎉 All tests passed! You can start the server.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
  }
}

runTests();