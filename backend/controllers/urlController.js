const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { generateQR } = require('../utils/qrGenerator');
const { detectScam } = require('../utils/scamDetector');

/**
 * Parses user agent string to identify browser, OS, and device type.
 */
const parseUserAgent = (uaString) => {
  const ua = uaString || '';
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop'; // Default to desktop

  // Browser detection
  if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  }

  // OS detection
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Linux') && !ua.includes('Android')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    device = ua.includes('iPad') ? 'Tablet' : 'Mobile';
  }

  // Mobile device refinement
  if (device === 'Desktop') {
    const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone', 'Opera Mini'];
    if (mobileKeywords.some(keyword => ua.includes(keyword))) {
      device = 'Mobile';
    }
  }

  return { browser, os, device };
};

/**
 * Create a shortened URL
 * POST /api/url/create
 */
const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user._id;

    let shortCode;

    // Handle Custom Alias
    if (customAlias) {
      const alias = customAlias.trim();
      
      // Check if alias is already in use (either as shortCode or customAlias)
      const existing = await Url.findOne({
        $or: [{ shortCode: alias }, { customAlias: alias }]
      });

      if (existing) {
        return res.status(400).json({ message: 'Custom alias is already in use' });
      }
      shortCode = alias;
    } else {
      // Generate a unique 7-char shortCode using nanoid
      let unique = false;
      while (!unique) {
        shortCode = nanoid(7);
        const codeExists = await Url.findOne({ shortCode });
        if (!codeExists) {
          unique = true;
        }
      }
    }

    // Run Scam Detection
    const scamResult = detectScam(originalUrl);

    // Build the short URL link
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Generate QR Code
    const qrCode = await generateQR(shortUrl);

    // Build the URL Document
    const urlPayload = {
      originalUrl,
      shortCode,
      userId,
      qrCode,
      scamStatus: scamResult,
      createdAt: new Date()
    };

    if (customAlias) {
      urlPayload.customAlias = customAlias.trim();
    }

    if (expiresAt) {
      urlPayload.expiresAt = new Date(expiresAt);
    }

    const url = await Url.create(urlPayload);

    return res.status(201).json({
      message: 'Short URL created successfully',
      url
    });
  } catch (error) {
    console.error('Create URL error:', error);
    return res.status(500).json({ message: 'Server error during URL creation', error: error.message });
  }
};

/**
 * Get all URLs created by the authenticated user
 * GET /api/url/all
 */
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ urls });
  } catch (error) {
    console.error('Get all URLs error:', error);
    return res.status(500).json({ message: 'Server error fetching URLs', error: error.message });
  }
};

/**
 * Update an existing URL
 * PUT /api/url/:id
 */
const updateUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalUrl, customAlias, expiresAt, expiryDate } = req.body;
    const userId = req.user._id;

    // Find the URL owned by this user
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized' });
    }

    let originalUrlChanged = false;
    let shortCodeChanged = false;

    // 1. Handle originalUrl Update
    if (originalUrl !== undefined && originalUrl !== null) {
      const trimmedUrl = originalUrl.trim();
      if (trimmedUrl === '') {
        return res.status(400).json({ message: 'Original URL cannot be empty' });
      }
      try {
        new URL(trimmedUrl);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid URL format. Must include protocol (e.g., http:// or https://).' });
      }

      if (trimmedUrl !== url.originalUrl) {
        url.originalUrl = trimmedUrl;
        originalUrlChanged = true;
      }
    }

    // 2. Handle Custom Alias Update
    if (customAlias !== undefined && customAlias !== null) {
      const alias = customAlias.trim();
      if (alias !== '' && alias !== url.customAlias) {
        // Validation
        if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
          return res.status(400).json({ message: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores.' });
        }
        if (alias.length < 3 || alias.length > 30) {
          return res.status(400).json({ message: 'Custom alias must be between 3 and 30 characters.' });
        }
        const reservedRoutes = ['api', 'auth', 'url', 'analytics', 'static', 'favicon.ico'];
        if (reservedRoutes.includes(alias.toLowerCase())) {
          return res.status(400).json({ message: 'This custom alias is reserved and cannot be used.' });
        }

        // Check if alias is already in use
        const existing = await Url.findOne({
          _id: { $ne: id }, // Exclude current record
          $or: [{ shortCode: alias }, { customAlias: alias }]
        });

        if (existing) {
          return res.status(400).json({ message: 'Custom alias is already in use' });
        }

        url.customAlias = alias;
        url.shortCode = alias;
        shortCodeChanged = true;
      }
    }

    // 3. Handle Expiry Date Update (supports both expiresAt and expiryDate)
    const finalExpiry = expiresAt !== undefined ? expiresAt : expiryDate;
    if (finalExpiry !== undefined) {
      if (finalExpiry === null || finalExpiry === '') {
        url.expiresAt = undefined;
      } else {
        const expiryDateObj = new Date(finalExpiry);
        if (isNaN(expiryDateObj.getTime())) {
          return res.status(400).json({ message: 'Invalid expiration date' });
        }
        if (expiryDateObj <= new Date()) {
          return res.status(400).json({ message: 'Expiration date must be in the future.' });
        }
        url.expiresAt = expiryDateObj;
      }
    }

    // 4. Re-run Scam Detection if originalUrl changed
    if (originalUrlChanged) {
      url.scamStatus = detectScam(url.originalUrl);
    }

    // 5. Regenerate QR Code if either originalUrl or shortCode/customAlias changed
    if (originalUrlChanged || shortCodeChanged) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const shortUrl = `${baseUrl}/${url.shortCode}`;
      url.qrCode = await generateQR(shortUrl);
    }

    await url.save();

    return res.json({
      message: 'URL updated successfully',
      url
    });
  } catch (error) {
    console.error('Update URL error:', error);
    return res.status(500).json({ message: 'Server error updating URL', error: error.message });
  }
};

