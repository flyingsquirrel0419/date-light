import * as dateLight from "../src";

import "./styles.css";

type Route = "/" | "/docs" | "/playground";

type PlaygroundPreset = {
  id: string;
  label: string;
  description: string;
  code: string;
};

type CloudflareBeaconWindow = Window & {
  __cfBeaconLoaded?: boolean;
};

const installCommands = {
  npm: "npm install date-light",
  yarn: "yarn add date-light",
  pnpm: "pnpm add date-light",
  bun: "bun add date-light",
};

const docsNav = [
  {
    group: "Documentation",
    links: [
      ["Overview", "overview"],
      ["Getting Started", "getting-started"],
      ["Migration", "migration"],
    ],
  },
  {
    group: "Guides",
    links: [
      ["Formatting", "formatting"],
      ["Parsing", "parsing"],
      ["Calendar Math", "calendar-math"],
    ],
  },
  {
    group: "API Reference",
    links: [
      ["Format", "api-format"],
      ["Parse", "api-parse"],
      ["Add/Sub", "api-add-sub"],
      ["Difference", "api-difference"],
      ["Query", "api-query"],
      ["Start/End", "api-start-end"],
    ],
  },
];

const docsSearchTerms: Record<string, string> = {
  overview: "documentation small api pure functions date-fns compatible",
  "getting-started": "install import npm yarn pnpm bun tree shake side effect free",
  migration: "date-fns replace imports yyyy MM dd tokens",
  formatting: "format tokens year month day hour minute weekday",
  parsing: "parse parseISO ISO pattern RangeError local date",
  "calendar-math": "add subtract addDays addMonths clamp date math",
  "api-format": "format date pattern string",
  "api-parse": "parse parseISO date string pattern",
  "api-add-sub": "add sub days months years hours minutes seconds",
  "api-difference": "difference days hours minutes seconds months years",
  "api-query": "isWeekend isLeapYear isValid getDaysInMonth getWeekOfYear week",
  "api-start-end": "start end startOfWeek startOfMonth endOfMonth boundary week month year",
};

const docsSearchItems = docsNav.flatMap((section) =>
  section.links.map(([label, id]) => ({
    label,
    id,
    group: section.group,
    terms: `${label} ${section.group} ${id} ${docsSearchTerms[id] ?? ""}`.toLowerCase(),
  })),
);

const presets: PlaygroundPreset[] = [
  {
    id: "format",
    label: "Format",
    description: "Render date-fns compatible tokens without pulling date-fns into the bundle.",
    code: `import { format } from "date-light";

const date = new Date("2025-05-16T10:30:00");

console.log(format(date, "yyyy-MM-dd HH:mm"));
console.log(format(date, "EEEE, MMMM d"));`,
  },
  {
    id: "parse",
    label: "Parse",
    description: "Parse ISO strings or strict custom patterns with local date semantics.",
    code: `import { parse, parseISO, format } from "date-light";

const iso = parseISO("2026-01-15");
const custom = parse("2026-01-15 14:30", "yyyy-MM-dd HH:mm");

console.log(format(iso, "yyyy-MM-dd"));
console.log(format(custom, "HH:mm"));`,
  },
  {
    id: "calendar-math",
    label: "Calendar Math",
    description: "Add days and months immutably, including month-end clamping.",
    code: `import { addDays, addMonths, format } from "date-light";

const start = new Date("2026-01-31T09:00:00");

console.log(format(addDays(start, 7), "yyyy-MM-dd"));
console.log(format(addMonths(start, 1), "yyyy-MM-dd"));`,
  },
  {
    id: "difference",
    label: "Difference",
    description: "Compare calendar distances for scheduling, reports, and timeline UI.",
    code: `import { differenceInDays } from "date-light";

const release = new Date("2026-06-03T10:00:00");
const beta = new Date("2026-05-16T10:30:00");

console.log(differenceInDays(release, beta));`,
  },
  {
    id: "query",
    label: "Query",
    description: "Ask common calendar questions with tiny predicates and helpers.",
    code: `import { isWeekend, isLeapYear, getWeekOfYear } from "date-light";

const date = new Date("2026-06-27T10:30:00");

console.log("isWeekend:", isWeekend(date));
console.log("isLeapYear(2024):", isLeapYear(new Date("2024-01-01")));
console.log("week:", getWeekOfYear(date));`,
  },
  {
    id: "boundaries",
    label: "Boundaries",
    description: "Snap dates to week and month boundaries for filters and ranges.",
    code: `import { startOfWeek, startOfMonth, endOfMonth, format } from "date-light";

const date = new Date("2026-06-30T14:30:00");

console.log(format(startOfWeek(date), "yyyy-MM-dd HH:mm"));
console.log(format(startOfMonth(date), "yyyy-MM-dd HH:mm"));
console.log(format(endOfMonth(date), "yyyy-MM-dd HH:mm"));`,
  },
];

