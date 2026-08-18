import Redis from 'ioredis';

const nodeEnv = process.env.NODE_ENV || 'DEVELOPMENT';

const redis = new Redis({
  host: '127.0.0.1',
  port: (nodeEnv = 'PRODUCTION' ? 6380 : 6389),
});

export default redis;
