import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Booking, Property, BookingFormData, UUID } from "@/types";
import { MOCK_BOOKINGS, MOCK_PROPERTIES } from "@/utils/mockData";

interface BookingStore {
  // Data
  bookings: Booking[];
  properties: Property[];

  // Actions
  createBooking: (data: BookingFormData, totalPrice: number) => void;
  updateBooking: (
    id: UUID,
    data: Partial<BookingFormData>,
    totalPrice?: number,
  ) => void;
  deleteBooking: (id: UUID) => void;

  // Selectors
  getBookingById: (id: UUID) => Booking | undefined;
  getBookingsByProperty: (propertyId: UUID) => Booking[];
  getPropertyById: (id: UUID) => Property | undefined;
}

export const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        bookings: MOCK_BOOKINGS,
        properties: MOCK_PROPERTIES,

        // Actions
        createBooking: (data, totalPrice) => {
          const newBooking: Booking = {
            ...data,
            id: uuidv4(),
            totalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set(
            (state) => ({ bookings: [...state.bookings, newBooking] }),
            false,
            "createBooking",
          );
        },

        updateBooking: (id, data, totalPrice) => {
          set(
            (state) => ({
              bookings: state.bookings.map((b) =>
                b.id === id
                  ? {
                      ...b,
                      ...data,
                      ...(totalPrice !== undefined && { totalPrice }),
                      updatedAt: new Date().toISOString(),
                    }
                  : b,
              ),
            }),
            false,
            "updateBooking",
          );
        },

        deleteBooking: (id) => {
          set(
            (state) => ({
              bookings: state.bookings.filter((b) => b.id !== id),
            }),
            false,
            "deleteBooking",
          );
        },

        // Selectors
        getBookingById: (id) => get().bookings.find((b) => b.id === id),

        getBookingsByProperty: (propertyId) =>
          get().bookings.filter((b) => b.propertyId === propertyId),

        getPropertyById: (id) => get().properties.find((p) => p.id === id),
      }),
      { name: "stayo-store" },
    ),
    { name: "StayoStore" },
  ),
);
