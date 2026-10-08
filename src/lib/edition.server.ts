import { categoryNames, companies, jobs, people, type Person } from "./edition-data";

const HOUR = 60 * 60 * 1000;
let cache: { at: number; people: Person[] } | null = null;

async function withPhotos(list: Person[]): Promise<Person[]> {
  if (cache && Date.now() - cache.at < HOUR) return cache.people;
  try {
    const titles = list.map((person) => person.name).join("|");
    const url = new URL("https://en.wikipedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", "pageimages");
    url.searchParams.set("piprop", "thumbnail");
    url.searchParams.set("pithumbsize", "640");
    url.searchParams.set("titles", titles);
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "SignalShift/1.0 (technology briefing)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("wiki");
    const data = (await response.json()) as {
      query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string } }> };
    };
    const pages = Object.values(data.query?.pages ?? {});
    const byTitle = new Map(pages.map((page) => [page.title, page.thumbnail?.source ?? ""]));
    const next = list.map((person) => ({ ...person, photo: byTitle.get(person.name) || "" }));
    if (next.some((person) => person.photo)) cache = { at: Date.now(), people: next };
    return next;
  } catch {
    return list.map((person) => ({ ...person, photo: "" }));
  }
}

export async function getEdition() {
  return {
    people: await withPhotos(people),
    companies,
    categoryNames,
    jobs,
  };
}
