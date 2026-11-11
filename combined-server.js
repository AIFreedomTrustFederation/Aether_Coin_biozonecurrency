// Local frontend preview only. Legacy API/payment services are not started.
import { startWalletServer } from './server-redirect.js';
await startWalletServer({ development: true, port: process.env.PORT ?? 5000, host: '127.0.0.1' });
