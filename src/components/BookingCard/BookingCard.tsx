import { useState } from "react";
import styled from "styled-components";
import {
  Calendar,
  Mail,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useProperties } from "@/hooks/useProperties";
import { formatDisplayDate, calculateNights } from "@/utils/dateUtils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { theme } from "@/styles/theme";
import type { Booking } from "@/types";
import {
  Card,
  CardActions,
  CardHeader,
  CoverImage,
  HeaderLeft,
} from "../ui/Card";
import { InfoGrid, InfoItem, InfoLabel, InfoText } from "../ui/Info";

const GuestName = styled.h3`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  line-height: ${theme.typography.lineHeight.tight};
`;

const PropertyName = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
`;

const ConfirmDelete = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.errorLight};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard = ({ booking }: BookingCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { handleDeleteBooking, openEditModal, openViewModal } = useBookings();
  const { getPropertyById } = useProperties();

  const property = getPropertyById(booking.propertyId);
  const nights = calculateNights(booking.startDate, booking.endDate);

  const handleDelete = () => {
    handleDeleteBooking(booking.id);
    setConfirmingDelete(false);
  };

  return (
    <Card data-testid={`booking-card-${booking.id}`}>
      {/* Cover image */}
      {property?.imageUrl && (
        <CoverImage src={property.imageUrl} alt={property.name} />
      )}

      {/* Header */}
      <CardHeader>
        <HeaderLeft>
          <GuestName>{booking.guestName}</GuestName>
          {property && <PropertyName>{property.name}</PropertyName>}
        </HeaderLeft>
        <StatusBadge $status={booking.status}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </StatusBadge>
      </CardHeader>

      {/* Info Grid */}
      <InfoGrid>
        <InfoItem>
          <Calendar size={14} />
          <InfoText>
            <span>{formatDisplayDate(booking.startDate)}</span>
            <InfoLabel>Check-in</InfoLabel>
          </InfoText>
        </InfoItem>

        <InfoItem>
          <Calendar size={14} />
          <InfoText>
            <span>{formatDisplayDate(booking.endDate)}</span>
            <InfoLabel>Check-out · {nights} nights</InfoLabel>
          </InfoText>
        </InfoItem>

        <InfoItem>
          <Mail size={14} />
          <InfoText>
            <span>{booking.guestEmail}</span>
          </InfoText>
        </InfoItem>

        <InfoItem>
          <Users size={14} />
          <InfoText>
            <span>
              {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
            </span>
          </InfoText>
        </InfoItem>

        <InfoItem>
          <DollarSign size={14} />
          <InfoText>
            <span>${booking.totalPrice.toLocaleString()}</span>
            <InfoLabel>Total</InfoLabel>
          </InfoText>
        </InfoItem>
      </InfoGrid>

      {/* Delete confirmation or action buttons */}
      {confirmingDelete ? (
        <ConfirmDelete>
          <span>Delete this booking?</span>
          <ConfirmActions>
            <Button
              $variant="secondary"
              $size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              No
            </Button>
            <Button $variant="danger" $size="sm" onClick={handleDelete}>
              Yes, delete
            </Button>
          </ConfirmActions>
        </ConfirmDelete>
      ) : (
        <CardActions>
          <Button
            $variant="ghost"
            $size="sm"
            onClick={() => openViewModal(booking.id)}
          >
            <Eye size={13} /> View
          </Button>
          <Button
            $variant="ghost"
            $size="sm"
            onClick={() => openEditModal(booking.id)}
            style={{ marginLeft: "auto" }}
          >
            <Edit2 size={13} /> Edit
          </Button>
          <Button
            $variant="danger"
            $size="sm"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={13} /> Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
