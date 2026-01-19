// Game State
const gameState = {
    isPlaying: false,
    health: 80,
    happiness: 70,
    energy: 60,
    coins: 0,
    soundEnabled: true,
    brightness: 100,
    lastActionTime: Date.now(),
    cosmetics: {
        hat: false,
        glasses: false,
        bowtie: false,
        crown: false
    },
    targetStats: null,
    statsReached: {
        stat1: false,
        stat2: false
    }
};

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const settingsScreen = document.getElementById('settingsScreen');
const gameScreen = document.getElementById('gameScreen');
const container = document.querySelector('.container');

const playBtn = document.getElementById('playBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const gameMenuBtn = document.getElementById('gameMenuBtn');

const soundToggle = document.getElementById('soundToggle');
const soundStatus = document.getElementById('soundStatus');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');

const healthBar = document.getElementById('healthBar');
const happinessBar = document.getElementById('happinessBar');
const energyBar = document.getElementById('energyBar');
const healthValue = document.getElementById('healthValue');
const happinessValue = document.getElementById('happinessValue');
const energyValue = document.getElementById('energyValue');

const actionButtons = document.querySelectorAll('.action-btn');
const character = document.getElementById('character');
const shopBtn = document.getElementById('shopBtn');
const coinsDisplay = document.getElementById('coins');

// Audio Context for sound effects
let audioContext;
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play sound effect
function playSound(frequency, duration) {
    if (!gameState.soundEnabled || !audioContext) return;

    try {
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {
        console.log('Audio playback not available');
    }
}

// Screen Navigation
function showScreen(screen) {
    menuScreen.classList.remove('active');
    settingsScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    screen.classList.add('active');
}

playBtn.addEventListener('click', () => {
    gameState.isPlaying = true;
    gameState.lastActionTime = Date.now();
    generateTargetStats();
    playSound(523, 0.2); // Sound effect
    showScreen(gameScreen);
    updateCoinsDisplay();
    startGameLoop();
});

settingsBtn.addEventListener('click', () => {
    playSound(587, 0.2);
    showScreen(settingsScreen);
});

backBtn.addEventListener('click', () => {
    playSound(523, 0.2);
    showScreen(menuScreen);
});

gameMenuBtn.addEventListener('click', () => {
    playSound(523, 0.2);
    gameState.isPlaying = false;
    showScreen(menuScreen);
    stopGameLoop();
});

// Settings Controls
soundToggle.addEventListener('change', (e) => {
    gameState.soundEnabled = e.target.checked;
    soundStatus.textContent = e.target.checked ? 'ON' : 'OFF';
    playSound(784, 0.1); // Confirmation sound
});

brightnessSlider.addEventListener('input', (e) => {
    gameState.brightness = e.target.value;
    brightnessValue.textContent = gameState.brightness + '%';
    updateBrightness();
    playSound(659, 0.1);
});

function updateBrightness() {
    const brightness = gameState.brightness / 100;
    container.style.filter = `brightness(${brightness})`;
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('takecareSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        gameState.soundEnabled = settings.soundEnabled;
        gameState.brightness = settings.brightness;

        soundToggle.checked = gameState.soundEnabled;
        soundStatus.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        brightnessSlider.value = gameState.brightness;
        brightnessValue.textContent = gameState.brightness + '%';
        updateBrightness();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('takecareSettings', JSON.stringify({
        soundEnabled: gameState.soundEnabled,
        brightness: gameState.brightness
    }));
}

// Update stats display
function updateStatsDisplay() {
    healthBar.style.width = gameState.health + '%';
    healthValue.textContent = gameState.health + '%';

    happinessBar.style.width = gameState.happiness + '%';
    happinessValue.textContent = gameState.happiness + '%';

    energyBar.style.width = gameState.energy + '%';
    energyValue.textContent = gameState.energy + '%';

    updateCharacterExpression();
}

// Update character expression based on stats
function updateCharacterExpression() {
    const mouth = document.querySelector('.mouth');
    const avgStat = (gameState.health + gameState.happiness + gameState.energy) / 3;

    if (avgStat < 30) {
        mouth.style.borderRadius = '0 0 30px 30px';
        character.style.animation = 'none';
    } else if (avgStat < 60) {
        mouth.style.borderRadius = '0 0 30px 30px';
        character.style.animation = 'float 3s ease-in-out infinite';
    } else {
        mouth.style.borderRadius = '0 0 30px 30px';
        character.style.animation = 'float 2s ease-in-out infinite';
    }
}

// Action handlers
const actionHandlers = {
    feed: () => {
        gameState.health = Math.min(100, gameState.health + 15);
        gameState.energy = Math.max(0, gameState.energy - 5);
        gameState.happiness = Math.min(100, gameState.happiness + 5);
        playSound(523, 0.3);
        showAction('Fed! 🍎');
    },
    play: () => {
        gameState.happiness = Math.min(100, gameState.happiness + 20);
        gameState.energy = Math.max(0, gameState.energy - 20);
        gameState.health = Math.max(0, gameState.health - 5);
        playSound(659, 0.4);
        showAction('Playing! 🎮');
    },
    sleep: () => {
        gameState.energy = Math.min(100, gameState.energy + 30);
        gameState.health = Math.min(100, gameState.health + 10);
        gameState.happiness = Math.max(0, gameState.happiness - 5);
        playSound(392, 0.5);
        showAction('Sleeping... 😴');
    },
    pet: () => {
        gameState.happiness = Math.min(100, gameState.happiness + 10);
        gameState.health = Math.min(100, gameState.health + 3);
        playSound(784, 0.3);
        showAction('Petted! 🐾');
    }
};

function showAction(text) {
    const notification = document.createElement('div');
    notification.className = 'action-notification';
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #6366f1, #ec4899);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-weight: 600;
        z-index: 1000;
        animation: slideDown 0.5s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Add animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Click action buttons
actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        actionHandlers[action]();
        updateStatsDisplay();
        saveGameState();
    });
});

