import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notify-return', async (req, res) => {
  const { teacherName, itemName, quantity, status, notes } = req.body;

  // Telegram hanya dikirim jika statusnya dikembalikan
  if (status !== 'RETURNED') {
    return res.status(200).send('Status bukan RETURNED, abaikan.');
  }

  try {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const pesanTelegram = 
      `📦 <b>NOTIFIKASI PENGEMBALIAN BARANG</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Guru:</b> ${teacherName}\n` +
      `🛠️ <b>Barang:</b> ${itemName}\n` +
      `🔢 <b>Jumlah:</b> ${quantity}\n` +
      `📝 <b>Catatan:</b> ${notes || '-'}\n` +
      `✅ <b>Status:</b> TELAH DIKEMBALIKAN\n\n` +
      `⏰ <i>Waktu: ${new Date().toLocaleString('id-ID')}</i>`;

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: pesanTelegram,
      parse_mode: 'HTML'
    });

    console.log(`✅ Notif Telegram terkirim untuk: ${itemName}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Gagal kirim Telegram:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server Notifikasi di Port ${PORT}`));