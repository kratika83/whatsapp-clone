import conversationController from '../controllers/conversationController.js';
import express from 'express';
const conversationRouter = express.Router();

conversationRouter.get('/', conversationController.conversationList);
conversationRouter.get('/:wa_id/messages', conversationController.conversationMessage);
conversationRouter.post('/:wa_id/send', conversationController.sendDemoMessage);

export default conversationRouter;