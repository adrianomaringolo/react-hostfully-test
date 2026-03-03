import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { BookingForm } from "@/components/BookingForm/BookingForm";
import { theme } from "@/styles/theme";
import type { Booking } from "@/types";

/**
 * Replace DatePicker with a plain <input> so tests can drive date fields with
 * simple fireEvent.change calls without spawning a calendar portal.
 */
vi.mock("react-datepicker", () => ({
  default: ({
    onChange,
    selected,
    placeholderText,
  }: {
    onChange: (date: Date | null) => void;
    selected: Date | null;
    placeholderText?: string;
  }) => (
    <input
      placeholder={placeholderText}
      value={selected ? selected.toISOString().split("T")[0] : ""}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value + "T00:00:00") : null)
      }
    />
  ),
}));

const mockHandleCreate = vi.fn();
const mockHandleUpdate = vi.fn();
const mockOnCancel = vi.fn();
const mockValidateDateRange = vi.fn<() => string | null>(() => null);

vi.mock("@/hooks/useBookings", () => ({
  useBookings: () => ({
    handleCreateBooking: mockHandleCreate,
    handleUpdateBooking: mockHandleUpdate,
  }),
}));

vi.mock("@/hooks/useProperties", () => ({
  useProperties: () => ({
    properties: [
      {
        id: "prop-001",
        name: "Oceanfront Villa",
        location: "Malibu, California",
        description: "",
        imageUrl: "",
        pricePerNight: 450,
        maxGuests: 8,
      },
      {
        id: "prop-002",
        name: "Mountain Chalet",
        location: "Aspen, Colorado",
        description: "",
        imageUrl: "",
        pricePerNight: 320,
        maxGuests: 6,
      },
    ],
  }),
}));

vi.mock("@/hooks/useOverlapValidation", () => ({
  useOverlapValidation: () => ({
    bookedDates: [],
    validateDateRange: mockValidateDateRange,
  }),
}));

// Helpers

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

const renderForm = (props: Partial<Parameters<typeof BookingForm>[0]> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <BookingForm mode="create" onCancel={mockOnCancel} {...props} />
    </ThemeProvider>,
  );

/** Fill in the minimum valid fields needed to pass Zod validation. */
const fillValidForm = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Guest Name"), "John Doe");
  await user.type(screen.getByLabelText("Guest Email"), "john@example.com");
  fireEvent.change(screen.getByPlaceholderText("Select check-in"), {
    target: { value: "2030-06-10" },
  });
  fireEvent.change(screen.getByPlaceholderText("Select check-out"), {
    target: { value: "2030-06-20" },
  });
};

// Tests