const playgroundRuntime: Record<string, unknown> = dateLight;

const app = document.querySelector<HTMLDivElement>("#app")!;
let searchShortcutsBound = false;
let liquidTabsResizeBound = false;
const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function appPath(path: Route | string): string {
  if (path === "/") {
    return `${appBasePath || "/"}`;
  }
  return `${appBasePath}${path}`;
}

function appAsset(path: string): string {
  return `${appBasePath}${path}`;
}

function normalizeRoutePath(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (appBasePath && normalized.startsWith(appBasePath)) {
    return normalized.slice(appBasePath.length).replace(/\/$/, "") || "/";
  }
  return normalized;
}

function routeFromLocation(): Route {
  const path = normalizeRoutePath(window.location.pathname);
  if (path === "/docs" || path === "/playground") {
    return path;
  }
  return "/";
}

function shell(content: string, route: Route): string {
  return `
    <header class="topbar ${route === "/docs" ? "" : "topbar-compact"}">
      <a class="brand" href="${appPath("/")}" data-link aria-label="date-light home">
        <img class="brand-mark" src="${appAsset("/date-light-mark.svg")}" alt="" />
        <span>date-light</span>
      </a>
      ${
        route === "/docs"
          ? `
            <div class="search-control" role="search">
              <span aria-hidden="true">/</span>
              <input
                type="search"
                placeholder="Search docs"
                aria-label="Search documentation"
                data-doc-search
                autocomplete="off"
              />
              <kbd>Cmd K</kbd>
              <div class="search-results" data-search-results hidden></div>
            </div>
          `
          : ""
      }
      <nav class="nav-links" aria-label="Primary navigation">
        <a class="${route === "/docs" ? "active" : ""}" href="${appPath("/docs")}" data-link>Docs</a>
        <a class="${route === "/playground" ? "active" : ""}" href="${appPath("/playground")}" data-link>Playground</a>
      </nav>
      <a class="github-link" href="https://github.com/flyingsquirrel0419/date-light" target="_blank" rel="noreferrer">
        GitHub
      </a>
    </header>
    ${content}
  `;
}