/**
 * Delete an existing URL and its visit logs
 * DELETE /api/url/:id
 */
const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and delete the URL owned by this user
    const url = await Url.findOneAndDelete({ _id: id, userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized' });
    }

    // Clean up associated visit history
    await Visit.deleteMany({ urlId: id });

    return res.json({ message: 'URL and associated visit logs deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    return res.status(500).json({ message: 'Server error deleting URL', error: error.message });
  }
};

/**
 * Redirect from short URL code to original destination
 * GET /:shortCode
 */
const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL in DB using shortCode
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Shortened URL not found' });
    }

    // Validate Expiry Date
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'This shortened link has expired' });
    }

    // Increment click count atomically
    await Url.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });

    // Capture Visit Details
    const uaInfo = parseUserAgent(req.headers['user-agent']);
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const ip = rawIp === '::1' ? '127.0.0.1' : rawIp.split(',')[0].trim();

    // Save visit log in Visit collection
    await Visit.create({
      urlId: url._id,
      browser: uaInfo.browser,
      device: uaInfo.device,
      os: uaInfo.os,
      ip,
      timestamp: new Date()
    });

    // Return redirection
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirection error:', error);
    return res.status(500).json({ message: 'Server error during redirect', error: error.message });
  }
};

/**
 * Bulk create shortened URLs
 * POST /api/url/bulk
 */
const bulkCreateUrls = async (req, res) => {
  try {
    const { urls } = req.body;
    const userId = req.user._id;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'Input must be an array of URL objects' });
    }

    const createdUrls = [];
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const { originalUrl, customAlias, expiresAt } = urls[i];

      // Basic validation
      if (!originalUrl) {
        errors.push({ index: i, message: 'Original URL is required' });
        continue;
      }

      try {
        new URL(originalUrl);
      } catch (err) {
        errors.push({ index: i, url: originalUrl, message: 'Invalid URL format' });
        continue;
      }

      let shortCode;
      if (customAlias) {
        const alias = customAlias.trim();
        // Check if alias is already in use
        const existing = await Url.findOne({
          $or: [{ shortCode: alias }, { customAlias: alias }]
        });
        if (existing) {
          errors.push({ index: i, url: originalUrl, message: `Alias "${alias}" already in use` });
          continue;
        }
        shortCode = alias;
      } else {
        // Generate a unique 7-char shortCode using nanoid
        let unique = false;
        while (!unique) {
          shortCode = nanoid(7);
          const codeExists = await Url.findOne({ shortCode });
          if (!codeExists) {
            unique = true;
          }
        }
      }

      // Run Scam Detection
      const scamResult = detectScam(originalUrl);

      // Build the short URL link
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const shortUrl = `${baseUrl}/${shortCode}`;

      // Generate QR Code
      const qrCode = await generateQR(shortUrl);

      // Build the URL Document
      const urlPayload = {
        originalUrl,
        shortCode,
        userId,
        qrCode,
        scamStatus: scamResult,
        createdAt: new Date()
      };

      if (customAlias) {
        urlPayload.customAlias = customAlias.trim();
      }

      if (expiresAt) {
        urlPayload.expiresAt = new Date(expiresAt);
      }

      const urlObj = await Url.create(urlPayload);
      createdUrls.push(urlObj);
    }

    return res.status(201).json({
      message: `Bulk creation completed: ${createdUrls.length} created, ${errors.length} failed.`,
      urls: createdUrls,
      errors
    });
  } catch (error) {
    console.error('Bulk create URL error:', error);
    return res.status(500).json({ message: 'Server error during bulk URL creation', error: error.message });
  }
};

/**
 * Get public stats for a shortened URL
 * GET /api/url/stats/:shortCode
 */
const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Shortened URL not found' });
    }

    // Return only non-sensitive metrics
    return res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      customAlias: url.customAlias,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      scamStatus: {
        safe: url.scamStatus?.safe,
        riskScore: url.scamStatus?.riskScore,
        reason: url.scamStatus?.reason
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};

module.exports = {
  createUrl,
  getAllUrls,
  updateUrl,
  deleteUrl,
  redirectUrl,
  bulkCreateUrls,
  getPublicStats
};
