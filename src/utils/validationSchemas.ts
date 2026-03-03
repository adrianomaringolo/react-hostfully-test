import { z } from "zod";
import { isValidDateRange, isDateInFuture } from "@/utils/dateUtils";

export const bookingSchema = z
  .object({
    propertyId: z.string().min(1, "Please select a property"),

    guestName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Name can only contain letters and spaces"),

    guestEmail: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    startDate: z
      .string()
      .min(1, "Check-in date is required")
      .refine(isDateInFuture, "Check-in date must be today or in the future"),

    endDate: z.string().min(1, "Check-out date is required"),

    guests: z
      .number({ error: "Number of guests is required" })
      .int("Guests must be a whole number")
      .min(1, "At least 1 guest is required")
      .max(20, "Maximum 20 guests allowed"),

    status: z.enum(["confirmed", "pending", "cancelled"]),

    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine((data) => isValidDateRange(data.startDate, data.endDate), {
    message: "Check-out date must be after check-in date",
    path: ["endDate"],
  });

export type BookingSchemaType = z.infer<typeof bookingSchema>;
