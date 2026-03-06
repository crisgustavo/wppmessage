import { Router } from 'express';
import { Controller } from '../controllers/index.js';

const sessionRoutes = new Router();

sessionRoutes.post('/init', (req, res) =>
  Controller.SessionController.initSession(req, res),
);
sessionRoutes.post('/qr', (req, res) =>
  Controller.SessionController.getQR(req, res),
);

sessionRoutes.post('/check', (req, res) =>
  Controller.SessionController.checkConnection(req, res),
);

sessionRoutes.post('/disconnect', (req, res) =>
  Controller.SessionController.disconnectSession(req, res),
);

export default sessionRoutes;
