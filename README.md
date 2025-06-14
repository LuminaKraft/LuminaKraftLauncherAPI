# 🚀 LuminaKraft Launcher API

**API Backend oficial para el LuminaKraft Minecraft Launcher**

Servidor REST que proporciona datos de modpacks, información del launcher, traducciones multiidioma y sistema de características para la aplicación cliente.

🌐 **API Base URL**: `https://api.luminakraft.com`  
📡 **Estado**: ✅ Operativo  
📋 **Versión**: 1.0.0  
🌍 **Idiomas**: Español, Inglés

---

## 📖 Guía para Desarrolladores

### 🎯 Información Básica

La API sirve datos estructurados para el launcher y la web, incluyendo:
- **Servidores/Modpacks reales** con metadatos completos
- **Sistema de traducciones** multiidioma (ES/EN)
- **Características detalladas** de cada servidor
- **URLs de descarga** para diferentes plataformas 
- **Información del launcher** (versiones, changelog)
- **Health checks** para monitoreo

### 🔗 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check del servicio |
| `GET` | `/v1/info` | Información de la API |
| `GET` | `/v1/launcher_data.json` | **[PRINCIPAL]** Datos completos para el launcher |
| `GET` | `/v1/modpacks` | Lista de modpacks disponibles |
| `GET` | `/v1/modpacks/{id}` | Detalles de un modpack específico |
| `GET` | `/v1/translations` | Idiomas disponibles |
| `GET` | `/v1/translations/{lang}` | Traducciones para un idioma |
| `GET` | `/v1/modpacks/{id}/features/{lang}` | Características de un servidor |

---

## 🎮 Endpoint Principal: `/v1/launcher_data.json`

**Este es el endpoint que debe consumir el launcher para obtener toda la información necesaria.**

### Ejemplo de Request:
```bash
curl -X GET https://api.luminakraft.com/v1/launcher_data.json
```

### Ejemplo de Response:
```json
{
  "launcherVersion": "1.0.0",
  "launcherDownloadUrls": {
    "windows": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_x64_en-US.msi",
    "macos": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_x64.dmg", 
    "linux": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_amd64.AppImage"
  },
  "modpacks": [
    {
      "id": "ancientkraft_rechapter",
      "name": "AncientKraft Rechapter",
      "version": "1.0.0",
      "minecraftVersion": "1.20.1", 
      "modloader": "forge",
      "modloaderVersion": "47.1.3",
      "gamemode": "RPG / Aventura",
      "isNew": false,
      "isActive": false,
      "isComingSoon": true,
      "images": [
        "https://f005.backblazeb2.com/file/luminakraft-assets/servers/ancientkraft_rechapter/screenshot1.webp",
        "https://f005.backblazeb2.com/file/luminakraft-assets/servers/ancientkraft_rechapter/screenshot2.webp"
      ],
      "logo": "https://f005.backblazeb2.com/file/luminakraft-assets/servers/ancientkraft_rechapter/logo.webp",
      "urlIcono": "https://f005.backblazeb2.com/file/luminakraft-assets/servers/ancientkraft_rechapter/logo.webp",
      "urlModpackZip": "https://f005.backblazeb2.com/file/luminakraft-modpacks/ancientkraft_rechapter_v1.0.0.zip",
      "collaborators": [
        {
          "name": "LuminaKraft Studios",
          "logo": "https://f005.backblazeb2.com/file/luminakraft-assets/favicon.webp"
        }
      ],
      "changelog": "Versión inicial de AncientKraft Rechapter",
      "jvmArgsRecomendados": "-Xmx6G -Xms3G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200",
      "youtubeEmbed": "",
      "featureIcons": ["fa-magic", "fa-fist-raised", "fa-map-marked-alt", "fa-users"]
    }
    // ... más servidores
  ]
}
```

---

## 🌍 Sistema de Traducciones

### Obtener Idiomas Disponibles
```bash
GET https://api.luminakraft.com/v1/translations
```
**Respuesta:**
```json
{
  "availableLanguages": ["es", "en"],
  "defaultLanguage": "es"
}
```

### Obtener Traducciones
```bash
GET https://api.luminakraft.com/v1/translations/es
GET https://api.luminakraft.com/v1/translations/en
```
**Respuesta:**
```json
{
  "modpacks": {
    "ancientkraft_rechapter": {
      "name": "AncientKraft Rechapter",
      "description": "La experiencia de aventura RPG definitiva - completamente reconstruida con magia revolucionaria, combate de nueva generación y mundos expandidos. ¡Ahora sin LAG!",
      "shortDescription": "Aventura RPG definitiva reconstruida"
    }
  },
  "ui": {
    "status": {
      "new": "Nuevo",
      "active": "Activo",
      "coming_soon": "Próximamente",
      "inactive": "Inactivo"
    }
  }
}
```

