# Stayo — Booking Manager

A property booking management system built as a technical assessment.

## Tech Stack

| Concern         | Library                        |
| --------------- | ------------------------------ |
| Build tool      | Vite                           |
| Framework       | React 19 + TypeScript          |
| Global state    | Zustand                        |
| Form validation | React Hook Form + Zod          |
| Date handling   | date-fns                       |
| Date picker     | react-datepicker               |
| Styling         | Styled Components              |
| Notifications   | react-hot-toast                |
| Unit tests      | Vitest + React Testing Library |
| E2E tests       | Playwright                     |
| Icons           | lucide-react                   |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

```bash
npm run dev             # Start dev server
npm run build           # Type check + production build
npm run test            # Run unit tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run cy:open         # Open Playwright interactive UI
npm run cy:run          # Run Playwright headlessly
```

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── BookingCard/
│   │   ├── BookingCard.tsx         # Booking display card with inline delete confirm
│   │   └── BookingCard.test.tsx    # Component + snapshot tests
│   ├── BookingDetail/
│   │   ├── BookingDetail.tsx       # Read-only booking detail view
│   │   └── BookingDetail.test.tsx  # Component + snapshot tests
│   ├── BookingForm/
│   │   ├── BookingForm.tsx         # Unified create/edit form
│   │   └── BookingForm.test.tsx    # Validation and submission tests
│   └── ui/
│       ├── Button.tsx              # Base button with variants
│       ├── Card.tsx                # Card container primitives (CoverImage, CardHeader…)
│       ├── Detail.tsx              # Booking detail layout primitives
│       ├── Empty.tsx               # Empty state layout
│       ├── Field.tsx               # Form field primitives
│       ├── Form.tsx                # Form layout primitives
│       ├── Header.tsx              # App header primitives
│       ├── Info.tsx                # Info grid primitives (InfoGrid, InfoItem…)
│       ├── Modal.tsx               # Accessible modal dialog
│       ├── Modal.test.tsx          # Modal behavior tests
│       ├── Page.tsx                # Page layout primitives
│       ├── Price.tsx               # Price display primitives
│       ├── Search.tsx              # Search input primitives
│       └── StatusBadge.tsx         # Booking status indicator
├── context/
│   └── ModalContext.tsx            # Global modal UI state
├── hooks/
│   ├── useBookings.ts              # CRUD operations + toast feedback
│   ├── useDebounce.ts              # Generic debounce hook
│   ├── useOverlapValidation.ts     # Date overlap detection for the form
│   └── useProperties.ts           # Property state access
├── store/
│   ├── bookingStore.ts             # Zustand store (domain data only)
│   └── bookingStore.test.ts        # Store action tests
├── styles/
│   ├── GlobalStyles.ts             # Global CSS reset and base styles
│   └── theme.ts                    # Design tokens
├── test/
│   └── setup.ts                    # Vitest global setup (@testing-library/jest-dom)
├── types/
│   └── index.ts                    # Shared TypeScript types
└── utils/
    ├── dateUtils.ts                # Date math and overlap algorithm
    ├── dateUtils.test.ts           # Overlap algorithm unit tests
    ├── mockData.ts                 # Seed data for development
    └── validationSchemas.ts        # Zod validation schemas
```

### Key Architectural Decisions

**Separation of concerns across state layers**

State is split into three layers based on its nature:

- **Zustand store** — domain data only (`bookings`, `properties`). Persisted to localStorage. No UI state.
- **ModalContext** — global UI state for the modal (open/closed, mode, target booking). Ephemeral, not persisted.
- **useState in App** — local UI state (`searchQuery`, `selectedPropertyId`). Only needed within the component tree.

This keeps the store pure and makes each layer easier to test independently.

**Unified BookingForm**

A single `BookingForm` component handles both create and edit modes via a `mode` prop. This ensures validation parity between the two operations and avoids duplicated logic. The form receives `existingBooking` when editing, which pre-fills all fields and passes the booking ID to the overlap checker so it excludes itself.

**Overlap detection — defense in depth**

Overlap prevention has two layers:

1. **DatePicker** — already-booked dates are disabled via `excludeDates`, preventing most conflicts at the UI level before the user even submits.
2. **Submit handler** — `validateDateRange` is called again on submit as a safety net, in case the UI layer was somehow bypassed.

The core algorithm:

```ts
// Two ranges overlap when:
isBefore(start, existingEnd) && isAfter(end, existingStart);

// Strict operators intentionally allow adjacent bookings:
// checkout on June 15 + checkin on June 15 = allowed
```

**Hooks as the interface to the store**

Components never import the store directly. All store access goes through hooks (`useBookings`, `useProperties`). This keeps components decoupled from the state implementation and makes them easier to test with mocks.

**Styled Components — no Tailwind**

Styled Components was chosen as the sole styling solution. Mixing it with Tailwind would create inconsistency, some styles as components, others as utility classes inline. A single solution with a `ThemeProvider` and design tokens gives full consistency and is easier to maintain and discuss in a review.

### Testing Strategy

**Unit tests (Vitest + RTL)**

Focus on the two most critical areas:

- `dateUtils.test.ts` — 20+ tests covering every overlap scenario: partial left, partial right, containment, adjacent, same-day, cancelled bookings, and the edit exclusion case.
- `bookingStore.test.ts` — tests for all CRUD operations and selectors, with store state reset between each test via `beforeEach`.
- `BookingCard.test.tsx` — component tests covering rendering, interactions, and a snapshot test.
- `Modal.test.tsx` — behavior tests for keyboard dismissal and aria attributes.

**E2E tests (Playwright)**

Full user flows verified in a real Chromium browser (`playwright/bookings.spec.ts`):

- Create, view, edit, and delete bookings
- Form validation errors
- Search and property filter
- Overlap prevention on submit
