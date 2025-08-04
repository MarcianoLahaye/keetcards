// Game state management
let currentGame = null;
let gameState = {
    phase: 1,
    currentCard: 0,
    playerCards: [],
    deck: [],
    predictions: [],
    pyramid: [],
    busCards: []
};

// Card deck creation
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                suit: suit,
                value: value,
                numericValue: getNumericValue(value),
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
            });
        }
    }
    return shuffleDeck(deck);
}

function getNumericValue(value) {
    if (value === 'A') return 14; // Ace is highest
    if (value === 'J') return 11;
    if (value === 'Q') return 12;
    if (value === 'K') return 13;
    return parseInt(value);
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Game initialization
function initGame(gameType) {
    currentGame = gameType;
    gameState = {
        phase: 1,
        currentCard: 0,
        playerCards: [],
        deck: createDeck(),
        predictions: [],
        pyramid: [],
        busCards: []
    };
    
    document.getElementById('game-title').textContent = getGameTitle(gameType);
    showGameScreen();
    loadGame(gameType);
}

function getGameTitle(gameType) {
    const titles = {
        'bussen': 'Bussen',
        'extreem-bussen': 'Extreem Bussen',
        'king-of-hill': 'King of the Hill',
        'kingsen': 'Kingsen'
    };
    return titles[gameType] || 'Spel';
}

function showGameScreen() {
    document.querySelector('.games-container').style.display = 'none';
    document.getElementById('game-screen').classList.remove('hidden');
}

function hideGameScreen() {
    document.querySelector('.games-container').style.display = 'grid';
    document.getElementById('game-screen').classList.add('hidden');
}

// Bussen Game Implementation
function loadBussenGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Fase 1: Voorspellen
            </div>
            
            <div class="game-info">
                <h3>Spelregels</h3>
                <p id="phase-description">
                    Je krijgt 4 kaarten. Bij elke kaart moet je iets raden. 
                    Fout = drinken. Goed = doorgaan.
                </p>
            </div>
            
            <div class="cards-container" id="cards-container">
                <!-- Cards will be generated here -->
            </div>
            
            <div class="prediction-buttons" id="prediction-buttons">
                <!-- Prediction buttons will be generated here -->
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="next-card-btn" style="display: none;">
                    Volgende Kaart
                </button>
                <button class="game-btn secondary" id="next-phase-btn" style="display: none;">
                    Naar Fase 2: Piramide
                </button>
            </div>
        </div>
    `;
    
    startPhase1();
}

function startPhase1() {
    gameState.phase = 1;
    gameState.currentCard = 0;
    gameState.currentCardRevealed = false;
    gameState.playerCards = gameState.deck.slice(0, 4);
    
    updatePhaseIndicator();
    showCurrentCard();
    setupPredictionButtons();
    
    document.getElementById('next-card-btn').addEventListener('click', nextCard);
    document.getElementById('next-phase-btn').addEventListener('click', startPhase2);
}

function updatePhaseIndicator() {
    const phaseIndicator = document.getElementById('phase-indicator');
    const phaseDescriptions = {
        1: 'Fase 1: Voorspellen',
        2: 'Fase 2: Piramide',
        3: 'Fase 3: De Bus'
    };
    phaseIndicator.textContent = phaseDescriptions[gameState.phase];
}

function showCurrentCard() {
    const cardsContainer = document.getElementById('cards-container');
    
    cardsContainer.innerHTML = '';
    
    // Show played cards and current card if it should be revealed
    gameState.playerCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${index < gameState.currentCard ? card.color : 'hidden'}`;
        
        if (index < gameState.currentCard) {
            // Show card if it's been played
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem;">${card.value}</div>
                    <div style="font-size: 2rem;">${card.suit}</div>
                </div>
            `;
        } else if (index === gameState.currentCard && gameState.currentCardRevealed) {
            // Show current card if it should be revealed
            cardElement.className = `card ${card.color}`;
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem;">${card.value}</div>
                    <div style="font-size: 2rem;">${card.suit}</div>
                </div>
            `;
        } else {
            // Hide current and future cards
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>?</div>
                </div>
            `;
        }
        
        cardsContainer.appendChild(cardElement);
    });
    
    updatePhaseDescription();
}

function updatePhaseDescription() {
    const descriptions = [
        'Rood of zwart? Raden of de kaart harten/ruiten (rood) of klaveren/schoppen (zwart) is.',
        'Hoger of lager? Is de tweede kaart hoger of lager dan de eerste?',
        'Binnen of buiten? Ligt de derde kaart tussen of buiten de waarden van de eerste twee?',
        'Welke kleur? Raden van het exacte symbool (harten, schoppen, klaveren of ruiten).'
    ];
    
    document.getElementById('phase-description').textContent = descriptions[gameState.currentCard];
}

function setupPredictionButtons() {
    const buttonsContainer = document.getElementById('prediction-buttons');
    const currentCard = gameState.currentCard;
    
    buttonsContainer.innerHTML = '';
    
    if (currentCard === 0) {
        // Rood of zwart
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="red">Rood ♥♦</button>
            <button class="prediction-btn" data-prediction="black">Zwart ♠♣</button>
        `;
    } else if (currentCard === 1) {
        // Hoger of lager
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="higher">Hoger</button>
            <button class="prediction-btn" data-prediction="lower">Lager</button>
        `;
    } else if (currentCard === 2) {
        // Binnen of buiten
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="inside">Binnen</button>
            <button class="prediction-btn" data-prediction="outside">Buiten</button>
        `;
    } else if (currentCard === 3) {
        // Welke kleur
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="hearts">Harten ♥</button>
            <button class="prediction-btn" data-prediction="diamonds">Ruiten ♦</button>
            <button class="prediction-btn" data-prediction="clubs">Klaveren ♣</button>
            <button class="prediction-btn" data-prediction="spades">Schoppen ♠</button>
        `;
    }
    
    // Add event listeners
    buttonsContainer.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.addEventListener('click', handlePrediction);
    });
}

function handlePrediction(event) {
    const prediction = event.target.dataset.prediction;
    const currentCard = gameState.playerCards[gameState.currentCard];
    let isCorrect = false;
    
    // Check prediction
    if (gameState.currentCard === 0) {
        // Rood of zwart
        isCorrect = (prediction === 'red' && currentCard.color === 'red') ||
                   (prediction === 'black' && currentCard.color === 'black');
    } else if (gameState.currentCard === 1) {
        // Hoger of lager
        const firstCard = gameState.playerCards[0];
        isCorrect = (prediction === 'higher' && currentCard.numericValue > firstCard.numericValue) ||
                   (prediction === 'lower' && currentCard.numericValue < firstCard.numericValue);
    } else if (gameState.currentCard === 2) {
        // Binnen of buiten
        const firstCard = gameState.playerCards[0];
        const secondCard = gameState.playerCards[1];
        const min = Math.min(firstCard.numericValue, secondCard.numericValue);
        const max = Math.max(firstCard.numericValue, secondCard.numericValue);
        
        isCorrect = (prediction === 'inside' && currentCard.numericValue >= min && currentCard.numericValue <= max) ||
                   (prediction === 'outside' && (currentCard.numericValue < min || currentCard.numericValue > max));
    } else if (gameState.currentCard === 3) {
        // Welke kleur
        const suitMap = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        isCorrect = currentCard.suit === suitMap[prediction];
    }
    
    // Update button appearance
    event.target.classList.add(isCorrect ? 'correct' : 'incorrect');
    event.target.textContent += isCorrect ? ' ✓' : ' ✗';
    
    // Disable all buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Reveal the current card immediately
    gameState.currentCardRevealed = true;
    showCurrentCard();
    
    // Show next button immediately
    if (gameState.currentCard < 3) {
        document.getElementById('next-card-btn').style.display = 'inline-block';
    } else {
        document.getElementById('next-phase-btn').style.display = 'inline-block';
    }
}

function nextCard() {
    gameState.currentCard++;
    gameState.currentCardRevealed = false;
    document.getElementById('next-card-btn').style.display = 'none';
    showCurrentCard();
    setupPredictionButtons();
}

function startPhase2() {
    gameState.phase = 2;
    gameState.pyramid = createPyramid();
    
    updatePhaseIndicator();
    loadPhase2();
}

function createPyramid() {
    const pyramid = [];
    let cardIndex = 4; // Start after player cards
    
    // Create pyramid: 1, 2, 3, 4, 1 cards per row (only bottom row has 1 card)
    // Drink amounts: 2, 4, 6, 8, 10 slokken (bottom to top)
    for (let row = 1; row <= 5; row++) {
        const rowCards = [];
        const cardsInRow = row === 5 ? 1 : row; // Only bottom row (row 5) has 1 card
        
        for (let col = 0; col < cardsInRow; col++) {
            rowCards.push({
                ...gameState.deck[cardIndex],
                revealed: false,
                row: row,
                slokken: (6 - row) * 2 // 10, 8, 6, 4, 2 slokken (top to bottom)
            });
            cardIndex++;
        }
        pyramid.push(rowCards);
    }
    
    return pyramid;
}

function loadPhase2() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Fase 2: Piramide
            </div>
            
            <div class="game-info">
                <h3>Piramide Regels</h3>
                <p>Van onder naar boven wordt per rij één kaart omgedraaid. 
                Heb je een match met je handkaarten? Je mag slokken uitdelen!</p>
            </div>
            
            <div id="pyramid-container">
                <!-- Pyramid will be generated here -->
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="reveal-pyramid-btn">
                    Omgedraaide Kaart Onthullen
                </button>
                <button class="game-btn secondary" id="to-phase3-btn" style="display: none;">
                    Naar Fase 3: De Bus
                </button>
            </div>
        </div>
    `;
    
    displayPyramid();
    
    document.getElementById('reveal-pyramid-btn').addEventListener('click', revealPyramidCard);
    document.getElementById('to-phase3-btn').addEventListener('click', startPhase3);
}

function displayPyramid() {
    const pyramidContainer = document.getElementById('pyramid-container');
    pyramidContainer.innerHTML = '';
    
    // Add player's hand cards at the top
    const handRow = document.createElement('div');
    handRow.style.display = 'flex';
    handRow.style.justifyContent = 'center';
    handRow.style.gap = '10px';
    handRow.style.marginBottom = '20px';
    handRow.style.padding = '10px';
    handRow.style.background = '#f8f9fa';
    handRow.style.borderRadius = '10px';
    
    gameState.playerCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.style.width = '120px';
        cardElement.style.height = '180px';
        cardElement.style.fontSize = '1.5rem';
        cardElement.style.cursor = card.matched ? 'default' : 'pointer';
        
        // Visual feedback for different card states
        if (card.matched) {
            cardElement.style.opacity = '0.5';
        } else if (card.played) {
            cardElement.style.opacity = '0.7';
            cardElement.style.border = '2px solid #3498db';
        }
        
        cardElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem;">${card.value}</div>
                <div style="font-size: 3rem;">${card.suit}</div>
            </div>
        `;
        
        // Add click handler to play card (only if not matched)
        if (!card.matched) {
            cardElement.addEventListener('click', () => playCard(index));
        }
        handRow.appendChild(cardElement);
    });
    
    pyramidContainer.appendChild(handRow);
    
    // Display pyramid cards
    gameState.pyramid.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.style.display = 'flex';
        rowElement.style.justifyContent = 'center';
        rowElement.style.gap = '10px';
        rowElement.style.marginBottom = '10px';
        
        row.forEach((card, cardIndex) => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.revealed ? card.color : 'hidden'}`;
            cardElement.style.width = '80px';
            cardElement.style.height = '120px';
            cardElement.style.fontSize = '1rem';
            
            if (card.revealed) {
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div>${card.value}</div>
                        <div style="font-size: 1.5rem;">${card.suit}</div>
                        <div style="font-size: 0.8rem; margin-top: 5px;">${card.slokken} slokken</div>
                    </div>
                `;
            } else {
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 0.8rem;">${card.slokken} slokken</div>
                    </div>
                `;
            }
            
            rowElement.appendChild(cardElement);
        });
        
        pyramidContainer.appendChild(rowElement);
    });
}