function renderLanding(): string {
  return shell(
    `
      <main class="landing-page">
        <section class="hero-section" aria-labelledby="hero-title">
          <div class="ambient" aria-hidden="true">
            <img src="${appAsset("/timefield.png")}" alt="" />
          </div>
          <div class="hero-center">
            <div class="logo-lockup">
              <img class="hero-mark" src="${appAsset("/date-light-mark.svg")}" alt="" />
              <span>date-light</span>
            </div>
            <h1 id="hero-title">The date toolkit you actually ship</h1>
            <p>
              39 fully typed date utilities for TypeScript teams. Format, parse, compare,
              add, subtract, and snap date ranges in about 2.18KB minzipped.
            </p>
            <div class="hero-actions">
              <a class="primary-button" href="${appPath("/docs")}" data-link>Get Started</a>
              <a class="secondary-button" href="${appPath("/playground")}" data-link>Playground</a>
            </div>
            <div class="install-tabs" aria-label="Install date-light">
              <div class="package-tabs" data-liquid-tabs>
                <span class="liquid-indicator" aria-hidden="true"></span>
                ${Object.keys(installCommands)
                  .map(
                    (manager) => `
                      <button
                        type="button"
                        class="${manager === "npm" ? "active" : ""}"
                        data-package-manager="${manager}"
                      >${manager}</button>
                    `,
                  )
                  .join("")}
              </div>
              <div class="install-terminal">
                <div class="terminal-hostbar">
                  <div class="terminal-lights" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="terminal-title">install date-light</span>
                  <span class="terminal-status">localhost</span>
                </div>
                <div class="install-command">
                  <div class="install-prompt" aria-hidden="true">
                    <span>~/project</span>
                    <strong>$</strong>
                  </div>
                  <pre><code data-install-command>${installCommands.npm}</code></pre>
                  <button type="button" class="copy-command" data-copy-install aria-label="Copy install command">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <rect x="8" y="8" width="11" height="11" rx="2"></rect>
                      <rect x="5" y="5" width="11" height="11" rx="2"></rect>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="landing-strips" aria-label="Highlights">
          <article class="tilt-card" data-tilt-card>
            <span>Zero dependencies</span>
            <p>No runtime dependency tree, no surprise transitive updates, no broad date stack.</p>
          </article>
          <article class="tilt-card" data-tilt-card>
            <span>date-fns style</span>
            <p>Use familiar tokens like yyyy-MM-dd while importing only the common utilities.</p>
          </article>
          <article class="tilt-card" data-tilt-card>
            <span>Typed by default</span>
            <p>Strict TypeScript source with side-effect-free ESM and CommonJS builds.</p>
          </article>
        </section>
      </main>
    `,
    "/",
  );
}

