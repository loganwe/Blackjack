
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let balance = 1000; // Starting balance
let currentBet = 0;

const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerScoreDisplay = document.getElementById('player-score');
const dealerScoreDisplay = document.getElementById('dealer-score');
const messageDisplay = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');
const betInput = document.getElementById('bet-input');
const allInButton = document.getElementById('all-in-button');

const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const restartButton = document.getElementById('restart-button');

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCard(hand) {
    if (deck.length === 0) {
        messageDisplay.textContent = 'No more cards in the deck!';
        return null;
    }
    const card = deck.pop();
    hand.push(card);
    return card;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            score += 11;
            aces += 1;
        } else {
            score += parseInt(card.value);
        }
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

function displayHand(hand, container) {
    container.innerHTML = '';
    for (let card of hand) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.textContent = `${card.value} of ${card.suit}`;
        container.appendChild(cardDiv);
    }
}

function endGame() {
    hitButton.disabled = true;
    standButton.disabled = true;
    placeBetButton.disabled = false;

    if (playerScore > 21) {
        messageDisplay.textContent = 'Player Busts! Dealer Wins!';
        balance -= currentBet;
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        messageDisplay.textContent = 'Player Wins!';
        balance += currentBet;
    } else if (dealerScore > playerScore) {
        messageDisplay.textContent = 'Dealer Wins!';
        balance -= currentBet;
    } else if (balance <= 0) {
        messageDisplay.textContent = 'Dealer Wins!';
    } else {
        messageDisplay.textContent = 'It\'s a Tie!';
    }

    updateBalanceDisplay();
}
function dealerPlay() {
    while (dealerScore < 17 && dealerHand.length <= 3) {
        dealCard(dealerHand);
        dealerScore = calculateScore(dealerHand);
        displayHand(dealerHand, dealerCardsDiv);
        dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
    }
    endGame();
}

function startGame() {
    if (currentBet <= 99 || currentBet > balance) {
        messageDisplay.textContent = 'Invalid bet. Please place a valid bet.';
        return;
    }

    createDeck();
    shuffleDeck();

    playerHand = [];
    dealerHand = [];

    // Deal two unique cards to each hand
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    // dealCard(dealerHand);

    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);

    displayHand(playerHand, playerCardsDiv);
    displayHand(dealerHand, dealerCardsDiv);

    playerScoreDisplay.textContent = `Score: ${playerScore}`;
    dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
    messageDisplay.textContent = 'Game started!';

    hitButton.disabled = false;
    standButton.disabled = false;
    placeBetButton.disabled = true;
}

function updateBalanceDisplay() {
    balanceDisplay.textContent = `Balance: $${balance}`;
}

hitButton.addEventListener('click', () => {
    const newCard = dealCard(playerHand);
    if (!newCard) return;

    playerScore = calculateScore(playerHand);
    displayHand(playerHand, playerCardsDiv);
    playerScoreDisplay.textContent = `Score: ${playerScore}`;

    if (playerScore > 21) {
        endGame();
    } else {
        // Dealer draws a card after player hits, if player hasn't busted
        const dealerCard = dealCard(dealerHand);
        if (dealerCard) {
            dealerScore = calculateScore(dealerHand);
            // displayHand(dealerHand, dealerCardsDiv);
            // dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
        }
    }
});



standButton.addEventListener('click', dealerPlay);

// Replace the betInput element with +500 and -500 buttons
const increaseBetButton = document.createElement('button');
increaseBetButton.textContent = '+500';
increaseBetButton.id = 'increase-bet-button';

const decreaseBetButton = document.createElement('button');
decreaseBetButton.textContent = '-500';
decreaseBetButton.id = 'decrease-bet-button';

const betDisplay = document.createElement('span');
betDisplay.id = 'bet-display';
betDisplay.textContent = `Current Bet: $${currentBet}`;

// Replace the bet input in the DOM
const betInputContainer = betInput.parentElement;
betInputContainer.innerHTML = '';
betInputContainer.appendChild(decreaseBetButton);
betInputContainer.appendChild(betDisplay);
betInputContainer.appendChild(increaseBetButton);

// Create the "Place Bet" button
const placeBetButton = document.createElement('button');
placeBetButton.textContent = 'Place Bet';
placeBetButton.id = 'place-bet-button';

// Add the "Place Bet" button to the DOM
betInputContainer.appendChild(placeBetButton);

// Only modify the bet-controls container
const betControlsContainer = document.getElementById('bet-controls');
betControlsContainer.innerHTML = '';
betControlsContainer.appendChild(decreaseBetButton);
betControlsContainer.appendChild(betDisplay);
betControlsContainer.appendChild(increaseBetButton);
betControlsContainer.appendChild(placeBetButton);

// Balance display remains unaffected
updateBalanceDisplay();

// Add event listener for the "Place Bet" button
placeBetButton.addEventListener('click', () => {
    if (currentBet <= 0 || currentBet > balance) {
        messageDisplay.textContent = 'Invalid bet. Please place a valid bet.';
    } else {
        startGame();
    }
});

// Update bet logic
increaseBetButton.addEventListener('click', () => {
    if (currentBet + 500 <= balance) {
        currentBet += 500;
        betDisplay.textContent = `Current Bet: $${currentBet}`;
        updateBalanceDisplay();
    } else {
        messageDisplay.textContent = 'Not enough balance to increase bet.';
    }
});

decreaseBetButton.addEventListener('click', () => {
    if (currentBet - 500 >= 0) {
        currentBet -= 500;
        betDisplay.textContent = `Current Bet: $${currentBet}`;
    } else {
        messageDisplay.textContent = 'Bet cannot be less than $0.';
    }
});

allInButton.addEventListener("click", () => {
    currentBet = parseInt(betInput.value, 10);
    if (balance <= 0) {
        endGame()
    } else {

        currentBet = balance
        if (!currentBet <= 0)
            startGame()
        else {
            restartButton.click()
        }
    }
})

restartButton.addEventListener('click', () => {
    balance = 1000; // Reset balance
    currentBet = 0;
    updateBalanceDisplay();
    messageDisplay.textContent = 'Game restarted! Place your bet to start.';
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';
    playerScoreDisplay.textContent = 'Score: 0';
    dealerScoreDisplay.textContent = 'Score: 0';
    placeBetButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
});

// Initialize game
updateBalanceDisplay();
