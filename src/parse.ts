/**
 * Parse an ISO 8601 date string into a Date object.
 *
 * Date-only strings (e.g. `'2026-06-30'`) are parsed as local midnight,
 * matching date-fns behavior. Strings with time components (e.g.
 * `'2026-06-30T10:30:00'`) use the timezone offset as specified.
 *
 * @param dateStr - ISO 8601 formatted date string
 * @returns Parsed Date object
 * @throws {RangeError} If the string is not a valid ISO date
 *
 * @example
 * parseISO('2026-01-15')           // Jan 15 2026 00:00:00 local
 * parseISO('2026-01-15T10:30:00')   // Jan 15 2026 10:30:00 local
 * parseISO('2026-01-15T10:30:00Z')  // Jan 15 2026 10:30:00 UTC
 */
export function parseISO(dateStr: string): Date {
  if (!hasIsoDatePrefix(dateStr)) {
    throw new RangeError(`Invalid ISO date string: ${dateStr}`);
  }

  const y = readUnsafeFixedDigits(dateStr, 0, 4);
  const m = readUnsafeFixedDigits(dateStr, 5, 2);
  const d = readUnsafeFixedDigits(dateStr, 8, 2);
  const month = m - 1;

  if (!isValidDateParts(y, month, d, 0, 0, 0, 0)) {
    throw new RangeError(`Invalid ISO date string: ${dateStr}`);
  }

  // date-only strings: parse as local midnight (date-fns compatible)
  // ECMAScript spec parses date-only ISO as UTC, but date-fns intentionally
  // interprets them as local time for usability.
  if (dateStr.length === 10) {
    return createLocalDate(y, month, d, 0, 0, 0, 0);
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new RangeError(`Invalid ISO date string: ${dateStr}`);
  }

  return date;
}

const PARSE_YEAR = 0;
const PARSE_MONTH = 1;
const PARSE_DAY = 2;
const PARSE_HOUR = 3;
const PARSE_MINUTE = 4;
const PARSE_SECOND = 5;
const PARSE_MS = 6;

type ParsePart = string | number;

const PARSE_CACHE_MAX_SIZE = 100;
const PARSE_CACHE = new Map<string, ParsePart[]>();

function isDigitAt(value: string, index: number): boolean {
  const code = value.charCodeAt(index);
  return code >= 48 && code <= 57;
}

function hasIsoDatePrefix(value: string): boolean {
  return (
    value.length >= 10 &&
    isDigitAt(value, 0) &&
    isDigitAt(value, 1) &&
    isDigitAt(value, 2) &&
    isDigitAt(value, 3) &&
    value.charCodeAt(4) === 45 &&
    isDigitAt(value, 5) &&
    isDigitAt(value, 6) &&
    value.charCodeAt(7) === 45 &&
    isDigitAt(value, 8) &&
    isDigitAt(value, 9)
  );
}

function readUnsafeFixedDigits(value: string, index: number, length: number): number {
  let result = 0;
  for (let i = 0; i < length; i++) {
    result = result * 10 + value.charCodeAt(index + i) - 48;
  }
  return result;
}

function readFixedDigits(value: string, index: number, length: number, token: string): number {
  if (index + length > value.length) {
    throw new RangeError(`Unexpected end of input at position ${index}`);
  }

  let result = 0;
  for (let i = 0; i < length; i++) {
    const code = value.charCodeAt(index + i);
    if (code < 48 || code > 57) {
      throw new RangeError(
        `Invalid ${token} at position ${index}: ${value.slice(index, index + length)}`,
      );
    }
    result = result * 10 + code - 48;
  }
  return result;
}

function expectLiteral(value: string, index: number, expected: string): void {
  if (value[index] !== expected) {
    throw new RangeError(
      `Mismatch at position ${index}: expected '${expected}', got '${value[index]}'`,
    );
  }
}

function ensureConsumed(value: string, index: number): void {
  if (index !== value.length) {
    throw new RangeError(`Unexpected trailing input at position ${index}`);
  }
}

/**
 * Create a local Date while preserving years 0-99 exactly.
 *
 * @param year - Full year value, including 0-99 without 1900 offset
 * @param month - Zero-based month
 * @param day - Day of month
 * @param hours - Hours
 * @param minutes - Minutes
 * @param seconds - Seconds
 * @param ms - Milliseconds
 * @returns A local Date with the provided components
 */
function createLocalDate(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
  ms: number,
): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(hours, minutes, seconds, ms);
  return date;
}

