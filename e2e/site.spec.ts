import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const assertAccessible = async (page: Page): Promise<void> => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join("\n"),
  ).toEqual([]);
};

const attachPage = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> => {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
};

test("landing content, theme, accessibility, and desktop visuals", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Beautiful components for foldkit.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse Components" }),
  ).toHaveAttribute("href", "/docs/components/accordion");
  await expect(page.getByText("registry available")).toBeVisible();
  await expect(page.getByText("65", { exact: true })).toBeVisible();
  await expect(page.getByText("70", { exact: true })).toBeVisible();
  await expect(page.getByText("16", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Source revision/u }),
  ).toBeVisible();
  await assertAccessible(page);
  await attachPage(page, testInfo, "landing-light-desktop");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await expect(
    page.getByRole("button", { name: "Switch to light mode" }),
  ).toBeVisible();
  await attachPage(page, testInfo, "landing-dark-desktop");
});

test("landing remains contained and navigable on mobile", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("link", { name: "Browse Components" }),
  ).toBeVisible();
  await attachPage(page, testInfo, "landing-light-mobile");
});

test("StyleX full catalog preserves Foldkit state, coverage, theme parity, and accessibility", async ({
  page,
}, testInfo) => {
  await page.goto("/stylex");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Same Foldkit architecture. Tighter styling grammar.",
    }),
  ).toBeVisible();

  const tailwindInput = page.locator("#tailwind-email");
  const stylexInput = page.locator("#stylex-email");
  await tailwindInput.fill("foldkit@crease.dev");
  await expect(stylexInput).toHaveValue("foldkit@crease.dev");

  const catalogEntries = page.locator("[data-stylex-component]");
  await expect(catalogEntries).toHaveCount(65);
  await expect(page.getByText("Showing 65 of 65 components")).toBeVisible();
  const catalogFilter = page.getByRole("searchbox", {
    name: "Filter StyleX components",
  });
  await catalogFilter.fill("tooltip");
  await expect(catalogEntries).toHaveCount(1);
  await expect(catalogEntries).toHaveAttribute(
    "data-stylex-component",
    "tooltip",
  );
  await catalogFilter.fill("");
  await expect(catalogEntries).toHaveCount(65);

  await assertAccessible(page);
  await attachPage(page, testInfo, "stylex-comparison-light");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await attachPage(page, testInfo, "stylex-comparison-dark");

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("production component examples keep readable source and valid Unicode", async ({
  page,
}) => {
  for (const route of ["button", "dialog", "typography"]) {
    await page.goto(`/docs/components/${route}`);
    const text = await page.locator("main").innerText();

    expect(text).not.toMatch(/(?:Ã.|Â.|â.|ð.|Ø.|Ù.|ï.)/u);
    expect(text).not.toMatch(/const preview = \([a-z],[a-z]\)=>/u);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: new RegExp(`^${route}$`, "iu"),
      }),
    ).toBeVisible();
  }
});

test("component APIs and machine-readable discovery stay available", async ({
  page,
}) => {
  await page.goto("/docs/components/dialog");
  const api = page.locator("#api-reference");
  await expect(api.getByRole("table")).toBeVisible();
  await expect(
    api.getByRole("cell", { name: "dialog", exact: true }),
  ).toBeVisible();
  await expect(api).toContainText("DialogProps");

  const index = await page.request.get("/docs-index.json");
  expect(index.ok()).toBe(true);
  const metadata = (await index.json()) as { componentCount: number };
  expect(metadata.componentCount).toBe(65);

  const llms = await page.request.get("/llms.txt");
  expect(await llms.text()).toContain("/docs/components/dialog");
});

test("create preset shuffle updates executable output", async ({ page }) => {
  await page.goto("/create");
  const token = page.getByText(/^--preset b/u);
  const before = await token.textContent();
  const board = page.locator('[data-slot="capture-target"]');
  const styleBefore = await board.getAttribute("data-crease-style");

  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(token).not.toHaveText(before ?? "");
  await expect(board).not.toHaveAttribute(
    "data-crease-style",
    styleBefore ?? "",
  );
  await expect(
    page.getByRole("button", { name: "Copy Registry JSON" }),
  ).toBeVisible();
});

test("Tailwind and StyleX create boards keep distinct routes and equivalent preset controls", async ({
  page,
}) => {
  await page.goto("/create");
  await expect(page).toHaveURL(/\/create$/u);
  await expect(page.locator('[data-slot="capture-target"]')).toBeVisible();

  await page.getByRole("link", { name: "Create StyleX", exact: true }).click();
  await expect(page).toHaveURL(/\/create-stylex$/u);

  const board = page.locator('[data-slot="capture-target"]');
  const token = page.getByText(/^--preset b/u);
  await expect(board).toBeVisible();
  await expect(token).toBeVisible();

  await page.getByText("Open Preset", { exact: true }).click();
  await page.getByRole("textbox", { name: "Open preset" }).fill("b1");
  await page.getByRole("button", { name: "Apply Preset" }).click();
  await expect(token).toHaveText("--preset b1");

  const applied = await token.textContent();
  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(token).not.toHaveText(applied ?? "");
  await expect(
    page.getByRole("button", { name: "Copy Registry JSON" }),
  ).toBeVisible();
});

test("constrained primitives preserve the StyleX create board geometry", async ({
  page,
}) => {
  test.slow();
  const boardMetrics = async () =>
    page.locator('[data-slot="capture-target"]').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const grid = element.querySelector('[data-primitive-board-grid]') ?? element;
      const style = getComputedStyle(grid);
      const rootStyle = getComputedStyle(element);
      return {
        childCount: grid.children.length,
        columns: style.gridTemplateColumns,
        gap: style.gap,
        padding: rootStyle.padding,
        width: bounds.width,
        x: bounds.x,
        y: bounds.y,
      };
    });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/create-stylex");
  const baseline = await boardMetrics();

  await page.goto("/create-constrained");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("Contribution History", { exact: true })).toBeVisible();
  expect(await boardMetrics()).toEqual(baseline);
});

