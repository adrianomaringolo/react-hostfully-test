import { useState } from "react";
import styled from "styled-components";
import { Toaster } from "react-hot-toast";
import { Plus, Search, Building2 } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useDebounce } from "@/hooks/useDebounce";
import { useProperties } from "@/hooks/useProperties";
import { useBookingStore } from "@/store/bookingStore";
import { BookingCard } from "@/components/BookingCard/BookingCard";
import { BookingForm } from "@/components/BookingForm/BookingForm";
import { BookingDetail } from "@/components/BookingDetail/BookingDetail";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { theme } from "@/styles/theme";
import type { UUID } from "@/types";
import {
  Header,
  HeaderControls,
  HeaderInner,
  Logo,
  LogoTitle,
} from "./components/ui/Header";
import { SearchInput, SearchWrapper } from "./components/ui/Search";
import {
  EmptyDescription,
  EmptyState,
  EmptyTitle,
} from "./components/ui/Empty";
import { PageHeader, PageSubtitle, PageTitle } from "./components/ui/Page";

const AppWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  width: 100%;
`;

const PropertySelect = styled.select`
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textInverse};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  min-width: 160px;
  transition: all ${theme.transitions.fast};

  option {
    background: ${theme.colors.primary};
    color: ${theme.colors.textInverse};
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const NewBookingButton = styled(Button)`
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.md}) {
    order: 2;
  }
`;

const Main = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
`;

const BookingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<UUID | null>(
    null,
  );
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { modal, openCreateModal, closeModal, getBookingById } = useBookings();
  const { properties } = useProperties();
  const bookings = useBookingStore((state) => state.bookings);

  // Filter bookings by property and search query
  const filteredBookings = bookings
    .filter((b) =>
      selectedPropertyId ? b.propertyId === selectedPropertyId : true,
    )
    .filter((b) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        b.guestName.toLowerCase().includes(q) ||
        b.guestEmail.toLowerCase().includes(q)
      );
    });

  const editingBooking = modal.bookingId
    ? getBookingById(modal.bookingId)
    : undefined;

  const modalTitle =
    modal.mode === "create"
      ? "New Booking"
      : modal.mode === "edit"
        ? "Edit Booking"
        : "Booking Details";

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <AppWrapper>
      {/* Header */}
      <Header>
        <HeaderInner>
          <Logo>
            <Building2 size={22} />
            <LogoTitle>Stayo</LogoTitle>
          </Logo>

          <HeaderControls>
            <SearchWrapper>
              <Search size={14} />
              <SearchInput
                type="search"
                placeholder="Search by guest name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search bookings"
              />
            </SearchWrapper>

            <PropertySelect
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value || null)}
              aria-label="Filter by property"
            >
              <option value="">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </PropertySelect>
          </HeaderControls>

          <NewBookingButton $variant="primary" onClick={openCreateModal}>
            <Plus size={16} />
            New Booking
          </NewBookingButton>
        </HeaderInner>
      </Header>

      {/* Main content */}
      <Main>
        <PageHeader>
          <PageTitle>
            {selectedProperty ? selectedProperty.name : "All Bookings"}
          </PageTitle>
          <PageSubtitle>
            {filteredBookings.length} booking
            {filteredBookings.length !== 1 ? "s" : ""} found
          </PageSubtitle>
        </PageHeader>

        {filteredBookings.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No bookings found</EmptyTitle>
            <EmptyDescription>
              {debouncedQuery
                ? "Try adjusting your search query."
                : "Get started by creating your first booking."}
            </EmptyDescription>
            {!debouncedQuery && (
              <Button $variant="primary" onClick={openCreateModal}>
                <Plus size={16} />
                Create Booking
              </Button>
            )}
          </EmptyState>
        ) : (
          <BookingsGrid>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </BookingsGrid>
        )}
      </Main>

      {/* Global booking modal */}
      <Modal
        isOpen={modal.mode !== "closed"}
        title={modalTitle}
        onClose={closeModal}
      >
        {modal.mode === "view" && editingBooking && (
          <BookingDetail booking={editingBooking} />
        )}
        {(modal.mode === "create" || modal.mode === "edit") && (
          <BookingForm
            mode={modal.mode}
            existingBooking={modal.mode === "edit" ? editingBooking : undefined}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: theme.colors.primary,
            color: theme.colors.textInverse,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            boxShadow: theme.shadows.lg,
          },
        }}
      />
    </AppWrapper>
  );
};

export default App;
