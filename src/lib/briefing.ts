export type LiveStory = {
  id: string;
  category: number;
  label: string;
  visual: string;
  title: string;
  summary: string;
  impact: string;
  href: string;
  sourceName: string;
  publishedAt: string;
};

export type BriefingPayload = {
  live: boolean;
  fetchedAt: string;
  stories: LiveStory[];
};
