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

// Vocabulary pool for the pre-test
const pretestVocabulary = [
    { id: "v1", word: "Manzana", correct: "Apple", options: ["Apple", "House", "Dog", "Book"] },
    { id: "v2", word: "Gato", correct: "Cat", options: ["Water", "Cat", "Run", "Bread"] },
    { id: "v3", word: "Casa", correct: "House", options: ["Tree", "Car", "House", "City"] },
    { id: "v4", word: "Agua", correct: "Water", options: ["Milk", "Fire", "Earth", "Water"] },
    { id: "v5", word: "Libro", correct: "Book", options: ["Book", "Phone", "Door", "Pencil"] }
];

let currentQuestionIndex = 0;

// Update completeSetup to send players to the suggestion screen
function completeSetup() {
    const iconEl = document.querySelector('input[name="icon"]:checked');
    const houseEl = document.querySelector('input[name="house"]:checked');

    if (!iconEl || !houseEl) return;

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

    saveGame();
    showScreen('screen-suggests-pretest');
}

// Start the interactive pre-test loop
function startPretest() {
    currentQuestionIndex = 0;
    renderQuestion();
    showScreen('screen-pretest');
}

// Render current question and options dynamically into HTML
function renderQuestion() {
    const currentQ = pretestVocabulary[currentQuestionIndex];
    const targetHeading = document.getElementById('target-word');
    //const targetHeading = document.querySelector('#screen-pretest h1');
    const contentDiv = document.getElementById('pretest-options');

    if (!targetHeading || !contentDiv) return;

    // Display target word
    targetHeading.innerText = currentQ.word;

    // Generate dynamic option buttons
    contentDiv.innerHTML = currentQ.options.map((optionText) => {
        // Escape quotes to prevent inline syntax errors
        const safeText = optionText.replace(/'/g, "\\'");
        return `<button class="primary-btn option-btn" onclick="PretestChoice('${safeText}')">${optionText}</button>`;
    }).join('');
}

// Process selected option
function PretestChoice(selectedAnswer) {
    const currentQ = pretestVocabulary[currentQuestionIndex];

    // Initialize dictionary in state if missing
    if (!gameState.dictionary) {
        gameState.dictionary = {};
    }

    // Record result in state
    if (selectedAnswer === currentQ.correct) {
        gameState.dictionary[currentQ.id] = { status: 'mastered', repetitions: 1, level: 1 };
    } else {
        gameState.dictionary[currentQ.id] = { status: 'learning', repetitions: 0, level: 0 };
    }

    currentQuestionIndex++;

    // Advance to next question or complete test
    if (currentQuestionIndex < pretestVocabulary.length) {
        renderQuestion();
    } else {
        finishPretest();
    }
}

// Finish pre-test and head to map
function finishPretest() {
    saveGame();
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

function resetGame() {
    localStorage.removeItem('language_rpg_save');
    location.reload(); // Restarts the app from scratch
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