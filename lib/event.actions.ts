"use server";
import { Event } from "@/database";
import connectDB from "./mongodb";
export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    if (!event) return [];
    return Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch {
    return [];
  }
};
