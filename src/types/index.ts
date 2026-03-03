export type UUID = string;

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Property {
  id: UUID;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  pricePerNight: number;
  maxGuests: number;
}

export interface Booking {
  id: UUID;
  propertyId: UUID;
  guestName: string;
  guestEmail: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingFormData = Omit<
  Booking,
  "id" | "totalPrice" | "createdAt" | "updatedAt"
>;

export type ModalMode = "create" | "edit" | "view" | "closed";

export interface ModalState {
  mode: ModalMode;
  bookingId?: UUID;
}
