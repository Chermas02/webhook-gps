const express = require('express');
const app = express();

app.use(express.json());

// === TUS CREDENCIALES DE TELEGRAM ===
const TELEGRAM_TOKEN = 'AQUÍ_PEGA_TU_TOKEN_DE_BOTFATHER';
const TELEGRAM_CHAT_ID = 'AQUÍ_PEGA_TU_ID_DE_USERINFOBOT';

async function enviarTelegram(texto) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: texto,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (error) {
    console.error('Error enviando mensaje a Telegram:', error);
  }
}

// Ruta principal para el Webhook de Ruhavik
app.post('/webhook', (req, res) => {
  // 1. Responder de inmediato a Ruhavik para mantener latencia ultra baja
  res.status(200).send('OK');

  const payload = req.body;
  console.log('--- WEBHOOK RECIBIDO DE RUHAVIK ---');
  console.log(JSON.stringify(payload, null, 2));

  // 2. Extraer datos del formato nativo de Ruhavik/GPS-Trace
  const unidad = payload.unit_name || payload.unit?.name || payload.unit_id || 'Tu Vehículo';
  const evento = payload.event_name || payload.event || payload.type || 'Evento detectado';
  const velocidad = payload.speed !== undefined ? `${payload.speed} km/h` : null;
  const lat = payload.location?.lat || payload.lat;
  const lng = payload.location?.lng || payload.lng;
  const fecha = payload.time ? new Date(payload.time * 1000).toLocaleTimeString() : new Date().toLocaleTimeString();

  // 3. Armar el mensaje para Telegram
  let mensaje = `🚗 <b>ALERTA RUHAVIK</b>\n\n`;
  mensaje += `<b>Vehículo:</b> ${unidad}\n`;
  mensaje += `<b>Evento:</b> ${evento}\n`;
  mensaje += `<b>Hora:</b> ${fecha}\n`;
  
  if (velocidad) {
    mensaje += `<b>Velocidad:</b> ${velocidad}\n`;
  }

  if (lat && lng) {
    mensaje += `📍 <a href="https://maps.google.com/?q=${lat},${lng}">Abrir ubicación en Google Maps</a>`;
  }

  // 4. Enviar
  enviarTelegram(mensaje);
});

// Ruta para mantener activo el servidor (Keep-Alive)
app.get('/', (req, res) => {
  res.send('Servidor Webhook Ruhavik - Activo 24/7');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Webhook corriendo en puerto ${PORT}`);
});