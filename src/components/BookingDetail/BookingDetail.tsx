import styled from "styled-components";
import {
  Calendar,
  Mail,
  Users,
  Home,
  Clock,
  FileText,
  Edit2,
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useProperties } from "@/hooks/useProperties";
import { formatDisplayDate, calculateNights } from "@/utils/dateUtils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { theme } from "@/styles/theme";
import type { Booking } from "@/types";
import {
  DetailContent,
  DetailIcon,
  DetailLabel,
  DetailRow,
  DetailValue,
} from "../ui/Detail";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const SectionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textMuted};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: ${theme.spacing.xs};
`;

const PriceSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
`;

const PriceLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const PriceValue = styled.span`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
`;

interface BookingDetailProps {
  booking: Booking;
}

export const BookingDetail = ({ booking }: BookingDetailProps) => {
  const { openEditModal } = useBookings();
  const { getPropertyById } = useProperties();

  const property = getPropertyById(booking.propertyId);
  const nights = calculateNights(booking.startDate, booking.endDate);

  return (
    <Container>
      {/* Guest */}
      <Section>
        <SectionTitle>Guest</SectionTitle>
        <DetailRow>
          <DetailIcon>
            <Users size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Name</DetailLabel>
            <DetailValue>{booking.guestName}</DetailValue>
          </DetailContent>
          <StatusBadge $status={booking.status}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </StatusBadge>
        </DetailRow>
        <DetailRow>
          <DetailIcon>
            <Mail size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Email</DetailLabel>
            <DetailValue>{booking.guestEmail}</DetailValue>
          </DetailContent>
        </DetailRow>
        <DetailRow>
          <DetailIcon>
            <Users size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Guests</DetailLabel>
            <DetailValue>
              {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
            </DetailValue>
          </DetailContent>
        </DetailRow>
      </Section>

      {/* Stay */}
      <Section>
        <SectionTitle>Stay</SectionTitle>
        {property && (
          <DetailRow>
            <DetailIcon>
              <Home size={14} />
            </DetailIcon>
            <DetailContent>
              <DetailLabel>Property</DetailLabel>
              <DetailValue>
                {property.name} — {property.location}
              </DetailValue>
            </DetailContent>
          </DetailRow>
        )}
        <DetailRow>
          <DetailIcon>
            <Calendar size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Check-in</DetailLabel>
            <DetailValue>{formatDisplayDate(booking.startDate)}</DetailValue>
          </DetailContent>
        </DetailRow>
        <DetailRow>
          <DetailIcon>
            <Calendar size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Check-out ({nights} nights)</DetailLabel>
            <DetailValue>{formatDisplayDate(booking.endDate)}</DetailValue>
          </DetailContent>
        </DetailRow>
      </Section>

      {/* Notes */}
      {booking.notes && (
        <Section>
          <SectionTitle>Notes</SectionTitle>
          <DetailRow>
            <DetailIcon>
              <FileText size={14} />
            </DetailIcon>
            <DetailContent>
              <DetailValue>{booking.notes}</DetailValue>
            </DetailContent>
          </DetailRow>
        </Section>
      )}

      {/* Price */}
      <PriceSummary>
        <PriceLabel>
          {nights} nights × ${property?.pricePerNight}/night
        </PriceLabel>
        <PriceValue>${booking.totalPrice.toLocaleString()}</PriceValue>
      </PriceSummary>

      {/* Metadata */}
      <Section>
        <SectionTitle>Metadata</SectionTitle>
        <DetailRow>
          <DetailIcon>
            <Clock size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Created at</DetailLabel>
            <DetailValue>
              {new Date(booking.createdAt).toLocaleString()}
            </DetailValue>
          </DetailContent>
        </DetailRow>
        <DetailRow>
          <DetailIcon>
            <Clock size={14} />
          </DetailIcon>
          <DetailContent>
            <DetailLabel>Last updated</DetailLabel>
            <DetailValue>
              {new Date(booking.updatedAt).toLocaleString()}
            </DetailValue>
          </DetailContent>
        </DetailRow>
      </Section>

      {/* Edit shortcut */}
      <Button
        $variant="secondary"
        $fullWidth
        onClick={() => openEditModal(booking.id)}
      >
        <Edit2 size={14} />
        Edit this Booking
      </Button>
    </Container>
  );
};
