# Benchmarks

Benchmarks are run with Vitest on Node.js 24. Values are nanoseconds per operation, lower is faster.

## vs date-fns v4

| Function             | date-light | date-fns |               |
| -------------------- | ---------- | -------- | ------------- |
| `format`             | 668 ns     | 1,495 ns | 2.2x faster   |
| `parseISO`           | 138 ns     | 1,218 ns | 8.8x faster   |
| `addDays`            | 80 ns      | 79 ns    | roughly equal |
| `addMonths`          | 133 ns     | 154 ns   | 1.2x faster   |
| `subDays`            | 79 ns      | 81 ns    | roughly equal |
| `differenceInDays`   | 117 ns     | 946 ns   | 8.1x faster   |
| `differenceInMonths` | 11 ns      | 798 ns   | 72x faster    |
| `isBefore`           | 56 ns      | 148 ns   | 2.6x faster   |
| `startOfDay`         | 47 ns      | 49 ns    | roughly equal |
| `endOfDay`           | 52 ns      | 51 ns    | roughly equal |
| `isWeekend`          | 4 ns       | 39 ns    | 9.8x faster   |
| `isLeapYear`         | 5 ns       | 41 ns    | 8.2x faster   |
| `getDaysInMonth`     | 65 ns      | 160 ns   | 2.5x faster   |

## vs dayjs v1

| Function           | date-light | dayjs    |              |
| ------------------ | ---------- | -------- | ------------ |
| `format`           | 668 ns     | 1,224 ns | 1.8x faster  |
| `addDays`          | 80 ns      | 642 ns   | 8.0x faster  |
| `addMonths`        | 133 ns     | 2,067 ns | 15.5x faster |
| `differenceInDays` | 117 ns     | 356 ns   | 3.0x faster  |
| `isBefore`         | 56 ns      | 531 ns   | 9.5x faster  |
| `startOfDay`       | 47 ns      | 349 ns   | 7.4x faster  |

## Bundle Size

| Library                 | minzipped | Note                             |
| ----------------------- | --------- | -------------------------------- |
| date-light              | 3.11 KB   | 39 functions                     |
| dayjs                   | 2.97 KB   | Core only                        |
| date-fns (20 functions) | 18.34 KB  | Same common-operation comparison |
| date-fns (full)         | 261.3 KB  | Full package                     |

date-light ships 39 functions in 3.11 KB minzipped. The size comparison against importing 20 comparable date-fns functions is 5.9x smaller.

## Run Locally

```bash
npm run bench
```
