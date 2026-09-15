import type { News } from "@/payload-types";

import { formatBlogDate, getMediaUrl } from "@/lib/blog";

export { formatBlogDate as formatNewsDate, getMediaUrl };

export function formatNewsMonthDay(date: string | null | undefined): {
  month: string;
  day: string;
} {
  if (!date) return { month: "", day: "" };
  const value = new Date(date);
  return {
    month: value.toLocaleDateString("en-US", { month: "short" }),
    day: value.toLocaleDateString("en-US", { day: "2-digit" }),
  };
}

export function getNewsExcerpt(item: News): string {
  if (item.excerpt) return item.excerpt;
  return "Read the latest news from ZerofAI.";
}
