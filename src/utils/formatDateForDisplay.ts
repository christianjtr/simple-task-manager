export function formatDateForDisplay(updatedAtString: string) {
    const d = new Date(updatedAtString);
    if (isNaN(d.getTime())) return "Invalid date";

    const s = Math.round((Date.now() - d.getTime()) / 1000);

    return s < 60 ? `${s}s ago` : d.toLocaleString();
}