/**
 * Check whether date/time components round-trip without Date auto-rollover.
 *
 * @param year - Full year value
 * @param month - Zero-based month
 * @param day - Day of month
 * @param hours - Hours
 * @param minutes - Minutes
 * @param seconds - Seconds
 * @param ms - Milliseconds
 * @returns `true` when the components describe a valid local date/time
 */
function isValidDateParts(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
  ms: number,
): boolean {
  const date = createLocalDate(year, month, day, hours, minutes, seconds, ms);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes &&
    date.getSeconds() === seconds &&
    date.getMilliseconds() === ms
  );
}

function createValidatedLocalDate(
  dateStr: string,
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
  ms: number,
): Date {
  const date = createLocalDate(year, month, day, hours, minutes, seconds, ms);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds ||
    date.getMilliseconds() !== ms
  ) {
    throw new RangeError(`Invalid date string: ${dateStr}`);
  }
  return date;
}

function parseYyyyMmDd(dateStr: string): Date {
  const year = readFixedDigits(dateStr, 0, 4, "yyyy");
  expectLiteral(dateStr, 4, "-");
  const month = readFixedDigits(dateStr, 5, 2, "MM") - 1;
  expectLiteral(dateStr, 7, "-");
  const day = readFixedDigits(dateStr, 8, 2, "dd");
  ensureConsumed(dateStr, 10);
  return createValidatedLocalDate(dateStr, year, month, day, 0, 0, 0, 0);
}

function parseDdMmYyyy(dateStr: string): Date {
  const day = readFixedDigits(dateStr, 0, 2, "dd");
  expectLiteral(dateStr, 2, "/");
  const month = readFixedDigits(dateStr, 3, 2, "MM") - 1;
  expectLiteral(dateStr, 5, "/");
  const year = readFixedDigits(dateStr, 6, 4, "yyyy");
  ensureConsumed(dateStr, 10);
  return createValidatedLocalDate(dateStr, year, month, day, 0, 0, 0, 0);
}

function parseYyyyMmDdHhMm(dateStr: string): Date {
  const year = readFixedDigits(dateStr, 0, 4, "yyyy");
  expectLiteral(dateStr, 4, "-");
  const month = readFixedDigits(dateStr, 5, 2, "MM") - 1;
  expectLiteral(dateStr, 7, "-");
  const day = readFixedDigits(dateStr, 8, 2, "dd");
  expectLiteral(dateStr, 10, " ");
  const hours = readFixedDigits(dateStr, 11, 2, "HH");
  expectLiteral(dateStr, 13, ":");
  const minutes = readFixedDigits(dateStr, 14, 2, "mm");
  ensureConsumed(dateStr, 16);
  return createValidatedLocalDate(dateStr, year, month, day, hours, minutes, 0, 0);
}

function parseYyyyMmDdHhMmSs(dateStr: string): Date {
  const year = readFixedDigits(dateStr, 0, 4, "yyyy");
  expectLiteral(dateStr, 4, "-");
  const month = readFixedDigits(dateStr, 5, 2, "MM") - 1;
  expectLiteral(dateStr, 7, "-");
  const day = readFixedDigits(dateStr, 8, 2, "dd");
  expectLiteral(dateStr, 10, " ");
  const hours = readFixedDigits(dateStr, 11, 2, "HH");
  expectLiteral(dateStr, 13, ":");
  const minutes = readFixedDigits(dateStr, 14, 2, "mm");
  expectLiteral(dateStr, 16, ":");
  const seconds = readFixedDigits(dateStr, 17, 2, "ss");
  ensureConsumed(dateStr, 19);
  return createValidatedLocalDate(dateStr, year, month, day, hours, minutes, seconds, 0);
}

function parseYyyyMmDdHhMmSsMs(dateStr: string): Date {
  const year = readFixedDigits(dateStr, 0, 4, "yyyy");
  expectLiteral(dateStr, 4, "-");
  const month = readFixedDigits(dateStr, 5, 2, "MM") - 1;
  expectLiteral(dateStr, 7, "-");
  const day = readFixedDigits(dateStr, 8, 2, "dd");
  expectLiteral(dateStr, 10, " ");
  const hours = readFixedDigits(dateStr, 11, 2, "HH");
  expectLiteral(dateStr, 13, ":");
  const minutes = readFixedDigits(dateStr, 14, 2, "mm");
  expectLiteral(dateStr, 16, ":");
  const seconds = readFixedDigits(dateStr, 17, 2, "ss");
  expectLiteral(dateStr, 19, ".");
  const ms = readFixedDigits(dateStr, 20, 3, "SSS");
  ensureConsumed(dateStr, 23);
  return createValidatedLocalDate(dateStr, year, month, day, hours, minutes, seconds, ms);
}