function playCard(cardIndex) {
    // Don't allow playing already matched cards
    if (gameState.playerCards[cardIndex].matched) {
        return;
    }
    
    // Mark card as played
    gameState.playerCards[cardIndex].played = true;
    
    // Check if any pyramid cards match the played card
    let matchFound = false;
    gameState.pyramid.forEach((row, rowIndex) => {
        row.forEach((pyramidCard, pCardIndex) => {
            if (pyramidCard.revealed && !pyramidCard.matched &&
                (pyramidCard.suit === gameState.playerCards[cardIndex].suit || 
                 pyramidCard.value === gameState.playerCards[cardIndex].value)) {
                // Match found! Player can assign drinks
                pyramidCard.matched = true;
                gameState.playerCards[cardIndex].matched = true;
                matchFound = true;
            }
        });
    });
    
    if (matchFound) {
        // Show match message
        const matchDiv = document.createElement('div');
        matchDiv.style.cssText = `
            background: #27ae60;
            color: white;
            padding: 10px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
        `;
        matchDiv.textContent = 'Match! Je kunt slokken uitdelen!';
        
        const pyramidContainer = document.getElementById('pyramid-container');
        pyramidContainer.parentNode.insertBefore(matchDiv, pyramidContainer.nextSibling);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (matchDiv.parentNode) {
                matchDiv.parentNode.removeChild(matchDiv);
            }
        }, 3000);
    }
    
    // Update display
    displayPyramid();
}

