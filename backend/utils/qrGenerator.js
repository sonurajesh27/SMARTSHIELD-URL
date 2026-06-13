const QRCode = require('qrcode');

/**
 * Generates a base64 Data URL for a QR Code representing the given text (e.g., short URL)
 * @param {string} text - The text/URL to encode in the QR code
 * @returns {Promise<string>} - Base64 data URL
 */
const generateQR = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H', // High error correction
      margin: 1,
      width: 300,
      color: {
        dark: '#1e293b',  // Dark slate
        light: '#ffffff'  // White background
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR Generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQR };
