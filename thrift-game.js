// ==========================================
// THRIFT SHOP FALLING ITEMS GAME MODULE
// ==========================================
/*
const thriftItemsPool = [
    { id: "t1", word: "Silla", english: "Chair", icon: "🪑" },
    { id: "t2", word: "Reloj", english: "Clock", icon: "⏰" },
    { id: "t3", word: "Libro", english: "Book", icon: "📖" },
    { id: "t4", word: "Lámpara", english: "Lamp", icon: "💡" },
    { id: "t5", word: "Cámara", english: "Camera", icon: "📷" },
    { id: "t6", word: "Espejo", english: "Mirror", icon: "🪞" }
];*/
// In thrift-game.js - Match IDs with vocabDatabase
const thriftItemsPool = [
    { id: "v1", word: "Manzana", english: "Apple", icon: "🍎" },
    { id: "v2", word: "Gato", english: "Cat", icon: "🐱" },
    { id: "v3", word: "Casa", english: "House", icon: "🏠" },
    { id: "v4", word: "Agua", english: "Water", icon: "💧" },
    { id: "v5", word: "Libro", english: "Book", icon: "📖" }
];

let thriftGame = {
    score: 0,
    timeLeft: 30,
    timerId: null,
    currentTarget: null,
    targetPressure: 0.15, // starting odds of spawn being target word 
    targetPressureIncrease: 0.10 // increse in odds per spawn
};

let activeItems = [];
let basketState = { x: 260, width: 80, speed: 8 };
let keysPressed = {};
let gameLoopId = null;
let spawnTimer = 0;

// Setup Event Listeners once
window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

function startThriftGame() {
    if (gameState.player.energy < 5) {
        alert("Not enough energy! Rest up at home.");
        return;
    }

    gameState.player.energy -= 5;
    saveGame();
    updateHUD();
    

    // Reset game state
    thriftGame.score = 0;
    thriftGame.timeLeft = 30;
    thriftGame.targetPressure = 0.15;
    thriftGame.targetPressureIncrease = 0.10;
    activeItems = [];
    basketState.x = 260;
    spawnTimer = 0;

    document.getElementById('thrift-score').innerText = thriftGame.score;
    document.getElementById('thrift-timer').innerText = thriftGame.timeLeft;
    document.getElementById('thrift-items-layer').innerHTML = '';

    showScreen('screen-game-thrift');
    setupThriftInputListeners();
    setNextTargetWord();

    // Start 1-second countdown timer
    clearInterval(thriftGame.timerId);
    thriftGame.timerId = setInterval(tickThriftTimer, 1000);

    // Start 60fps Game Physics Loop
    cancelAnimationFrame(gameLoopId);
    runThriftLoop();
}

function setNextTargetWord() {
    const targetEl = document.getElementById('thrift-target-word');
    const randomItem = thriftItemsPool[Math.floor(Math.random() * thriftItemsPool.length)];
    thriftGame.currentTarget = randomItem;
    targetEl.innerText = randomItem.word;
    markWordAsSeen(randomItem.id);
}

// Main Loop
function runThriftLoop() {
    updateBasket();
    updateItems();

    spawnTimer++;
    if (spawnTimer > 50) { // Spawns an item after 50 frames, roughly every 0.7 seconds
        spawnTimer = 0;
        spawnFallingItem();
    }

    gameLoopId = requestAnimationFrame(runThriftLoop);
}

// Call this once during initialization or startThriftGame()
function setupThriftInputListeners() {
    const container = document.getElementById('thrift-game-container');
    if (!container || container.dataset.listenersBound) return;

    const moveBasketToPointer = (clientX) => {
        const rect = container.getBoundingClientRect();
        const containerWidth = container.clientWidth;
        
        // Calculate relative offset inside container
        const relativeX = clientX - rect.left;
        
        // Center basket on cursor/finger and clamp between 0 and right edge
        basketState.x = Math.max(0, Math.min(containerWidth - basketState.width, relativeX - basketState.width / 2));
        
        // Render immediately
        const basketEl = document.getElementById('thrift-basket');
        if (basketEl) basketEl.style.left = `${basketState.x}px`;
    };

    // Desktop Mouse Drag
    container.addEventListener('mousemove', (e) => moveBasketToPointer(e.clientX));

    // Mobile Touch Drag
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            moveBasketToPointer(e.touches[0].clientX);
        }
    }, { passive: true });

    container.dataset.listenersBound = "true";
}

function updateBasket() {
    const container = document.getElementById('thrift-game-container');
    const containerWidth = container ? container.clientWidth : 600;

    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        basketState.x -= basketState.speed;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        basketState.x += basketState.speed;
    }

    basketState.x = Math.max(0, Math.min(containerWidth - basketState.width, basketState.x));

    const basketEl = document.getElementById('thrift-basket');
    if (basketEl) basketEl.style.left = `${basketState.x}px`;
}

