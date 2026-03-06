import redis from './redis.js';
import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { proto } from '@whiskeysockets/baileys';

export const useRedisAuthState = async (sessionId) => {
  const writeData = async (data, key) => {
    const str = JSON.stringify(data, BufferJSON.replacer);
    await redis.set(`baileys:${sessionId}:${key}`, str);
  };

  const readData = async (key) => {
    const data = await redis.get(`baileys:${sessionId}:${key}`);
    if (!data) return null;
    return JSON.parse(data, BufferJSON.reviver);
  };

  const removeData = async (key) => {
    await redis.del(`baileys:${sessionId}:${key}`);
  };

  const creds = (await readData('creds')) || initAuthCreds();

  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        const data = {};

        await Promise.all(
          ids.map(async (id) => {
            let value = await readData(`${type}:${id}`);

            if (type === 'app-state-sync-key' && value) {
              value = proto.AppStateSyncKeyData.fromObject(value);
            }

            data[id] = value;
          }),
        );

        return data;
      },

      set: async (data) => {
        const tasks = [];

        for (const category in data) {
          for (const id in data[category]) {
            const value = data[category][id];
            const key = `${category}:${id}`;

            if (value) {
              tasks.push(writeData(value, key));
            } else {
              tasks.push(removeData(key));
            }
          }
        }

        await Promise.all(tasks);
      },
    },
  };

  const saveCreds = async () => {
    await writeData(state.creds, 'creds');
  };

  return { state, saveCreds };
};

export const clearSession = async (sessionId) => {
  const keys = await redis.keys(`baileys:${sessionId}:*`);
  if (keys.length) {
    await redis.del(keys);
  }
};
