const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_ABBREVS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEKDAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TOKEN_YEAR = 0;
const TOKEN_YEAR_2 = 1;
const TOKEN_MONTH_NAME = 2;
const TOKEN_MONTH_ABBREV = 3;
const TOKEN_MONTH_2 = 4;
const TOKEN_MONTH = 5;
const TOKEN_DAY_2 = 6;
const TOKEN_DAY = 7;
const TOKEN_HOUR_24_2 = 8;
const TOKEN_HOUR_24 = 9;
const TOKEN_HOUR_12_2 = 10;
const TOKEN_HOUR_12 = 11;
const TOKEN_MINUTE_2 = 12;
const TOKEN_MINUTE = 13;
const TOKEN_SECOND_2 = 14;
const TOKEN_SECOND = 15;
const TOKEN_MS_3 = 16;
const TOKEN_PERIOD = 17;
const TOKEN_WEEKDAY_NAME = 18;
const TOKEN_WEEKDAY_ABBREV = 19;

type FormatPart = string | number;

const FORMAT_CACHE_MAX_SIZE = 100;
const FORMAT_CACHE = new Map<string, FormatPart[]>();

const TOKEN_RE = /(yyyy|MMMM|EEEE|SSS|MMM|EEE|yy|MM|dd|HH|hh|mm|ss|M|d|H|h|m|s|a)/g;

function pad2(value: number): string {
  return value >= 0 && value < 10 ? "0" + value : String(value);
}

function pad3(value: number): string {
  if (value >= 0 && value < 10) return "00" + value;
  if (value >= 10 && value < 100) return "0" + value;
  return String(value);
}

function pad4(value: number): string {
  const str = String(value);
  if (str.length >= 4) return str;
  if (str.length === 3) return "0" + str;
  if (str.length === 2) return "00" + str;
  return "000" + str;
}

function formatDate(date: Date): string {
  return pad4(date.getFullYear()) + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
}

function formatDateHourMinute(date: Date): string {
  return formatDate(date) + " " + pad2(date.getHours()) + ":" + pad2(date.getMinutes());
}

function formatDateTime(date: Date): string {
  return formatDateHourMinute(date) + ":" + pad2(date.getSeconds());
}

function formatDateTimeMs(date: Date): string {
  return formatDateTime(date) + "." + pad3(date.getMilliseconds());
}

function toFormatTokenCode(token: string): number {
  switch (token) {
    case "yyyy":
      return TOKEN_YEAR;
    case "yy":
      return TOKEN_YEAR_2;
    case "MMMM":
      return TOKEN_MONTH_NAME;
    case "MMM":
      return TOKEN_MONTH_ABBREV;
    case "MM":
      return TOKEN_MONTH_2;
    case "M":
      return TOKEN_MONTH;
    case "dd":
      return TOKEN_DAY_2;
    case "d":
      return TOKEN_DAY;
    case "HH":
      return TOKEN_HOUR_24_2;
    case "H":
      return TOKEN_HOUR_24;
    case "hh":
      return TOKEN_HOUR_12_2;
    case "h":
      return TOKEN_HOUR_12;
    case "mm":
      return TOKEN_MINUTE_2;
    case "m":
      return TOKEN_MINUTE;
    case "ss":
      return TOKEN_SECOND_2;
    case "s":
      return TOKEN_SECOND;
    case "SSS":
      return TOKEN_MS_3;
    case "a":
      return TOKEN_PERIOD;
    case "EEEE":
      return TOKEN_WEEKDAY_NAME;
    case "EEE":
      return TOKEN_WEEKDAY_ABBREV;
  }
  return -1;
}

function compileFormatPattern(pattern: string): FormatPart[] {
  const parts: FormatPart[] = [];
  let tokenMatch: RegExpExecArray | null;
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;

  while ((tokenMatch = TOKEN_RE.exec(pattern)) !== null) {
    if (tokenMatch.index > lastIndex) {
      parts.push(pattern.slice(lastIndex, tokenMatch.index));
    }
    parts.push(toFormatTokenCode(tokenMatch[0]));
    lastIndex = tokenMatch.index + tokenMatch[0].length;
  }

  if (lastIndex < pattern.length) {
    parts.push(pattern.slice(lastIndex));
  }

  return parts;
}