// Generate random target stats (must be 2 different ones)
function generateTargetStats() {
    const stats = ['health', 'happiness', 'energy'];
    const shuffled = stats.sort(() => Math.random() - 0.5);
    gameState.targetStats = {
        stat1: shuffled[0],
        stat2: shuffled[1]
    };
    gameState.statsReached = { stat1: false, stat2: false };
    updateTargetDisplay();
}

// Update target display in UI
function updateTargetDisplay() {
    const targetEl = document.getElementById('targetStats');
    if (targetEl && gameState.targetStats) {
        targetEl.textContent = `Goal: ${gameState.targetStats.stat1} & ${gameState.targetStats.stat2} to 80%`;
    }
}

// Check if player earned coins
function checkCoinReward() {
    if (!gameState.targetStats) return;

    const stat1Value = gameState[gameState.targetStats.stat1];
    const stat2Value = gameState[gameState.targetStats.stat2];

    gameState.statsReached.stat1 = stat1Value >= 80;
    gameState.statsReached.stat2 = stat2Value >= 80;

    if (gameState.statsReached.stat1 && gameState.statsReached.stat2) {
        gameState.coins += 10;
        playSound(784, 0.5);
        showAction('🪙 Earned 10 coins!');
        updateCoinsDisplay();
        generateTargetStats();
    }
}

// Update coins display
function updateCoinsDisplay() {
    if (coinsDisplay) {
        coinsDisplay.textContent = gameState.coins;
    }
    const shopCoins = document.getElementById('shopCoins');
    if (shopCoins) {
        shopCoins.textContent = gameState.coins;
    }
}

// Game loop
let gameLoopInterval;
function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        decayStats();

        // Game over condition
        if (gameState.health <= 0) {
            gameState.isPlaying = false;
            clearInterval(gameLoopInterval);
            playSound(262, 0.5);
            alert('Game Over! Your character needs better care.');
            showScreen(menuScreen);
        }
    }, 1000);
}

