/* eslint-env node */
/* global require, process, console */
const { detectScam } = require('../utils/scamDetector');
const { generateInsights } = require('../utils/aiInsights');
const { generateQR } = require('../utils/qrGenerator');
const { validateSignup, validateLogin, validateUrlCreate } = require('../middleware/validateMiddleware');

console.log('🧪 Starting SmartShield URL Backend Unit Tests (Offline Validation)...');
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    testsFailed++;
  }
}

// Mock Express response and next handler for middleware testing
const createMockRes = () => {
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    }
  };
  return res;
};

async function runUnitTests() {
  try {
    // ----------------------------------------------------
    console.log('\n--- Test Suite 1: Scam Detection Utility ---');
    
    // Safe site
    const result1 = detectScam('https://google.com/search');
    assert(result1.safe === true, 'google.com should be classified as safe');
    assert(result1.riskScore === 0, 'google.com should have a risk score of 0');

    // Phishing keyword in path
    const result2 = detectScam('https://my-safe-domain.com/secure-login-verify');
    assert(result2.safe === false || result2.riskScore > 30, 'Phishing keywords in path should increase risk score');
    assert(result2.reason.includes('phishing keyword'), 'Reason should report phishing keywords');

    // Malicious TLD
    const result3 = detectScam('https://free-prizes-claim.xyz');
    assert(result3.safe === false, 'xyz scam site should be classified as unsafe');
    assert(result3.riskScore >= 50, 'xyz scam site should have risk score >= 50');
    assert(result3.reason.includes('suspicious top-level domain'), 'Reason should report TLD');

    // Typo-squatting
    const result4 = detectScam('https://paypa1-update.com');
    assert(result4.riskScore >= 35, 'paypa1 lookalike domain should raise risk score');
    assert(result4.reason.includes('mimics popular brand'), 'Reason should identify brand spoofing');


    // ----------------------------------------------------
    console.log('\n--- Test Suite 2: AI Insights Utility ---');
    
    // Test empty visits
    const emptyInsights = generateInsights([]);
    assert(emptyInsights[0].includes('No traffic recorded'), 'Empty visits should return placeholder insight');

    // Test traffic metrics aggregation
    const mockVisits = [
      { device: 'Mobile', browser: 'Chrome', os: 'Android', timestamp: new Date() },
      { device: 'Mobile', browser: 'Safari', os: 'iOS', timestamp: new Date() },
      { device: 'Desktop', browser: 'Chrome', os: 'Windows', timestamp: new Date() },
      { device: 'Mobile', browser: 'Chrome', os: 'Android', timestamp: new Date() }
    ];
    const insights = generateInsights(mockVisits);
    
    const deviceInsight = insights.find(i => i.includes('mobile'));
    assert(!!deviceInsight, 'Should generate device insights statement');
    assert(deviceInsight.includes('75%'), 'Device insight should show correct percentage (75%)');

    const browserInsight = insights.find(i => i.includes('Chrome'));
    assert(!!browserInsight, 'Should generate browser dominance insight for Chrome');

    // ----------------------------------------------------
    console.log('\n--- Test Suite 3: QR Code Generator ---');
    const qrData = await generateQR('https://test-link.com');
    assert(qrData.startsWith('data:image/png;base64,'), 'Should generate a base64 PNG data URL');


    // ----------------------------------------------------
    console.log('\n--- Test Suite 4: Validation Middleware ---');
    
    // Test validateSignup with invalid email
    const req1 = { body: { username: 'test', email: 'invalid-email', password: '123' } };
    const res1 = createMockRes();
    let nextCalled1 = false;
    validateSignup(req1, res1, () => { nextCalled1 = true; });
    assert(nextCalled1 === false, 'Signup middleware should block invalid email');
    assert(res1.statusCode === 400, 'Signup middleware should return status 400 for errors');
    assert(res1.data.errors.some(e => e.includes('email')), 'Signup error should mention email');
    assert(res1.data.errors.some(e => e.includes('Password')), 'Signup error should mention password length');

    // Test validateUrlCreate with malformed URL
    const req2 = { body: { originalUrl: 'not_a_url' } };
    const res2 = createMockRes();
    let nextCalled2 = false;
    validateUrlCreate(req2, res2, () => { nextCalled2 = true; });
    assert(nextCalled2 === false, 'URL validation should block malformed URL');
    assert(res2.data.errors.some(e => e.includes('protocol')), 'URL error should require protocol');

    // Test validateUrlCreate with valid inputs
    const req3 = { body: { originalUrl: 'https://test.com', customAlias: 'my-alias_123', expiresAt: new Date(Date.now() + 60000).toISOString() } };
    const res3 = createMockRes();
    let nextCalled3 = false;
    validateUrlCreate(req3, res3, () => { nextCalled3 = true; });
    assert(nextCalled3 === true, 'URL validation should pass valid inputs');

    console.log(`\n🎉 Unit tests completed: ${testsPassed} passed, ${testsFailed} failed.\n`);
    if (testsFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error executing unit tests:', error);
    process.exit(1);
  }
}

runUnitTests();
