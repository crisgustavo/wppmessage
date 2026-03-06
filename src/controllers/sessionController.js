import dotenv from 'dotenv';
dotenv.config();

import makeWASocket, {
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

import QRCode from 'qrcode';
import P from 'pino';

import { useRedisAuthState, clearSession } from '../libs/redisAuth.js';

export const sessions = new Map();

class SessionController {
  async buildSession(sessionId) {
    if (sessions.has(sessionId)) {
      return sessions.get(sessionId);
    }

    console.log(`🚀 Criando sessão: ${sessionId}`);

    try {
      const { state, saveCreds } = await useRedisAuthState(sessionId);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: Browsers.windows('Desktop'),
      });

      const session = {
        sock,
        qr: null,
        connected: false,
        jid: null,
      };

      sessions.set(sessionId, session);

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;
        const session = sessions.get(sessionId);

        if (!session) return;

        if (qr) {
          session.qr = await QRCode.toDataURL(qr);

          console.log(`📱 QR ${sessionId}`);
        }

        if (connection === 'open') {
          session.connected = true;
          session.qr = null;
          session.jid = sock.user.id;
          session.jidNumber = sock.user.id.split(':')[0];

          console.log(`✅ Conectado: ${sessionId}`);
          console.log(`JID: ${session.jid}`);
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          console.log(`❌ Conexão fechada ${sessionId} -> ${statusCode}`);

          session.connected = false;

          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            console.log(`🚫 Logout detectado`);

            await clearSession(sessionId);

            sessions.delete(sessionId);

            setTimeout(() => {
              this.buildSession(sessionId);
            }, 2000);

            return;
          }

          if (statusCode === DisconnectReason.connectionReplaced) {
            console.log(`⚠ Conexão substituída`);
            return;
          }

          console.log(`🔄 Reconectando ${sessionId}`);

          sessions.delete(sessionId);

          setTimeout(() => {
            this.buildSession(sessionId);
          }, 3000);
        }
      });

      sock.ev.on('messages.update', (updates) => {
        updates.forEach((u) => {
          const session = sessions.get(sessionId);
          if (!session) return;

          console.log(
            `Mensagem ${u.key.id} para ${u.key.remoteJid} atualizada:`,
            u,
          );
        });
      });

      return session;
    } catch (err) {
      console.error('Erro sessão:', err);

      setTimeout(() => {
        this.buildSession(sessionId);
      }, 5000);
    }
  }

  async initSession(req, res) {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'SESSION_REQUIRED' });
    }

    const session = sessions.get(sessionId);

    if (session?.connected) {
      return res.json({ status: 'CONNECTED', jid: session.jid });
    }

    if (!session) {
      await this.buildSession(sessionId);
    }

    return res.json({ status: 'CREATING_QR' });
  }

  async getQR(req, res) {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
    }

    if (!session.qr) {
      return res.json({ status: 'NO_QR' });
    }

    return res.json({
      status: 'QRCODE',
      qr: session.qr,
    });
  }

  async checkConnection(req, res) {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);

    return res.json({
      connected: session?.connected || false,
      jid: session?.jid || null,
      hasQR: !!session?.qr,
      jidNumber: session.jidNumber || null,
    });
  }
}

export default new SessionController();
