import { Router } from 'express';
import {
  createGame,
  acceptInvitation,
  declineInvitation,
  getActiveGames,
  getGameById,
  getPendingInvitations,
  createGameValidation,
} from '../controllers/gameController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All game routes are protected
router.use(authMiddleware);

router.post('/create', createGameValidation, createGame);
router.post('/:gameId/accept', acceptInvitation);
router.post('/:gameId/decline', declineInvitation);
router.get('/active', getActiveGames);
router.get('/invitations', getPendingInvitations);
router.get('/:gameId', getGameById);

export default router;
