# Esquema de Modpacks - Estructura Híbrida

Esta documentación describe la nueva estructura híbrida que combina lo mejor de la API del launcher con la estructura visual de la web de Astro.

## Estructura Principal

```json
{
  "launcherVersion": "string",
  "launcherDownloadUrls": {
    "windows": "string",
    "macos": "string", 
    "linux": "string"
  },
  "modpacks": [
    // Array de objetos modpack
  ]
}
```

## Esquema de Modpack Individual

### Campos Básicos (Requeridos)
- `id`: Identificador único del modpack (string)
- `name`: Nombre completo del modpack (string)
- `version`: Versión actual del modpack (string)
- `minecraftVersion`: Versión de Minecraft requerida (string)
- `modloader`: Tipo de modloader (forge/fabric/neoforge/paper/vanilla) (string)
- `modloaderVersion`: Versión específica del modloader (string)

### Campos de Estado
- `isNew`: Si el modpack es nuevo (boolean)
- `isActive`: Si el modpack está activo/disponible (boolean)
- `isComingSoon`: Si el modpack está próximamente (boolean)

### Campos Visuales
- `images`: Array de URLs de screenshots del modpack (string[])
- `logo`: URL del logo principal del modpack (string)
- `urlIcono`: URL del icono pequeño para el launcher (string)
- `featureIcons`: Array de iconos FontAwesome que representan características (string[])

### Campos de Colaboración
- `collaborators`: Array de objetos colaborador
  ```json
  {
    "name": "Nombre del colaborador",
    "logo": "URL del logo del colaborador"
  }
  ```

### Campos Técnicos del Launcher
- `urlModpackZip`: URL directa al archivo ZIP del modpack (string)
- `jvmArgsRecomendados`: Argumentos JVM recomendados (string)
- `changelog`: Notas de la versión actual (string)

### Campos de Contenido Multimedia
- `youtubeEmbed`: URL de embed de YouTube (string, opcional)
- `tiktokEmbed`: ID de embed de TikTok (string, opcional)

### Campos Adicionales de la Web
- `gamemode`: Categoría/género del modpack (string)
- `leaderboardPath`: Ruta al archivo de leaderboard (string, opcional)
- `ip`: IP del servidor si aplica (string, opcional)

### Sistema de Traducciones
Las descripciones y textos se obtienen desde archivos JSON de traducciones separados:
- `/v1/translations` - Lista idiomas disponibles
- `/v1/translations/es` - Traducciones en español
- `/v1/translations/en` - Traducciones en inglés

Estructura de traducciones:
```json
{
  "modpacks": {
    "modpack_id": {
      "name": "Nombre del modpack",
      "description": "Descripción completa",
      "shortDescription": "Descripción corta"
    }
  },
  "ui": {
    "status": { "new": "Nuevo", "active": "Activo" },
    "modloader": { "forge": "Forge", "fabric": "Fabric" },
    "gamemode": { "rpg": "RPG", "survival": "Supervivencia" }
  }
}
```

## Ejemplo Completo

```json
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
    "https://f005.backblazeb2.com/file/luminakraft-assets/servers/ancientkraft_rechapter/screenshot1.webp"
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
```

## Ventajas de la Estructura Híbrida

### Para el Launcher
- Mantiene toda la información técnica necesaria
- URLs directas para descargas
- Configuraciones JVM específicas
- Información de versiones y modloaders

### Para la Web
- Imágenes y logos para galería visual
- Estados de disponibilidad
- Información de colaboradores
- Iconos de características
- Contenido multimedia embebido
- Slugs para URLs amigables

### Para Ambos
- Identificadores únicos consistentes
- Descripciones ricas
- Información de versiones
- Flexibilidad para campos opcionales

## Notas de Implementación

1. **Retrocompatibilidad**: Los campos originales del launcher se mantienen
2. **Campos Opcionales**: Los nuevos campos visuales son opcionales
3. **URLs Consistentes**: Todas las URLs usan Backblaze para consistencia
4. **Estructura Escalable**: Fácil agregar nuevos campos sin romper compatibilidad 