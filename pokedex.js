// Master vocabulary database (Expandable up to 1000+ entries)
const vocabDatabase = [
    {
        id: "v1",
        number: "001",
        word: "Manzana",
        english: "Apple",
        image: "🍎",
        sentences: [
            { es: "La manzana es roja y dulce.", en: "The apple is red and sweet." },
            { es: "Comí una manzana esta mañana.", en: "I ate an apple this morning." }
        ]
    },
    {
        id: "v2",
        number: "002",
        word: "Gato",
        english: "Cat",
        image: "🐱",
        sentences: [
            { es: "El gato duerme en el sofá.", en: "The cat sleeps on the sofa." },
            { es: "Mi gato persigue un ratón.", en: "My cat chases a mouse." }
        ]
    },
    {
        id: "v3",
        number: "003",
        word: "Casa",
        english: "House",
        image: "🏠",
        sentences: [
            { es: "Nuestra casa es muy acogedora.", en: "Our house is very cozy." },
            { es: "Ella vive cerca de mi casa.", en: "She lives near my house." }
        ]
    },
    {
        id: "v4",
        number: "004",
        word: "Agua",
        english: "Water",
        image: "💧",
        sentences: [
            { es: "Bebo un vaso de agua fresca.", en: "I drink a glass of fresh water." },
            { es: "El agua del río está fría.", en: "The river water is cold." }
        ]
    },
    {
        id: "v5",
        number: "005",
        word: "Libro",
        english: "Book",
        image: "📖",
        sentences: [
            { es: "Leo un libro interesante.", en: "I am reading an interesting book." },
            { es: "El libro está sobre la mesa.", en: "The book is on the table." }
        ]
    },
    {
        id: "v6",
        number: "006",
        word: "Silla",
        english: "Chair",
        image: "🪑",
        sentences: [
            { es: "na", en: "na" },
            { es: "na", en: "na" }
        ]
    },
    {
        id: "v7",
        number: "007",
        word: "Reloj",
        english: "Clock",
        image: "⏰",
        sentences: [
            { es: "na", en: "na" },
            { es: "na", en: "na" }
        ]
    },
    {
        id: "v8",
        number: "008",
        word: "Lámpara",
        english: "Lamp",
        image: "💡",
        sentences: [
            { es: "na", en: "na" },
            { es: "na", en: "na" }
        ]
    },
    {
        id: "v9",
        number: "009",
        word: "Cámara",
        english: "Camera",
        image: "📷",
        sentences: [
            { es: "na", en: "na" },
            { es: "na", en: "na" }
        ]
    },
    {
        id: "v10",
        number: "010",
        word: "Espejo",
        english: "Mirror",
        image: "🪞",
        sentences: [
            { es: "na", en: "na" },
            { es: "na", en: "na" }
        ]
    },
];

let currentDetailIndex = 0;

// Helper: Determine icon and seen state based on gameState.dictionary
function getWordStatus(id) {
    if (!gameState.dictionary) gameState.dictionary = {};
    const record = gameState.dictionary[id];

    if (!record) {
        return { stateClass: 'unseen', icon: '❓', statusText: 'Unseen' };
    }
    
    // Status Logic: Mastered (⭐) vs 1-Correct (✨) vs Seen (👁️)
    if (record.status === 'mastered' || record.repetitions >= 2) {
        return { stateClass: 'seen', icon: '⭐', statusText: 'Mastered' };
    } else if (record.repetitions === 1) {
        return { stateClass: 'seen', icon: '✨', statusText: '1 Correct' };
    } else {
        return { stateClass: 'seen', icon: '👁️', statusText: 'Seen' };
    }
}

// Render Pokedex Grid List
function openPokedex() {
    showScreen('screen-pokedex');
    const container = document.getElementById('pokedex-list');
    if (!container) return;

    let totalUnlocked = 0;

    container.innerHTML = vocabDatabase.map((item, index) => {
        const status = getWordStatus(item.id);
        if (status.stateClass === 'seen') totalUnlocked++;

        return `
            <div class="pokedex-item ${status.stateClass}" onclick="openWordDetails(${index})">
                <span class="pokedex-num">#${item.number}</span>
                <span class="pokedex-icon">${status.icon}</span>
                <span class="pokedex-word">${item.word}</span>
            </div>
        `;
    }).join('');

    document.getElementById('pokedex-progress').innerText = `${totalUnlocked} / ${vocabDatabase.length} Unlocked`;
}

// Render Word Details View
function openWordDetails(index) {
    currentDetailIndex = index;
    const item = vocabDatabase[index];
    const status = getWordStatus(item.id);

    // If unseen, mark as seen when details are inspected
    if (!gameState.dictionary[item.id]) {
        gameState.dictionary[item.id] = { status: 'learning', repetitions: 0, level: 0 };
        saveGame();
    }

    document.getElementById('detail-number').innerText = `#${item.number}`;
    document.getElementById('detail-icon-status').innerText = status.icon;
    document.getElementById('detail-image').innerText = item.image;
    document.getElementById('detail-word').innerText = item.word;
    document.getElementById('detail-translation').innerText = item.english;

    // Render 2 Sentences
    const sentenceBox = document.getElementById('detail-sentences');
    sentenceBox.innerHTML = item.sentences.map(s => `
        <div class="sentence-card">
            <p class="sentence-es">"${s.es}"</p>
            <p class="sentence-en">${s.en}</p>
        </div>
    `).join('');

    showScreen('screen-word-details');
}

// Native Text-To-Speech Audio
function playWordAudio() {
    const item = vocabDatabase[currentDetailIndex];
    if (!item) return;

    window.speechSynthesis.cancel(); // Stop any overlapping audio
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'es-ES'; // Spanish pronunciation
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// Next Button Navigation
function nextWordDetails() {
    let nextIndex = (currentDetailIndex + 1) % vocabDatabase.length;
    openWordDetails(nextIndex);
}