function revealPyramidCard() {
    // Find the next unrevealed card from bottom to top (reverse order)
    let revealed = false;
    
    for (let row = gameState.pyramid.length - 1; row >= 0; row--) {
        for (let card of gameState.pyramid[row]) {
            if (!card.revealed) {
                card.revealed = true;
                revealed = true;
                break;
            }
        }
        if (revealed) break;
    }
    
    displayPyramid();
    
    // Check if all cards are revealed
    const allRevealed = gameState.pyramid.every(row => 
        row.every(card => card.revealed)
    );
    
    if (allRevealed) {
        document.getElementById('to-phase3-btn').style.display = 'inline-block';
    }
}

function startPhase3() {
    gameState.phase = 3;
    gameState.busCards = gameState.deck.slice(25, 35); // Take 10 cards for bus
    
    updatePhaseIndicator();
    loadPhase3();
}

function loadPhase3() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Fase 3: De Bus
            </div>
            
            <div class="game-info">
                <h3>Bus Regels</h3>
                <p>Je moet een reeks van kaarten goed raden (hoger/lager). 
                Elke fout = opnieuw beginnen én drinken!</p>
            </div>
            
            <div id="bus-container">
                <!-- Bus cards will be generated here -->
            </div>
            
            <div class="prediction-buttons" id="bus-prediction-buttons">
                <button class="prediction-btn" data-prediction="higher">Hoger</button>
                <button class="prediction-btn" data-prediction="lower">Lager</button>
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="start-bus-btn">
                    Start Bus Rit
                </button>
                <button class="game-btn secondary" id="restart-game-btn">
                    Nieuw Spel
                </button>
            </div>
        </div>
    `;
    
    displayBusCards();
    
    document.getElementById('start-bus-btn').addEventListener('click', startBusRide);
    document.getElementById('restart-game-btn').addEventListener('click', restartGame);
}

function displayBusCards() {
    const busContainer = document.getElementById('bus-container');
    busContainer.innerHTML = '';
    
    // Set container to display cards horizontally
    busContainer.style.display = 'flex';
    busContainer.style.justifyContent = 'center';
    busContainer.style.gap = '10px';
    busContainer.style.flexWrap = 'wrap';
    busContainer.style.marginBottom = '20px';
    
    gameState.busCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.revealed ? card.color : 'hidden'}`;
        cardElement.style.width = '80px';
        cardElement.style.height = '120px';
        cardElement.style.fontSize = '1rem';
        
        if (card.revealed) {
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>${card.value}</div>
                    <div style="font-size: 1.5rem;">${card.suit}</div>
                </div>
            `;
        } else {
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>?</div>
                </div>
            `;
        }
        
        busContainer.appendChild(cardElement);
    });
}

function startBusRide() {
    gameState.currentBusCard = 0;
    gameState.busCards[0].revealed = true;
    displayBusCards();
    
    document.getElementById('start-bus-btn').style.display = 'none';
    document.getElementById('bus-prediction-buttons').style.display = 'flex';
    
    // Add event listeners for bus predictions
    document.querySelectorAll('#bus-prediction-buttons .prediction-btn').forEach(btn => {
        btn.addEventListener('click', handleBusPrediction);
    });
}

function handleBusPrediction(event) {
    const prediction = event.target.dataset.prediction;
    const currentCard = gameState.busCards[gameState.currentBusCard];
    const nextCard = gameState.busCards[gameState.currentBusCard + 1];
    
    if (!nextCard) {
        return;
    }
    
    const isCorrect = (prediction === 'higher' && nextCard.numericValue > currentCard.numericValue) ||
                     (prediction === 'lower' && nextCard.numericValue <= currentCard.numericValue);
    
    if (isCorrect) {
        gameState.currentBusCard++;
        gameState.busCards[gameState.currentBusCard].revealed = true;
        displayBusCards();
        
        if (gameState.currentBusCard >= gameState.busCards.length - 1) {
            document.getElementById('bus-prediction-buttons').style.display = 'none';
        }
    } else {
        // Reset bus ride - hide all cards except the first one
        gameState.busCards.forEach((card, index) => {
            card.revealed = (index === 0); // Only first card stays revealed
        });
        gameState.currentBusCard = 0;
        displayBusCards();
    }
}

