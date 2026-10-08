import { feedTopics } from "./edition-data";
import type { BriefingPayload, LiveStory } from "./briefing";

type FeedItem = {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  author?: string;
};

function clean(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toStory(item: FeedItem, index: number, category: number): LiveStory | null {
  const topic = feedTopics[category] ?? feedTopics[0];
  const rawTitle = clean(item.title ?? "");
  const suffix = rawTitle.match(/\s+-\s+([^–—-]{2,60})$/);
  const title = suffix ? rawTitle.slice(0, suffix.index).trim() : rawTitle;
  const sourceName = clean(item.author || suffix?.[1] || "NEWS SOURCE");
  let href = item.link ?? "";
  try {
    if (new URL(href).protocol !== "https:") return null;
  } catch {
    return null;
  }
  const published = Date.parse(item.pubDate ?? "");
  if (!title || !Number.isFinite(published)) return null;
  const description = clean(item.description ?? "");
  const slice = title.toLowerCase().slice(0, Math.min(48, title.length));
  const summary =
    description && description !== title && !description.toLowerCase().includes(slice)
      ? description.slice(0, 290)
      : "What to watch: confirm the scale, timeline and practical users of this development as more details emerge.";
  return {
    id: `story-${index + 1}`,
    category,
    label: topic.label,
    visual: topic.visual,
    title,
    summary,
    impact: topic.impact,
    href,
    sourceName,
    publishedAt: new Date(published).toISOString(),
  };
}

/** Browser fallback when this site is opened from GitHub Pages and has no API. */
export async function loadPublicBriefing(): Promise<BriefingPayload> {
  const fetchedAt = new Date().toISOString();
  const cutoff = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const results = await Promise.allSettled(
    feedTopics.map(async (topic, category) => {
      const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.query)}&hl=en-US&gl=US&ceid=US:en`;
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("feed");
      const data = (await response.json()) as { items?: FeedItem[] };
      return (data.items ?? [])
        .map((item) => toStory(item, 0, category))
        .filter((item): item is LiveStory => {
          if (!item) return false;
          const time = Date.parse(item.publishedAt);
          return time >= cutoff && time <= Date.now() + 60 * 60 * 1000;
        });
    }),
  );
  const seen = new Set<string>();
  const stories = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((story) => {
      const key = story.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4)
    .map((story, index) => ({ ...story, id: `story-${index + 1}` }));
  return { live: stories.length >= 4, fetchedAt, stories };
}
