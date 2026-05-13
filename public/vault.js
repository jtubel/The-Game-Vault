const vaultGrid = document.getElementById('vaultGrid');

async function loadSavedGames() {
    try {
        const response = await fetch('/api/vault');
        const savedGames = await response.json();

        vaultGrid.innerHTML = ''; 

        if (savedGames.length === 0) {
            vaultGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Your vault is completely empty! Go to the Home page to search and save some games.</p>';
            return;
        }

        savedGames.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card vault-card'; // Added 'vault-card' for specific styling
            
            card.setAttribute('data-tilt', '');
            card.setAttribute('data-tilt-glare', 'true');
            card.setAttribute('data-tilt-max-glare', '0.5');

            // Set default status if it's an older save that doesn't have one yet
            const currentStatus = game.status || 'Plan to Buy';

            // Format the name for the dataset using replace
            const safeName = game.name.replace(/"/g, '&quot;');

            // If it's an old save without an image, use a placeholder
            const imageUrl = game.image_url || 'https://via.placeholder.com/350?text=No+Image';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${game.name} Cover" class="game-image">
                <div class="game-info vault-info">
                    <h3>${game.name}</h3>
                    
                    <select class="status-dropdown" data-name="${safeName}" onchange="handleDropdown(this)">
                        <option value="Plan to Buy" ${currentStatus === 'Plan to Buy' ? 'selected' : ''}>⏳ Plan to Buy</option>
                        <option value="Purchased" ${currentStatus === 'Purchased' ? 'selected' : ''}>💸 Purchased</option>
                        <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>🏆 Completed</option>
                        <option disabled>──────────</option>
                        <option value="REMOVE" style="color: #ff4444;">❌ Remove from Vault</option>
                    </select>
                </div>
            `;
            
            vaultGrid.appendChild(card);
        });

        VanillaTilt.init(document.querySelectorAll(".game-card"));

    } catch (error) {
        console.error("Error fetching vault:", error);
        vaultGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Could not load your saved games.</p>';
    }
}

// --- Handle the Dropdown Actions ---
async function handleDropdown(selectElement) {
    const gameName = selectElement.dataset.name;
    const action = selectElement.value;

    // If the user clicks "Remove"
    if (action === 'REMOVE') {
        // Use SweetAlert to double-check before deleting!
        const result = await Swal.fire({
            title: 'Remove Game?',
            text: `Are you sure you want to delete ${gameName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4444',
            cancelButtonColor: '#444',
            confirmButtonText: 'Yes, remove it',
            background: '#1e1e1e',
            color: '#ffffff'
        });

        if (result.isConfirmed) {
            // Tell the backend to delete it
            await fetch('/api/vault', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: gameName })
            });
            // Reload the page to show it's gone
            loadSavedGames(); 
        } else {
            // If they cancel, reset the dropdown back to their previous status
            loadSavedGames(); 
        }
    } 
    
    // If the user just changed the status (Plan/Purchased/Completed)
    else {
        await fetch('/api/vault', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: gameName, status: action })
        });
        
        // Show a tiny popup so they know it saved
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Status Updated',
            showConfirmButton: false,
            timer: 1500,
            background: '#1e1e1e',
            color: '#bb86fc'
        });
    }
}

window.onload = loadSavedGames;