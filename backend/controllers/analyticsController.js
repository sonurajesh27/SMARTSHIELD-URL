const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { generateInsights } = require('../utils/aiInsights');

/**
 * Get analytics for a specific shortened URL
 * GET /api/analytics/:id
 */
const getUrlAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the URL owned by this user
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized' });
    }

    // Retrieve all redirect visits for this URL, sorted newest first
    const visits = await Visit.find({ urlId: id }).sort({ timestamp: -1 });

    // Aggregate statistics
    const devices = { Mobile: 0, Tablet: 0, Desktop: 0, Unknown: 0 };
    const browsers = { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Opera: 0, Unknown: 0 };
    const os = { Windows: 0, macOS: 0, Linux: 0, Android: 0, iOS: 0, Unknown: 0 };

    visits.forEach((v) => {
      // Increment device
      const deviceKey = v.device || 'Unknown';
      devices[deviceKey] = (devices[deviceKey] || 0) + 1;

      // Increment browser
      const browserKey = v.browser || 'Unknown';
      browsers[browserKey] = (browsers[browserKey] || 0) + 1;

      // Increment OS
      const osKey = v.os || 'Unknown';
      os[osKey] = (os[osKey] || 0) + 1;
    });

    // Generate natural-language AI insights
    const insights = generateInsights(visits);

    return res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        scamStatus: url.scamStatus,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        qrCode: url.qrCode
      },
      analytics: {
        totalClicks: url.clicks,
        recordedVisits: visits.length,
        lastVisitedTime: visits.length > 0 ? visits[0].timestamp : null,
        devices,
        browsers,
        os,
        insights,
        history: visits.map(v => ({
          browser: v.browser,
          device: v.device,
          os: v.os,
          ip: v.ip,
          timestamp: v.timestamp
        }))
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return res.status(500).json({ message: 'Server error retrieving analytics', error: error.message });
  }
};

module.exports = {
  getUrlAnalytics
};
