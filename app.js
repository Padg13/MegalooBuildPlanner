// app.js

let gameData = {
    stat: [],
    item: [],
    enemy: [],
    ability: [],
    statusEffect: [],
    adventurer: [],
    keystone: []
};
let currentRarity = 'common';

const rarityLevels = [
    'common', 'uncommon', 'rare', 'legendary', 'mythic',
    'eternal', 'abyssal', 'cosmic', 'divine'
];

function getRarityMultiplier(rarity) {
    const rarityLevels = {
        'common': 1,
        'uncommon': 2,
        'rare': 3,
        'legendary': 4,
        'mythic': 5,
        'eternal': 6,
        'abyssal': 7,
        'cosmic': 8,
        'divine': 9
    };
    return rarityLevels[rarity] || 1;
}

// Function to load game data
async function loadGameData() {
    try {
        const response = await fetch('content.csv');
        const csvText = await response.text();
        parseContentCSV(csvText);
        console.log('Game data loaded:', gameData);
        console.log('Items data:', gameData.item);
        if (gameData.item && gameData.item.length > 0) {
            console.log('Items found in game data:', gameData.item.length);
            loadItems();
        } else {
            console.error('No items found in game data');
            console.log('Full gameData object:', JSON.stringify(gameData, null, 2));
        }
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

function populateAdventurerDropdown() {
    const dropdown = document.getElementById('adventurer-dropdown');
    gameData.adventurer.forEach(adventurer => {
        const option = document.createElement('option');
        option.value = adventurer.Name;
        option.textContent = adventurer.Name;
        dropdown.appendChild(option);
    });
    dropdown.addEventListener('change', updateSelectedAdventurer);
}

function updateSelectedAdventurer() {
    const dropdown = document.getElementById('adventurer-dropdown');
    const portrait = document.getElementById('adventurer-portrait');
    const selectedAdventurer = gameData.adventurer.find(a => a.Name === dropdown.value);
    
    if (selectedAdventurer) {
        portrait.innerHTML = `<img src="portraits/${selectedAdventurer.Name.toLowerCase().replace(/ /g, '_')}.png" alt="${selectedAdventurer.Name}">`;
        updateEquipmentRestrictions(selectedAdventurer);
    }
}

function updateEquipmentRestrictions(adventurer) {
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach(slot => {
        const slotType = slot.dataset.slot;
        if (adventurer.EquipmentRestrictions && adventurer.EquipmentRestrictions.includes(slotType)) {
            slot.classList.add('restricted');
        } else {
            slot.classList.remove('restricted');
        }
    });
}

function dragStart(e) {
    let itemId;
    if (e.target.tagName === 'IMG') {
        // If the target is an image, get the itemId from its parent div
        itemId = e.target.parentElement.dataset.itemId;
    } else {
        // If the target is the div itself, get the itemId directly
        itemId = e.target.dataset.itemId;
    }
    console.log('Drag start:', itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'copy';
}

function dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function drop(e) {
    e.preventDefault();
    console.log('Drop event triggered');
    
    const itemId = e.dataTransfer.getData('text');
    console.log('Dropped item ID:', itemId);
    
    if (!itemId) {
        console.error('No item ID found in drop event');
        return;
    }
    
    const item = gameData.item.find(i => i.Name === itemId);
    console.log('Found item:', item);
    
    const slot = e.target.closest('.equipment-slot');
    console.log('Target slot:', slot);
    
    if (slot && item && !slot.classList.contains('restricted')) {
        console.log('Conditions met, updating slot');
        
        const img = document.createElement('img');
        img.src = `items/${item.Name.toLowerCase().replace(/ /g, '_').replace(/'/g, '')}.png`;
        img.alt = item.Name;
        console.log('Created image element:', img);
        
        slot.innerHTML = '';
        slot.appendChild(img);
        slot.dataset.itemId = item.Name;
        console.log('Updated slot:', slot);
        
        updateSlotRarity(slot);
        
        // Add tooltip functionality to the equipped item
        slot.addEventListener('mouseenter', (e) => showTooltip(slot, item, e));
        slot.addEventListener('mousemove', (e) => moveTooltip(e, slot.querySelector('.tooltip')));
        slot.addEventListener('mouseleave', () => hideTooltip(slot));
        
        slot.classList.add('item-equipped');
        slot.classList.remove('drag-over');
        
        console.log('Final slot state:', slot.outerHTML);
    } else {
        console.log('Conditions not met:', { slot, item, isRestricted: slot?.classList.contains('restricted') });
    }
}


function updateSlotRarity(slot) {
    const rarityBorder = `url('rarity_borders/${currentRarity}_rarity_border.png')`;
    slot.style.setProperty('--rarity-border', rarityBorder);
    slot.classList.add('has-rarity-border');
}

function updateAllSlotRarities() {
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach(slot => {
        if (slot.dataset.itemId) {
            updateSlotRarity(slot);
        }
    });
}

function parseContentCSV(csvText) {
    const lines = csvText.split('\n');
    let currentSection = '';
    let headers = [];

    lines.forEach(line => {
        line = line.trim();
        if (line === '') return;

        if (line.endsWith('s') && !line.includes(',')) {
            currentSection = line.toLowerCase().replace(/s$/, ''); // Remove trailing 's'
            console.log('Parsing section:', currentSection);
            if (!gameData[currentSection]) {
                gameData[currentSection] = [];
            }
            headers = [];
        } else if (headers.length === 0) {
            headers = line.split(',').map(header => header.trim());
            console.log('Headers for section', currentSection, ':', headers);
        } else {
            const values = line.split(',').map(value => value.trim());
            const item = headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
            if (gameData[currentSection]) {
                gameData[currentSection].push(item);
            } else {
                console.warn(`Unknown section: ${currentSection}`);
            }
        }
    });
}

// Function to load items
function loadItems() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';
    gameData.item.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.draggable = true;
        div.dataset.itemId = item.Name;
        div.dataset.name = item.Name;
        div.dataset.stats = item.Stats || '';
        div.dataset.setEffects = item.SetEffects || '';

        const img = document.createElement('img');
        img.src = `items/${item.Name.toLowerCase().replace(/ /g, '_').replace(/'/g, '')}.png`;
        img.alt = item.Name;

        div.appendChild(img);

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.display = 'none';
        div.appendChild(tooltip);

        itemList.appendChild(div);

        div.addEventListener('dragstart', dragStart);
        div.addEventListener('mouseenter', (e) => showTooltip(div, item, e));
        div.addEventListener('mousemove', (e) => moveTooltip(e, div.querySelector('.tooltip')));
        div.addEventListener('mouseleave', () => hideTooltip(div));
    });
    updateItemRarities();
}

