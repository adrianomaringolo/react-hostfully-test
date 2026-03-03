import { describe, it, expect } from "vitest";
import {
  checkOverlap,
  calculateNights,
  isValidDateRange,
  calculateTotalPrice,
  getBookedDates,
} from "@/utils/dateUtils";
import type { Booking } from "@/types";

const makeBooking = (
  id: string,
  startDate: string,
  endDate: string,
  status: Booking["status"] = "confirmed",
): Booking => ({
  id,
  propertyId: "prop-1",
  guestName: `Guest ${id}`,
  guestEmail: `${id}@test.com`,
  startDate,
  endDate,
  guests: 2,
  totalPrice: 300,
  status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const existing = makeBooking("b1", "2030-06-10", "2030-06-15");

describe("checkOverlap", () => {
  it("returns no overlap when new booking ends before existing starts", () => {
    const result = checkOverlap(
      "2030-06-01",
      "2030-06-09",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("returns no overlap when new booking starts after existing ends", () => {
    const result = checkOverlap(
      "2030-06-16",
      "2030-06-20",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("allows adjacent bookings (checkout date equals next checkin date)", () => {
    const result = checkOverlap(
      "2030-06-15",
      "2030-06-20",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("detects partial overlap on the left", () => {
    const result = checkOverlap(
      "2030-06-08",
      "2030-06-12",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(true);
    expect(result.conflictingBooking?.id).toBe("b1");
  });

  it("detects partial overlap on the right", () => {
    const result = checkOverlap(
      "2030-06-13",
      "2030-06-18",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(true);
  });

  it("detects when new booking is fully contained within existing", () => {
    const result = checkOverlap(
      "2030-06-11",
      "2030-06-13",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(true);
  });

  it("detects when existing booking is fully contained within new", () => {
    const result = checkOverlap(
      "2030-06-05",
      "2030-06-20",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(true);
  });

  it("detects exact same date range as overlap", () => {
    const result = checkOverlap(
      "2030-06-10",
      "2030-06-15",
      [existing],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(true);
  });

  it("ignores bookings on different properties", () => {
    const result = checkOverlap(
      "2030-06-10",
      "2030-06-15",
      [existing],
      "prop-2",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("excludes the booking being updated (excludeBookingId)", () => {
    const result = checkOverlap(
      "2030-06-10",
      "2030-06-15",
      [existing],
      "prop-1",
      "b1",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("ignores cancelled bookings", () => {
    const cancelled = makeBooking(
      "b2",
      "2030-06-10",
      "2030-06-15",
      "cancelled",
    );
    const result = checkOverlap(
      "2030-06-10",
      "2030-06-15",
      [cancelled],
      "prop-1",
    );
    expect(result.hasOverlap).toBe(false);
  });

  it("returns no overlap for an empty bookings array", () => {
    const result = checkOverlap("2030-06-10", "2030-06-15", [], "prop-1");
    expect(result.hasOverlap).toBe(false);
  });

  it("returns the correct conflicting booking among multiple", () => {
    const bookings = [
      makeBooking("b1", "2030-06-01", "2030-06-05"),
      makeBooking("b2", "2030-06-10", "2030-06-15"),
      makeBooking("b3", "2030-06-20", "2030-06-25"),
    ];
    const result = checkOverlap("2030-06-12", "2030-06-22", bookings, "prop-1");
    expect(result.hasOverlap).toBe(true);
    expect(result.conflictingBooking?.id).toBe("b2");
  });
});

describe("calculateNights", () => {
  it("calculates the correct number of nights", () => {
    expect(calculateNights("2030-06-10", "2030-06-15")).toBe(5);
  });

  it("returns 0 for the same start and end date", () => {
    expect(calculateNights("2030-06-10", "2030-06-10")).toBe(0);
  });

  it("returns 0 when end is before start", () => {
    expect(calculateNights("2030-06-15", "2030-06-10")).toBe(0);
  });

  it("returns 1 for a single night stay", () => {
    expect(calculateNights("2030-06-10", "2030-06-11")).toBe(1);
  });
});

describe("isValidDateRange", () => {
  it("returns true when end is strictly after start", () => {
    expect(isValidDateRange("2030-06-10", "2030-06-15")).toBe(true);
  });

  it("returns false when end equals start", () => {
    expect(isValidDateRange("2030-06-10", "2030-06-10")).toBe(false);
  });

  it("returns false when end is before start", () => {
    expect(isValidDateRange("2030-06-15", "2030-06-10")).toBe(false);
  });

  it("returns false for invalid date strings", () => {
    expect(isValidDateRange("not-a-date", "2030-06-10")).toBe(false);
  });
});

// ─── calculateTotalPrice ──────────────────────────────────────────────────────

describe("calculateTotalPrice", () => {
  it("calculates the correct total price", () => {
    expect(calculateTotalPrice(5, 100)).toBe(500);
  });

  it("returns 0 for a 0-night stay", () => {
    expect(calculateTotalPrice(0, 200)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    expect(calculateTotalPrice(3, 99.99)).toBe(299.97);
  });
});

// ─── getBookedDates ───────────────────────────────────────────────────────────

describe("getBookedDates", () => {
  it("returns all dates within the booking interval", () => {
    const bookings = [makeBooking("b1", "2030-06-10", "2030-06-12")];
    expect(getBookedDates(bookings, "prop-1")).toHaveLength(3);
  });

  it("excludes cancelled bookings", () => {
    const cancelled = makeBooking(
      "b1",
      "2030-06-10",
      "2030-06-12",
      "cancelled",
    );
    expect(getBookedDates([cancelled], "prop-1")).toHaveLength(0);
  });

  it("excludes the booking currently being edited", () => {
    const bookings = [makeBooking("b1", "2030-06-10", "2030-06-12")];
    expect(getBookedDates(bookings, "prop-1", "b1")).toHaveLength(0);
  });
});