function renderDocs(): string {
  const nav = docsNav
    .map(
      (section) => `
        <div class="doc-nav-group">
          <button type="button">${section.group}</button>
          ${section.links.map(([label, id]) => `<a href="#${id}">${label}</a>`).join("")}
        </div>
      `,
    )
    .join("");

  const onThisPage = docsNav
    .flatMap((section) => section.links)
    .map(([label, id]) => `<a href="#${id}">${label}</a>`)
    .join("");

  return shell(
    `
      <main class="docs-page">
        <aside class="docs-sidebar">${nav}</aside>
        <article class="docs-article">
          <section id="overview">
            <h1>Documentation</h1>
            <p class="lead">
              date-light keeps the date API small: the operations developers reach for most,
              implemented as pure functions with a date-fns compatible surface.
            </p>
          </section>

          <section id="getting-started">
            <h2>Getting Started</h2>
            <p>Install the package and import named utilities. The library is side-effect free.</p>
            <pre><code>npm install date-light</code></pre>
            <pre><code>import { format, addDays, differenceInDays } from "date-light";

const today = new Date(2026, 4, 30, 14, 30);
const next = addDays(today, 7);

format(today, "yyyy-MM-dd HH:mm");
differenceInDays(next, today);</code></pre>
          </section>

          <section id="migration">
            <h2>Migration</h2>
            <p>
              The formatting syntax intentionally follows date-fns patterns, so
              <code>yyyy-MM-dd</code> works as expected. Replace imports from date-fns with
              the matching date-light named export when the function is covered.
            </p>
          </section>

          <section id="formatting">
            <h2>Formatting</h2>
            <p>Supported tokens include years, months, days, 12/24 hour time, milliseconds, AM/PM, and weekdays.</p>
            <div class="token-table">
              <span>yyyy</span><span>2026</span>
              <span>MMMM</span><span>January</span>
              <span>dd</span><span>15</span>
              <span>HH:mm</span><span>14:30</span>
              <span>EEEE</span><span>Thursday</span>
            </div>
          </section>

          <section id="parsing">
            <h2>Parsing</h2>
            <p><code>parseISO</code> handles ISO strings. <code>parse</code> accepts strict numeric patterns.</p>
            <pre><code>parseISO("2026-01-15");
parse("2026-01-15 14:30", "yyyy-MM-dd HH:mm");</code></pre>
          </section>

          <section id="calendar-math">
            <h2>Calendar Math</h2>
            <p>Add and subtract helpers return new Date instances and preserve practical calendar semantics.</p>
            <pre><code>addDays(date, 7);
addMonths(new Date(2026, 0, 31), 1); // Feb 28, 2026</code></pre>
          </section>

          <section id="api-format">
            <h2>Format</h2>
            <p><code>format(date, pattern): string</code></p>
          </section>
          <section id="api-parse">
            <h2>Parse</h2>
            <p><code>parseISO(dateStr): Date</code> and <code>parse(dateStr, pattern): Date</code></p>
          </section>
          <section id="api-add-sub">
            <h2>Add/Sub</h2>
            <p><code>addDays</code>, <code>addMonths</code>, <code>addYears</code>, and hour/minute/second variants with matching <code>sub*</code> helpers.</p>
          </section>
          <section id="api-difference">
            <h2>Difference</h2>
            <p><code>differenceInDays</code>, hours, minutes, seconds, months, and years.</p>
          </section>
          <section id="api-query">
            <h2>Query</h2>
            <p><code>isWeekend</code>, <code>isLeapYear</code>, <code>isValid</code>, <code>getDaysInMonth</code>, and <code>getWeekOfYear</code>.</p>
          </section>
          <section id="api-start-end">
            <h2>Start/End</h2>
            <p>Start and end helpers for day, ISO week, month, and year.</p>
          </section>
        </article>
        <aside class="on-page">
          <div>ON THIS PAGE</div>
          ${onThisPage}
        </aside>
      </main>
    `,
    "/docs",
  );
}

function renderPlayground(activeId = "format"): string {
  const active = presets.find((preset) => preset.id === activeId) ?? presets[0];
  return shell(
    `
      <main class="playground-page">
        <section class="playground-header">
          <h1>Playground</h1>
          <p>Choose a preset, inspect the TypeScript call, then run it against the local date-light source.</p>
        </section>
        <section class="runner-shell">
          <div class="preset-tabs" role="tablist" aria-label="Playground presets" data-liquid-tabs>
            <span class="liquid-indicator" aria-hidden="true"></span>
            ${presets
              .map(
                (preset) => `
                  <button
                    class="${preset.id === active.id ? "active" : ""}"
                    type="button"
                    data-preset="${preset.id}"
                  >${preset.label}</button>
                `,
              )
              .join("")}
          </div>
          <div class="runner-toolbar">
            <div>
              <strong>Editor</strong>
              <span data-preset-description>${active.description}</span>
            </div>
            <button class="run-button" type="button" data-run>Run</button>
          </div>
          <div class="terminal-window">
            <div class="terminal-hostbar">
              <div class="terminal-lights" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="terminal-title">date-light playground</span>
              <span class="terminal-status" data-status data-state="idle">idle</span>
            </div>
            <div class="terminal-pane terminal-editor">
              <div class="terminal-prompt" aria-hidden="true">
                <span>~/date-light</span>
                <strong>edit preset.ts</strong>
              </div>
              <textarea class="code-editor" spellcheck="false" aria-label="TypeScript editor">${active.code}</textarea>
            </div>
            <div class="terminal-pane output-console" data-output-console data-state="idle">
              <div>
                <strong>Output</strong>
                <span>console</span>
              </div>
              <pre><code data-output>Click Run to execute this preset.</code></pre>
            </div>
          </div>
        </section>
      </main>
    `,
    "/playground",
  );
}

