import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getBook, borrowBook } from "@/lib/books.functions";

export const Route = createFileRoute("/book/$id")({
  component: BookDetail,
});

function BookDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchBook = useServerFn(getBook);
  const doBorrow = useServerFn(borrowBook);
  const { data, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook({ data: { id } }),
  });

  const book = data?.book;

  async function handleBorrow() {
    if (!user) { navigate({ to: "/login" }); return; }
    try {
      const res = await doBorrow({ data: { bookId: id } });
      toast.success(res.alreadyBorrowed ? "Buku sudah ada di pinjamanmu" : "Buku berhasil dipinjam");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link to="/browse" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
        </Link>
        {isLoading ? (
          <p>Memuat...</p>
        ) : !book ? (
          <p>Buku tidak ditemukan.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-[280px_1fr]">
            <div>
              <div className="aspect-[2/3] overflow-hidden rounded-md shadow-book bg-spine">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center font-display text-xl text-primary-foreground">{book.title}</div>
                )}
              </div>
            </div>
            <div>
              {book.category && <span className="text-xs font-semibold uppercase tracking-wider text-primary">{book.category}</span>}
              <h1 className="mt-2 font-display text-5xl text-balance">{book.title}</h1>
              {book.author && <p className="mt-2 text-lg text-muted-foreground">oleh {book.author}</p>}
              <p className="mt-6 max-w-2xl leading-relaxed text-foreground/90">
                {book.description || "Belum ada deskripsi untuk buku ini."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-spine text-primary-foreground hover:opacity-90">
                  <Link to="/read/$id" params={{ id: book.id }}><BookOpen className="h-4 w-4" /> Baca Sekarang</Link>
                </Button>
                <Button onClick={handleBorrow} size="lg" variant="outline">
                  <BookMarked className="h-4 w-4" /> Pinjam Buku
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
