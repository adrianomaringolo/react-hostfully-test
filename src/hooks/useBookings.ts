import { useCallback } from "react";
import toast from "react-hot-toast";
import { useBookingStore } from "@/store/bookingStore";
import { useModal } from "@/context/ModalContext";
import type { BookingFormData, UUID } from "@/types";

/**
 * Provides all booking CRUD operations with error handling and toast feedback.
 * Components should interact with bookings exclusively through this hook.
 *
 * Architecture note: keeping side effects (toasts, modal closing) here
 * instead of in the store keeps the store pure and easier to test.
 */
export const useBookings = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const createBooking = useBookingStore((state) => state.createBooking);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);
  const getBookingById = useBookingStore((state) => state.getBookingById);
  const getBookingsByProperty = useBookingStore(
    (state) => state.getBookingsByProperty,
  );

  const { closeModal, openEditModal, openViewModal, openCreateModal, modal } =
    useModal();

  /**
   * Creates a new booking and closes the modal on success.
   * Returns true if successful, false otherwise.
   */
  const handleCreateBooking = useCallback(
    (data: BookingFormData, totalPrice: number): boolean => {
      try {
        createBooking(data, totalPrice);
        toast.success("Booking created successfully!");
        closeModal();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create booking";
        toast.error(message);
        return false;
      }
    },
    [createBooking, closeModal],
  );

  /**
   * Updates an existing booking and closes the modal on success.
   * Returns true if successful, false otherwise.
   */
  const handleUpdateBooking = useCallback(
    (
      id: UUID,
      data: Partial<BookingFormData>,
      totalPrice?: number,
    ): boolean => {
      try {
        updateBooking(id, data, totalPrice);
        toast.success("Booking updated successfully!");
        closeModal();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update booking";
        toast.error(message);
        return false;
      }
    },
    [updateBooking, closeModal],
  );

  /**
   * Deletes a booking by ID.
   */
  const handleDeleteBooking = useCallback(
    (id: UUID): void => {
      try {
        deleteBooking(id);
        toast.success("Booking deleted.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete booking";
        toast.error(message);
      }
    },
    [deleteBooking],
  );

  return {
    // State
    bookings,
    modal,

    // CRUD handlers
    handleCreateBooking,
    handleUpdateBooking,
    handleDeleteBooking,

    // Selectors
    getBookingById,
    getBookingsByProperty,

    // Modal controls
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
  };
};
