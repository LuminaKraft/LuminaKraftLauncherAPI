# LuminaKraft Launcher API

Backend API para el LuminaKraft Launcher que sirve información de modpacks y datos del launcher.

## 🚀 Características

- **API RESTful**: Endpoints bien estructurados para obtener datos de modpacks
- **Dockerizado**: Contenedor optimizado que corre en el puerto 9374
- **CI/CD**: Deploy automático con GitHub Actions
- **Salud del servicio**: Health checks y monitoreo
- **CORS habilitado**: Listo para consumo desde el launcher
- **Caché optimizado**: Headers de caché para mejor rendimiento

## 📡 Endpoints

### Principales
- `GET /v1/launcher_data.json` - Datos completos del launcher (formato esperado por el cliente)
- `GET /v1/modpacks` - Lista de todos los modpacks disponibles
- `GET /v1/modpacks/:id` - Información específica de un modpack
- `GET /health` - Estado de salud del servicio
- `GET /v1/info` - Información de la API

### Ejemplo de respuesta `/v1/launcher_data.json`:
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
      "descripcion": "Un modpack de aventura y magia...",
      "version": "1.2.3",
      "minecraftVersion": "1.18.2",
      "modloader": "forge",
      "modloaderVersion": "40.2.0",
      "urlIcono": "https://ejemplo.com/icono.png",
      "urlModpackZip": "https://ejemplo.com/modpack.zip",
      "changelog": "v1.2.3: Cambios...",
      "jvmArgsRecomendados": "-Xmx4G -Xms2G"
    }
  ]
}
```

## 🔧 Desarrollo Local

### Prerrequisitos
- **Node.js** 18+
- **Docker** (opcional)

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/luminakraft/luminakraft-launcher-api.git
cd luminakraft-launcher-api

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La API estará disponible en `http://localhost:9374`

### Con Docker
```bash
# Construir imagen
docker build -t luminakraft-launcher-api .

# Ejecutar contenedor
docker run -p 9374:9374 luminakraft-launcher-api
```

### Con Docker Compose
```bash
docker-compose up -d
```

## 📂 Estructura del Proyecto

```
luminakraft-launcher-api/
├── src/
│   └── index.js              # Servidor Express principal
├── data/
│   └── launcher_data.json    # Datos de modpacks y launcher
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions para CI/CD
├── Dockerfile               # Configuración Docker
├── docker-compose.yml       # Desarrollo local con Docker
├── package.json             # Dependencias y scripts
└── README.md               # Este archivo
```

## 🔄 Gestión de Modpacks

Para añadir o actualizar modpacks, edita el archivo `data/launcher_data.json`:

1. **Añadir nuevo modpack**:
   ```json
   {
     "id": "nuevo_modpack",
     "nombre": "Nombre del Modpack",
     "descripcion": "Descripción...",
     "version": "1.0.0",
     "minecraftVersion": "1.20.1",
     "modloader": "forge",
     "modloaderVersion": "47.1.3",
     "urlIcono": "https://tu-cdn.com/icono.png",
     "urlModpackZip": "https://tu-cdn.com/modpack.zip",
     "changelog": "Versión inicial",
     "jvmArgsRecomendados": "-Xmx4G -Xms2G"
   }
   ```

2. **Actualizar versión del launcher**:
   ```json
   {
     "launcherVersion": "1.1.0",
     "launcherDownloadUrls": {
       "windows": "nueva-url-windows",
       "macos": "nueva-url-macos",
       "linux": "nueva-url-linux"
     }
   }
   ```

3. Hacer commit y push - el deploy se ejecutará automáticamente.

## 🚀 Deployment

### Configuración de Secrets en GitHub

El proyecto usa GitHub Actions para deploy automático. Configura estos secrets en tu repositorio:

#### Servidor de Deploy:
- `DEPLOY_HOST`: `sftp.luminakraft.com` (tu servidor)
- `DEPLOY_PORT`: `4988` (puerto SSH personalizado)
- `DEPLOY_USER`: Tu usuario SSH del servidor  
- `DEPLOY_SSH_KEY`: Clave privada SSH (sin passphrase)

### Deploy Manual

Si prefieres deploy manual:

```bash
# En tu servidor
git pull origin main
docker build -t luminakraft-launcher-api .
docker stop luminakraft-api || true
docker rm luminakraft-api || true
docker run -d \
  --name luminakraft-api \
  --restart unless-stopped \
  -p 9374:9374 \
  luminakraft-launcher-api
```

## 🔍 Monitoreo

### Health Check
```bash
curl http://tu-servidor:9374/health
```

### Logs del contenedor
```bash
docker logs luminakraft-api -f
```

### Verificar endpoints
```bash
# Datos del launcher
curl http://tu-servidor:9374/v1/launcher_data.json

# Lista de modpacks
curl http://tu-servidor:9374/v1/modpacks

# Info de la API
curl http://tu-servidor:9374/v1/info
```

## 🛡️ Seguridad

- Contenedor ejecuta con usuario no-root
- Headers de seguridad con Helmet.js
- CORS configurado apropiadamente
- Health checks implementados
- Logs de acceso con Morgan

## 🔧 Variables de Entorno

- `PORT`: Puerto del servidor (default: 9374)
- `NODE_ENV`: Entorno de ejecución (production/development)

## 📝 Licencia

MIT License - Ver archivo `LICENSE` para detalles.

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

Desarrollado con ❤️ por **LuminaKraft Studios** 