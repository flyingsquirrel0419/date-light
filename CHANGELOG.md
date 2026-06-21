# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-06-21

### Changed

- Optimized common `format()` patterns with dedicated fast paths.
- Optimized `parse()` by compiling and caching reusable pattern metadata.
- Reworked date-only `parseISO()` prefix parsing to avoid repeated regex and split work.
- Updated documented minzipped size to 3.11 KB after the performance tradeoff.

### Added

- Regression coverage for cached non-fast-path parse patterns and common date/time format fast paths.

## [0.1.3] - 2026-06-11

### Fixed

- Corrected package entrypoints so both `require("date-light")` and `import "date-light"` resolve to files included in the npm package.
- `differenceInMonths()` and `differenceInYears()` now handle partial periods consistently with date-fns, including negative differences.
- Renamed the ESLint config to `eslint.config.mjs` to avoid Node module-type warnings without changing package runtime semantics.
- Separated docs output from library output so site builds no longer overwrite package artifacts.
- Tightened CI and publish workflows so package entrypoints are verified before release.

### Added

- Package entrypoint verification in `npm run check`.
- Dedicated `/docs` markdown pages for getting started, API reference, migration notes, benchmarks, and development.

### Changed

- Reworked the README into a shorter project pitch with detailed reference material moved into `/docs`.

## [0.1.2] - 2026-06-03

### Fixed

- `differenceInHours`, `differenceInMinutes`, and `differenceInSeconds` now truncate partial units toward zero instead of rounding.
- `parseISO()` now rejects invalid calendar dates instead of allowing JavaScript `Date` rollover.
- `parseISO()` now preserves year `0000` for date-only strings instead of returning year 1900.
- `parse()` now rejects invalid calendar dates, invalid times, non-numeric token input, and trailing input.

### Added

- Regression tests for partial difference truncation and strict parse validation edge cases.

## [0.1.1] - 2026-05-31

### Added

- `MMMM` token in `format()` — full month name (January..December)
- `MMM` token in `format()` — abbreviated month name (Jan..Dec)
- Comprehensive `parseISO` tests: date-only, datetime, UTC, offset, milliseconds
- Comprehensive `parse` tests: various patterns, error cases, round-trip
- Invalid input tests for `parseISO` (empty, partial, non-ISO strings)

### Fixed

- JSDoc example in `format()`: `MMM d` → `MMMMM d` to match "January" output (#1)

### Changed

- Consolidated `parse.test.ts` into `format.test.ts`
- Switched coverage badge from repo file to Codecov
- Removed `Update coverage badge` CI step (blocked by branch protection)
- Bundled size: 1.79 KB → 1.89 KB (month name lookup tables)

## [0.1.0] - 2026-05-30

### Added

- `format(date, pattern)` — 18 pattern tokens, date-fns compatible syntax
- `parseISO(dateStr)` — ISO 8601 date string parser
- `parse(dateStr, pattern)` — custom pattern date parser
- `addDays`, `addMonths`, `addYears`, `addHours`, `addMinutes`, `addSeconds`
- `subDays`, `subMonths`, `subYears`, `subHours`, `subMinutes`, `subSeconds`
- `differenceInDays`, `differenceInHours`, `differenceInMinutes`, `differenceInSeconds`, `differenceInMonths`, `differenceInYears`
- `isBefore`, `isAfter`, `isEqual`, `isSameDay`, `isSameMonth`
- `isWeekend`, `isLeapYear`, `isValid`, `getDaysInMonth`, `getWeekOfYear`
- `startOfDay`, `endOfDay`, `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `startOfYear`, `endOfYear`
- Full TypeScript type definitions (strict mode)
- ESM + CJS dual build via tsup
- 100 unit tests with 97%+ line coverage
- Vitest benchmarks vs date-fns and dayjs
- Zero runtime dependencies

[0.1.4]: https://github.com/flyingsquirrel0419/date-light/releases/tag/v0.1.4
[0.1.3]: https://github.com/flyingsquirrel0419/date-light/releases/tag/v0.1.3
[0.1.2]: https://github.com/flyingsquirrel0419/date-light/releases/tag/v0.1.2
[0.1.1]: https://github.com/flyingsquirrel0419/date-light/releases/tag/v0.1.1
[0.1.0]: https://github.com/flyingsquirrel0419/date-light/releases/tag/v0.1.0
