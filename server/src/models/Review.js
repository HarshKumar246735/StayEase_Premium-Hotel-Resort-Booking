import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', maxlength: 100 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1500 },
    isDemo: { type: Boolean, default: false }, // seeded sample reviews are labelled as demo content
    demoKey: String,
  },
  { timestamps: true },
);

// One review per booking, and idempotent demo seeding.
reviewSchema.index({ booking: 1 }, { unique: true, partialFilterExpression: { booking: { $type: 'objectId' } } });
reviewSchema.index({ hotel: 1, demoKey: 1 }, { unique: true, partialFilterExpression: { demoKey: { $type: 'string' } } });
reviewSchema.index({ hotel: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
