# Бот заявок на встречи (Telegram Mini App)

Стек: grammY (webhook на Vercel) + Mini App (статика) + Apps Script API (календарь, Meet, таблица, уведомления).

## Структура
- `api/bot.js`     — бот: /start показывает кнопку Mini App
- `api/submit.js`  — приём заявки из Mini App, проверка подписи Telegram, прокси в Apps Script
- `public/index.html` — Mini App (форма заявки)
- `gas/Код_v5_API.gs` — код для Apps Script (вставить в редактор скриптов таблицы)

## Установка — по шагам

### 1. Apps Script (API)
1. Таблица → Расширения → Apps Script → заменить код на `gas/Код_v5_API.gs`.
2. Свойства скрипта: `API_TOKEN` (придумай длинную строку), `TG_TOKEN`, `TG_CHAT_ID`.
3. Развернуть → Новое развёртывание → Веб-приложение → «от имени: Я», «доступ: Все».
4. Скопировать URL (…/exec). Открыть в браузере — должно быть `{"ok":true,"ping":"leadgen"}`.

### 2. Vercel
1. Залить эту папку в GitHub-репозиторий, импортировать в Vercel (как с Vanguard TMA).
2. Environment Variables:
   - `BOT_TOKEN`  — токен бота из BotFather
   - `APP_URL`    — https://<проект>.vercel.app
   - `GAS_URL`    — URL веб-приложения Apps Script (…/exec)
   - `GAS_TOKEN`  — тот же API_TOKEN, что в свойствах скрипта
3. Deploy.

### 3. Webhook бота
Открыть в браузере (подставить своё):
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<проект>.vercel.app/api/bot
Должно ответить `{"ok":true,...}`.

### 4. (Опционально) Кнопка меню
BotFather → /setmenubutton → выбрать бота → URL: https://<проект>.vercel.app
Тогда кнопка формы будет в нижнем левом углу чата всегда.

### 5. Тест
/start боту → «Создать встречу» → заполнить → отправить.
Проверить: календарь, «Встречи», «Пайплайн», пуш в Telegram, письмо.

## Заметки
- Google Форма остаётся рабочим запасным входом.
- После правок кода Apps Script: Развернуть → Управление развёртываниями → ✏ → Версия: новая.