---

## 🎯 Sistema de Características

### Obtener Características de un Servidor
```bash
GET https://api.luminakraft.com/v1/modpacks/ancientkraft_rechapter/features/es
GET https://api.luminakraft.com/v1/modpacks/onepieceworlds2/features/en
```
**Respuesta:**
```json
{
  "modpackId": "ancientkraft_rechapter",
  "language": "es",
  "features": [
    {
      "title": "Sistema de Magia Revolucionario",
      "description": "Experimenta un sistema de magia completamente rediseñado con creación avanzada de hechizos, dominio elemental y caminos de progresión mágica"
    },
    {
      "title": "Mecánicas de Combate de Nueva Generación",
      "description": "Participa en batallas dinámicas con sistemas de combate renovados, habilidades de armas y capacidades tácticas que redefinen el PvP y PvE"
    }
    // ... más características
  ]
}
```

---

## 🎮 Servidores Disponibles

### 1. **AncientKraft Rechapter** 🏰
- **Estado**: 🔜 Próximamente
- **Tipo**: RPG / Aventura
- **Versión**: 1.20.1 (Forge)
- **Características**: Magia revolucionaria, Combate nueva generación, Reinos expandidos, Gremios mejorados

### 2. **One Piece World S2** 🏴‍☠️
- **Estado**: 🔜 Próximamente  
- **Tipo**: RPG
- **Versión**: 1.20.1 (Forge)
- **Características**: Frutas del Diablo avanzadas, Sistema Haki avanzado, Nuevo Mundo, Multijugador mejorado

### 3. **LuminaKraft World** 🌍
- **Estado**: 💤 Inactivo
- **Tipo**: Supervivencia
- **Versión**: 1.21.1 (Paper)
- **IP**: `play.luminakraft.com`
- **Características**: Supervivencia optimizada, Compatibilidad amplia, Plugins mejorados, Comunidad próspera

### 4. **One Piece World** ⚓
- **Estado**: 💤 Inactivo
- **Tipo**: RPG
- **Versión**: 1.20.1 (Forge)
- **Características**: Frutas del Diablo, Haki y estilos de lucha, Grand Line, Aventuras multijugador

### 5. **AncientKraft** 🗡️
- **Estado**: 💤 Inactivo
- **Tipo**: RPG / Aventura
- **Versión**: 1.20.1 (Forge)
- **Características**: Magia personalizada, Combate mejorado, Mundo vasto, Aventuras multijugador

### 6. **PT: The Full Course** 🍽️
- **Estado**: 💤 Inactivo
- **Tipo**: Supervivencia
- **Versión**: 1.20.1 (Vanilla)
- **IP**: `pt.luminakraft.com`
- **Características**: Exploración, Comunidad, Plugins personalizados, Eventos regulares

---

## 🔍 Endpoints Auxiliares

### 1. Health Check
```bash
GET https://api.luminakraft.com/health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T22:18:54.929Z", 
  "version": "1.0.0"
}
```

### 2. Información de la API
```bash
GET https://api.luminakraft.com/v1/info
```
**Respuesta:**
```json
{
  "name": "luminakraft-launcher-api",
  "version": "1.0.0",
  "description": "Backend API for LuminaKraft Launcher - serves modpack data and launcher information",
  "endpoints": [
    "GET /health - Health check",
    "GET /v1/launcher_data.json - Complete launcher data", 
    "GET /v1/modpacks - List all modpacks",
    "GET /v1/modpacks/:id - Get specific modpack",
    "GET /v1/modpacks/:id/features/:lang - Get modpack features in specific language",
    "GET /v1/translations - Available languages",
    "GET /v1/translations/:lang - Get translations for language",
    "GET /v1/info - API information"
  ]
}
```

### 3. Lista de Modpacks
```bash
GET https://api.luminakraft.com/v1/modpacks
```
**Respuesta:** Array con todos los modpacks (mismo formato que en `launcher_data.json`)

### 4. Modpack Específico
```bash
GET https://api.luminakraft.com/v1/modpacks/ancientkraft_rechapter
```
**Respuesta:** Objeto con datos del modpack solicitado

---

## 💻 Integración en el Launcher

### Configuración Recomendada

1. **Endpoint Principal**: Usar `/v1/launcher_data.json` como fuente única de datos
2. **Traducciones**: Cargar traducciones según idioma del usuario
3. **Características**: Mostrar features usando `/v1/modpacks/{id}/features/{lang}`
4. **Caching**: Implementar caché local con TTL de 5-10 minutos
5. **Fallback**: Tener datos de respaldo en caso de fallo de red
6. **Timeout**: Configurar timeout de 10-15 segundos para requests

