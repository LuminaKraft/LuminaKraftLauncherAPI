#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/launcher_data.json');

// Helper functions
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error loading data file:', error.message);
    process.exit(1);
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Data saved successfully');
  } catch (error) {
    console.error('❌ Error saving data file:', error.message);
    process.exit(1);
  }
}

function listModpacks() {
  const data = loadData();
  console.log('📦 Available modpacks:');
  console.log('');
  
  if (data.modpacks.length === 0) {
    console.log('No modpacks found.');
    return;
  }
  
  data.modpacks.forEach((modpack, index) => {
    console.log(`${index + 1}. ${modpack.nombre} (${modpack.id})`);
    console.log(`   Version: ${modpack.version} | Minecraft: ${modpack.minecraftVersion} | Modloader: ${modpack.modloader}`);
    console.log('');
  });
}

function addModpack(modpackData) {
  const data = loadData();
  
  // Check if modpack ID already exists
  if (data.modpacks.find(mp => mp.id === modpackData.id)) {
    console.error(`❌ Modpack with ID '${modpackData.id}' already exists`);
    process.exit(1);
  }
  
  data.modpacks.push(modpackData);
  saveData(data);
  console.log(`✅ Added modpack: ${modpackData.nombre} (${modpackData.id})`);
}

function updateModpack(id, updates) {
  const data = loadData();
  const modpackIndex = data.modpacks.findIndex(mp => mp.id === id);
  
  if (modpackIndex === -1) {
    console.error(`❌ Modpack with ID '${id}' not found`);
    process.exit(1);
  }
  
  data.modpacks[modpackIndex] = { ...data.modpacks[modpackIndex], ...updates };
  saveData(data);
  console.log(`✅ Updated modpack: ${id}`);
}

function removeModpack(id) {
  const data = loadData();
  const modpackIndex = data.modpacks.findIndex(mp => mp.id === id);
  
  if (modpackIndex === -1) {
    console.error(`❌ Modpack with ID '${id}' not found`);
    process.exit(1);
  }
  
  const removed = data.modpacks.splice(modpackIndex, 1)[0];
  saveData(data);
  console.log(`✅ Removed modpack: ${removed.nombre} (${id})`);
}

function updateLauncherVersion(version) {
  const data = loadData();
  data.launcherVersion = version;
  saveData(data);
  console.log(`✅ Updated launcher version to: ${version}`);
}

function showHelp() {
  console.log('🛠️  LuminaKraft Modpack Manager');
  console.log('');
  console.log('Usage: node manage-modpacks.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list                          List all modpacks');
  console.log('  add <json-file>              Add modpack from JSON file');
  console.log('  update <id> <json-file>      Update modpack with new data');
  console.log('  remove <id>                  Remove modpack by ID');
  console.log('  set-launcher-version <ver>   Update launcher version');
  console.log('  help                         Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node manage-modpacks.js list');
  console.log('  node manage-modpacks.js add new-modpack.json');
  console.log('  node manage-modpacks.js update volcania_s1 updates.json');
  console.log('  node manage-modpacks.js remove old_modpack');
  console.log('  node manage-modpacks.js set-launcher-version 1.1.0');
}

// Main script logic
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listModpacks();
    break;
    
  case 'add':
    if (!args[1]) {
      console.error('❌ Please provide a JSON file path');
      process.exit(1);
    }
    try {
      const modpackData = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      addModpack(modpackData);
    } catch (error) {
      console.error('❌ Error reading modpack file:', error.message);
      process.exit(1);
    }
    break;
    
  case 'update':
    if (!args[1] || !args[2]) {
      console.error('❌ Please provide modpack ID and JSON file path');
      process.exit(1);
    }
    try {
      const updates = JSON.parse(fs.readFileSync(args[2], 'utf8'));
      updateModpack(args[1], updates);
    } catch (error) {
      console.error('❌ Error reading updates file:', error.message);
      process.exit(1);
    }
    break;
    
  case 'remove':
    if (!args[1]) {
      console.error('❌ Please provide modpack ID');
      process.exit(1);
    }
    removeModpack(args[1]);
    break;
    
  case 'set-launcher-version':
    if (!args[1]) {
      console.error('❌ Please provide version number');
      process.exit(1);
    }
    updateLauncherVersion(args[1]);
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.error('❌ Unknown command:', command);
    showHelp();
    process.exit(1);
} 