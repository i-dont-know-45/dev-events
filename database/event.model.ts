import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Event schema
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: function (value: string[]) {
          return value.length > 0;
        },
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: function (value: string[]) {
          return value.length > 0;
        },
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

// Create unique index on slug for faster queries
// EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to generate slug from title and normalize date/time
 * - Slug is only regenerated if title is modified
 * - Date is validated and normalized to ISO format
 * - Time is normalized to consistent format (HH:MM)
 */
EventSchema.pre("save", async function () {
  const event = this as IEvent;

  // Generate slug only if title is new or modified
  if (event.isModified("title") || event.isModified("slug")) {
    event.slug = generateSlug(event.title);

    // Ensure slug uniqueness by appending a counter if needed
    const existingEvent = await mongoose.models.Event.findOne({
      slug: event.slug,
      _id: { $ne: event._id },
    });

    if (existingEvent) {
      event.slug = `${event.slug}-${Date.now()}`;
    }
  }

  // Normalize and validate date if modified
  if (event.isModified("date")) {
    event.date = normalizeDateToISO(event.date);
  }

  // Normalize time format if modified (expected format: HH:MM or H:MM AM/PM)
  if (event.isModified("time")) {
    event.time = normalizeTime(event.time);
  }

  // next();
});

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO 8601 format (YYYY-MM-DD)
 * Accepts various date formats and converts to standard ISO format
 */
function normalizeDateToISO(dateString: string): string {
  // Try to parse ISO format first (YYYY-MM-DD)
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    // Validate the date components
    const date = new Date(Date.UTC(+year, +month - 1, +day));
    if (date.getUTCFullYear() === +year && 
        date.getUTCMonth() === +month - 1 && 
        date.getUTCDate() === +day) {
      return dateString;
    }
  }
  
  throw new Error("Invalid date format. Please provide date in YYYY-MM-DD format.");
}

/**
 * Normalize time to 24-hour format (HH:MM)
 * Accepts 12-hour or 24-hour format and converts to HH:MM
 */
function normalizeTime(timeString: string): string {
  const time = timeString.trim();

  // Check if time matches 24-hour format (HH:MM)
  const time24Format = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (time24Format.test(time)) {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  // Check if time matches 12-hour format (H:MM AM/PM)
  const time12Format = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i;
  const match = time.match(time12Format);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  throw new Error(
    "Invalid time format. Please use HH:MM (24-hour) or H:MM AM/PM (12-hour) format.",
  );
}

// Create and export Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