function restartGame() {
    hideGameScreen();
}

function goBackToPhase1() {
    gameState.phase = 1;
    gameState.currentCard = 0;
    gameState.currentCardRevealed = false;
    gameState.playerCards = gameState.deck.slice(0, 4);
    
    updatePhaseIndicator();
    showCurrentCard();
    setupPredictionButtons();
    
    document.getElementById('next-card-btn').addEventListener('click', nextCard);
    document.getElementById('next-phase-btn').addEventListener('click', startPhase2);
}

function goBackToPhase2() {
    gameState.phase = 2;
    gameState.pyramid = createPyramid();
    
    updatePhaseIndicator();
    loadPhase2();
}

function goBackToExtreemPhase1() {
    gameState.phase = 1;
    gameState.currentCard = 0;
    gameState.currentCardRevealed = false;
    gameState.playerCards = gameState.deck.slice(0, 6);
    
    updateExtreemPhaseIndicator();
    showExtreemCurrentCard();
    setupExtreemPredictionButtons();
    
    document.getElementById('next-card-btn').addEventListener('click', nextExtreemCard);
    document.getElementById('next-phase-btn').addEventListener('click', startExtreemPhase2);
}

function goBackToExtreemPhase2() {
    gameState.phase = 2;
    gameState.pyramid = createExtreemPyramid();
    
    updateExtreemPhaseIndicator();
    loadExtreemPhase2();
}

// Game loading function
function loadGame(gameType) {
    switch(gameType) {
        case 'bussen':
            loadBussenGame();
            break;
        case 'extreem-bussen':
            loadExtreemBussenGame();
            break;
        case 'king-of-hill':
            loadKingOfHillGame();
            break;
        case 'kingsen':
            loadKingsenGame();
            break;
    }
}

// Extreem Bussen game functions
function loadExtreemBussenGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Extreem Bussen
            </div>
            
            <div class="game-info">
                <h3>Extreem Bussen Regels</h3>
                <p>Een intensere versie van Bussen! Fase 1 heeft 6 kaarten met extra uitdagingen.</p>
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="start-extreem-btn">
                    Start Extreem Bussen
                </button>
                <button class="game-btn secondary" id="back-btn">
                    Terug naar Menu
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('start-extreem-btn').addEventListener('click', startExtreemBussen);
    document.getElementById('back-btn').addEventListener('click', hideGameScreen);
}

function startExtreemBussen() {
    // Create the game HTML structure first
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Extreem Bussen - Fase 1: Voorspellen
            </div>
            
            <div class="game-info">
                <h3>Extreem Bussen Regels</h3>
                <p id="phase-description">
                    Je krijgt 6 kaarten. Bij elke kaart moet je iets raden. 
                    Fout = drinken. Goed = doorgaan.
                </p>
            </div>
            
            <div class="cards-container" id="cards-container">
                <!-- Cards will be generated here -->
            </div>
            
            <div class="prediction-buttons" id="prediction-buttons">
                <!-- Prediction buttons will be generated here -->
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="next-card-btn" style="display: none;">
                    Volgende Kaart
                </button>
                <button class="game-btn secondary" id="next-phase-btn" style="display: none;">
                    Naar Fase 2: Piramide
                </button>
            </div>
        </div>
    `;
    
    gameState.phase = 1;
    gameState.currentCard = 0;
    gameState.currentCardRevealed = false;
    gameState.playerCards = gameState.deck.slice(0, 6); // 6 cards instead of 4
    
    updateExtreemPhaseIndicator();
    showExtreemCurrentCard();
    setupExtreemPredictionButtons();
    
    document.getElementById('next-card-btn').addEventListener('click', nextExtreemCard);
    document.getElementById('next-phase-btn').addEventListener('click', startExtreemPhase2);
}

function updateExtreemPhaseIndicator() {
    const phaseIndicator = document.getElementById('phase-indicator');
    const phaseDescriptions = {
        1: 'Extreem Bussen - Fase 1: Voorspellen',
        2: 'Extreem Bussen - Fase 2: Piramide',
        3: 'Extreem Bussen - Fase 3: De Bus'
    };
    phaseIndicator.textContent = phaseDescriptions[gameState.phase];
}

function showExtreemCurrentCard() {
    const cardsContainer = document.getElementById('cards-container');
    
    cardsContainer.innerHTML = '';
    
    // Show played cards and current card if it should be revealed
    gameState.playerCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${index < gameState.currentCard ? card.color : 'hidden'}`;
        
        if (index < gameState.currentCard) {
            // Show card if it's been played
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem;">${card.value}</div>
                    <div style="font-size: 2rem;">${card.suit}</div>
                </div>
            `;
        } else if (index === gameState.currentCard && gameState.currentCardRevealed) {
            // Show current card if it should be revealed
            cardElement.className = `card ${card.color}`;
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem;">${card.value}</div>
                    <div style="font-size: 2rem;">${card.suit}</div>
                </div>
            `;
        } else {
            // Hide current and future cards
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>?</div>
                </div>
            `;
        }
        
        cardsContainer.appendChild(cardElement);
    });
    
    updateExtreemPhaseDescription();
}

function updateExtreemPhaseDescription() {
    const descriptions = [
        'Rood of zwart? Raden of de kaart harten/ruiten (rood) of klaveren/schoppen (zwart) is.',
        'Hoger of lager? Is de tweede kaart hoger of lager dan de eerste?',
        'Binnen of buiten? Ligt de derde kaart tussen of buiten de waarden van de eerste twee?',
        'Welke kleur? Raden van het exacte symbool (harten, schoppen, klaveren of ruiten).',
        'Welke kleur? Raden van het exacte symbool (harten, schoppen, klaveren of ruiten).',
        'Welke kleur? Raden van het exacte symbool (harten, schoppen, klaveren of ruiten).'
    ];
    
    document.getElementById('phase-description').textContent = descriptions[gameState.currentCard];
}

function setupExtreemPredictionButtons() {
    const buttonsContainer = document.getElementById('prediction-buttons');
    const currentCard = gameState.currentCard;
    
    buttonsContainer.innerHTML = '';
    
    if (currentCard === 0) {
        // Rood of zwart
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="red">Rood ♥♦</button>
            <button class="prediction-btn" data-prediction="black">Zwart ♠♣</button>
        `;
    } else if (currentCard === 1) {
        // Hoger of lager
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="higher">Hoger</button>
            <button class="prediction-btn" data-prediction="lower">Lager</button>
        `;
    } else if (currentCard === 2) {
        // Binnen of buiten
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="inside">Binnen</button>
            <button class="prediction-btn" data-prediction="outside">Buiten</button>
        `;
    } else if (currentCard >= 3) {
        // Welke kleur (for cards 3, 4, and 5)
        buttonsContainer.innerHTML = `
            <button class="prediction-btn" data-prediction="hearts">Harten ♥</button>
            <button class="prediction-btn" data-prediction="diamonds">Ruiten ♦</button>
            <button class="prediction-btn" data-prediction="clubs">Klaveren ♣</button>
            <button class="prediction-btn" data-prediction="spades">Schoppen ♠</button>
        `;
    }
    
    // Add event listeners
    buttonsContainer.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.addEventListener('click', handleExtreemPrediction);
    });
}

