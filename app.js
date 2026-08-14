// --- GLOBAL GAME STATE ---
let gameState = {
    player: {
        name: "Hero",
        icon: "🧙‍♂️",
        house: "Cozy Cottage",
        stats: { farm: 1, culinary: 1, strength: 1 },
        energy: 50,
        maxEnergy: 50,
        coins: 20
    },
    dictionary: {}
};

// Stat point pool tracking during setup
let availablePoints = 3;
let currentStats = { farm: 1, culinary: 1, strength: 1 };

function adjustStat(statName, amount) {
    if (amount > 0 && availablePoints > 0) {
        currentStats[statName] += 1;
        availablePoints -= 1;
    } else if (amount < 0 && currentStats[statName] > 1) {
        currentStats[statName] -= 1;
        availablePoints += 1;
    }
    
    // Update DOM UI
    document.getElementById('points-left').innerText = availablePoints;
    document.getElementById(`stat-${statName}`).innerText = currentStats[statName];
}

// Switch between active screen views cleanly
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Complete Character Setup -> Move to Pre-Test
function completeSetup() {
    const nameInput = document.getElementById('char-name').value.trim();
    const selectedIcon = document.querySelector('input[name="icon"]:checked').value;
    const selectedHouse = document.querySelector('input[name="house"]:checked').value;

    if (nameInput) {
        gameState.player.name = nameInput;
    }
    gameState.player.icon = selectedIcon;
    gameState.player.house = selectedHouse;
    gameState.player.stats = { ...currentStats };

    // House perks check
    if (selectedHouse === "Cozy Cottage") {
        gameState.player.maxEnergy = 55;
        gameState.player.energy = 55;
    } else if (selectedHouse === "Sturdy Cabin") {
        gameState.player.stats.strength += 1;
    } else if (selectedHouse === "Garden Greenhouse") {
        gameState.player.stats.farm += 1;
    }

    saveGame();
    showScreen('screen-pretest');
}

// Finish Pre-Test -> Move to World Map Hub
function finishPretest() {
    // Transition to map
    updateHUD();
    showScreen('screen-map');
}

// Update HUD elements on the map screen
function updateHUD() {
    document.getElementById('hud-name').innerText = `${gameState.player.icon} ${gameState.player.name}`;
    document.getElementById('hud-coins').innerText = gameState.player.coins;
    document.getElementById('hud-energy').innerText = gameState.player.energy;
    document.getElementById('hud-max-energy').innerText = gameState.player.maxEnergy;
}

// Save to browser memory
function saveGame() {
    localStorage.setItem('language_rpg_save', JSON.stringify(gameState));
}

// Load from browser memory if it exists
function loadGame() {
    const saved = localStorage.getItem('language_rpg_save');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Initialize on load
window.onload = function() {
    loadGame();
};