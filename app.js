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

// Updated showScreen to auto-save location
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        gameState.player.currentScreen = screenId;
        saveGame();
    }
}

function chooseIcons() {
    const nameInput = document.getElementById('char-name').value.trim();
    if (nameInput) {
        gameState.player.name = nameInput;
    }
    showScreen('screen-setup2');
}

function completeSetup() {
    // Null safety check on radio inputs
    const iconEl = document.querySelector('input[name="icon"]:checked');
    const houseEl = document.querySelector('input[name="house"]:checked');

    if (!iconEl || !houseEl) {
        alert("Please select both an icon and a house!");
        return;
    }

    gameState.player.icon = iconEl.value;
    gameState.player.house = houseEl.value;
    gameState.player.stats = { ...currentStats };

    if (houseEl.value === "Cozy Cottage") {
        gameState.player.maxEnergy = 55;
        gameState.player.energy = 55;
    } else if (houseEl.value === "Sturdy Cabin") {
        gameState.player.stats.strength += 1;
    } else if (houseEl.value === "Garden Greenhouse") {
        gameState.player.stats.farm += 1;
    }

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

// Ensure the page restores the user to the exact screen they were on
function loadGame() {
    const saved = localStorage.getItem('language_rpg_save');
    if (saved) {
        gameState = JSON.parse(saved);
        if (gameState.player.currentScreen) {
            showScreen(gameState.player.currentScreen);
        }
    }
}

// Initialize on load
window.onload = function() {
    loadGame();
};