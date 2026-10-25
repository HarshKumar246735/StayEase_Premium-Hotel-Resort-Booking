import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    verificationCode: { type: String, required: true, unique: true },
    // Lets a retried/double-clicked request return the same booking instead of creating a second one.
    idempotencyKey: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Snapshot so later edits to the hotel never change an existing booking.
    snapshot: {
      hotelName: String,
      hotelSlug: String,
      city: String,
      country: String,
      address: String,
      image: String,
      roomTypeName: String,
      bedType: String,
      freeCancellation: Boolean,
      cancellationPolicy: String,
      checkInTime: String,
      checkOutTime: String,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    rooms: { type: Number, required: true, min: 1 },
    guest: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      specialRequests: { type: String, default: '' },
    },
    pricing: {
      pricePerNight: Number,
      nights: Number,
      subtotal: Number,
      discountLabel: String,
      discount: { type: Number, default: 0 },
      taxRatePercent: Number,
      taxes: Number,
      total: Number,
      currency: { type: String, default: 'INR' },
    },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', index: true },
    payment: {
      method: { type: String, enum: ['demo_upi', 'demo_card', 'pay_at_property'], required: true },
      status: { type: String, enum: ['demo_paid', 'pay_at_property', 'demo_refunded', 'cancelled'], required: true },
      demoTransactionId: String, // clearly simulated, never a real transaction
      isDemo: { type: Boolean, default: true },
    },
    cancellation: {
      cancelledAt: Date,
      reason: String,
      refundStatus: { type: String, enum: ['demo_refund', 'no_refund', 'not_applicable'] },
    },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
bookingSchema.index({ user: 1, checkIn: -1 });

bookingSchema.virtual('displayStatus').get(function displayStatus() {
  if (this.status === 'cancelled') return 'cancelled';
  return this.checkOut < startOfTodayUTC() ? 'completed' : 'confirmed';
});

export function startOfTodayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

bookingSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.id;
    delete ret.idempotencyKey;
    return ret;
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);
