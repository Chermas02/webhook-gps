const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor activo');
});

// Endpoint flexible para capturar Webhooks
app.all('/webhook', async (req, res) => {
    console.log('--- ¡RUHAVIK SE CONECTÓ! ---');
    console.log('Metodo:', req.method);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: '🚨 *¡ALERTA DETECTADA EN LA MOTO!*',
                parse_mode: 'Markdown'
            });
            console.log('Notificación enviada a Telegram');
        } catch (err) {
            console.log('Error enviando a Telegram:', err.message);
        }
    }
    
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Escuchando en puerto ${PORT}`));
