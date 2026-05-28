import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/books.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/read/$id")({
  component: Reader,
});

function Reader() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchBook = useServerFn(getBook);
  const { data } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook({ data: { id } }),
  });
  const book = data?.book;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setToken(data.session?.access_token ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  const pdfUrl = token
    ? `/api/public/pdf/${id}?token=${encodeURIComponent(token)}`
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="border-b border-border/60 bg-card/50">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/book/$id" params={{ id }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {book?.title ?? "Kembali"}
          </Link>
          {pdfUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={pdfUrl} download><Download className="h-4 w-4" /> Unduh</a>
            </Button>
          )}
        </div>
      </div>
      <main className="flex-1 bg-muted">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={book?.title ?? "PDF Reader"}
            className="block h-[calc(100vh-8rem)] w-full border-0"
          />
        ) : (
          <div className="grid h-[calc(100vh-8rem)] place-items-center text-muted-foreground">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat pembaca...
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