test("primitive inspector updates every constrained primitive", async ({ page }) => {
  test.slow();
  await page.goto("/create-constrained");
  const board = page.locator('[data-primitive-box]');
  await expect(board).toBeVisible();

  const choice = (group: string, name: string) =>
    page
      .getByRole("group", { name: `${group} options` })
      .getByRole("button", { name, exact: true });

  await choice("Canvas padding (Box)", "xl").click();
  await expect(choice("Canvas padding (Box)", "xl")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(board).toHaveCSS("padding", "40px");

  const mutedBackground = await board.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await choice("Canvas surface (Box)", "card").click();
  await expect
    .poll(() =>
      board.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(mutedBackground);

  await choice("Card spacing (Stack)", "xl").click();
  await expect(page.locator('[data-primitive-stack]').first()).toHaveCSS(
    "gap",
    "40px",
  );

  await choice("Board alignment (Inline)", "end").click();
  await expect(page.locator('[data-primitive-inline]')).toHaveCSS(
    "justify-content",
    "flex-end",
  );

  await choice("Split layout (Grid)", "one").click();
  await expect(page.locator('[data-primitive-grid]').first()).toHaveCSS(
    "grid-template-columns",
    /^\d+(?:\.\d+)?px$/u,
  );

  await choice("Board text scale (Text)", "heading Md").click();
  await expect(page.locator('[data-primitive-text]')).toHaveCSS(
    "font-size",
    "20px",
  );
});

test("component docs explain the Foldkit integration model", async ({
  page,
}) => {
  await page.goto("/docs/components/button");
  await expect(
    page.getByText("Stateless helper", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#architecture")).toContainText("no child Model");
  await expect(page.locator("#keyboard-interaction")).toContainText("Enter");
  await page.locator("#basic label").click();
  await expect(page.locator("#basic code")).toContainText("// MODEL");
  await expect(page.locator("#basic code")).toContainText(
    "Runtime.makeApplication",
  );

  await page.goto("/docs/components/dialog");
  await expect(
    page.getByText("Stateful submodel", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#architecture")).toContainText("child submodel");
  await expect(page.locator("#accessibility")).toContainText(
    "focus restoration",
  );

  await page.goto("/docs/components/toast");
  await expect(
    page.getByText("Composed recipe", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#usage")).toContainText("Toast.show");
  await expect(page.locator("#usage")).toContainText("Toast.toast");
  await expect(page.locator("#api-reference")).toContainText("DismissedToast");
  await expect(
    page
      .locator("#api-reference")
      .getByRole("columnheader", { name: "Purpose" }),
  ).toBeVisible();
});

test("Foldkit-native documentation remains contained on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/components/toast");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByText("Browse components")).toBeVisible();
  await expect(page.locator("#architecture")).toBeVisible();
});

test("authored helper pages publish complete application source", async ({
  page,
}) => {
  test.setTimeout(180_000);

  for (const route of [
    "accordion",
    "alert",
    "alert-dialog",
    "aspect-ratio",
    "attachment",
    "avatar",
    "badge",
    "breadcrumb",
    "bubble",
    "button",
    "button-group",
    "card",
    "carousel",
    "checkbox",
    "collapsible",
    "combobox",
    "command",
    "context-menu",
    "direction",
    "dialog",
    "drawer",
    "dropdown-menu",
    "empty",
    "field",
    "form",
    "hover-card",
    "item",
    "input",
    "input-group",
    "input-otp",
    "kbd",
    "label",
    "marker",
    "message",
    "message-scroller",
    "menubar",
    "native-select",
    "navigation-menu",
    "pagination",
    "popover",
    "progress",
    "radio-group",
    "resizable",
    "scroll-area",
    "separator",
    "select",
    "sheet",
    "sidebar",
    "skeleton",
    "slider",
    "spinner",
    "sonner",
    "switch",
    "tabs",
    "table",
    "textarea",
    "toggle",
    "toast",
    "toggle-group",
    "tooltip",
    "typography",
  ]) {
    await page.goto(`/docs/components/${route}`);
    await expect(
      page.getByText(/^(Stateless helper|Stateful submodel|Composed recipe)$/u),
    ).toBeVisible();
    await expect(
      page
        .locator("main code")
        .filter({ hasText: "Runtime.makeApplication" })
        .first(),
    ).toBeAttached();
  }
});

test("authored form connects controlled input help and validation", async ({
  page,
}) => {
  await page.goto("/docs/components/form");

  const input = page.locator("#docs-form-error");
  await expect(input).toHaveAttribute(
    "aria-describedby",
    "docs-form-error-description docs-form-error-message",
  );
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#docs-form-error-message")).toHaveText(
    "Enter a valid email address.",
  );
});

test("avatar delegates image lifecycle into its documented child model", async ({
  page,
}) => {
  await page.goto("/docs/components/avatar");

  const example = page.locator("#image-lifecycle");
  const image = example.getByRole("img", { name: "Ada Lovelace" });
  await expect(image).toBeVisible();
  await expect(image).not.toHaveAttribute("data-loading", "");
  await expect(example.locator('[data-slot="avatar-fallback"]')).toHaveCount(0);
});

test("authored tabs keep child instances and selected values independent", async ({
  page,
}) => {
  await page.goto("/docs/components/tabs");

  const settings = page.locator("#settings");
  const line = page.locator("#line-variant");
  await settings.getByRole("tab", { name: "Security" }).click();
  await expect(settings.getByRole("tabpanel")).toHaveText(
    "Review passwords and sessions.",
  );
  await expect(line.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await line.getByRole("tab", { name: "Deployments" }).click();
  await expect(line.getByRole("tabpanel")).toHaveText(
    "Recent production releases.",
  );
  await expect(settings.getByRole("tab", { name: "Security" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const manual = page.locator("#manual-with-disabled-tab");
  const accountTab = manual.getByRole("tab", { name: "Account" });
  const billingTab = manual.getByRole("tab", { name: "Billing" });
  await expect(manual.getByRole("tab", { name: "Security" })).toBeDisabled();
  await accountTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(billingTab).toBeFocused();
  await expect(accountTab).toHaveAttribute("aria-selected", "true");
  await expect(billingTab).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Enter");
  await expect(billingTab).toHaveAttribute("aria-selected", "true");
  const panelId = await billingTab.getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  await expect(manual.locator(`#${panelId}`)).toHaveText(/invoices/u);

  const rtl = page.locator("#rtl-route-value");
  const rtlTabs = rtl.locator('[data-slot="tabs"]');
  await expect(rtlTabs).toHaveAttribute("dir", "rtl");
  const rtlSettings = rtl.getByRole("tab", { name: "Settings" });
  await rtlSettings.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rtl.getByRole("tab", { name: "Deployments" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("authored slider delegates keyboard changes and stores its output value", async ({
  page,
}) => {
  await page.goto("/docs/components/slider");

  const example = page.locator("#controlled-volume");
  const slider = example.getByRole("slider", { name: "Volume" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "51");
  await expect(slider).toHaveAttribute("aria-valuetext", "51 percent");
  await expect(example).toContainText("Current value: 51");

  const track = example.locator('[data-slot="slider-track"]');
  const box = await track.boundingBox();
  const thumbBox = await slider.boundingBox();
  expect(box).not.toBeNull();
  expect(thumbBox).not.toBeNull();
  if (box !== null && thumbBox !== null) {
    await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await expect(slider).not.toHaveAttribute("aria-valuenow", "51");
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(slider).toHaveAttribute("aria-valuenow", "51");
  }

  const readOnly = page
    .locator("#read-only-value")
    .getByRole("slider", { name: "Managed volume" });
  await expect(readOnly).toHaveAttribute("aria-readonly", "true");
  await readOnly.focus();
  await page.keyboard.press("ArrowRight");
  await expect(readOnly).toHaveAttribute("aria-valuenow", "65");

  const rtlRange = page.locator("#rtl-price-range");
  const minimum = rtlRange.getByRole("slider", { name: "Minimum price" });
  const maximum = rtlRange.getByRole("slider", { name: "Maximum price" });
  await expect(minimum).toHaveAttribute("aria-valuetext", "$25");
  await minimum.focus();
  await page.keyboard.press("End");
  await expect(minimum).toHaveValue("75");
  await expect(maximum).toHaveValue("75");

  const verticalMinimum = page
    .locator("#vertical-range")
    .getByRole("slider", { name: "Minimum price" });
  await verticalMinimum.focus();
  await page.keyboard.press("ArrowUp");
  await expect(verticalMinimum).toHaveValue("26");

  const normalized = page
    .locator("#normalized-bounds")
    .getByRole("slider", { name: "Minimum price" });
  await expect(normalized).toHaveAttribute("min", "0");
  await expect(normalized).toHaveAttribute("max", "100");
  await expect(normalized).toHaveAttribute("step", "1");
});

test("authored resizable instances keep axis-specific child state independent", async ({
  page,
}) => {
  await page.goto("/docs/components/resizable");

  const horizontal = page.locator("#editor-and-preview").getByRole("separator");
  const vertical = page.locator("#vertical-split").getByRole("separator");
  await horizontal.focus();
  await page.keyboard.press("ArrowRight");
  await expect(horizontal).toHaveAttribute("aria-valuenow", "52");
  await expect(vertical).toHaveAttribute("aria-valuenow", "40");

  await vertical.focus();
  await page.keyboard.press("ArrowDown");
  await expect(vertical).toHaveAttribute("aria-valuenow", "42");
  await expect(horizontal).toHaveAttribute("aria-valuenow", "52");
});

test("authored carousels synchronize Embla selections without sharing state", async ({
  page,
}) => {
  await page.goto("/docs/components/carousel");

  const single = page.locator("#single-slide");
  const compact = page.locator("#two-at-a-time");
  await single.getByRole("button", { name: "Next slide" }).click();
  await expect(single).toContainText("Slide 2 of 3");
  await expect(compact).toContainText("Snap 1");

  await compact.getByRole("button", { name: "Next slide" }).click();
  await expect(compact).toContainText("Snap 2");
  await expect(single).toContainText("Slide 2 of 3");
});

test("create icon selection changes the live preview shapes", async ({
  page,
}) => {
  await page.goto("/create");
  const board = page.locator('[data-slot="capture-target"]');
  const firstPreviewIcon = board.locator(".crease-preview-icon").first();

  await expect(board).toHaveAttribute("data-icon-library", "lucide");
  await expect(firstPreviewIcon).toHaveCSS("width", "16px");
  await expect(firstPreviewIcon).toHaveCSS("height", "16px");
  await expect(
    firstPreviewIcon.locator(".crease-preview-icon-lucide"),
  ).toBeVisible();
  await expect(
    firstPreviewIcon.locator(".crease-preview-icon-tabler"),
  ).toBeHidden();

  await page.getByRole("button", { name: /Icons\s+Lucide/u }).click();
  await page
    .getByRole("button", { name: "Tabler", exact: true })
    .click({ force: true });

  await expect(board).toHaveAttribute("data-icon-library", "tabler");
  await expect(
    firstPreviewIcon.locator(".crease-preview-icon-lucide"),
  ).toBeHidden();
  await expect(
    firstPreviewIcon.locator(".crease-preview-icon-tabler"),
  ).toBeVisible();
});

test("dialog traps focus, closes with Escape, and restores its trigger", async ({
  page,
}) => {
  await page.goto("/docs/components/dialog");
  const example = page.locator("#edit-profile");
  const trigger = example.getByRole("button", { name: "Open profile" });

  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("id", "docs-dialog-0");
  await expect(dialog).toHaveAttribute(
    "aria-labelledby",
    "docs-dialog-0-dialog-title",
  );
  await expect(dialog).toHaveAttribute(
    "aria-describedby",
    "docs-dialog-0-dialog-description",
  );
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expect(dialog.locator('[data-slot="dialog-header"]')).toBeVisible();
  await expect(dialog.locator('[data-slot="dialog-title"]')).toHaveText(
    "Edit profile",
  );
  await expect(dialog.locator('[data-slot="dialog-footer"]')).toBeVisible();
  await expect(example.locator("code")).toContainText("Dialog.open");

  await page.keyboard.press("Tab");
  await expect(dialog).toContainText("Save");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.locator(":scope > div").first().click({ position: { x: 2, y: 2 } });
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  const compactExample = page.locator("#compact-confirmation");
  const compactTrigger = compactExample.getByRole("button", {
    name: "Review change",
  });
  await compactTrigger.click();
  const compactDialog = page.getByRole("dialog");
  await expect(compactDialog).toHaveAttribute("id", "docs-dialog-1");
  await expect(compactDialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(compactTrigger).toBeFocused();
});

test("alert dialog emits decisions and keeps async consequences parent owned", async ({
  page,
}) => {
  await page.goto("/docs/components/alert-dialog");

  const example = page.locator("#async-deletion");
  const trigger = example.getByRole("button", {
    name: "Delete project",
    exact: true,
  });
  await trigger.click();
  const alertDialog = page.getByRole("alertdialog");
  await expect(alertDialog).toBeVisible();
  await expect(alertDialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.locator('[data-slot="alert-dialog-overlay"]').click({ position: { x: 5, y: 5 } });
  await expect(alertDialog).toBeVisible();
  const confirm = alertDialog.getByRole("button", {
    name: "Delete project",
    exact: true,
  });
  await confirm.click();
  await expect(alertDialog.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  await expect(alertDialog).toBeHidden();
  await expect(example.getByRole("status")).toHaveText("Project deleted.");
  await expect(trigger).toBeFocused();

  const compact = page.locator("#compact-decision");
  const compactTrigger = compact.getByRole("button", { name: "Leave workspace", exact: true });
  await compactTrigger.click();
  const compactDialog = page.getByRole("alertdialog");
  await expect(compactDialog.getByRole("button", { name: "Stay" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(compactDialog).toBeHidden();
  await expect(compact.getByRole("status")).toHaveText("No action taken.");
  await expect(compactTrigger).toBeFocused();
});

test("sheet compound parts preserve focus and accessible structure", async ({
  page,
}) => {
  await page.goto("/docs/components/sheet");
  const example = page.locator("#compound-layout");
  const trigger = example.getByRole("button", { name: "Open right sheet" });

  await trigger.click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expect(sheet.locator('[data-slot="sheet-header"]')).toBeVisible();
  await expect(sheet.locator('[data-slot="sheet-title"]')).toHaveText(
    "Edit profile",
  );
  await expect(sheet.locator('[data-slot="sheet-footer"]')).toBeVisible();
  await expect(example.locator("code")).toContainText("Sheet.open");

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("drawer documents its child model and preserves modal focus behavior", async ({
  page,
}) => {
  await page.goto("/docs/components/drawer");
  const example = page.locator("#activity-goal");
  const trigger = example.getByRole("button", { name: "Open bottom drawer" });

  await trigger.click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('[data-slot="drawer-handle"]')).toBeVisible();
  await expect(drawer.locator('[data-slot="drawer-title"]')).toHaveText(
    "Move goal",
  );
  await expect(example.locator("code")).toContainText("Drawer.update");
  await expect(example.locator("code")).toContainText("Command.mapMessages");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("popover delegates disclosure commands and restores trigger focus", async ({
  page,
}) => {
  await page.goto("/docs/components/popover");
  const example = page.locator("#interactive-content");
  const trigger = example.getByRole("button", { name: "Open dimensions" });
  await trigger.click();
  // Foldkit's anchor layer portals positioned content outside the example article.
  const panel = page.locator('[data-slot="popover-content"]');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute("id", "docs-popover-0-button");
  await expect(trigger).toHaveAttribute("aria-controls", "docs-popover-0-panel");
  await expect(panel).toHaveAttribute("id", "docs-popover-0-panel");
  await expect(panel).toContainText("Set the dimensions");
  const panelBox = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(0);
  expect(panelBox!.y).toBeGreaterThanOrEqual(0);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(viewport!.height);
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS("transition-property", "none");
  await page.locator('[data-slot="popover-backdrop"]').click({
    position: { x: 2, y: viewport!.height - 2 },
  });
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("drawer handle supports mouse cancellation and touch threshold dismissal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/drawer");
  const example = page.locator("#activity-goal");
  const trigger = example.getByRole("button", { name: "Open bottom drawer" });
  await trigger.click();

  const drawer = page.getByRole("dialog");
  const root = example.locator('[data-slot="drawer-root"]');
  const panel = drawer.locator('[data-slot="drawer-content"]');
  let handle = drawer.locator('[data-slot="drawer-handle"]');
  await expect(panel).toHaveCSS("transition-property", "none");

  await handle.dispatchEvent("pointerdown", { pointerType: "mouse", button: 0, screenX: 100, screenY: 100 });
  handle = drawer.locator('[data-slot="drawer-handle"]');
  await expect(handle).toHaveAttribute("data-drag-phase", "Dragging");
  await root.dispatchEvent("pointermove", { pointerType: "mouse", screenX: 100, screenY: 150 });
  await root.dispatchEvent("pointerleave", { pointerType: "mouse" });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('[data-slot="drawer-handle"]')).toHaveAttribute("data-drag-phase", "Idle");

  handle = drawer.locator('[data-slot="drawer-handle"]');
  await handle.dispatchEvent("pointerdown", { pointerType: "touch", button: 0, screenX: 100, screenY: 100 });
  await root.dispatchEvent("pointermove", { pointerType: "touch", screenX: 100, screenY: 240 });
  await root.dispatchEvent("pointerup", { pointerType: "touch", screenX: 100, screenY: 240 });
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("sheet renders every edge from view input with Dialog focus behavior", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/sheet");

  for (const [id, side] of [["compound-layout", "right"], ["bottom-task", "bottom"], ["top-sheet", "top"], ["left-sheet", "left"]] as const) {
    const example = page.locator(`#${id}`);
    const trigger = example.getByRole("button", { name: `Open ${side} sheet` });
    await trigger.click();
    const sheet = page.getByRole("dialog");
    const panel = sheet.locator('[data-slot="sheet-content"]');
    await expect(panel).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Cancel" })).toBeFocused();
    await expect(panel).toHaveCSS("transition-property", "none");
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("hover card is available to keyboard focus and closes after blur", async ({
  page,
}) => {
  await page.goto("/docs/components/hover-card");
  const example = page.locator("#profile-preview");
  const trigger = example.getByRole("button", {
    name: "Preview the Foldkit profile",
  });
  const panel = example.locator('[data-slot="hover-card-content"]');
  await trigger.focus();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(example.locator("code")).toContainText("closeDelay");
  await expect(example.locator("code")).toContainText("showDelay");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole("link", { name: "crease/ui" }).focus();
  await expect(panel).toBeHidden({ timeout: 2_000 });
});

test("hover card survives pointer crossing and supports touch fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/hover-card");
  const example = page.locator("#profile-preview");
  const trigger = example.getByRole("button", { name: "Preview the Foldkit profile" });
  const panel = example.locator('[data-slot="hover-card-content"]');

  await trigger.hover();
  await expect(panel).toBeVisible();
  await panel.hover();
  await page.waitForTimeout(200);
  await expect(panel).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(panel).toBeHidden({ timeout: 2_000 });

  await trigger.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true })));
  await expect(panel).toBeVisible();
});

test("tooltip opens from keyboard focus and dismisses without moving focus", async ({
  page,
}) => {
  await page.goto("/docs/components/tooltip");
  const example = page.locator("#delayed-label");
  const trigger = example.getByRole("button", { name: "Add item to library" });
  await trigger.focus();
  const panel = page.locator('[data-slot="tooltip-content"]');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveText(/Add to library/u);
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("select persists a typed OutMessage selection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/select");
  const example = page.locator("#typed-selection");
  const trigger = example.getByRole("button", { name: "Fruit" });
  const controls = await trigger.getAttribute("aria-controls");
  expect(controls).toBeTruthy();
  await trigger.click();
  const listbox = page.locator(`#${controls}`);
  await expect(listbox).toBeVisible();
  await expect(listbox).toHaveAttribute("role", "listbox");
  await expect(listbox).toHaveCSS("transition-property", "none");
  await page.getByRole("option", { name: "Banana" }).click();
  await expect(trigger).toContainText("Banana");
  await expect(listbox).toBeHidden();
  await expect(example.locator('input[type="hidden"][name="fruit"]')).toHaveValue(
    "banana",
  );
  await expect(example.locator("code")).toContainText("maybeSelection");
  await expect(example.locator("code")).toContainText(
    "selection._tag === 'Selected'",
  );

  const disabledExample = page.locator("#disabled-option");
  const disabledTrigger = disabledExample.getByRole("button", { name: "Fruit" });
  await disabledTrigger.click();
  const disabledOption = page.getByRole("option", { name: "Banana" });
  await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  await disabledOption.click({ force: true });
  await expect(disabledTrigger).toContainText("Apple");

  await page.keyboard.press("Escape");
  const readOnlyExample = page.locator("#read-only-rtl");
  const readOnlyTrigger = readOnlyExample.getByRole("button", { name: "Fruit" });
  await expect(readOnlyExample.locator('[data-slot="select"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
  await readOnlyTrigger.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(readOnlyTrigger).toContainText("Apple");
});

test("tooltip rejects stale hover timers and pointer-induced touch focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/tooltip");
  const example = page.locator("#delayed-label");
  const trigger = example.getByRole("button", { name: "Add item to library" });
  const panel = page.locator('[data-slot="tooltip-content"]');

  await trigger.hover();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  await expect(panel).toBeHidden();

  await trigger.evaluate((element) => {
    element.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    element.focus();
  });
  await expect(panel).toBeHidden();
  await expect(example.locator("code")).toContainText("closeDelay");

  const disabled = page.locator("#disabled-trigger").getByRole("button", {
    name: "Unavailable action",
  });
  await expect(disabled).toBeDisabled();
  await disabled.hover();
  await page.waitForTimeout(500);
  await expect(panel).toBeHidden();
});

test("combobox filters items and persists its typed selection output", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/combobox");
  const example = page.locator("#framework-search");
  const input = example.getByRole("combobox", { name: "Framework" });
  await input.fill("sve");
  await page.keyboard.press("ArrowDown");
  const activeDescendant = await input.getAttribute("aria-activedescendant");
  expect(activeDescendant).toBeTruthy();
  await expect(page.locator(`#${activeDescendant}`)).toHaveText(/SvelteKit/u);
  const option = page.getByRole("option", { name: "SvelteKit" });
  await expect(option).toBeVisible();
  await expect(page.getByRole("listbox")).toHaveCSS("transition-property", "none");
  await option.click();
  await expect(input).toHaveValue("SvelteKit");
  await expect(example.locator('input[type="hidden"][name="framework"]')).toHaveValue(
    "svelte",
  );
  await expect(example.locator("code")).toContainText("maybeSelection");

  const emptyExample = page.locator("#no-results");
  await expect(emptyExample.getByRole("status")).toHaveText(/No frameworks/u);

  const readOnlyExample = page.locator("#read-only-rtl");
  const readOnlyInput = readOnlyExample.getByRole("combobox", { name: "Framework" });
  await expect(readOnlyExample.locator('[data-slot="command"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
  await expect(readOnlyInput).toHaveAttribute("readonly", "");
  await readOnlyInput.focus();
  await page.keyboard.type("nuxt");
  await expect(readOnlyInput).toHaveValue("");
});

test("command search commits a typed parent action", async ({ page }) => {
  await page.goto("/docs/components/command");
  const example = page.locator("#application-commands");
  const input = example.getByRole("combobox", { name: "Application commands" });
  await input.fill("sett");
  const option = page.getByRole("option", { name: /Settings/u });
  await expect(option).toBeVisible();
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /item/u);
  await option.click();
  await expect(input).toHaveValue("Settings");
  await expect(example.locator("code")).toContainText(
    "ApplicationCommand.update",
  );

  await expect(page.locator("#no-results").getByRole("status")).toHaveText(
    "No matching application commands.",
  );
  await expect(page.locator("#remote-loading").getByRole("status")).toHaveText(
    "Loading remote commands…",
  );
  const large = page.locator("#large-result-policy");
  const largeInput = large.getByRole("combobox", { name: "Application commands" });
  await largeInput.focus();
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(large.getByRole("status")).toContainText("Showing 2 of 3 commands");
});

test("dropdown menu exposes typed selection wiring and keyboard behavior", async ({
  page,
}) => {
  await page.goto("/docs/components/dropdown-menu");
  const example = page.locator("#account-actions");
  const trigger = example.getByRole("button", { name: "Open account menu" });
  await expect(trigger).toHaveAttribute("aria-controls", "docs-dropdown-0-content");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = example.getByRole("menu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(example.locator("code")).toContainText("maybeSelection");
  await expect(example.locator("code")).toContainText(
    "DropdownMenu.create<Action>()",
  );

  const submenuExample = page.locator("#submenu-and-disabled-action");
  const submenuTrigger = submenuExample.getByRole("button", {
    name: "Open account menu",
  });
  await submenuTrigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("s");
  const settings = submenuExample.getByRole("menuitem", { name: /Settings/u });
  await expect(settings).toHaveAttribute("data-active", "true");
  await page.keyboard.press("ArrowRight");
  const menus = submenuExample.getByRole("menu");
  await expect(menus).toHaveCount(2);
  await expect(
    submenuExample.getByRole("menuitem", { name: "Billing" }).last(),
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await expect(menus).toHaveCount(0);
  await expect(submenuTrigger).toBeFocused();

  const rtlExample = page.locator("#rtl-submenu");
  const rtlTrigger = rtlExample.getByRole("button", { name: "Open account menu" });
  await expect(rtlExample.locator('[data-slot="dropdown-menu"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
  await rtlTrigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("s");
  await page.keyboard.press("ArrowLeft");
  await expect(rtlExample.getByRole("menu")).toHaveCount(2);
});

test("context menu anchors at the secondary-click target and skips disabled items", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto("/docs/components/context-menu");
  const example = page.locator("#browser-actions");
  const target = example.getByRole("button", { name: "Right click here" });
  await target.click({ button: "right", position: { x: 10, y: 20 } });
  const menu = example.getByRole("menu");
  await expect(menu).toBeVisible();
  const firstX = (await menu.boundingBox())?.x ?? 0;
  await expect(menu.getByRole("menuitem", { name: "Forward" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(example.locator("code")).toContainText(
    "ContextMenu.create<Action>()",
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await target.click({ button: "right", position: { x: 270, y: 120 } });
  const bounds = await menu.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.x ?? 999).toBeGreaterThan(firstX);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(356);
  expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(716);
  await page.keyboard.press("Escape");
  await target.focus();
  await page.keyboard.press("Shift+F10");
  await expect(menu).toBeVisible();
});

test("navigation menu distinguishes semantic links from stateful disclosures", async ({
  page,
}) => {
  await page.goto("/docs/components/navigation-menu");
  const linksExample = page.locator("#semantic-links");
  await expect(
    linksExample.getByRole("navigation", { name: "Primary" }),
  ).toBeVisible();
  await expect(
    linksExample.getByRole("link", { name: "Home" }),
  ).toHaveAttribute("aria-current", "page");
  await linksExample.getByRole("button", { name: "Reflect external route" }).click();
  await expect(
    linksExample.getByRole("link", { name: "Docs" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    linksExample.getByRole("link", { name: "Home" }),
  ).not.toHaveAttribute("aria-current");

  const disclosureExample = page.locator("#popover-disclosure");
  const trigger = disclosureExample.getByRole("button", { name: "Products" });
  await trigger.hover();
  const content = page.locator('[data-slot="popover-content"]');
  const analytics = content.getByRole("link", { name: "Analytics" });
  await expect(analytics).toBeVisible();
  await expect(disclosureExample.locator("code")).toContainText(
    "Popover.update",
  );
  await analytics.hover();
  await analytics.focus();
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await expect(trigger).toBeFocused();

  const responsiveList = page
    .locator("#responsive-fallback")
    .locator('[data-slot="navigation-menu-list"]');
  const viewport = page.viewportSize();
  await expect(responsiveList).toHaveCSS(
    "flex-direction",
    (viewport?.width ?? 1280) < 768 ? "column" : "row",
  );

  const overflow = page.locator("#rtl-overflow");
  const overflowNav = overflow.getByRole("navigation", { name: "Primary" });
  await expect(overflowNav).toHaveAttribute("dir", "rtl");
  await expect(overflowNav).toHaveAttribute("data-layout", "scroll");
  await expect(overflowNav).toHaveCSS("overflow-x", "auto");
});

test("menubar documents independent targeted child models", async ({
  page,
}) => {
  await page.goto("/docs/components/menubar");
  const example = page.locator("#coordinated-menus");
  const menubar = example.getByRole("menubar", { name: "Application menu" });
  await expect(menubar).toBeVisible();
  await example.getByRole("button", { name: "File" }).click();
  const menu = example.getByRole("menu", { name: "File" });
  await expect(menu).toBeVisible();
  const save = menu.getByRole("menuitem", { name: /Save/u });
  await expect(save).toContainText("⌘S");
  await expect(save).toHaveAttribute("aria-disabled", "true");
  await expect(example.locator("code")).toContainText("GotMenuMessage");
  await expect(example.locator("code")).toContainText("Menubar.update");
  const fileTrigger = example.getByRole("button", { name: "File" });
  await fileTrigger.focus();
  await page.keyboard.press("ArrowRight");
  const editTrigger = example.getByRole("button", { name: "Edit" });
  await expect(editTrigger).toBeFocused();
  await expect(example.getByRole("menu", { name: "Edit" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(example.getByRole("menu", { name: "Edit" })).toBeHidden();

  const rtl = page.locator("#rtl-switching");
  const rtlFile = rtl.getByRole("button", { name: "File" });
  await rtlFile.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rtl.getByRole("button", { name: "View" })).toBeFocused();
  await page.keyboard.press("Escape");

  const nested = page.locator("#disabled-submenu");
  await nested.getByRole("button", { name: "File" }).click();
  await page.keyboard.press("End");
  const exportItem = nested.getByRole("menuitem", { name: /Export/u });
  await expect(exportItem).toHaveAttribute("data-active", "true");
  await page.keyboard.press("ArrowRight");
  const submenu = nested.getByRole("menu", { name: /Export/u });
  await expect(submenu).toBeVisible();
  await page.keyboard.press("c");
  await expect(submenu.getByRole("menuitem", { name: "CSV" })).toHaveAttribute(
    "data-active",
    "true",
  );
});

test("pagination keeps routing and in-place actions parent controlled", async ({ page }) => {
  await page.goto("/docs/components/pagination");

  const links = page.locator("#addressable-pages");
  const current = links.getByRole("link", { name: "Page 6, current page" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(links.getByRole("link", { name: "Go to page 5" })).toHaveAttribute("href", "/invoices?page=5");
  await expect(links.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2);

  const actions = page.locator("#in-place-results");
  await actions.getByRole("button", { name: "Go to page 3" }).click();
  await expect(actions.getByRole("button", { name: "Page 3, current page" })).toHaveAttribute("aria-current", "page");
  await expect(actions.locator("code")).toContainText("ChangedPage");

  const compact = page.locator("#compact-neighborhood");
  await expect(compact.locator('[data-slot="pagination-link"][aria-label^="Go to page"], [data-slot="pagination-link"][aria-label^="Page "]')).toHaveCount(3);
  await expect(compact.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2);

  const boundary = page.locator("#disabled-boundary");
  const previous = boundary.getByRole("button", { name: "Go to previous page" });
  await expect(previous).toBeDisabled();
  await expect(previous).not.toBeFocused();
  await boundary.getByRole("button", { name: "Go to next page" }).click();
  await expect(boundary.getByRole("button", { name: "Page 2, current page" })).toHaveAttribute("aria-current", "page");
});

test("breadcrumb renders semantic route parts, collapse, and RTL", async ({ page }) => {
  await page.goto("/docs/components/breadcrumb");

  const current = page.locator("#current-path");
  const nav = current.getByRole("navigation", { name: "Breadcrumb" });
  await expect(nav.locator("ol")).toBeVisible();
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  const pageName = nav.locator('[data-slot="breadcrumb-page"]');
  await expect(pageName).toHaveAttribute("aria-current", "page");
  await expect(pageName).not.toHaveAttribute("role", "link");
  await expect(nav.locator('[data-slot="breadcrumb-separator"]').first()).toHaveAttribute("aria-hidden", "true");

  const collapsed = page.locator("#collapsed-middle");
  await expect(collapsed.getByText("2 omitted levels", { exact: true })).toHaveCSS("position", "absolute");
  await expect(collapsed.getByRole("link", { name: "Workspace" })).toHaveCount(0);
  await expect(collapsed.getByRole("link", { name: "Crease UI" })).toBeVisible();

  const longLabel = page.locator("#long-resource-label").locator('[data-slot="breadcrumb-page"]');
  await expect(longLabel).toContainText("A-very-long-unbroken-resource-name");
  await expect(longLabel).toHaveCSS("overflow-wrap", "break-word");

  const rtl = page.locator("#rtl-separator").getByRole("navigation", { name: "مسار الصفحة" });
  await expect(rtl).toHaveAttribute("dir", "rtl");
  await expect(rtl.locator('[data-slot="breadcrumb-separator"] svg').first()).toHaveCSS("rotate", "180deg");
});

test("alert requires explicit severity and announcement policy", async ({ page }) => {
  await page.goto("/docs/components/alert");
  const staticInfo = page.locator("#static-information").locator('[data-slot="alert"]');
  await expect(staticInfo).toHaveAttribute("data-severity", "info");
  await expect(staticInfo).not.toHaveAttribute("role");
  await expect(staticInfo.locator('[data-slot="alert-icon"]')).toHaveAttribute("aria-hidden", "true");

  const success = page.locator("#polite-success").getByRole("status");
  await expect(success).toHaveAttribute("aria-live", "polite");
  await expect(success).toHaveAttribute("data-severity", "success");

  const warning = page.locator("#long-warning").getByRole("status");
  await expect(warning).toHaveAttribute("data-severity", "warning");
  await expect(warning.locator('[data-slot="alert-title"]')).toContainText("Storage nearly full");
  await expect(warning.locator('[data-slot="alert-description"]')).toContainText("additional logs and source maps");

  const error = page.locator("#urgent-error").getByRole("alert");
  await expect(error).toHaveAttribute("aria-live", "assertive");
  await expect(error).toHaveAttribute("data-severity", "error");
});

test("sidebar documents persistence and toggles derived shell state", async ({
  page,
}) => {
  await page.goto("/docs/components/sidebar");
  const example = page.locator("#persistent-shell");
  const provider = example.locator('[data-slot="sidebar-wrapper"]');
  await expect(provider).toHaveAttribute("data-state", "expanded");
  await example.locator('[data-slot="sidebar-trigger"]').click();
  await expect(provider).toHaveAttribute("data-state", "collapsed");
  await expect(example.locator("code")).toContainText("Sidebar.shortcut");
  await expect(example.locator("code")).toContainText("Command.mapMessages");
});

test("accordion enforces single-open state and publishes complete child wiring", async ({
  page,
}) => {
  await page.goto("/docs/components/accordion");
  const example = page.locator("#single-disclosure");
  const product = example.getByRole("button", { name: "Is it accessible?" });
  const style = example.getByRole("button", { name: "Is it styled?" });
  await expect(product).toHaveAttribute("aria-expanded", "true");
  await style.click();
  await expect(style).toHaveAttribute("aria-expanded", "true");
  await expect(product).toHaveAttribute("aria-expanded", "false");
  await expect(example.locator("code")).toContainText("maybeToggle");
  await expect(example.locator("code")).toContainText("Accordion.update");
});

test("attachment explains parent-owned lifecycle through rendered states", async ({
  page,
}) => {
  await page.goto("/docs/components/attachment");
  const example = page.locator("#lifecycle-states");
  await expect(example.locator('[data-slot="attachment"]')).toHaveCount(4);
  await expect(
    example.locator('[data-slot="attachment"][data-state="error"]'),
  ).toContainText("Upload failed");
  await expect(
    example.locator('[data-slot="attachment"][data-state="done"]'),
  ).toContainText("Uploaded");
  await expect(example.locator("code")).toContainText(
    "(['uploading', 'processing', 'error', 'done'] as const)",
  );
  await expect(example.locator("code")).toContainText(
    "Runtime.makeApplication",
  );
});

test("message scroller measures overflow and maps its scroll command", async ({
  page,
}) => {
  await page.goto("/docs/components/message-scroller");
  const example = page.locator("#jump-to-latest");
  const viewport = example.locator('[data-slot="message-scroller-viewport"]');
  await viewport.evaluate((node) => {
    node.scrollTop = 40;
    node.dispatchEvent(new Event("scroll"));
  });
  const button = example.getByRole("button", { name: "Scroll to end" });
  await expect(button).toHaveAttribute("data-active", "true");
  await button.click();
  await expect
    .poll(() =>
      viewport.evaluate((node) =>
        Math.round(node.scrollTop + node.clientHeight - node.scrollHeight),
      ),
    )
    .toBeGreaterThanOrEqual(-1);
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await expect(example.locator("code")).toContainText("MessageScroller.update");
});

for (const route of ["sonner", "toast"] as const) {
  test(`${route} shows and dismisses an accessible notification`, async ({
    page,
  }) => {
    await page.goto(`/docs/components/${route}`);
    const example = page.locator("#sticky-error");
    await example.getByRole("button", { name: `Show ${route}` }).click();
    const viewport = page.getByRole("region", {
      name: `${route === "sonner" ? "Sonner" : "Toast"} notifications`,
    });
    const alert = viewport.getByRole("alert");
    await expect(alert).toContainText("Could not save changes");
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(alert).toBeHidden();
    await example.getByRole("button", { name: `Show ${route}` }).click();
    await expect(alert).toBeVisible();
    await alert.getByRole("button", { name: "Dismiss notification" }).click();
    await expect(alert).toBeHidden();
    await expect(example.locator("code")).toContainText("Command.mapMessages");
    await expect(example.locator("code")).toContainText(".show(");

    const timed = page.locator("#timed-notification");
    const show = timed.getByRole("button", { name: `Show ${route}` });
    await show.click();
    await show.click();
    const statuses = viewport.getByRole("status");
    await expect(statuses).toHaveCount(2);
    await statuses.first().hover();
    await page.waitForTimeout(850);
    await expect(statuses).toHaveCount(1);
    await statuses.first().hover();
    await page.mouse.move(0, 0);
    await expect(statuses).toHaveCount(0, { timeout: 1500 });
  });
}

test("sonner documents the canonical async and imperative migration", async ({ page }) => {
  await page.goto("/docs/components/sonner");
  const asyncExample = page.locator("#async-save-migration");
  await expect(asyncExample.locator("code")).toContainText("Command.define('Save'");
  await expect(asyncExample.locator("code")).toContainText("Sonner.updateToast");
  const migration = page.locator("#imperative-api-migration");
  await expect(migration).toContainText("intentionally unsupported");
  await expect(migration.locator("code")).not.toContainText("toast.promise");
});

test("calendar emits selection while retaining child navigation state", async ({
  page,
}) => {
  await page.goto("/docs/components/calendar");
  const example = page.locator("#selected-date");
  const calendar = example.locator('[data-slot="calendar"]');
  const day = calendar.getByRole("button", { name: "Monday, July 20, 2026" });
  await day.click();
  await expect(day.locator("..")).toHaveAttribute("data-selected", "");
  await expect(example.locator("code")).toContainText("maybeOutput");
  await expect(example.locator("code")).toContainText("SelectedDate");
  await expect(calendar.getByRole("button", { name: "Sunday, July 19, 2026" })).toBeDisabled();

  const range = page.locator("#parent-owned-range").locator('[data-slot="calendar"]');
  await expect(range.getByRole("button", { name: "Tuesday, July 14, 2026" }).locator("..")).toHaveAttribute("data-range", "start");
  await expect(range.getByRole("button", { name: "Friday, July 17, 2026" }).locator("..")).toHaveAttribute("data-range", "middle");
  await expect(range.getByRole("button", { name: "Monday, July 20, 2026" }).locator("..")).toHaveAttribute("data-range", "end");

  const localized = page.locator("#locale-zone-and-rtl").locator('[data-slot="calendar"]');
  await expect(localized).toHaveAttribute("dir", "rtl");
  await expect(localized).toContainText("Juli 2026");
  await expect(localized).toContainText("Mo");
});

test("date picker composes disclosure and calendar into one child model", async ({
  page,
}) => {
  const pageErrors: Array<string> = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/docs/components/date-picker");
  const example = page.locator("#existing-value");
  const input = example.getByLabel("Due date (YYYY-MM-DD)");
  const hiddenInput = example.locator('input[name="dueDate"]');
  await expect(hiddenInput).toHaveValue("2026-07-18");
  await input.fill("2026-08-05");
  await expect(hiddenInput).toHaveValue("2026-08-05");
  await input.fill("2026-02-30");
  await expect(example.getByRole("alert")).toContainText("YYYY-MM-DD");
  await expect(hiddenInput).toHaveValue("2026-08-05");
  await example.getByRole("button", { name: "Load saved date" }).click();
  await expect(input).toHaveValue("2026-08-12");
  await expect(hiddenInput).toHaveValue("2026-08-12");
  const trigger = example.getByRole("button", { name: "Change due date" });
  await trigger.click();
  const panel = page.locator('[data-slot="popover-content"]');
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toContainText("August 2026");
  if ((page.viewportSize()?.width ?? 1000) < 640) {
    await expect(panel).toHaveCSS("position", "fixed");
  }
  const day = page
    .locator('[data-slot="popover-content"]')
    .getByRole("button", { name: "Thursday, August 20, 2026" });
  await day.click();
  await expect(trigger).toContainText("August 20, 2026");
  await expect(input).toHaveValue("2026-08-20");
  await expect(hiddenInput).toHaveValue("2026-08-20");
  await expect(page.locator('[data-slot="popover-content"]')).toBeHidden();
  await expect(example.locator("code")).toContainText("ClearedDate");
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await page.waitForTimeout(100);
  expect(pageErrors).toEqual([]);
});

test("chart documents pure Foldkit SVG recipes with complete source", async ({
  page,
}) => {
  await page.goto("/docs/components/chart");
  const bars = page.locator("#monthly-revenue");
  await expect(bars.getByRole("img", { name: "Bar chart" })).toBeVisible();
  await expect(bars.locator("rect")).toHaveCount(6);
  const trend = page.locator("#traffic-trend");
  await expect(trend.getByRole("img", { name: "Area chart" })).toBeVisible();
  await expect(trend.locator('[data-slot="chart-legend"]')).toContainText(
    "Visitors",
  );
  await expect(bars.locator("code")).toContainText("Runtime.makeApplication");

  const lifecycle = page.locator("#echarts-lifecycle");
  await expect(lifecycle.locator('[data-slot="echart"] canvas')).toHaveCount(1);
  await expect(lifecycle.locator('[data-slot="echart-accessible-alternative"]')).toContainText("Revenue values shown in the chart.");
  await lifecycle.getByRole("button", { name: "Show quarters" }).click();
  await expect(lifecycle.getByRole("button", { name: "Show months" })).toBeVisible();
  await expect(lifecycle.locator('[data-slot="echart"] canvas')).toHaveCount(1);

  const states = page.locator("#lifecycle-states");
  await expect(states.getByRole("status")).toHaveCount(2);
  await expect(states.getByRole("alert")).toContainText("Revenue could not be loaded.");
  await expect(states.locator('[data-slot="echart"]')).toHaveCount(0);

  await page.goto("/docs/components/button");
  await expect.poll(() => page.evaluate(() => (window as Window & { __charts?: Map<string, unknown> }).__charts?.size ?? 0)).toBe(0);
});

test("data table filters and sorts through its interaction model", async ({
  page,
}) => {
  await page.goto("/docs/components/data-table");
  const sortable = page.locator("#sortable-payments");
  const amountHeader = sortable.getByRole("columnheader", { name: "Amount" });
  await sortable.getByRole("button", { name: "Amount" }).click();
  await expect(amountHeader).toHaveAttribute("aria-sort", "ascending");
  await sortable.getByRole("button", { name: "Amount" }).click();
  await expect(amountHeader).toHaveAttribute("aria-sort", "descending");
  await sortable
    .getByRole("checkbox", { name: "Select all rows on this page" })
    .click();
  await expect(sortable).toContainText("5 of 6 rows selected.");
  await sortable.locator("button").filter({ hasText: /^Next$/ }).click();
  await expect(sortable).toContainText("Page 2 of 2");

  const filtered = page.locator("#filter-and-paginate");
  await filtered
    .getByRole("searchbox", { name: "Filter payments…" })
    .fill("failed");
  await expect(filtered.getByRole("row")).toHaveCount(2);
  await expect(filtered).toContainText("r@example.com");
  await expect(filtered.locator("code")).toContainText("DataTable.update");

  const server = page.locator("#server-owned-query");
  await expect(server).toContainText("Page 1 of 9");
  await expect(server.locator("code")).toContainText("mode: 'server'");
});

test("controlled helper pages own and update compact local preview state", async ({
  page,
}) => {
  await page.goto("/docs/components/checkbox");
  const checkbox = page
    .locator("#terms")
    .getByRole("checkbox", { name: "Accept terms" });
  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  await page.goto("/docs/components/collapsible");
  const disclosure = page
    .locator("#details")
    .getByRole("button", { name: "Show details" });
  await disclosure.click();
  await expect(
    page.locator("#details").getByRole("button", { name: "Hide details" }),
  ).toHaveAttribute("aria-expanded", "true");

  await page.goto("/docs/components/switch");
  const switchControl = page
    .locator("#notifications")
    .getByRole("switch", { name: "Notifications" });
  await expect(switchControl).toBeChecked();
  await switchControl.click();
  await expect(switchControl).not.toBeChecked();

  await page.goto("/docs/components/toggle");
  const toggle = page
    .locator("#formatting")
    .getByRole("button", { name: "Bold" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const disabledToggle = page
    .locator("#disabled")
    .getByRole("button", { name: "Managed" });
  await expect(disabledToggle).toBeDisabled();
  await expect(disabledToggle).toHaveAttribute("aria-pressed", "true");
  await disabledToggle.click({ force: true });
  await expect(disabledToggle).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .locator("#compact-named-control")
      .getByRole("button", { name: "Bold formatting" }),
  ).toBeVisible();

  await page.goto("/docs/components/toggle-group");
  const right = page
    .locator("#single-selection")
    .getByRole("button", { name: "Right" });
  await right.click();
  await expect(right).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Center", exact: true }).first()).toBeFocused();
  await expect(right).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Center", exact: true }).first()).toHaveAttribute("aria-pressed", "true");

  const multiple = page.locator("#multiple-selection");
  const multipleLeft = multiple.getByRole("button", { name: "Left" });
  const multipleRight = multiple.getByRole("button", { name: "Right" });
  await expect(multipleLeft).toHaveAttribute("aria-pressed", "true");
  await multipleRight.click();
  await expect(multipleLeft).toHaveAttribute("aria-pressed", "true");
  await expect(multipleRight).toHaveAttribute("aria-pressed", "true");

  const disabledGroup = page.locator("#disabled-item");
  const disabledLeft = disabledGroup.getByRole("button", { name: "Left" });
  const disabledRight = disabledGroup.getByRole("button", { name: "Right" });
  await disabledLeft.focus();
  await page.keyboard.press("ArrowRight");
  await expect(disabledRight).toBeFocused();

  await page.goto("/docs/components/radio-group");
  const compact = page
    .locator("#density")
    .getByRole("radio", { name: /Compact/u });
  await compact.click();
  await expect(compact).toBeChecked();

  await page.goto("/docs/components/native-select");
  const fruit = page
    .locator("#labeled-fruit")
    .getByRole("combobox", { name: "Fruit" });
  await fruit.selectOption("blueberry");
  await expect(fruit).toHaveValue("blueberry");

  await page.goto("/docs/components/input");
  const email = page.locator("#email").getByRole("textbox", { name: "Email" });
  await email.fill("docs@crease.dev");
  await expect(email).toHaveValue("docs@crease.dev");
  await expect(email).toHaveAttribute("autocomplete", "email");
  await expect(email).toHaveAttribute("inputmode", "email");
  const emailDescriptionId = await email.getAttribute("aria-describedby");
  expect(emailDescriptionId).toBe("docs-input-0-description");
  await expect(page.locator(`#${emailDescriptionId}`)).toContainText(
    "account notices",
  );
  const readOnlyEmail = page
    .locator("#native-form-attributes")
    .getByRole("textbox", { name: "Account email" });
  await expect(readOnlyEmail).toHaveAttribute("readonly", "");
  await expect(readOnlyEmail).toHaveAttribute("form", "profile");
  await expect(readOnlyEmail).not.toHaveAttribute("aria-describedby");

  await page.goto("/docs/components/textarea");
  const message = page
    .locator("#message")
    .getByRole("textbox", { name: "Message" });
  await message.fill("A complete Foldkit example.");
  await expect(message).toHaveValue("A complete Foldkit example.");
  const deploymentNotes = page
    .locator("#form-and-resize")
    .getByRole("textbox", { name: "Deployment notes" });
  await expect(deploymentNotes).toHaveAttribute("readonly", "");
  await expect(deploymentNotes).toHaveAttribute("rows", "5");
  await expect(deploymentNotes).toHaveAttribute("wrap", "hard");
  await expect(deploymentNotes).toHaveAttribute("data-resize", "none");
  await expect(deploymentNotes).not.toHaveAttribute("aria-describedby");
  const submittedNotes = await page.evaluate(() => {
    const form = document.querySelector<HTMLFormElement>("#textarea-profile");
    return form === null ? null : new FormData(form).get("notes");
  });
  expect(submittedNotes).toBe("First line\nSecond line");

  await page.goto("/docs/components/input-group");
  const url = page.locator("#url-prefix").getByRole("textbox");
  await url.fill("crease.dev");
  await expect(url).toHaveValue("crease.dev");

  await page.goto("/docs/components/input-otp");
  const code = page
    .locator("#six-digit-code")
    .getByRole("textbox", { name: "Verification code" });
  await code.fill("654321");
  await expect(code).toHaveValue("654321");
});

test("collapsible preserves controlled linkage, external changes, and disabled policy", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/collapsible");
  const example = page.locator("#details");
  await example.getByRole("button", { name: "Open details externally" }).click();

  const trigger = example.locator('[data-slot="collapsible-trigger"]');
  await expect(trigger).toHaveAccessibleName("Hide details");
  const controls = await trigger.getAttribute("aria-controls");
  expect(controls).toBeTruthy();
  await expect(page.locator(`#${controls}`)).toBeVisible();
  await expect(page.locator(`#${controls}`)).toHaveCSS("transition-duration", "0s");

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAccessibleName("Show details");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.click();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const disabled = page.locator("#disabled").getByRole("button", { name: "Unavailable details" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAttribute("aria-expanded", "false");
});

test("progress normalizes custom ranges and reduced-motion indeterminate state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/progress");

  const determinate = page.locator("#determinate").getByRole("progressbar", { name: "Upload progress" });
  await expect(determinate).toHaveAttribute("aria-valuemin", "0");
  await expect(determinate).toHaveAttribute("aria-valuemax", "80");
  await expect(determinate).toHaveAttribute("aria-valuenow", "64");
  await expect(determinate).toHaveAttribute("aria-valuetext", "64 of 80 files");

  const indeterminate = page.locator("#indeterminate").getByRole("progressbar", { name: "Loading report" });
  await expect(indeterminate).not.toHaveAttribute("aria-valuenow", /.+/u);
  await expect(indeterminate).toHaveAttribute("data-state", "indeterminate");
  await expect(indeterminate.locator('[data-slot="progress-indicator"]')).toHaveCSS("animation-name", "none");

  const narrow = page.locator("#narrow-range").getByRole("progressbar", { name: "Setup progress" });
  await expect(narrow).toHaveAttribute("aria-valuemax", "4");
  await expect(narrow).toHaveAttribute("aria-valuenow", "3");
  expect(await narrow.evaluate(element => element.getBoundingClientRect().width)).toBeLessThanOrEqual(100);
});

test("skeleton and spinner expose explicit loading semantics with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/skeleton");
  const profile = page.locator("#profile");
  await expect(profile.getByRole("status", { name: "Loading profile" })).toHaveAttribute("aria-busy", "true");
  const skeletons = profile.locator('[data-slot="skeleton"]');
  await expect(skeletons).toHaveCount(3);
  for (const skeleton of await skeletons.all()) {
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    await expect(skeleton).toHaveCSS("animation-name", "none");
  }

  await page.goto("/docs/components/spinner");
  const standalone = page.locator("#default").getByRole("img", { name: "Loading content" });
  await expect(standalone).toHaveCSS("animation-name", "none");
  const namedStatus = page.locator("#with-label").getByRole("status");
  await expect(namedStatus).toContainText("Saving changes");
  const decorative = namedStatus.locator("svg");
  await expect(decorative).toHaveAttribute("aria-hidden", "true");
  await expect(namedStatus.getByRole("img")).toHaveCount(0);
});

test("empty variants preserve heading structure, action order, and responsive copy", async ({ page }) => {
  await page.goto("/docs/components/empty");
  for (const [id, heading, action] of [["create-first-item", "No projects yet", "Create project"], ["no-results", "No matching components", "Clear filters"], ["error-recovery", "Could not load projects", "Retry"], ["permission-denied", "Access required", "Request access"]] as const) {
    const example = page.locator(`#${id}`);
    await expect(example.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    const button = example.getByRole("button", { name: action });
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await example.locator('[data-slot="empty"]')).toHaveCount(1);
    const width = await example.locator('[data-slot="empty-description"]').evaluate(element => element.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(await example.evaluate(element => element.getBoundingClientRect().width));
  }
});

test("message exposes live author metadata and parent-owned keyboard actions", async ({ page }) => {
  await page.goto("/docs/components/message");
  await expect(page.locator("#incoming").locator('[data-slot="message-author"]')).toHaveText("Ada");
  await expect(page.locator("#outgoing").locator('[data-slot="message-metadata"]')).toHaveText("Delivered");

  const recovery = page.locator("#live-recovery");
  await expect(recovery.getByRole("log", { name: "Project conversation" })).toBeVisible();
  await expect(recovery.getByRole("status", { name: "New message from Ada" })).toBeVisible();
  const action = recovery.getByRole("button", { name: "Retry delivery" });
  await action.focus();
  await page.keyboard.press("Enter");
  await expect(action).toBeFocused();
  const row = recovery.locator('[data-slot="message"]');
  expect(await row.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("table preserves native captions, scoped headers, overflow, and empty rows", async ({ page }) => {
  await page.goto("/docs/components/table");
  const inventory = page.locator("#component-inventory").getByRole("table", { name: "Foldkit ownership by component." });
  await expect(inventory.getByRole("columnheader", { name: "Component" })).toHaveAttribute("scope", "col");
  await expect(inventory.getByRole("rowheader", { name: "Accordion" })).toHaveAttribute("scope", "row");
  await expect(inventory.getByRole("cell", { name: "Stateful" }).first()).toBeVisible();

  const denseExample = page.locator("#dense-overflow");
  const denseContainer = denseExample.locator('[data-slot="table-container"]');
  await expect(denseExample.getByRole("table", { name: "Deployment inventory with intentionally wide columns." })).toBeVisible();
  expect(await denseContainer.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);

  const empty = page.locator("#empty-body").getByRole("table", { name: "Filtered component inventory." });
  const emptyCell = empty.getByRole("cell", { name: "No components match this filter." });
  await expect(emptyCell).toHaveAttribute("colspan", "2");
  await expect(empty.getByRole("row")).toHaveCount(2);
});

test("checkbox shares controlled mixed, read-only, and form semantics", async ({
  page,
}) => {
  await page.goto("/docs/components/checkbox");

  const terms = page
    .locator("#terms")
    .getByRole("checkbox", { name: "Accept terms" });
  const formValue = page.locator('#terms input[type="hidden"][name="terms"]');
  await expect(terms).toHaveAttribute(
    "aria-describedby",
    "docs-checkbox-0-description",
  );
  await expect(formValue).toHaveValue("");
  await terms.press("Space");
  await expect(terms).toBeChecked();
  await expect(formValue).toHaveValue("accepted");

  await expect(
    page.locator("#indeterminate").getByRole("checkbox", {
      name: "Select all components",
    }),
  ).toHaveAttribute("aria-checked", "mixed");

  const readOnly = page
    .locator("#read-only")
    .getByRole("checkbox", { name: "Account verified" });
  await expect(readOnly).toHaveAttribute("aria-readonly", "true");
  await readOnly.press("Space");
  await expect(readOnly).toBeChecked();
  await assertAccessible(page);

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  const stylexCheckbox = page.getByRole("checkbox", {
    name: "Use semantic tokens",
  });
  await expect(stylexCheckbox).toBeChecked();
  await expect(stylexCheckbox).not.toHaveAttribute("aria-describedby");
  await assertAccessible(page);
});

test("switch shares controlled read-only form and RTL semantics", async ({
  page,
}) => {
  await page.goto("/docs/components/switch");

  const notifications = page
    .locator("#notifications")
    .getByRole("switch", { name: "Notifications" });
  const formValue = page.locator(
    '#notifications input[type="hidden"][name="notifications"]',
  );
  await expect(notifications).toHaveAttribute(
    "aria-describedby",
    "docs-switch-0-description",
  );
  await expect(formValue).toHaveValue("enabled");
  await notifications.press("Space");
  await expect(notifications).not.toBeChecked();
  await expect(formValue).toHaveValue("");

  const readOnly = page
    .locator("#read-only")
    .getByRole("switch", { name: "Account verified" });
  await expect(readOnly).toHaveAttribute("aria-readonly", "true");
  await readOnly.press("Space");
  await expect(readOnly).toBeChecked();

  const rtlSection = page.locator("#rtl");
  const rtlField = rtlSection.locator('[data-slot="switch-field"]');
  const rtlTrack = rtlSection.getByRole("switch", { name: "واجهة عربية" });
  const rtlThumb = rtlTrack.locator('[data-slot="switch-thumb"]');
  await expect(rtlField).toHaveAttribute("dir", "rtl");
  const [trackBox, thumbBox] = await Promise.all([
    rtlTrack.boundingBox(),
    rtlThumb.boundingBox(),
  ]);
  expect(trackBox).not.toBeNull();
  expect(thumbBox).not.toBeNull();
  expect(thumbBox!.x + thumbBox!.width / 2).toBeLessThan(
    trackBox!.x + trackBox!.width / 2,
  );
  await assertAccessible(page);

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  const stylexSwitch = page.getByRole("switch", { name: "Strict linting" });
  await expect(stylexSwitch).toBeChecked();
  await expect(stylexSwitch).not.toHaveAttribute("aria-describedby");
  await assertAccessible(page);
});

test("radio group isolates roving focus from parent-owned selection", async ({
  page,
}) => {
  await page.goto("/docs/components/radio-group");

  const density = page.locator("#density");
  const comfortable = density.getByRole("radio", { name: /Comfortable/u });
  const compact = density.getByRole("radio", { name: /Compact/u });
  const hiddenValue = density.locator(
    'input[type="hidden"][name="density"]',
  );
  await expect(comfortable).toBeChecked();
  await expect(hiddenValue).toHaveValue("comfortable");
  await comfortable.press("ArrowDown");
  await expect(compact).toBeChecked();
  await expect(hiddenValue).toHaveValue("compact");

  const readOnly = page.locator("#read-only");
  const readOnlyComfortable = readOnly.getByRole("radio", {
    name: /Comfortable/u,
  });
  const readOnlyCompact = readOnly.getByRole("radio", { name: /Compact/u });
  await readOnlyComfortable.focus();
  await readOnlyComfortable.press("ArrowDown");
  await expect(readOnlyComfortable).toBeChecked();
  await expect(readOnlyCompact).toBeFocused();

  const rtl = page.locator("#rtl-and-disabled-option");
  const rtlGroup = rtl.getByRole("radiogroup", { name: "Interface density" });
  const rtlComfortable = rtl.getByRole("radio", { name: /Comfortable/u });
  const rtlDefault = rtl.getByRole("radio", { name: /Default/u });
  const rtlCompact = rtl.getByRole("radio", { name: /Compact/u });
  await expect(rtlGroup).toHaveAttribute("dir", "rtl");
  await expect(rtlCompact).toHaveAttribute("aria-disabled", "true");
  await rtlComfortable.press("ArrowRight");
  await expect(rtlDefault).toBeChecked();
  await assertAccessible(page);

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  const stylexGroup = page.getByRole("radiogroup", {
    name: "Constraint level",
  });
  await expect(stylexGroup.getByRole("radio", { name: "Strict" })).toBeChecked();
  await expect(stylexGroup.getByRole("radio", { name: "Flexible" })).not.toHaveAttribute(
    "aria-describedby",
  );
  await assertAccessible(page);
});

test("field guarantees linked parts and documents stale async validation", async ({
  page,
}) => {
  await page.goto("/docs/components/field");

  const anatomy = page
    .locator("#anatomy")
    .getByRole("textbox", { name: "Display name" });
  await anatomy.fill("Ada Lovelace");
  await expect(anatomy).toHaveValue("Ada Lovelace");
  await expect(anatomy).toHaveAttribute(
    "aria-describedby",
    "docs-field-name-description",
  );
  await expect(page.locator("#docs-field-name-description")).toContainText(
    "public profile",
  );

  const invalid = page
    .locator("#validation-error")
    .getByRole("textbox", { name: "Display name" });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(invalid).toHaveAttribute(
    "aria-describedby",
    "docs-field-error-error",
  );
  await expect(page.locator("#docs-field-error-error")).toHaveRole("alert");

  const asyncSection = page.locator("#async-validation");
  const username = asyncSection.getByRole("textbox", { name: "Username" });
  await expect(username).toHaveAttribute(
    "aria-describedby",
    "docs-field-username-description docs-field-username-error",
  );
  await username.fill("ada");
  await expect(asyncSection.getByRole("alert")).toBeHidden();
  await expect(asyncSection).toContainText(
    "message.version === model.validationVersion",
  );
  await assertAccessible(page);

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  const stylexField = page.getByRole("textbox", { name: "Repository" });
  await expect(stylexField).toHaveValue("creaseui");
  await expect(stylexField).toHaveAttribute(
    "aria-describedby",
    "stylex-field-description",
  );
  await assertAccessible(page);
});

test("form preserves native metadata and focuses linked validation feedback", async ({
  page,
}) => {
  await page.goto("/docs/components/form");

  const newsletter = page
    .locator("#newsletter-signup")
    .getByRole("textbox", { name: "Email" });
  await expect(newsletter).toHaveAttribute("name", "email");
  await expect(newsletter).toHaveAttribute("type", "email");
  await expect(newsletter).toHaveAttribute("autocomplete", "email");

  const signIn = page.locator("#error-summary").getByRole("form", {
    name: "Account sign in",
  });
  const signInEmail = signIn.getByRole("textbox", { name: "Email" });
  const password = signIn.getByLabel("Password");
  await expect(password).toHaveAttribute("name", "password");
  await expect(password).toHaveAttribute("autocomplete", "current-password");
  await signIn.getByRole("button", { name: "Sign in" }).click();

  const summary = signIn.getByRole("alert", {
    name: "Fix the following error",
  });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link", { name: "Enter a valid email address." })).toHaveAttribute(
    "href",
    "#docs-form-sign-in-email",
  );
  await expect(signInEmail).toHaveAttribute("aria-invalid", "true");
  await expect(signInEmail).toHaveAttribute(
    "aria-describedby",
    "docs-form-sign-in-email-error",
  );

  await expect(page.locator("#async-validation")).toContainText(
    "message.version === model.validationVersion",
  );
  await assertAccessible(page);

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  const stylexForm = page.getByRole("form", { name: "Catalog form" });
  const project = stylexForm.getByRole("textbox", { name: "Project name" });
  await expect(project).toHaveValue("creaseui");
  await expect(project).toHaveAttribute("name", "project");
  await expect(project).toHaveAttribute(
    "aria-describedby",
    "stylex-form-input-description",
  );
  await assertAccessible(page);
});

test("flagship documentation pages have no automated accessibility violations", async ({
  page,
}) => {
  for (const route of ["button", "dialog", "input", "select"]) {
    await page.goto(`/docs/components/${route}`);
    await assertAccessible(page);
  }
});
