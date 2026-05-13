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
async function searchGames(query) {
    try {
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Searching the vault...</p>';
        
        // Asking our OWN server to search for a specific game
        const response = await fetch(`/api/games?search=${query}`);
        const data = await response.json();

        // Grab the top 8 results from the search
        const games = data.results.slice(0, 8);
        
        // Draw the searched games!
        displayGames(games);

    } catch (error) {
        console.error("Error fetching games:", error);
        gameGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Something went wrong fetching the data.</p>';
    }
}

// --- Event Listeners ---

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
async function saveToVault(gameName, imageUrl) {
    try {
        const response = await fetch('/api/vault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Sends the image_url to the backend
            body: JSON.stringify({ name: gameName, image_url: imageUrl }) 
        });

        if (response.ok) {
            Swal.fire({
                title: 'Saved!',
                text: `${gameName} has been added to your Vault.`,
                icon: 'success',
                confirmButtonColor: '#bb86fc',
                background: '#1e1e1e',
                color: '#ffffff'
            });
        } else {
            throw new Error('Server rejected save');
        }
    } catch (error) {
        console.error("Error saving to vault:", error);
        Swal.fire({
            title: 'Error',
            text: 'Could not connect to the database.',
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