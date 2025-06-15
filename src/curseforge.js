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

// Mostrar información de configuración al iniciar
console.log('[INFO] Iniciando servicio de proxy para CurseForge API');
console.log(`[INFO] URL base de la API: ${CURSEFORGE_API_BASE}`);
console.log(`[INFO] Game ID para Minecraft: ${MINECRAFT_GAME_ID}`);
console.log(`[INFO] API Key configurada: ${process.env.CURSEFORGE_API_KEY ? 'Sí' : 'No'}`);

// Añadir endpoint para download-url que no existe actualmente
router.get('/mods/:modId/files/:fileId/download-url', async (req, res) => {
  try {
    const { modId, fileId } = req.params;
    
    console.log(`[DEBUG] Petición recibida para obtener URL de descarga - modId: ${modId}, fileId: ${fileId}`);
    
    const url = `${CURSEFORGE_API_BASE}/mods/${modId}/files/${fileId}/download-url`;
    console.log(`[DEBUG] URL completa: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'x-api-key': req.apiKey
      }
    });
    
    console.log(`[DEBUG] Respuesta recibida con status: ${response.status}`);
    console.log(`[DEBUG] URL de descarga obtenida: ${response.data.data.substring(0, 50)}...`);
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error al obtener URL de descarga - modId: ${req.params.modId}, fileId: ${req.params.fileId}`);
    console.error(`[ERROR] Mensaje de error: ${error.message}`);
    if (error.response) {
      console.error(`[ERROR] Status de error: ${error.response.status}`);
      console.error(`[ERROR] Datos de error: ${JSON.stringify(error.response.data)}`);
    }
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No hay detalles adicionales'
    });
  }
});

/**
 * Middleware para verificar la presencia de la API key
 */
const requireApiKey = (req, res, next) => {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  
  // Debug: Mostrar información sobre la API key (primeros y últimos caracteres)
  if (apiKey) {
    const firstChars = apiKey.substring(0, 5);
    const lastChars = apiKey.substring(apiKey.length - 5);
    const length = apiKey.length;
    console.log(`[DEBUG] API key encontrada: ${firstChars}...${lastChars} (longitud: ${length})`);
  } else {
    console.error('[ERROR] CURSEFORGE_API_KEY no está configurada en las variables de entorno');
  }
  
  if (!apiKey) {
    return res.status(500).json({
      status: 500,
      message: 'CurseForge API key no configurada en el servidor'
    });
  }
  
  req.apiKey = apiKey;
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
    const ip = req.ip;
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
    
    console.log(`[DEBUG] Petición recibida para obtener info de mod - modId: ${modId}`);
    console.log(`[DEBUG] URL completa: ${CURSEFORGE_API_BASE}/mods/${modId}`);
    console.log(`[DEBUG] Usando API key: ${req.apiKey ? '✓ Configurada' : '✗ No configurada'}`);
    
    // Verificar si la API key tiene el formato correcto (sin revelar la clave completa)
    if (req.apiKey) {
      if (req.apiKey.length < 10) {
        console.warn(`[ADVERTENCIA] La API key parece demasiado corta (${req.apiKey.length} caracteres)`);
      } else {
        console.log(`[DEBUG] Longitud de API key: ${req.apiKey.length} caracteres`);
      }
    }
    
    const response = await axios.get(`${CURSEFORGE_API_BASE}/mods/${modId}`, {
      headers: {
        'x-api-key': req.apiKey
      }
    });
    
    console.log(`[DEBUG] Respuesta recibida con status: ${response.status}`);
    if (response.data && response.data.data) {
      console.log(`[DEBUG] Nombre del mod: ${response.data.data.name || 'No disponible'}`);
      console.log(`[DEBUG] Autor del mod: ${response.data.data.authors ? response.data.data.authors[0]?.name : 'No disponible'}`);
    }
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error al obtener información del mod - modId: ${req.params.modId}`);
    console.error(`[ERROR] Mensaje de error: ${error.message}`);
    if (error.response) {
      console.error(`[ERROR] Status de error: ${error.response.status}`);
      console.error(`[ERROR] Datos de error: ${JSON.stringify(error.response.data || {})}`);
    } else if (error.request) {
      console.error('[ERROR] No se recibió respuesta del servidor de CurseForge');
    }
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No hay detalles adicionales'
    });
  }
});

/**
 * GET - Obtener información de un archivo específico
 */
router.get('/mods/:modId/files/:fileId', async (req, res) => {
  try {
    const { modId, fileId } = req.params;
    
    console.log(`[DEBUG] Petición recibida para obtener info de archivo - modId: ${modId}, fileId: ${fileId}`);
    console.log(`[DEBUG] URL completa: ${CURSEFORGE_API_BASE}/mods/${modId}/files/${fileId}`);
    console.log(`[DEBUG] Cabeceras: x-api-key: ${req.apiKey ? req.apiKey.substring(0, 5) + '...' : 'No disponible'}`);
    
    const response = await axios.get(`${CURSEFORGE_API_BASE}/mods/${modId}/files/${fileId}`, {
      headers: {
        'x-api-key': req.apiKey
      }
    });
    
    console.log(`[DEBUG] Respuesta recibida con status: ${response.status}`);
    console.log(`[DEBUG] Datos recibidos: ${JSON.stringify(response.data).substring(0, 200)}...`);
    
    return res.json({
      status: response.status,
      data: response.data.data
    });
  } catch (error) {
    console.error(`[ERROR] Error al obtener información del archivo - modId: ${req.params.modId}, fileId: ${req.params.fileId}`);
    console.error(`[ERROR] Mensaje de error: ${error.message}`);
    if (error.response) {
      console.error(`[ERROR] Status de error: ${error.response.status}`);
      console.error(`[ERROR] Datos de error: ${JSON.stringify(error.response.data)}`);
    }
    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || 'No hay detalles adicionales'
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