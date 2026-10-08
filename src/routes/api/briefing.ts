import { createFileRoute } from "@tanstack/react-router";
import { getBriefing } from "@/lib/briefing.server";

export const Route = createFileRoute("/api/briefing")({
  server: {
    handlers: {
      GET: async () => {
        const payload = await getBriefing();
        return Response.json(payload, {
          headers: { "cache-control": payload.live ? "public, max-age=120" : "no-store" },
        });
      },
    },
  },
});
