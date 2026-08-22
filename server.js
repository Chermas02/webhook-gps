const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.get('/', (req, res) => {
    res.send('Servidor activo');
});

// Responde a cualquier petición en /webhook (GET, POST, PUT)
app.all('/webhook', async (req, res) => {
    // 1. Responder de inmediato a Ruhavik para que no de Timeout
    res.status(200).send('OK');

    console.log('--- NOTIFICACIÓN RECIBIDA DE RUHAVIK ---');
    console.log(JSON.stringify(req.body, null, 2));

    // 2. Enviar mensaje a Telegram
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        try {
            const mensaje = `🚨 *NOTIFICACIÓN DE RUHAVIK*\n\nSe ha detectado un evento en tu vehículo.`;
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: mensaje,
                parse_mode: 'Markdown'
            });
            console.log('Alerta enviada con éxito a Telegram');
        } catch (err) {
            console.error('Error al enviar a Telegram:', err.message);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Escuchando en puerto ${PORT}`));
