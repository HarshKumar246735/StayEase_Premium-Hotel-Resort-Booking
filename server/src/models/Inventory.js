import mongoose from 'mongoose';

/**
 * One document per (hotel, room type, night). `booked` is only ever changed with conditional
 * atomic updates, which is what prevents two simultaneous requests from taking the last room.
 */
const inventorySchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true }, // the night (UTC midnight)
  booked: { type: Number, default: 0, min: 0 },
});

inventorySchema.index({ hotel: 1, roomTypeId: 1, date: 1 }, { unique: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);
