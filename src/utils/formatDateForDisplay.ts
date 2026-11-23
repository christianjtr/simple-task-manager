export function formatDateForDisplay(updatedAtString: string): string {
  const date = new Date(updatedAtString);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return "In the future";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleString("en");
}
