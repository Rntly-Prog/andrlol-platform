import { Router } from 'express';
import { listGamesPage } from '../controllers/gameController';

const router = Router();

router.get('/', listGamesPage);

export default router;
