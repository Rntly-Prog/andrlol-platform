# Изображения игр

Папка для обложек на странице **Игры** (`/games`).

## Куда класть файлы

```
platform/
└── public/
    └── images/
        └── games/          ← СЮДА
            ├── cs2.svg         (или cs2.jpg / cs2.png / cs2.webp)
            ├── pubg.svg
            ├── stalzone.svg
            ├── lies-of-p.svg
            ├── horizon.svg
            ├── valorant.svg
            └── apex.svg
```

## Рекомендуемый размер

| Параметр | Значение |
|----------|----------|
| Ширина | **800 px** (минимум 400) |
| Высота | **400 px** (минимум 200) |
| Соотношение | **2:1** (широкая обложка) |
| Формат | `.webp`, `.jpg`, `.png` или `.svg` |

## Как заменить на свои фото

1. Положите файл в `public/images/games/` с нужным именем, например:
   - `cs2.jpg`
   - `pubg.png`
   - `valorant.webp`

2. Обновите путь одним из способов:

   **А) Админ-панель** (проще всего)  
   Войдите как админ → **Админ** → **Игры** → при добавлении игры укажите URL:
   ```
   /images/games/cs2.jpg
   ```

   **Б) База данных (seed)**  
   В файле `src/scripts/seedData.ts` измените `imageUrl`:
   ```ts
   imageUrl: '/images/games/cs2.jpg',
   ```
   Затем: `npm run seed`

## Текущие пути в проекте

| Игра | Путь |
|------|------|
| Counter-Strike 2 | `/images/games/counter-strike-2-1783714992916.jpg` |
| PUBG | `/images/games/pubg-battlegrounds-1783714830440.jpg` |
| Stalzone | `/images/games/stalzone.jpg` |
| Lies of P | `/images/games/lies-of-p-1783714683623.jpg` |
| Horizon Zero Dawn | `/images/games/horizon-zero-dawn-1783714732778.jpg` |
| Valorant | `/images/games/valorant-1783714778748.jpg` |
| Apex Legends | `/images/games/apex-legends-1783714861323.webp` |

Путь в коде всегда начинается с `/images/games/` — это URL в браузере, не путь на диске.

## Проверка

Откройте в браузере, например:  
http://localhost:3000/images/games/stalzone.jpg

Если картинка открывается — всё на месте.
