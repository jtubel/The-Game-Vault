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
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey, {
    realtime: {
        transport: WebSocket
    }
});
// --- API Endpoint for RAWG ---
app.get('/api/games', async (req, res) => {
    // Moved API key to the backend for security
    const apiKey = process.env.RAWG_API_KEY; 
    
    // Grab the search term or page number if the frontend sent one
    const searchQuery = req.query.search;
    const page = req.query.page;

    // Build the RAWG URL dynamically
    let rawgUrl = `https://api.rawg.io/api/games?key=${apiKey}`;
    if (searchQuery) {
        rawgUrl += `&search=${searchQuery}`;
    }
    if (page) {
        rawgUrl += `&page=${page}&page_size=20`;
    }

    try {
       // Using Axios instead of fetch
        const response = await axios.get(rawgUrl);
        
        // Axios automatically parses the JSON, so we just send response.data
        res.json(response.data);

    } catch (error) {
        console.error("Server Error Fetching Games:", error);
        res.status(500).json({ error: "Failed to fetch games" });
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
    // Grab both the name and the image_url
    const { name, image_url } = req.body; 

    const { data, error } = await supabase
        .from('saved_games')
        .insert([{ name: name, image_url: image_url }]);

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