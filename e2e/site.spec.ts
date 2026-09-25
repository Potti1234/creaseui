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
  const heroChartRegion = page.locator(
    '[data-slot="echart-region"]:has([aria-label="Revenue trend for the last 6 months"])',
  );
  const [heroChartRegionBox, heroChartBox] = await Promise.all([
    heroChartRegion.boundingBox(),
    heroChartRegion.locator('[data-slot="echart"]').boundingBox(),
  ]);
  expect(heroChartRegionBox).not.toBeNull();
  expect(heroChartBox).not.toBeNull();
  expect(heroChartBox!.height).toBeLessThanOrEqual(heroChartRegionBox!.height);
  await assertAccessible(page);
  await attachPage(page, testInfo, "landing-light-desktop");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await expect(
    page.getByRole("button", { name: "Switch to light mode" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Switch to light mode" })
      .locator(".lucide-moon > *"),
  ).not.toHaveCount(0);
  await attachPage(page, testInfo, "landing-dark-desktop");
});

test("landing remains contained and navigable on mobile", { tag: "@mobile" }, async ({
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

test("standalone StyleX page is no longer routed or linked", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "StyleX", exact: true }),
  ).toHaveCount(0);

  await page.goto("/stylex");
  await expect(page.getByText("No page at /stylex.")).toBeVisible();
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

test("Create switches between Tailwind and StyleX on one route", async ({
  page,
}) => {
  await page.goto("/create");
  await expect(page).toHaveURL(/\/create$/u);
  await expect(page.locator('[data-slot="capture-target"]')).toBeVisible();

  const renderer = page.getByRole("group", { name: "Create renderer" });
  await renderer.getByRole("button", { name: "StyleX" }).click();
  await expect(page).toHaveURL(/\/create$/u);

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

  await renderer.getByRole("button", { name: "Tailwind" }).click();
  await expect(page.locator('[data-primitive-box]')).toHaveCount(0);
  await renderer.getByRole("button", { name: "StyleX" }).click();
  await expect(token).not.toHaveText(applied ?? "");
});

test("StyleX Create uses the constrained board composition", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/create");
  await page
    .getByRole("group", { name: "Create renderer" })
    .getByRole("button", { name: "StyleX" })
    .click();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("Contribution History", { exact: true })).toBeVisible();
  await expect(page.locator('[data-primitive-box]')).toBeVisible();
  await expect(page.locator('[data-primitive-board-grid]')).toBeVisible();
});

test("legacy Create variant routes are removed", async ({ page }) => {
  for (const path of ["/create-stylex", "/create-constrained"]) {
    await page.goto(path);
    await expect(page.getByText(`No page at ${path}.`)).toBeVisible();
  }
});

