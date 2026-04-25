const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/api/search', async (req, res) => {
    const API_KEY = 'b86c0101'; // Replace with your real OMDB API key from http://www.omdbapi.com/apikey.aspx
    const query = req.query.s;
    const type = req.query.type || '';
    const page = req.query.page || 1;
    const imdbID = req.query.i || '';

    let url = `https://www.omdbapi.com/?apikey=${API_KEY}`;
    if (imdbID) url += `&i=${imdbID}&plot=full`;
    else url += `&s=${query}&type=${type}&page=${page}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

app.listen(PORT, () => console.log(`🚀 Sunucu http://localhost:${PORT} üzerinde hazır!`));