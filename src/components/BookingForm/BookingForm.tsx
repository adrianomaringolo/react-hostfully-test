import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBookings } from "@/hooks/useBookings";
import { useProperties } from "@/hooks/useProperties";
import { useOverlapValidation } from "@/hooks/useOverlapValidation";
import {
  bookingSchema,
  type BookingSchemaType,
} from "@/utils/validationSchemas";
import {
  parseDate,
  toISODateString,
  calculateNights,
  calculateTotalPrice,
} from "@/utils/dateUtils";
import {
  FieldWrapper,
  Label,
  Input,
  Select,
  Textarea,
  ErrorMessage,
  FieldGroup,
} from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Booking, UUID } from "@/types";
import { PriceLabel, PriceSummary, PriceValue } from "../ui/Price";
import { Actions, DatePickerWrapper, Form } from "../ui/Form";

interface BookingFormProps {
  /** Controls whether this form creates a new booking or updates an existing one. */
  mode: "create" | "edit";
  /** Required when mode is 'edit'. */
  existingBooking?: Booking;
  onCancel: () => void;
}

export const BookingForm = ({
  mode,
  existingBooking,
  onCancel,
}: BookingFormProps) => {
  const { handleCreateBooking, handleUpdateBooking } = useBookings();
  const { properties } = useProperties();

  // Track selected property locally to feed into the overlap hook
  const [selectedPropertyId, setSelectedPropertyId] = useState<UUID>(
    existingBooking?.propertyId ?? properties[0]?.id ?? "",
  );

  const { bookedDates, validateDateRange } = useOverlapValidation({
    propertyId: selectedPropertyId || null,
    excludeBookingId: existingBooking?.id,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingSchemaType>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      propertyId: existingBooking?.propertyId ?? properties[0]?.id ?? "",
      guestName: existingBooking?.guestName ?? "",
      guestEmail: existingBooking?.guestEmail ?? "",
      startDate: existingBooking?.startDate ?? "",
      endDate: existingBooking?.endDate ?? "",
      guests: existingBooking?.guests ?? 2,
      status: existingBooking?.status ?? "pending",
      notes: existingBooking?.notes ?? "",
    },
  });

  // Keep selectedPropertyId in sync with the form value
  const watchedPropertyId = watch("propertyId");
  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");

  useEffect(() => {
    setSelectedPropertyId(watchedPropertyId);
  }, [watchedPropertyId]);

  // Dynamic price calculation
  const nights = calculateNights(watchedStartDate, watchedEndDate);
  const selectedProperty = properties.find((p) => p.id === watchedPropertyId);
  const estimatedTotal = selectedProperty
    ? calculateTotalPrice(nights, selectedProperty.pricePerNight)
    : 0;

  const onSubmit = (data: BookingSchemaType) => {
    // Second layer of overlap validation at submit time
    const overlapError = validateDateRange(data.startDate, data.endDate);
    if (overlapError) {
      setError("startDate", { message: overlapError });
      setError("endDate", { message: overlapError });
      return;
    }

    if (mode === "create") {
      handleCreateBooking(data, estimatedTotal);
    } else if (mode === "edit" && existingBooking) {
      handleUpdateBooking(existingBooking.id, data, estimatedTotal);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Property */}
      <FieldWrapper>
        <Label htmlFor="propertyId">Property</Label>
        <Select
          id="propertyId"
          $hasError={!!errors.propertyId}
          {...register("propertyId")}
        >
          <option value="">Select a property...</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.location} (${p.pricePerNight}/night)
            </option>
          ))}
        </Select>
        {errors.propertyId && (
          <ErrorMessage>{errors.propertyId.message}</ErrorMessage>
        )}
      </FieldWrapper>

      {/* Guest info */}
      <FieldGroup>
        <FieldWrapper>
          <Label htmlFor="guestName">Guest Name</Label>
          <Input
            id="guestName"
            type="text"
            placeholder="Jane Doe"
            $hasError={!!errors.guestName}
            {...register("guestName")}
          />
          {errors.guestName && (
            <ErrorMessage>{errors.guestName.message}</ErrorMessage>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <Label htmlFor="guestEmail">Guest Email</Label>
          <Input
            id="guestEmail"
            type="email"
            placeholder="jane@example.com"
            $hasError={!!errors.guestEmail}
            {...register("guestEmail")}
          />
          {errors.guestEmail && (
            <ErrorMessage>{errors.guestEmail.message}</ErrorMessage>
          )}
        </FieldWrapper>
      </FieldGroup>

      {/* Dates */}
      <FieldGroup>
        <FieldWrapper>
          <Label>Check-in</Label>
          <DatePickerWrapper $hasError={!!errors.startDate}>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? parseDate(field.value) : null}
                  onChange={(date: Date | null) =>
                    field.onChange(date ? toISODateString(date) : "")
                  }
                  excludeDates={bookedDates}
                  minDate={new Date()}
                  placeholderText="Select check-in"
                  dateFormat="MMM d, yyyy"
                  withPortal
                />
              )}
            />
          </DatePickerWrapper>
          {errors.startDate && (
            <ErrorMessage>{errors.startDate.message}</ErrorMessage>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <Label>Check-out</Label>
          <DatePickerWrapper $hasError={!!errors.endDate}>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? parseDate(field.value) : null}
                  onChange={(date: Date | null) =>
                    field.onChange(date ? toISODateString(date) : "")
                  }
                  excludeDates={bookedDates}
                  minDate={
                    watchedStartDate
                      ? new Date(
                          new Date(watchedStartDate).getTime() + 86400000,
                        )
                      : new Date()
                  }
                  placeholderText="Select check-out"
                  dateFormat="MMM d, yyyy"
                  withPortal
                />
              )}
            />
          </DatePickerWrapper>
          {errors.endDate && (
            <ErrorMessage>{errors.endDate.message}</ErrorMessage>
          )}
        </FieldWrapper>
      </FieldGroup>

      {/* Guests + Status */}
      <FieldGroup>
        <FieldWrapper>
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={selectedProperty?.maxGuests ?? 20}
            $hasError={!!errors.guests}
            {...register("guests", { valueAsNumber: true })}
          />
          {errors.guests && (
            <ErrorMessage>{errors.guests.message}</ErrorMessage>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FieldWrapper>
      </FieldGroup>

      {/* Notes */}
      <FieldWrapper>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Special requests or notes for the host..."
          $hasError={!!errors.notes}
          {...register("notes")}
        />
        {errors.notes && <ErrorMessage>{errors.notes.message}</ErrorMessage>}
      </FieldWrapper>

      {/* Price summary — only shown when dates and property are selected */}
      {nights > 0 && estimatedTotal > 0 && (
        <PriceSummary>
          <PriceLabel>
            {nights} night{nights !== 1 ? "s" : ""} × $
            {selectedProperty?.pricePerNight}/night
          </PriceLabel>
          <PriceValue>${estimatedTotal.toLocaleString()}</PriceValue>
        </PriceSummary>
      )}

      {/* Actions */}
      <Actions>
        <Button type="button" $variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>
          {mode === "create" ? "Create Booking" : "Save Changes"}
        </Button>
      </Actions>
    </Form>
  );
};
