# Testing Strategy — Stayo App

## Overview

The Stayo Booking Manager adopts a multi-layer testing strategy that covers pure business logic, UI components, and full end-to-end user workflows. All tests run in CI-friendly environments with no external service dependencies.

| Layer                             | Tool                           | Files                                                                                      | Tests   |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ------- |
| Unit — pure functions             | Vitest                         | `dateUtils.test.ts`, `bookingStore.test.ts`                                                | 42      |
| Component — rendering & behaviour | Vitest + React Testing Library | `Modal.test.tsx`, `BookingCard.test.tsx`, `BookingDetail.test.tsx`, `BookingForm.test.tsx` | 68      |
| Snapshot — visual regression      | Vitest (built-in)              | `BookingCard.test.tsx`, `BookingDetail.test.tsx`                                           | 2       |
| End-to-end — full browser         | Playwright                     | `playwright/bookings.spec.ts`                                                              | 26      |
| **Total**                         |                                |                                                                                            | **138** |

---

## 1. Unit Tests

**Tool:** [Vitest](https://vitest.dev/)
**Environment:** Node (no DOM)
**Location:** `src/utils/dateUtils.test.ts`, `src/store/bookingStore.test.ts`

Unit tests cover isolated, pure or near-pure functions without any React or browser involvement. They run in milliseconds and provide the tightest feedback loop.

---

## 2. Component Tests

**Tool:** Vitest + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + `@testing-library/user-event`
**Environment:** jsdom (simulated browser DOM)
**Setup:** `src/test/setup.ts` imports `@testing-library/jest-dom` for extended matchers
**Location:** `src/components/`

Component tests render React components in isolation, mock their dependencies, and assert on visible output and user interactions. External dependencies (Zustand stores, hooks, third-party widgets) are replaced with Vitest mocks so each file tests a single component.

---

## 3. Snapshot Tests

Snapshot tests are embedded within the component test files. They capture the full rendered DOM of a component and fail if the markup changes unexpectedly, acting as a visual regression guard.

| Snapshot        | Location                                            |
| --------------- | --------------------------------------------------- |
| `BookingCard`   | `BookingCard.test.tsx` — `it("matches snapshot")`   |
| `BookingDetail` | `BookingDetail.test.tsx` — `it("matches snapshot")` |

Snapshots are stored in `__snapshots__/` directories adjacent to the test files and are committed to version control. They are regenerated with `npx vitest run -u` when intentional UI changes are made.

---

## 4. End-to-End Tests

**Tool:** [Playwright](https://playwright.dev/) v1.58
**Browser:** Chromium (system Chrome, no Electron dependency)
**Location:** `playwright/bookings.spec.ts`
**Config:** `playwright.config.ts`

E2E tests launch a real browser against the running Vite dev server (`http://localhost:5173`) and exercise the complete application stack: React rendering, Zustand state, form validation, and date picker interactions. The `webServer` option in `playwright.config.ts` starts the dev server automatically before the suite runs and reuses an existing server if already running.

### Configuration highlights

```
testDir: ./playwright
workers: 1            # sequential — avoids shared-state flakiness
baseURL: http://localhost:5173
actionTimeout: 10 000 ms
browser: Chromium (Desktop Chrome profile)
```

### Test groups — 26 tests total

| `test.describe`        | Tests | What is covered                                                                                                                                   |
| ---------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Initial state**      | 4     | App header and logo, New Booking button, mock bookings visible on load, default page title "All Bookings"                                         |
| **Create booking**     | 6     | Modal opens, validation errors on empty submit, email validation, successful creation with toast, modal closes after success, Cancel closes modal |
| **View booking**       | 3     | View modal opens with "Booking Details", guest info and date labels displayed, Escape key closes modal                                            |
| **Edit booking**       | 3     | Edit modal opens, form pre-filled with existing data, success toast after saving                                                                  |
| **Delete booking**     | 3     | Confirmation prompt appears, No keeps booking count unchanged, Yes deletes and shows toast                                                        |
| **Search**             | 3     | Filters by guest name (with 400 ms debounce), empty state when no match, all bookings restored on clear                                           |
| **Property filter**    | 3     | Filters by property selection, all bookings restored on "All Properties", page title updates                                                      |
| **Overlap prevention** | 1     | Attempting to create a booking whose range straddles an existing reservation triggers the overlap error on both date fields                       |

### Key E2E implementation details

**Date picker interaction:** The booking form uses `react-datepicker` with `withPortal`, which renders the calendar at `document.body` level inside `.react-datepicker__portal`. Playwright locators use this class prefix instead of the standard `.react-datepicker-popper`.

**Overlap test strategy:** Mock booking `book-001` occupies `2027-07-01 → 2027-07-06` on `prop-001`. Individual dates within that range are disabled in the calendar (via `excludeDates`). The test picks June 29 (free) as check-in and July 7 (free) as check-out — both endpoints are selectable, but the resulting range crosses the booked window, triggering the server-side overlap guard on form submission.

**Mock data dates:** All mock bookings use 2027 dates to stay in the future relative to the DatePicker's `minDate={new Date()}` constraint.

---

## 5. Running the Tests

```bash
# Unit + component tests (watch mode)
npm test

# Unit + component tests (single run)
npx vitest run

# Unit + component tests with coverage report
npm run test:coverage

# Update snapshots after intentional UI changes
npx vitest run -u

# E2E tests (headless, auto-starts dev server)
npm run cy:run

# E2E tests with interactive UI
npm run cy:open
```

---

## 6. Technology Summary

| Tool                          | Version                     | Role                                              |
| ----------------------------- | --------------------------- | ------------------------------------------------- |
| Vitest                        | ^4.0                        | Test runner for unit and component tests          |
| React Testing Library         | ^16.3                       | Component rendering and querying                  |
| `@testing-library/user-event` | ^14.6                       | Realistic user interaction simulation             |
| `@testing-library/jest-dom`   | ^6.9                        | Extended DOM matchers (`toBeInTheDocument`, etc.) |
| jsdom                         | ^28.1                       | DOM environment for Vitest                        |
| Playwright                    | ^1.58                       | End-to-end browser automation                     |
| Zod                           | (via `@hookform/resolvers`) | Schema validation exercised by form tests         |