function spawnFallingItem() {
    let selectedItem;
    let tempPressure = thriftGame.targetPressure;
    const randomVal = Math.random();

    // Check against current target pressure probability
    if (randomVal < tempPressure) {
        selectedItem = thriftGame.currentTarget;
        tempPressure = thriftGame.targetPressure; // Reset back to base 15%
    } else {
        selectedItem = thriftItemsPool[Math.floor(Math.random() * thriftItemsPool.length)];
        tempPressure += thriftGame.targetPressureIncrease; // Increase chance for next spawn
    }

    const container = document.getElementById('thrift-game-container');
    const containerWidth = container ? container.clientWidth : 600;
    const itemWidth = 90;

    // Clamp spawn X so the entire item stays inside the container boundaries
    const startX = Math.random() * (containerWidth - itemWidth);
    const startY = -40;

    const domEl = document.createElement('div');
    domEl.className = 'falling-item';
    domEl.style.left = `${startX}px`;
    domEl.style.top = `${startY}px`;
    domEl.innerHTML = `<span>${selectedItem.icon}</span> <span>${selectedItem.english}</span>`;

    document.getElementById('thrift-items-layer').appendChild(domEl);

    activeItems.push({
        id: selectedItem.id,
        x: startX,
        y: startY,
        speed: 2.5 + Math.random() * 2,
        width: itemWidth,
        height: 35,
        el: domEl
    });
}

function updateItems() {
    const container = document.getElementById('thrift-game-container');
    const containerHeight = container ? container.clientHeight : 400;
    const basketY = containerHeight - 50;

    const screenEl = document.getElementById('screen-game-thrift');

    for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];

        item.y += item.speed;
        item.el.style.left = `${item.x}px`;
        item.el.style.top = `${item.y}px`;

        // Check AABB collision with basket
        const hitX = (item.x + item.width > basketState.x) && (item.x < basketState.x + basketState.width);
        const hitY = (item.y + item.height >= basketY) && (item.y <= basketY + 30);

        if (hitX && hitY) {
            screenEl.classList.remove('flash-correct', 'flash-incorrect');
            void screenEl.offsetWidth; // Reflow to restart animation

            if (item.id === thriftGame.currentTarget.id) {
                // Correct item caught!
                thriftGame.score += 10;
                document.getElementById('thrift-score').innerText = thriftGame.score;
                screenEl.classList.add('flash-correct');

                // Increment dictionary progress
                markWordAsCorrect(item.id);
                
                // Switch target word after catching target
                setNextTargetWord();
            } else {
                // Wrong item caught!
                //screenEl.classList.add('flash-incorrect');
            }

            item.el.remove();
            activeItems.splice(i, 1);
            continue;
        }

        // Clean up item when its top edge passes the container floor
        if (item.y > containerHeight) {
            item.el.remove();
            activeItems.splice(i, 1);
        }
    }
}

function tickThriftTimer() {
    thriftGame.timeLeft--;
    document.getElementById('thrift-timer').innerText = thriftGame.timeLeft;

    if (thriftGame.timeLeft <= 0) {
        endThriftGame();
    }
}

function endThriftGame() {
    clearInterval(thriftGame.timerId);
    cancelAnimationFrame(gameLoopId);

    const coinsEarned = Math.floor(thriftGame.score / 2);
    gameState.player.coins = (gameState.player.coins || 0) + coinsEarned;
    saveGame();
    updateHUD();

    alert(`Time's up! You scored ${thriftGame.score} points and earned 🪙 ${coinsEarned} Coins!`);
    exitThriftGame();
}

function exitThriftGame() {
    clearInterval(thriftGame.timerId);
    cancelAnimationFrame(gameLoopId);
    showScreen('screen-map');
}

// Marks a word as 'seen' in the dictionary if not already present
function markWordAsSeen(wordId) {
    if (!gameState.dictionary) gameState.dictionary = {};
    if (!gameState.dictionary[wordId]) {
        gameState.dictionary[wordId] = { status: 'learning', repetitions: 0, level: 0 };
        saveGame();
    }
}

// Increments correct count and updates status to 'mastered' when caught
function markWordAsCorrect(wordId) {
    if (!gameState.dictionary) gameState.dictionary = {};
    
    if (!gameState.dictionary[wordId]) {
        gameState.dictionary[wordId] = { status: 'learning', repetitions: 1, level: 0 };
    } else {
        gameState.dictionary[wordId].repetitions = (gameState.dictionary[wordId].repetitions || 0) + 1;
        if (gameState.dictionary[wordId].repetitions >= 2) {
            gameState.dictionary[wordId].status = 'mastered';
        }
    }
    saveGame();
}