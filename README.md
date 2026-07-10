# AndrLol Platform

Полнофункциональный веб-сайт на **Node.js + TypeScript + Express + PostgreSQL (Prisma)** с серверным рендерингом (EJS) и REST API.

## Стек

| Компонент | Технология |
|-----------|-----------|
| Runtime | Node.js |
| Язык | TypeScript |
| Фреймворк | Express |
| БД | PostgreSQL + Prisma |
| Аутентификация | JWT + bcrypt |
| Шаблоны | EJS |

---

## Как запустить (Windows)

### 1. Установите PostgreSQL

Скачайте и установите [PostgreSQL](https://www.postgresql.org/download/windows/). Запомните пароль пользователя `postgres`.

Или через Docker:

```bash
docker run --name andrlol-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=andrlol_platform -p 5432:5432 -d postgres:16
```

### 2. Установите зависимости

```powershell
cd "C:\Users\devot\OneDrive\Рабочий стол\platform"
npm install
```

### 3. Настройте `.env`

```powershell
copy .env.example .env
```

Откройте `.env` и укажите свои данные PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/andrlol_platform
JWT_SECRET=любая_длинная_случайная_строка
```

### 4. Создайте таблицы в БД

```powershell
npm run db:push
```

Эта команда применит схему Prisma к PostgreSQL.

### 5. Заполните начальными данными

```powershell
npm run seed
```

Создаст тестовых пользователей, статьи и игры.

### 6. Запустите сервер

```powershell
npm run dev
```

Откройте в браузере: **http://localhost:3000**

---

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | `admin@andrlol.local` | `admin123` |
| Пользователь | `user@andrlol.local` | `user123` |

---

## Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка TypeScript |
| `npm start` | Запуск продакшен-сборки |
| `npm run db:push` | Применить схему к БД |
| `npm run db:migrate` | Создать миграцию |
| `npm run db:studio` | GUI для просмотра БД |
| `npm run seed` | Заполнить БД данными |
| `npm run seed:prod` | Seed на продакшене (после `npm run build`) |
| `npm run fix:game-images` | Исправить пути к обложкам игр |

---

## Деплой бесплатно: GitHub + Render

Бесплатный хостинг: **GitHub** (код) + **Render** (сайт + PostgreSQL).  
Итоговая ссылка будет вида: `https://andrlol-platform.onrender.com`

> **Ограничения free-плана Render:** сайт «засыпает» после 15 мин без посещений (первый заход ~30–60 сек), PostgreSQL на free удаляется через 90 дней без апгрейда.

### Шаг 1. Подготовка Git

В PowerShell в папке проекта:

```powershell
cd "C:\Users\devot\OneDrive\Рабочий стол\platform"

# Один раз — укажите свои данные для GitHub
git config user.email "ваш@email.com"
git config user.name "Ваше Имя"

git add -A
git commit -m "Initial release: AndrLol platform"
git branch -M main
```

### Шаг 2. Создание репозитория на GitHub

1. Откройте [github.com/new](https://github.com/new)
2. **Repository name:** `andrlol-platform` (или любое имя)
3. **Public** — бесплатно
4. **Не** ставьте галочки README / .gitignore (они уже есть в проекте)
5. Нажмите **Create repository**

### Шаг 3. Загрузка кода на GitHub

Подставьте свой логин вместо `ВАШ_ЛОГИН`:

```powershell
git remote add origin https://github.com/ВАШ_ЛОГИН/andrlol-platform.git
git push -u origin main
```

GitHub попросит войти — используйте логин/пароль или [Personal Access Token](https://github.com/settings/tokens) (рекомендуется).

### Шаг 4. Деплой на Render (Blueprint)

1. Зарегистрируйтесь на [render.com](https://render.com) (можно через GitHub)
2. **Dashboard → New → Blueprint**
3. Подключите репозиторий `andrlol-platform`
4. Render найдёт файл `render.yaml` и предложит создать:
   - PostgreSQL базу `andrlol-db`
   - Web-сервис `andrlol-platform`
5. Нажмите **Apply**

Дождитесь первого деплоя (5–10 минут). Если сборка упала — откройте **Logs** и проверьте ошибку.

### Шаг 5. Переменные окружения на Render

**Dashboard → andrlol-platform → Environment**

| Переменная | Значение |
|------------|----------|
| `APP_URL` | URL вашего сайта, например `https://andrlol-platform.onrender.com` |
| `JWT_SECRET` | Уже создан автоматически через blueprint |
| `DATABASE_URL` | Уже подключена к PostgreSQL автоматически |

Опционально (для восстановления пароля по email):

| Переменная | Пример |
|------------|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | ваш Gmail |
| `SMTP_PASS` | [пароль приложения Google](https://myaccount.google.com/apppasswords) |
| `SMTP_FROM` | `AndrLol <noreply@andrlol.ru>` |

После изменения переменных Render перезапустит сервис автоматически.

### Шаг 6. Заполнение базы данных (один раз)

После успешного деплоя:

1. **Dashboard → andrlol-platform → Shell**
2. Выполните:

```bash
npm run seed:prod
```

Создастся админ, статьи, игры и отзывы.

**Админ для входа:** `admin@andrlol.local` / `admin123`  
Сразу смените пароль после первого входа!

### Шаг 7. Проверка

Откройте ваш `APP_URL`:

- Главная страница загружается
- `/games` — картинки игр видны
- `/login` — вход работает
- `/admin` — админ-панель (после входа как admin)

### Обновление сайта после изменений

```powershell
git add -A
git commit -m "Описание изменений"
git push
```

Render автоматически пересоберёт и задеплоит сайт.

---

## Docker (локально)

```powershell
docker compose up -d --build
docker compose exec app npm run seed:prod
```

Сайт: **http://localhost:3000**

---

## REST API

```
POST /api/auth/register
POST /api/auth/login
GET  /api/articles
GET  /api/articles/:id          (JWT, проверка premium)
POST /api/user/upgrade
GET/POST/PUT/DELETE /api/admin/articles
GET/POST/DELETE     /api/admin/games
PUT                 /api/admin/users/:id/role
```

Пример с токеном:

```powershell
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@andrlol.local\",\"password\":\"admin123\"}"
```

---

## Структура проекта

```
platform/
├── prisma/schema.prisma    # Схема PostgreSQL
├── src/
│   ├── index.ts
│   ├── lib/prisma.ts       # Prisma Client
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── scripts/seed.ts
├── views/                  # EJS шаблоны
└── public/                 # CSS, изображения
```

## Автор

**AndrLol / Андрей** — Discord: [andriuh_haa](https://discord.gg/PMKbrJkEU), Telegram: [@andriuh_haa](https://t.me/andriuh_haa)
