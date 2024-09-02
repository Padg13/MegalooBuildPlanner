// app.js

// Character data
const characters = [
    { id: 1, name: 'Character 1', portrait: 'portraits/character1.png' },
    // Add more characters as needed
];

// Item data
const items = [
    { id: 1, name: 'Item 1', icon: 'items/item1.png', effects: { attack: 5, defense: 3 }, rarity: 'common' },
    // Add more items as needed
];

// Rarity data
const rarities = {
    common: { name: 'Common', border: 'rarity_borders/common.png' },
    rare: { name: 'Rare', border: 'rarity_borders/rare.png' },
    // Add more rarities as needed
};

// Function to load characters
function loadCharacters() {
    const characterSelection = document.getElementById('character-selection');
    characters.forEach(character => {
        const img = document.createElement('img');
        img.src = character.portrait;
        img.alt = character.name;
        img.onclick = () => selectCharacter(character);
        characterSelection.appendChild(img);
    });
}

// Function to select a character
function selectCharacter(character) {
    const selectedCharacter = document.getElementById('selected-character');
    selectedCharacter.innerHTML = `<img src="${character.portrait}" alt="${character.name}">`;
    generateEquipmentGrid();
}

// Function to generate equipment grid
function generateEquipmentGrid() {
    const equipmentGrid = document.getElementById('equipment-grid');
    equipmentGrid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'equipment-slot';
        slot.ondrop = drop;
        slot.ondragover = allowDrop;
        equipmentGrid.appendChild(slot);
    }
}

// Function to load items
function loadItems() {
    const itemList = document.getElementById('item-list');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.draggable = true;
        div.ondragstart = drag;
        div.style.backgroundImage = `url(${item.icon})`;
        
        const rarityBorder = document.createElement('div');
        rarityBorder.className = 'rarity-border';
        rarityBorder.style.backgroundImage = `url(${rarities[item.rarity].border})`;
        
        div.appendChild(rarityBorder);
        itemList.appendChild(div);
    });
}

// Drag and drop functions
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    updateStats();
}

// Function to update character stats
function updateStats() {
    // Implement stat calculation based on equipped items
}

// Initialize the application
function init() {
    loadCharacters();
    loadItems();
}

// Run the initialization function when the page loads
window.onload = init;
