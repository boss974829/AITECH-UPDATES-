import { createFileRoute } from "@tanstack/react-router";
import { getEdition } from "@/lib/edition.server";

export const Route = createFileRoute("/api/edition")({
  server: {
    handlers: {
      GET: async () => {
        const edition = await getEdition();
        return Response.json(edition, { headers: { "cache-control": "public, max-age=300" } });
      },
    },
  },
});