function render(route = routeFromLocation()) {
  if (route === "/docs") {
    app.innerHTML = renderDocs();
  } else if (route === "/playground") {
    app.innerHTML = renderPlayground();
    bindPlayground();
  } else {
    app.innerHTML = renderLanding();
  }
  bindNavigation();
  bindSearch();
  bindInstallCopy();
  bindLiquidTabs();
  bindTiltCards();
  scrollToHash();
}

function navigate(path: string) {
  const url = new URL(path, window.location.origin);
  window.history.pushState({}, "", `${url.pathname}${url.hash}`);
  render(routeFromLocation());
  if (!window.location.hash) {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function bindNavigation() {
  document.querySelectorAll<HTMLAnchorElement>("a[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(`${link.pathname}${link.hash}`);
    });
  });
}

function updateLiquidTabs(container: HTMLElement) {
  const active = container.querySelector<HTMLElement>("button.active");
  const indicator = container.querySelector<HTMLElement>(".liquid-indicator");
  if (!active || !indicator) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const isReady = container.dataset.liquidReady === "true";
  container.style.setProperty("--liquid-x", `${activeRect.left - containerRect.left}px`);
  container.style.setProperty("--liquid-y", `${activeRect.top - containerRect.top}px`);
  container.style.setProperty("--liquid-w", `${activeRect.width}px`);
  container.style.setProperty("--liquid-h", `${activeRect.height}px`);

  if (!isReady) {
    window.requestAnimationFrame(() => {
      container.dataset.liquidReady = "true";
    });
  }
}

function bindLiquidTabs() {
  const containers = [...document.querySelectorAll<HTMLElement>("[data-liquid-tabs]")];
  containers.forEach(updateLiquidTabs);
  window.requestAnimationFrame(() => containers.forEach(updateLiquidTabs));

  if (!liquidTabsResizeBound) {
    liquidTabsResizeBound = true;
    window.addEventListener("resize", () => {
      window.requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>("[data-liquid-tabs]").forEach(updateLiquidTabs);
      });
    });
  }
}

function bindInstallCopy() {
  const command = document.querySelector<HTMLElement>("[data-install-command]");
  const copyButton = document.querySelector<HTMLButtonElement>("[data-copy-install]");
  if (!command || !copyButton) {
    return;
  }

  document.querySelectorAll<HTMLButtonElement>("[data-package-manager]").forEach((button) => {
    button.addEventListener("click", () => {
      const manager = button.dataset.packageManager as keyof typeof installCommands;
      command.textContent = installCommands[manager];
      document
        .querySelectorAll<HTMLButtonElement>("[data-package-manager]")
        .forEach((item) => item.classList.toggle("active", item === button));
      const tabs = button.closest<HTMLElement>("[data-liquid-tabs]");
      if (tabs) {
        updateLiquidTabs(tabs);
      }
      copyButton.dataset.state = "";
      copyButton.setAttribute("aria-label", "Copy install command");
    });
  });

  copyButton.addEventListener("click", async () => {
    const value = command.textContent ?? installCommands.npm;
    const copied = await copyText(value);
    copyButton.dataset.state = copied ? "copied" : "failed";
    copyButton.setAttribute("aria-label", copied ? "Copied install command" : "Copy failed");
    window.setTimeout(() => {
      copyButton.dataset.state = "";
      copyButton.setAttribute("aria-label", "Copy install command");
    }, 1400);
  });
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy copy path.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function bindSearch() {
  const input = document.querySelector<HTMLInputElement>("[data-doc-search]");
  const results = document.querySelector<HTMLDivElement>("[data-search-results]");

  if (!searchShortcutsBound) {
    searchShortcutsBound = true;
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const activeInput = document.querySelector<HTMLInputElement>("[data-doc-search]");
        if (activeInput) {
          activeInput.focus();
        } else {
          navigate(appPath("/docs"));
        }
      }
    });

    document.addEventListener("click", (event) => {
      const activeSearch = document.querySelector<HTMLElement>(".search-control");
      if (!activeSearch?.contains(event.target as Node)) {
        const activeResults = document.querySelector<HTMLDivElement>("[data-search-results]");
        if (activeResults) {
          activeResults.hidden = true;
        }
      }
    });
  }

  if (!input || !results) {
    return;
  }

  const searchInput = input;
  const searchResults = results;

  function renderResults(query: string) {
    const normalized = query.trim().toLowerCase();
    const matches = normalized
      ? docsSearchItems.filter((item) => item.terms.includes(normalized)).slice(0, 7)
      : docsSearchItems.slice(0, 5);

    searchResults.hidden = false;
    searchResults.replaceChildren();

    if (matches.length) {
      matches.forEach((item) => {
        const button = document.createElement("button");
        const label = document.createElement("span");
        const group = document.createElement("small");

        button.type = "button";
        button.dataset.docResult = item.id;
        label.textContent = item.label;
        group.textContent = item.group;
        button.append(label, group);
        searchResults.append(button);
      });
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-search";
      empty.textContent = `No docs match "${query}"`;
      searchResults.append(empty);
    }

    searchResults.querySelectorAll<HTMLButtonElement>("[data-doc-result]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.docResult!;
        searchInput.value = "";
        searchResults.hidden = true;
        navigate(`${appPath("/docs")}#${id}`);
      });
    });
  }

  searchInput.addEventListener("focus", () => renderResults(searchInput.value));
  searchInput.addEventListener("input", () => renderResults(searchInput.value));
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchResults.hidden = true;
      searchInput.blur();
    }
  });
}

