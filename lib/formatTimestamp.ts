/**
 * Format a timestamp for the conversation list sidebar preview.
 * - Today: "2:34 PM"
 * - This year: "Feb 15"
 * - Older: "Feb 15, 2023"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format a timestamp for individual messages.
 * - Today: "2:34 PM"
 * - This year: "Feb 15, 2:34 PM"
 * - Different year: "Feb 15, 2023, 2:34 PM"
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const datePart = isThisYear
    ? date.toLocaleDateString([], { month: "short", day: "numeric" })
    : date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return `${datePart}, ${time}`;
}
