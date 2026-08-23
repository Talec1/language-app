// ==========================================
// THRIFT SHOP FALLING ITEMS GAME MODULE
// ==========================================

const thriftItemsPool = [
    { id: "t1", word: "Silla", english: "Chair", icon: "🪑" },
    { id: "t2", word: "Reloj", english: "Clock", icon: "⏰" },
    { id: "t3", word: "Libro", english: "Book", icon: "📖" },
    { id: "t4", word: "Lámpara", english: "Lamp", icon: "💡" },
    { id: "t5", word: "Cámara", english: "Camera", icon: "📷" },
    { id: "t6", word: "Espejo", english: "Mirror", icon: "🪞" }
];

let thriftGame = {
    score: 0,
    timeLeft: 30,
    timerId: null,
    currentTarget: null
};

let activeItems = [];
let basketState = { x: 260, width: 80, speed: 8 };
let keysPressed = {};
let gameLoopId = null;
let spawnTimer = 0;

// Setup Event Listeners once
window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

// Optional Mouse Control
document.getElementById('thrift-game-container')?.addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    basketState.x = Math.max(0, Math.min(600 - basketState.width, mouseX - basketState.width / 2));
});

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
    activeItems = [];
    basketState.x = 260;
    spawnTimer = 0;

    document.getElementById('thrift-score').innerText = thriftGame.score;
    document.getElementById('thrift-timer').innerText = thriftGame.timeLeft;
    document.getElementById('thrift-items-layer').innerHTML = '';

    showScreen('screen-game-thrift');
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
}

function runThriftLoop() {
    updateBasket();
    updateItems();

    spawnTimer++;
    if (spawnTimer % 80 === 0) { // Spawns an item roughly every 1.3 seconds
        spawnFallingItem();
    }

    gameLoopId = requestAnimationFrame(runThriftLoop);
}

function updateBasket() {
    const containerWidth = 600;

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
    const randomItem = thriftItemsPool[Math.floor(Math.random() * thriftItemsPool.length)];

    const domEl = document.createElement('div');
    domEl.className = 'falling-item';
    domEl.innerHTML = `<span>${randomItem.icon}</span> <span>${randomItem.english}</span>`;
    document.getElementById('thrift-items-layer').appendChild(domEl);

    activeItems.push({
        id: randomItem.id,
        x: Math.random() * (600 - 100),
        y: -40,
        speed: 2 + Math.random() * 2,
        width: 90,
        height: 35,
        el: domEl
    });
}

function updateItems() {
    const basketY = 400 - 50;
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
                
                // Switch target word after catching target
                setNextTargetWord();
            } else {
                // Wrong item caught!
                screenEl.classList.add('flash-incorrect');
            }

            item.el.remove();
            activeItems.splice(i, 1);
            continue;
        }

        // Remove item if it falls past floor
        if (item.y > 400) {
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