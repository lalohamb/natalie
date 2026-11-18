export const BOOK_CATEGORIES = ["prophetic", "destiny", "warfare", "autobiography"] as const;
export const BOOK_STATUSES = ["published", "forthcoming", "unavailable"] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];
export type BookStatusValue = (typeof BOOK_STATUSES)[number];
