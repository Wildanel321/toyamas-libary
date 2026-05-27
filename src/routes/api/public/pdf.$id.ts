import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { streamPdf } from "@/lib/drive.server";

export const Route = createFileRoute("/api/public/pdf/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { data: book, error } = await supabaseAdmin
          .from("books")
          .select("drive_file_id,title")
          .eq("id", params.id)
          .maybeSingle();
        if (error || !book) return new Response("Not found", { status: 404 });

        const upstream = await streamPdf(book.drive_file_id);
        if (!upstream.ok) {
          return new Response("Upstream error", { status: 502 });
        }
        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");
        headers.set("Cache-Control", "private, max-age=3600");
        headers.set("Content-Disposition", `inline; filename="${book.title.replace(/"/g, "")}.pdf"`);
        const len = upstream.headers.get("content-length");
        if (len) headers.set("Content-Length", len);
        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
