import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Booking schema
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          // RFC 5322 compliant email regex (simplified version)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on eventId for faster queries when fetching bookings by event
BookingSchema.index({ eventId: 1 });

// Compound index for preventing duplicate bookings (same email for same event)
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Pre-save hook to validate that the referenced Event exists
 * Prevents orphaned bookings by ensuring eventId points to a valid event
 * Note: In Mongoose 7+, throw errors instead of using next() callback
 */
BookingSchema.pre('save', async function () {
  const booking = this as IBooking;

  // Only validate eventId if it's new or modified
  if (booking.isModified('eventId')) {
    // Check if Event model exists in mongoose.models
    const EventModel = mongoose.models.Event;

    if (!EventModel) {
      throw new Error(
        'Event model not found. Please ensure Event model is registered.'
      );
    }

    // Verify that the event exists in the database
    const eventExists = await EventModel.findById(booking.eventId);

    if (!eventExists) {
      throw new Error(
        `Event with ID ${booking.eventId} does not exist. Cannot create booking for non-existent event.`
      );
    }
  }
});

// Create and export Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
