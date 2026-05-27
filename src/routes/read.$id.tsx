import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/books.functions";

export const Route = createFileRoute("/read/$id")({
  component: Reader,
});

function Reader() {
  const { id } = Route.useParams();
  const fetchBook = useServerFn(getBook);
  const { data } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook({ data: { id } }),
  });
  const book = data?.book;
  const pdfUrl = `/api/public/pdf/${id}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="border-b border-border/60 bg-card/50">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/book/$id" params={{ id }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {book?.title ?? "Kembali"}
          </Link>
          <Button asChild variant="outline" size="sm">
            <a href={pdfUrl} download><Download className="h-4 w-4" /> Unduh</a>
          </Button>
        </div>
      </div>
      <main className="flex-1 bg-muted">
        <iframe
          src={pdfUrl}
          title={book?.title ?? "PDF Reader"}
          className="block h-[calc(100vh-8rem)] w-full border-0"
        />
      </main>
    </div>
  );
}
