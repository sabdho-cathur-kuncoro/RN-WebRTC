import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// Set your default timezone
dayjs.tz.setDefault("Asia/Jakarta");

/**
 * Format date globally
 */
export const formatDate = (
  date: string | Date | number,
  format: string = "DD MMMM YYYY"
) => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Format date with time
 */
export const formatDateTime = (
  date: string | Date | number,
  format: string = "DD MMMM YYYY HH:mm"
) => {
  if (!date) return "-";
  return dayjs(date).format(format);
};
/**
 * Format time
 */
export const formatTime = (
  date: string | Date | number,
  format: string = "HH:mm"
) => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Convert UTC to local timezone
 */
export const toLocal = (date: string | Date | number) => {
  if (!date) return null;
  return dayjs.utc(date).tz();
};

/**
 * Relative time → “2 hours ago”
 */
export const fromNow = (date: string | Date | number) => {
  if (!date) return "-";
  return dayjs(date).fromNow();
};

export default dayjs;