function showTooltip(itemElement, item, event) {
    const tooltip = itemElement.querySelector('.tooltip');
    const rarityMultiplier = getRarityMultiplier(currentRarity);

    let tooltipContent = `<h3>${item.Name}</h3>`;
    tooltipContent += `<p><span>Rarity:</span> <span>${currentRarity.charAt(0).toUpperCase() + currentRarity.slice(1)}</span></p>`;
    tooltipContent += `<p><span>Set:</span> <span>${item.Set}</span></p>`;

    tooltipContent += '<h4>Stats:</h4>';

    // Display stats
    if (item.Stats) {
        const stats = item.Stats.split('   ');
        stats.forEach(stat => {
            const [statName, statValue] = stat.split(': ');
            if (statName && statValue) {
                const adjustedValue = Math.round(parseFloat(statValue) * rarityMultiplier);
                tooltipContent += `<p><span>${statName}:</span> <span>${adjustedValue}</span></p>`;
            }
        });
    } else {
        tooltipContent += '<p>No stats available</p>';
    }

    tooltip.innerHTML = tooltipContent;
    tooltip.style.display = 'block';

    // Position the tooltip
    moveTooltip(event, tooltip);
}

function moveTooltip(e, tooltip) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = mouseX + scrollLeft + 10;
    let top = mouseY + scrollTop + 20;

    // Check right edge
    if (left + tooltipWidth > windowWidth + scrollLeft) {
        left = mouseX - tooltipWidth - 10;
    }

    // Check bottom edge
    if (top + tooltipHeight > windowHeight + scrollTop) {
        top = mouseY - tooltipHeight - 10;
    }

    // Ensure tooltip doesn't go off the left or top edge
    left = Math.max(scrollLeft, left);
    top = Math.max(scrollTop, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function hideTooltip(itemElement) {
    const tooltip = itemElement.querySelector('.tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Function to update item rarities
function updateItemRarities() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.style.setProperty('--rarity-border', `url('rarity_borders/${currentRarity}_rarity_border.png')`);
    });
}

// Function to handle slider change
function handleSliderChange(event) {
    const value = parseInt(event.target.value);
    currentRarity = rarityLevels[value - 1];
    updateRarityLabel();
    updateItemRarities();
    updateAllSlotRarities();
}

// Function to update rarity label
function updateRarityLabel() {
    const rarityLabel = document.getElementById('rarity-label');
    rarityLabel.textContent = currentRarity.charAt(0).toUpperCase() + currentRarity.slice(1);
}

function handleSearch() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const itemName = item.dataset.name.toLowerCase();
        const itemStats = item.dataset.stats.toLowerCase();
        const itemSetEffects = item.dataset.setEffects.toLowerCase();

        if (itemName.includes(searchTerm) || itemStats.includes(searchTerm) || itemSetEffects.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function initSearch() {
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', handleSearch);
}

// Initialize the application
async function init() {
    console.log('Initializing application');
    await loadGameData();
    loadItems();
    populateAdventurerDropdown();
    
    // Log the entire gameData object
    console.log('Game Data:', JSON.parse(JSON.stringify(gameData)));

    const raritySlider = document.getElementById('rarity-slider');
    raritySlider.addEventListener('input', handleSliderChange);

    updateRarityLabel();
    initSearch();

    const equipmentSlots = document.querySelectorAll('.equipment-slot');
    equipmentSlots.forEach(slot => {
        slot.addEventListener('dragover', allowDrop);
        slot.addEventListener('dragleave', dragLeave);
        slot.addEventListener('drop', drop);
    });

    // Initialize with the first adventurer
    if (gameData.adventurer.length > 0) {
        document.getElementById('adventurer-dropdown').value = gameData.adventurer[0].Name;
        updateSelectedAdventurer();
    }
}

// Run the initialization function when the page loads
window.onload = init;