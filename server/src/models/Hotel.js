import mongoose from 'mongoose';

export const PROPERTY_TYPES = ['Hotel', 'Resort', 'Villa', 'Apartment', 'Boutique', 'Heritage', 'Homestay', 'Lodge', 'Cabin'];
export const OFFER_TYPES = ['weekend', 'luxury', 'family', 'honeymoon', 'longstay'];

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  capacity: { type: Number, required: true, min: 1, max: 10 },
  pricePerNight: { type: Number, required: true, min: 0 },
  totalRooms: { type: Number, required: true, min: 1 },
  bedType: { type: String, default: '' },
  amenities: [String],
  images: [String],
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    address: { type: String, required: true },
    location: { latitude: Number, longitude: Number },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    guestRating: { type: Number, required: true, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    pricePerNight: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    images: { type: [String], validate: [(v) => v.length >= 1, 'At least one image is required.'] },
    amenities: [String],
    roomTypes: { type: [roomTypeSchema], validate: [(v) => v.length >= 1, 'At least one room type is required.'] },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    featured: { type: Boolean, default: false },
    tags: [String],
    breakfastIncluded: { type: Boolean, default: false },
    freeCancellation: { type: Boolean, default: false },
    familyFriendly: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    cancellationPolicy: { type: String, default: '' },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    // Promotional pricing exists only when the seed data defines it.
    offer: {
      kind: { type: String, enum: [...OFFER_TYPES, null], default: null },
      label: String,
      discountPercent: { type: Number, min: 0, max: 60 },
      minNights: { type: Number, default: 1 },
    },
    isDemo: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

hotelSchema.index({ isActive: 1, featured: -1, guestRating: -1 });
hotelSchema.index({ pricePerNight: 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ guestRating: -1 });
hotelSchema.index({ reviewCount: -1 });
hotelSchema.index({ propertyType: 1 });
hotelSchema.index({ amenities: 1 });
hotelSchema.index({ 'offer.kind': 1 });
hotelSchema.index({ name: 'text', city: 'text', country: 'text', description: 'text' });

export const Hotel = mongoose.model('Hotel', hotelSchema);