function getParseTokenCode(pattern: string, index: number): number {
  if (pattern.startsWith("yyyy", index)) return PARSE_YEAR;
  if (pattern.startsWith("SSS", index)) return PARSE_MS;
  if (pattern.startsWith("MM", index)) return PARSE_MONTH;
  if (pattern.startsWith("dd", index)) return PARSE_DAY;
  if (pattern.startsWith("HH", index)) return PARSE_HOUR;
  if (pattern.startsWith("mm", index)) return PARSE_MINUTE;
  if (pattern.startsWith("ss", index)) return PARSE_SECOND;
  return -1;
}

function getParseTokenLength(token: number): number {
  return token === PARSE_YEAR ? 4 : token === PARSE_MS ? 3 : 2;
}

function getParseTokenName(token: number): string {
  switch (token) {
    case PARSE_YEAR:
      return "yyyy";
    case PARSE_MONTH:
      return "MM";
    case PARSE_DAY:
      return "dd";
    case PARSE_HOUR:
      return "HH";
    case PARSE_MINUTE:
      return "mm";
    case PARSE_SECOND:
      return "ss";
    case PARSE_MS:
      return "SSS";
  }
  return "";
}

function compileParsePattern(pattern: string): ParsePart[] {
  const parts: ParsePart[] = [];
  let index = 0;

  while (index < pattern.length) {
    const token = getParseTokenCode(pattern, index);
    if (token !== -1) {
      parts.push(token);
      index += getParseTokenLength(token);
    } else {
      parts.push(pattern[index]);
      index++;
    }
  }

  return parts;
}

function getParsePattern(pattern: string): ParsePart[] {
  let parts = PARSE_CACHE.get(pattern);
  if (parts) return parts;

  parts = compileParsePattern(pattern);
  if (PARSE_CACHE.size >= PARSE_CACHE_MAX_SIZE) PARSE_CACHE.clear();
  PARSE_CACHE.set(pattern, parts);
  return parts;
}

function parseCompiled(dateStr: string, parts: ParsePart[]): Date {
  let year = 1970;
  let month = 0;
  let day = 1;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let ms = 0;
  let si = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (typeof part === "string") {
      expectLiteral(dateStr, si, part);
      si++;
      continue;
    }

    const length = getParseTokenLength(part);
    const value = readFixedDigits(dateStr, si, length, getParseTokenName(part));
    switch (part) {
      case PARSE_YEAR:
        year = value;
        break;
      case PARSE_MONTH:
        month = value - 1;
        break;
      case PARSE_DAY:
        day = value;
        break;
      case PARSE_HOUR:
        hours = value;
        break;
      case PARSE_MINUTE:
        minutes = value;
        break;
      case PARSE_SECOND:
        seconds = value;
        break;
      case PARSE_MS:
        ms = value;
        break;
    }
    si += length;
  }

  ensureConsumed(dateStr, si);
  return createValidatedLocalDate(dateStr, year, month, day, hours, minutes, seconds, ms);
}

/**
 * Parse a date string according to a pattern.
 *
 * Supported tokens: yyyy, MM, dd, HH, mm, ss, SSS
 * All other characters in the pattern must match literally.
 *
 * @param dateStr - Date string to parse
 * @param pattern - Pattern matching the input format
 * @returns Parsed Date object
 * @throws {RangeError} If the string does not match the pattern
 *
 * @example
 * parse('2026-01-15', 'yyyy-MM-dd')  // Jan 15 2026
 * parse('15/01/2026', 'dd/MM/yyyy')  // Jan 15 2026
 */
export function parse(dateStr: string, pattern: string): Date {
  switch (pattern) {
    case "yyyy-MM-dd":
      return parseYyyyMmDd(dateStr);
    case "dd/MM/yyyy":
      return parseDdMmYyyy(dateStr);
    case "yyyy-MM-dd HH:mm":
      return parseYyyyMmDdHhMm(dateStr);
    case "yyyy-MM-dd HH:mm:ss":
      return parseYyyyMmDdHhMmSs(dateStr);
    case "yyyy-MM-dd HH:mm:ss.SSS":
      return parseYyyyMmDdHhMmSsMs(dateStr);
  }

  return parseCompiled(dateStr, getParsePattern(pattern));
}
