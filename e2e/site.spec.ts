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
  await expect(example).toContainText("Current value: 51");
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
});

test("alert dialog confirmation emits a domain message and closes", async ({
  page,
}) => {
  await page.goto("/docs/components/alert-dialog");

  const example = page.locator("#delete-project");
  const trigger = example.getByRole("button", {
    name: "Delete project",
    exact: true,
  });
  await trigger.click();
  const alertDialog = page.getByRole("alertdialog");
  await expect(alertDialog).toBeVisible();
  const confirm = alertDialog.getByRole("button", {
    name: "Delete",
    exact: true,
  });
  await confirm.click();
  await expect(alertDialog).toBeHidden();
  await expect(example.getByRole("status")).toHaveText("Project deleted.");
  await expect(trigger).toBeFocused();
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
  await expect(panel).toContainText("Set the dimensions");
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
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
  await page.getByRole("link", { name: "crease/ui" }).focus();
  await expect(panel).toBeHidden({ timeout: 2_000 });
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
  await page.goto("/docs/components/select");
  const example = page.locator("#typed-selection");
  const trigger = example.getByRole("button", { name: "Fruit" });
  await trigger.click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await page.getByRole("option", { name: "Banana" }).click();
  await expect(trigger).toContainText("Banana");
  await expect(listbox).toBeHidden();
  await expect(example.locator("code")).toContainText("maybeSelection");
  await expect(example.locator("code")).toContainText(
    "selection._tag === 'Selected'",
  );
});

test("combobox filters items and persists its typed selection output", async ({
  page,
}) => {
  await page.goto("/docs/components/combobox");
  const example = page.locator("#framework-search");
  const input = example.getByRole("combobox", { name: "Framework" });
  await input.fill("sve");
  const option = page.getByRole("option", { name: "SvelteKit" });
  await expect(option).toBeVisible();
  await option.click();
  await expect(input).toHaveValue("SvelteKit");
  await expect(example.locator("code")).toContainText("maybeSelection");
});

test("command search commits a typed parent action", async ({ page }) => {
  await page.goto("/docs/components/command");
  const example = page.locator("#application-commands");
  const input = example.getByRole("combobox", { name: "Application commands" });
  await input.fill("sett");
  const option = page.getByRole("option", { name: /Settings/u });
  await expect(option).toBeVisible();
  await option.click();
  await expect(input).toHaveValue("Settings");
  await expect(example.locator("code")).toContainText(
    "selection._tag === 'Selected'",
  );
});

test("dropdown menu exposes typed selection wiring and keyboard behavior", async ({
  page,
}) => {
  await page.goto("/docs/components/dropdown-menu");
  const example = page.locator("#account-actions");
  const trigger = example.getByRole("button", { name: "Open account menu" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = example.getByRole("menu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(menu).toBeHidden();
  await expect(example.locator("code")).toContainText("maybeSelection");
  await expect(example.locator("code")).toContainText(
    "DropdownMenu.create<Action>()",
  );
});

test("context menu anchors at the secondary-click target and skips disabled items", async ({
  page,
}) => {
  await page.goto("/docs/components/context-menu");
  const example = page.locator("#browser-actions");
  const target = example.getByRole("button", { name: "Right click here" });
  await target.click({ button: "right", position: { x: 80, y: 60 } });
  const menu = example.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Forward" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(example.locator("code")).toContainText(
    "ContextMenu.create<Action>()",
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
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

  const disclosureExample = page.locator("#popover-disclosure");
  const trigger = disclosureExample.getByRole("button", { name: "Products" });
  await trigger.click();
  const content = page.locator('[data-slot="popover-content"]');
  await expect(content.getByRole("link", { name: "Analytics" })).toBeVisible();
  await expect(disclosureExample.locator("code")).toContainText(
    "Popover.update",
  );
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await expect(trigger).toBeFocused();
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
  await expect(menu.getByRole("menuitem", { name: /Save/u })).toContainText(
    "⌘S",
  );
  await expect(example.locator("code")).toContainText("GotMenuMessage");
  await expect(example.locator("code")).toContainText("MovedMenu");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
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
    await alert.getByRole("button", { name: "Dismiss notification" }).click();
    await expect(alert).toBeHidden();
    await expect(example.locator("code")).toContainText("Command.mapMessages");
    await expect(example.locator("code")).toContainText(".show(");
  });
}

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
});

test("date picker composes disclosure and calendar into one child model", async ({
  page,
}) => {
  const pageErrors: Array<string> = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/docs/components/date-picker");
  const example = page.locator("#existing-value");
  const trigger = example.getByRole("button", { name: "Change due date" });
  await trigger.click();
  const day = page
    .locator('[data-slot="popover-content"]')
    .getByRole("button", { name: "Monday, July 20, 2026" });
  await day.click();
  await expect(trigger).toContainText("July 20, 2026");
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

  const filtered = page.locator("#filter-and-paginate");
  await filtered
    .getByRole("searchbox", { name: "Filter payments…" })
    .fill("failed");
  await expect(filtered.getByRole("row")).toHaveCount(2);
  await expect(filtered).toContainText("r@example.com");
  await expect(filtered.locator("code")).toContainText("DataTable.update");
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

  await page.goto("/docs/components/toggle-group");
  const right = page
    .locator("#alignment")
    .getByRole("button", { name: "Right" });
  await right.click();
  await expect(right).toHaveAttribute("aria-pressed", "true");

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
