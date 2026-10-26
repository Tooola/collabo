import mongoose from 'mongoose';
import { runReset, runSeed } from './index';

/**
 * Manual entry points:
 *   npm run seed          -> seed the demo dataset (idempotent)
 *   npm run seed:reset    -> wipe everything, then re-run `npm run seed`
 */
async function main(): Promise<void> {
  if (process.argv.includes('--reset')) {
    await runReset();
  } else {
    await runSeed();
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
