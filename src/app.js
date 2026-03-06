import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb' }));
    this.app.use(cors());
  }

  routes() {
    this.app.use(routes);
  }
}

export default App;
