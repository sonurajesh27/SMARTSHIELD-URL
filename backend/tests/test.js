/* eslint-env node */
/* global require, process, console, fetch */
require('dotenv').config();
const mongoose = require('mongoose');

// Set env variables for testing before loading server
let testMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!testMongoUri || testMongoUri === 'your_mongodb_url') {
  testMongoUri = 'mongodb://127.0.0.1:27017/smartshield_test';
}
process.env.MONGODB_URI = testMongoUri;
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.PORT = 5001;
process.env.BASE_URL = 'http://localhost:5001';

const server = require('../server');

const TEST_USER = {
  username: 'test_hackathon_user',
  email: `test_${Date.now()}@example.com`,
  password: 'SecurePassword123'
};

let authToken = '';
let testUrlId = '';
let testShortCode = '';

async function runTests() {
  console.log('\n🚀 Starting SmartShield URL Backend Integration Tests...\n');
  let exitCode = 0;

  try {
    // Wait briefly for MongoDB to connect
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 1. Sign Up Test
    console.log('🔄 Test 1: User Registration...');
    const signupRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    const signupData = await signupRes.json();
    if (signupRes.status !== 201 || !signupData.token) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }
    console.log('✅ Signup successful! Token received.');

    // 2. Login Test
    console.log('\n🔄 Test 2: User Login...');
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    authToken = loginData.token;
    console.log('✅ Login successful! JWT verified.');

    // 3. Create URL (Safe Link) Test
    console.log('\n🔄 Test 3: Create Short URL (Safe Site)...');
    const createRes = await fetch('http://localhost:5001/api/url/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        originalUrl: 'https://github.com/google/deepmind',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day expiry
      })
    });
    const createData = await createRes.json();
    if (createRes.status !== 201 || !createData.url) {
      throw new Error(`Create URL failed: ${JSON.stringify(createData)}`);
    }
    testUrlId = createData.url._id;
    testShortCode = createData.url.shortCode;
    console.log(`✅ Safe short URL created: ${createData.url.shortCode}`);
    console.log(`🛡️ Scam Status: safe=${createData.url.scamStatus.safe}, score=${createData.url.scamStatus.riskScore}`);
    console.log(`📷 QR Code generated (base64 length: ${createData.url.qrCode.length})`);

    // 4. Create URL (Scam Link) Test
    console.log('\n🔄 Test 4: Create Short URL (Suspicious Site)...');
    const scamCreateRes = await fetch('http://localhost:5001/api/url/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        originalUrl: 'https://paypal-verify-login-security.xyz/signin/update'
      })
    });
    const scamCreateData = await scamCreateRes.json();
    if (scamCreateRes.status !== 201 || !scamCreateData.url) {
      throw new Error(`Create Scam URL failed: ${JSON.stringify(scamCreateData)}`);
    }
    console.log(`✅ Suspicious short URL created: ${scamCreateData.url.shortCode}`);
    console.log(`⚠️ Scam Detection: safe=${scamCreateData.url.scamStatus.safe}, score=${scamCreateData.url.scamStatus.riskScore}`);
    console.log(`📝 Reason flagged: "${scamCreateData.url.scamStatus.reason}"`);

    // 5. List all URLs Test
    console.log('\n🔄 Test 5: List All URLs...');
    const listRes = await fetch('http://localhost:5001/api/url/all', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const listData = await listRes.json();
    if (listRes.status !== 200 || !Array.isArray(listData.urls)) {
      throw new Error(`List URLs failed: ${JSON.stringify(listData)}`);
    }
    console.log(`✅ Fetched ${listData.urls.length} URLs successfully.`);

    // 6. Redirect URL Test (Capturing Analytics)
    console.log('\n🔄 Test 6: Redirection & Analytics Capture...');
    // Simulated Client 1: Chrome on Windows Desktop
    await fetch(`http://localhost:5001/${testShortCode}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-forwarded-for': '203.0.113.195'
      },
      redirect: 'manual' // Prevent following redirect to keep check local
    });

    // Simulated Client 2: Safari on iPhone (Mobile)
    await fetch(`http://localhost:5001/${testShortCode}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        'x-forwarded-for': '198.51.100.42'
      },
      redirect: 'manual'
    });
    console.log('✅ Simulated 2 clicks with different User-Agents and IPs.');

    // 7. Get Analytics & AI Insights Test
    console.log('\n🔄 Test 7: Retrieve URL Analytics & AI Insights...');
    const analyticsRes = await fetch(`http://localhost:5001/api/analytics/${testUrlId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const analyticsData = await analyticsRes.json();
    if (analyticsRes.status !== 200 || !analyticsData.analytics) {
      throw new Error(`Fetch analytics failed: ${JSON.stringify(analyticsData)}`);
    }
    console.log(`📈 Clicks: ${analyticsData.analytics.totalClicks} (Recorded: ${analyticsData.analytics.recordedVisits})`);
    console.log('📊 Devices breakdown:', analyticsData.analytics.devices);
    console.log('📊 Browsers breakdown:', analyticsData.analytics.browsers);
    console.log('📊 OS breakdown:', analyticsData.analytics.os);
    console.log('🧠 AI Insights generated:');
    analyticsData.analytics.insights.forEach(insight => console.log(`   - "${insight}"`));
    
    // 8. Custom Alias Update Test
    console.log('\n🔄 Test 8: Update Custom Alias & Expiry...');
    const customAliasName = `test_alias_${Date.now().toString().slice(-4)}`;
    const updateRes = await fetch(`http://localhost:5001/api/url/${testUrlId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        customAlias: customAliasName,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days
      })
    });
    const updateData = await updateRes.json();
    if (updateRes.status !== 200 || updateData.url.shortCode !== customAliasName) {
      throw new Error(`Update URL failed: ${JSON.stringify(updateData)}`);
    }
    console.log(`✅ URL updated with custom alias: "${updateData.url.shortCode}"`);

    // 9. Redirect with Custom Alias Test
    console.log('\n🔄 Test 9: Redirect with Custom Alias...');
    const customRedirectRes = await fetch(`http://localhost:5001/${customAliasName}`, {
      redirect: 'manual'
    });
    if (customRedirectRes.status !== 302) { // 302 Found redirect status
      throw new Error(`Redirect with custom alias failed: Status ${customRedirectRes.status}`);
    }
    console.log(`✅ Redirected successfully to target: ${customRedirectRes.headers.get('location')}`);

    // 10. Expiry link test
    console.log('\n🔄 Test 10: Expired link validation...');
    // Artificially update link expiry to past in DB to test expiry response
    await mongoose.connection.collection('urls').updateOne(
      { _id: new mongoose.Types.ObjectId(testUrlId) },
      { $set: { expiresAt: new Date(Date.now() - 10000) } } // expired 10s ago
    );
    const expiredRes = await fetch(`http://localhost:5001/${customAliasName}`, {
      redirect: 'manual'
    });
    if (expiredRes.status !== 410) {
      throw new Error(`Expected status 410 Gone for expired link, got: ${expiredRes.status}`);
    }
    console.log('✅ Link expiry check worked: link rejected with 410 Gone.');

    // 11. Delete URL Test
    console.log('\n🔄 Test 11: Delete Short URL & Cleanup...');
    const deleteRes = await fetch(`http://localhost:5001/api/url/${testUrlId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.status !== 200) {
      throw new Error(`Delete URL failed: ${JSON.stringify(deleteData)}`);
    }
    console.log('✅ URL deleted successfully.');

    // Verify cleanup
    const cleanVisits = await mongoose.connection.collection('visits').countDocuments({ urlId: new mongoose.Types.ObjectId(testUrlId) });
    console.log(`🧹 Associated visits count remaining: ${cleanVisits}`);
    if (cleanVisits !== 0) {
      throw new Error('Visit records were not cleaned up upon URL deletion.');
    }
    console.log('✅ Visits cleaned up successfully.');

    console.log('\n⭐ ALL TESTS COMPLETED SUCCESSFULLY! ⭐\n');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    exitCode = 1;
  } finally {
    // Terminate server and Mongoose connection cleanly
    console.log('🔌 Shutting down test server and DB connections...');
    server.close(async () => {
      await mongoose.disconnect();
      console.log('👋 Done.');
      process.exit(exitCode);
    });
  }
}

runTests();
