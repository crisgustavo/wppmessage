import P from 'pino';

export const logger = P({
  level: 'fatal',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

export const silentLogger = P({
  level: 'silent',
  transport: undefined,
});

export const emptyLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
  child: () => ({
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
  }),
};
