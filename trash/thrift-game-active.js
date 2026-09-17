// ==========================================
// FALLING ITEMS MECHANIC
// ==========================================

let activeItems = [];
let basketState = { x: 260, width: 80, speed: 8 };
let keysPressed = {};
let gameLoopId = null;
let spawnTimer = 0;

// Track Arrow Keys
window.addEventListener('keydown', (e) => keysPressed[e.key] = true);
window.addEventListener('keyup', (e) => keysPressed[e.key] = false);

// Optional: Track Mouse Movement over container
document.getElementById('thrift-game-container')?.addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    basketState.x = Math.max(0, Math.min(600 - basketState.width, mouseX - basketState.width / 2));
});

function startFallingThriftGame() {
    activeItems = [];
    basketState.x = 260;
    
    // Clear old elements
    document.getElementById('thrift-items-layer').innerHTML = '';
    
    // Start loop
    cancelAnimationFrame(gameLoopId);
    runThriftLoop();
}

function runThriftLoop() {
    updateBasket();
    updateItems();
    
    // Spawn a new falling item every ~90 frames (~1.5 seconds)
    spawnTimer++;
    if (spawnTimer % 90 === 0) {
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

    // Clamp inside container boundaries
    basketState.x = Math.max(0, Math.min(containerWidth - basketState.width, basketState.x));
    
    // Render Basket
    const basketEl = document.getElementById('thrift-basket');
    if (basketEl) basketEl.style.left = `${basketState.x}px`;
}

function spawnFallingItem() {
    const pool = thriftItemsPool; // Uses your item pool
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    
    const domEl = document.createElement('div');
    domEl.className = 'falling-item';
    domEl.innerHTML = `<span>${randomItem.icon}</span> <span>${randomItem.word}</span>`;
    document.getElementById('thrift-items-layer').appendChild(domEl);

    const newItem = {
        id: randomItem.id,
        x: Math.random() * (600 - 100), // Random horizontal start
        y: -40,
        speed: 2 + Math.random() * 2,    // Random downward velocity
        width: 90,
        height: 35,
        el: domEl
    };

    activeItems.push(newItem);
}

function updateItems() {
    const basketY = 400 - 50; // Basket top position (container height minus bottom offset)

    for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];
        
        // Apply velocity
        item.y += item.speed;
        item.el.style.left = `${item.x}px`;
        item.el.style.top = `${item.y}px`;

        // Check AABB Collision with Basket
        const hitX = (item.x + item.width > basketState.x) && (item.x < basketState.x + basketState.width);
        const hitY = (item.y + item.height >= basketY) && (item.y <= basketY + 30);

        if (hitX && hitY) {
            // CAUGHT ITEM
            onCatchItem(item);
            item.el.remove();
            activeItems.splice(i, 1);
            continue;
        }

        // Check if item hit the floor (Missed)
        if (item.y > 400) {
            item.el.remove();
            activeItems.splice(i, 1);
        }
    }
}

function onCatchItem(item) {
    // Check if item matches current target word
    if (item.id === thriftGame.currentTarget.id) {
        thriftGame.score += 10;
        document.getElementById('thrift-score').innerText = thriftGame.score;
        // Trigger green flash or sound
    } else {
        // Penalty for catching wrong item
        // Trigger red flash
    }
}