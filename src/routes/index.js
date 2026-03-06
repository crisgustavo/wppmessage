import { Router } from 'express';

import messageRoutes from './messageRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const routes = Router();

routes.use(messageRoutes);
routes.use(sessionRoutes);

export default routes;
