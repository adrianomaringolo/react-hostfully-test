import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { BookingCard } from "@/components/BookingCard/BookingCard";
import { theme } from "@/styles/theme";
import type { Booking } from "@/types";

const mockHandleDelete = vi.fn();
const mockOpenEdit = vi.fn();
const mockOpenView = vi.fn();

vi.mock("@/hooks/useBookings", () => ({
  useBookings: () => ({
    handleDeleteBooking: mockHandleDelete,
    openEditModal: mockOpenEdit,
    openViewModal: mockOpenView,
    modal: { mode: "closed" },
  }),
}));

vi.mock("@/hooks/useProperties", () => ({
  useProperties: () => ({
    getPropertyById: () => ({
      id: "prop-001",
      name: "Ocean Villa",
      location: "Malibu",
      pricePerNight: 450,
      maxGuests: 8,
    }),
  }),
}));

const mockBooking: Booking = {
  id: "book-test-001",
  propertyId: "prop-001",
  guestName: "Jane Smith",
  guestEmail: "jane@example.com",
  startDate: "2030-06-10",
  endDate: "2030-06-15",
  guests: 2,
  totalPrice: 2250,
  status: "confirmed",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderCard = (booking: Booking = mockBooking) =>
  render(
    <ThemeProvider theme={theme}>
      <BookingCard booking={booking} />
    </ThemeProvider>,
  );

describe("BookingCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guest name", () => {
    renderCard();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders guest email", () => {
    renderCard();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders the property name", () => {
    renderCard();
    expect(screen.getByText("Ocean Villa")).toBeInTheDocument();
  });

  it("renders total price", () => {
    renderCard();
    expect(screen.getByText("$2,250")).toBeInTheDocument();
  });

  it("renders the status badge", () => {
    renderCard();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    renderCard();
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls openViewModal when View is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByText("View"));
    expect(mockOpenView).toHaveBeenCalledWith("book-test-001");
  });

  it("calls openEditModal when Edit is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByText("Edit"));
    expect(mockOpenEdit).toHaveBeenCalledWith("book-test-001");
  });

  it("shows confirmation prompt when Delete is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText("Delete this booking?")).toBeInTheDocument();
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("does not delete when No is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("No"));
    expect(mockHandleDelete).not.toHaveBeenCalled();
  });

  it("calls handleDeleteBooking when confirmed", () => {
    renderCard();
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("Yes, delete"));
    expect(mockHandleDelete).toHaveBeenCalledWith("book-test-001");
  });

  it("hides confirmation prompt after clicking No", () => {
    renderCard();
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("No"));
    expect(screen.queryByText("Delete this booking?")).not.toBeInTheDocument();
  });

  it("renders pending status correctly", () => {
    renderCard({ ...mockBooking, status: "pending" });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders cancelled status correctly", () => {
    renderCard({ ...mockBooking, status: "cancelled" });
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = renderCard();
    expect(container).toMatchSnapshot();
  });
});
