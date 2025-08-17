/**
 * Servicio de proxy para la API de CurseForge
 */
const express = require('express');
const axios = require('axios');
const router = express.Router();

// CurseForge API base URL
const CURSEFORGE_API_BASE = 'https://api.curseforge.com/v1';
// Game ID for Minecraft
const MINECRAFT_GAME_ID = 432;

// Display configuration information on startup
console.log('[INFO] Starting CurseForge API proxy service');
console.log(`[INFO] API base URL: ${CURSEFORGE_API_BASE}`);
console.log(`[INFO] Minecraft Game ID: ${MINECRAFT_GAME_ID}`);
console.log(`[INFO] API Key configured: ${process.env.CURSEFORGE_API_KEY ? 'Yes' : 'No'}`);

// Add endpoint for download-url that doesn't exist currently
router.get('/mods/:modId/files/:fileId/download-url', async (req, res) => {
  try {
    const { modId, fileId } = req.params;
    
    const url = `${CURSEFORGE_API_BASE}/mods/${modId}/files/${fileId}/download-url`;
    
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error obtaining download URL - modId: ${req.params.modId}, fileId: ${req.params.fileId}`, error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

/**
 * Middleware to verify the presence of the API key
 */
const requireApiKey = (req, res, next) => {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  
  if (!apiKey) {
    console.error('[ERROR] CURSEFORGE_API_KEY environment variable not configured');
    return res.status(500).json({
      status: 500,
      message: 'CurseForge API key not configured on the server'
    });
  }
  
  // Validate API key format (CurseForge API keys are typically long strings)
  const trimmedKey = apiKey.trim();
  if (trimmedKey.length < 20) {
    console.error('[ERROR] CURSEFORGE_API_KEY appears to be invalid (too short)');
    return res.status(500).json({
      status: 500,
      message: 'CurseForge API key appears to be invalid'
    });
  }
  
  // Normalize the API key by replacing $$ with $ for actual API requests
  req.apiKey = trimmedKey.replace(/\$\$/g, '$');
  next();
};

/**
 * Middleware para limitar la tasa de peticiones
 * Implementación básica, se puede mejorar con Redis o similar
 */
const rateLimiter = (() => {
  const requestCounts = {};
  const WINDOW_MS = 60 * 1000; // 1 minuto
  const MAX_REQUESTS = 100; // Máximo de peticiones por ventana
  
  return (req, res, next) => {
    // Prefer per-user rate limiting if auth middleware has attached user
    const ip = req.user?.id || req.ip;
    const now = Date.now();
    
    // Inicializar contador para esta IP
    requestCounts[ip] = requestCounts[ip] || { count: 0, resetTime: now + WINDOW_MS };
    
    // Resetear contador si ha pasado el tiempo
    if (now > requestCounts[ip].resetTime) {
      requestCounts[ip] = { count: 1, resetTime: now + WINDOW_MS };
      return next();
    }
    
    // Incrementar contador
    requestCounts[ip].count++;
    
    // Verificar límite
    if (requestCounts[ip].count > MAX_REQUESTS) {
      return res.status(429).json({
        status: 429,
        message: 'Demasiadas peticiones. Por favor, intenta más tarde.'
      });
    }
    
    next();
  };
})();

// Aplicar middleware
router.use(requireApiKey);
router.use(rateLimiter);

/**
 * GET - Obtener información de un mod específico
 */
router.get('/mods/:modId', async (req, res) => {
  try {
    const { modId } = req.params;
    
    const response = await axios.get(`${CURSEFORGE_API_BASE}/mods/${modId}`, {
      headers: {
        'X-API-Key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error getting mod info - modId: ${req.params.modId}`, error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

/**
 * GET - Obtener información de un archivo específico
 */
router.get('/mods/:modId/files/:fileId', async (req, res) => {
  try {
    const { modId, fileId } = req.params;
    
    const response = await axios.get(`${CURSEFORGE_API_BASE}/mods/${modId}/files/${fileId}`, {
      headers: {
        'X-API-Key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Failed to get file info - modId: ${req.params.modId}, fileId: ${req.params.fileId}`, error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

/**
 * POST - Obtener información de varios mods
 */
router.post('/mods', async (req, res) => {
  try {
    const { modIds } = req.body;
    
    if (!modIds || !Array.isArray(modIds) || modIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: 'Se requiere un array de IDs de mods'
      });
    }
    
    const response = await axios.post(`${CURSEFORGE_API_BASE}/mods`, {
      modIds
    }, {
      headers: {
        'X-API-Key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching mods info:', error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
    });
  }
});

/**
 * POST - Obtener información de varios archivos
 */
router.post('/mods/files', async (req, res) => {
  try {
    const { fileIds } = req.body;
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: 'Se requiere un array de IDs de archivos'
      });
    }
    
    const response = await axios.post(`${CURSEFORGE_API_BASE}/mods/files`, {
      fileIds
    }, {
      headers: {
        'X-API-Key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching files info:', error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
    });
  }
});

/**
 * GET - Buscar mods
 */
router.get('/search', async (req, res) => {
  try {
    const { gameVersion, searchFilter, modLoaderType, slug, categoryId, sortField, sortOrder, pageSize = 20, index = 0 } = req.query;
    
    const params = {
      gameId: MINECRAFT_GAME_ID,
      pageSize: Math.min(parseInt(pageSize), 50), // Limitar a 50 resultados máximo
      index: parseInt(index)
    };
    
    // Añadir parámetros opcionales si están presentes
    if (gameVersion) params.gameVersion = gameVersion;
    if (searchFilter) params.searchFilter = searchFilter;
    if (modLoaderType) params.modLoaderType = modLoaderType;
    if (slug) params.slug = slug;
    if (categoryId) params.categoryId = categoryId;
    if (sortField) params.sortField = sortField;
    if (sortOrder) params.sortOrder = sortOrder;
    
    const response = await axios.get(`${CURSEFORGE_API_BASE}/mods/search`, {
      headers: {
        'X-API-Key': req.apiKey
      },
      params
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error searching mods:', error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
    });
  }
});

/**
 * GET - Test CurseForge API connection
 */
router.get('/test', async (req, res) => {
  try {
    console.log('[INFO] Testing CurseForge API connection...');
    
    // Try a simple categories call as a test
    const response = await axios.get(`${CURSEFORGE_API_BASE}/categories`, {
      headers: {
        'X-API-Key': req.apiKey
      },
      params: {
        gameId: MINECRAFT_GAME_ID
      },
      timeout: 10000
    });
    
    return res.json({
      status: 'success',
      message: 'CurseForge API connection successful',
      apiStatus: response.status,
      categoriesCount: response.data.data?.length || 0
    });
  } catch (error) {
    console.error('[ERROR] CurseForge API test failed:', error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] Authentication failed - check API key configuration');
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed: Invalid or missing API key',
        details: 'The CurseForge API rejected the authentication. Verify the CURSEFORGE_API_KEY secret is correctly set.',
        httpStatus: 401
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'CurseForge API test failed',
      details: error.message,
      httpStatus: error.response?.status || 500
    });
  }
});

/**
 * GET - Obtener categorías de mods
 */
router.get('/categories', async (req, res) => {
  try {
    const response = await axios.get(`${CURSEFORGE_API_BASE}/categories`, {
      headers: {
        'X-API-Key': req.apiKey
      },
      params: {
        gameId: MINECRAFT_GAME_ID
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    
    if (error.response?.status === 401) {
      console.error('[ERROR] CurseForge API returned 401 Unauthorized - check API key');
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid API key or API key missing',
        details: 'The CurseForge API rejected the request due to authentication issues'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
    });
  }
});

module.exports = router;