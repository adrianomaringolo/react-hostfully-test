import {
  parseISO,
  isValid,
  isBefore,
  isAfter,
  differenceInCalendarDays,
  format,
  startOfDay,
  isEqual,
  eachDayOfInterval,
} from "date-fns";
import type { Booking, UUID } from "@/types";

export const parseDate = (dateStr: string): Date | null => {
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
};

export const toISODateString = (date: Date): string =>
  format(date, "yyyy-MM-dd");

export const formatDisplayDate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  if (!date) return "Invalid date";
  return format(date, "MMM d, yyyy");
};

// Date Range Helpers
export const calculateNights = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;
  return Math.max(0, differenceInCalendarDays(end, start));
};

export const isValidDateRange = (
  startDate: string,
  endDate: string,
): boolean => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return false;
  return isBefore(start, end);
};

export const isDateInFuture = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  const today = startOfDay(new Date());
  return isAfter(date, today) || isEqual(date, today);
};

export const calculateTotalPrice = (
  nights: number,
  pricePerNight: number,
): number => parseFloat((nights * pricePerNight).toFixed(2));

//  Overlap Detection
export interface OverlapResult {
  hasOverlap: boolean;
  conflictingBooking?: Booking;
}

/**
 * Checks whether a date range conflicts with any existing booking on a property.
 *
 * Two date ranges [A.start, A.end] and [B.start, B.end] overlap when:
 *   A.start < B.end  &&  A.end > B.start
 *
 * Strict operators are intentional: adjacent bookings are allowed,
 * meaning a checkout date can equal the next booking's checkin date.
 *
 * @param newStart - ISO date string for the new booking's start
 * @param newEnd - ISO date string for the new booking's end
 * @param existingBookings - All bookings to check against
 * @param propertyId - Only bookings on this property are evaluated
 * @param excludeBookingId - Booking ID to skip (used when updating an existing booking)
 */
export const checkOverlap = (
  newStart: string,
  newEnd: string,
  existingBookings: Booking[],
  propertyId: UUID,
  excludeBookingId?: UUID,
): OverlapResult => {
  const start = parseDate(newStart);
  const end = parseDate(newEnd);

  if (!start || !end) return { hasOverlap: false };

  const conflictingBooking = existingBookings.find((booking) => {
    if (booking.propertyId !== propertyId) return false;
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    if (booking.status === "cancelled") return false;

    const existingStart = parseDate(booking.startDate);
    const existingEnd = parseDate(booking.endDate);

    if (!existingStart || !existingEnd) return false;

    return isBefore(start, existingEnd) && isAfter(end, existingStart);
  });

  return {
    hasOverlap: !!conflictingBooking,
    conflictingBooking,
  };
};

/**
 * Returns all occupied dates of a property as an array of Date.
 * Used by the DatePicker to disable unavailable dates.
 */
export const getBookedDates = (
  bookings: Booking[],
  propertyId: UUID,
  excludeBookingId?: UUID,
): Date[] => {
  return bookings
    .filter(
      (b) =>
        b.propertyId === propertyId &&
        b.status !== "cancelled" &&
        b.id !== excludeBookingId,
    )
    .flatMap((b) => {
      const start = parseDate(b.startDate);
      const end = parseDate(b.endDate);
      if (!start || !end) return [];
      return eachDayOfInterval({ start, end });
    });
};
