import type { Property, Booking } from "@/types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    name: "Oceanfront Villa",
    location: "Malibu, California",
    description: "Stunning beachfront villa with panoramic Pacific views.",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop",
    pricePerNight: 450,
    maxGuests: 8,
  },
  {
    id: "prop-002",
    name: "Mountain Chalet",
    location: "Aspen, Colorado",
    description: "Cozy ski-in ski-out chalet with fireplace and hot tub.",
    imageUrl:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&auto=format&fit=crop",
    pricePerNight: 320,
    maxGuests: 6,
  },
  {
    id: "prop-003",
    name: "Downtown Loft",
    location: "New York City, NY",
    description: "Modern industrial loft in the heart of Manhattan.",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    pricePerNight: 280,
    maxGuests: 4,
  },
  {
    id: "prop-004",
    name: "Tuscan Farmhouse",
    location: "Florence, Italy",
    description: "Restored stone farmhouse surrounded by vineyards and olive groves.",
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop",
    pricePerNight: 380,
    maxGuests: 10,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "book-001",
    propertyId: "prop-001",
    guestName: "Alice Johnson",
    guestEmail: "alice@example.com",
    startDate: "2027-07-01",
    endDate: "2027-07-06",
    guests: 4,
    totalPrice: 2250,
    status: "confirmed",
    notes: "Anniversary trip.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "book-002",
    propertyId: "prop-001",
    guestName: "Bob Martinez",
    guestEmail: "bob@example.com",
    startDate: "2027-07-15",
    endDate: "2027-07-20",
    guests: 6,
    totalPrice: 2250,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "book-003",
    propertyId: "prop-002",
    guestName: "Carol White",
    guestEmail: "carol@example.com",
    startDate: "2027-07-10",
    endDate: "2027-07-15",
    guests: 2,
    totalPrice: 1600,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
