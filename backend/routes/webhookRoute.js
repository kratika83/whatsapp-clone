import webhookController from '../controllers/webhookController.js';
import express from 'express';
const webhookRouter = express.Router();

webhookRouter.post('/', webhookController);

export default webhookRouter;