function handleExtreemPrediction(event) {
    const prediction = event.target.dataset.prediction;
    const currentCard = gameState.playerCards[gameState.currentCard];
    let isCorrect = false;
    
    // Check prediction
    if (gameState.currentCard === 0) {
        // Rood of zwart
        isCorrect = (prediction === 'red' && currentCard.color === 'red') ||
                   (prediction === 'black' && currentCard.color === 'black');
    } else if (gameState.currentCard === 1) {
        // Hoger of lager
        const firstCard = gameState.playerCards[0];
        isCorrect = (prediction === 'higher' && currentCard.numericValue > firstCard.numericValue) ||
                   (prediction === 'lower' && currentCard.numericValue < firstCard.numericValue);
    } else if (gameState.currentCard === 2) {
        // Binnen of buiten
        const firstCard = gameState.playerCards[0];
        const secondCard = gameState.playerCards[1];
        const min = Math.min(firstCard.numericValue, secondCard.numericValue);
        const max = Math.max(firstCard.numericValue, secondCard.numericValue);
        
        isCorrect = (prediction === 'inside' && currentCard.numericValue >= min && currentCard.numericValue <= max) ||
                   (prediction === 'outside' && (currentCard.numericValue < min || currentCard.numericValue > max));
    } else if (gameState.currentCard >= 3) {
        // Welke kleur (for cards 3, 4, and 5)
        const suitMap = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        isCorrect = currentCard.suit === suitMap[prediction];
    }
    
    // Update button appearance
    event.target.classList.add(isCorrect ? 'correct' : 'incorrect');
    event.target.textContent += isCorrect ? ' ✓' : ' ✗';
    
    // Disable all buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Reveal the current card immediately
    gameState.currentCardRevealed = true;
    showExtreemCurrentCard();
    
    // Show next button immediately
    if (gameState.currentCard < 5) {
        document.getElementById('next-card-btn').style.display = 'inline-block';
    } else {
        document.getElementById('next-phase-btn').style.display = 'inline-block';
    }
}

function nextExtreemCard() {
    gameState.currentCard++;
    gameState.currentCardRevealed = false;
    document.getElementById('next-card-btn').style.display = 'none';
    showExtreemCurrentCard();
    setupExtreemPredictionButtons();
}

function startExtreemPhase2() {
    gameState.phase = 2;
    gameState.pyramid = createExtreemPyramid();
    
    updateExtreemPhaseIndicator();
    loadExtreemPhase2();
}

function createExtreemPyramid() {
    const pyramid = [];
    let cardIndex = 6; // Start after player cards (6 instead of 4)
    
    // Create pyramid: 1, 2, 3, 4, 1 cards per row (only bottom row has 1 card)
    // Drink amounts: 2, 4, 6, 8, 10 slokken (bottom to top)
    for (let row = 1; row <= 5; row++) {
        const rowCards = [];
        const cardsInRow = row === 5 ? 1 : row; // Only bottom row (row 5) has 1 card
        
        for (let col = 0; col < cardsInRow; col++) {
            const card = gameState.deck[cardIndex];
            card.revealed = false;
            card.matched = false;
            card.slokken = (6 - row) * 2; // 10, 8, 6, 4, 2 slokken (bottom to top)
            rowCards.push(card);
            cardIndex++;
        }
        pyramid.push(rowCards);
    }
    
    return pyramid;
}

