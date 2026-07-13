// api/submit.js — принимает заявку из Mini App, проверяет подпись Telegram
// (initData) и проксирует в Apps Script. Секреты не светятся в браузере.
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
    const { initData, payload } = req.body || {};
    if (!initData || !validInitData(initData, process.env.BOT_TOKEN)) {
      return res.status(401).json({ ok: false, error: 'Открой форму через Telegram-бота' });
    }
    if (!payload || !payload.client || !payload.date || !payload.time) {
      return res.status(400).json({ ok: false, error: 'Заполни клиента, дату и время' });
    }

    // имя менеджера — из Telegram-профиля, если не указали руками
    let mgr = payload.mgr || '';
    try {
      const u = JSON.parse(new URLSearchParams(initData).get('user') || '{}');
      if (!mgr) mgr = [u.first_name, u.last_name].filter(Boolean).join(' ');
      if (u.username) mgr += ' (@' + u.username + ')';
    } catch (e) {}

    const r = await fetch(process.env.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        token: process.env.GAS_TOKEN,
        client: payload.client, email: payload.email || '',
        date: payload.date, time: payload.time,
        dur: payload.dur || 30, topic: payload.topic || '',
        mgr, src: payload.src || '', prod: payload.prod || ''
      }),
      redirect: 'follow' // Apps Script отвечает через редирект — это норма
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
};
