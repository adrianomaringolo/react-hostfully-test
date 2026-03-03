import { useMemo } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { checkOverlap, getBookedDates } from "@/utils/dateUtils";
import type { UUID } from "@/types";

interface UseOverlapValidationParams {
  propertyId: UUID | null;
  excludeBookingId?: UUID;
}

/**
 * Provides overlap validation utilities for the booking form.
 *
 * - bookedDates: all occupied dates for the selected property,
 *   used by the DatePicker to disable unavailable days.
 *
 * - validateDateRange: checks a given range against existing bookings
 *   and returns an error message or null.
 */
export const useOverlapValidation = ({
  propertyId,
  excludeBookingId,
}: UseOverlapValidationParams) => {
  const bookings = useBookingStore((state) => state.bookings);

  const bookedDates = useMemo(() => {
    if (!propertyId) return [];
    return getBookedDates(bookings, propertyId, excludeBookingId);
  }, [bookings, propertyId, excludeBookingId]);

  const validateDateRange = (
    startDate: string,
    endDate: string,
  ): string | null => {
    if (!propertyId || !startDate || !endDate) return null;

    const result = checkOverlap(
      startDate,
      endDate,
      bookings,
      propertyId,
      excludeBookingId,
    );

    if (result.hasOverlap && result.conflictingBooking) {
      const { guestName, startDate: s, endDate: e } = result.conflictingBooking;
      return `These dates overlap with ${guestName}'s booking (${s} → ${e}).`;
    }

    return null;
  };

  return { bookedDates, validateDateRange };
};
