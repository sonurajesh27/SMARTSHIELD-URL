/**
 * Simple rule-based scam and phishing detection utility.
 * Calculates a risk score from 0 to 100 based on keywords, domain structures, and TLDs.
 */
const detectScam = (urlString) => {
  let riskScore = 0;
  const reasons = [];

  try {
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const search = parsedUrl.search.toLowerCase();
    const fullUrlLower = urlString.toLowerCase();

    // 1. Check if the hostname is an IP address (often used in malicious links)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(hostname)) {
      riskScore += 40;
      reasons.push('Hostname is an IP address');
    }

    // 2. Suspicious Top-Level Domains (TLDs)
    const suspiciousTlds = [
      '.xyz', '.top', '.buzz', '.click', '.gq', '.cf', '.fit', '.gdn',
      '.ml', '.ga', '.work', '.date', '.loan', '.cricket', '.bid',
      '.country', '.stream', '.download', '.science', '.racing'
    ];
    const matchedTld = suspiciousTlds.find(tld => hostname.endsWith(tld));
    if (matchedTld) {
      riskScore += 25;
      reasons.push(`Uses a suspicious top-level domain (${matchedTld})`);
    }

    // 3. Excessive subdomains (e.g. paypal.com.verification.sign-in.security-update.net)
    const domainParts = hostname.split('.');
    // For standard domains, it should have 2 parts (e.g., example.com) or 3 parts (e.g., www.example.com or example.co.uk)
    if (domainParts.length > 4) {
      riskScore += 20;
      reasons.push('Excessive number of subdomains');
    }

    // 4. Double hyphens or suspicious hyphens (mimicking brands)
    if (hostname.includes('--') || (hostname.match(/-/g) || []).length > 2) {
      riskScore += 15;
      reasons.push('Suspicious hyphen patterns in domain');
    }

    // 5. Phishing Keywords
    const phishingKeywords = [
      'login', 'verify', 'secure', 'bank', 'paypal', 'signin', 'account',
      'update', 'billing', 'password', 'credential', 'support', 'helpdesk',
      'safety', 'wallet', 'free-gifts', 'win-prize', 'claim-rewards', 'netflix',
      'amazon-gift', 'cash-app', 'google-login', 'microsoft-verify',
      'free', 'claim', 'prize', 'gift', 'reward', 'win'
    ];

    const foundKeywords = [];
    phishingKeywords.forEach(keyword => {
      // Check if keyword is in the hostname (high risk) or pathname (medium risk)
      if (hostname.includes(keyword)) {
        riskScore += 25;
        foundKeywords.push(keyword);
      } else if (pathname.includes(keyword) || search.includes(keyword)) {
        riskScore += 15;
        foundKeywords.push(keyword);
      }
    });

    if (foundKeywords.length > 0) {
      reasons.push(`Contains phishing keyword(s): ${foundKeywords.join(', ')}`);
    }

    // 6. Lookalike Brand Typo-squatting heuristics
    const lookalikes = [
      { pattern: /g00gle/, brand: 'Google' },
      { pattern: /paypa1/, brand: 'PayPal' },
      { pattern: /netf1ix/, brand: 'Netflix' },
      { pattern: /faceb00k/, brand: 'Facebook' },
      { pattern: /micr0s0ft/, brand: 'Microsoft' }
    ];
    lookalikes.forEach(item => {
      if (item.pattern.test(hostname)) {
        riskScore += 35;
        reasons.push(`Domain mimics popular brand: ${item.brand}`);
      }
    });

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    return {
      safe: riskScore < 50,
      riskScore,
      reason: reasons.length > 0 ? reasons.join('; ') : 'No suspicious indicators detected'
    };
  } catch (error) {
    // If URL parsing fails, classify as high risk
    return {
      safe: false,
      riskScore: 100,
      reason: 'Malformed URL or unable to parse'
    };
  }
};

module.exports = { detectScam };
