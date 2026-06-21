/**
 * date-light — Zero-dependency, ~3.11KB minzipped date utility library.
 *
 * @packageDocumentation
 */

// format
export { format } from "./format";

// parse
export { parse, parseISO } from "./parse";

// add & sub
export {
  addDays,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  addSeconds,
  subDays,
  subMonths,
  subYears,
  subHours,
  subMinutes,
  subSeconds,
} from "./add";

// diff
export {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInMonths,
  differenceInYears,
} from "./diff";

// compare
export { isBefore, isAfter, isEqual, isSameDay, isSameMonth } from "./compare";

// query
export { isWeekend, isLeapYear, isValid, getDaysInMonth, getWeekOfYear } from "./query";

// startEnd
export {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "./startEnd";
