import fs from 'fs';
import path from 'path';
import multer from 'multer';

const GAMES_DIR = path.join(__dirname, '../../public/images/games');

if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'game'
  );
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, GAMES_DIR),
  filename: (req, file, cb) => {
    const title = typeof req.body.title === 'string' ? req.body.title : 'game';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${slugify(title)}-${Date.now()}${ext}`);
  },
});

const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export const gameImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Допустимы только изображения: JPG, PNG, WebP, GIF, SVG'));
  },
});

/** Путь для БД из имени загруженного файла */
export function gameImageUrl(filename: string): string {
  return `/images/games/${filename}`;
}

/** Удаляет старый файл, если он лежит в public/images/games */
export function deleteGameImage(imageUrl: string): void {
  if (!imageUrl.startsWith('/images/games/')) return;

  const filePath = path.join(__dirname, '../../public', imageUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const IMAGES_DIR = path.join(__dirname, '../../public/images');

const authorStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `author-${Date.now()}${ext}`);
  },
});

export const authorPhotoUpload = multer({
  storage: authorStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Допустимы только изображения: JPG, PNG, WebP, GIF, SVG'));
  },
});

export function authorPhotoUrl(filename: string): string {
  return `/images/${filename}`;
}

export function deleteAuthorPhoto(photoUrl: string): void {
  if (!photoUrl.startsWith('/images/author-')) return;

  const filePath = path.join(__dirname, '../../public', photoUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
