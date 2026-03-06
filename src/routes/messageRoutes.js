import { Router } from 'express';
import { Controller } from '../controllers/index.js';

const messageRoutes = new Router();

messageRoutes.post('/send', (req, res) =>
  Controller.MessageController.sendMessage(req, res),
);

export default messageRoutes;