function getHashTargetId(hash: string): string {
  const rawId = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
}

function scrollToHash() {
  if (!window.location.hash) {
    return;
  }
  window.requestAnimationFrame(() => {
    document
      .getElementById(getHashTargetId(window.location.hash))
      ?.scrollIntoView({ block: "start" });
  });
}

function bindTiltCards() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
    });
  });
}

type PreparedPlaygroundCode = {
  code: string;
  names: string[];
  values: unknown[];
};

function parseImportSpecifiers(specifierSource: string): Array<[string, string]> {
  return specifierSource
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const aliasMatch = part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (aliasMatch) {
        return [aliasMatch[1], aliasMatch[2]];
      }

      if (!/^[A-Za-z_$][\w$]*$/.test(part)) {
        throw new SyntaxError(`Unsupported import specifier "${part}".`);
      }

      return [part, part];
    });
}

function preparePlaygroundCode(code: string): PreparedPlaygroundCode {
  const names: string[] = [];
  const values: unknown[] = [];
  const importPattern =
    /import\s+(?:(\{[\s\S]*?\})|([A-Za-z_$][\w$]*)|\*\s+as\s+([A-Za-z_$][\w$]*))\s+from\s+["']([^"']+)["'];?/g;

  const executableCode = code.replace(
    importPattern,
    (
      _match,
      namedImport: string | undefined,
      defaultImport: string | undefined,
      namespaceImport: string | undefined,
      source: string,
    ) => {
      if (source !== "date-light") {
        throw new TypeError(`Only imports from "date-light" can run in the playground.`);
      }

      if (defaultImport || namespaceImport || !namedImport) {
        throw new SyntaxError(
          `Use named imports from "date-light", for example: import { format } from "date-light";`,
        );
      }

      parseImportSpecifiers(namedImport.slice(1, -1)).forEach(([exportName, localName]) => {
        if (!(exportName in playgroundRuntime)) {
          throw new ReferenceError(`date-light does not export "${exportName}".`);
        }

        names.push(localName);
        values.push(playgroundRuntime[exportName as keyof typeof playgroundRuntime]);
      });

      return "";
    },
  );

  const leftoverImport = executableCode.match(/^\s*import\s.+$/m);
  if (leftoverImport) {
    throw new SyntaxError(`Unsupported import syntax: ${leftoverImport[0].trim()}`);
  }

  const withoutImports = executableCode.trim();

  if (!withoutImports) {
    return { code: "", names, values };
  }

  const lines = withoutImports.split("\n");
  let lastIndex = -1;
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = lines[index].trim();
    if (line && !line.startsWith("//")) {
      lastIndex = index;
      break;
    }
  }
  if (lastIndex === -1) {
    return { code: withoutImports, names, values };
  }

  const lastLine = lines[lastIndex].trim().replace(/;$/, "");
  const isExpression =
    !/^(const|let|var|if|for|while|switch|try|catch|finally|function|class|return|throw)\b/.test(
      lastLine,
    ) &&
    !lastLine.includes("=") &&
    !lastLine.startsWith("console.");

  if (!isExpression) {
    return { code: withoutImports, names, values };
  }

  lines[lastIndex] = `__capture(${lastLine});`;
  return { code: lines.join("\n"), names, values };
}

