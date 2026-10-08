import { useEffect, useRef, useState } from "react";
import {
  categoryNames as editionCategories,
  companies as editionCompanies,
  jobs as editionJobs,
  people as editionPeople,
  type Company,
  type Job,
  type Person,
} from "@/lib/edition-data";
import type { BriefingPayload, LiveStory } from "@/lib/briefing";
import { loadPublicBriefing } from "@/lib/briefing-client";
import { bindCasualRail } from "@/components/casual-rail";

type JobMode = "growing" | "exposure";
type PersonFilter = "all" | Person["cat"];

function formatEditionDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "07 OCT 2026";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function formatClock(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "NOW";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatStoryDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "RECENT";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}

function formatStoryStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "LATEST";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function scrollRailTo(rail: HTMLElement | null, id: string) {
  const story = rail?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (!rail || !story) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const left = story.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
  rail.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
}

export function HomePage() {
  const storiesRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [people, setPeople] = useState<Person[]>(() => editionPeople.map((person) => ({ ...person, photo: "" })));
  const [companies, setCompanies] = useState<Company[]>(editionCompanies);
  const [categoryNames, setCategoryNames] = useState(editionCategories);
  const [jobs, setJobs] = useState(editionJobs);
  const [personFilter, setPersonFilter] = useState<PersonFilter>("all");
  const [companyCat, setCompanyCat] = useState<"all" | Company["cat"]>("all");
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobMode, setJobMode] = useState<JobMode>("growing");
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [liveStories, setLiveStories] = useState<LiveStory[] | null>(null);
  const [activeStory, setActiveStory] = useState("story-1");
  const [dateLabel, setDateLabel] = useState("07 OCT 2026");
  const [feedStatus, setFeedStatus] = useState("Checking fresh technology coverage…");
  const [feedError, setFeedError] = useState(false);

  useEffect(() => {
    const nodes = [storiesRef.current, peopleRef.current, companyRef.current, jobsRef.current].filter(
      (node): node is HTMLDivElement => Boolean(node),
    );
    const cleanups = nodes.map((node) => bindCasualRail(node));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const rail = storiesRef.current;
    if (!rail) return;
    const onScroll = () => {
      const railLeft = rail.getBoundingClientRect().left;
      let bestId = "story-1";
      let best = Number.POSITIVE_INFINITY;
      rail.querySelectorAll<HTMLElement>("article.story").forEach((node) => {
        const dist = Math.abs(node.getBoundingClientRect().left - railLeft);
        if (dist < best) {
          best = dist;
          bestId = node.id;
        }
      });
      setActiveStory(bestId);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => rail.removeEventListener("scroll", onScroll);
  }, [liveStories]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activePerson && !dialog.open) dialog.showModal();
    if (!activePerson && dialog.open) dialog.close();
  }, [activePerson]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const base = import.meta.env.BASE_URL;
        const [editionRes, briefingRes] = await Promise.all([
          fetch(`${base}api/edition`, { cache: "no-store" }),
          fetch(`${base}api/briefing`, { cache: "no-store" }),
        ]);
        if (!editionRes.ok || !briefingRes.ok) throw new Error("api");
        const edition = (await editionRes.json()) as {
          people: Person[];
          companies: Company[];
          categoryNames: typeof editionCategories;
          jobs: { growing: Job[]; exposure: Job[] };
        };
        const briefing = (await briefingRes.json()) as BriefingPayload;
        if (cancel) return;
        setPeople(edition.people);
        setCompanies(edition.companies);
        setCategoryNames(edition.categoryNames);
        setJobs(edition.jobs);
        setDateLabel(formatEditionDate(briefing.fetchedAt));
        if (briefing.live && briefing.stories.length >= 4) {
          setLiveStories(briefing.stories);
          setFeedStatus(`LIVE NEWS · UPDATED ${formatClock(briefing.fetchedAt)} · LAST 7 DAYS`);
          setFeedError(false);
        } else {
          setFeedStatus("LIVE REFRESH UNAVAILABLE · SHOWING THE LAST CURATED EDITION");
          setFeedError(true);
        }
      } catch {
        if (cancel) return;
        try {
          const briefing = await loadPublicBriefing();
          if (cancel) return;
          setDateLabel(formatEditionDate(briefing.fetchedAt));
          if (briefing.live) {
            setLiveStories(briefing.stories);
            setFeedStatus(`LIVE NEWS · UPDATED ${formatClock(briefing.fetchedAt)} · LAST 7 DAYS`);
            setFeedError(false);
            return;
          }
        } catch {
          /* curated edition stays on screen */
        }
        setFeedStatus("LIVE REFRESH UNAVAILABLE · SHOWING THE LAST CURATED EDITION");
        setFeedError(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const visiblePeople = people.filter((person) => personFilter === "all" || person.cat === personFilter);
  const visibleCompanies = companies.filter((company) => {
    const inCat = companyCat === "all" || company.cat === companyCat;
    const haystack = `${company.name} ${company.cat} ${company.blurb}`.toLowerCase();
    return inCat && haystack.includes(companyQuery.trim().toLowerCase());
  });
  const visibleJobs = jobs[jobMode];
  const storyLinks = liveStories
    ? liveStories.map((story) => ({
        id: story.id,
        label: `${story.title.slice(0, 35)}${story.title.length > 35 ? "…" : ""}`,
      }))
    : [1, 2, 3, 4].map((n) => ({ id: `story-${n}`, label: "Latest technology" }));

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">
            S<span>/</span>S
          </span>
          <span>
            SIGNAL <i>/</i> SHIFT
          </span>
        </a>
        <nav className={menuOpen ? "open" : undefined}>
          <a href="#briefing" onClick={() => setMenuOpen(false)}>
            Briefing
          </a>
          <a href="#people" onClick={() => setMenuOpen(false)}>
            People
          </a>
          <a href="#companies" onClick={() => setMenuOpen(false)}>
            Companies
          </a>
          <a href="#work" onClick={() => setMenuOpen(false)}>
            Future of work
          </a>
        </nav>
        <a href="#sources" className="top-link">
          OUR METHOD <span>↗</span>
        </a>
        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <div className="read-progress" style={{ transform: `scaleX(${progress})` }} />
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> INDEPENDENT TECH INTELLIGENCE <span className="date">— {dateLabel}</span>
            </p>
            <h1>
              Technology is
              <br />
              changing <em>everything.</em>
            </h1>
            <p className="hero-sub">
              The signal behind the shift. Understand the breakthroughs, the people building them, and what changes next.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href="#briefing">
                Explore the briefing <span>↓</span>
              </a>
              <span className="updated">CURATED BY PEOPLE · SOURCED WITH CARE</span>
            </div>
          </div>
          <div className="hero-aside">
            <span className="side-label">THIS WEEK'S LENS</span>
            <div className="orb">
              <div className="orb-core">
                AI
                <br />
                <span>×</span>
                <br />
                REAL
                <br />
                WORLD
              </div>
            </div>
            <p>
              Agents leave the chat box.
              <br />
              Now the question is what they can do.
            </p>
            <span className="aside-index">01 — 04</span>
          </div>
          <div className="hero-foot">
            <span>THE WEEKLY EDITION</span>
            <span>SCROLL TO FOLLOW THE SHIFT ↓</span>
          </div>
        </section>
        <section className="ticker">
          <div className="ticker-track">
            <span>AI AGENTS</span>
            <b>✳</b>
            <span>QUANTUM LINKS</span>
            <b>✳</b>
            <span>COMPUTE & ENERGY</span>
            <b>✳</b>
            <span>WORK, REWIRED</span>
            <b>✳</b>
            <span>AI AGENTS</span>
            <b>✳</b>
            <span>QUANTUM LINKS</span>
            <b>✳</b>
            <span>COMPUTE & ENERGY</span>
            <b>✳</b>
            <span>WORK, REWIRED</span>
          </div>
        </section>

        <section id="briefing" className="section briefing">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                01 / THE BRIEFING <span className="live-dot" />
              </p>
              <h2>
                What changed.
                <br />
                <em>Why it matters.</em>
              </h2>
            </div>
            <div>
              <p className="section-intro">
                A field guide to the developments moving from lab and launch into everyday life. Each story pairs the
                breakthrough with its real-world consequence.
              </p>
              <p id="feedStatus" className={feedError ? "feed-status feed-error" : "feed-status"} role="status" aria-live="polite">
                {feedStatus}
              </p>
            </div>
          </div>
          <div className="briefing-layout">
            <aside className="contents">
              <span className="mono">IN THIS BRIEFING</span>
              {storyLinks.map((story, index) => (
                <a
                  key={story.id}
                  className={activeStory === story.id ? "active" : undefined}
                  href={`#${story.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveStory(story.id);
                    scrollRailTo(storiesRef.current, story.id);
                  }}
                >
                  0{index + 1}&nbsp;&nbsp;{story.label} <i>↗</i>
                </a>
              ))}
              <div className="contents-note">
                <span>THE SIGNAL / SHIFT TEST</span>
                <p>Is it new? Is it useful? Who feels the impact first?</p>
              </div>
            </aside>
            <div className="stories" id="storiesFeed" ref={storiesRef} aria-live="polite" aria-label="Briefing stories, swipe sideways">
              {liveStories ? (
                liveStories.map((story, index) => (
                  <article key={story.id} className={`story ${index === 0 ? "feature" : "compact"}`} id={story.id}>
                    <div className={`story-art live-art live-art-${story.category}`}>
                      <span className="art-tag">
                        0{index + 1} / {story.label}
                      </span>
                      <div className="live-glyph">{story.visual}</div>
                    </div>
                    <div className="story-text">
                      <div className="story-meta">
                        <span>{story.label}</span>
                        <span>{formatStoryDay(story.publishedAt)}</span>
                      </div>
                      <h3>{story.title}</h3>
                      <p>{story.summary}</p>
                      <div className="impact">
                        <span>WHY IT MATTERS</span>
                        <p>{story.impact}</p>
                      </div>
                      <a className="source-link" href={story.href} target="_blank" rel="noreferrer">
                        <span>OPEN ORIGINAL COVERAGE ↗</span>
                        <span>
                          {story.sourceName} · {formatStoryStamp(story.publishedAt)}
                        </span>
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <>
                  <article className="story feature" id="story-1">
                    <div className="story-art agent-art">
                      <div className="wire-grid" />
                      <span className="art-tag">01 / SYSTEMS</span>
                      <div className="agent-window">
                        <div className="window-bar">
                          <i />
                          <i />
                          <i />
                          <span>AGENT / 04</span>
                        </div>
                        <div className="agent-lines">
                          <span>
                            PLAN <b>✓</b>
                          </span>
                          <span>
                            USE TOOLS <b>✓</b>
                          </span>
                          <span>
                            TAKE ACTION <b className="pulse">●</b>
                          </span>
                        </div>
                        <div className="agent-progress">
                          <i />
                        </div>
                        <small>WORKFLOW RUNNING</small>
                      </div>
                    </div>
                    <div className="story-text">
                      <div className="story-meta">
                        <span>AI & SOFTWARE</span>
                        <span>5 MIN READ</span>
                      </div>
                      <h3>AI agents are moving from demos into the workflow.</h3>
                      <p>
                        Software that can plan, call tools and complete multi-step tasks is turning the “chatbot” into an
                        operator. The near-term change is less about replacing whole teams and more about shrinking
                        handoffs between people and software.
                      </p>
                      <div className="impact">
                        <span>THE IMPACT</span>
                        <p>Expect faster routine operations—and new pressure to verify what an autonomous system actually did.</p>
                      </div>
                      <a
                        className="source-link"
                        href="https://www.axios.com/2026/10/05/ai-agents-consumers-business"
                        target="_blank"
                        rel="noreferrer"
                      >
                        READ THE REPORTING <span>↗ AXIOS · OCT 2026</span>
                      </a>
                    </div>
                  </article>
                  <article className="story compact" id="story-2">
                    <div className="story-art quantum-art">
                      <span className="art-tag">02 / RESEARCH</span>
                      <div className="quantum-rings">
                        <i />
                        <i />
                        <i />
                        <b>Q</b>
                      </div>
                    </div>
                    <div className="story-text">
                      <div className="story-meta">
                        <span>QUANTUM COMPUTING</span>
                        <span>4 MIN READ</span>
                      </div>
                      <h3>A new chip lets qubits communicate over longer distances.</h3>
                      <p>
                        Researchers are exploring phonons—vibration-carrying quasiparticles—as links between qubits. It is
                        an early research result, not a general-purpose quantum computer, but better connectivity is a key
                        scaling challenge.
                      </p>
                      <div className="impact">
                        <span>THE IMPACT</span>
                        <p>Watch for advances in reliable links before expecting a quantum device in your pocket.</p>
                      </div>
                      <a
                        className="source-link"
                        href="https://www.livescience.com/technology/quantum/new-quantum-chip-taps-into-weird-quasiparticles-to-get-qubits-to-communicate-over-long-distances"
                        target="_blank"
                        rel="noreferrer"
                      >
                        READ THE REPORTING <span>↗ LIVE SCIENCE · OCT 2026</span>
                      </a>
                    </div>
                  </article>
                  <article className="story compact" id="story-3">
                    <div className="story-art policy-art">
                      <span className="art-tag">03 / GOVERNANCE</span>
                      <div className="policy-stamp">
                        BUILD
                        <br />
                        WITH
                        <br />
                        CARE<span>↗</span>
                      </div>
                      <div className="policy-caption">
                        FRONTIER RESPONSIBILITIES
                        <br />
                        PUBLIC COMMITMENT / 2026
                      </div>
                    </div>
                    <div className="story-text">
                      <div className="story-meta">
                        <span>AI POLICY & SAFETY</span>
                        <span>6 MIN READ</span>
                      </div>
                      <h3>Frontier AI safety is becoming a public promise—and a public debate.</h3>
                      <p>
                        A White House meeting with leading AI executives produced a voluntary “Joint Commitment on Frontier
                        Responsibilities.” Separately, former industry staff urged New York City lawmakers to strengthen
                        oversight. The gap between pledges and enforceable rules remains central.
                      </p>
                      <div className="impact">
                        <span>THE IMPACT</span>
                        <p>
                          Track who is accountable, how commitments are measured, and whether safeguards reach people
                          affected by deployment.
                        </p>
                      </div>
                      <a
                        className="source-link"
                        href="https://www.tomshardware.com/tech-industry/policy/top-ai-tech-executives-promise-to-self-police-ai-development-nvidia-anthropic-openai-and-more-pledge-ai-labs-will-take-steps-to-build-a-positive-future"
                        target="_blank"
                        rel="noreferrer"
                      >
                        READ THE REPORTING <span>↗ TOM'S HARDWARE · SEP 2026</span>
                      </a>
                    </div>
                  </article>
                  <article className="story compact" id="story-4">
                    <div className="story-art work-art">
                      <span className="art-tag">04 / WORK</span>
                      <div className="work-bars">
                        <i style={{ height: "30%" }} />
                        <i style={{ height: "50%" }} />
                        <i style={{ height: "72%" }} />
                        <i style={{ height: "58%" }} />
                        <i style={{ height: "88%" }} />
                        <i style={{ height: "66%" }} />
                        <i style={{ height: "96%" }} />
                      </div>
                      <span className="work-caption">
                        TASKS CHANGE
                        <br />
                        BEFORE JOB TITLES
                      </span>
                    </div>
                    <div className="story-text">
                      <div className="story-meta">
                        <span>WORK & ECONOMY</span>
                        <span>7 MIN READ</span>
                      </div>
                      <h3>The future of work is a redesign story, not a countdown.</h3>
                      <p>
                        Employer forecasts point to both displacement and growth through 2030. AI exposure varies within
                        occupations: repetitive tasks may be automated while judgement, accountability and human interaction
                        remain essential. Forecasts are scenarios, not guarantees.
                      </p>
                      <div className="impact">
                        <span>THE IMPACT</span>
                        <p>Audit tasks, build adaptable skills, and plan transitions before tools arrive at scale.</p>
                      </div>
                      <a
                        className="source-link"
                        href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        READ THE REPORT <span>↗ WORLD ECONOMIC FORUM · 2025</span>
                      </a>
                    </div>
                  </article>
                </>
              )}
            </div>
            <div className="briefing-scroll-hint">
              <span>SCROLL HORIZONTALLY FOR MORE STORIES</span>
              <span>SHIFT + SCROLL OR DRAG ↔</span>
            </div>
          </div>
        </section>

        <section id="people" className="section people-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">02 / THE PEOPLE</p>
              <h2>
                Ten people moving
                <br />
                <em>the frontier.</em>
              </h2>
            </div>
            <p className="section-intro">
              Influence is not a leaderboard. These builders and researchers shape critical layers of technology—from
              compute to AI science. Their past explains the path; their next choices shape what comes.
            </p>
          </div>
          <div className="people-toolbar">
            <span className="mono">A CROSS-SECTION OF TODAY'S TECH POWER</span>
            <div className="person-filters">
              {(
                [
                  ["all", "ALL 10"],
                  ["builder", "BUILDERS"],
                  ["research", "RESEARCH"],
                  ["governance", "GOVERNANCE"],
                ] as const
              ).map(([filter, label]) => (
                <button
                  key={filter}
                  className={personFilter === filter ? "filter active" : "filter"}
                  type="button"
                  onClick={() => {
                    setPersonFilter(filter);
                    peopleRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="people-grid" id="peopleGrid" ref={peopleRef} aria-label="People, swipe sideways">
            {visiblePeople.map((person) => (
              <article
                key={person.name}
                className="person-card"
                tabIndex={0}
                role="button"
                aria-haspopup="dialog"
                onClick={() => setActivePerson(person)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActivePerson(person);
                  }
                }}
              >
                <div className="person-top">
                  <span>
                    {person.n} / 10
                  </span>
                  <span>PROFILE ↗</span>
                </div>
                <div className="person-avatar">
                  {person.photo ? (
                    <img
                      alt={`Photo of ${person.name}`}
                      src={person.photo}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <span>{person.initials}</span>
                </div>
                <h3>{person.name}</h3>
                <div className="role">{person.role}</div>
                <div className="bio">
                  <span className="then">THEN</span> {person.then}
                  <br />
                  <span className="then">NOW</span> {person.now}
                  <br />
                  <span className="next">NEXT</span> {person.next}
                </div>
                <span className="cat">{person.cat}</span>
              </article>
            ))}
          </div>
          <p className="scroll-hint">
            SCROLL SIDEWAYS TO EXPLORE ALL PROFILES <span>SHIFT + SCROLL OR DRAG ↔</span>
          </p>
          <p className="editor-note">
            Editorial selection, not a quantified ranking. “Next” describes strategic direction inferred from public work,
            not a prediction or endorsement. Click a card to open its larger profile.
          </p>
        </section>

        <section id="companies" className="section company-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">03 / THE COMPANIES</p>
              <h2>
                50 companies.
                <br />
                <em>Five force fields.</em>
              </h2>
            </div>
            <p className="section-intro">
              A watchlist of organizations shaping systems with outsized reach. Inclusion signals strategic relevance—not a
              forecast of success, investment advice, or a claim that any single company will “change the world.”
            </p>
          </div>
          <div className="company-controls">
            <div className="company-tabs">
              {(
                [
                  ["all", "ALL 50"],
                  ["compute", "COMPUTE"],
                  ["intelligence", "INTELLIGENCE"],
                  ["industry", "INDUSTRY"],
                  ["frontier", "FRONTIER"],
                  ["platforms", "PLATFORMS"],
                ] as const
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  className={companyCat === cat ? "company-tab active" : "company-tab"}
                  type="button"
                  onClick={() => {
                    setCompanyCat(cat);
                    companyRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="search-box">
              <span>⌕</span>
              <input
                id="companySearch"
                placeholder="Find a company"
                aria-label="Find a company"
                value={companyQuery}
                onChange={(event) => {
                  setCompanyQuery(event.target.value);
                  companyRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                }}
              />
            </label>
          </div>
          <div className="company-cards" id="companyRows" ref={companyRef} tabIndex={0} aria-label="Company watchlist, scroll horizontally">
            {visibleCompanies.length ? (
              visibleCompanies.map((company) => (
                <article key={company.name} className="company-card">
                  <div className="company-card-top">
                    <span>{company.n}</span>
                    <span>{categoryNames[company.cat]}</span>
                  </div>
                  <h3>{company.name}</h3>
                  <p>{company.blurb}</p>
                  <a href={company.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${company.name} website`}>
                    COMPANY SITE <span>↗</span>
                  </a>
                </article>
              ))
            ) : (
              <p className="company-empty">No matching companies. Try another search.</p>
            )}
          </div>
          <div className="company-scroll-hint">
            SCROLL SIDEWAYS TO EXPLORE ALL 50 <span>SHIFT + SCROLL OR DRAG ↔</span>
          </div>
          <div className="company-bottom">
            <span>50 COMPANIES · 5 SYSTEM LAYERS</span>
            <span>CURATED VIEW · NOT A FINANCIAL RANKING</span>
          </div>
        </section>

        <section id="work" className="section work-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">04 / THE FUTURE OF WORK</p>
              <h2>
                20 jobs.
                <br />
                <em>What changes?</em>
              </h2>
            </div>
            <p className="section-intro">
              A practical guide to 10 roles employers expect to grow and 10 roles facing decline or more automation
              pressure. See the task technology may handle—and the human skill that still counts.
            </p>
          </div>
          <div className="jobs-summary">
            <span>
              <b>20</b> ROLE PROFILES
            </span>
            <span>
              <b>10</b> GROWING OUTLOOK
            </span>
            <span>
              <b>10</b> DECLINING OUTLOOK
            </span>
            <span className="summary-source">GLOBAL EMPLOYER FORECAST · 2025–2030</span>
          </div>
          <div className="work-dashboard">
            <div className="work-tabs">
              <button
                className={jobMode === "growing" ? "work-tab active" : "work-tab"}
                type="button"
                onClick={() => {
                  setJobMode("growing");
                  jobsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                }}
              >
                GROWING OUTLOOK <span>10 ROLES ↗</span>
              </button>
              <button
                className={jobMode === "exposure" ? "work-tab active" : "work-tab"}
                type="button"
                onClick={() => {
                  setJobMode("exposure");
                  jobsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                }}
              >
                DECLINING / EXPOSED <span>10 ROLES ↗</span>
              </button>
            </div>
            <div className="work-panel" id="workPanel" ref={jobsRef} aria-label="Job profiles, swipe sideways">
              {visibleJobs.map((job) => (
                <article key={job.title} className="job-item">
                  <div className="job-icon" aria-hidden="true">
                    {job.icon}
                  </div>
                  <div className="job-content">
                    <div className="job-head">
                      <span>{job.title}</span>
                      <span className="signal">{job.signal}</span>
                    </div>
                    <p>{job.summary}</p>
                    <div className="job-human">
                      <span>HUMAN EDGE</span> {job.edge}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="work-side">
              <span className="mono">READ THIS FIRST</span>
              <h3>Roles change at different speeds.</h3>
              <p>
                A forecast of fewer jobs does not mean a job disappears. Repetitive tasks may shrink while demand remains
                for judgement, accountability, complex cases and human service.
              </p>
              <p className="job-stat">
                <strong>170M</strong> new roles projected
                <br />
                <strong>92M</strong> roles displaced by 2030
              </p>
              <a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/" target="_blank" rel="noreferrer">
                SOURCE: WEF FUTURE OF JOBS 2025 ↗
              </a>
            </aside>
          </div>
          <p className="job-scroll-hint">
            SCROLL SIDEWAYS TO EXPLORE 10 JOBS <span>SHIFT + SCROLL OR DRAG ↔</span>
          </p>
          <div className="work-caveat">
            <span>↳</span>
            <p>
              These are global employer expectations from the World Economic Forum’s 2025 survey—not guarantees or
              individual career advice. Results vary by country and industry. The report estimates 170 million roles
              created and 92 million displaced by 2030 across multiple forces, not AI alone.
            </p>
          </div>
        </section>

        <section id="sources" className="method-section">
          <div className="method-mark">
            S<span>/</span>S
          </div>
          <div>
            <p className="eyebrow">OUR METHOD / YOUR TRUST</p>
            <h2>Curious, not credulous.</h2>
            <p>
              Signal / Shift uses the editorial shape of a strong reference explainer—clear takeaways, scannable sections,
              plain-language definitions and a transparent source trail. Reporting is summarized in original language,
              claims are framed with uncertainty, and consequential forecasts link to their underlying source.
            </p>
            <p className="live-method">
              The briefing checks recent public Google News RSS results each time this page loads. It shows the original
              headline, publisher and link; the short “why it matters” line is an editorial lens, not a claim from the
              article. If the feed is unavailable, the last curated edition stays in place.
            </p>
            <div className="method-points">
              <span>01 &nbsp; PRIMARY SOURCES FIRST</span>
              <span>02 &nbsp; FACTS / ANALYSIS SEPARATED</span>
              <span>03 &nbsp; UPDATED WITH CONTEXT</span>
            </div>
            <div className="sources">
              <a href="https://github.com/boss974829/AITECH-UPDATES-" target="_blank" rel="noreferrer">
                THE PROJECT ↗ AITECH UPDATES
              </a>
              <a href="https://rss2json.com/docs" target="_blank" rel="noreferrer">
                FEED CONVERSION ↗ RSS2JSON DOCS
              </a>
              <a href="https://www.investopedia.com/terms/s/shareholder.asp" target="_blank" rel="noreferrer">
                REFERENCE FORMAT ↗ INVESTOPEDIA
              </a>
              <a href="https://www.ilo.org/publications/flagship-reports/employment-and-social-trends-2026" target="_blank" rel="noreferrer">
                LABOUR CONTEXT ↗ ILO 2026
              </a>
              <a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/" target="_blank" rel="noreferrer">
                EMPLOYER OUTLOOK ↗ WEF 2025
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">
            S<span>/</span>S
          </span>
          <span>
            SIGNAL <i>/</i> SHIFT
          </span>
        </a>
        <span>THE FUTURE ISN'T A FORECAST. IT'S A SET OF CHOICES.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
      <dialog
        id="personDialog"
        className="person-dialog"
        aria-labelledby="personDialogTitle"
        ref={dialogRef}
        onClose={() => setActivePerson(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button className="dialog-close" type="button" aria-label="Close profile" onClick={() => dialogRef.current?.close()}>
          ×
        </button>
        {activePerson ? (
          <div id="personDialogContent">
            <div className="profile-modal-photo">
              {activePerson.photo ? (
                <img
                  src={activePerson.photo}
                  alt={`Photo of ${activePerson.name}`}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="profile-initials">{activePerson.initials}</span>
              )}
              <span className="profile-number">
                {activePerson.n} / 10 · {activePerson.cat.toUpperCase()}
              </span>
            </div>
            <div className="profile-modal-copy">
              <p className="eyebrow">TECH LEADER / PROFILE</p>
              <h2 id="personDialogTitle">{activePerson.name}</h2>
              <p className="profile-role">{activePerson.role}</p>
              <div className="profile-chapter">
                <span>THEN / THE PATH</span>
                <p>{activePerson.then}</p>
              </div>
              <div className="profile-chapter">
                <span>NOW / THE WORK</span>
                <p>{activePerson.now}</p>
              </div>
              <div className="profile-chapter">
                <span>WHAT TO WATCH NEXT</span>
                <p>{activePerson.next}</p>
              </div>
              <p className="profile-note">The “next” section is an editorial watchpoint based on public work, not a prediction.</p>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
