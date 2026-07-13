// api/bot.js — Telegram-бот (grammY, Vercel serverless, webhook)
const { Bot, webhookCallback, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);
const APP_URL = process.env.APP_URL; // https://<твой-проект>.vercel.app

const kb = () => new InlineKeyboard().webApp('📅 Создать встречу', APP_URL);

bot.command('start', (ctx) =>
  ctx.reply(
    'Привет! Это бот заявок на встречи Centras Alpha Lab.\n\n' +
    'Нажми кнопку — заполни клиента, дату и время. Встреча сама появится ' +
    'в календаре Александра, а клиенту уйдёт приглашение с Google Meet.',
    { reply_markup: kb() }
  )
);

bot.command('help', (ctx) =>
  ctx.reply(
    'Одна заявка = одна встреча.\n' +
    '1. Нажми «Создать встречу».\n' +
    '2. Заполни поля (обязательны: клиент, дата, время).\n' +
    '3. Отправь — ссылка Meet придёт прямо в окне.\n\n' +
    'Вопросы — к Александру.',
    { reply_markup: kb() }
  )
);

// на любое другое сообщение — тоже показываем кнопку
bot.on('message', (ctx) => ctx.reply('Жми кнопку, чтобы создать встречу 👇', { reply_markup: kb() }));

module.exports = webhookCallback(bot, 'http');
