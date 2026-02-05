"use server";
import { Types } from "mongoose";
import { Booking } from "@/database";
import connectDB from "@/lib/mongodb";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: Types.ObjectId;
  email: string;
}) => {
  try {
    await connectDB();

    await Booking.create({ eventId, email });

    return { success: true };
    
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false};
  }
};
