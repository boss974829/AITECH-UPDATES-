import { feedTopics } from "./edition-data";
import type { BriefingPayload, LiveStory } from "./briefing";

const TTL_MS = 8 * 60 * 1000;
const WINDOW_MS = 8 * 24 * 60 * 60 * 1000;

let cache: { at: number; payload: BriefingPayload } | null = null;

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;|'/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)));
}

function clean(value: string) {
  return decode(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? clean(match[1]) : "";
}

function newsCategory(text: string) {
  const s = text.toLowerCase();
  if (/quantum|robot|battery|fusion|space|energy/.test(s)) return 2;
  if (/chip|semiconductor|gpu|processor/.test(s)) return 1;
  if (/regulat|policy|security|cyber|safety/.test(s)) return 3;
  return 0;
}

type RawItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  sourceName: string;
};

function parseRss(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const rawTitle = tag(block, "title");
    const suffix = rawTitle.match(/\s+-\s+([^–—-]{2,60})$/);
    const sourceTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const sourceName = clean(sourceTag?.[1] || suffix?.[1] || "NEWS SOURCE");
    const suffixIsSource = Boolean(suffix && sourceName.toLowerCase() === suffix[1].trim().toLowerCase());
    const title =
      suffix && (!sourceTag || suffixIsSource) ? rawTitle.slice(0, suffix.index).trim() : rawTitle;
    items.push({
      title,
      link: tag(block, "link") || (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] ?? "").trim(),
      description: tag(block, "description"),
      pubDate: tag(block, "pubDate"),
      sourceName,
    });
  }
  return items;
}

async function fetchTopic(query: string) {
  const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(rss, {
    headers: {
      accept: "application/rss+xml, application/xml, text/xml",
      "user-agent": "SignalShift/1.0 (technology briefing)",
    },
    signal: AbortSignal.timeout(9000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("News feed request failed");
  return parseRss(await response.text());
}

function toStory(item: RawItem, index: number): LiveStory {
  const category = newsCategory(`${item.title} ${item.description}`);
  const topic = feedTopics[category] ?? feedTopics[0];
  const description = item.description;
  const slice = item.title.toLowerCase().slice(0, Math.min(48, item.title.length));
  const repeated = description.toLowerCase().includes(slice);
  const summary =
    description && description !== item.title && !repeated
      ? description.slice(0, 290)
      : "What to watch: confirm the scale, timeline and practical users of this development as more details emerge.";
  return {
    id: `story-${index + 1}`,
    category,
    label: topic.label,
    visual: topic.visual,
    title: item.title,
    summary,
    impact: topic.impact,
    href: item.link,
    sourceName: item.sourceName,
    publishedAt: new Date(item.pubDate).toISOString(),
  };
}

async function load(): Promise<BriefingPayload> {
  const fetchedAt = new Date().toISOString();
  try {
    const results = await Promise.allSettled(feedTopics.map((topic) => fetchTopic(topic.query)));
    const responses = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    if (!responses.length) throw new Error("All news feeds unavailable");
    const cutoff = Date.now() - WINDOW_MS;
    const seen = new Set<string>();
    const fresh = responses
      .filter((item) => {
        const time = Date.parse(item.pubDate);
        let validLink = false;
        try {
          validLink = new URL(item.link).protocol === "https:";
        } catch {
          validLink = false;
        }
        if (!item.title || !validLink || !Number.isFinite(time) || time > Date.now() + 60 * 60 * 1000 || time < cutoff) {
          return false;
        }
        const key = item.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
      .slice(0, 4);
    if (fresh.length < 4) throw new Error("Not enough recent stories");
    return { live: true, fetchedAt, stories: fresh.map(toStory) };
  } catch {
    return { live: false, fetchedAt, stories: [] };
  }
}

export async function getBriefing(): Promise<BriefingPayload> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.payload;
  const payload = await load();
  if (payload.live) cache = { at: Date.now(), payload };
  return payload;
}
