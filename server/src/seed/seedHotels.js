import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Hotel } from '../models/Hotel.js';
import { Review } from '../models/Review.js';
import { hotels, demoReviews } from './hotelData.js';

/**
 * Idempotent: upserts hotels by slug and demo reviews by (hotel, demoKey).
 * Never touches users, bookings, wishlists, inventory or real reviews.
 * guestRating / reviewCount are only set on first insert so real reviews are not overwritten on re-seed.
 */
async function run() {
  if (hotels.length < 100) throw new Error(`Seed data has only ${hotels.length} hotels; need at least 100.`);
  const slugs = new Set(hotels.map((h) => h.slug));
  if (slugs.size !== hotels.length) throw new Error('Duplicate slugs in seed data.');

  for (const data of hotels) {
    const err = new Hotel(data).validateSync();
    if (err) throw new Error(`Invalid hotel "${data.name}": ${err.message}`);
  }

  await connectDB();
  await Hotel.createIndexes();
  await Review.createIndexes();

  const hotelOps = hotels.map(({ guestRating, reviewCount, ...rest }) => ({
    updateOne: {
      filter: { slug: rest.slug },
      update: { $set: rest, $setOnInsert: { guestRating, reviewCount } },
      upsert: true,
    },
  }));
  const hotelResult = await Hotel.bulkWrite(hotelOps, { ordered: false });
  console.log(`Hotels: ${hotelResult.upsertedCount} inserted, ${hotelResult.modifiedCount} updated, ${hotels.length} total in seed.`);

  const idBySlug = new Map((await Hotel.find({ slug: { $in: [...slugs] } }).select('slug')).map((h) => [h.slug, h._id]));
  const reviewOps = demoReviews.map(({ hotelSlug, demoKey, ...rest }) => ({
    updateOne: {
      filter: { hotel: idBySlug.get(hotelSlug), demoKey },
      update: { $set: { ...rest, isDemo: true } },
      upsert: true,
    },
  }));
  const reviewResult = await Review.bulkWrite(reviewOps, { ordered: false });
  console.log(`Demo reviews: ${reviewResult.upsertedCount} inserted, ${reviewResult.modifiedCount} updated.`);

  const total = await Hotel.countDocuments({ isDemo: true });
  console.log(`Done. ${total} demo hotels in the database.`);
}

run()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