function getFormatPattern(pattern: string): FormatPart[] {
  let parts = FORMAT_CACHE.get(pattern);
  if (parts) return parts;

  parts = compileFormatPattern(pattern);
  if (FORMAT_CACHE.size >= FORMAT_CACHE_MAX_SIZE) FORMAT_CACHE.clear();
  FORMAT_CACHE.set(pattern, parts);
  return parts;
}

function formatToken(date: Date, token: number): string {
  switch (token) {
    case TOKEN_YEAR:
      return pad4(date.getFullYear());
    case TOKEN_YEAR_2:
      return pad2(date.getFullYear() % 100);
    case TOKEN_MONTH_NAME:
      return MONTH_NAMES[date.getMonth()];
    case TOKEN_MONTH_ABBREV:
      return MONTH_ABBREVS[date.getMonth()];
    case TOKEN_MONTH_2:
      return pad2(date.getMonth() + 1);
    case TOKEN_MONTH:
      return String(date.getMonth() + 1);
    case TOKEN_DAY_2:
      return pad2(date.getDate());
    case TOKEN_DAY:
      return String(date.getDate());
    case TOKEN_HOUR_24_2:
      return pad2(date.getHours());
    case TOKEN_HOUR_24:
      return String(date.getHours());
    case TOKEN_HOUR_12_2:
      return pad2(date.getHours() % 12 || 12);
    case TOKEN_HOUR_12:
      return String(date.getHours() % 12 || 12);
    case TOKEN_MINUTE_2:
      return pad2(date.getMinutes());
    case TOKEN_MINUTE:
      return String(date.getMinutes());
    case TOKEN_SECOND_2:
      return pad2(date.getSeconds());
    case TOKEN_SECOND:
      return String(date.getSeconds());
    case TOKEN_MS_3:
      return pad3(date.getMilliseconds());
    case TOKEN_PERIOD:
      return date.getHours() < 12 ? "AM" : "PM";
    case TOKEN_WEEKDAY_NAME:
      return WEEKDAY_NAMES[date.getDay()];
    case TOKEN_WEEKDAY_ABBREV:
      return WEEKDAY_ABBREVS[date.getDay()];
  }
  return "";
}

function formatCompiled(date: Date, parts: FormatPart[]): string {
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    result += typeof part === "string" ? part : formatToken(date, part);
  }
  return result;
}

/**
 * Format a Date into a string using a pattern.
 *
 * Uses date-fns compatible pattern syntax (not dayjs-style YYYY).
 *
 * Supported tokens: yyyy, yy, MMMM, MMM, MM, M, dd, d, HH, H, hh, h, mm, m,
 * ss, s, SSS, a, EEEE, EEE
 *
 * @param date - The Date object to format
 * @param pattern - Format pattern string using supported tokens
 * @returns Formatted date string
 *
 * @example
 * format(new Date(2026, 0, 15), 'yyyy-MM-dd') // '2026-01-15'
 * format(new Date(2026, 0, 15, 14, 30), 'yyyy-MM-dd HH:mm') // '2026-01-15 14:30'
 * format(new Date(2026, 0, 15), 'EEEE, MMMM d') // 'Thursday, January 15'
 */
export function format(date: Date, pattern: string): string {
  switch (pattern) {
    case "yyyy-MM-dd":
      return formatDate(date);
    case "yyyy-MM-dd HH:mm":
      return formatDateHourMinute(date);
    case "yyyy-MM-dd HH:mm:ss":
      return formatDateTime(date);
    case "yyyy-MM-dd HH:mm:ss.SSS":
      return formatDateTimeMs(date);
  }

  return formatCompiled(date, getFormatPattern(pattern));
}