### Ejemplo de Integración (JavaScript)

```javascript
class LuminaKraftAPI {
  constructor() {
    this.baseURL = 'https://api.luminakraft.com';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
    this.defaultLang = 'es';
  }

  async getLauncherData() {
    try {
      const cacheKey = 'launcher_data';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      const response = await fetch(`${this.baseURL}/v1/launcher_data.json`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'LuminaKraft-Launcher/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching launcher data:', error);
      return this.getFallbackData();
    }
  }

  async getTranslations(lang = this.defaultLang) {
    try {
      const cacheKey = `translations_${lang}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      const response = await fetch(`${this.baseURL}/v1/translations/${lang}`);
      
      if (!response.ok) {
        throw new Error(`Translation Error: ${response.status}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching translations:', error);
      return null;
    }
  }

  async getModpackFeatures(modpackId, lang = this.defaultLang) {
    try {
      const response = await fetch(`${this.baseURL}/v1/modpacks/${modpackId}/features/${lang}`);
      
      if (!response.ok) {
        throw new Error(`Features Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching features:', error);
      return null;
    }
  }

  async checkAPIHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }
}

// Uso:
const api = new LuminaKraftAPI();
const launcherData = await api.getLauncherData();
const translations = await api.getTranslations('es');
const features = await api.getModpackFeatures('ancientkraft_rechapter', 'es');
```

### Manejo de Errores

```javascript
// Códigos de respuesta esperados:
// 200: OK - Datos disponibles
// 404: Not Found - Endpoint/recurso no existe
// 500: Internal Server Error - Error del servidor
// TIMEOUT: Sin respuesta del servidor

async function handleAPIResponse(response) {
  switch (response.status) {
    case 200:
      return await response.json();
    case 404:
      throw new Error('Recurso no encontrado');
    case 500:
      throw new Error('Error interno del servidor');
    default:
      throw new Error(`Error HTTP: ${response.status}`);
  }
}
```

---

## 📱 Headers y CORS

La API incluye headers apropiados para desarrollo y producción:

### Headers de Respuesta:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Content-Type: application/json
Cache-Control: public, max-age=300 (launcher data)
Cache-Control: public, max-age=3600 (translations & features)
```

### User-Agent Recomendado:
```
User-Agent: LuminaKraft-Launcher/{version}
User-Agent: LuminaKraft-Web/{version}
```

---

## 🔧 Estructura de Datos

### Objeto Modpack/Servidor:
```typescript
interface Modpack {
  // Campos básicos
  id: string;                    // ID único del servidor
  name: string;                  // Nombre display
  version: string;               // Versión del modpack (semver)
  minecraftVersion: string;      // Versión de Minecraft
  modloader: 'forge' | 'fabric' | 'neoforge' | 'paper' | 'vanilla';
  modloaderVersion: string;      // Versión del modloader
  gamemode: string;              // Categoría del servidor
  
  // Estados
  isNew: boolean;                // Si es nuevo
  isActive: boolean;             // Si está activo
  isComingSoon: boolean;         // Si está próximamente
  
  // Recursos visuales
  images: string[];              // URLs de screenshots
  logo: string;                  // URL del logo principal
  urlIcono: string;              // URL del ícono pequeño
  featureIcons: string[];        // Iconos FontAwesome de características
  
  // Colaboradores
  collaborators: Array<{
    name: string;
    logo: string;
  }>;
  
  // Datos técnicos
  urlModpackZip: string | null;  // URL del ZIP (null para servidores vanilla)
  changelog: string;             // Changelog con historial
  jvmArgsRecomendados: string;   // Argumentos JVM recomendados
  
  // Multimedia (opcional)
  youtubeEmbed?: string;         // URL de embed de YouTube
  tiktokEmbed?: string;          // ID de embed de TikTok
  
  // Servidor (opcional)
  ip?: string;                   // IP del servidor
  leaderboardPath?: string;      // Ruta al leaderboard
}
```

### URLs de Archivos:
- **Logos**: `https://f005.backblazeb2.com/file/luminakraft-assets/servers/{id}/logo.webp`
- **Screenshots**: `https://f005.backblazeb2.com/file/luminakraft-assets/servers/{id}/screenshot{n}.webp`
- **Modpacks**: `https://f005.backblazeb2.com/file/luminakraft-modpacks/{id}_v{version}.zip`
- **Colaboradores**: `https://f005.backblazeb2.com/file/luminakraft-assets/servers/{id}/colab.webp`

---

## 🚨 Monitoreo y Debugging

