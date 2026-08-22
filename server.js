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

// Manejo de la ruta /webhook
app.all('/webhook', async (req, res) => {
    // 1. Responder de inmediato a Ruhavik para evitar timeout
    res.status(200).send('OK');

    console.log('--- NOTIFICACIÓN RECIBIDA ---');
    console.log('Body:', JSON.stringify(req.body));
    console.log('Query:', JSON.stringify(req.query));

    // Si viene de una prueba vacía del navegador, se ignora para no saturar Telegram
    if ((!req.body || Object.keys(req.body).length === 0) && (!req.query || Object.keys(req.query).length === 0)) {
        console.log('Petición de prueba vacía omitida.');
        return;
    }

    // Extraer la información enviada por Ruhavik
    const textoEvento = req.body?.text || req.query?.text || req.body?.event || 'Alerta detectada en Ruhavik';
    const unidad = req.body?.unit_name || req.query?.unit || 'Avenger Cruise 220';

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        try {
            const mensaje = `🚨 *NOTIFICACIÓN DE RUHAVIK*\n\n🏍️ *Vehículo:* ${unidad}\n⚠️ *Detalle:* ${textoEvento}`;
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: mensaje,
                parse_mode: 'Markdown'
            });
            console.log('Alerta de evento enviada a Telegram');
        } catch (err) {
            console.error('Error al enviar a Telegram:', err.message);
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Escuchando en puerto ${PORT}`));
