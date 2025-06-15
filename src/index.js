const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Importar router de CurseForge
const curseforgeRouter = require('./curseforge');

const app = express();
const PORT = process.env.PORT || 9374;

// Compartir la API key corregida con el resto de la aplicación

// Load CurseForge API key from environment variable
let CURSEFORGE_API_KEY = process.env.CURSEFORGE_API_KEY;

// Fix para el problema de Docker Compose con los símbolos $ en la API key
// Docker Compose elimina un $ cuando hay dos $$ consecutivos en variables de entorno
if (CURSEFORGE_API_KEY) {
  console.log('[INFO] Verificando si la API key necesita corrección por problema de Docker Compose...');
  
  // Solución robusta: detectar patrones comunes donde puede faltar un $
  // 1. Caso especial para formato bcrypt que comienza con $2a$10$
  if (CURSEFORGE_API_KEY.startsWith('2a') || CURSEFORGE_API_KEY.startsWith('a$10')) {
    console.log('[INFO] Detectada API key con formato bcrypt que ha perdido símbolos $');
    // Restaurar el formato correcto
    CURSEFORGE_API_KEY = '$2a$10$' + CURSEFORGE_API_KEY.replace(/^\$?2a\$?\$?10\$?/, '');
    console.log('[INFO] API key corregida con formato bcrypt estándar');
  }
  
  // 2. Solución general: buscar patrones donde probablemente falta un $ duplicado
  // Buscar caracteres que normalmente siguen a un $ en tokens/hashes
  const originalKey = CURSEFORGE_API_KEY;
  const correctedKey = CURSEFORGE_API_KEY.replace(/([^$])(\d[a-zA-Z]|[a-zA-Z]\d)(?!\$)/g, '$1$$2');
  
  if (originalKey !== correctedKey) {
    console.log('[INFO] Detectados posibles puntos donde falta un $ duplicado');
    CURSEFORGE_API_KEY = correctedKey;
  }
  
  // 3. Detectar si hay $ consecutivos que podrían indicar que la key ya estaba escapada para Docker
  if (CURSEFORGE_API_KEY.includes('$$')) {
    console.log('[INFO] Detectados $$ consecutivos en la API key, normalizando...');
    CURSEFORGE_API_KEY = CURSEFORGE_API_KEY.replace(/\$\$/g, '$');
  }
}

if (!CURSEFORGE_API_KEY) {
  console.warn('CURSEFORGE_API_KEY environment variable not set. CurseForge endpoints will not work.');
} else {
  console.log(`[DEBUG] CURSEFORGE_API_KEY encontrada en index.js. Longitud: ${CURSEFORGE_API_KEY.length} caracteres`);
  
  // Mostrar de manera segura sin revelar toda la clave
  const safeDisplay = CURSEFORGE_API_KEY.replace(/./g, (char, index) => {
    if (index < 5 || index >= CURSEFORGE_API_KEY.length - 5) {
      return char;
    }
    return '*';
  });
  
  console.log(`[DEBUG] API key (enmascarada): ${safeDisplay}`);
  
  // Verificar si la API key parece válida (formato básico)
  if (CURSEFORGE_API_KEY.length < 10) {
    console.warn('[ADVERTENCIA] La API key parece demasiado corta, podría no ser válida');
  }
  
  // Compartir la API key corregida con el resto de la aplicación
  app.set('curseforgeApiKey', CURSEFORGE_API_KEY);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// Main launcher data endpoint
app.get('/v1/launcher_data.json', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/launcher_data.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        error: 'Launcher data not found',
        message: 'The launcher data file does not exist'
      });
    }

    const launcherData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(launcherData);
  } catch (error) {
    console.error('Error serving launcher data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to load launcher data'
    });
  }
});

// Get specific modpack data
app.get('/v1/modpacks/:id', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/launcher_data.json');
    const launcherData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const modpack = launcherData.modpacks.find(mp => mp.id === req.params.id);
    
    if (!modpack) {
      return res.status(404).json({ 
        error: 'Modpack not found',
        message: `Modpack with ID '${req.params.id}' does not exist`
      });
    }
    
    res.json(modpack);
  } catch (error) {
    console.error('Error serving modpack data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to load modpack data'
    });
  }
});

