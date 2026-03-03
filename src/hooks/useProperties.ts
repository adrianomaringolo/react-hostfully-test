import { useBookingStore } from "@/store/bookingStore";

/**
 * Provides access to properties state and selection logic from the store.
 * Components should use this hook instead of accessing the store directly for better separation.
 */
export const useProperties = () => {
  const properties = useBookingStore((state) => state.properties);
  const getPropertyById = useBookingStore((state) => state.getPropertyById);

  return {
    properties,
    getPropertyById,
  };
};
