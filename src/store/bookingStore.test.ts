import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBookingStore } from "@/store/bookingStore";
import type { BookingFormData } from "@/types";

const makeFormData = (
  overrides: Partial<BookingFormData> = {},
): BookingFormData => ({
  propertyId: "prop-001",
  guestName: "Test Guest",
  guestEmail: "test@example.com",
  startDate: "2030-01-10",
  endDate: "2030-01-15",
  guests: 2,
  status: "confirmed",
  ...overrides,
});

const resetStore = () => {
  useBookingStore.setState({
    bookings: [],
    properties: [
      {
        id: "prop-001",
        name: "Test Property",
        location: "Test City",
        description: "Test description",
        imageUrl: "",
        pricePerNight: 100,
        maxGuests: 8,
      },
    ],
  });
};

describe("bookingStore", () => {
  beforeEach(resetStore);

  describe("createBooking", () => {
    it("adds a new booking to state", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      expect(useBookingStore.getState().bookings).toHaveLength(1);
    });

    it("stores the correct totalPrice", () => {
      useBookingStore.getState().createBooking(makeFormData(), 750);
      expect(useBookingStore.getState().bookings[0].totalPrice).toBe(750);
    });

    it("generates a unique id for each booking", () => {
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-01-10", endDate: "2030-01-15" }),
          500,
        );
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-02-01", endDate: "2030-02-05" }),
          400,
        );
      const { bookings } = useBookingStore.getState();
      expect(bookings[0].id).not.toBe(bookings[1].id);
    });

    it("sets createdAt and updatedAt on creation", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      const booking = useBookingStore.getState().bookings[0];
      expect(booking.createdAt).toBeDefined();
      expect(booking.updatedAt).toBeDefined();
    });
  });

  describe("updateBooking", () => {
    it("updates the correct booking", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      const id = useBookingStore.getState().bookings[0].id;

      useBookingStore
        .getState()
        .updateBooking(id, { guestName: "Updated Name" });

      expect(useBookingStore.getState().bookings[0].guestName).toBe(
        "Updated Name",
      );
    });

    it("updates totalPrice when provided", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      const id = useBookingStore.getState().bookings[0].id;

      useBookingStore.getState().updateBooking(id, {}, 999);

      expect(useBookingStore.getState().bookings[0].totalPrice).toBe(999);
    });

    it("updates updatedAt timestamp", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));

      useBookingStore.getState().createBooking(makeFormData(), 500);
      const id = useBookingStore.getState().bookings[0].id;
      const originalUpdatedAt =
        useBookingStore.getState().bookings[0].updatedAt;

      vi.setSystemTime(new Date("2030-01-01T00:00:01.000Z"));
      useBookingStore.getState().updateBooking(id, { guestName: "New Name" });

      const newUpdatedAt = useBookingStore.getState().bookings[0].updatedAt;
      expect(newUpdatedAt).not.toBe(originalUpdatedAt);

      vi.useRealTimers();
    });

    it("does not affect other bookings", () => {
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-01-10", endDate: "2030-01-15" }),
          500,
        );
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-02-01", endDate: "2030-02-05" }),
          400,
        );

      const id = useBookingStore.getState().bookings[0].id;
      useBookingStore.getState().updateBooking(id, { guestName: "Changed" });

      expect(useBookingStore.getState().bookings[1].guestName).toBe(
        "Test Guest",
      );
    });
  });

  describe("deleteBooking", () => {
    it("removes the booking from state", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      const id = useBookingStore.getState().bookings[0].id;

      useBookingStore.getState().deleteBooking(id);

      expect(useBookingStore.getState().bookings).toHaveLength(0);
    });

    it("only removes the specified booking", () => {
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-01-10", endDate: "2030-01-15" }),
          500,
        );
      useBookingStore
        .getState()
        .createBooking(
          makeFormData({ startDate: "2030-02-01", endDate: "2030-02-05" }),
          400,
        );

      const id = useBookingStore.getState().bookings[0].id;
      useBookingStore.getState().deleteBooking(id);

      expect(useBookingStore.getState().bookings).toHaveLength(1);
    });
  });

  describe("getBookingById", () => {
    it("returns the correct booking", () => {
      useBookingStore.getState().createBooking(makeFormData(), 500);
      const id = useBookingStore.getState().bookings[0].id;

      const found = useBookingStore.getState().getBookingById(id);

      expect(found?.id).toBe(id);
    });

    it("returns undefined for a non-existent id", () => {
      const found = useBookingStore.getState().getBookingById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  describe("getBookingsByProperty", () => {
    it("returns only bookings for the given property", () => {
      useBookingStore.getState().createBooking(
        makeFormData({
          propertyId: "prop-001",
          startDate: "2030-01-10",
          endDate: "2030-01-15",
        }),
        500,
      );
      useBookingStore.getState().createBooking(
        makeFormData({
          propertyId: "prop-002",
          startDate: "2030-01-10",
          endDate: "2030-01-15",
        }),
        400,
      );

      const result = useBookingStore
        .getState()
        .getBookingsByProperty("prop-001");

      expect(result).toHaveLength(1);
      expect(result[0].propertyId).toBe("prop-001");
    });
  });

  describe("getPropertyById", () => {
    it("returns the correct property", () => {
      const property = useBookingStore.getState().getPropertyById("prop-001");
      expect(property?.id).toBe("prop-001");
    });

    it("returns undefined for a non-existent id", () => {
      const property = useBookingStore
        .getState()
        .getPropertyById("non-existent");
      expect(property).toBeUndefined();
    });
  });
});
