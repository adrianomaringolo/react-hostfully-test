import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { BookingDetail } from "@/components/BookingDetail/BookingDetail";
import { theme } from "@/styles/theme";
import type { Booking } from "@/types";

const mockOpenEditModal = vi.fn();

vi.mock("@/hooks/useBookings", () => ({
  useBookings: () => ({
    openEditModal: mockOpenEditModal,
  }),
}));

vi.mock("@/hooks/useProperties", () => ({
  useProperties: () => ({
    getPropertyById: () => ({
      id: "prop-001",
      name: "Oceanfront Villa",
      location: "Malibu, California",
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
  notes: "Oceanview room preferred.",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
};

const renderDetail = (booking: Booking = mockBooking) =>
  render(
    <ThemeProvider theme={theme}>
      <BookingDetail booking={booking} />
    </ThemeProvider>,
  );

describe("BookingDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  Guest info

  it("renders guest name", () => {
    renderDetail();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders guest email", () => {
    renderDetail();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders guest count in plural", () => {
    renderDetail();
    expect(screen.getByText("2 guests")).toBeInTheDocument();
  });

  it("renders guest count in singular for 1 guest", () => {
    renderDetail({ ...mockBooking, guests: 1 });
    expect(screen.getByText("1 guest")).toBeInTheDocument();
  });

  //  Status

  it("renders confirmed status badge", () => {
    renderDetail();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders pending status badge", () => {
    renderDetail({ ...mockBooking, status: "pending" });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders cancelled status badge", () => {
    renderDetail({ ...mockBooking, status: "cancelled" });
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  //  Stay info

  it("renders property name and location", () => {
    renderDetail();
    expect(
      screen.getByText("Oceanfront Villa — Malibu, California"),
    ).toBeInTheDocument();
  });

  it("renders formatted check-in date", () => {
    renderDetail();
    expect(screen.getByText("Jun 10, 2030")).toBeInTheDocument();
  });

  it("renders formatted check-out date", () => {
    renderDetail();
    expect(screen.getByText("Jun 15, 2030")).toBeInTheDocument();
  });

  it("renders the night count in the check-out label", () => {
    renderDetail();
    expect(screen.getByText("Check-out (5 nights)")).toBeInTheDocument();
  });

  //  Notes

  it("renders notes content when present", () => {
    renderDetail();
    expect(screen.getByText("Oceanview room preferred.")).toBeInTheDocument();
  });

  it("renders Notes section title when notes are present", () => {
    renderDetail();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("hides the Notes section when notes are absent", () => {
    renderDetail({ ...mockBooking, notes: undefined });
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
  });

  //  Price

  it("renders total price", () => {
    renderDetail();
    expect(screen.getByText("$2,250")).toBeInTheDocument();
  });

  it("renders price summary with nightly rate and night count", () => {
    renderDetail();
    expect(screen.getByText(/5 nights × \$450\/night/)).toBeInTheDocument();
  });

  //  Metadata

  it("renders Created at label", () => {
    renderDetail();
    expect(screen.getByText("Created at")).toBeInTheDocument();
  });

  it("renders Last updated label", () => {
    renderDetail();
    expect(screen.getByText("Last updated")).toBeInTheDocument();
  });

  //  Edit button

  it("renders Edit this Booking button", () => {
    renderDetail();
    expect(
      screen.getByRole("button", { name: /Edit this Booking/ }),
    ).toBeInTheDocument();
  });

  it("calls openEditModal with the booking id when Edit is clicked", () => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: /Edit this Booking/ }));
    expect(mockOpenEditModal).toHaveBeenCalledOnce();
    expect(mockOpenEditModal).toHaveBeenCalledWith("book-test-001");
  });

  //  Snapshot

  it("matches snapshot", () => {
    const { container } = renderDetail();
    expect(container).toMatchSnapshot();
  });
});
