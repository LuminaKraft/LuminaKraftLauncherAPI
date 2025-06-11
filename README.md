# 🚀 LuminaKraft Launcher API

**API Backend oficial para el LuminaKraft Minecraft Launcher**

Servidor REST que proporciona datos de modpacks, información del launcher y endpoints para la aplicación cliente.

🌐 **API Base URL**: `https://api.luminakraft.com`  
📡 **Estado**: ✅ Operativo  
📋 **Versión**: 1.0.0

---

## 📖 Guía para Desarrolladores

### 🎯 Información Básica

La API sirve datos estructurados para el launcher, incluyendo:
- **Modpacks disponibles** con metadatos completos
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
    "windows": "https://github.com/luminakraft/launcher/releases/latest/download/setup.exe",
    "macos": "https://github.com/luminakraft/launcher/releases/latest/download/app.dmg", 
    "linux": "https://github.com/luminakraft/launcher/releases/latest/download/app.AppImage"
  },
  "modpacks": [
    {
      "id": "volcania_s1",
      "nombre": "LuminaKraft: Volcania S1",
      "descripcion": "Un modpack de aventura y magia enfocado en exploración y construcción. Incluye mods de decoración, magia, y aventura para una experiencia completa.",
      "version": "1.2.3",
      "minecraftVersion": "1.18.2", 
      "modloader": "forge",
      "modloaderVersion": "40.2.0",
      "urlIcono": "https://f005.backblazeb2.com/file/luminakraft-assets/icons/volcania_s1.png",
      "urlModpackZip": "https://f005.backblazeb2.com/file/luminakraft-modpacks/volcania_s1_v1.2.3.zip",
      "changelog": "v1.2.3: Añadidos nuevos mods de magia y optimización de rendimiento\nv1.2.2: Corrección de bugs menores\nv1.2.1: Actualización de mods principales",
      "jvmArgsRecomendados": "-Xmx4G -Xms2G -XX:+UseG1GC"
    },
    {
      "id": "technika_s3", 
      "nombre": "LuminaKraft: Technika S3",
      "descripcion": "Modpack tecnológico con automatización avanzada, máquinas industriales y sistemas de energía complejos para jugadores que buscan desafíos técnicos.",
      "version": "2.1.0",
      "minecraftVersion": "1.19.2",
      "modloader": "fabric", 
      "modloaderVersion": "0.14.10",
      "urlIcono": "https://f005.backblazeb2.com/file/luminakraft-assets/icons/technika_s3.png",
      "urlModpackZip": "https://f005.backblazeb2.com/file/luminakraft-modpacks/technika_s3_v2.1.0.zip",
      "changelog": "v2.1.0: Nueva temporada con mods de tecnología avanzada\nv2.0.5: Balanceo de recipes y optimizaciones",
      "jvmArgsRecomendados": "-Xmx6G -Xms3G -XX:+UseG1GC"
    },
    {
      "id": "mystica_origins",
      "nombre": "LuminaKraft: Mystica Origins", 
      "descripcion": "Modpack RPG con sistema de orígenes, clases especializadas, dungeons generados proceduralmente y una rica historia de fondo.",
      "version": "1.0.1",
      "minecraftVersion": "1.20.1",
      "modloader": "neoforge",
      "modloaderVersion": "47.1.3", 
      "urlIcono": "https://f005.backblazeb2.com/file/luminakraft-assets/icons/mystica_origins.png",
      "urlModpackZip": "https://f005.backblazeb2.com/file/luminakraft-modpacks/mystica_origins_v1.0.1.zip",
      "changelog": "v1.0.1: Correcciones de compatibilidad y nuevas quests\nv1.0.0: Lanzamiento inicial",
      "jvmArgsRecomendados": "-Xmx5G -Xms2G -XX:+UseG1GC"
    }
  ]
}
```

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
  "timestamp": "2025-06-11T22:18:54.929Z", 
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
GET https://api.luminakraft.com/v1/modpacks/volcania_s1
```
**Respuesta:** Objeto con datos del modpack solicitado

