import app from './app.js';
import { config } from './config.js';
import { ping } from './db.js';

const start = async () => {
  const ok = await ping();
  if (!ok) {
    console.error('DB ping failed');
    process.exit(1);
  }
  app.listen(config.port, () => console.log(`Listening on ${config.port}`));
};
start();
