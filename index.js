const express = require('express');
const path = require('path'); 
const supabaseClient = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Vercel paths
app.use(express.static(path.join(__dirname, 'public'))); 

// Explicit Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Supabase 
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// --- API Endpoint for RAWG ---
app.get('/api/games', async (req, res) => {
    try {
        const query = req.query.search || '';
        const apiKey = process.env.RAWG_API_KEY; 
        
        let url;
        if (!query) {
            // If no search term, pick a random page between 1 and 20 for discovery
            const randomPage = Math.floor(Math.random() * 20) + 1;
            url = `https://api.rawg.io/api/games?key=${apiKey}&page=${randomPage}&page_size=20`;
        } else {
            // If user is searching, use the search term
            url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching from RAWG:', error);
        res.status(500).send('Server Error Fetching Games');
    }
});

// --- Retrieve Data Endpoint (GET) ---
app.get('/api/vault', async (req, res) => {
    // Fetch everything inside the 'saved_games' table
    const { data, error } = await supabase
        .from('saved_games')
        .select('*');

    if (error) {
        console.error("Database Fetch Error:", error);
        return res.status(500).json({ error: "Failed to fetch saved games" });
    }
    res.json(data); // Send the list back to the frontend
});

// --- Write Data Endpoint (POST) ---
app.post('/api/vault', async (req, res) => {
    const { name, image_url } = req.body;

    // Check if the game already exists in the database
    const { data: existingGame } = await supabase
        .from('saved_games')
        .select('name')
        .eq('name', name)
        .single();

    if (existingGame) {
        // Stop the process here and tell the frontend it's a duplicate
        return res.status(400).json({ error: "This game is already in your vault!" });
    }

    // If it doesn't exist, proceed with the insert
    const { error } = await supabase
        .from('saved_games')
        .insert([{ name: name, image_url: image_url, status: 'Plan to Buy' }]);

    if (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ error: "Failed to save game" });
    }
    
    res.json({ message: "Game saved successfully!" });
});

// --- NEW: Update Game Status Endpoint (PUT) ---
app.put('/api/vault', async (req, res) => {
    const { name, status } = req.body;

    const { data, error } = await supabase
        .from('saved_games')
        .update({ status: status })
        .eq('name', name); // Find the game by its name

    if (error) {
        console.error("Database Update Error:", error);
        return res.status(500).json({ error: "Failed to update status" });
    }
    res.json({ message: "Status updated!" });
});

// --- NEW: Remove Game Endpoint (DELETE) ---
app.delete('/api/vault', async (req, res) => {
    const { name } = req.body;

    const { data, error } = await supabase
        .from('saved_games')
        .delete()
        .eq('name', name); // Delete the game matching this name

    if (error) {
        console.error("Database Delete Error:", error);
        return res.status(500).json({ error: "Failed to delete game" });
    }
    res.json({ message: "Game removed!" });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`The Game Vault server is running on http://localhost:${port}`);

// Export the app for Vercel
module.exports = app;
});