function stopGameLoop() {
    clearInterval(gameLoopInterval);
}

// Save/Load game state
function saveGameState() {
    localStorage.setItem('takecareGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('takecareGameState');
    if (saved) {
        const state = JSON.parse(saved);
        gameState.health = state.health;
        gameState.happiness = state.happiness;
        gameState.energy = state.energy;
        gameState.coins = state.coins || 0;
        gameState.cosmetics = state.cosmetics || gameState.cosmetics;
    }
}

// Cosmetics system
const cosmeticItems = {
    hat: { name: 'Top Hat 🎩', price: 5 },
    glasses: { name: 'Cool Glasses 😎', price: 5 },
    bowtie: { name: 'Bow Tie 🎀', price: 3 },
    crown: { name: 'Golden Crown 👑', price: 8 }
};

function buyCosmetc(item) {
    if (gameState.coins >= cosmeticItems[item].price) {
        gameState.coins -= cosmeticItems[item].price;
        gameState.cosmetics[item] = true;
        playSound(659, 0.4);
        showAction(`Got ${cosmeticItems[item].name}!`);
        updateCoinsDisplay();
        saveGameState();
        updateCharacterVisuals();
        updateShopUI();
    } else {
        showAction('Not enough coins! 💔');
        playSound(262, 0.3);
    }
}

function updateCharacterVisuals() {
    const character = document.getElementById('character');
    
    // Remove old cosmetics
    document.querySelectorAll('.cosmetic').forEach(el => el.remove());

    // Make character position relative for cosmetics
    character.style.position = 'relative';

    // Add hat
    if (gameState.cosmetics.hat) {
        const hat = document.createElement('div');
        hat.className = 'cosmetic hat';
        hat.textContent = '🎩';
        character.appendChild(hat);
    }

    // Add glasses
    if (gameState.cosmetics.glasses) {
        const glasses = document.createElement('div');
        glasses.className = 'cosmetic glasses';
        glasses.textContent = '😎';
        character.appendChild(glasses);
    }

    // Add bow tie
    if (gameState.cosmetics.bowtie) {
        const bowtie = document.createElement('div');
        bowtie.className = 'cosmetic bowtie';
        bowtie.textContent = '🎀';
        character.appendChild(bowtie);
    }

    // Add crown
    if (gameState.cosmetics.crown) {
        const crown = document.createElement('div');
        crown.className = 'cosmetic crown';
        crown.textContent = '👑';
        character.appendChild(crown);
    }
}

function openShop() {
    const shopContent = document.getElementById('shopContent');
    shopContent.innerHTML = '';

    Object.entries(cosmeticItems).forEach(([key, item]) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        if (gameState.cosmetics[key]) {
            itemEl.classList.add('owned');
        }

        const owned = gameState.cosmetics[key] ? '✓ Owned' : `💰 ${item.price}`;
        itemEl.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">${owned}</div>
        `;

        if (!gameState.cosmetics[key]) {
            itemEl.addEventListener('click', () => buyCosmetc(key));
            itemEl.style.cursor = 'pointer';
        }

        shopContent.appendChild(itemEl);
    });
}

function updateShopUI() {
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach((item, index) => {
        const keys = Object.keys(cosmeticItems);
        const key = keys[index];
        if (gameState.cosmetics[key]) {
            item.classList.add('owned');
            item.querySelector('.item-price').textContent = '✓ Owned';
        }
    });
}

// Shop event listeners
document.getElementById('shopScreenBackBtn')?.addEventListener('click', () => {
    playSound(523, 0.2);
    showScreen(gameScreen);
});

if (shopBtn) {
    shopBtn.addEventListener('click', () => {
        playSound(587, 0.2);
        showScreen(document.getElementById('shopScreen'));
        openShop();
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    initAudio();
    loadSettings();
    loadGameState();
    updateStatsDisplay();
    updateCharacterVisuals();
});

// Save settings on page unload
window.addEventListener('beforeunload', () => {
    saveSettings();
    if (gameState.isPlaying) {
        saveGameState();
    }
});
