import pino from 'pino';
import moment from 'moment-timezone';

const timezoned = () => {
  return moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm:ss');
};

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
  timestamp: () => `,"time":"${timezoned()}"`,
});

export default logger;