function loadExtreemPhase2() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Extreem Bussen - Fase 2: Piramide
            </div>
            
            <div class="game-info">
                <h3>Piramide Regels</h3>
                <p>Van onder naar boven wordt per rij één kaart omgedraaid. 
                Heb je een match met je handkaarten? Je mag slokken uitdelen!</p>
            </div>
            
            <div id="pyramid-container">
                <!-- Pyramid will be generated here -->
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="reveal-pyramid-btn">
                    Omgedraaide Kaart Onthullen
                </button>
                <button class="game-btn secondary" id="to-phase3-btn" style="display: none;">
                    Naar Fase 3: De Bus
                </button>
            </div>
        </div>
    `;
    
    displayExtreemPyramid();
    
    document.getElementById('reveal-pyramid-btn').addEventListener('click', revealExtreemPyramidCard);
    document.getElementById('to-phase3-btn').addEventListener('click', startExtreemPhase3);
}

function displayExtreemPyramid() {
    const pyramidContainer = document.getElementById('pyramid-container');
    pyramidContainer.innerHTML = '';
    
    // Add player's hand cards at the top (6 cards instead of 4)
    const handRow = document.createElement('div');
    handRow.style.display = 'flex';
    handRow.style.justifyContent = 'center';
    handRow.style.gap = '10px';
    handRow.style.marginBottom = '20px';
    handRow.style.padding = '10px';
    handRow.style.background = '#f8f9fa';
    handRow.style.borderRadius = '10px';
    
    gameState.playerCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.style.width = '120px';
        cardElement.style.height = '180px';
        cardElement.style.fontSize = '1.5rem';
        cardElement.style.cursor = card.matched ? 'default' : 'pointer';
        
        // Visual feedback for different card states
        if (card.matched) {
            cardElement.style.opacity = '0.5';
        } else if (card.played) {
            cardElement.style.opacity = '0.7';
            cardElement.style.border = '2px solid #3498db';
        }
        
        cardElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem;">${card.value}</div>
                <div style="font-size: 3rem;">${card.suit}</div>
            </div>
        `;
        
        // Add click handler to play card (only if not matched)
        if (!card.matched) {
            cardElement.addEventListener('click', () => playExtreemCard(index));
        }
        handRow.appendChild(cardElement);
    });
    
    pyramidContainer.appendChild(handRow);
    
    // Display pyramid cards
    gameState.pyramid.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.style.display = 'flex';
        rowElement.style.justifyContent = 'center';
        rowElement.style.gap = '10px';
        rowElement.style.marginBottom = '10px';
        
        row.forEach((card, cardIndex) => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.revealed ? card.color : 'hidden'}`;
            cardElement.style.width = '80px';
            cardElement.style.height = '120px';
            cardElement.style.fontSize = '1rem';
            
            if (card.revealed) {
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div>${card.value}</div>
                        <div style="font-size: 1.5rem;">${card.suit}</div>
                        <div style="font-size: 0.8rem; margin-top: 5px;">${card.slokken} slokken</div>
                    </div>
                `;
            } else {
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 0.8rem;">${card.slokken} slokken</div>
                    </div>
                `;
            }
            
            rowElement.appendChild(cardElement);
        });
        
        pyramidContainer.appendChild(rowElement);
    });
}

function playExtreemCard(cardIndex) {
    // Don't allow playing already matched cards
    if (gameState.playerCards[cardIndex].matched) {
        return;
    }
    
    // Mark card as played
    gameState.playerCards[cardIndex].played = true;
    
    // Check if any pyramid cards match the played card
    let matchFound = false;
    gameState.pyramid.forEach((row, rowIndex) => {
        row.forEach((pyramidCard, pCardIndex) => {
            if (pyramidCard.revealed && !pyramidCard.matched &&
                (pyramidCard.suit === gameState.playerCards[cardIndex].suit || 
                 pyramidCard.value === gameState.playerCards[cardIndex].value)) {
                // Match found! Player can assign drinks
                pyramidCard.matched = true;
                gameState.playerCards[cardIndex].matched = true;
                matchFound = true;
            }
        });
    });
    
    if (matchFound) {
        // Show match message
        const matchDiv = document.createElement('div');
        matchDiv.style.cssText = `
            background: #27ae60;
            color: white;
            padding: 10px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
        `;
        matchDiv.textContent = 'Match! Je kunt slokken uitdelen!';
        
        const pyramidContainer = document.getElementById('pyramid-container');
        pyramidContainer.parentNode.insertBefore(matchDiv, pyramidContainer.nextSibling);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (matchDiv.parentNode) {
                matchDiv.parentNode.removeChild(matchDiv);
            }
        }, 3000);
    }
    
    // Update display
    displayExtreemPyramid();
}

function revealExtreemPyramidCard() {
    // Find the next unrevealed card from bottom to top (reverse order)
    let revealed = false;
    
    for (let row = gameState.pyramid.length - 1; row >= 0; row--) {
        for (let card of gameState.pyramid[row]) {
            if (!card.revealed) {
                card.revealed = true;
                revealed = true;
                break;
            }
        }
        if (revealed) break;
    }
    
    displayExtreemPyramid();
    
    // Check if all cards are revealed
    const allRevealed = gameState.pyramid.every(row => 
        row.every(card => card.revealed)
    );
    
    if (allRevealed) {
        document.getElementById('to-phase3-btn').style.display = 'inline-block';
    }
}

function startExtreemPhase3() {
    gameState.phase = 3;
    gameState.busCards = gameState.deck.slice(31, 41); // Take 10 cards for bus (after 6 player cards + 15 pyramid cards)
    
    updateExtreemPhaseIndicator();
    loadExtreemPhase3();
}

function loadExtreemPhase3() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Extreem Bussen - Fase 3: De Bus
            </div>
            
            <div class="game-info">
                <h3>Bus Regels</h3>
                <p>Je moet een reeks van kaarten goed raden (hoger/lager). 
                Elke fout = opnieuw beginnen én drinken!</p>
            </div>
            
            <div id="bus-container">
                <!-- Bus cards will be generated here -->
            </div>
            
            <div class="prediction-buttons" id="bus-prediction-buttons">
                <button class="prediction-btn" data-prediction="higher">Hoger</button>
                <button class="prediction-btn" data-prediction="lower">Lager</button>
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="start-bus-btn">
                    Start Bus Rit
                </button>
                <button class="game-btn secondary" id="restart-game-btn">
                    Nieuw Spel
                </button>
            </div>
        </div>
    `;
    
    displayExtreemBusCards();
    
    document.getElementById('start-bus-btn').addEventListener('click', startExtreemBusRide);
    document.getElementById('restart-game-btn').addEventListener('click', restartGame);
}