// List all available modpacks
app.get('/v1/modpacks', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/launcher_data.json');
    const launcherData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.json({
      count: launcherData.modpacks.length,
      modpacks: launcherData.modpacks.map(mp => ({
        id: mp.id,
        nombre: mp.nombre,
        version: mp.version,
        minecraftVersion: mp.minecraftVersion,
        modloader: mp.modloader
      }))
    });
  } catch (error) {
    console.error('Error serving modpacks list:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to load modpacks list'
    });
  }
});

// Translations endpoint
app.get('/v1/translations/:lang', (req, res) => {
  try {
    const lang = req.params.lang;
    const supportedLangs = ['es', 'en'];
    
    if (!supportedLangs.includes(lang)) {
      return res.status(404).json({
        error: 'Language not supported',
        message: `Language '${lang}' is not supported. Available languages: ${supportedLangs.join(', ')}`
      });
    }
    
    const translationPath = path.join(__dirname, `../data/translations/${lang}.json`);
    
    if (!fs.existsSync(translationPath)) {
      return res.status(404).json({
        error: 'Translation file not found',
        message: `Translation file for language '${lang}' does not exist`
      });
    }
    
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json(translations);
  } catch (error) {
    console.error('Error reading translation data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to read translation data'
    });
  }
});

// Available languages endpoint
app.get('/v1/translations', (req, res) => {
  try {
    const translationsDir = path.join(__dirname, '../data/translations');
    const files = fs.readdirSync(translationsDir);
    const languages = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    res.json({
      availableLanguages: languages,
      defaultLanguage: 'es'
    });
  } catch (error) {
    console.error('Error reading translations directory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to read available languages'
    });
  }
});

// Get features for a specific modpack in a specific language
app.get('/v1/modpacks/:id/features/:lang', (req, res) => {
  try {
    const { id, lang } = req.params;
    const supportedLangs = ['es', 'en'];
    
    if (!supportedLangs.includes(lang)) {
      return res.status(404).json({
        error: 'Language not supported',
        message: `Language '${lang}' is not supported. Available languages: ${supportedLangs.join(', ')}`
      });
    }
    
    const translationPath = path.join(__dirname, `../data/translations/${lang}.json`);
    
    if (!fs.existsSync(translationPath)) {
      return res.status(404).json({
        error: 'Translation file not found',
        message: `Translation file for language '${lang}' does not exist`
      });
    }
    
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    
    if (!translations.features || !translations.features[id]) {
      return res.status(404).json({
        error: 'Features not found',
        message: `Features for modpack '${id}' in language '${lang}' do not exist`
      });
    }
    
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json({
      modpackId: id,
      language: lang,
      features: translations.features[id]
    });
  } catch (error) {
    console.error('Error reading features data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to read features data'
    });
  }
});

// Montar el router de CurseForge
app.use('/v1/curseforge', curseforgeRouter);

// API info endpoint
app.get('/v1/info', (req, res) => {
  const packageJson = require('../package.json');
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    endpoints: [
      'GET /health - Health check',
      'GET /v1/launcher_data.json - Complete launcher data',
      'GET /v1/modpacks - List all modpacks',
      'GET /v1/modpacks/:id - Get specific modpack',
      'GET /v1/modpacks/:id/features/:lang - Get modpack features in specific language',
      'GET /v1/translations - Available languages',
      'GET /v1/translations/:lang - Get translations for language',
      'GET /v1/curseforge/* - CurseForge API proxy endpoints',
      'GET /v1/info - API information'
    ]
  });
});

// El endpoint antiguo de CurseForge ha sido reemplazado por el nuevo router

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/health',
      '/v1/launcher_data.json',
      '/v1/modpacks',
      '/v1/modpacks/:id',
      '/v1/modpacks/:id/features/:lang',
      '/v1/translations',
      '/v1/translations/:lang',
      '/v1/curseforge/mods/:modId',
      '/v1/curseforge/mods/files',
      '/v1/info'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LuminaKraft Launcher API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Launcher data: http://localhost:${PORT}/v1/launcher_data.json`);
  console.log(`📚 API info: http://localhost:${PORT}/v1/info`);
});

module.exports = app; 