---

## 💻 Integración en el Launcher

### Configuración Recomendada

1. **Endpoint Principal**: Usar `/v1/launcher_data.json` como fuente única de datos
2. **Caching**: Implementar caché local con TTL de 5-10 minutos
3. **Fallback**: Tener datos de respaldo en caso de fallo de red
4. **Timeout**: Configurar timeout de 10-15 segundos para requests

### Ejemplo de Integración (JavaScript)

```javascript
class LuminaKraftAPI {
  constructor() {
    this.baseURL = 'https://api.luminakraft.com';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
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
      // Retornar datos de fallback si están disponibles
      return this.getFallbackData();
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
```

### Manejo de Errores

```javascript
// Códigos de respuesta esperados:
// 200: OK - Datos disponibles
// 404: Not Found - Endpoint no existe
// 500: Internal Server Error - Error del servidor
// TIMEOUT: Sin respuesta del servidor

async function handleAPIResponse(response) {
  switch (response.status) {
    case 200:
      return await response.json();
    case 404:
      throw new Error('Endpoint no encontrado');
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
Cache-Control: public, max-age=300 (5 minutos)
```

### User-Agent Recomendado:
```
User-Agent: LuminaKraft-Launcher/{version}
```

---

## 🔧 Estructura de Datos

### Objeto Modpack:
```typescript
interface Modpack {
  id: string;                    // ID único del modpack
  nombre: string;                // Nombre display
  descripcion: string;           // Descripción detallada
  version: string;               // Versión del modpack (semver)
  minecraftVersion: string;      // Versión de Minecraft
  modloader: 'forge' | 'fabric' | 'neoforge';  // Tipo de modloader
  modloaderVersion: string;      // Versión del modloader
  urlIcono: string;              // URL del ícono (PNG recomendado)
  urlModpackZip: string;         // URL del archivo ZIP del modpack
  changelog: string;             // Changelog con historial de versiones
  jvmArgsRecomendados: string;   // Argumentos JVM recomendados
}
```

### URLs de Archivos:
- **Iconos**: `https://f005.backblazeb2.com/file/luminakraft-assets/icons/{id}.png`
- **Modpacks**: `https://f005.backblazeb2.com/file/luminakraft-modpacks/{id}_v{version}.zip`

---

## 🚨 Monitoreo y Debugging

### Verificar Estado de la API:
```bash
# Health check
curl https://api.luminakraft.com/health

# Test completo
curl -v https://api.luminakraft.com/v1/launcher_data.json
```

### Logs y Debugging:
- La API registra todos los requests con timestamps
- Headers de debug disponibles en development
- Monitoreo 24/7 con alertas automáticas

### Contacto para Soporte:
- **Errores de API**: Reportar en GitHub Issues
- **Problemas de conectividad**: Verificar status de Cloudflare
- **Datos incorrectos**: Contactar al equipo de desarrollo

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
```

### Deploy:
- **Automático**: Push a `main` → Deploy automático via GitHub Actions
- **Manual**: Usar `scripts/deploy.sh`

---

## 📊 Changelog de la API

### v1.0.0 (Actual)
- ✅ Implementación inicial de todos los endpoints
- ✅ Tres modpacks de ejemplo (Volcania S1, Technika S3, Mystica Origins)
- ✅ Sistema de health checks
- ✅ Headers de CORS y caching
- ✅ Deploy automático con GitHub Actions
- ✅ Integración con Cloudflare y Backblaze

### Próximas Versiones:
- 🔄 v1.1.0: Sistema de autenticación para endpoints administrativos
- 🔄 v1.2.0: Webhooks para notificaciones de actualizaciones
- 🔄 v1.3.0: Metrics y analytics de uso

---

## 📞 Contacto

**Desarrollador**: Kristian García  
**Repositorio**: [kristiangarcia/luminakraft-launcher-api](https://github.com/kristiangarcia/luminakraft-launcher-api)  
**Estado del Servicio**: https://api.luminakraft.com/health 