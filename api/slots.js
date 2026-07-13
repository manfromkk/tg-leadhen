// api/slots.js — отдаёт Mini App занятые интервалы календаря Александра
// на выбранную дату. Проверяет подпись Telegram, токен добавляет на сервере.
const crypto = require('crypto');

function validInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');
    const dataCheck = [...params.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calc = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash));
  } catch (e) {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  try {
    const { initData, date } = req.body || {};
    if (!initData || !validInitData(initData, process.env.BOT_TOKEN)) {
      return res.status(401).json({ ok: false, error: 'Открой форму через Telegram-бота' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ ok: false, error: 'Нужна дата YYYY-MM-DD' });
    }
    const url = process.env.GAS_URL +
      '?date=' + encodeURIComponent(date) +
      '&token=' + encodeURIComponent(process.env.GAS_TOKEN);
    const r = await fetch(url, { redirect: 'follow' });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
};
