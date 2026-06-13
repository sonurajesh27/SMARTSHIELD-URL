/**
 * Generates rule-based insights from visit analytics data.
 * @param {Array} visits - Array of Visit documents
 * @returns {Array<string>} - List of natural language insights
 */
const generateInsights = (visits) => {
  const insights = [];

  if (!visits || visits.length === 0) {
    return ['No traffic recorded yet. Insights will compile when visitors use this link.'];
  }

  const total = visits.length;
  const devices = {};
  const browsers = {};
  const hourlyClicks = Array(24).fill(0);

  // Time periods
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let clicksThisWeek = 0;
  let clicksLastWeek = 0;

  visits.forEach((visit) => {
    // Process device
    const device = visit.device || 'Unknown';
    devices[device] = (devices[device] || 0) + 1;

    // Process browser
    const browser = visit.browser || 'Unknown';
    browsers[browser] = (browsers[browser] || 0) + 1;

    // Process timestamp
    const vTime = new Date(visit.timestamp);
    const hr = vTime.getHours();
    hourlyClicks[hr] = (hourlyClicks[hr] || 0) + 1;

    if (vTime >= sevenDaysAgo && vTime <= now) {
      clicksThisWeek++;
    } else if (vTime >= fourteenDaysAgo && vTime < sevenDaysAgo) {
      clicksLastWeek++;
    }
  });

  // 1. Device Insight
  let dominantDevice = '';
  let dominantDeviceCount = 0;
  Object.keys(devices).forEach((dev) => {
    if (devices[dev] > dominantDeviceCount) {
      dominantDeviceCount = devices[dev];
      dominantDevice = dev;
    }
  });

  if (dominantDevice && dominantDevice !== 'Unknown') {
    const pct = Math.round((dominantDeviceCount / total) * 100);
    insights.push(`Most users use ${dominantDevice.toLowerCase()} devices (${pct}% of traffic).`);
  }

  // 2. Browser Insight
  let dominantBrowser = '';
  let dominantBrowserCount = 0;
  Object.keys(browsers).forEach((br) => {
    if (browsers[br] > dominantBrowserCount) {
      dominantBrowserCount = browsers[br];
      dominantBrowser = br;
    }
  });

  if (dominantBrowser && dominantBrowser !== 'Unknown') {
    const pct = Math.round((dominantBrowserCount / total) * 100);
    insights.push(`${dominantBrowser} dominates traffic (${pct}% of visits).`);
  }

  // 3. Peak hour traffic
  let peakHour = 0;
  let maxClicks = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyClicks[i] > maxClicks) {
      maxClicks = hourlyClicks[i];
      peakHour = i;
    }
  }

  if (maxClicks > 0) {
    const startHour = peakHour;
    const endHour = (peakHour + 2) % 24;
    const formatHour = (h) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour} ${suffix}`;
    };
    insights.push(`Peak traffic between ${formatHour(startHour)}–${formatHour(endHour)}.`);
  }

  // 4. Traffic comparison (Growth/Decline)
  if (clicksThisWeek > 0 || clicksLastWeek > 0) {
    if (clicksLastWeek === 0) {
      insights.push('Traffic increased this week.');
    } else {
      const diff = clicksThisWeek - clicksLastWeek;
      if (diff > 0) {
        insights.push('Traffic increased this week.');
      } else if (diff < 0) {
        insights.push('Traffic decreased this week.');
      } else {
        insights.push('Traffic remains stable compared to last week.');
      }
    }
  }

  return insights;
};

module.exports = { generateInsights };
