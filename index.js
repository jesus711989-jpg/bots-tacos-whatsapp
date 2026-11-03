const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const app = express();
let qrImage = null;
let isConnected = false;
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if(qr){ qrImage = await QRCode.toDataURL(qr); }
    if(connection === 'open'){ isConnected = true; qrImage = null; }
    if(connection === 'close'){
      isConnected = false;
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) startBot();
    }
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const de = msg.key.remoteJid;
    let respuesta = 🌮 *TACOS EL WERO* 🌮\n_Ixtlahuaca_\n\n📋 *MENÚ:*\n🌮 Pastor $15\n🌮 Suadero $20\n🌮 Longaniza $20\n🥤 Refresco $20\n\n⏰ 6pm - 12am\n\n¿Que vas a querer?;
    await sock.sendMessage(de, { text: respuesta });
  });
}
app.get('/', async (req, res) => {
  if(isConnected){
    res.send("<h1 style='font-family:Arial;text-align:center'>✅ CONECTADO<br>Ya contesta solo!</h1>");
  } else if(qrImage){
    res.send(<div style='text-align:center;font-family:Arial'><h1>🌮 ESCANEA ESTE QR</h1><p>WhatsApp > 3 puntitos > Dispositivos vinculados > Vincular</p><img src="${qrImage}" style="width:300px"></div>);
  } else {
    res.send("<h1 style='text-align:center'>⏳ Generando QR... Recarga en 3 seg</h1><script>setTimeout(()=>location.reload(),3000)</script>");
  }
});
app.listen(3000, () => console.log("Server listo"));
startBot();
