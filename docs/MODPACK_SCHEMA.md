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
- `slug`: URL-friendly identifier para rutas web (string)
- `descripcion`: Descripción detallada en español (string)
- `version`: Versión actual del modpack (string)
- `minecraftVersion`: Versión de Minecraft requerida (string)
- `modloader`: Tipo de modloader (forge/fabric/neoforge/quilt) (string)
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
- `descriptionKey`: Clave para traducciones i18n (string)
- `leaderboardPath`: Ruta al archivo de leaderboard (string, opcional)
- `ip`: IP del servidor si aplica (string, opcional)

## Ejemplo Completo

```json
{
  "id": "volcania_s1",
  "name": "LuminaKraft: Volcania S1",
  "slug": "volcania_s1",
  "descripcion": "Un modpack de aventura y magia ambientado en un mundo volcánico.",
  "descriptionKey": "volcania_s1-desc",
  "version": "1.2.3",
  "minecraftVersion": "1.18.2",
  "modloader": "forge",
  "modloaderVersion": "40.2.0",
  "gamemode": "RPG / Aventura / Magia",
  "isNew": false,
  "isActive": true,
  "isComingSoon": false,
  "images": [
    "https://f005.backblazeb2.com/file/luminakraft-assets/screenshots/volcania_s1/screenshot1.webp"
  ],
  "logo": "https://f005.backblazeb2.com/file/luminakraft-assets/logos/volcania_s1.webp",
  "urlIcono": "https://f005.backblazeb2.com/file/luminakraft-assets/icons/volcania_s1.png",
  "urlModpackZip": "https://f005.backblazeb2.com/file/luminakraft-modpacks/volcania_s1_v1.2.3.zip",
  "collaborators": [
    {
      "name": "LuminaKraft Studios",
      "logo": "https://f005.backblazeb2.com/file/luminakraft-assets/logos/luminakraft_studios.webp"
    }
  ],
  "changelog": "v1.2.3: Añadidos nuevos biomas volcánicos...",
  "jvmArgsRecomendados": "-Xmx4G -Xms2G -XX:+UseG1GC",
  "youtubeEmbed": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "featureIcons": ["fa-fire", "fa-magic", "fa-mountain", "fa-users", "fa-cogs"]
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