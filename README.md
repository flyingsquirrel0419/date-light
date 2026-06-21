<div align="center">

<img src="https://date-light.flyingsquirrel.me/date-light-mark.svg" alt="date-light" width="96" height="96" />

# date-light

[![CI](https://github.com/flyingsquirrel0419/date-light/actions/workflows/ci.yml/badge.svg)](https://github.com/flyingsquirrel0419/date-light/actions/workflows/ci.yml)
[![Test](https://github.com/flyingsquirrel0419/date-light/actions/workflows/test.yml/badge.svg)](https://github.com/flyingsquirrel0419/date-light/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/date-light.svg)](https://www.npmjs.com/package/date-light)
[![coverage](https://codecov.io/gh/flyingsquirrel0419/date-light/branch/main/graph/badge.svg)](https://codecov.io/gh/flyingsquirrel0419/date-light)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)](https://www.typescriptlang.org/)

**The date helpers you actually ship. Nothing else.**

39 fully typed date utilities in **~2.18 KB minzipped**. Zero dependencies. Immutable by default.

[Install](#install) · [Why date-light?](#why-date-light) · [Docs](docs/README.md) · [API](docs/api.md)

</div>

---

## Why date-light?

Most apps only need a small, predictable slice of date-fns: format a date, parse input, add a few days, compare ranges, snap to day/week/month boundaries.

date-light keeps that slice tiny:

- **2.18 KB minzipped** for 39 common utilities
- **Zero runtime dependencies**
- **TypeScript-first** with generated declarations
- **Immutable functions** that never mutate input dates
- **date-fns-style API surface** for the common calls people reach for most
- **ESM + CJS** package entrypoints verified before release

```typescript
import { addDays, differenceInDays, format, startOfWeek } from "date-light";

const launch = new Date(2026, 5, 30, 14, 30);
const reminder = addDays(launch, -7);

format(launch, "yyyy-MM-dd HH:mm"); // "2026-06-30 14:30"
format(startOfWeek(launch), "yyyy-MM-dd"); // "2026-06-29"
differenceInDays(launch, reminder); // 7
```

## Install

```bash
npm install date-light
```

```bash
yarn add date-light
pnpm add date-light
bun add date-light
```

Works in Node.js 18+ and modern browsers.

## What You Get

```typescript
import {
  format,
  parseISO,
  addDays,
  addMonths,
  differenceInDays,
  isBefore,
  isWeekend,
  startOfDay,
  endOfMonth,
} from "date-light";
```

| Area           | Utilities                                                       |
| -------------- | --------------------------------------------------------------- |
| Format & parse | `format`, `parseISO`, `parse`                                   |
| Add & subtract | `addDays`, `addMonths`, `addYears`, `addHours`, `subDays`, more |
| Differences    | `differenceInDays`, `differenceInMonths`, `differenceInYears`   |
| Compare        | `isBefore`, `isAfter`, `isEqual`, `isSameDay`, `isSameMonth`    |
| Query          | `isWeekend`, `isLeapYear`, `isValid`, `getDaysInMonth`          |
| Start & end    | `startOfDay`, `endOfWeek`, `startOfMonth`, `endOfYear`, more    |

Full list: [API Reference](docs/api.md)

## The Tradeoff

date-light is intentionally not a calendar platform. It does not include locales, timezone databases, duration objects, plugins, or chainable wrappers.

That is the point. For those jobs, use `Intl`, Temporal, Luxon, or date-fns directly. For common app date utilities, keep the dependency small.

## Size

| Library                 | minzipped   | Note                               |
| ----------------------- | ----------- | ---------------------------------- |
| **date-light**          | **2.18 KB** | 39 functions, fully tree-shakeable |
| dayjs                   | 2.97 KB     | Core only                          |
| date-fns (20 functions) | 18.34 KB    | Same common-operation comparison   |
| date-fns (full)         | 261.3 KB    | Full package                       |

date-light (39 functions) is **8.4x smaller** than importing 20 comparable date-fns functions and **1.4x smaller** than dayjs core.

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api.md)
- [Migration from date-fns](docs/migration.md)
- [Benchmarks](docs/benchmarks.md)
- [Development](docs/development.md)

## License

[MIT](LICENSE) 2026

---

[Security Policy](SECURITY.md) · [Changelog](CHANGELOG.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Contributing](CONTRIBUTING.md)