test("primitive inspector updates every constrained primitive", async ({ page }) => {
  test.slow();
  await page.goto("/create");
  await page
    .getByRole("group", { name: "Create renderer" })
    .getByRole("button", { name: "StyleX" })
    .click();
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
  await expect(page.locator("#basic pre code")).toContainText("// MODEL");
  await expect(page.locator("#basic pre code")).toContainText(
    "Runtime.makeApplication",
  );
  await expect(async () => {
    expect(
      await page.locator("#basic pre code span").count(),
    ).toBeGreaterThan(5);
  }).toPass();
  await expect(async () => {
    expect(
      await page.locator("#installation pre code span").count(),
    ).toBeGreaterThan(0);
  }).toPass();

  await page.goto("/docs/components/dialog");
  await expect(
    page.getByText("Stateful submodel", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#architecture")).toContainText("canonical Foldkit interaction Submodel");
  await expect(page.locator("#accessibility")).toContainText(
    "focus restoration",
  );

  await page.goto("/docs/components/toast");
  await expect(
    page.getByText("Composed recipe", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#usage")).toContainText("Toast.show");
  await expect(page.locator("#usage")).toContainText("Toast.toast");
  await expect(page.locator("#api-reference")).toContainText("export * from '@/lib/toast'");
  await expect(
    page
      .locator("#api-reference")
      .getByRole("columnheader", { name: "Purpose" }),
  ).toBeVisible();
});

test("Foldkit-native documentation remains contained on mobile", { tag: "@mobile" }, async ({
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
  test.setTimeout(360_000);

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

  const example = page.getByRole("form", { name: "Account sign in" });
  await example.getByRole("button", { name: "Sign in" }).click();
  const input = example.locator("#docs-form-sign-in-email");
  await expect(input).toHaveAttribute(
    "aria-describedby",
    "docs-form-sign-in-email-error",
  );
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(example.locator("#docs-form-sign-in-email-error")).toHaveText(
    "Enter a valid email address.",
  );
});

test("avatar sections mirror shadcn examples in both renderers", async ({
  page,
}) => {
  await page.goto("/docs/components/avatar");

  const hero = page.locator('[aria-label="Demo preview"]');
  await expect(hero.locator('[data-slot="avatar"]')).toHaveCount(5);
  await expect(hero.locator('[data-slot="avatar-badge"]')).toHaveCount(1);
  await expect(
    hero.locator('[data-slot="avatar-group-count"]'),
  ).toHaveText("+3");

  for (const id of [
    "basic",
    "badge",
    "badge-with-icon",
    "avatar-group",
    "avatar-group-count",
    "avatar-group-with-icon",
    "sizes",
    "dropdown",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#demo")).toHaveCount(0);
  await expect(page.locator("#image-lifecycle")).toHaveCount(0);
  await expect(page.locator("#initials-only")).toHaveCount(0);

  const group = page.locator("#avatar-group");
  await expect(group.locator('[data-slot="avatar"]')).toHaveCount(3);
  await expect(
    page.locator("#avatar-group-count [data-slot='avatar-group-count']"),
  ).toHaveText("+3");

  const sizes = page.locator("#sizes [data-slot='avatar']");
  await expect(sizes.nth(0)).toHaveAttribute("data-size", "sm");
  await expect(sizes.nth(1)).toHaveAttribute("data-size", "default");
  await expect(sizes.nth(2)).toHaveAttribute("data-size", "lg");

  const basic = page.locator("#basic");
  const basicImage = basic.getByRole("img", { name: "@shadcn" });
  await expect(basicImage).toBeVisible();
  await expect(basicImage).not.toHaveAttribute("data-loading", "");

  const dropdown = page.locator("#dropdown");
  await dropdown.locator('[data-slot="dropdown-menu-trigger"]').click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  await expect(page.locator("#rtl [dir='rtl']")).toHaveCount(1);
  await expect(page.locator("#rtl [data-slot='avatar-group-count']")).toHaveText(
    "+٣",
  );

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#avatar-group")).toBeVisible();
  await expect(page.locator("#basic code")).toContainText("@/stylex/avatar");
  await expect(
    page.locator("#avatar-group [data-slot='avatar']"),
  ).toHaveCount(3);
  await expect(
    page.locator("#avatar-group-count [data-slot='avatar-group-count']"),
  ).toHaveText("+3");
  await expect(page.locator("#dropdown")).toBeVisible();
  await expect(page.locator("#rtl [dir='rtl']")).toHaveCount(1);
});

test("button preserves authored state and semantics across renderers", async ({ page }) => {
  await page.goto("/docs/components/button");

  const basic = page.locator("#basic");
  await expect(basic.getByRole("button", { name: "Button", exact: true })).toBeVisible();
  await expect(basic.getByRole("button", { name: "Submit" })).toBeVisible();

  const size = page.locator("#size");
  await expect(size.locator("button").filter({ hasText: "Extra Small" })).toBeVisible();
  await expect(size.locator("button").filter({ hasText: "Large" })).toBeVisible();
  await expect(size.locator("button[data-size='icon-xs']")).toBeVisible();
  await expect(size.locator("button[data-size='icon-lg']")).toBeVisible();

  const spinner = page.locator("#spinner");
  await expect(spinner.getByRole("button", { name: "Generating" })).toBeDisabled();
  await expect(spinner.getByRole("button", { name: "Downloading" })).toBeDisabled();
  await expect(spinner.locator("svg.animate-spin").first()).toBeVisible();

  const asChild = page.locator("#as-child");
  await expect(asChild.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");

  const rtl = page.locator("#rtl");
  await expect(rtl.locator("div[dir='rtl']")).toBeVisible();
  await expect(rtl.getByRole("button", { name: "زر" })).toBeVisible();

  const group = page.locator("#button-group");
  await group.locator("[data-slot='dropdown-menu-trigger']").click();
  await expect(page.getByRole("menu").getByText("Mark as Read")).toBeVisible();
  await expect(page.getByRole("menu").getByText("Trash")).toBeVisible();
  await page.getByRole("menu").getByText("Label As").hover();
  await page.getByRole("menu").getByText("Work").click();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of [
    "basic",
    "size",
    "default",
    "outline",
    "secondary",
    "ghost",
    "destructive",
    "link",
    "icon",
    "with-icon",
    "rounded",
    "spinner",
    "button-group",
    "as-child",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(basic.locator("code")).toContainText("@/stylex/button");
  await expect(page.locator("#button-group").locator("code")).toContainText("@/stylex/dropdown-menu");
  await expect(
    page.locator("#with-icon").getByRole("button", { name: "New Branch" }),
  ).toBeVisible();
  await expect(
    page.locator("#with-icon").getByRole("button", { name: "Fork" }),
  ).toBeVisible();
  await expect(page.locator("#rounded").getByRole("button", { name: "Get Started" })).toBeVisible();
  await expect(
    page.locator("#icon").getByRole("button", { name: "Submit" }),
  ).toBeVisible();
});

test("button-group sections mirror shadcn examples in both renderers", async ({ page }) => {
  await page.goto("/docs/components/button-group");

  const hero = page.locator('[aria-label="Demo preview"]');
  await expect(hero).toBeVisible();
  await expect(hero.getByRole("button", { name: "Archive" })).toBeVisible();
  await expect(hero.getByRole("button", { name: "Report" })).toBeVisible();
  await expect(hero.getByRole("button", { name: "Snooze" })).toBeVisible();
  await hero.getByRole("button", { name: "More Options" }).click();
  await expect(
    page.getByRole("menu").getByText("Mark as Read"),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: /Label As/ }).hover();
  await page.getByRole("menuitemradio", { name: "Work" }).click();
  await page.keyboard.press("Escape");

  for (const id of [
    "orientation",
    "size",
    "nested",
    "separator",
    "split",
    "input",
    "input-group",
    "dropdown-menu",
    "select",
    "popover",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  await expect(
    page.locator("#orientation").getByRole("group"),
  ).toHaveAttribute("data-orientation", "vertical");
  await expect(
    page.locator("#orientation").getByRole("group"),
  ).toHaveAttribute("aria-label", "Media controls");

  const size = page.locator("#size");
  await expect(
    size.locator("[data-slot=button-group]"),
  ).toHaveCount(3);

  const nested = page.locator("#nested");
  await nested.locator("input[type='text']").fill("hello");
  await nested.getByRole("button", { name: "Voice Mode" }).hover();
  await expect(
    page.getByText("Voice Mode").first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const input = page.locator("#input");
  await input.locator("input[type='text']").fill("query");
  await expect(input.getByRole("button", { name: "Search" })).toBeVisible();

  const inputGroup = page.locator("#inputgroup");
  const voice = inputGroup.locator("button[aria-pressed]");
  await expect(voice).toHaveAttribute("aria-pressed", "false");
  await voice.click();
  await expect(voice).toHaveAttribute("aria-pressed", "true");
  await expect(inputGroup.locator("input[type='text']")).toBeDisabled();

  const dropdown = page.locator("#dropdown-menu");
  await dropdown.getByRole("button", { name: "Options" }).click();
  await expect(
    page.getByRole("menuitem", { name: /Mute Conversation/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /Delete Conversation/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const select = page.locator("#select");
  await select.locator("button").first().click();
  await page.getByRole("option", { name: /Euro/ }).click();
  await select.locator("input[type='text']").fill("12.34");

  const popover = page.locator("#popover");
  await popover.getByRole("button", { name: "Open Popover" }).click();
  await expect(
    page.getByText("Start a new task with Copilot", { exact: true }),
  ).toBeVisible();
  await page.locator("textarea").fill("fix the flake", { force: false });
  await page.keyboard.press("Escape");

  const rtl = page.locator("#rtl");
  await expect(rtl.locator("div[dir='rtl']").first()).toBeVisible();
  await expect(
    rtl.getByRole("button", { name: "أرشفة" }),
  ).toBeVisible();
  await rtl.getByRole("button", { name: "مزيد من الخيارات" }).click();
  await expect(
    page.getByRole("menuitem", { name: /سلة المهملات/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#size code")).toContainText("@/stylex/button-group");
  await expect(
    page.locator("#orientation").getByRole("group"),
  ).toHaveAttribute("data-orientation", "vertical");
  const sxDropdown = page.locator("#dropdown-menu");
  await sxDropdown.getByRole("button", { name: "Options" }).click();
  await expect(
    page.getByRole("menuitem", { name: /Mute Conversation/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const sxPopover = page.locator("#popover");
  await sxPopover.getByRole("button", { name: "Open Popover" }).click();
  await expect(
    page.getByText("Start a new task with Copilot", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  // the preview model persists across the renderer toggle, so the toggle
  // may already be on — assert the click flips whatever state it's in
  const sxVoice = page
    .locator("#input-group")
    .locator("button[aria-pressed]");
  const before = await sxVoice.getAttribute("aria-pressed");
  await sxVoice.click();
  await expect(sxVoice).toHaveAttribute(
    "aria-pressed",
    before === "true" ? "false" : "true",
  );
});

test("authored tabs keep child instances and selected values independent", async ({
  page,
}) => {
  await page.goto("/docs/components/tabs");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#settings")).toBeVisible();
  await expect(page.locator("#line-variant")).toBeVisible();
  await expect(page.locator("#manual-with-disabled-tab")).toBeVisible();
  await expect(page.locator("#rtl-route-value")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);

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
  await expect(settings.locator("code")).toContainText("@/stylex/tabs");
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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of [
    "controlled-volume",
    "read-only-value",
    "rtl-price-range",
    "vertical-range",
    "normalized-bounds",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#controlled-volume code")).toContainText(
    "@/stylex/slider",
  );
  await expect(slider).toHaveAttribute("aria-valuenow", "51");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "52");
  await expect(example).toContainText("Current value: 52");
  await expect(readOnly).toHaveAttribute("aria-valuenow", "65");
  await expect(minimum).toHaveValue("75");
  await expect(normalized).toHaveAttribute("step", "1");
});

test("authored resizable instances keep axis-specific child state independent", async ({
  page,
}) => {
  await page.goto("/docs/components/resizable");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#editor-and-preview")).toBeVisible();
  await expect(page.locator("#vertical-split")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);

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
  await expect(page.locator("#editor-and-preview code")).toContainText("@/stylex/resizable");
});

test("carousel sections mirror shadcn examples in both renderers", async ({
  page,
}) => {
  await page.goto("/docs/components/carousel");
  for (const id of [
    "sizes",
    "spacing",
    "orientation",
    "api",
    "options",
    "plugins",
    "rtl",
  ]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }

  const hero = page.locator('[data-slot="carousel"]').first();
  await expect(
    hero.getByRole("button", { name: "Previous slide" }),
  ).toBeDisabled();
  await hero.getByRole("button", { name: "Next slide" }).click();
  await expect(
    hero.getByRole("button", { name: "Previous slide" }),
  ).toBeEnabled();

  const sizes = page.locator("#sizes");
  await expect(
    sizes.locator('[data-slot="carousel-item"]').first(),
  ).toHaveAttribute("style", /flex-basis:\s*50%/);

  const orientation = page.locator("#orientation");
  await expect(
    orientation.locator('[data-slot="carousel-item"]').first(),
  ).toHaveClass(/pt-4/);

  const options = page.locator("#options");
  for (let i = 0; i < 5; i++) {
    await options.getByRole("button", { name: "Next slide" }).click();
  }
  await expect(
    options.getByRole("button", { name: "Next slide" }),
  ).toBeEnabled();

  const api = page.locator("#api");
  await expect(api).toContainText("Slide 1 of 5");
  await api.getByRole("button", { name: "Next slide" }).click();
  await expect(api).toContainText("Slide 2 of 5");

  const plugins = page.locator("#plugins");
  await expect(
    plugins.getByRole("button", { name: "Previous slide" }),
  ).toBeEnabled({ timeout: 5000 });

  await expect(
    page.locator("#rtl").locator("div[dir='rtl']").first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "StyleX" }).click();
  for (const id of ["sizes", "options", "rtl"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }
  await expect(page.locator("#sizes").locator("code")).toContainText(
    "@/stylex/carousel",
  );
  const optionsSx = page.locator("#options");
  await optionsSx.getByRole("button", { name: "Next slide" }).click();
  await expect(
    optionsSx.getByRole("button", { name: "Next slide" }),
  ).toBeEnabled();
});

test("create icon selection changes the live preview shapes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
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

test("dialog matches upstream sections, restores focus, and scrolls long content", async ({
  page,
}) => {
  await page.goto("/docs/components/dialog");

  for (const id of [
    "compact-confirmation",
    "custom-close-button",
    "no-close-button",
    "sticky-footer",
    "scrollable-content",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  const hero = page.locator('[aria-label="Edit profile preview"]');
  const heroTrigger = hero.getByRole("button", { name: "Open Dialog" });
  await heroTrigger.click();
  const heroDialog = page.locator("#docs-dialog-7");
  await expect(heroDialog).toBeVisible();
  await expect(heroDialog).toHaveAttribute(
    "aria-labelledby",
    "docs-dialog-7-dialog-title",
  );
  await expect(
    heroDialog.getByRole("button", { name: "Cancel" }),
  ).toBeFocused();
  const nameInput = heroDialog.getByRole("textbox", { name: "Name", exact: true });
  await expect(nameInput).toHaveValue("Pedro Duarte");
  await nameInput.fill("Grace Hopper");
  await expect(nameInput).toHaveValue("Grace Hopper");
  await page.keyboard.press("Tab");
  expect(
    await heroDialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(heroDialog).toBeHidden();
  await expect(heroTrigger).toBeFocused();

  const share = page.locator("#custom-close-button");
  await share.getByRole("button", { name: "Share" }).click();
  const shareDialog = page.locator("#docs-dialog-2");
  await expect(shareDialog).toBeVisible();
  const linkInput = shareDialog.getByRole("textbox", { name: "Link" });
  await expect(linkInput).toHaveValue(
    "https://ui.shadcn.com/docs/installation",
  );
  await expect(linkInput).toHaveAttribute("readonly", "");
  await shareDialog
    .locator('[data-slot="dialog-footer"]')
    .getByRole("button", { name: "Close" })
    .click();
  await expect(shareDialog).toBeHidden();

  const noClose = page.locator("#no-close-button");
  const noCloseTrigger = noClose.getByRole("button", {
    name: "No Close Button",
    exact: true,
  });
  await noCloseTrigger.click();
  const noCloseDialog = page.locator("#docs-dialog-3");
  await expect(noCloseDialog).toBeVisible();
  await expect(noCloseDialog.locator('[data-slot="dialog-close"]')).toHaveCount(
    0,
  );
  await page.keyboard.press("Escape");
  await expect(noCloseDialog).toBeHidden();
  await expect(noCloseTrigger).toBeFocused();

  const sticky = page.locator("#sticky-footer");
  await sticky.getByRole("button", { name: "Sticky Footer", exact: true }).click();
  const stickyDialog = page.locator("#docs-dialog-4");
  await expect(stickyDialog).toBeVisible();
  const stickyScroll = stickyDialog.locator(".overflow-y-auto");
  const scrolled = await stickyScroll.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
    return node.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(0);
  await expect(
    stickyDialog
      .locator('[data-slot="dialog-footer"]')
      .getByRole("button", { name: "Close" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const scrollable = page.locator("#scrollable-content");
  await scrollable
    .getByRole("button", { name: "Scrollable Content", exact: true })
    .click();
  const scrollDialog = page.locator("#docs-dialog-5");
  await expect(scrollDialog).toBeVisible();
  const scrollBox = scrollDialog.locator(".overflow-y-auto");
  expect(await scrollBox.evaluate((node) => node.scrollHeight)).toBeGreaterThan(
    await scrollBox.evaluate((node) => node.clientHeight),
  );
  await page.keyboard.press("Escape");

  const rtl = page.locator("#rtl");
  const rtlTrigger = rtl.getByRole("button", { name: "افتح الحوار" });
  await rtlTrigger.click();
  const rtlDialog = page.locator("#docs-dialog-6");
  await expect(rtlDialog).toBeVisible();
  await expect(rtlDialog.locator('[dir="rtl"]')).toBeVisible();
  await expect(
    rtlDialog.getByRole("textbox", { name: "الاسم" }),
  ).toHaveValue("Pedro Duarte");
  await expect(
    rtlDialog.getByRole("button", { name: "إلغاء" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(rtlDialog).toBeHidden();
  await expect(rtlTrigger).toBeFocused();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["compact-confirmation", "custom-close-button", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  const sxShare = page.locator("#custom-close-button");
  await sxShare.getByRole("button", { name: "Share" }).click();
  const sxShareDialog = page.locator("#docs-dialog-2");
  await expect(sxShareDialog).toBeVisible();
  await expect(
    sxShareDialog.getByRole("textbox", { name: "Link" }),
  ).toHaveValue("https://ui.shadcn.com/docs/installation");
  await page.keyboard.press("Escape");
});

test("alert dialog matches upstream sections and keeps async consequences parent owned", async ({
  page,
}) => {
  await page.goto("/docs/components/alert-dialog");

  for (const id of [
    "basic",
    "small",
    "media",
    "small-with-media",
    "destructive",
    "rtl",
    "async-deletion",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  const basic = page.locator("#basic");
  await basic
    .getByRole("button", { name: "Show Dialog", exact: true })
    .click();
  const alertDialog = page.getByRole("alertdialog");
  await expect(alertDialog).toBeVisible();
  await expect(
    alertDialog.getByRole("button", { name: "Cancel" }),
  ).toBeFocused();
  await page
    .locator('[data-slot="alert-dialog-overlay"]')
    .click({ position: { x: 5, y: 5 } });
  await expect(alertDialog).toBeVisible();
  await alertDialog
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(alertDialog).toBeHidden();

  const destructive = page.locator("#destructive");
  await destructive
    .getByRole("button", { name: "Delete Chat", exact: true })
    .click();
  const destructiveDialog = page.getByRole("alertdialog");
  await expect(
    destructiveDialog.locator('[data-slot="alert-dialog-media"]'),
  ).toBeVisible();
  await destructiveDialog
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(destructiveDialog).toBeHidden();

  const rtl = page.locator("#rtl");
  await rtl.locator('[dir="rtl"]').waitFor();
  await rtl
    .getByRole("button", { name: "إظهار الحوار", exact: true })
    .click();
  const rtlDialog = page.getByRole("alertdialog");
  await expect(rtlDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(rtlDialog).toBeHidden();
  await rtl
    .getByRole("button", { name: "إظهار الحوار (صغير)", exact: true })
    .click();
  const rtlSmall = page.getByRole("alertdialog");
  await expect(
    rtlSmall.locator('[data-slot="alert-dialog-media"]'),
  ).toBeVisible();
  await rtlSmall.getByRole("button", { name: "عدم السماح" }).click();
  await expect(rtlSmall).toBeHidden();

  const example = page.locator("#async-deletion");
  const trigger = example.getByRole("button", {
    name: "Delete project",
    exact: true,
  });
  await trigger.click();
  const asyncDialog = page.getByRole("alertdialog");
  await expect(asyncDialog).toBeVisible();
  await asyncDialog
    .getByRole("button", { name: "Delete project", exact: true })
    .click();
  await expect(
    asyncDialog.getByRole("button", { name: "Deleting…" }),
  ).toBeDisabled();
  await expect(asyncDialog).toBeHidden();
  await expect(example.getByRole("status")).toHaveText("Project deleted.");
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#async-deletion")).toBeVisible();
  await expect(page.locator("#rtl")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(example.locator("code")).toContainText(
    "@/stylex/alert-dialog",
  );
  await expect(example.getByRole("status")).toHaveText("Project deleted.");
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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["compound-layout", "bottom-task", "top-sheet", "left-sheet"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(example.locator("code")).toContainText("@/stylex/sheet");
});

test("drawer documents its child model and preserves modal focus behavior", async ({
  page,
}) => {
  await page.goto("/docs/components/drawer");
  const hero = page.locator('[aria-label="Activity goal preview"]');
  const trigger = hero.getByRole("button", { name: "Open Drawer" });

  await trigger.click();
  const heroDrawer = page.locator("#docs-drawer-6");
  await expect(heroDrawer).toBeVisible();
  await expect(heroDrawer.locator('[data-slot="drawer-handle"]')).toBeVisible();
  await expect(heroDrawer.locator('[data-slot="drawer-title"]')).toHaveText(
    "Move goal",
  );
  await expect(
    page.locator("#scrollable-content, #sides, #responsive-dialog, #rtl"),
  ).toHaveCount(4);

  await page.keyboard.press("Escape");
  await expect(heroDrawer).toBeHidden();
  await expect(trigger).toBeFocused();

  const scrollSection = page.locator("#scrollable-content");
  await scrollSection
    .getByRole("button", { name: "Scrollable Content", exact: true })
    .click();
  const scrollDrawer = page.locator("#docs-drawer-2");
  await expect(scrollDrawer).toBeVisible();
  await expect(scrollDrawer.locator('[data-slot="drawer-content"]')).toHaveAttribute(
    "data-vaul-drawer-direction",
    "right",
  );
  const scrollRegion = scrollDrawer.locator(".overflow-y-auto");
  await expect(scrollRegion).toBeVisible();
  const scrollMetrics = await scrollRegion.evaluate(node => ({
    scrollHeight: node.scrollHeight,
    clientHeight: node.clientHeight,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  await page.keyboard.press("Escape");
  await expect(scrollDrawer).toBeHidden();

  const sidesSection = page.locator("#sides");
  await sidesSection.getByRole("button", { name: "left", exact: true }).click();
  const sidesDrawer = page.locator("#docs-drawer-3");
  await expect(sidesDrawer.locator('[data-slot="drawer-content"]')).toHaveAttribute(
    "data-vaul-drawer-direction",
    "left",
  );
  await page.keyboard.press("Escape");
  await expect(sidesDrawer).toBeHidden();
  await sidesSection.getByRole("button", { name: "top", exact: true }).click();
  await expect(sidesDrawer.locator('[data-slot="drawer-content"]')).toHaveAttribute(
    "data-vaul-drawer-direction",
    "top",
  );
  await page.keyboard.press("Escape");
  await expect(sidesDrawer).toBeHidden();

  const responsiveSection = page.locator("#responsive-dialog");
  const editTrigger = responsiveSection.getByRole("button", {
    name: "Edit Profile",
    exact: true,
  });
  await editTrigger.click();
  const responsiveDialog = page.locator("#docs-drawer-dialog-4");
  await expect(responsiveDialog).toBeVisible();
  await expect(responsiveDialog.locator('input[id$="-name"]')).toHaveValue(
    "Pedro Duarte",
  );
  await page.keyboard.press("Escape");
  await expect(responsiveDialog).toBeHidden();
  await page.setViewportSize({ width: 500, height: 800 });
  await page.waitForTimeout(400);
  await editTrigger.click();
  const responsiveDrawer = page.locator("#docs-drawer-4");
  await expect(responsiveDrawer).toBeVisible();
  await expect(responsiveDrawer.locator('input[id$="-name"]')).toHaveValue(
    "Pedro Duarte",
  );
  await page.keyboard.press("Escape");
  await expect(responsiveDrawer).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 800 });

  const rtlSection = page.locator("#rtl");
  const rtlTrigger = rtlSection.getByRole("button", { name: "افتح الدرج" });
  await rtlTrigger.click();
  const rtlDrawer = page.locator("#docs-drawer-5");
  await expect(rtlDrawer).toBeVisible();
  await expect(rtlDrawer.locator('[dir="rtl"]')).toHaveCount(1);
  await expect(rtlDrawer).toContainText("350");
  await rtlDrawer.getByRole("button", { name: "زيادة" }).click();
  await expect(rtlDrawer).toContainText("360");
  await page.keyboard.press("Escape");
  await expect(rtlDrawer).toBeHidden();
  await expect(rtlTrigger).toBeFocused();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#scrollable-content")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(scrollSection.locator("code")).toContainText("@/stylex/drawer");
  const sideExample = page.locator("#side-drawer");
  const sideTrigger = sideExample.getByRole("button", {
    name: "Open right drawer",
  });
  await sideTrigger.click();
  const sideDrawer = page.locator("#docs-drawer-1");
  await expect(sideDrawer).toBeVisible();
  await expect(sideDrawer.locator('[data-slot="drawer-content"]')).toHaveAttribute(
    "data-vaul-drawer-direction",
    "right",
  );
  await page.keyboard.press("Escape");
  await expect(sideDrawer).toBeHidden();
  await expect(sideTrigger).toBeFocused();
});

test("popover delegates disclosure commands and restores trigger focus", async ({
  page,
}) => {
  await page.goto("/docs/components/popover");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  const example = page.locator("#interactive-content");
  await expect(example).toBeVisible();
  await expect(page.locator("#right-aligned")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(example.locator("code")).toContainText("@/stylex/popover");
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
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  const example = page.locator('[aria-label="Activity goal preview"]');
  const trigger = example.getByRole("button", { name: "Open Drawer" });
  await trigger.click();

  const drawer = page.locator("#docs-drawer-6");
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
  await page.getByRole("button", { name: "StyleX", exact: true }).click();

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

test("hover-card sections match upstream variants in both renderers", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/hover-card");

  const hero = page.locator('[aria-label="Basic preview"]');
  const heroTrigger = hero.getByRole("button", {
    name: "Preview the Next.js profile",
  });
  await expect(heroTrigger).toBeVisible();
  await heroTrigger.focus();
  const heroPanel = hero.locator('[data-slot="hover-card-content"]');
  await expect(heroPanel).toBeVisible();
  await expect(heroTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(heroPanel).toContainText("@nextjs");
  await expect(heroPanel).toContainText("Joined December 2021");
  await page.keyboard.press("Escape");
  await expect(heroPanel).toBeHidden();
  await expect(heroTrigger).toBeFocused();

  const sides = page.locator("#sides");
  await expect(sides).toBeVisible();
  for (const side of ["Left", "Top", "Bottom", "Right"] as const) {
    await expect(
      sides.getByRole("button", { name: `Hover card on the ${side.toLowerCase()} side`, exact: true }),
    ).toBeVisible();
  }
  await sides
    .getByRole("button", { name: "Hover card on the right side", exact: true })
    .hover();
  const sidePanel = sides.locator('[data-slot="hover-card-content"]');
  await expect(sidePanel).toBeVisible();
  await expect(sidePanel).toContainText("right side of the trigger");
  await sidePanel.hover();
  await page.waitForTimeout(200);
  await expect(sidePanel).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(sidePanel).toBeHidden({ timeout: 2_000 });

  await sides
    .getByRole("button", { name: "Hover card on the left side", exact: true })
    .evaluate((element) =>
      element.dispatchEvent(
        new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }),
      ),
    );
  await expect(sidePanel).toBeVisible();
  await expect(sidePanel).toContainText("left side of the trigger");
  await sides
    .getByRole("button", { name: "Hover card on the left side", exact: true })
    .evaluate((element) =>
      element.dispatchEvent(
        new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }),
      ),
    );
  await expect(sidePanel).toBeHidden();

  const rtl = page.locator("#rtl");
  await expect(rtl).toBeVisible();
  await expect(rtl.locator('[dir="rtl"]')).toHaveCount(0);
  await rtl.getByRole("button", { name: "يسار", exact: true }).hover();
  const rtlPanel = rtl.locator('[data-slot="hover-card-content"]');
  await expect(rtlPanel).toBeVisible();
  await expect(rtlPanel.locator('[dir="rtl"]')).toContainText("سماعات لاسلكية");
  await expect(rtlPanel).toContainText("٩٩.٩٩ $");

  await page.getByRole("button", { name: "StyleX" }).click();
  const sxHero = page.locator('[aria-label="Basic preview"]');
  await sxHero
    .getByRole("button", { name: "Preview the Next.js profile" })
    .focus();
  const sxPanel = sxHero.locator('[data-slot="hover-card-content"]');
  await expect(sxPanel).toBeVisible();
  await expect(sxPanel).toHaveCSS("transition-property", "none");
  await expect(page.locator("#sides")).toBeVisible();
  await expect(page.locator("#rtl")).toBeVisible();
  await expect(sxHero.locator("code")).toContainText("@/stylex/hover-card");
});

test("tooltip opens from keyboard focus and dismisses without moving focus", async ({
  page,
}) => {
  await page.goto("/docs/components/tooltip");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#delayed-label")).toBeVisible();
  await expect(page.locator("#side-label")).toBeVisible();
  await expect(page.locator("#disabled-trigger")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  const example = page.locator("#delayed-label");
  const trigger = example.getByRole("button", { name: "Add item to library" });
  await trigger.focus();
  const panel = page.locator('[data-slot="tooltip-content"]');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveText(/Add to library/u);
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await expect(example.locator("code")).toContainText("@/stylex/tooltip");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("select persists a typed OutMessage selection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/select");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#typed-selection")).toBeVisible();
  await expect(page.locator("#grouped-fruit")).toBeVisible();
  await expect(page.locator("#disabled-option")).toBeVisible();
  await expect(page.locator("#read-only-rtl")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
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
  await expect(example.locator("code")).toContainText("@/stylex/select");

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
  await page.getByRole("button", { name: "StyleX" }).click();
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
  for (const id of [
    "basic",
    "clear-button",
    "groups",
    "custom-items",
    "invalid",
    "disabled",
    "input-group",
    "rtl",
  ]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }
  const example = page.locator("#basic");
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
  await expect(
    example.locator('input[type="hidden"][name="docs-combobox"]'),
  ).toHaveValue("sveltekit");

  const clearExample = page.locator("#clear-button");
  const clearInput = clearExample.getByRole("combobox", { name: "Framework" });
  await expect(clearInput).toHaveValue("Next.js");
  await clearExample.getByRole("button", { name: "Clear selection" }).click();
  await expect(clearInput).toHaveValue("");

  const groupsExample = page.locator("#groups");
  await groupsExample.getByRole("combobox", { name: "Timezone" }).fill("yor");
  await expect(page.getByRole("option", { name: "(GMT-5) New York" })).toBeVisible();
  await expect(page.getByText("Americas", { exact: true }).first()).toBeVisible();
  await page.keyboard.press("Escape");

  const customExample = page.locator("#custom-items");
  await customExample.getByRole("combobox", { name: "Country" }).fill("jap");
  await expect(page.getByRole("option", { name: /Japan/u })).toBeVisible();

  const disabledExample = page.locator("#disabled");
  await expect(
    disabledExample.getByRole("combobox", { name: "Framework" }),
  ).toHaveAttribute("aria-disabled", "true");

  const rtlExample = page.locator("#rtl");
  await expect(rtlExample.locator('[data-slot="command"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
});

test("command dialogs filter and select items per section", async ({
  page,
}) => {
  await page.goto("/docs/components/command");
  await page.getByRole("button", { name: "StyleX" }).click();
  for (const section of [
    "#basic",
    "#shortcuts",
    "#groups",
    "#scrollable",
    "#rtl",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }

  const basic = page.locator("#basic");
  await basic.getByRole("button", { name: "Open Menu" }).click();
  const basicInput = page.getByRole("combobox", { name: "Command menu" });
  await expect(basicInput).toBeVisible();
  await basicInput.fill("calc");
  const calculator = page.getByRole("option", { name: /Calculator/u });
  await expect(calculator).toBeVisible();
  await calculator.click();
  await expect(basicInput).toHaveValue("Calculator");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  const shortcuts = page.locator("#shortcuts");
  await shortcuts.getByRole("button", { name: "Open Menu" }).click();
  const shortcutInput = page.getByRole("combobox", { name: "Command menu" });
  await expect(shortcutInput).toBeVisible();
  await shortcutInput.focus();
  const profile = page.getByRole("option", { name: /Profile/u });
  await expect(profile).toBeVisible();
  await expect(
    page.locator('[data-slot="command-shortcut"]').first(),
  ).toContainText("⌘P");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  const scrollable = page.locator("#scrollable");
  await scrollable.getByRole("button", { name: "Open Menu" }).click();
  const scrollInput = page.getByRole("combobox", { name: "Command menu" });
  await expect(scrollInput).toBeVisible();
  await scrollInput.fill("nonexistent");
  await expect(
    page.getByRole("status").filter({ hasText: "No results found." }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  const rtl = page.locator("#rtl");
  await rtl.getByRole("button", { name: "Open Menu" }).click();
  const rtlInput = page.getByRole("combobox", { name: "قائمة الأوامر" });
  await expect(rtlInput).toBeVisible();
  await rtlInput.focus();
  await expect(
    page.getByRole("option", { name: /التقويم/u }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
});

test("dropdown menu exposes typed selection wiring and keyboard behavior", async ({
  page,
}) => {
  await page.goto("/docs/components/dropdown-menu");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator('[aria-label="Basic preview"]')).toBeVisible();
  for (const section of [
    "#basic",
    "#submenu",
    "#shortcuts",
    "#icons",
    "#checkboxes",
    "#checkboxes-icons",
    "#radio-group",
    "#radio-icons",
    "#destructive",
    "#avatar",
    "#complex",
    "#rtl",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  const example = page.locator("#basic");
  const trigger = example.getByRole("button", { name: "Open" });
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
    "DropdownMenu.create<Item>()",
  );
  await expect(example.locator("code")).toContainText("@/stylex/dropdown-menu");

  const submenuExample = page.locator("#submenu");
  const submenuTrigger = submenuExample.getByRole("button", { name: "Open" });
  await submenuTrigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("i");
  const invite = submenuExample.getByRole("menuitem", { name: /Invite users/u });
  await expect(invite).toHaveAttribute("data-active", "true");
  await page.keyboard.press("ArrowRight");
  const menus = submenuExample.getByRole("menu");
  await expect(menus).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(menus).toHaveCount(0);
  await expect(submenuTrigger).toBeFocused();

  const shortcutsExample = page.locator("#shortcuts");
  await shortcutsExample.getByRole("button", { name: "Open" }).click();
  await shortcutsExample.getByRole("menuitem", { name: /More tools/u }).hover();
  await expect(
    shortcutsExample.getByRole("menuitem", { name: /Name window/u }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");

  const checkboxExample = page.locator("#checkboxes");
  await checkboxExample
    .getByRole("button", { name: "View options" })
    .click();
  const statusBar = checkboxExample.getByRole("menuitemcheckbox", {
    name: /Status Bar/u,
  });
  await expect(statusBar).toHaveAttribute("aria-checked", "true");
  await statusBar.click();
  await checkboxExample
    .getByRole("button", { name: "View options" })
    .click();
  await expect(statusBar).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Escape");

  const radioExample = page.locator("#radio-group");
  await radioExample.getByRole("button", { name: "Open" }).click();
  const bottom = radioExample.getByRole("menuitemradio", { name: /Bottom/u });
  await expect(
    radioExample.getByRole("menuitemradio", { name: /Top/u }),
  ).toHaveAttribute("aria-checked", "true");
  await bottom.click();
  await radioExample.getByRole("button", { name: "Open" }).click();
  await expect(bottom).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");

  const destructiveExample = page.locator("#destructive");
  await destructiveExample.getByRole("button", { name: "Actions" }).click();
  await expect(
    destructiveExample.getByRole("menuitem", { name: "Delete" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const rtlExample = page.locator("#rtl");
  const rtlTrigger = rtlExample.getByRole("button", { name: "افتح القائمة" });
  await expect(rtlExample.locator('[data-slot="dropdown-menu"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
  await rtlTrigger.focus();
  await expect(rtlTrigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(rtlExample.getByRole("menu")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(rtlExample.getByRole("menuitem", { name: /دعوة/u })).toHaveAttribute(
    "data-active",
    "true",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(rtlExample.getByRole("menu")).toHaveCount(2);
});

test("context menu sections anchor, toggle, and select per fixture", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 720 });
  await page.goto("/docs/components/context-menu");
  await page.getByRole("button", { name: "StyleX" }).click();
  for (const section of [
    "#basic",
    "#submenu",
    "#shortcuts",
    "#groups",
    "#icons",
    "#checkboxes",
    "#radio",
    "#destructive",
    "#rtl",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }
  const example = page.locator("#basic");
  const target = example.getByRole("button", { name: "Right click here" });
  await target.click({ button: "right", position: { x: 10, y: 20 } });
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const firstX = (await menu.boundingBox())?.x ?? 0;
  await expect(menu.getByRole("menuitem", { name: "Forward" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(example.locator("code")).toContainText("@/stylex/context-menu");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await target.click({ button: "right", position: { x: 270, y: 120 } });
  const bounds = await menu.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.x ?? 999).toBeGreaterThan(firstX);
  await page.keyboard.press("Escape");

  const submenuExample = page.locator("#submenu");
  await submenuExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: "More Tools" }).hover();
  await expect(
    page.getByRole("menuitem", { name: "Developer Tools" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const checkboxExample = page.locator("#checkboxes");
  await checkboxExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(menu).toBeVisible();
  const fullUrls = menu.getByRole("menuitemcheckbox", {
    name: /Show Full URLs/u,
  });
  await expect(fullUrls).toHaveAttribute("aria-checked", "false");
  await fullUrls.click();
  await checkboxExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(
    menu.getByRole("menuitemcheckbox", { name: /Show Full URLs/u }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");

  const radioExample = page.locator("#radio");
  await radioExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("menuitemradio", { name: /Pedro Duarte/u }),
  ).toHaveAttribute("aria-checked", "true");
  await menu.getByRole("menuitemradio", { name: /Dark/u }).click();
  await radioExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(
    menu.getByRole("menuitemradio", { name: /Pedro Duarte/u }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    menu.getByRole("menuitemradio", { name: /Dark/u }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");

  const rtlExample = page.locator("#rtl");
  await rtlExample.getByRole("button", { name: "Right click here" }).click({ button: "right" });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("menuitem", { name: /المزيد من الأدوات/u }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

test("navigation menu distinguishes semantic links from stateful disclosures", async ({
  page,
}) => {
  await page.goto("/docs/components/navigation-menu");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#semantic-links")).toBeVisible();
  await expect(page.locator("#popover-disclosure")).toBeVisible();
  await expect(page.locator("#responsive-fallback")).toBeVisible();
  await expect(page.locator("#rtl-overflow")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
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
  await expect(linksExample.locator("code")).toContainText("@/stylex/navigation-menu");

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
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#coordinated-menus")).toBeVisible();
  await expect(page.locator("#shortcut-hints")).toBeVisible();
  await expect(page.locator("#rtl-switching")).toBeVisible();
  await expect(page.locator("#disabled-submenu")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  const example = page.locator("#coordinated-menus");
  const menubar = example.getByRole("menubar", { name: "Application menu" });
  await expect(menubar).toBeVisible();
  await example.getByRole("menuitem", { name: "File" }).click();
  const menu = example.getByRole("menu", { name: "File" });
  await expect(menu).toBeVisible();
  const save = menu.getByRole("menuitem", { name: /Save/u });
  await expect(save).toContainText("⌘S");
  await expect(save).toHaveAttribute("aria-disabled", "true");
  await expect(example.locator("code")).toContainText("GotMenuMessage");
  await expect(example.locator("code")).toContainText("Menubar.update");
  await expect(example.locator("code")).toContainText("@/stylex/menubar");
  const fileTrigger = example.getByRole("menuitem", { name: "File" });
  await fileTrigger.focus();
  await page.keyboard.press("ArrowRight");
  const editTrigger = example.getByRole("menuitem", { name: "Edit" });
  await expect(editTrigger).toBeFocused();
  await expect(example.getByRole("menu", { name: "Edit" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(example.getByRole("menu", { name: "Edit" })).toBeHidden();

  const rtl = page.locator("#rtl-switching");
  const rtlFile = rtl.getByRole("menuitem", { name: "File" });
  await rtlFile.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rtl.getByRole("menuitem", { name: "View" })).toBeFocused();
  await page.keyboard.press("Escape");

  const nested = page.locator("#disabled-submenu");
  await nested.getByRole("menuitem", { name: "File" }).click();
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
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#addressable-pages")).toBeVisible();
  await expect(page.locator("#in-place-results")).toBeVisible();
  await expect(page.locator("#compact-neighborhood")).toBeVisible();
  await expect(page.locator("#disabled-boundary")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);

  const links = page.locator("#addressable-pages");
  const current = links.getByRole("link", { name: "Page 6, current page" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(links.getByRole("link", { name: "Go to page 5" })).toHaveAttribute("href", "#");
  await expect(links.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2);

  const actions = page.locator("#in-place-results");
  await actions.getByRole("button", { name: "Go to page 3" }).click();
  await expect(actions.getByRole("button", { name: "Page 3, current page" })).toHaveAttribute("aria-current", "page");
  await expect(actions.locator("code")).toContainText("ChangedPage");

  const compact = page.locator("#compact-neighborhood");
  await expect(compact.locator('[data-slot="pagination-link"][aria-label^="Go to page"], [data-slot="pagination-link"][aria-label^="Page "]')).toHaveCount(3);
  await expect(compact.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2);
  await expect(links.locator("code")).toContainText("@/stylex/pagination");

  const boundary = page.locator("#disabled-boundary");
  const previous = boundary.getByRole("button", { name: "Go to previous page" });
  await expect(previous).toBeDisabled();
  await expect(previous).not.toBeFocused();
  await boundary.getByRole("button", { name: "Go to next page" }).click();
  await expect(boundary.getByRole("button", { name: "Page 2, current page" })).toHaveAttribute("aria-current", "page");
});

test("breadcrumb sections mirror shadcn examples in both renderers", async ({ page }) => {
  await page.goto("/docs/components/breadcrumb");

  const hero = page.locator('[aria-label="Demo preview"]');
  const heroNav = hero.getByRole("navigation", { name: "Breadcrumb" });
  await expect(heroNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#");
  await expect(heroNav.locator('[data-slot="breadcrumb-ellipsis"]')).toBeVisible();
  await expect(heroNav.locator('[data-slot="breadcrumb-page"]')).toHaveText("Breadcrumb");

  for (const id of ["basic", "custom-separator", "dropdown", "collapsed", "link-component", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  const basic = page.locator("#basic").getByRole("navigation", { name: "Breadcrumb" });
  await expect(basic.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#");
  await expect(basic.getByRole("link", { name: "Components" })).toHaveAttribute("href", "#");
  const basicPage = basic.locator('[data-slot="breadcrumb-page"]');
  await expect(basicPage).toHaveAttribute("aria-current", "page");
  await expect(basic.locator('[data-slot="breadcrumb-separator"]').first()).toHaveAttribute("aria-hidden", "true");

  const separator = page.locator("#custom-separator").locator('[data-slot="breadcrumb-separator"] svg.lucide-dot');
  await expect(separator).toHaveCount(2);

  const dropdown = page.locator("#dropdown");
  await dropdown.getByRole("button", { name: "Components" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Documentation" })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "GitHub" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  const collapsed = page.locator("#collapsed");
  await expect(collapsed.locator('[data-slot="breadcrumb-ellipsis"]')).toBeVisible();
  await expect(collapsed.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");

  const linkComponent = page.locator("#link-component");
  await expect(linkComponent.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(linkComponent.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");

  const rtl = page.locator("#rtl").getByRole("navigation", { name: "Breadcrumb" });
  await expect(rtl).toHaveAttribute("dir", "rtl");
  await expect(rtl.locator('[data-slot="breadcrumb-page"]')).toHaveText("مسار التنقل");

  await hero.getByRole("button").first().click();
  await expect(page.getByRole("menuitem", { name: "Themes" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#basic code")).toContainText("@/stylex/breadcrumb");
  const stylexNav = page.locator("#basic").getByRole("navigation", { name: "Breadcrumb" });
  await expect(stylexNav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.locator("#rtl").getByRole("navigation", { name: "Breadcrumb" })).toHaveAttribute("dir", "rtl");
  await page.locator("#dropdown").getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("menuitem", { name: "Documentation" })).toBeVisible();
  await page.keyboard.press("Escape");
});

test("alert requires explicit severity and announcement policy", async ({ page }) => {
  await page.goto("/docs/components/alert");
  const basic = page.locator("#basic").locator('[data-slot="alert"]');
  await expect(basic).toHaveAttribute("data-severity", "success");
  await expect(basic).not.toHaveAttribute("role");
  await expect(basic.locator('[data-slot="alert-icon"]')).toHaveAttribute("aria-hidden", "true");

  const destructive = page.locator("#destructive").getByRole("alert");
  await expect(destructive).toHaveAttribute("aria-live", "assertive");
  await expect(destructive).toHaveAttribute("data-severity", "error");

  await expect(
    page.locator("#action").getByRole("button", { name: "Enable" }),
  ).toBeVisible();

  const colors = page.locator("#custom-colors").getByRole("status");
  await expect(colors).toHaveAttribute("aria-live", "polite");
  await expect(colors).toHaveAttribute("data-severity", "warning");

  const rtl = page.locator("#rtl");
  await expect(rtl.locator("[dir='rtl']")).toHaveCount(1);
  await expect(rtl.locator('[data-slot="alert"]')).toHaveCount(2);

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#basic")).toBeVisible();
  await expect(page.locator("#destructive")).toBeVisible();
  await expect(page.locator("#action")).toBeVisible();
  await expect(page.locator("#custom-colors")).toBeVisible();
  await expect(page.locator("#rtl")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#basic code")).toContainText(
    "@/stylex/alert",
  );
  await expect(page.locator("#custom-colors").getByRole("status")).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("aspect ratio keeps upstream-named examples and geometry across renderers", async ({ page }) => {
  await page.goto("/docs/components/aspect-ratio");
  const square = page.locator("#square").locator('[data-slot="aspect-ratio"]');
  const portrait = page.locator("#portrait").locator('[data-slot="aspect-ratio"]');
  const rtl = page.locator("#rtl").locator('[data-slot="aspect-ratio"]');
  await expect(square).toHaveCSS("aspect-ratio", "1 / 1");
  await expect(portrait).toHaveCSS("aspect-ratio", "0.5625 / 1");
  await expect(rtl).toHaveCSS("aspect-ratio", "1.77778 / 1");
  await expect(page.locator("#rtl figure")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#rtl figcaption")).toContainText("منظر طبيعي جميل");
  await expect(page.locator("#square img")).toBeVisible();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#square")).toBeVisible();
  await expect(page.locator("#portrait")).toBeVisible();
  await expect(page.locator("#rtl")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#square code")).toContainText("@/stylex/aspect-ratio");
  await expect(square).toHaveCSS("aspect-ratio", "1 / 1");
  await expect(portrait).toHaveCSS("aspect-ratio", "0.5625 / 1");
  await expect(rtl).toHaveCSS("aspect-ratio", "1.77778 / 1");
  await expect(page.locator("#rtl figure")).toHaveAttribute("dir", "rtl");
});

test("badge keeps authored variants across renderers", async ({ page }) => {
  await page.goto("/docs/components/badge");
  const variants = page.locator("#variants");
  await expect(variants.getByText("Default", { exact: true }).first()).toBeVisible();
  await expect(variants.getByText("Ghost", { exact: true }).first()).toBeVisible();
  for (const id of [
    "basic",
    "variants",
    "with-icon",
    "with-spinner",
    "link",
    "custom-colors",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(
    page.locator("#with-spinner svg.animate-spin").first(),
  ).toBeVisible();
  await expect(page.locator("#link a[data-slot='badge']")).toBeVisible();
  const blue = page.locator("#custom-colors span[data-slot='badge']", {
    hasText: "Blue",
  });
  await expect(blue).toHaveCSS("background-color", "oklch(0.97 0.014 254.604)");
  await expect(page.locator("#rtl div[dir]")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#variants")).toBeVisible();
  await expect(page.locator("#custom-colors")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#variants code")).toContainText("@/stylex/badge");
  await expect(variants.getByText("Default", { exact: true }).first()).toBeVisible();
  await expect(variants.getByText("Ghost", { exact: true }).first()).toBeVisible();
  await expect(page.locator("#link a[href='#link']:has-text('Open Link')")).toBeVisible();
  await expect(page.locator("#with-icon svg[data-icon='inline-start']")).toBeVisible();
});

test("kbd keeps semantic key notation across renderers", async ({ page }) => {
  await page.goto("/docs/components/kbd");
  await expect(page.locator("#key").locator('[data-slot="kbd"]')).toHaveText("Esc");
  await expect(page.locator("#shortcut").locator("kbd[data-slot=\"kbd-group\"]")).toBeVisible();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#key")).toBeVisible();
  await expect(page.locator("#shortcut")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#key code")).toContainText("@/stylex/kbd");
  await expect(page.locator("#key").locator('[data-slot="kbd"]')).toHaveText("Esc");
  await expect(page.locator("#shortcut").locator("kbd[data-slot=\"kbd-group\"]")).toBeVisible();
});

test("label keeps native control association across renderers", async ({ page }) => {
  await page.goto("/docs/components/label");
  const email = page.locator("#docs-email");
  await page.locator('#input-label label[data-slot="label"]').click();
  await expect(email).toBeFocused();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#input-label")).toBeVisible();
  await expect(page.locator("#supporting-text")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#input-label code")).toContainText("@/stylex/label");
  await page.locator('#input-label label[data-slot="label"]').click();
  await expect(email).toBeFocused();
});

test("marker keeps authored variants and annotation semantics across renderers", async ({ page }) => {
  await page.goto("/docs/components/marker");
  const separator = page.locator("#separator").locator('[data-slot="marker"]');
  const withIcon = page.locator("#with-icon").locator('[data-slot="marker"]');
  await expect(separator).toHaveAttribute("data-variant", "separator");
  await expect(separator).toHaveAttribute("role", "note");
  await expect(withIcon.locator('[data-slot="marker-icon"]')).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#separator")).toBeVisible();
  await expect(page.locator("#with-icon")).toBeVisible();
  await expect(page.locator("#border")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#separator code")).toContainText("@/stylex/marker");
  await expect(separator).toHaveAttribute("data-variant", "separator");
  await expect(separator).toHaveAttribute("role", "note");
  await expect(withIcon.locator('[data-slot="marker-icon"]')).toHaveAttribute("aria-hidden", "true");
});

test("separator keeps decorative and semantic boundaries across renderers", async ({ page }) => {
  await page.goto("/docs/components/separator");
  const horizontal = page.locator("#horizontal");
  const vertical = page.locator("#vertical");
  await expect(horizontal.getByRole("separator")).toHaveCount(0);
  await expect(vertical.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(horizontal).toBeVisible();
  await expect(vertical).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(horizontal.locator("code")).toContainText("@/stylex/separator");
  await expect(horizontal.getByRole("separator")).toHaveCount(0);
  await expect(vertical.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
});

test("typography keeps semantic prose examples across renderers", async ({ page }) => {
  await page.goto("/docs/components/typography");
  const article = page.locator("#article");
  await expect(article.getByRole("heading", { level: 2, name: "Foldkit architecture" })).toBeVisible();
  await expect(page.locator("#inline-code").locator("code[data-slot=\"typography-inline-code\"]")).toHaveText("h.submodel");
  await expect(page.locator("#quotation").locator("blockquote")).toBeVisible();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(article).toBeVisible();
  await expect(page.locator("#inline-code")).toBeVisible();
  await expect(page.locator("#quotation")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(article.locator("code")).toContainText("@/stylex/typography");
  await expect(article.getByRole("heading", { level: 2, name: "Foldkit architecture" })).toBeVisible();
  await expect(page.locator("#inline-code").locator("code[data-slot=\"typography-inline-code\"]")).toHaveText("h.submodel");
  await expect(page.locator("#quotation").locator("blockquote")).toBeVisible();
});

test("sidebar documents persistence and toggles derived shell state", async ({
  page,
}) => {
  await page.goto("/docs/components/sidebar");
  const example = page.locator("#application-shell");
  const provider = example.locator('[data-slot="sidebar-wrapper"]');
  const trigger = example.locator('[data-slot="sidebar-trigger"]:visible');
  await expect(provider).toHaveAttribute("data-state", "expanded");
  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(provider).toHaveAttribute("data-state", "collapsed");
  await expect(example.locator("code")).toContainText("Sidebar.shortcut");
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#application-shell")).toBeVisible();
  await expect(page.locator("#floating-sidebar")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(provider).toHaveAttribute("data-state", "collapsed");
  await expect(example.locator("code")).toContainText("@/stylex/sidebar");
  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(provider).toHaveAttribute("data-state", "expanded");
});

test("accordion matches upstream examples and enforces state rules", async ({
  page,
}) => {
  await page.goto("/docs/components/accordion");
  const basic = page.locator("#basic");
  const password = basic.getByRole("button", {
    name: "How do I reset my password?",
  });
  const subscription = basic.getByRole("button", {
    name: "Can I change my subscription plan?",
  });
  await expect(password).toHaveAttribute("aria-expanded", "true");
  await subscription.click();
  await expect(subscription).toHaveAttribute("aria-expanded", "true");
  await expect(password).toHaveAttribute("aria-expanded", "false");
  await expect(basic.locator("code")).toContainText("Update.foldChild");
  await expect(basic.locator("code")).toContainText("foldOutMessage");

  const multiple = page.locator("#multiple");
  const notifications = multiple.getByRole("button", {
    name: "Notification Settings",
  });
  const privacy = multiple.getByRole("button", { name: "Privacy & Security" });
  const billing = multiple.getByRole("button", {
    name: "Billing & Subscription",
  });
  await expect(notifications).toHaveAttribute("aria-expanded", "true");
  await privacy.click();
  await billing.click();
  await expect(privacy).toHaveAttribute("aria-expanded", "true");
  await expect(billing).toHaveAttribute("aria-expanded", "true");
  await expect(notifications).toHaveAttribute("aria-expanded", "true");

  const disabled = page.locator("#disabled");
  await expect(
    disabled.getByRole("button", { name: "Premium feature information" }),
  ).toBeDisabled();
  await disabled
    .getByRole("button", { name: "Can I access my account history?" })
    .click();
  await expect(
    disabled.getByRole("button", {
      name: "Can I access my account history?",
    }),
  ).toHaveAttribute("aria-expanded", "true");

  for (const id of ["borders", "card", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#card")).toContainText("Subscription & Billing");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of [
    "basic",
    "multiple",
    "disabled",
    "borders",
    "card",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#basic code")).toContainText(
    "@/stylex/accordion",
  );

  // Renderer toggle preserves the shared example model: the Tailwind click
  // opened item-2, so the StyleX render starts with it open.
  const stylexBasic = page.locator("#basic");
  const stylexPassword = stylexBasic.getByRole("button", {
    name: "How do I reset my password?",
  });
  const stylexSubscription = stylexBasic.getByRole("button", {
    name: "Can I change my subscription plan?",
  });
  await expect(stylexPassword).toHaveAttribute("aria-expanded", "false");
  await expect(stylexSubscription).toHaveAttribute("aria-expanded", "true");
  await stylexPassword.click();
  await expect(stylexPassword).toHaveAttribute("aria-expanded", "true");
  await expect(stylexSubscription).toHaveAttribute("aria-expanded", "false");
});

test("attachment sections mirror shadcn examples with working actions", async ({
  page,
}) => {
  await page.goto("/docs/components/attachment");
  for (const id of ["image", "states", "sizes", "group", "trigger"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#demo")).toHaveCount(0);

  const states = page.locator("#states");
  await expect(states.locator('[data-slot="attachment"]')).toHaveCount(5);
  await expect(
    states.locator('[data-slot="attachment"][data-state="error"]'),
  ).toContainText("Upload failed");
  await expect(
    states.locator('[data-slot="attachment"][data-state="done"]'),
  ).toContainText("Uploaded");
  await states
    .getByRole("button", { name: "Remove selected-file.pdf" })
    .click();
  await expect(states.locator('[data-slot="attachment"]')).toHaveCount(4);
  await expect(
    states.locator('[data-slot="attachment-title"]', {
      hasText: "selected-file.pdf",
    }),
  ).toHaveCount(0);

  const trigger = page.locator("#trigger");
  await trigger
    .getByRole("button", { name: "Preview research-summary.pdf" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("research-summary.pdf")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#states")).toBeVisible();
  await expect(
    page.locator('#states [data-slot="attachment"]'),
  ).toHaveCount(4);
  await expect(
    page.locator('#states [data-slot="attachment-title"]', {
      hasText: "selected-file.pdf",
    }),
  ).toHaveCount(0);
  await expect(page.locator("#trigger code")).toContainText(
    "@/stylex/attachment",
  );
});

test("bubble sections mirror shadcn examples in both renderers", async ({ page }) => {
  await page.goto("/docs/components/bubble");

  const hero = page.locator('[aria-label="Demo preview"]');
  await expect(hero).toBeVisible();
  await expect(hero.locator("[data-slot=bubble]").first()).toBeVisible();
  await expect(
    hero.locator("[data-slot=bubble-content]", { hasText: "Hey there!" }),
  ).toBeVisible();
  await expect(
    hero.locator('[aria-label="Reactions: thumbs up, fire, eyes, and 2 more"]'),
  ).toBeVisible();
  for (const id of [
    "variants",
    "alignment",
    "bubble-group",
    "links-and-buttons",
    "reactions",
    "show-more-/-collapsible",
    "tooltip",
    "popover",
  ]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }

  const variants = page.locator('[id="variants"]');
  await expect(variants.locator("[data-slot=bubble]")).toHaveCount(7);
  await expect(variants.locator("[data-variant=tinted]")).toContainText(
    "This one is tinted",
  );
  await expect(variants.locator("[data-variant=ghost]")).toContainText(
    "markdown",
  );

  const alignment = page.locator('[id="alignment"]');
  await expect(alignment.locator("[data-align=start]")).toContainText(
    "aligned to the start",
  );
  await expect(alignment.locator("[data-align=end]")).toContainText(
    "aligned to the end",
  );

  const group = page.locator('[id="bubble-group"]');
  await expect(group.locator("[data-slot=bubble-group]")).toBeVisible();
  await expect(
    group.locator('[aria-label="Reactions: eyes"]'),
  ).toBeVisible();

  const linkButton = page.locator('[id="links-and-buttons"]');
  const option = linkButton.locator(
    "button[data-slot=bubble-content]",
  ).first();
  await option.click();
  await expect(linkButton.getByText(/^You clicked:/)).toBeVisible();

  const reactions = page.locator('[id="reactions"]');
  const runIt = reactions.getByRole("button", { name: "Yes, run it" });
  await runIt.click();
  await expect(
    reactions.getByRole("button", { name: "Ran it" }),
  ).toBeVisible();
  await expect(
    reactions.locator("[data-side=top]"),
  ).toBeVisible();

  const collapsible = page.locator('[id="show-more-/-collapsible"]');
  const collapsibleBody = collapsible
    .locator("[data-slot=bubble-content]")
    .nth(1);
  await expect(collapsibleBody).toContainText("focusable control...");
  await expect(collapsibleBody).not.toContainText("focus treatment later");
  const toggle = collapsible.locator("button[aria-expanded]");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveText("Show more");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    collapsible.getByRole("button", { name: "Show less", exact: true }),
  ).toBeVisible();
  await expect(collapsibleBody).toContainText("focus treatment later");

  const tooltipSection = page.locator('[id="tooltip"]');
  await tooltipSection
    .getByRole("button", { name: "Read receipt" })
    .hover();
  await expect(
    page.getByText("Read on Jan 5, 2026 at 4:32 PM"),
  ).toBeVisible();

  const popoverSection = page.locator('[id="popover"]');
  await popoverSection
    .getByRole("button", { name: "Show error details" })
    .click();
  await expect(
    page.getByText("Command failed with exit code 1", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator('[id="variants"] code')).toContainText(
    "@/stylex/bubble",
  );
  await expect(
    page.locator('[id="variants"]').locator("[data-variant=tinted]"),
  ).toContainText("This one is tinted");
  const sxPopover = page.locator('[id="popover"]');
  await sxPopover
    .getByRole("button", { name: "Show error details" })
    .click();
  await expect(
    page.getByText("Command failed with exit code 1", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const sxLinkButton = page.locator('[id="links-and-buttons"]');
  await sxLinkButton.locator("button[data-slot=bubble-content]").first().click();
  await expect(sxLinkButton.getByText(/^You clicked:/)).toBeVisible();
});

test("item preserves semantic collections and structured metadata", async ({ page }) => {
  await page.goto("/docs/components/item");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#collection")).toBeVisible();
  await expect(page.locator("#outlined")).toBeVisible();
  await expect(page.locator("#header-and-footer")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#collection [role=list]")).toHaveCount(1);
  await expect(page.locator("#collection [role=listitem]")).toHaveCount(2);
  await expect(page.locator("#header-and-footer [data-slot=item-header]")).toContainText("Build #418");
  await expect(page.locator("#header-and-footer [data-slot=item-footer]")).toContainText("2 minutes ago");
  await expect(page.locator("#collection code")).toContainText("@/stylex/item");
});

test("scroll area preserves labeled native overflow on both axes", async ({ page }) => {
  await page.goto("/docs/components/scroll-area");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#vertical")).toBeVisible();
  await expect(page.locator("#horizontal")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  const vertical = page.getByLabel("Component list");
  const horizontal = page.getByLabel("Release versions");
  expect(await vertical.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  expect(await horizontal.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(vertical).toHaveAttribute("tabindex", "0");
  await expect(page.locator("#vertical code")).toContainText("@/stylex/scroll-area");
});

test("message scroller measures overflow and maps its scroll command", async ({
  page,
}) => {
  await page.goto("/docs/components/message-scroller");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#jump-to-latest")).toBeVisible();
  await expect(page.locator("#jump-to-beginning")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  const example = page.locator("#jump-to-latest");
  const viewport = example.locator('[data-slot="message-scroller-viewport"]');
  await expect(viewport).toHaveAttribute("data-pending-scroll", "false");
  await expect.poll(() => viewport.evaluate((node) => Math.round(node.scrollTop + node.clientHeight - node.scrollHeight))).toBeGreaterThanOrEqual(-1);
  await viewport.evaluate((node) => {
    node.scrollTop = 40;
    node.dispatchEvent(new Event("scroll"));
  });
  const button = example.getByRole("button", { name: "Scroll to end" });
  await expect(viewport).toHaveAttribute("data-following", "false");
  await expect(button).toHaveAttribute("data-active", "true");
  await viewport.evaluate((node) => {
    const appended = document.createElement("div");
    appended.style.height = "120px";
    appended.textContent = "Appended message";
    node.querySelector('[data-slot="message-scroller-content"]')?.append(appended);
  });
  await expect(viewport).toHaveAttribute("data-new-messages", "true");
  await button.click();
  await expect(viewport).toHaveAttribute("data-following", "true");
  await expect(viewport).toHaveAttribute("data-new-messages", "false");
  await expect
    .poll(() =>
      viewport.evaluate((node) =>
        Math.round(node.scrollTop + node.clientHeight - node.scrollHeight),
      ),
    )
    .toBeGreaterThanOrEqual(-1);
  await viewport.evaluate((node) => { node.style.height = "240px"; });
  await expect(viewport).toHaveAttribute("data-pending-scroll", "false");
  await expect(example.locator("code")).toContainText("Command.mapMessages");
  await expect(example.locator("code")).toContainText("MessageScroller.update");
  await expect(example.locator("code")).toContainText("@/stylex/message-scroller");
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
    await alert.getByRole("button", { name: "Undo" }).click();
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
    await expect(statuses).toHaveCount(2);
    await page.mouse.move(0, 0);
    await expect(statuses).toHaveCount(0, { timeout: 6000 });
    if (route === "sonner") {
      await page.getByRole("button", { name: "StyleX", exact: true }).click();
      for (const id of ["timed-notification", "sticky-error", "async-save-migration", "imperative-api-migration"]) {
        await expect(page.locator(`#${id}`)).toBeVisible();
      }
      await expect(page.locator("#stylex-specimen")).toHaveCount(0);
      await expect(example.locator("code")).toContainText("@/stylex/sonner");
      await example.getByRole("button", { name: "Show sonner" }).click();
      await expect(viewport.getByRole("alert")).toContainText("Could not save changes");
    } else {
      await page.getByRole("button", { name: "StyleX", exact: true }).click();
      await expect(page.locator("#timed-notification")).toBeVisible();
      await expect(page.locator("#sticky-error")).toBeVisible();
      await expect(page.locator("#stylex-specimen")).toHaveCount(0);
      await expect(example.locator("code")).toContainText("@/stylex/toast");
      await example.getByRole("button", { name: "Show toast" }).click();
      await expect(viewport.getByRole("alert")).toContainText("Could not save changes");
    }
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

test("calendar sections mirror shadcn examples in both renderers", async ({
  page,
}) => {
  await page.goto("/docs/components/calendar");
  for (const id of [
    "basic",
    "range-calendar",
    "month-and-year-selector",
    "presets",
    "date-and-time-picker",
    "booked-dates",
    "custom-cell-size",
    "week-numbers",
    "rtl",
  ]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }

  const basic = page
    .locator("#basic")
    .locator('[data-slot="calendar"]');
  const day = basic.getByRole("button", { name: "Monday, July 20, 2026" });
  await day.click();
  await expect(day.locator("..")).toHaveAttribute("data-selected", "");

  const range = page
    .locator("#range-calendar")
    .locator('[data-slot="calendar"]');
  await expect(
    range
      .getByRole("button", { name: "Tuesday, July 14, 2026" })
      .locator(".."),
  ).toHaveAttribute("data-range", "start");
  await expect(
    range
      .getByRole("button", { name: "Friday, July 17, 2026" })
      .locator(".."),
  ).toHaveAttribute("data-range", "middle");
  await expect(
    range
      .getByRole("button", { name: "Monday, July 20, 2026" })
      .locator(".."),
  ).toHaveAttribute("data-range", "end");

  const caption = page
    .locator("#month-and-year-selector")
    .locator('[data-slot="calendar"]');
  await caption
    .getByRole("button", { name: "Switch to month picker" })
    .click();
  await caption
    .getByRole("button")
    .filter({ hasText: "Aug" })
    .first()
    .click();
  await expect(caption).toContainText("August 2026");

  const presets = page.locator("#presets");
  await presets.getByRole("button", { name: "In a week" }).click();
  await expect(
    presets.locator('[data-slot="calendar"] [data-selected]').first(),
  ).toBeVisible();
  await expect(presets.locator('[data-slot="calendar"]')).toContainText(
    "August 2026",
  );

  const time = page.locator("#date-and-time-picker");
  await expect(time.locator('input[type="time"]')).toHaveCount(2);
  const startTime = time.locator('input[type="time"]').first();
  await startTime.fill("14:45");
  await expect(startTime).toHaveValue(/14:45/);

  const booked = page
    .locator("#booked-dates")
    .locator('[data-slot="calendar"]');
  await expect(
    booked.getByRole("button", { name: "Sunday, July 12, 2026" }),
  ).toBeDisabled();

  const weekNumbers = page
    .locator("#week-numbers")
    .locator('[data-slot="calendar"]');
  await expect(
    weekNumbers.locator('[data-slot="calendar-week-number"]', {
      hasText: "30",
    }),
  ).toBeVisible();

  const rtl = page.locator("#rtl").locator('[data-slot="calendar"]');
  await expect(rtl).toHaveAttribute("dir", "rtl");
  await expect(rtl).toContainText("Juli 2026");
  await expect(rtl).toContainText("Mo");

  await page.getByRole("button", { name: "StyleX" }).click();
  for (const id of [
    "basic",
    "presets",
    "week-numbers",
    "rtl",
  ]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }
  await expect(
    page
      .locator("#week-numbers")
      .locator('[data-slot="calendar-week-number"]', { hasText: "30" }),
  ).toBeVisible();
  await expect(page.locator("#rtl").locator('[data-slot="calendar"]'))
    .toHaveAttribute("dir", "rtl");
  await expect(
    page.locator("#basic").locator("code"),
  ).toContainText("@/stylex/calendar");
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
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["existing-value", "empty-value"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(example.locator("code")).toContainText("@/stylex/date-picker");
  await expect(input).toHaveValue("2026-08-20");
  await expect(hiddenInput).toHaveValue("2026-08-20");
  await trigger.click();
  await expect(page.locator('[data-slot="popover-content"]')).toContainText("August 2026");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(pageErrors).toEqual([]);
});

test("direction preserves RTL and nested LTR semantics across renderers", async ({ page }) => {
  await page.goto("/docs/components/direction");
  const rtl = page.locator("#right-to-left");
  const mixed = page.locator("#mixed-direction");
  await expect(rtl.locator('[dir="rtl"]')).toContainText("التالي");
  await expect(mixed.locator('[dir="rtl"]')).toContainText("الإصدار");
  await expect(mixed.locator('[dir="ltr"]')).toContainText("v0.148.2");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(rtl.locator('[dir="rtl"]')).toContainText("التالي");
  await expect(mixed.locator('[dir="ltr"]')).toContainText("v0.148.2");
  await expect(rtl.locator("code")).toContainText("@/stylex/direction");
});

test("chart documents SVG recipes and the complete ECharts family showcase", async ({
  page,
}) => {
  await page.goto("/docs/components/chart");
  await page.getByRole("button", { name: "StyleX" }).click();
  await expect(page.locator("#monthly-revenue")).toBeVisible();
  await expect(page.locator("#traffic-trend")).toBeVisible();
  await expect(page.locator("#echarts-lifecycle")).toBeVisible();
  await expect(page.locator("#lifecycle-states")).toBeVisible();
  await expect(page.locator("#chart-types")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);

  // Upstream sections: hero demo card + five "Your First Chart" tutorial steps +
  // static tooltip showcase + RTL.
  const heroDemo = page.locator('[aria-label="Demo preview"]').first();
  await expect(
    heroDemo.getByRole("heading", { name: "Bar Chart - Interactive" }),
  ).toBeVisible();
  await expect(heroDemo.getByRole("button", { name: /Desktop 7,324/ })).toBeVisible();
  await expect(heroDemo.getByRole("button", { name: /Mobile 7,250/ })).toBeVisible();
  await heroDemo.getByRole("button", { name: /Mobile 7,250/ }).click();
  await expect(
    heroDemo.getByRole("button", { name: /Mobile 7,250/ }),
  ).toHaveAttribute("data-active", "true");
  await expect(heroDemo.locator('[data-slot="echart"] canvas')).toHaveCount(1);

  for (const step of [
    "your-first-chart",
    "your-first-chart-grid",
    "your-first-chart-axis",
    "your-first-chart-tooltip",
    "your-first-chart-legend",
  ]) {
    const section = page.locator(`#${step}`);
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Your First Chart" }),
    ).toBeVisible();
    await expect(section.locator('[data-slot="echart"] canvas')).toHaveCount(1);
  }
  await expect(page.locator("#legend")).toHaveCount(0);
  const tooltipSection = page.locator("#tooltip");
  await expect(
    tooltipSection.getByText("Page Views", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    tooltipSection.getByText("12,486").first(),
  ).toBeVisible();
  const rtlSection = page.locator("#rtl");
  await expect(rtlSection.locator('[dir="rtl"]')).toHaveCount(1);
  await expect(rtlSection.locator('[data-slot="echart"] canvas')).toHaveCount(1);

  const bars = page.locator("#monthly-revenue");
  const barChart = bars.getByRole("img", { name: "Bar chart" });
  await expect(barChart).toBeVisible();
  await expect(barChart.locator("rect")).toHaveCount(6);
  const trend = page.locator("#traffic-trend");
  await expect(trend.getByRole("img", { name: "Area chart" })).toBeVisible();
  await expect(trend.locator('[data-slot="chart-legend"]')).toContainText(
    "Visitors",
  );
  await expect(bars.locator("code")).toContainText("Runtime.makeApplication");
  await expect(bars.locator("code")).toContainText("@/stylex/chart");

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

  for (const family of ["area", "bar", "line", "pie", "radar", "radial"]) {
    const example = page.locator(`#${family}-chart`);
    await expect(example).toBeVisible();
    await expect(example.locator('[data-slot="echart"] canvas')).toHaveCount(1);
    await expect(example.locator("code")).toContainText("Chart.registerChart");
    await expect(example.locator("code")).toContainText("@/stylex/chart");
  }

  await page.getByRole("button", { name: "Tailwind", exact: true }).click();
  await expect(page.locator("#area-chart code")).toContainText("@/ui/chart");
  await expect(
    page.locator('[id$="-chart"] [data-slot="echart"] canvas'),
  ).toHaveCount(7);

  await page.goto("/docs/components/button");
  await expect.poll(() => page.evaluate(() => (window as Window & { __charts?: Map<string, unknown> }).__charts?.size ?? 0)).toBe(0);
});

test("presentational helpers preserve native semantics and controlled OTP state", async ({ page }) => {
  await page.goto("/docs/components/card");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#basic")).toBeVisible();
  await expect(page.locator("#size")).toBeVisible();
  await expect(page.locator("#spacing")).toBeVisible();
  await expect(page.locator("#edge-to-edge")).toBeVisible();
  await expect(page.locator("#image")).toBeVisible();
  await expect(page.locator("#rtl")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#basic").getByRole("heading", { name: "Login to your account" })).toBeVisible();
  await expect(page.locator("#size [data-slot=card]")).toHaveAttribute("data-size", "sm");
  await expect(page.locator("#rtl [dir=rtl]")).toHaveCount(1);
  await expect(page.locator("#basic code")).toContainText("@/stylex/card");

  await page.goto("/docs/components/separator");
  await expect(page.locator("#horizontal").getByRole("separator")).toHaveCount(0);
  await expect(page.locator("#vertical").getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");

  await page.goto("/docs/components/label");
  const email = page.locator("#docs-email");
  await page.locator('#input-label label[data-slot="label"]').click();
  await expect(email).toBeFocused();

  await page.goto("/docs/components/input-otp");
  const code = page.locator("#six-digit-code").getByRole("textbox", { name: "Verification code" });
  await code.fill("12a345678");
  await expect(code).toHaveValue("12345");
  await code.fill("12345678");
  await expect(code).toHaveValue("123456");
  await expect(code).toHaveAttribute("autocomplete", "one-time-code");
  await expect(page.locator("#six-digit-code [data-slot=\"input-otp-group\"]")).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["six-digit-code", "grouped-code", "alphanumeric"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#six-digit-code code")).toContainText("@/stylex/input-otp");
  await expect(code).toHaveValue("123456");
  await code.fill("98x7654");
  await expect(code).toHaveValue("98765");
  const inviteCode = page.getByRole("textbox", { name: "Invite code" });
  await inviteCode.fill("aZ-19");
  await expect(inviteCode).toHaveValue("Z19");
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

  const rtl = page.locator("#rtl");
  await expect(rtl.locator("[dir='rtl']").first()).toBeVisible();
  await expect(
    rtl.getByRole("columnheader", { name: "المبلغ" }),
  ).toBeVisible();
  await rtl
    .getByRole("searchbox", { name: "بحث في المدفوعات..." })
    .fill("failed");
  await expect(rtl).toContainText("r@example.com");

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["sortable-payments", "filter-and-paginate", "server-owned-query", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(sortable.locator("code")).toContainText("@/stylex/data-table");
  await expect(amountHeader).toHaveAttribute("aria-sort", "descending");
  await expect(sortable).toContainText("Page 2 of 2");
  await expect(filtered.getByRole("searchbox", { name: "Filter payments…" })).toHaveValue("failed");
  await expect(filtered).toContainText("r@example.com");
  await expect(server).toContainText("Page 1 of 9");
  await expect(
    rtl.getByRole("columnheader", { name: "المبلغ" }),
  ).toBeVisible();
});

test("controlled helper pages own and update compact local preview state", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/docs/components/checkbox");
  const checkbox = page
    .locator("#basic")
    .getByRole("checkbox", { name: "Accept terms and conditions" });
  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  await page.goto("/docs/components/collapsible");
  for (const id of ["basic", "settings-panel", "file-tree", "rtl", "disabled"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }
  const disclosure = page
    .locator("#basic")
    .getByRole("button", { name: "Product details" });
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator("#basic").getByRole("button", { name: "Learn More" }),
  ).toBeVisible();
  await page.locator("#settings-panel")
    .getByRole("button", { name: "More radii" })
    .click();
  await expect(
    page.locator("#settings-panel").locator("input[id^='docs-collapsible-2-']"),
  ).toHaveCount(4);
  await page.locator("#file-tree")
    .getByRole("button", { name: "lib" })
    .click();
  await expect(
    page.locator("#file-tree").getByText("utils.ts", { exact: true }).first(),
  ).toBeVisible();
  const rtlPanel = page.locator("#rtl [data-slot='collapsible-content']");
  await page.locator("#rtl button[aria-expanded]").click();
  await expect(rtlPanel).toContainText("عنوان الشحن");

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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["formatting", "outline", "disabled", "compact-named-control"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#formatting code")).toContainText("@/stylex/toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(disabledToggle).toBeDisabled();

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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of [
    "single-selection",
    "multiple-selection",
    "rtl",
    "disabled-item",
    "form-policy",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#single-selection code")).toContainText(
    "@/stylex/toggle-group",
  );
  await expect(right).toHaveAttribute("aria-pressed", "false");
  await right.click();
  await expect(right).toHaveAttribute("aria-pressed", "true");
  await multiple.getByRole("button", { name: "Center" }).click();
  await expect(multiple.getByRole("button", { name: "Center" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(disabledGroup.getByRole("button", { name: "Center" })).toBeDisabled();

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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#labeled-fruit")).toBeVisible();
  await expect(page.locator("#grouped-options")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#labeled-fruit code")).toContainText(
    "@/stylex/native-select",
  );
  await expect(fruit).toHaveValue("blueberry");
  await fruit.selectOption("banana");
  await expect(fruit).toHaveValue("banana");
  await expect(
    page.locator('#grouped-options optgroup[label="Europe"]'),
  ).toBeAttached();

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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["message", "invalid", "disabled", "form-and-resize"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#message code")).toContainText("@/stylex/textarea");
  await expect(message).toHaveValue("A complete Foldkit example.");
  await message.fill("Styled with StyleX.");
  await expect(message).toHaveValue("Styled with StyleX.");
  await expect(deploymentNotes).toHaveAttribute("readonly", "");
  await expect(deploymentNotes).toHaveAttribute("data-resize", "none");

  await page.goto("/docs/components/input-group");
  const url = page.locator("#url-prefix").getByRole("textbox");
  await url.fill("crease.dev");
  await expect(url).toHaveValue("crease.dev");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(url).toHaveValue("crease.dev");
  await expect(page.locator("#url-prefix code")).toContainText("@/stylex/input-group");
  await expect(page.locator("#trailing-unit")).toContainText("kg");

  await page.goto("/docs/components/input-otp");
  const code = page
    .locator("#six-digit-code")
    .getByRole("textbox", { name: "Verification code" });
  await code.fill("654321");
  await expect(code).toHaveValue("654321");
});

test("input sections match upstream variants in both renderers", async ({ page }) => {
  await page.goto("/docs/components/input");
  for (const id of [
    "field",
    "field-group",
    "disabled",
    "invalid",
    "file",
    "inline",
    "grid",
    "required",
    "badge",
    "input-group",
    "button-group",
    "form",
    "rtl",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  const username = page
    .locator("#field")
    .getByRole("textbox", { name: "Username" });
  await username.fill("potti");
  await expect(username).toHaveValue("potti");
  await expect(
    page.locator("#field").getByText("Choose a unique username for your account.", { exact: true }),
  ).toBeVisible();

  const fieldGroup = page.locator("#field-group");
  await fieldGroup
    .getByRole("textbox", { name: "Name" })
    .fill("Jordan Lee");
  await fieldGroup
    .getByRole("textbox", { name: "Email" })
    .fill("jordan@crease.dev");
  await expect(
    fieldGroup.getByRole("button", { name: "Reset" }),
  ).toBeVisible();
  await expect(
    fieldGroup.getByRole("button", { name: "Submit" }),
  ).toBeVisible();

  await expect(
    page.locator("#disabled").getByRole("textbox", { name: "Email" }),
  ).toBeDisabled();
  await expect(
    page.locator("#invalid").getByRole("textbox", { name: "Invalid Input" }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.locator("#file").locator("input[type='file']"),
  ).toBeVisible();
  await expect(
    page.locator("#inline").getByRole("button", { name: "Search" }),
  ).toBeVisible();
  await page
    .locator("#grid")
    .getByRole("textbox", { name: "First Name" })
    .fill("Jordan");
  const requiredInput = page
    .locator("#required")
    .getByRole("textbox", { name: /Required Field/ });
  await expect(requiredInput).toHaveAttribute("required", "");
  await expect(requiredInput).toHaveAttribute("aria-required", "true");
  await expect(
    page.locator("#badge").getByText("Beta", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#input-group").getByText("https://", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#button-group").getByRole("button", { name: "Search" }),
  ).toBeVisible();

  const inputForm = page.locator("#form");
  await expect(inputForm.locator("form")).toBeVisible();
  await inputForm
    .getByRole("textbox", { name: "Name" })
    .fill("Evil Rabbit");
  await inputForm
    .getByRole("button", { name: "Country" })
    .click();
  await page.getByRole("option", { name: "Canada" }).click();
  await expect(
    inputForm.getByRole("button", { name: "Cancel" }),
  ).toBeVisible();
  await expect(
    inputForm.getByRole("button", { name: "Submit" }),
  ).toBeVisible();

  const inputRtl = page.locator("#rtl");
  await expect(inputRtl.locator("div[dir='rtl']").first()).toBeVisible();
  await expect(
    inputRtl.getByText("مفتاح API", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["field", "invalid", "disabled", "form", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#field code")).toContainText("@/stylex/input");
  await expect(username).toHaveValue("potti");
  await username.fill("stylex-potti");
  await expect(username).toHaveValue("stylex-potti");
  await expect(
    page.locator("#disabled").getByRole("textbox", { name: "Email" }),
  ).toBeDisabled();
  const inputHero = page.locator('[aria-label="Basic preview"]');
  await expect(
    inputHero.getByRole("textbox"),
  ).toHaveAttribute("placeholder", "Enter text");
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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["details", "open-by-default", "disabled"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(example.locator("code")).toContainText("@/stylex/collapsible");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveAccessibleName("Hide details");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  for (const id of ["determinate", "indeterminate", "narrow-range"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#determinate code")).toContainText(
    "@/stylex/progress",
  );
  await expect(determinate).toHaveAttribute("aria-valuenow", "64");
  await expect(indeterminate).not.toHaveAttribute("aria-valuenow", /.+/u);
  await expect(indeterminate.locator('[data-slot="progress-indicator"]')).toHaveCSS("animation-name", "none");
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

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#profile")).toBeVisible();
  await expect(page.locator("#card")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#profile code")).toContainText("@/stylex/skeleton");
  await expect(profile.getByRole("status", { name: "Loading profile" })).toHaveAttribute("aria-busy", "true");
  await expect(profile.locator('[data-slot="skeleton"]')).toHaveCount(3);

  await page.goto("/docs/components/spinner");
  const standalone = page.locator("#default").getByRole("img", { name: "Loading content" });
  await expect(standalone).toHaveCSS("animation-name", "none");
  const namedStatus = page.locator("#with-label").getByRole("status");
  await expect(namedStatus).toContainText("Saving changes");
  const decorative = namedStatus.locator("svg");
  await expect(decorative).toHaveAttribute("aria-hidden", "true");
  await expect(namedStatus.getByRole("img")).toHaveCount(0);

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#default")).toBeVisible();
  await expect(page.locator("#with-label")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#default code")).toContainText("@/stylex/spinner");
  await expect(page.locator("#default").getByRole("img", { name: "Loading content" })).toHaveCSS("animation-name", "none");
  await expect(page.locator("#with-label").getByRole("status")).toContainText("Saving changes");
});

test("empty sections match upstream variants in both renderers", async ({ page }) => {
  await page.goto("/docs/components/empty");
  const hero = page.locator('[aria-label="Create a project preview"]');
  await expect(
    hero.getByRole("heading", { level: 2, name: "No Projects Yet" }),
  ).toBeVisible();
  await expect(
    hero.getByRole("button", { name: "Create Project" }),
  ).toBeVisible();
  await expect(hero.getByRole("link", { name: /Learn More/ })).toBeVisible();

  const outline = page.locator("#outline");
  await expect(
    outline.getByRole("heading", { level: 2, name: "Cloud Storage Empty" }),
  ).toBeVisible();
  await expect(
    outline.getByRole("button", { name: "Upload Files" }),
  ).toBeVisible();

  const background = page.locator("#background");
  await expect(
    background.getByRole("heading", { level: 2, name: "No Notifications" }),
  ).toBeVisible();
  await expect(
    background.getByRole("button", { name: /Refresh/ }),
  ).toBeVisible();

  const avatar = page.locator("#avatar");
  await expect(
    avatar.getByRole("heading", { level: 2, name: "User Offline" }),
  ).toBeVisible();
  await expect(
    avatar.locator('img[alt="@shadcn"]').first(),
  ).toBeVisible();
  await expect(
    avatar.getByRole("button", { name: "Leave Message" }),
  ).toBeVisible();

  const avatarGroup = page.locator("#avatar-group");
  await expect(
    avatarGroup.getByRole("heading", { level: 2, name: "No Team Members" }),
  ).toBeVisible();
  await expect(
    avatarGroup.locator('[data-slot="avatar-image"]'),
  ).toHaveCount(3);
  await expect(
    avatarGroup.getByRole("button", { name: /Invite Members/ }),
  ).toBeVisible();

  const inputGroup = page.locator("#inputgroup");
  await expect(
    inputGroup.getByRole("heading", { level: 2, name: "404 - Not Found" }),
  ).toBeVisible();
  await expect(
    inputGroup.getByPlaceholder("Try searching for pages..."),
  ).toBeVisible();
  await expect(inputGroup.locator('[data-slot="kbd"]')).toHaveText("/");
  await expect(
    inputGroup.getByRole("link", { name: "Contact support" }),
  ).toBeVisible();

  const rtl = page.locator("#rtl");
  await expect(rtl.locator('[dir="rtl"]').first()).toBeVisible();
  await expect(
    rtl.getByRole("heading", { level: 2, name: "لا توجد مشاريع بعد" }),
  ).toBeVisible();
  await expect(
    rtl.getByRole("button", { name: "إنشاء مشروع" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(
    page.locator("#outline code"),
  ).toContainText("@/stylex/empty");
  await expect(
    page.locator("#avatar-group").locator('[data-slot="avatar-image"]'),
  ).toHaveCount(3);
  await expect(
    page.locator("#rtl").locator('[dir="rtl"]'),
  ).toHaveCount(1);
});

test("message exposes live author metadata and parent-owned keyboard actions", async ({ page }) => {
  await page.goto("/docs/components/message");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#incoming")).toBeVisible();
  await expect(page.locator("#outgoing")).toBeVisible();
  await expect(page.locator("#live-recovery")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
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
  await expect(page.locator("#incoming code")).toContainText("@/stylex/message");
});

test("table preserves native captions, scoped headers, overflow, and empty rows", async ({ page }) => {
  await page.goto("/docs/components/table");
  await page.getByRole("button", { name: "StyleX", exact: true }).click();
  await expect(page.locator("#component-inventory")).toBeVisible();
  await expect(page.locator("#footer")).toBeVisible();
  await expect(page.locator("#dense-overflow")).toBeVisible();
  await expect(page.locator("#empty-body")).toBeVisible();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
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
  await expect(page.locator("#component-inventory code")).toContainText("@/stylex/table");
});

test("checkbox shares controlled mixed, read-only, and form semantics", async ({
  page,
}) => {
  await page.goto("/docs/components/checkbox");

  await expect(
    page.locator("#invalid-state").getByRole("checkbox", {
      name: "Accept terms and conditions",
    }),
  ).toHaveAttribute("aria-invalid", "true");

  const terms = page
    .locator("#basic")
    .getByRole("checkbox", { name: "Accept terms and conditions" });
  const formValue = page.locator('#basic input[type="hidden"][name="terms"]');
  await expect(formValue).toHaveValue("");
  await terms.press("Space");
  await expect(terms).toBeChecked();
  await expect(formValue).toHaveValue("accepted");

  await expect(
    page.locator("#description").getByRole("checkbox", {
      name: "Accept terms and conditions",
    }),
  ).toHaveAttribute("aria-describedby", "docs-checkbox-3-description");

  const disabled = page
    .locator("#disabled")
    .getByRole("checkbox", { name: "Enable notifications" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).not.toBeChecked();

  const group = page.locator("#group");
  await expect(
    group.getByRole("group", { name: "Show these items on the desktop:" }),
  ).toBeVisible();
  const servers = group.getByRole("checkbox", { name: "Connected servers" });
  await expect(servers).not.toBeChecked();
  await servers.click();
  await expect(servers).toBeChecked();
  await expect(
    group.getByRole("checkbox", { name: "Hard disks" }),
  ).toBeChecked();

  const table = page.locator("#table");
  const selectAll = table.getByRole("checkbox", { name: "Select all rows" });
  await expect(selectAll).not.toBeChecked();
  await selectAll.click();
  await expect(selectAll).toBeChecked();
  await expect(
    table.getByRole("checkbox", { name: "Select David Kim" }),
  ).toBeChecked();
  await selectAll.click();
  await expect(
    table.getByRole("checkbox", { name: "Select Sarah Chen" }),
  ).not.toBeChecked();

  await expect(
    page.locator("#rtl").locator('[dir="rtl"]'),
  ).toHaveCount(1);

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
  for (const id of [
    "invalid-state",
    "basic",
    "description",
    "disabled",
    "group",
    "table",
    "rtl",
    "indeterminate",
    "read-only",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#basic code")).toContainText("@/stylex/checkbox");
  await expect(terms).toBeChecked();
  await terms.press("Space");
  await expect(terms).not.toBeChecked();
  await expect(formValue).toHaveValue("");
  await expect(readOnly).toBeChecked();
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
  for (const id of ["notifications", "small", "disabled", "read-only", "rtl"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#notifications code")).toContainText(
    "@/stylex/switch",
  );
  await expect(notifications).not.toBeChecked();
  await notifications.press("Space");
  await expect(notifications).toBeChecked();
  await expect(formValue).toHaveValue("enabled");
  await expect(readOnly).toBeChecked();
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
  for (const id of [
    "density",
    "disabled-group",
    "read-only",
    "rtl-and-disabled-option",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(page.locator("#density code")).toContainText(
    "@/stylex/radio-group",
  );
  await expect(rtlDefault).toBeChecked();
  await expect(hiddenValue).toHaveValue("compact");
  await compact.press("ArrowUp");
  await expect(comfortable).toBeChecked();
  await expect(hiddenValue).toHaveValue("comfortable");
  await expect(readOnlyComfortable).toBeChecked();
  await assertAccessible(page);
});

test("field sections match upstream variants in both renderers", async ({ page }) => {
  await page.goto("/docs/components/field");

  const hero = page.locator('[aria-label="Payment Method preview"]');
  await expect(
    hero.getByRole("textbox", { name: "Name on Card" }),
  ).toBeVisible();
  await expect(
    hero.getByRole("textbox", { name: "Card Number" }),
  ).toBeVisible();
  await hero.getByRole("button", { name: "Month" }).click();
  await page.getByRole("option", { name: "06", exact: true }).click();
  await expect(
    hero.getByRole("button", { name: "Month" }),
  ).toContainText("06");
  await expect(
    hero.getByRole("checkbox", { name: "Same as shipping address" }),
  ).toBeChecked();

  const input = page.locator("#input");
  const username = input.getByRole("textbox", { name: "Username" });
  await username.fill("Max Leiter");
  await expect(username).toHaveValue("Max Leiter");
  await expect(
    input.getByRole("textbox", { name: "Password" }),
  ).toHaveAttribute("type", "password");

  const textarea = page.locator("#textarea");
  await textarea.getByRole("textbox", { name: "Feedback" }).fill("great");
  await expect(
    textarea.getByRole("textbox", { name: "Feedback" }),
  ).toHaveValue("great");

  const select = page.locator("#select");
  await select.getByRole("button", { name: "Department" }).click();
  await page.getByRole("option", { name: "Engineering" }).click();
  await expect(
    select.getByRole("button", { name: "Department" }),
  ).toContainText("Engineering");

  const slider = page.locator("#slider");
  await expect(slider).toContainText("Set your budget range ($200 - 800)");
  await expect(
    slider.getByRole("slider", { name: "Minimum price" }),
  ).toBeVisible();

  const fieldset = page.locator("#fieldset");
  await expect(fieldset.locator("legend")).toHaveText("Address Information");
  await expect(
    fieldset.getByRole("textbox", { name: "Street Address" }),
  ).toBeVisible();
  await expect(fieldset.getByRole("textbox", { name: "City" })).toBeVisible();
  await expect(
    fieldset.getByRole("textbox", { name: "Postal Code" }),
  ).toBeVisible();

  const checkbox = page.locator("#checkbox");
  await expect(
    checkbox.getByRole("checkbox", { name: "Hard disks" }),
  ).toBeChecked();
  const external = checkbox.getByRole("checkbox", { name: "External disks" });
  await external.click();
  await expect(external).toBeChecked();
  await expect(
    checkbox.getByRole("checkbox", {
      name: "Sync Desktop & Documents folders",
    }),
  ).toBeChecked();

  const radio = page.locator("#radio");
  const yearly = radio.getByRole("radio", { name: /Yearly/ });
  await yearly.click();
  await expect(yearly).toBeChecked();

  const switchSection = page.locator("#switch");
  const mfa = switchSection.getByRole("switch", {
    name: "Multi-factor authentication",
  });
  await mfa.click();
  await expect(mfa).toHaveAttribute("aria-checked", "true");

  const choiceCard = page.locator("#choice-card");
  const vm = choiceCard.getByRole("radio", { name: /Virtual Machine/ });
  await vm.click();
  await expect(vm).toBeChecked();
  await expect(
    choiceCard.getByRole("radio", { name: /Kubernetes/ }),
  ).toBeChecked({ checked: false });

  const group = page.locator("#field-group");
  await expect(
    group.getByRole("checkbox", { name: "Push notifications" }).first(),
  ).toBeDisabled();
  const emailTasks = group.getByRole("checkbox", {
    name: "Email notifications",
  });
  await emailTasks.click();
  await expect(emailTasks).toBeChecked();

  const rtl = page.locator("#rtl");
  await expect(rtl.locator('[dir="rtl"]').first()).toBeVisible();
  await expect(rtl.locator("legend").first()).toHaveText("طريقة الدفع");

  const responsive = page.locator("#responsive-layout");
  await expect(responsive.locator("legend")).toHaveText("Profile");
  await responsive.getByRole("textbox", { name: "Name" }).fill("Evil Rabbit");
  await expect(
    responsive.getByRole("textbox", { name: "Name" }),
  ).toHaveValue("Evil Rabbit");
  await expect(
    responsive.getByRole("button", { name: "Submit" }),
  ).toBeVisible();

  await page
    .getByRole("group", { name: "Preview styling engine" })
    .getByRole("button", { name: "StyleX" })
    .click();
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  await expect(username).toHaveValue("Max Leiter");
  await expect(
    page.locator("#select code"),
  ).toContainText("@/stylex/field");
  await expect(
    choiceCard.getByRole("radio", { name: /Virtual Machine/ }),
  ).toBeChecked();
  await expect(rtl.locator('[dir="rtl"]').first()).toBeVisible();
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
  await summary.getByRole("link", { name: "Enter a valid email address." }).click();
  await expect(signInEmail).toBeFocused();
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
  await expect(page.locator("#stylex-specimen")).toHaveCount(0);
  for (const id of ["newsletter-signup", "error-summary", "async-validation"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator("#newsletter-signup code")).toContainText("@/stylex/form");
  await expect(newsletter).toHaveAttribute("name", "email");
  await expect(signInEmail).toHaveAttribute("aria-invalid", "true");
  await expect(signIn.getByRole("alert", { name: "Fix the following error" })).toBeVisible();
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
