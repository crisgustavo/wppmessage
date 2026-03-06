import dotenv from 'dotenv';
dotenv.config();

import App from './app.js';

const appInstance = new App();
const app = appInstance.app;

const PORT = process.env.API_PORT || 3110;

const server = app.listen(PORT, () => {
  console.log(`API wppmessage rodando na porta ${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error.message);
});

server.on('clientError', (err, socket) => {
  console.error('⚠️ Client error:', err.message);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

export { app, server };
