import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event } from "@/database";
import { IEvent } from "@/database/event.model";

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug
 * 
 * @param request - Next.js request object
 * @param context - Route context containing params
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params as per Next.js 15+ requirements
    const { slug } = await context.params;

    // Validate slug parameter exists
    if (!slug) {
      return NextResponse.json(
        { 
          message: "Slug parameter is required",
          error: "MISSING_SLUG" 
        },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, hyphens only, not empty after trim)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const trimmedSlug = slug.trim().toLowerCase();

    if (!trimmedSlug || !slugRegex.test(trimmedSlug)) {
      return NextResponse.json(
        { 
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.",
          error: "INVALID_SLUG_FORMAT"
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug with explicit type
    const event: IEvent | null = await Event.findOne({ slug: trimmedSlug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          message: `Event with slug '${trimmedSlug}' not found`,
          error: "EVENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { 
        message: "Event fetched successfully",
        event 
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("Error fetching event by slug:", error);

    // Handle specific Mongoose/MongoDB errors
    if (error instanceof Error) {
      // Database connection errors
      if (error.name === "MongooseError" || error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { 
            message: "Database connection failed",
            error: "DATABASE_CONNECTION_ERROR"
          },
          { status: 503 }
        );
      }

      // Cast errors (invalid ObjectId, etc.)
      if (error.name === "CastError") {
        return NextResponse.json(
          { 
            message: "Invalid data format",
            error: "INVALID_DATA_FORMAT"
          },
          { status: 400 }
        );
      }
    }

    // Generic server error for unexpected cases
    return NextResponse.json(
      { 
        message: "Failed to fetch event",
        error: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}
