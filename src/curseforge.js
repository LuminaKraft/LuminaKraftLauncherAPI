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
        'x-api-key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error obtaining download URL - modId: ${req.params.modId}, fileId: ${req.params.fileId}`);
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
    return res.status(500).json({
      status: 500,
      message: 'CurseForge API key not configured on the server'
    });
  }
  
  // Normalize the API key by replacing $$ with $ for actual API requests
  req.apiKey = apiKey.replace(/\$\$/g, '$');
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
        'x-api-key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error getting mod info - modId: ${req.params.modId}`);
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
        'x-api-key': req.apiKey
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Failed to get file info - modId: ${req.params.modId}, fileId: ${req.params.fileId}`);
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
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching mods info:', error.message);
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
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching files info:', error.message);
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
        'x-api-key': req.apiKey
      },
      params
    });
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error searching mods:', error.message);
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
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
        'x-api-key': req.apiKey
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
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message
    });
  }
});

module.exports = router;