const express = require('express');
const app = express();
const port = 3000;

// Serve static frontend files from the 'public' folder
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`The Game Vault server is running on http://localhost:${port}`);
});