function formatPlaygroundValue(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function runPlaygroundCode(code: string): string[] {
  const logs: string[] = [];
  const consoleProxy = {
    log: (...values: unknown[]) => {
      logs.push(values.map(formatPlaygroundValue).join(" "));
    },
  };
  const capture = (value: unknown) => {
    logs.push(formatPlaygroundValue(value));
    return value;
  };
  const preparedCode = preparePlaygroundCode(code);

  if (!preparedCode.code) {
    return ["No code to run."];
  }

  new Function(
    ...preparedCode.names,
    "console",
    "__capture",
    `"use strict";\n${preparedCode.code}`,
  )(...preparedCode.values, consoleProxy, capture);

  return logs.length
    ? logs
    : ["No output. Add console.log(...) or leave an expression on the last line."];
}

function formatPlaygroundError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

function bindPlayground() {
  bindLiquidTabs();
  let active =
    presets.find((preset) => document.querySelector(`[data-preset="${preset.id}"].active`)) ??
    presets[0];
  const status = document.querySelector<HTMLElement>("[data-status]")!;
  const output = document.querySelector<HTMLElement>("[data-output]")!;
  const outputConsole = document.querySelector<HTMLElement>("[data-output-console]")!;
  const editor = document.querySelector<HTMLTextAreaElement>(".code-editor")!;
  const description = document.querySelector<HTMLElement>("[data-preset-description]")!;

  document.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      active = presets.find((preset) => preset.id === button.dataset.preset) ?? presets[0];
      document
        .querySelectorAll<HTMLButtonElement>("[data-preset]")
        .forEach((item) => item.classList.toggle("active", item === button));
      description.textContent = active.description;
      editor.value = active.code;
      status.textContent = "idle";
      status.dataset.state = "idle";
      output.textContent = "Click Run to execute this preset.";
      outputConsole.dataset.state = "idle";
      const tabs = button.closest<HTMLElement>("[data-liquid-tabs]");
      if (tabs) {
        updateLiquidTabs(tabs);
      }
    });
  });

  document.querySelector<HTMLButtonElement>("[data-run]")!.addEventListener("click", () => {
    try {
      status.textContent = "success";
      status.dataset.state = "success";
      output.textContent = runPlaygroundCode(editor.value)
        .map((line) => `> ${line}`)
        .join("\n");
      outputConsole.dataset.state = "success";
    } catch (error) {
      status.textContent = "error";
      status.dataset.state = "error";
      output.textContent = formatPlaygroundError(error);
      outputConsole.dataset.state = "error";
    }
  });
}

function loadCloudflareAnalytics() {
  const token = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN;
  const beaconWindow = window as CloudflareBeaconWindow;
  if (!token || beaconWindow.__cfBeaconLoaded) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.append(script);
  beaconWindow.__cfBeaconLoaded = true;
}

window.addEventListener("popstate", () => render(routeFromLocation()));

loadCloudflareAnalytics();
render();