function displayExtreemBusCards() {
    const busContainer = document.getElementById('bus-container');
    busContainer.innerHTML = '';
    
    // Set container to display cards horizontally
    busContainer.style.display = 'flex';
    busContainer.style.justifyContent = 'center';
    busContainer.style.gap = '10px';
    busContainer.style.flexWrap = 'wrap';
    busContainer.style.marginBottom = '20px';
    
    gameState.busCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.revealed ? card.color : 'hidden'}`;
        cardElement.style.width = '80px';
        cardElement.style.height = '120px';
        cardElement.style.fontSize = '1rem';
        
        if (card.revealed) {
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>${card.value}</div>
                    <div style="font-size: 1.5rem;">${card.suit}</div>
                </div>
            `;
        } else {
            cardElement.innerHTML = `
                <div style="text-align: center;">
                    <div>?</div>
                </div>
            `;
        }
        
        busContainer.appendChild(cardElement);
    });
}

function startExtreemBusRide() {
    gameState.currentBusCard = 0;
    gameState.busCards[0].revealed = true;
    displayExtreemBusCards();
    
    document.getElementById('start-bus-btn').style.display = 'none';
    document.getElementById('bus-prediction-buttons').style.display = 'flex';
    
    // Add event listeners for bus predictions
    document.querySelectorAll('#bus-prediction-buttons .prediction-btn').forEach(btn => {
        btn.addEventListener('click', handleExtreemBusPrediction);
    });
}

function handleExtreemBusPrediction(event) {
    const prediction = event.target.dataset.prediction;
    const currentCard = gameState.busCards[gameState.currentBusCard];
    const nextCard = gameState.busCards[gameState.currentBusCard + 1];
    
    if (!nextCard) {
        return;
    }
    
    const isCorrect = (prediction === 'higher' && nextCard.numericValue > currentCard.numericValue) ||
                     (prediction === 'lower' && nextCard.numericValue <= currentCard.numericValue);
    
    if (isCorrect) {
        gameState.currentBusCard++;
        gameState.busCards[gameState.currentBusCard].revealed = true;
        displayExtreemBusCards();
        
        if (gameState.currentBusCard >= gameState.busCards.length - 1) {
            document.getElementById('bus-prediction-buttons').style.display = 'none';
        }
    } else {
        // Reset bus ride - hide all cards except the first one
        gameState.busCards.forEach((card, index) => {
            card.revealed = (index === 0); // Only first card stays revealed
        });
        gameState.currentBusCard = 0;
        displayExtreemBusCards();
    }
}

function loadKingOfHillGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                King of the Hill
            </div>
            
            <div class="game-info">
                <h3>King of the Hill Regels</h3>
                <p>Je krijgt 9 willekeurige kaarten. Klik op een kaart om deze groot te maken en uit te schakelen. 
                Hoe meer kaarten je uitschakelt, hoe beter je score!</p>
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="start-king-btn">
                    Start King of the Hill
                </button>
                <button class="game-btn secondary" id="back-btn">
                    Terug naar Menu
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('start-king-btn').addEventListener('click', startKingOfHill);
    document.getElementById('back-btn').addEventListener('click', hideGameScreen);
}

function startKingOfHill() {
    // Create the game HTML structure
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                King of the Hill
            </div>
            
            <div class="game-info">
                <h3>King of the Hill</h3>
                <p>Klik op kaarten om ze uit te schakelen. Hoe meer kaarten je uitschakelt, hoe beter je score!</p>
                <div id="score-display" style="text-align: center; margin: 10px 0; font-size: 1.2rem; font-weight: bold;">
                    Uitgeschakelde kaarten: <span id="score">0</span> / 9
                </div>
            </div>
            
            <div id="king-cards-container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin: 20px 0;">
                <!-- Cards will be generated here -->
            </div>
            
            <div class="game-controls">
                <button class="game-btn secondary" id="restart-king-btn">
                    Nieuw Spel
                </button>
            </div>
        </div>
    `;
    
    displayKingCards();
    document.getElementById('restart-king-btn').addEventListener('click', restartKingOfHill);
}

function displayKingCards() {
    const cardsContainer = document.getElementById('king-cards-container');
    cardsContainer.innerHTML = '';
    
    // Get 9 random cards from the deck
    const kingCards = gameState.deck.slice(0, 9);
    
    // Check if any card is in fullscreen mode
    const fullscreenCard = kingCards.find(card => card.kingState === 'fullscreen');
    
    kingCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card king-card';
        
        // Initialize card state
        card.kingState = card.kingState || 'normal'; // normal, fullscreen, disabled
        
        if (card.kingState === 'normal') {
            // Hide other cards if one is in fullscreen
            if (fullscreenCard && card !== fullscreenCard) {
                cardElement.style.display = 'none';
            } else {
                cardElement.style.cssText = `
                    width: 100px;
                    height: 150px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                `;
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem;">${card.value}</div>
                        <div style="font-size: 2rem;">${card.suit}</div>
                    </div>
                `;
                cardElement.addEventListener('click', () => handleKingCardClick(index));
            }
        } else if (card.kingState === 'fullscreen') {
            cardElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000000;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            cardElement.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div style="font-size: 8rem;">${card.value}</div>
                    <div style="font-size: 12rem;">${card.suit}</div>
                    <div style="font-size: 1.5rem; margin-top: 20px; opacity: 0.8;">
                        Klik om terug te gaan
                    </div>
                </div>
            `;
            cardElement.addEventListener('click', () => handleKingCardClick(index));
        } else if (card.kingState === 'disabled') {
            // Hide disabled cards if one is in fullscreen
            if (fullscreenCard && card !== fullscreenCard) {
                cardElement.style.display = 'none';
            } else {
                cardElement.style.cssText = `
                    width: 100px;
                    height: 150px;
                    font-size: 1rem;
                    opacity: 0.3;
                    transform: scale(0.8);
                    cursor: default;
                    transition: all 0.3s ease;
                    position: relative;
                `;
                cardElement.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 1rem;">${card.value}</div>
                        <div style="font-size: 1.5rem;">${card.suit}</div>
                    </div>
                `;
            }
        }
        
        cardsContainer.appendChild(cardElement);
    });
    
    updateKingScore();
}