### Verificar Estado de la API:
```bash
# Health check
curl https://api.luminakraft.com/health

# Test completo
curl -v https://api.luminakraft.com/v1/launcher_data.json

# Test traducciones
curl https://api.luminakraft.com/v1/translations/es

# Test características
curl https://api.luminakraft.com/v1/modpacks/ancientkraft_rechapter/features/es
```

### Logs y Debugging:
- La API registra todos los requests con timestamps
- Headers de debug disponibles en development
- Monitoreo 24/7 con alertas automáticas
- Cacheo inteligente para optimizar rendimiento

### Contacto para Soporte:
- **Errores de API**: Reportar en GitHub Issues
- **Problemas de conectividad**: Verificar status de Cloudflare
- **Datos incorrectos**: Contactar al equipo de desarrollo
- **Traducciones**: Sugerir mejoras en las traducciones

---

## 🔄 Desarrollo y Contribución

### Setup Local:
```bash
git clone https://github.com/kristiangarcia/luminakraft-launcher-api.git
cd luminakraft-launcher-api
npm install
npm run dev
```

### Testing:
```bash
npm test
npm run test:integration
npm run test:translations
```

### Deploy:
- **Automático**: Push a `main` → Deploy automático via GitHub Actions
- **Manual**: Usar `scripts/deploy.sh`

### Estructura del Proyecto:
```
├── src/
│   └── index.js              # API principal
├── data/
│   ├── launcher_data.json    # Datos de servidores
│   └── translations/
│       ├── es.json          # Traducciones español
│       └── en.json          # Traducciones inglés
├── scripts/
│   ├── manage-modpacks.js   # Gestión de modpacks
│   └── migrate-data.js      # Migración de datos
├── docs/
│   └── MODPACK_SCHEMA.md    # Documentación del esquema
└── .github/workflows/
    └── deploy.yml           # CI/CD automático
```

---

## 📊 Changelog de la API

### v1.0.0 (Actual)
- ✅ Implementación inicial de todos los endpoints
- ✅ Seis servidores reales (AncientKraft Rechapter, One Piece World S2, etc.)
- ✅ Sistema de traducciones multiidioma (ES/EN)
- ✅ Sistema de características detalladas por servidor
- ✅ Estructura híbrida compatible con launcher y web
- ✅ Headers de CORS y caching optimizado
- ✅ Deploy automático con GitHub Actions
- ✅ Integración con Cloudflare y Backblaze CDN

### Próximas Versiones:
- 🔄 v1.1.0: Más idiomas (PT, FR)
- 🔄 v1.2.0: Sistema de autenticación para endpoints administrativos
- 🔄 v1.3.0: Webhooks para notificaciones de actualizaciones
- 🔄 v1.4.0: Metrics y analytics de uso

---

## 📞 Contacto

**Desarrollador**: Kristian García  
**Repositorio**: [kristiangarcia/luminakraft-launcher-api](https://github.com/kristiangarcia/luminakraft-launcher-api)  
**Estado del Servicio**: https://api.luminakraft.com/health  
**Documentación**: [MODPACK_SCHEMA.md](docs/MODPACK_SCHEMA.md)

## Environment Variables

- `PORT`: Port number for the server (default: 9374)
- `CURSEFORGE_API_KEY`: API key for CurseForge integration

## API Endpoints

### Health Check
- `GET /health`: Check API health status

### Launcher Data
- `GET /v1/launcher_data.json`: Get complete launcher data
- `GET /v1/modpacks`: List all available modpacks
- `GET /v1/modpacks/:id`: Get specific modpack data
- `GET /v1/modpacks/:id/features/:lang`: Get modpack features in specific language

### Translations
- `GET /v1/translations`: List available languages
- `GET /v1/translations/:lang`: Get translations for specific language

### CurseForge Integration
- `GET /curseforge/mod/:projectId/file/:fileId`: Get mod file information from CurseForge
  - Response format:
    ```json
    {
      "name": "mod-file-name.jar",
      "download_url": "https://example.com/download/mod.jar"
    }
    ```
  - Error responses:
    - 503: CurseForge API key not configured
    - 404: Mod or file not found
    - 500: Internal server error

### API Info
- `GET /v1/info`: Get API information and available endpoints

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export PORT=9374
   export CURSEFORGE_API_KEY=your_api_key_here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Production

1. Set environment variables as needed
2. Run production server:
   ```bash
   npm start
   ```

## Docker

1. Build image:
   ```bash
   docker build -t luminakraft-launcher-api .
   ```

2. Run container:
   ```bash
   docker run -p 9374:9374 \
     -e CURSEFORGE_API_KEY=your_api_key_here \
     luminakraft-launcher-api
   ``` 