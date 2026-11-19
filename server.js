import { createServer } from './app/api.js';

const port = Number(process.env.PORT ?? 3000);

createServer().listen(port, () => {
  console.log(`gh600-agent-lab listening on http://localhost:${port}`);
});
