const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function enviarATelegram(texto) {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Error: Faltan las variables TELEGRAM_TOKEN o TELEGRAM_CHAT_ID');
        return;
    }
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: texto,
            parse_mode: 'Markdown'
        });
        console.log('Mensaje enviado a Telegram correctamente.');
    } catch (error) {
        console.error('Error enviando a Telegram:', error.response ? error.response.data : error.message);
    }
}

// Ruta principal para verificar que el servidor vive
app.get('/', (req, res) => {
    res.send('Servidor de Alertas activo y escuchando.');
});

// Endpoint que recibe el webhook de Ruhavik
app.post('/webhook', async (req, res) => {
    console.log('--- EVENTO RECIBIDO DE RUHAVIK ---');
    console.log(JSON.stringify(req.body, null, 2));

    const payload = req.body;
    const evento = payload.event || payload.event_name || payload.message || 'Alerta de evento detectada';
    const unidad = payload.unit_name || payload.name || 'Avenger Cruise 220';

    const texto = `⚠️ *ALERTA EN TIEMPO REAL*\n\n🏍️ *Unidad:* ${unidad}\n🔔 *Evento:* ${evento}`;

    await enviarATelegram(texto);
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
