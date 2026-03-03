import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Picks a date in the react-datepicker portal by clicking the day element. */
async function pickDate(
  page: Page,
  inputPlaceholder: string,
  dayNumber: number,
) {
  const paddedDay = String(dayNumber).padStart(3, "0");
  await page
    .locator(
      `.react-datepicker__input-container input[placeholder="${inputPlaceholder}"]`,
    )
    .click();
  // withPortal renders the calendar inside .react-datepicker__portal
  await page
    .locator(
      `.react-datepicker__portal .react-datepicker__day--${paddedDay}:not(.react-datepicker__day--outside-month)`,
    )
    .first()
    .click();
}

/** Fills the booking form with the minimum valid data for a new booking. */
async function fillBookingForm(
  page: Page,
  opts: {
    name?: string;
    email?: string;
    property?: string;
    checkInDay?: number;
    checkOutDay?: number;
    guests?: number;
    status?: string;
  } = {},
) {
  const {
    name = "Jane Smith",
    email = "jane@example.com",
    property = "Oceanfront Villa — Malibu, California ($450/night)",
    checkInDay = 20,
    checkOutDay = 25,
    guests,
    status,
  } = opts;

  await page.locator("#guestName").fill(name);
  await page.locator("#guestEmail").fill(email);
  await page.locator("#propertyId").selectOption(property);
  if (guests !== undefined) {
    await page.locator("#guests").fill(String(guests));
  }
  if (status !== undefined) {
    await page.locator("#status").selectOption(status);
  }
  await pickDate(page, "Select check-in", checkInDay);
  await pickDate(page, "Select check-out", checkOutDay);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Stayo — Booking Manager", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Initial State ──────────────────────────────────────────────────────────

  test.describe("Initial state", () => {
    test("renders the app header with the Stayo logo", async ({ page }) => {
      await expect(page.getByText("Stayo")).toBeVisible();
    });

    test("renders the New Booking button", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "New Booking" }),
      ).toBeVisible();
    });

    test("shows the existing mock bookings on load", async ({ page }) => {
      await expect(
        page.locator('[data-testid^="booking-card-"]').first(),
      ).toBeVisible();
    });

    test("shows All Bookings as the default page title", async ({ page }) => {
      await expect(page.getByText("All Bookings")).toBeVisible();
    });
  });

  // ── Create Booking ─────────────────────────────────────────────────────────

  test.describe("Create booking", () => {
    test("opens the create modal when New Booking is clicked", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "New Booking" }),
      ).toBeVisible();
    });

    test("shows validation errors when submitting an empty form", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await page.getByRole("button", { name: "Create Booking" }).click();
      await expect(page.getByText(/Name must be at least/)).toBeVisible();
    });

    test("shows an email validation error for invalid input", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await page.locator("#guestName").fill("Jane Smith");
      await page.locator("#guestEmail").fill("not-an-email");
      await page.getByRole("button", { name: "Create Booking" }).click();
      await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test("creates a booking with valid data and shows success toast", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await fillBookingForm(page);
      await page.getByRole("button", { name: "Create Booking" }).click();
      await expect(
        page.getByText("Booking created successfully"),
      ).toBeVisible();
    });

    test("closes the modal after successful creation", async ({ page }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await fillBookingForm(page);
      await page.getByRole("button", { name: "Create Booking" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("closes the modal when Cancel is clicked", async ({ page }) => {
      await page.getByRole("button", { name: "New Booking" }).click();
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  // ── View Booking ───────────────────────────────────────────────────────────

  test.describe("View booking", () => {
    test("opens the view modal when View is clicked", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "View" })
        .click();
      await expect(page.getByText("Booking Details")).toBeVisible();
    });

    test("displays guest information in the view modal", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "View" })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Guest" })).toBeVisible();
      await expect(dialog.getByText("Check-in", { exact: true })).toBeVisible();
      // Label is "Check-out (N nights)" — use partial match
      await expect(dialog.getByText(/Check-out/)).toBeVisible();
    });

    test("closes the view modal when Escape is pressed", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "View" })
        .click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  // ── Edit Booking ───────────────────────────────────────────────────────────

  test.describe("Edit booking", () => {
    test("opens the edit modal when Edit is clicked", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "Edit" })
        .click();
      await expect(page.getByText("Edit Booking")).toBeVisible();
    });

    test("pre-fills the form with existing booking data", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "Edit" })
        .click();
      const nameValue = await page.locator("#guestName").inputValue();
      const emailValue = await page.locator("#guestEmail").inputValue();
      expect(nameValue).not.toBe("");
      expect(emailValue).not.toBe("");
    });

    test("shows success toast after saving changes", async ({ page }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "Edit" })
        .click();
      await page.locator("#guestName").fill("Updated Name");
      await page.getByRole("button", { name: "Save Changes" }).click();
      await expect(
        page.getByText("Booking updated successfully"),
      ).toBeVisible();
    });
  });

  // ── Delete Booking ─────────────────────────────────────────────────────────

  test.describe("Delete booking", () => {
    test("shows confirmation prompt when Delete is clicked", async ({
      page,
    }) => {
      await page
        .locator('[data-testid^="booking-card-"]')
        .first()
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(page.getByText("Delete this booking?")).toBeVisible();
    });

    test("does not delete when No is clicked", async ({ page }) => {
      const initialCount = await page
        .locator('[data-testid^="booking-card-"]')
        .count();
      const firstCard = page.locator('[data-testid^="booking-card-"]').first();
      await firstCard.getByRole("button", { name: "Delete" }).click();
      await firstCard.getByRole("button", { name: "No" }).click();
      await expect(
        page.locator('[data-testid^="booking-card-"]'),
      ).toHaveCount(initialCount);
    });

    test("deletes the booking after confirmation", async ({ page }) => {
      const initialCount = await page
        .locator('[data-testid^="booking-card-"]')
        .count();
      const firstCard = page.locator('[data-testid^="booking-card-"]').first();
      await firstCard.getByRole("button", { name: "Delete" }).click();
      await firstCard.getByRole("button", { name: "Yes, delete" }).click();
      await expect(page.getByText(/Booking deleted/)).toBeVisible();
      await expect(
        page.locator('[data-testid^="booking-card-"]'),
      ).toHaveCount(initialCount - 1);
    });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test.describe("Search", () => {
    test("filters bookings by guest name", async ({ page }) => {
      await page
        .getByRole("searchbox", { name: "Search bookings" })
        .fill("Alice");
      // Debounce: wait for filter to apply
      await page.waitForTimeout(400);
      const cards = page.locator('[data-testid^="booking-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).toContainText("Alice");
      }
    });

    test("shows empty state when no results match", async ({ page }) => {
      await page
        .getByRole("searchbox", { name: "Search bookings" })
        .fill("zzznoresults999");
      await page.waitForTimeout(400);
      await expect(page.getByText("No bookings found")).toBeVisible();
    });

    test("restores all bookings when search is cleared", async ({ page }) => {
      const initialCount = await page
        .locator('[data-testid^="booking-card-"]')
        .count();
      const search = page.getByRole("searchbox", { name: "Search bookings" });
      await search.fill("Alice");
      await page.waitForTimeout(400);
      await search.clear();
      await page.waitForTimeout(400);
      await expect(
        page.locator('[data-testid^="booking-card-"]'),
      ).toHaveCount(initialCount);
    });
  });

  // ── Property Filter ────────────────────────────────────────────────────────

  test.describe("Property filter", () => {
    test("filters bookings when a property is selected", async ({ page }) => {
      await page
        .getByRole("combobox", { name: "Filter by property" })
        .selectOption({ index: 1 });
      await expect(
        page.locator('[data-testid^="booking-card-"]').first(),
      ).toBeVisible();
    });

    test("shows all bookings when All Properties is selected", async ({
      page,
    }) => {
      const select = page.getByRole("combobox", {
        name: "Filter by property",
      });
      await select.selectOption({ index: 1 });
      await select.selectOption("");
      await expect(
        page.locator('[data-testid^="booking-card-"]').first(),
      ).toBeVisible();
    });

    test("updates the page title when a property is selected", async ({
      page,
    }) => {
      await page
        .getByRole("combobox", { name: "Filter by property" })
        .selectOption({ index: 1 });
      await expect(page.getByText("All Bookings")).not.toBeVisible();
    });
  });

  // ── Overlap Prevention ─────────────────────────────────────────────────────

  test.describe("Overlap prevention", () => {
    test("prevents creating a booking that overlaps with an existing one", async ({
      page,
    }) => {
      // Mock booking book-001: prop-001, 2027-07-01 → 2027-07-06
      // Navigate the datepicker to July 2027 and pick overlapping days (3–8)
      await page.getByRole("button", { name: "New Booking" }).click();

      await page.locator("#guestName").fill("Overlap Test");
      await page.locator("#guestEmail").fill("overlap@example.com");
      await page
        .locator("#propertyId")
        .selectOption(
          "Oceanfront Villa — Malibu, California ($450/night)",
        );

      // Open check-in calendar and navigate to July 2027
      await page
        .locator(
          `.react-datepicker__input-container input[placeholder="Select check-in"]`,
        )
        .click();

      // Navigate forward to June 2027 — withPortal renders inside .react-datepicker__portal
      // Strategy: pick Jun 29 → Jul 7 (both endpoints are free but range overlaps Jul 1–6)
      for (let i = 0; i < 24; i++) {
        const header = page
          .locator(".react-datepicker__portal .react-datepicker__current-month")
          .first();
        const headerText = await header.textContent();
        if (headerText?.includes("June 2027")) break;
        await page
          .locator(
            ".react-datepicker__portal .react-datepicker__navigation--next",
          )
          .first()
          .click();
      }

      // Click day 29 — June 29 is not in any booked range (book-001 starts Jul 1)
      await page
        .locator(
          `.react-datepicker__portal .react-datepicker__day--029:not(.react-datepicker__day--outside-month)`,
        )
        .first()
        .click();

      // Open check-out calendar and navigate to July 2027
      await page
        .locator(
          `.react-datepicker__input-container input[placeholder="Select check-out"]`,
        )
        .click();

      for (let i = 0; i < 24; i++) {
        const header = page
          .locator(".react-datepicker__portal .react-datepicker__current-month")
          .first();
        const headerText = await header.textContent();
        if (headerText?.includes("July 2027")) break;
        await page
          .locator(
            ".react-datepicker__portal .react-datepicker__navigation--next",
          )
          .first()
          .click();
      }

      // Click day 7 — Jul 7 is free (book-001 ends Jul 6, book-002 starts Jul 15)
      await page
        .locator(
          `.react-datepicker__portal .react-datepicker__day--007:not(.react-datepicker__day--outside-month)`,
        )
        .first()
        .click();

      await page.getByRole("button", { name: "Create Booking" }).click();
      // Both date fields show the overlap error — check the first occurrence
      await expect(page.getByText(/overlap/i).first()).toBeVisible();
    });
  });
});
