const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para procesar el texto a voz
app.post('/api/read', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Se requiere texto' });
        }

        // Configuración de la petición a ElevenLabs (Vía RapidAPI o Directa)
        // Nota: Si usas la API oficial directa de ElevenLabs, la URL cambia ligeramente.
        // Esta configuración es para RapidAPI según tu ejemplo anterior.
        const options = {
            method: 'POST',
            url: 'https://elevenlabs-api1.p.rapidapi.com/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // ID de voz (Rachel)
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'elevenlabs-api1.p.rapidapi.com',
                'x-rapidapi-key': process.env.ELEVEN_API_KEY
            },
            data: {
                text: text,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            },
            responseType: 'arraybuffer' // Importante para recibir audio
        };

        const response = await axios.request(options);

        // Enviar el audio al frontend
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);

    } catch (error) {
        console.error('Error en ElevenLabs API:', error.message);
        res.status(500).json({ error: 'Error generando el audio' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
