#!/usr/bin/env node

/**
 * Script de migración de datos entre estructuras
 * Convierte entre la estructura de Astro y la estructura híbrida del launcher
 */

const fs = require('fs');
const path = require('path');

/**
 * Convierte de estructura Astro a estructura híbrida del launcher
 */
function astroToLauncher(astroData, launcherDefaults = {}) {
  const launcherStructure = {
    launcherVersion: launcherDefaults.launcherVersion || "1.0.0",
    launcherDownloadUrls: launcherDefaults.launcherDownloadUrls || {
      "windows": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_x64_en-US.msi",
      "macos": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_x64.dmg",
      "linux": "https://github.com/luminakraft/luminakraft-launcher/releases/latest/download/LuminaKraft-Launcher_amd64.AppImage"
    },
    modpacks: []
  };

  astroData.forEach(server => {
    const modpack = {
      id: server.id,
      name: server.name,
      slug: server.slug,
      descripcion: `Descripción para ${server.name}`, // Placeholder
      descriptionKey: server.descriptionKey,
      version: "1.0.0", // Placeholder - necesita ser especificado
      minecraftVersion: server.versions?.[0] || "1.20.1",
      modloader: server.modloader?.toLowerCase() || "forge",
      modloaderVersion: "latest", // Placeholder
      gamemode: server.gamemode,
      isNew: server.isNew,
      isActive: server.isActive,
      isComingSoon: server.isComingSoon,
      images: server.images,
      logo: server.logo,
      urlIcono: server.logo, // Usar logo como icono por defecto
      urlModpackZip: `https://f005.backblazeb2.com/file/luminakraft-modpacks/${server.slug}_v1.0.0.zip`, // Placeholder
      collaborators: server.collaborators,
      changelog: "Versión inicial", // Placeholder
      jvmArgsRecomendados: "-Xmx4G -Xms2G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200",
      youtubeEmbed: server.youtubeEmbed || "",
      tiktokEmbed: server.tiktokEmbed || "",
      featureIcons: server.featureIcons
    };

    // Agregar campos opcionales si existen
    if (server.leaderboardPath) modpack.leaderboardPath = server.leaderboardPath;
    if (server.ip) modpack.ip = server.ip;

    launcherStructure.modpacks.push(modpack);
  });

  return launcherStructure;
}

/**
 * Convierte de estructura híbrida del launcher a estructura Astro
 */
function launcherToAstro(launcherData) {
  return launcherData.modpacks.map(modpack => ({
    id: modpack.id,
    name: modpack.name,
    slug: modpack.slug,
    isNew: modpack.isNew,
    isActive: modpack.isActive,
    isComingSoon: modpack.isComingSoon,
    images: modpack.images,
    logo: modpack.logo,
    collaborators: modpack.collaborators,
    versions: [modpack.minecraftVersion],
    modloader: modpack.modloader.charAt(0).toUpperCase() + modpack.modloader.slice(1),
    gamemode: modpack.gamemode,
    descriptionKey: modpack.descriptionKey,
    leaderboardPath: modpack.leaderboardPath || null,
    ip: modpack.ip || undefined,
    youtubeEmbed: modpack.youtubeEmbed,
    tiktokEmbed: modpack.tiktokEmbed,
    featureIcons: modpack.featureIcons
  }));
}

/**
 * Valida la estructura de un modpack híbrido
 */
function validateHybridModpack(modpack) {
  const required = ['id', 'name', 'slug', 'descripcion', 'version', 'minecraftVersion', 'modloader', 'modloaderVersion'];
  const missing = required.filter(field => !modpack[field]);
  
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes en modpack ${modpack.id || 'unknown'}: ${missing.join(', ')}`);
  }

  // Validar tipos
  if (typeof modpack.isNew !== 'boolean') modpack.isNew = false;
  if (typeof modpack.isActive !== 'boolean') modpack.isActive = true;
  if (typeof modpack.isComingSoon !== 'boolean') modpack.isComingSoon = false;
  
  if (!Array.isArray(modpack.images)) modpack.images = [];
  if (!Array.isArray(modpack.collaborators)) modpack.collaborators = [];
  if (!Array.isArray(modpack.featureIcons)) modpack.featureIcons = [];

  return modpack;
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Uso: node migrate-data.js <comando> <archivo_entrada> <archivo_salida>

Comandos:
  astro-to-launcher  Convierte de estructura Astro a launcher híbrida
  launcher-to-astro  Convierte de estructura launcher híbrida a Astro
  validate          Valida estructura híbrida

Ejemplos:
  node migrate-data.js astro-to-launcher servers.json launcher_data.json
  node migrate-data.js launcher-to-astro launcher_data.json servers.json
  node migrate-data.js validate launcher_data.json
    `);
    process.exit(1);
  }

  const [command, inputFile, outputFile] = args;

  try {
    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    let result;

    switch (command) {
      case 'astro-to-launcher':
        result = astroToLauncher(inputData);
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        console.log(`✅ Convertido de Astro a Launcher: ${outputFile}`);
        break;

      case 'launcher-to-astro':
        result = launcherToAstro(inputData);
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        console.log(`✅ Convertido de Launcher a Astro: ${outputFile}`);
        break;

      case 'validate':
        if (inputData.modpacks) {
          inputData.modpacks.forEach((modpack, index) => {
            try {
              validateHybridModpack(modpack);
              console.log(`✅ Modpack ${index + 1} (${modpack.id}) válido`);
            } catch (error) {
              console.error(`❌ Modpack ${index + 1}: ${error.message}`);
            }
          });
        } else {
          console.error('❌ Estructura no válida: falta array "modpacks"');
        }
        break;

      default:
        console.error(`❌ Comando desconocido: ${command}`);
        process.exit(1);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  astroToLauncher,
  launcherToAstro,
  validateHybridModpack
}; 