// ==========================================
// THRIFT SHOP MINI-GAME MODULE
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

function startThriftGame() {
    // Reads from gameState defined in app.js
    if (gameState.player.energy < 5) {
        alert("Not enough energy! Rest up at home.");
        return;
    }

    gameState.player.energy -= 5;
    saveGame();    // Defined in app.js
    updateHUD();   // Defined in app.js

    thriftGame.score = 0;
    thriftGame.timeLeft = 30;
    document.getElementById('thrift-score').innerText = thriftGame.score;
    document.getElementById('thrift-timer').innerText = thriftGame.timeLeft;

    showScreen('screen-game-thrift'); // Defined in app.js
    nextThriftRound();

    clearInterval(thriftGame.timerId);
    thriftGame.timerId = setInterval(tickThriftTimer, 1000);
}

function nextThriftRound() {
    const playArea = document.getElementById('thrift-play-area');
    const targetEl = document.getElementById('thrift-target-word');
    if (!playArea || !targetEl) return;

    const shuffled = [...thriftItemsPool].sort(() => 0.5 - Math.random());
    const roundChoices = shuffled.slice(0, 4);

    thriftGame.currentTarget = roundChoices[Math.floor(Math.random() * roundChoices.length)];
    targetEl.innerText = thriftGame.currentTarget.word;

    playArea.innerHTML = roundChoices.map(item => `
        <button class="thrift-item-btn" onclick="catchThriftItem('${item.id}', this)">
            <span style="font-size: 2rem;">${item.icon}</span>
            <span>${item.english}</span>
        </button>
    `).join('');
}

function catchThriftItem(itemId, clickedElement) {
    const screenEl = document.getElementById('screen-game-thrift');
    const isCorrect = (itemId === thriftGame.currentTarget.id);

    // 1. Remove any leftover animation classes to re-trigger animation
    screenEl.classList.remove('flash-correct', 'flash-incorrect');
    
    // Force a reflow so CSS animations restart cleanly
    void screenEl.offsetWidth; 

    // 2. Apply flash and button state
    if (isCorrect) {
        screenEl.classList.add('flash-correct');
        if (clickedElement) clickedElement.classList.add('btn-correct');

        thriftGame.score += 10;
        document.getElementById('thrift-score').innerText = thriftGame.score;

        if (!gameState.dictionary) gameState.dictionary = {};
        gameState.dictionary[itemId] = { 
            status: 'learning', 
            reps: (gameState.dictionary[itemId]?.reps || 0) + 1 
        };
    } else {
        screenEl.classList.add('flash-incorrect');
        if (clickedElement) clickedElement.classList.add('btn-incorrect');
    }

    // 3. Briefly pause before loading the next round so the visual registers
    setTimeout(() => {
        screenEl.classList.remove('flash-correct', 'flash-incorrect');
        nextThriftRound();
    }, 250);
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

    const coinsEarned = Math.floor(thriftGame.score / 2);
    gameState.player.coins = (gameState.player.coins || 0) + coinsEarned;
    saveGame();
    updateHUD();

    alert(`Time's up! You scored ${thriftGame.score} points and earned 🪙 ${coinsEarned} Coins!`);
    exitThriftGame();
}

function exitThriftGame() {
    clearInterval(thriftGame.timerId);
    showScreen('screen-map');
}