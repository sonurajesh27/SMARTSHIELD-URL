const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim() === '' || username.trim().length < 5) {
    errors.push('Username must be at least 5 characters.');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

const validateUrlCreate = (req, res, next) => {
  const { originalUrl, customAlias, expiresAt } = req.body;
  const errors = [];

  if (!originalUrl || typeof originalUrl !== 'string') {
    errors.push('Original URL is required.');
  } else {
    try {
      new URL(originalUrl);
    } catch (err) {
      errors.push('Invalid URL format. Must include protocol (e.g., http:// or https://).');
    }
  }

  if (customAlias) {
    if (typeof customAlias !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(customAlias)) {
      errors.push('Custom alias can only contain alphanumeric characters, hyphens, and underscores.');
    }
    if (customAlias.length < 3 || customAlias.length > 30) {
      errors.push('Custom alias must be between 3 and 30 characters.');
    }
    // Prevent overriding system API endpoints
    const reservedRoutes = ['api', 'auth', 'url', 'analytics', 'static', 'favicon.ico'];
    if (reservedRoutes.includes(customAlias.toLowerCase())) {
      errors.push('This custom alias is reserved and cannot be used.');
    }
  }

  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      errors.push('Invalid date format for expiresAt.');
    } else if (expiryDate <= new Date()) {
      errors.push('Expiration date must be in the future.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUrlCreate
};
