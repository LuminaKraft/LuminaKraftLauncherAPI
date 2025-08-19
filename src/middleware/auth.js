const axios = require('axios');

// Simple in-memory token verification cache
// token -> { userId, username, expiresAt }
const tokenCache = new Map();

// Helper to verify Microsoft/Minecraft access token and return user identity
async function verifyMicrosoftToken(accessToken) {
  const cached = tokenCache.get(accessToken);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { userId: cached.userId, username: cached.username };
  }

  // Verify by calling Minecraft profile API
  const response = await axios.get('https://api.minecraftservices.com/minecraft/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    timeout: 5000,
    validateStatus: () => true,
  });

  if (response.status !== 200 || !response.data?.id) {
    throw new Error('Invalid Microsoft token');
  }

  const userId = response.data.id; // Minecraft UUID without dashes
  const username = response.data.name || 'MinecraftUser';

  // Cache for 5 minutes
  tokenCache.set(accessToken, {
    userId,
    username,
    expiresAt: now + 5 * 60 * 1000,
  });

  return { userId, username };
}

// Validate launcher-generated client token (offline users)
function verifyLauncherToken(token) {
  // Minimal validation: base64url token with sensible length
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  // Base64url tokens from launcher should be at least 16 chars (after padding removal)
  if (trimmed.length < 16) return null;
  // Allow base64url characters: A-Z, a-z, 0-9, -, _
  if (!/^[A-Za-z0-9_\-]+$/.test(trimmed)) return null;
  // Use token itself as stable user identifier for rate limiting
  return { userId: `lk_${trimmed}`, username: 'OfflineUser' };
}

// Authentication middleware: supports Microsoft token or launcher token
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const launcherTokenHeader = req.headers['x-lk-token'] || req.headers['x-luminakraft-token'];


    let userId = null;
    let username = null;

    // 1) Try Microsoft Bearer token
    if (authHeader && authHeader.toString().startsWith('Bearer ')) {
      const token = authHeader.toString().slice('Bearer '.length).trim();
      if (token) {
        try {
          const result = await verifyMicrosoftToken(token);
          userId = result.userId;
          username = result.username;
        } catch (_) {
          // fall through to launcher token
        }
      }
    }

    // 2) Fallback to launcher token for offline users
    if (!userId && launcherTokenHeader) {
      const tokenString = launcherTokenHeader.toString();
      const verified = verifyLauncherToken(tokenString);
      
      if (verified) {
        userId = verified.userId;
        username = verified.username;
      }
    }

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authentication token',
      });
    }

    // Attach user to request
    req.user = { id: userId, username };

    // Optional: attach client info header
    req.client = {
      name: req.headers['x-luminakraft-client'] || 'unknown',
      ip: req.ip,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

// Per-user rate limiter (memory-based)
function createPerUserRateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  const counters = new Map(); // key -> { count, resetTime }

  return function perUserRateLimiter(req, res, next) {
    const now = Date.now();
    const userKey = req.user?.id || `ip:${req.ip}`;

    let entry = counters.get(userKey);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      counters.set(userKey, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetInSeconds: retryAfterSec,
      });
    }

    next();
  };
}

module.exports = {
  authenticateUser,
  createPerUserRateLimiter,
};


