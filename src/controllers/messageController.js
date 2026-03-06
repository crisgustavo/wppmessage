import { sessions } from './sessionController.js';

class MessageController {
  async sendMessage(req, res) {
    const { sessionId, number, message, base64, filename, mimetype } = req.body;

    const session = sessions.get(sessionId);
    if (!session) return res.status(400).json({ error: 'SESSION_NOT_FOUND' });
    if (!session.sock || !session.connected)
      return res.status(400).json({ error: 'NOT_CONNECTED' });

    const jid = number + '@s.whatsapp.net';
    let msg = {};

    try {
      if (base64 && mimetype) {
        const buffer = Buffer.from(base64, 'base64');

        if (mimetype.startsWith('image/')) {
          msg = { image: buffer, caption: message || undefined };
        } else if (mimetype.startsWith('video/')) {
          msg = { video: buffer, caption: message || undefined };
        } else if (mimetype.startsWith('audio/')) {
          msg = { audio: buffer };
        } else {
          msg = {
            document: buffer,
            fileName: filename || 'file',
            mimetype,
            caption: message || undefined,
          };
        }
      } else if (message) {
        msg = { text: message };
      } else {
        return res.status(400).json({ error: 'EMPTY_MESSAGE' });
      }

      await session.sock.sendMessage(jid, msg);

      // log simplificado
      console.log(`Mensagem enviada para ${jid}`);
      return res.json({ status: 'SENT' });
    } catch (err) {
      console.error(`Erro ao enviar mensagem para ${jid}:`, err.message);
      return res
        .status(500)
        .json({ error: 'SEND_FAILED', details: err.message });
    }
  }
}

export default new MessageController();