function handleKingCardClick(cardIndex) {
    const card = gameState.deck[cardIndex];
    
    if (card.kingState === 'normal') {
        // First click: make card fullscreen
        card.kingState = 'fullscreen';
        displayKingCards();
    } else if (card.kingState === 'fullscreen') {
        // Second click: disable card and return to normal view
        card.kingState = 'disabled';
        displayKingCards();
        
        // Check if all cards are disabled
        const disabledCards = gameState.deck.slice(0, 9).filter(c => c.kingState === 'disabled').length;
        if (disabledCards === 9) {
            showKingVictory();
        }
    }
}

function updateKingScore() {
    const disabledCards = gameState.deck.slice(0, 9).filter(c => c.kingState === 'disabled').length;
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = disabledCards;
    }
}

function showKingVictory() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                King of the Hill - Voltooid!
            </div>
            
            <div class="game-info">
                <h3>Gefeliciteerd!</h3>
                <p>Je hebt alle 9 kaarten uitgeschakeld! Je bent de King of the Hill!</p>
                <div style="text-align: center; margin: 20px 0; font-size: 2rem; font-weight: bold; color: #27ae60;">
                    <img src="images/trophy.png" alt="Trophy" style="width: 80px; height: 80px; vertical-align: middle; margin: 0 10px; border-radius: 10px;">
                    KING OF THE HILL
                    <img src="images/trophy.png" alt="Trophy" style="width: 80px; height: 80px; vertical-align: middle; margin: 0 10px; border-radius: 10px;">
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn" id="play-again-btn">
                    Nog Een Keer Spelen
                </button>
                <button class="game-btn secondary" id="back-to-menu-btn">
                    Terug naar Menu
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('play-again-btn').addEventListener('click', restartKingOfHill);
    document.getElementById('back-to-menu-btn').addEventListener('click', hideGameScreen);
}

function restartKingOfHill() {
    // Reset all king cards to normal state
    gameState.deck.slice(0, 9).forEach(card => {
        card.kingState = 'normal';
    });
    
    startKingOfHill();
}

// Kingsen Game Implementation
function loadKingsenGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="bussen-game">
            <div class="phase-indicator" id="phase-indicator">
                Kingsen
            </div>
            
            <div class="game-info">
                <h3>Kingsen Spelregels</h3>
                <p>Kingsen is een drankspel waarbij spelers om de beurt kaarten trekken en opdrachten uitvoeren op basis van de kaartwaarde.</p>
            </div>
            
            <div class="kingsen-rules-container" style="max-width: 800px; margin: 0 auto;">
                <table class="kingsen-rules-table" style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: #2c3e50; color: white;">
                            <th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 2px solid #34495e;">Kaart</th>
                            <th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 2px solid #34495e;">Regel</th>
                        </tr>
                    </thead>
                    <tbody>
                       
                        <tr style="background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #3498db;">2 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Wijs iemand aan die moet drinken</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #e67e22;">3 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Jij moet drinken</td>
                        </tr>
                        <tr style="background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #9b59b6;">4 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Categorie - Noem een categorie, iedereen moet iets uit die categorie noemen</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #1abc9c;">5 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Duimen - Laatste met de duim op tafel moet drinken</td>
                        </tr>
                        <tr style="background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #e91e63;">6 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Drinking Buddy - Kies een buddy, jullie drinken vanaf nu altijd samen</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #ff5722;">7 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Vloer - Laatste die de vloer aanraakt moet drinken</td>
                        </tr>
                        <tr style="background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #607d8b;">8 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Regel - Maak een nieuwe regel die iedereen moet volgen</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #795548;">9 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Rijm - Zeg een woord, iedereen moet erop rijmen. Wie niet kan rijmen drinkt</td>
                        </tr>
                        <tr style="background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #ff9800;">10 ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Quizmaster - Stel een vragen, niemand mag ze beantwoorden, anders drinken</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #4caf50;">Boer ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Wijzen - Wijs naar degene die jij vind die moet drinken</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #2196f3;">Vrouw ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Rise of the queens - Laatste die zijn hand omhoog steekt moet drinken</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #f44336;">Heer ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Koning van de Beker - Leg de kaart op de beker in het midden. Wie de laatste koning trekt moet drinken!</td>
                        </tr>
                         <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 12px 15px; font-weight: bold; color: #e74c3c;">Aas ♠♥♦♣</td>
                            <td style="padding: 12px 15px;">Waterval - Iedereen begint te drinken, je mag pas stoppen als de persoon rechts van je stopt. Hierna draait de volgorde om.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="game-controls">
                <button class="game-btn secondary" id="back-to-menu-btn">
                    Terug naar Menu
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('back-to-menu-btn').addEventListener('click', hideGameScreen);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Game card click handlers
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const gameType = this.dataset.game;
            initGame(gameType);
        });
    });
    
    // Back button handler
    document.getElementById('back-btn').addEventListener('click', handleBackButton);

    // Title click handler
    document.getElementById('keetcards-title').addEventListener('click', hideGameScreen);
});

function handleBackButton() {
    if (gameState.phase === 1) {
        // If in Phase 1, go back to main menu
        hideGameScreen();
    } else if (gameState.phase === 2) {
        // If in Phase 2, go back to Phase 1
        if (gameState.playerCards.length === 6) {
            // Extreem Bussen
            goBackToExtreemPhase1();
        } else {
            // Regular Bussen
            goBackToPhase1();
        }
    } else if (gameState.phase === 3) {
        // If in Phase 3, go back to Phase 2
        if (gameState.playerCards.length === 6) {
            // Extreem Bussen
            goBackToExtreemPhase2();
        } else {
            // Regular Bussen
            goBackToPhase2();
        }
    } else {
        // Default fallback
        hideGameScreen();
    }
}
