const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('gameSearch');
const gameGrid = document.getElementById('gameGrid');

// --- Helper Function: Draw the Cards ---
// This function takes an array of games and draws them on the screen
function displayGames(games) {
    gameGrid.innerHTML = ''; // Clear loading messages or old results

    if (games.length === 0) {
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No games found. Try another search!</p>';
        return;
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const imageUrl = game.background_image ? game.background_image : 'https://via.placeholder.com/350?text=No+Image';
        const releaseYear = game.released ? game.released.split('-')[0] : 'Unknown';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${game.name} Cover" class="game-image">
            <div class="game-info">
                <h3>${game.name}</h3>
                <p>Released: ${releaseYear}</p>
                <p>Rating: ${game.rating}/5</p>
                <button class="favorite-btn" data-name="${game.name.replace(/"/g, '&quot;')}" data-image="${imageUrl}" onclick="saveToVault(this.dataset.name, this.dataset.image)">🤍 Save</button>            </div>
        `;
        gameGrid.appendChild(card);
    });
}

// --- Feature: Load Random Games on Page Load ---
async function loadRandomGames() {
    try {
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Loading the vault...</p>';
        
        // Pick a random page number between 1 and 50 to get a different batch of games every refresh
        const randomPage = Math.floor(Math.random() * 50) + 1;
        // Asking our OWN server for a random page of games
        const response = await fetch(`/api/games?page=${randomPage}`);
        const data = await response.json();

        // Shuffle the 20 results to make it truly random, then grab exactly 8
        let shuffledGames = data.results.sort(() => 0.5 - Math.random());
        let eightRandomGames = shuffledGames.slice(0, 8);

        // Draw the 8 random games
        displayGames(eightRandomGames);

    } catch (error) {
        console.error("Error fetching random games:", error);
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Something went wrong fetching the data.</p>';
    }
}

// --- Feature: Search for Specific Games ---
async function searchGames() {
    const query = searchInput.value.trim();
    if (!query) return;

    gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Searching for games...</p>';

    try {
        // Tells the frontend to ask BACKEND for games
        const response = await fetch(`/api/games?search=${encodeURIComponent(query)}`);
        const data = await response.json();

        // RAWG sends back an object with a "results" array
        displayGames(data.results || []);
    } catch (error) {
        console.error("Search error:", error);
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Error searching games.</p>';
    }
}

// --- Feature: Search for Random Games ---
async function fetchDiscoveryGames() {
    gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Discovering games...</p>';
    try {
        const response = await fetch('/api/games'); // No query parameter sent
        const data = await response.json();
        displayGames(data.results || []);
    } catch (error) {
        console.error("Discovery error:", error);
    }
}

// --- Event Listeners ---

// Trigger the random "Discovery" batch on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchDiscoveryGames();
    loadMiniVault();
});

// Trigger search when the button is clicked
searchBtn.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) searchGames(query);
});

// Trigger search when pressing "Enter" in the input field
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        if (query) searchGames(query);
    }
});

// Talks to Node backend, then shows SweetAlert
// Accepts the imageUrl as a second parameter
async function saveToVault(name, image_url) {
    try {
        const response = await fetch('/api/vault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, image_url: image_url })
        });

        const result = await response.json();

        if (response.ok) {
            // Success
            Swal.fire({
                title: 'Saved!',
                text: `${name} has been added to your vault.`,
                icon: 'success',
                background: '#1e1e1e',
                color: '#ffffff'
            });
            loadMiniVault();
        } else {
            // This handles the duplicate "400" error or any other server issues
            Swal.fire({
                title: 'Notice',
                text: result.error || 'Could not save the game.',
                icon: 'info',
                background: '#1e1e1e',
                color: '#ffffff'
            });
        }
    } catch (error) {
        console.error("Error saving to vault:", error);
        Swal.fire({
            title: 'Error',
            text: 'Connection failed.',
            icon: 'error',
            background: '#1e1e1e',
            color: '#ffffff'
        });
    }
}

// --- Feature: Mini-Vault Header ---
async function loadMiniVault() {
    const miniVaultList = document.getElementById('miniVaultList');
    try {
        const response = await fetch('/api/vault');
        const savedGames = await response.json();

        miniVaultList.innerHTML = ''; // Clear the "Loading..." text

        if (savedGames.length === 0) {
            miniVaultList.innerHTML = '<span class="mini-vault-item">Your vault is empty</span>';
            return;
        }

        // Loop through the games and create the little tags
        savedGames.forEach(game => {
            const item = document.createElement('span');
            item.className = 'mini-vault-item';
            item.innerText = game.name;
            miniVaultList.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching mini vault:", error);
        miniVaultList.innerHTML = '<span class="mini-vault-item">Error loading vault</span>';
    }
}

// Automatically run these functions the second the page boots up
window.onload = () => {
    loadRandomGames();
    loadMiniVault(); // Load the header
};