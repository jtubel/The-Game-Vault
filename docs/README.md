# The Game Vault

The Game Vault is a full-stack web application that allows users to explore the RAWG video game database and curate a personal collection of titles. 

## Project Overview
This application provides a centralized interface for searching real-time game data and saving specific titles to a persistent collection. The project demonstrates the integration of a Node.js backend with external APIs and a cloud-hosted database.

## Target Browsers
* Google Chrome: Primary testing environment
* Mozilla Firefox: Fully compatible
* Microsoft Edge: Fully compatible
* Safari: Fully compatible

## Key Features
* Dynamic Search: Real-time search functionality powered by the RAWG API.
* Persistent Storage: Personal collection management using a Supabase database.
* Interactive UI: Modern visual feedback using custom alert notifications and 3D hover effects.

# Developer Manual

## Technical Architecture
The Game Vault is built as a full-stack application using a Node.js/Express backend and a Vanilla JavaScript frontend. The application is deployed as a Serverless project on Vercel.

* Backend: Node.js, Express, Supabase-JS
* Frontend: HTML5, CSS3, JavaScript
* Frontend Libraries: SweetAlert2 (UI Notifications), Vanilla-Tilt.js (Visual Effects)

## Local Setup Instructions
To run this project locally for development:

1. Clone the repository:
   git clone [your-repository-link]

2. Install dependencies:
   npm install

3. Environment Variables:
   Create a .env file in the root directory and add your credentials:
   SUPABASE_URL=your_supabase_url
   SUPABASE_SECRET_KEY=your_service_role_key
   RAWG_API_KEY=your_rawg_key

4. Run the server:
   node index.js

5. Access the application:
   Open http://localhost:3000 in your browser.

## API Documentation
The backend serves the following internal endpoints:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| /api/games | GET | Fetches game data from the RAWG API using a ?search= query parameter. |
| /api/vault | GET | Retrieves all saved game entries from the Supabase database. |
| /api/vault | POST | Saves a new game object to the Supabase database. |

## Deployment Notes
This project is configured for Vercel deployment. The vercel.json file manages routing all traffic to the index.js serverless function. 

IMPORTANT: When deploying to a new environment, the environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY, and RAWG_API_KEY) must be manually added to the Vercel Dashboard project settings under the Environment Variables section to ensure the backend can connect to the database and API.