import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import { Hotel } from './models/Hotel.js';
import { Booking } from './models/Booking.js';
import { Inventory } from './models/Inventory.js';
import { Review } from './models/Review.js';

async function start() {
  await connectDB();
  // Make sure unique/search indexes exist (safe to run on every boot).
  await Promise.all([Hotel.init(), Booking.init(), Inventory.init(), Review.init()]);
  app.listen(env.port, () => console.log(`StayEase API listening on port ${env.port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