describe("BookingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateDateRange.mockReturnValue(null);
  });

  // Structure

  describe("fields are rendered", () => {
    it("renders Property select", () => {
      renderForm();
      expect(screen.getByLabelText("Property")).toBeInTheDocument();
    });

    it("renders Guest Name input", () => {
      renderForm();
      expect(screen.getByLabelText("Guest Name")).toBeInTheDocument();
    });

    it("renders Guest Email input", () => {
      renderForm();
      expect(screen.getByLabelText("Guest Email")).toBeInTheDocument();
    });

    it("renders Check-in date picker", () => {
      renderForm();
      expect(
        screen.getByPlaceholderText("Select check-in"),
      ).toBeInTheDocument();
    });

    it("renders Check-out date picker", () => {
      renderForm();
      expect(
        screen.getByPlaceholderText("Select check-out"),
      ).toBeInTheDocument();
    });

    it("renders Guests input", () => {
      renderForm();
      expect(screen.getByLabelText("Guests")).toBeInTheDocument();
    });

    it("renders Status select", () => {
      renderForm();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("renders Notes textarea", () => {
      renderForm();
      expect(screen.getByLabelText("Notes (optional)")).toBeInTheDocument();
    });

    it("populates Property select with options from useProperties", () => {
      renderForm();
      expect(
        screen.getByRole("option", { name: /Oceanfront Villa/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Mountain Chalet/ }),
      ).toBeInTheDocument();
    });
  });

  // Create mode─

  describe("create mode", () => {
    it("shows 'Create Booking' as the submit label", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: "Create Booking" }),
      ).toBeInTheDocument();
    });

    it("shows a Cancel button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });

    it("calls onCancel when Cancel is clicked", () => {
      renderForm();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });
  });

  // Edit mode─

  describe("edit mode", () => {
    it("shows 'Save Changes' as the submit label", () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeInTheDocument();
    });

    it("pre-fills Guest Name with the existing booking value", () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      expect(screen.getByLabelText("Guest Name")).toHaveValue("Jane Smith");
    });

    it("pre-fills Guest Email with the existing booking value", () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      expect(screen.getByLabelText("Guest Email")).toHaveValue(
        "jane@example.com",
      );
    });

    it("pre-fills Guests with the existing booking value", () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      expect(screen.getByLabelText("Guests")).toHaveValue(2);
    });

    it("pre-fills Status with the existing booking status", () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      expect(screen.getByLabelText("Status")).toHaveValue("confirmed");
    });
  });

  // Validation

  describe("validation errors", () => {
    it("shows error when Guest Name is too short", async () => {
      renderForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(
          screen.getByText("Name must be at least 2 characters"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when Guest Email is empty", async () => {
      renderForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    it("shows error when Guest Email is invalid", async () => {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText("Guest Email"), "not-an-email");
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when Check-in date is missing", async () => {
      renderForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(
          screen.getByText("Check-in date is required"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when Check-out date is missing", async () => {
      renderForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(
          screen.getByText("Check-out date is required"),
        ).toBeInTheDocument();
      });
    });

    it("shows overlap error on both date fields when validateDateRange returns an error", async () => {
      mockValidateDateRange.mockReturnValue(
        "These dates overlap with an existing booking.",
      );
      renderForm();
      await fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(
          screen.getAllByText("These dates overlap with an existing booking."),
        ).toHaveLength(2);
      });
    });
  });

  // Submission

  describe("submission", () => {
    it("calls handleCreateBooking with correct data in create mode", async () => {
      renderForm();
      await fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(mockHandleCreate).toHaveBeenCalledOnce();
      });
      const [data] = mockHandleCreate.mock.calls[0] as [
        Record<string, unknown>,
      ];
      expect(data.guestName).toBe("John Doe");
      expect(data.guestEmail).toBe("john@example.com");
      expect(data.startDate).toBe("2030-06-10");
      expect(data.endDate).toBe("2030-06-20");
    });

    it("calls handleUpdateBooking with the booking id in edit mode", async () => {
      renderForm({ mode: "edit", existingBooking: mockBooking });
      fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
      await waitFor(() => {
        expect(mockHandleUpdate).toHaveBeenCalledOnce();
      });
      expect(mockHandleUpdate).toHaveBeenCalledWith(
        "book-test-001",
        expect.objectContaining({ guestName: "Jane Smith" }),
        expect.any(Number),
      );
    });

    it("does not call handleCreateBooking when overlap exists", async () => {
      mockValidateDateRange.mockReturnValue("Dates overlap.");
      renderForm();
      await fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "Create Booking" }));
      await waitFor(() => {
        expect(screen.getAllByText("Dates overlap.")).toHaveLength(2);
      });
      expect(mockHandleCreate).not.toHaveBeenCalled();
    });
  });

  // Price summary

  describe("price summary", () => {
    it("shows price summary after selecting valid dates", async () => {
      renderForm();
      fireEvent.change(screen.getByPlaceholderText("Select check-in"), {
        target: { value: "2030-06-10" },
      });
      fireEvent.change(screen.getByPlaceholderText("Select check-out"), {
        target: { value: "2030-06-15" },
      });
      await waitFor(() => {
        expect(screen.getByText(/5 night/)).toBeInTheDocument();
      });
    });

    it("shows the estimated total price in the summary", async () => {
      renderForm();
      fireEvent.change(screen.getByPlaceholderText("Select check-in"), {
        target: { value: "2030-06-10" },
      });
      fireEvent.change(screen.getByPlaceholderText("Select check-out"), {
        target: { value: "2030-06-15" },
      });
      // 5 nights × $450/night = $2,250
      await waitFor(() => {
        expect(screen.getByText("$2,250")).toBeInTheDocument();
      });
    });
  });
});
