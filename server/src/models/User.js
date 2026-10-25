import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required.'], trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address.'],
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '', maxlength: 20 },
    // Customers only: there is intentionally no admin role anywhere in StayEase.
    role: { type: String, enum: ['user'], default: 'user' },
    preferences: {
      newsletter: { type: Boolean, default: true },
      favouriteDestination: { type: String, default: '', maxlength: 60 },
      defaultGuests: { type: Number, default: 2, min: 1, max: 10 },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hash(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
